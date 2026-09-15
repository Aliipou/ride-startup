"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type WSEvent = { type: string; data: Record<string, unknown> };

const RECONNECT_DELAY = 3000;

/** Generic reconnecting WebSocket. `url` null disables the connection
 * (e.g. while auth/ride id aren't known yet). */
export function useWebSocket(
  url: string | null,
  onMessage: (event: WSEvent) => void
): { isConnected: boolean } {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldConnectRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);

  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback((targetUrl: string) => {
    if (!shouldConnectRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(targetUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data as string) as WSEvent;
          onMessageRef.current(parsed);
        } catch {
          // ignore malformed frames
        }
      };

      ws.onerror = (err) => console.warn("WebSocket error:", err);

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        if (shouldConnectRef.current) {
          reconnectTimerRef.current = setTimeout(() => connect(targetUrl), RECONNECT_DELAY);
        }
      };
    } catch (err) {
      console.warn("WebSocket connection failed:", err);
      if (shouldConnectRef.current) {
        reconnectTimerRef.current = setTimeout(() => connect(targetUrl), RECONNECT_DELAY);
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    shouldConnectRef.current = false;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!url) {
      disconnect();
      return;
    }
    shouldConnectRef.current = true;
    connect(url);
    return () => disconnect();
  }, [url, connect, disconnect]);

  return { isConnected };
}
