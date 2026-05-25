import {
  connectRedis,
  createGroups,
  getWebsiteChecks,
  ackWebsiteChecks,
} from "@repo/redis-streams";
import db, { TickStatus } from "@repo/db";
import axios from "axios";

const REGIONS = ["US_EAST", "EU_WEST", "AP_SOUTH"] as const;
type Region = (typeof REGIONS)[number];

function getRegion(): Region {
  const region = process.env.REGION ?? "AP_SOUTH";
  if (REGIONS.includes(region as Region)) return region as Region;

  throw new Error(
    `Invalid REGION "${region}". Use one of: ${REGIONS.join(", ")}`,
  );
}

const REGION = getRegion();
const CONSUMER_ID = process.env.CONSUMER_ID ?? "worker-1"; // worker-1, worker-2 etc

await connectRedis();
await createGroups();

while (true) {
  const batch = await getWebsiteChecks(REGION, CONSUMER_ID, 50);
  if (batch.length === 0) continue;

  const validBatch = batch.filter(({ data }) =>
    Number.isInteger(Number(data.id)),
  );

  const results = await Promise.all(
    validBatch.map(async ({ data }) => {
      const start = Date.now();
      try {
        const response = await axios.get(data.url, { timeout: 5000 });
        return {
          websiteId: Number(data.id),
          status: response.status < 400 ? "UP" : ("DOWN" as TickStatus),
          latency: Date.now() - start,
        };
      } catch {
        return {
          websiteId: Number(data.id),
          status: "DOWN" as TickStatus,
          latency: Date.now() - start,
        };
      }
    }),
  );

  // one DB call for entire batch instead of N calls
  if (results.length > 0) {
    await db.websiteTick.createMany({
      data: results,
    });
    console.log("Processed batch of", results.length, "website checks");
  }

  await ackWebsiteChecks(
    REGION,
    batch.map(({ id }) => id),
  );
}
