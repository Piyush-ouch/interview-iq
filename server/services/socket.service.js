import { WebSocketServer, WebSocket } from "ws";

// In-memory active interview streaming sessions
const activeSessions = new Map();
// In-memory collaborative whiteboard rooms
const whiteboardRooms = new Map();

/**
 * Initializes WebSocket Server attached to Node HTTP server
 * @param {import("http").Server} server 
 */
export const initWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server, path: "/ws/metrics" });

  wss.on("connection", (ws, req) => {
    let currentInterviewId = null;
    let currentWhiteboardRoomId = null;

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

            session.history.push(metricFrame);
            if (session.history.length > 100) {
              session.history.shift();
            }

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

          // === COLLABORATIVE WHITEBOARD & CODE EVENTS ===
          case "join_whiteboard_room": {
            const { roomId, userName } = payload || {};
            if (roomId) {
              currentWhiteboardRoomId = roomId;
              if (!whiteboardRooms.has(roomId)) {
                whiteboardRooms.set(roomId, {
                  clients: new Set(),
                  strokes: [],
                  code: "",
                });
              }
              const room = whiteboardRooms.get(roomId);
              room.clients.add(ws);

              ws.send(
                JSON.stringify({
                  type: "whiteboard_joined",
                  payload: {
                    roomId,
                    clientsCount: room.clients.size,
                    strokes: room.strokes,
                    code: room.code,
                  },
                })
              );

              // Broadcast user joined
              const notifyMessage = JSON.stringify({
                type: "user_joined_whiteboard",
                payload: { roomId, clientsCount: room.clients.size, userName },
              });
              room.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(notifyMessage);
                }
              });
            }
            break;
          }

          case "whiteboard_draw_stroke": {
            const { roomId, stroke } = payload || {};
            if (roomId && whiteboardRooms.has(roomId)) {
              const room = whiteboardRooms.get(roomId);
              room.strokes.push(stroke);

              const drawMsg = JSON.stringify({
                type: "whiteboard_stroke_added",
                payload: { roomId, stroke },
              });

              room.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(drawMsg);
                }
              });
            }
            break;
          }

          case "whiteboard_clear": {
            const { roomId } = payload || {};
            if (roomId && whiteboardRooms.has(roomId)) {
              const room = whiteboardRooms.get(roomId);
              room.strokes = [];

              const clearMsg = JSON.stringify({
                type: "whiteboard_cleared",
                payload: { roomId },
              });

              room.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(clearMsg);
                }
              });
            }
            break;
          }

          case "code_update": {
            const { roomId, code, language, senderName } = payload || {};
            if (roomId && whiteboardRooms.has(roomId)) {
              const room = whiteboardRooms.get(roomId);
              room.code = code;

              const codeMsg = JSON.stringify({
                type: "code_updated",
                payload: { roomId, code, language, senderName },
              });

              room.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(codeMsg);
                }
              });
            }
            break;
          }

          case "laser_annotation": {
            const { roomId, point, senderName } = payload || {};
            if (roomId && whiteboardRooms.has(roomId)) {
              const room = whiteboardRooms.get(roomId);
              const laserMsg = JSON.stringify({
                type: "laser_moved",
                payload: { roomId, point, senderName },
              });

              room.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(laserMsg);
                }
              });
            }
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

      if (currentWhiteboardRoomId && whiteboardRooms.has(currentWhiteboardRoomId)) {
        const room = whiteboardRooms.get(currentWhiteboardRoomId);
        room.clients.delete(ws);
        if (room.clients.size === 0) {
          whiteboardRooms.delete(currentWhiteboardRoomId);
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

  console.log("WebSocket Server initialized for metrics & collaborative whiteboard on /ws/metrics");
  return wss;
};
