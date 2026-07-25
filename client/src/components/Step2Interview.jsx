import React, { useState, useRef, useEffect } from "react";
import maleVideo from "../assets/videos/male-ai.mp4";
import femaleVideo from "../assets/videos/female-ai.mp4";
import Timer from "./Timer";
import { motion } from "motion/react";
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from "react-icons/fa";
import { BsArrowRight } from "react-icons/bs";
import axios from "axios";
import { ServerUrl } from "../App";
import { analyzeSpeechPerformance } from "../utils/speechAnalyzer";
import { BodyLanguageAnalyzer } from "../utils/bodyLanguageAnalyzer";
import { AudioToneAnalyzer } from "../utils/audioToneAnalyzer";
import { useInterviewWebSocket } from "../hooks/useInterviewWebSocket";
import { getLanguageObj } from "../utils/languages";

function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName, language = "English" } = interviewData;
  const langObj = getLanguageObj(language);

  const [isIntroPhase, setIsIntroPhase] = useState(true);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isWebcamOn, setIsWebcamOn] = useState(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");

  // Multi-Language Live Translation state
  const [translatedQuestion, setTranslatedQuestion] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  // Adaptive Follow-Up States
  const [followUpObj, setFollowUpObj] = useState(null);
  const [isInFollowUp, setIsInFollowUp] = useState(false);
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);

  // WebSockets & Real-Time Performance Telemetry
  const { isConnected: isWsConnected, streamedMetrics, streamMetricsFrame } =
    useInterviewWebSocket(interviewId);

  // Real-time body language & audio metrics states
  const [bodyMetrics, setBodyMetrics] = useState({
    eyeContactScore: 88,
    eyeContactStatus: "Direct",
    postureScore: 92,
    postureStatus: "Upright",
    gestureCount: 0,
    bodyConfidenceScore: 90,
  });

  const [audioMetrics, setAudioMetrics] = useState({
    volume: 0,
    pitchVariance: 0,
    toneQuality: "Steady Tone",
    frequencyData: [],
  });

  const videoRef = useRef(null);
  const userWebcamRef = useRef(null);
  const bodyAnalyzerRef = useRef(null);
  const audioAnalyzerRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const currentQuestion =
    isInFollowUp && followUpObj ? followUpObj : questions[currentIndex];

  // 1. Initialize WebCam & Audio Streams for Body & Tone Analysis
  useEffect(() => {
    let isMounted = true;
    bodyAnalyzerRef.current = new BodyLanguageAnalyzer();
    audioAnalyzerRef.current = new AudioToneAnalyzer();

    async function initUserMedia() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 320, height: 240 },
            audio: true,
          });

          if (!isMounted) return;
          mediaStreamRef.current = stream;

          if (userWebcamRef.current) {
            userWebcamRef.current.srcObject = stream;
          }

          // Start Audio Tone Analyzer
          await audioAnalyzerRef.current.start(stream);
        }
      } catch (err) {
        console.warn("Camera/Microphone media stream error:", err.message);
      }
    }

    initUserMedia();

    return () => {
      isMounted = false;
      if (audioAnalyzerRef.current) {
        audioAnalyzerRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 2. Real-Time Telemetry Processing & WebSocket Streaming Loop
  useEffect(() => {
    let animFrameId;

    const runTelemetryLoop = () => {
      const timeTaken = currentQuestion?.timeLimit
        ? currentQuestion.timeLimit - timeLeft
        : 10;
      const speechPerf = analyzeSpeechPerformance(answer, Math.max(1, timeTaken), 0);

      // Body Language Detection
      let bodyRes = {
        eyeContactScore: 88,
        eyeContactStatus: "Direct",
        postureScore: 92,
        postureStatus: "Upright",
        gestureCount: 0,
        bodyConfidenceScore: 90,
      };

      if (userWebcamRef.current && isWebcamOn && bodyAnalyzerRef.current) {
        bodyRes = bodyAnalyzerRef.current.analyzeFrame(userWebcamRef.current);
      }

      // Audio Tone Detection
      let audioRes = {
        volume: 0,
        pitchVariance: 0,
        toneQuality: "Steady Tone",
        frequencyData: [],
      };

      if (audioAnalyzerRef.current) {
        audioRes = audioAnalyzerRef.current.getAudioMetrics();
      }

      setBodyMetrics(bodyRes);
      setAudioMetrics(audioRes);

      const compositeConfidence = Math.round(
        speechPerf.verbalConfidenceScore * 0.5 +
          bodyRes.postureScore * 0.25 +
          bodyRes.eyeContactScore * 0.25
      );

      const framePayload = {
        wpm: speechPerf.wpm,
        fillerWordsCount: speechPerf.fillerWordsCount,
        fillerWordsList: speechPerf.fillerWordsList,
        verbalConfidenceScore: speechPerf.verbalConfidenceScore,
        eyeContactScore: bodyRes.eyeContactScore,
        eyeContactStatus: bodyRes.eyeContactStatus,
        postureScore: bodyRes.postureScore,
        postureStatus: bodyRes.postureStatus,
        handGestureCount: bodyRes.gestureCount,
        audioToneVolume: audioRes.volume,
        pitchVariance: audioRes.pitchVariance,
        overallConfidence: compositeConfidence,
      };

      streamMetricsFrame(framePayload);

      animFrameId = requestAnimationFrame(runTelemetryLoop);
    };

    animFrameId = requestAnimationFrame(runTelemetryLoop);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [answer, timeLeft, isWebcamOn, currentQuestion, streamMetricsFrame]);

  // Voice Selection logic
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const femaleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female")
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      const maleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male")
      );

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  /* ---------------- SPEAK FUNCTION ---------------- */
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const humanText = text.replace(/,/g, ", ... ").replace(/\./g, ". ... ");
      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.voice = selectedVoice;
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic();
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        if (videoRef.current) videoRef.current.currentTime = 0;
        setIsAIPlaying(false);

        if (isMicOn) {
          startMic();
        }
        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });
  };

  useEffect(() => {
    if (!selectedVoice) return;

    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );
        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );
        setIsIntroPhase(false);
      } else if (currentQuestion && !isInFollowUp) {
        await new Promise((r) => setTimeout(r, 800));

        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }

        await speakText(currentQuestion.question);

        if (isMicOn) {
          startMic();
        }
      }
    };

    runIntro();
  }, [selectedVoice, isIntroPhase, currentIndex]);

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex, isInFollowUp]);

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
      setShowTranslation(false);
      setTranslatedQuestion("");
    }
  }, [currentIndex, isInFollowUp]);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = langObj.locale || "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript;
      setAnswer((prev) => prev + " " + transcript);
    };

    recognitionRef.current = recognition;
  }, [langObj.locale]);

  const handleToggleTranslation = async () => {
    if (!showTranslation && !translatedQuestion && currentQuestion?.question) {
      setIsTranslating(true);
      try {
        const targetLang = langObj.code === "en" ? "Spanish" : "English";
        const res = await axios.post(
          `${ServerUrl}/api/interview/translate`,
          {
            text: currentQuestion.question,
            targetLanguage: targetLang,
          },
          { withCredentials: true }
        );
        setTranslatedQuestion(res.data.translatedText || currentQuestion.question);
      } catch (err) {
        console.error("Translation error:", err);
        setTranslatedQuestion(currentQuestion.question);
      } finally {
        setIsTranslating(false);
      }
    }
    setShowTranslation((prev) => !prev);
  };

  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch {}
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }
    setIsMicOn(!isMicOn);
  };

  const toggleWebcam = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isWebcamOn;
        setIsWebcamOn(!isWebcamOn);
      }
    }
  };

  const fetchFollowUpInBackground = async (originalQIndex) => {
    setIsLoadingFollowUp(true);
    try {
      const res = await axios.post(
        ServerUrl + "/api/interview/generate-followup",
        {
          interviewId,
          questionIndex: originalQIndex,
        },
        { withCredentials: true }
      );
      if (res.data && !res.data.skip && res.data.followUp) {
        setFollowUpObj(res.data.followUp);
      }
    } catch (err) {
      console.error("Follow-up generation error:", err);
    } finally {
      setIsLoadingFollowUp(false);
    }
  };

  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic();
    setIsSubmitting(true);

    const targetIndex =
      isInFollowUp && followUpObj ? followUpObj.index : currentIndex;
    const timeTaken = currentQuestion.timeLimit - timeLeft;

    const speechAnalysis = analyzeSpeechPerformance(answer, timeTaken, 0);

    const bodyLanguageAnalysis = {
      eyeContactScore: bodyMetrics.eyeContactScore,
      eyeContactStatus: bodyMetrics.eyeContactStatus,
      postureScore: bodyMetrics.postureScore,
      postureStatus: bodyMetrics.postureStatus,
      gestureCount: bodyMetrics.gestureCount,
      bodyConfidenceScore: bodyMetrics.bodyConfidenceScore,
    };

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: targetIndex,
          answer,
          timeTaken,
          speechAnalysis,
          bodyLanguageAnalysis,
        },
        { withCredentials: true }
      );

      setFeedback(result.data.feedback);
      speakText(result.data.feedback);
      setIsSubmitting(false);

      if (!isInFollowUp && answer && answer.trim()) {
        fetchFollowUpInBackground(currentIndex);
      }
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    setAnswer("");
    setFeedback("");

    if (!isInFollowUp && followUpObj) {
      setIsInFollowUp(true);
      setTimeLeft(followUpObj.timeLimit || 60);

      await speakText("Let me ask a quick follow-up on that.");
      await speakText(followUpObj.question);

      if (isMicOn) startMic();
      return;
    }

    setIsInFollowUp(false);
    setFollowUpObj(null);

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright, let's move to the next question.");
    setCurrentIndex(currentIndex + 1);
    setTimeout(() => {
      if (isMicOn) startMic();
    }, 500);
  };

  const finishInterview = async () => {
    stopMic();
    setIsMicOn(false);
    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/finish",
        { interviewId },
        { withCredentials: true }
      );

      if (interviewData?.battleId) {
        try {
          await axios.post(
            ServerUrl + "/api/battle/complete-interview",
            {
              battleId: interviewData.battleId,
              interviewId: interviewId,
            },
            { withCredentials: true }
          );
        } catch (battleErr) {
          console.error("Failed to update battle result:", battleErr);
        }
      }

      onFinish(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // Compute live combined metrics for dashboard
  const activeMetrics = streamedMetrics || {
    wpm: analyzeSpeechPerformance(answer, currentQuestion?.timeLimit - timeLeft || 10, 0).wpm,
    fillerWordsCount: analyzeSpeechPerformance(answer, 1, 0).fillerWordsCount,
    fillerWordsList: analyzeSpeechPerformance(answer, 1, 0).fillerWordsList,
    verbalConfidenceScore: analyzeSpeechPerformance(answer, 1, 0).verbalConfidenceScore,
    eyeContactScore: bodyMetrics.eyeContactScore,
    eyeContactStatus: bodyMetrics.eyeContactStatus,
    postureScore: bodyMetrics.postureScore,
    postureStatus: bodyMetrics.postureStatus,
    gestureCount: bodyMetrics.gestureCount,
    bodyConfidenceScore: bodyMetrics.bodyConfidenceScore,
    overallConfidence: Math.round(
      analyzeSpeechPerformance(answer, 1, 0).verbalConfidenceScore * 0.5 +
        bodyMetrics.postureScore * 0.25 +
        bodyMetrics.eyeContactScore * 0.25
    ),
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300 flex flex-col items-center justify-center p-4 sm:p-6 space-y-6">
      <div className="w-full max-w-350 min-h-[80vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-800 flex flex-col lg:flex-row overflow-hidden transition-colors duration-300">
        {/* Video & Camera Stream Section */}
        <div className="w-full lg:w-[35%] bg-white dark:bg-slate-900 flex flex-col items-center p-6 space-y-6 border-r border-gray-200 dark:border-slate-800 transition-colors">
          {/* AI Interviewer Video */}
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl relative border border-gray-200 dark:border-slate-700">
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />
            <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full font-bold">
              AI Interviewer
            </span>
          </div>

          {/* Candidate User WebCam Stream Feed */}
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-md relative bg-slate-900 aspect-video border border-gray-200 dark:border-slate-700">
            <video
              ref={userWebcamRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${!isWebcamOn && "hidden"}`}
            />

            {!isWebcamOn && (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                <FaVideoSlash size={28} />
                <span className="text-xs font-semibold">Webcam paused</span>
              </div>
            )}

            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-full font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Candidate Feed (Pose AI Active)
            </div>

            <button
              onClick={toggleWebcam}
              className="absolute bottom-2 right-2 bg-black/70 text-white p-2 rounded-xl hover:bg-black transition cursor-pointer"
            >
              {isWebcamOn ? <FaVideo size={14} /> : <FaVideoSlash size={14} />}
            </button>
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div className="w-full max-w-md bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
              <p className="text-gray-700 dark:text-gray-200 text-sm sm:text-base font-medium text-center leading-relaxed">
                {subtitle}
              </p>
            </div>
          )}

          {/* Timer Area */}
          <div className="w-full max-w-md bg-white dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-md p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Interview Status</span>
              {isAIPlaying && (
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  AI Speaking
                </span>
              )}
            </div>

            <div className="h-px bg-gray-200 dark:bg-slate-700" />

            <div className="flex justify-center">
              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} />
            </div>

            <div className="h-px bg-gray-200 dark:bg-slate-700" />

            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {isInFollowUp ? `${currentIndex + 1}.1` : currentIndex + 1}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-400 block">
                  {isInFollowUp ? "Follow-Up Question" : "Current Question"}
                </span>
              </div>

              <div>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {questions.length}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-400 block">Main Questions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Answer & Real-Time Performance Section */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              AI Smart Interview
            </h2>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs px-3 py-1 rounded-full font-bold shadow-2xs flex items-center gap-1.5">
                <span>{langObj.flag}</span> {langObj.name} ({langObj.locale})
              </span>

              {isInFollowUp && (
                <span className="bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs px-3 py-1 rounded-full font-bold shadow-xs">
                  🔄 Adaptive Follow-Up
                </span>
              )}
            </div>
          </div>

          {!isIntroPhase && (
            <div
              className={`relative p-4 sm:p-6 rounded-2xl border shadow-sm transition-all ${
                isInFollowUp
                  ? "bg-purple-50/60 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800"
                  : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {isInFollowUp
                    ? `Follow-Up for Question ${currentIndex + 1}`
                    : `Question ${currentIndex + 1} of ${questions.length}`}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleTranslation}
                    disabled={isTranslating}
                    className="text-[11px] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 font-bold px-2.5 py-1 rounded-md transition shadow-2xs cursor-pointer flex items-center gap-1"
                  >
                    <span>🌐</span> {isTranslating ? "Translating..." : showTranslation ? "Show Original" : `Translate to ${langObj.code === "en" ? "Spanish" : "English"}`}
                  </button>

                  {isInFollowUp && (
                    <span className="text-[11px] bg-purple-600 text-white font-bold px-2 py-0.5 rounded-md">
                      Probing Deeper
                    </span>
                  )}
                </div>
              </div>

              <div className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white leading-relaxed">
                {showTranslation && translatedQuestion ? translatedQuestion : currentQuestion?.question}
              </div>
            </div>
          )}

          <textarea
            placeholder="Type or speak your answer here..."
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            className="w-full h-36 bg-gray-100 dark:bg-slate-800 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 transition text-gray-800 dark:text-gray-100"
          />

          {!feedback ? (
            <div className="flex items-center gap-4">
              <motion.button
                onClick={toggleMic}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg cursor-pointer"
              >
                {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
              </motion.button>

              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500 cursor-pointer"
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm"
            >
              <p className="text-emerald-700 font-medium mb-4">{feedback}</p>
              <button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1 cursor-pointer font-semibold"
              >
                {isInFollowUp || !followUpObj
                  ? "Next Question"
                  : "Continue to Follow-Up Question"}{" "}
                <BsArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* Embedded Real-Time Performance & Body Language Telemetry Dashboard */}
          <LiveFeedbackDashboard
            metrics={activeMetrics}
            audioMetrics={audioMetrics}
            isWsConnected={isWsConnected}
            showWebcam={isWebcamOn}
            onToggleWebcam={toggleWebcam}
          />
        </div>
      </div>
    </div>
  );
}

export default Step2Interview;
