import { client } from "./index.js";

const STREAM_KEY = "betteruptime:website";

export type WebsiteCheckPayload = {
  id: string;
  url: string;
  name: string;
};

export async function pushWebsiteCheck(data: WebsiteCheckPayload) {
  return await client.xAdd(STREAM_KEY, "*", data);
}

export async function pushBulkWebsiteChecks(items: WebsiteCheckPayload[]) {
  const pipeline = client.multi(); // pipeline / transaction

  for (const item of items) {
    pipeline.xAdd(STREAM_KEY, "*", item);
  }

  return await pipeline.exec(); // sends all at once
}
