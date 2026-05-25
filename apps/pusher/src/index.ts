import { connectRedis, pushBulkWebsiteChecks } from "@repo/redis-streams";
import db from "@repo/db";

await connectRedis();

async function main() {
  const websites = await db.website.findMany(); // fetch all from DB

  await pushBulkWebsiteChecks(
    websites.map((w) => ({ id: String(w.id), url: w.url, name: w.name })),
  );

console.log(`Pushed ${websites.length} websites to stream`);
}

await main();
setInterval(main, 1000 * 60 * 3); // every 3 minutes
