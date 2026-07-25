import mongoose from "mongoose";

const questionsSchema = new mongoose.Schema({
  question: String,
  difficulty: String,
  timeLimit: Number,
  answer: String,
  feedback: String,
  score: { type: Number, default: 0 },
  confidence: { type: Number, default: 0 },
  communication: { type: Number, default: 0 },
  correctness: { type: Number, default: 0 },
  isFollowUp: { type: Boolean, default: false },
  parentQuestionIndex: Number,
  speechAnalysis: {
    wpm: { type: Number, default: 0 },
    fillerWordsCount: { type: Number, default: 0 },
    fillerWordsList: [String],
    pauseCount: { type: Number, default: 0 },
    verbalConfidenceScore: { type: Number, default: 0 },
    speechFeedback: [String],
  },
  bodyLanguageAnalysis: {
    eyeContactScore: { type: Number, default: 0 },
    eyeContactStatus: { type: String, default: "Direct" },
    postureScore: { type: Number, default: 0 },
    postureStatus: { type: String, default: "Upright" },
    gestureCount: { type: Number, default: 0 },
    bodyConfidenceScore: { type: Number, default: 0 },
  },
})


const interviewSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    role:{
        type:String,
        required:true
    },
    experience:{
        type:String,
        required:true
    },
    mode:{
        type:String,
        enum:["HR" ,"Technical"],
        required:true
    },
    resumeText:{
     type:String
    },
    questions:[questionsSchema],

    finalScore: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["Incompleted", "completed"],
      default: "Incompleted",
    }
},{timestamps:true})

const Interview = mongoose.model("Interview" , interviewSchema)


export default Interview