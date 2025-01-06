import { SalesforceConfig } from "../types";

interface SSEResponse {
  status: number;
  headers: {
    "Content-Type": string;
    "Cache-Control": string;
    Connection: string;
    "Access-Control-Allow-Origin": string;
    "Access-Control-Allow-Credentials": string;
  };
  body: ReadableStream<Uint8Array>;
}

export class SalesforceSSEConnector {
  constructor(private config: SalesforceConfig) {}

  async createSSEConnection(token: string): Promise<SSEResponse> {
    const response = await fetch(
      `https://${this.config.scrtUrl}/eventrouter/v1/sse`,
      {
        headers: {
          Accept: "text/event-stream",
          Authorization: `Bearer ${token}`,
          "X-Org-Id": this.config.orgId,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to connect to Salesforce SSE: ${response.statusText}`
      );
    }

    if (!response.body) {
      throw new Error("No response body received");
    }

    return {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Credentials": "true",
      },
      body: response.body,
    };
  }
}
