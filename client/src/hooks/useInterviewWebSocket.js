import { useEffect, useRef, useState, useCallback } from "react";
import { ServerUrl } from "../App";

/**
 * Custom hook to manage WebSocket connection for real-time telemetry streaming
 * @param {string} interviewId - Current active interview ID
 * @returns {object} { isConnected, streamedMetrics, streamMetricsFrame }
 */
export function useInterviewWebSocket(interviewId) {
  const [isConnected, setIsConnected] = useState(false);
  const [streamedMetrics, setStreamedMetrics] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const getWsUrl = useCallback(() => {
    let baseUrl = ServerUrl || "http://localhost:6000";
    const wsProtocol = baseUrl.startsWith("https") ? "wss://" : "ws://";
    const cleanHost = baseUrl.replace(/^https?:\/\//, "");
    return `${wsProtocol}${cleanHost}/ws/metrics`;
  }, []);

  useEffect(() => {
    if (!interviewId) return;

    let isComponentMounted = true;

    const connectWebSocket = () => {
      try {
        const wsUrl = getWsUrl();
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          if (!isComponentMounted) return;
          setIsConnected(true);

          // Join interview telemetry room
          socket.send(
            JSON.stringify({
              type: "join_session",
              payload: { interviewId },
            })
          );
        };

        socket.onmessage = (event) => {
          if (!isComponentMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === "metrics_update" && data.payload?.liveMetrics) {
              setStreamedMetrics(data.payload.liveMetrics);
            }
          } catch (err) {
            console.error("WebSocket message parse error:", err);
          }
        };

        socket.onclose = () => {
          if (!isComponentMounted) return;
          setIsConnected(false);
          // Attempt reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        };

        socket.onerror = (err) => {
          console.warn("WebSocket error:", err);
          socket.close();
        };
      } catch (err) {
        console.error("Failed to construct WebSocket connection:", err);
      }
    };

    connectWebSocket();

    return () => {
      isComponentMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [interviewId, getWsUrl]);

  /**
   * Streams a single telemetry frame over WebSocket
   */
  const streamMetricsFrame = useCallback(
    (metricsFrame) => {
      if (
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN &&
        interviewId
      ) {
        wsRef.current.send(
          JSON.stringify({
            type: "stream_metrics",
            payload: metricsFrame,
          })
        );
      }
    },
    [interviewId]
  );

  return {
    isConnected,
    streamedMetrics,
    streamMetricsFrame,
  };
}
