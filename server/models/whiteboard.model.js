import mongoose from "mongoose";

const whiteboardSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      default: "Technical Interview System Design & Whiteboard Session",
    },
    language: {
      type: String,
      default: "javascript",
    },
    code: {
      type: String,
      default: `// Collaborative Coding & System Design Workspace
// Write code or pseudo-code below

function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
`,
    },
    canvasStrokes: [
      {
        type: { type: String }, // 'pen', 'rectangle', 'circle', 'text', 'arrow'
        points: [{ x: Number, y: Number }],
        color: { type: String, default: "#10b981" },
        size: { type: Number, default: 3 },
        text: { type: String, default: "" },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    participantsCount: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

const WhiteboardRoom = mongoose.model("WhiteboardRoom", whiteboardSchema);
export default WhiteboardRoom;
