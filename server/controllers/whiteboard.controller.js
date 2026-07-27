import WhiteboardRoom from "../models/whiteboard.model.js";

// POST /api/whiteboard/room
export const createOrGetRoom = async (req, res) => {
  try {
    const { roomId, title } = req.body;
    const userId = req.userId;

    const generatedRoomId = roomId || `room_${Math.random().toString(36).substring(2, 9)}`;

    let room = await WhiteboardRoom.findOne({ roomId: generatedRoomId });

    if (!room) {
      room = await WhiteboardRoom.create({
        roomId: generatedRoomId,
        title: title || "Technical Interview Collaborative Session",
        createdBy: userId,
      });
    }

    return res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/whiteboard/room/:roomId
export const getRoomState = async (req, res) => {
  try {
    const { roomId } = req.params;

    let room = await WhiteboardRoom.findOne({ roomId });
    if (!room) {
      room = await WhiteboardRoom.create({
        roomId,
        title: "Technical Interview Collaborative Session",
      });
    }

    return res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/whiteboard/room/:roomId
export const saveRoomState = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { code, language, canvasStrokes, title } = req.body;

    const room = await WhiteboardRoom.findOneAndUpdate(
      { roomId },
      { code, language, canvasStrokes, title },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
