import { useState, useEffect, useRef, useCallback } from "react";
import { Entry, Message } from "../types";
import { useSalesforceMessaging } from "./useSalesforceMessaging";
import { createEventSource } from "eventsource-client";

interface EventSourceMessage {
  data: string;
  event?: string;
  id?: string;
}

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<ReturnType<typeof createEventSource> | null>(null);
  const credsRef = useRef<{
    accessToken: string;
    conversationId: string;
  } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  const {
    initialize,
    sendMessage: sendMessageToApi,
    closeChat: closeChatApi,
    setupEventSource,
  } = useSalesforceMessaging();

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      if (!credsRef.current || !isConnected) return;

      try {
        await closeChatApi(
          credsRef.current.accessToken,
          credsRef.current.conversationId
        );
        setIsConnected(false);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            type: "system",
            content: "Chat ended due to inactivity",
            timestamp: new Date(),
          },
        ]);
      } catch (err) {
        console.error("Failed to end chat:", err);
      }
    }, INACTIVITY_TIMEOUT);
  }, [isConnected, closeChatApi]);

  const handleMessage = useCallback(
    (data: any) => {
      try {
        console.log('Received event data:', data);
        
        const sender = data.conversationEntry.sender.role.toLowerCase();
        if (sender === "chatbot") {
          setIsTyping(false);
          const payload = JSON.parse(data.conversationEntry.entryPayload);
          console.log('New message:', {
            sender,
            content: payload.abstractMessage.staticContent.text,
            timestamp: new Date(data.conversationEntry.clientTimestamp)
          });
          
          setMessages((prev) => [...prev, {
            id: payload.abstractMessage.id,
            type: "ai",
            content: payload.abstractMessage.staticContent.text,
            timestamp: new Date(data.conversationEntry.clientTimestamp),
          }]);
          setIsLoading(false);
          setIsConnected(true);
          resetTimeout();
        }
      } catch (err) {
        console.error("Message parse error:", err);
      }
    },
    [resetTimeout]
  );

  const handleParticipantChange = useCallback((data: any) => {
    const entries = JSON.parse(data.conversationEntry.entryPayload).entries;

    entries.forEach((entry: Entry) => {
      if (
        entry.operation === "add" &&
        entry.participant.role.toLowerCase() === "chatbot"
      ) {
        setCurrentAgent(entry.displayName);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            type: "system",
            content: `${entry.displayName} has joined the chat`,
            timestamp: new Date(),
          },
        ]);
      }
      if (entry.operation === "remove" && entry.participant.role === "agent") {
        setCurrentAgent(null);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            type: "system",
            content: `${entry.displayName} has left the chat`,
            timestamp: new Date(),
          },
        ]);
      }
    });
  }, []);

  const closeChat = async (onClosed: () => void) => {
    try {
      if (!credsRef.current) return;

      await closeChatApi(
        credsRef.current.accessToken,
        credsRef.current.conversationId
      );

      setIsConnected(false);
      setIsTyping(false);
      setCurrentAgent(null);
      setMessages([]);
      setIsLoading(false);
      setError(null);
      onClosed();
    } catch (err) {
      console.error("Failed to close chat:", err);
      setError("Failed to close chat");
    }
  };

  const startNewChat = useCallback(async () => {
    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      setMessages([]);
      setIsLoading(false);
      setIsTyping(false);
      setCurrentAgent(null);
      setError(null);

      const creds = await initialize();
      credsRef.current = creds;

      const events = setupEventSource(creds.accessToken, ({ data, event }: EventSourceMessage) => {
        console.log('Received event:', { data, event });
        try {
          const parsedData = JSON.parse(data);
          switch (event) {
            case "CONVERSATION_MESSAGE":
              handleMessage(parsedData);
              break;
            case "CONVERSATION_PARTICIPANT_CHANGED":
              handleParticipantChange(parsedData);
              break;
            case "CONVERSATION_TYPING_STARTED_INDICATOR":
              setIsTyping(true);
              resetTimeout();
              break;
            case "CONVERSATION_TYPING_STOPPED_INDICATOR":
              setIsTyping(false);
              break;
          }
        } catch (err) {
          console.error("Error parsing event data:", err);
        }
      });
      eventSourceRef.current = events;

      if (events.readyState === "open") {
        setIsConnected(true);
        setError(null);
        resetTimeout();
      } else if (events.readyState === "closed") {
        setIsConnected(false);
      }
    } catch (err) {
      console.error("Chat initialization error:", err);
      setError("Failed to start chat");
      setIsConnected(false);
    }
  }, [initialize, setupEventSource, handleMessage, handleParticipantChange, resetTimeout]);

  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    startNewChat();
    return () => {
      if (eventSourceRef.current) {
        console.log('Closing event source');
        eventSourceRef.current.close();
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const sendMessage = async (content: string) => {
    if (!credsRef.current) return;
    resetTimeout();

    const message = {
      id: crypto.randomUUID(),
      type: "user" as const,
      content,
      timestamp: new Date(),
    };

    try {
      setMessages((prev) => [...prev, message]);
      setIsLoading(true);

      await sendMessageToApi(
        credsRef.current.accessToken,
        credsRef.current.conversationId,
        content
      );
    } catch (err) {
      console.error(err);
      setError("Failed to send message");
      setIsLoading(false);
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
    }
  };

  useEffect(() => {
    console.log('Current messages:', messages);
  }, [messages]);

  return {
    messages,
    isConnected,
    isLoading,
    isTyping,
    currentAgent,
    error,
    sendMessage,
    closeChat,
    startNewChat,
  };
}
