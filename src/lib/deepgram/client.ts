import { createClient, DeepgramClient } from "@deepgram/sdk";

let _client: DeepgramClient | null = null;

export function getDeepgramClient(): DeepgramClient {
  if (!process.env.DEEPGRAM_API_KEY) {
    throw new Error("DEEPGRAM_API_KEY is not configured");
  }

  if (!_client) {
    _client = createClient(process.env.DEEPGRAM_API_KEY);
  }

  return _client;
}
