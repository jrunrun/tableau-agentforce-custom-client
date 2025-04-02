import { useCallback } from "react";
import { createEventSource } from "eventsource-client";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const SCRT_URL = import.meta.env.VITE_SCRT_URL;
const ORG_ID = import.meta.env.VITE_ORG_ID;

interface MessagingCredentials {
  accessToken: string;
  conversationId: string;
}

interface EventSourceMessage {
  data: string;
  event?: string;
  id?: string;
}

interface MessagingHookReturn {
  initialize: () => Promise<MessagingCredentials>;
  sendMessage: (
    token: string,
    conversationId: string,
    content: string
  ) => Promise<void>;
  closeChat: (token: string, conversationId: string) => Promise<void>;
  setupEventSource: (
    token: string,
    onMessage?: (message: EventSourceMessage) => void
  ) => ReturnType<typeof createEventSource>;
}

export function useSalesforceMessaging(): MessagingHookReturn {
  const initialize = useCallback(async (): Promise<MessagingCredentials> => {
    const response = await fetch(`${API_BASE_URL}/chat/initialize`);
    if (!response.ok) throw new Error("Failed to initialize chat");
    return response.json();
  }, []);

  const sendMessage = useCallback(
    async (
      token: string,
      conversationId: string,
      content: string
    ): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Conversation-Id": conversationId,
        },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) throw new Error("Failed to send message");
    },
    []
  );

  const closeChat = useCallback(
    async (token: string, conversationId: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/chat/end`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Conversation-Id": conversationId,
        },
      });

      if (!response.ok) throw new Error("Failed to close chat");
    },
    []
  );

  const setupEventSource = useCallback(
    (token: string, onMessage?: (message: EventSourceMessage) => void) => {
      if (!SCRT_URL || !ORG_ID) {
        throw new Error("SCRT URL and Org ID must be configured in environment variables");
      }

      return createEventSource({
        url: `https://${SCRT_URL}/eventrouter/v1/sse`,
        headers: {
          Accept: "text/event-stream",
          Authorization: `Bearer ${token}`,
          "X-Org-Id": ORG_ID,
        },
        onMessage,
      });
    },
    []
  );

  return {
    initialize,
    sendMessage,
    closeChat,
    setupEventSource,
  };
}
