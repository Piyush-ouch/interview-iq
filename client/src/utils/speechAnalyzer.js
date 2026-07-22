/**
 * Real-Time Speech & Verbal Confidence Analyzer Utility
 */

const FILLER_PATTERNS = [
  /\b(um+)\b/gi,
  /\b(uh+)\b/gi,
  /\b(like)\b/gi,
  /\b(you know)\b/gi,
  /\b(basically)\b/gi,
  /\b(actually)\b/gi,
  /\b(so yeah)\b/gi,
  /\b(kind of)\b/gi,
  /\b(sort of)\b/gi,
  /\b(i mean)\b/gi,
  /\b(right\?)\b/gi,
];

/**
 * Analyzes spoken transcript, speaking duration, and pauses to generate speech metrics
 * 
 * @param {string} transcript - The spoken or typed answer string
 * @param {number} speakingDurationSeconds - Time taken to speak the answer (in seconds)
 * @param {number} pauseCount - Number of long pauses detected during recording
 * @returns {object} Speech analysis object with wpm, fillerWords, confidence score, and feedback
 */
export const analyzeSpeechPerformance = (
  transcript = "",
  speakingDurationSeconds = 0,
  pauseCount = 0
) => {
  const text = (transcript || "").trim();
  if (!text) {
    return {
      wpm: 0,
      fillerWordsCount: 0,
      fillerWordsList: [],
      pauseCount: 0,
      verbalConfidenceScore: 0,
      speechFeedback: ["No spoken response recorded."],
    };
  }

  // Word Count Calculation
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  // Words Per Minute (WPM)
  const duration = Math.max(speakingDurationSeconds, 3); // minimum 3s safety floor
  const wpm = Math.round((wordCount / duration) * 60);

  // Filler Word Detection
  const foundFillers = [];
  FILLER_PATTERNS.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((match) => foundFillers.push(match.toLowerCase()));
    }
  });

  const fillerWordsCount = foundFillers.length;
  const uniqueFillers = Array.from(new Set(foundFillers));

  // Verbal Confidence Score Algorithm (Base 100)
  let confidenceScore = 100;
  const feedback = [];

  // WPM Evaluation
  if (wpm >= 120 && wpm <= 160) {
    feedback.push(`Optimal speaking pace (${wpm} WPM).`);
  } else if (wpm < 100) {
    confidenceScore -= 15;
    feedback.push(`Pace is slightly slow (${wpm} WPM) - aim for 125-150 WPM.`);
  } else if (wpm > 170) {
    confidenceScore -= 15;
    feedback.push(`Pace is fast (${wpm} WPM) - slow down slightly for better articulation.`);
  } else {
    feedback.push(`Speaking pace: ${wpm} WPM.`);
  }

  // Filler Words Evaluation
  const fillerRatioPer100 = (fillerWordsCount / Math.max(wordCount, 1)) * 100;
  if (fillerWordsCount === 0) {
    feedback.push("Excellent verbal clarity - zero filler words detected.");
  } else if (fillerRatioPer100 <= 3) {
    confidenceScore -= 5;
    feedback.push(`Low filler word usage (${fillerWordsCount} detected: ${uniqueFillers.join(", ")}).`);
  } else {
    confidenceScore -= Math.min(25, Math.round(fillerRatioPer100 * 3));
    feedback.push(
      `Detected ${fillerWordsCount} filler words (${uniqueFillers.join(", ")}) - practice pausing silently instead of using fillers.`
    );
  }

  // Pause Evaluation
  if (pauseCount > 3) {
    confidenceScore -= 10;
    feedback.push(`Detected ${pauseCount} long pauses - work on continuous thought flow.`);
  } else {
    feedback.push("Good speech continuity with minimal hesitation.");
  }

  const finalVerbalScore = Math.max(20, Math.min(100, Math.round(confidenceScore)));

  return {
    wpm,
    fillerWordsCount,
    fillerWordsList: uniqueFillers,
    pauseCount,
    verbalConfidenceScore: finalVerbalScore,
    speechFeedback: feedback,
  };
};
