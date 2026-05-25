import { client } from "./index.js";
import type { WebsiteCheckPayload } from "./producer.js";

const STREAM_KEY = "betteruptime:website";

const GROUPS = {
  US_EAST: "us-east",
  EU_WEST: "eu-west",
  AP_SOUTH: "ap-south",
} as const;

export async function createGroups() {
  for (const group of Object.values(GROUPS)) {
    try {
      await client.xGroupCreate(STREAM_KEY, group, "0", { MKSTREAM: true });
    } catch (e: any) {
      if (!e.message.includes("BUSYGROUP")) throw e;
    }
  }
}

export async function getWebsiteChecks(
  region: keyof typeof GROUPS,
  consumerId: string,
  batchSize: number,
){
  const results = await client.xReadGroup(
    GROUPS[region],
    consumerId,
    {
      key: STREAM_KEY,
      id: ">",
    },
    { COUNT: batchSize, BLOCK: 5000 },
  );

  if (!results || !Array.isArray(results)) return [];

  return results.flatMap((stream: any) =>
    stream.messages.map((msg: any) => ({
      id: msg.id as string,
      data: msg.message as WebsiteCheckPayload,
    })),
  );
}

export async function ackWebsiteChecks(
  region: keyof typeof GROUPS,
  ids: string[],
) {
  const pipeline = client.multi();
  for (const id of ids) {
    pipeline.xAck(STREAM_KEY, GROUPS[region], id);
  }
  await pipeline.exec();
}
