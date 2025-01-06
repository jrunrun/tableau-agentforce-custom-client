import { FastifyRequest, FastifyReply, RouteGenericInterface } from "fastify";
import { SalesforceSSEConnector } from "../services/sf-sse-connector";
import { Readable } from "node:stream";
import { ReadableStream } from "node:stream/web";
import { ServerSentEventRequest } from "../types";

export async function handleSSEConnection(
  sfMessageConnector: SalesforceSSEConnector,
  request: FastifyRequest<ServerSentEventRequest>,
  reply: FastifyReply
) {
  try {
    const response = await sfMessageConnector.createSSEConnection(
      request.query.token as string
    );
    const nodeStream = Readable.fromWeb(
      response.body as unknown as ReadableStream
    );

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Access-Control-Allow-Credentials": "true",
    });

    request.raw.on("close", () => nodeStream.destroy());
    nodeStream.on("error", () => {
      nodeStream.destroy();
      reply.raw.end();
    });

    nodeStream.pipe(reply.raw);
  } catch (error) {
    console.error("SSE connection error:", error);
    reply.raw.end();
  }
}
