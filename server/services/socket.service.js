import { WebSocketServer, WebSocket } from "ws";

// In-memory active interview streaming sessions
const activeSessions = new Map();

/**
 * Initializes WebSocket Server attached to Node HTTP server
 * @param {import("http").Server} server 
 */
export const initWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server, path: "/ws/metrics" });

  wss.on("connection", (ws, req) => {
    let currentInterviewId = null;

    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", (rawMessage) => {
      try {
        const data = JSON.parse(rawMessage.toString());
        const { type, payload } = data;

        switch (type) {
          case "join_session": {
            const { interviewId } = payload || {};
            if (interviewId) {
              currentInterviewId = interviewId;
              if (!activeSessions.has(interviewId)) {
                activeSessions.set(interviewId, {
                  clients: new Set(),
                  history: [],
                  startTime: Date.now(),
                });
              }
              const session = activeSessions.get(interviewId);
              session.clients.add(ws);

              ws.send(
                JSON.stringify({
                  type: "session_joined",
                  payload: { interviewId, status: "connected" },
                })
              );
            }
            break;
          }

          case "stream_metrics": {
            if (!currentInterviewId) break;
            const session = activeSessions.get(currentInterviewId);
            if (!session) break;

            const {
              wpm = 0,
              fillerWordsCount = 0,
              fillerWordsList = [],
              verbalConfidenceScore = 0,
              eyeContactScore = 0,
              eyeContactStatus = "Direct",
              postureScore = 0,
              postureStatus = "Upright",
              handGestureCount = 0,
              audioToneVolume = 0,
              pitchVariance = 0,
            } = payload || {};

            // Calculate composite real-time confidence score (50% verbal, 25% posture, 25% eye contact)
            const overallConfidence = Math.min(
              100,
              Math.max(
                0,
                Math.round(
                  verbalConfidenceScore * 0.5 +
                    postureScore * 0.25 +
                    eyeContactScore * 0.25
                )
              )
            );

            const timestamp = Date.now();
            const metricFrame = {
              timestamp,
              wpm,
              fillerWordsCount,
              fillerWordsList,
              verbalConfidenceScore,
              eyeContactScore,
              eyeContactStatus,
              postureScore,
              postureStatus,
              handGestureCount,
              audioToneVolume,
              pitchVariance,
              overallConfidence,
            };

            // Store in circular buffer (max 100 frames)
            session.history.push(metricFrame);
            if (session.history.length > 100) {
              session.history.shift();
            }

            // Broadcast back streamed feedback
            const responseMessage = JSON.stringify({
              type: "metrics_update",
              payload: {
                interviewId: currentInterviewId,
                liveMetrics: metricFrame,
                sessionFramesCount: session.history.length,
              },
            });

            session.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(responseMessage);
              }
            });
            break;
          }

          case "ping": {
            ws.send(JSON.stringify({ type: "pong", payload: { timestamp: Date.now() } }));
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error("WebSocket message parse error:", err.message);
      }
    });

    ws.on("close", () => {
      if (currentInterviewId && activeSessions.has(currentInterviewId)) {
        const session = activeSessions.get(currentInterviewId);
        session.clients.delete(ws);
        if (session.clients.size === 0) {
          activeSessions.delete(currentInterviewId);
        }
      }
    });

    ws.on("error", (err) => {
      console.error("WebSocket client error:", err.message);
    });
  });

  // Keep-alive heartbeat interval every 30 seconds
  const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(pingInterval);
  });

  console.log("WebSocket Server initialized on /ws/metrics");
  return wss;
};
