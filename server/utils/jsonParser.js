/**
 * Safely parses JSON from AI responses that may include markdown formatting or leading/trailing text.
 * 
 * @param {string} text The raw response string from the AI.
 * @returns {object|array} The parsed JSON object/array.
 * @throws {Error} If no valid JSON is found or parsing fails.
 */
export const parseJSONFromAI = (text) => {
    if (!text || typeof text !== "string") {
        throw new Error("Input to parseJSONFromAI must be a non-empty string");
    }

    let cleaned = text.trim();

    // 1. Remove markdown code blocks like ```json ... ``` or ``` ... ```
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

    // 2. If it's still not starting with '{' or '[', attempt to extract JSON using regex
    if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
        const jsonMatch = cleaned.match(/[\{\[][\s\S]*[\}\]]/);
        if (jsonMatch) {
            cleaned = jsonMatch[0];
        }
    }

    try {
        return JSON.parse(cleaned);
    } catch (error) {
        try {
            // Remove control characters which might break JSON.parse
            const sanitized = cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
            return JSON.parse(sanitized);
        } catch (innerError) {
            console.error("Failed to parse JSON from AI response. Raw Text:", text);
            throw new Error(`JSON parsing failed: ${innerError.message}`);
        }
    }
};
