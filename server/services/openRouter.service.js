import axios from "axios"

export const askAi = async (messages) => {
    if(!messages || !Array.isArray(messages) || messages.length === 0) {
        throw new Error("Messages array is empty.");
    }

    const maxRetries = 3;
    let delay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await axios.post("https://openrouter.ai/api/v1/chat/completions",
                {
                    model: "openai/gpt-4o-mini",
                    messages: messages
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 15000
                }
            );

            const content = response?.data?.choices?.[0]?.message?.content;

            if (!content || !content.trim()) {
                throw new Error("AI returned empty response.");
            }

            return content

        } catch (error) {
            const isRateLimit = error.response?.status === 429;
            const isServerErr = error.response?.status >= 500 && error.response?.status <= 599;
            const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');

            const shouldRetry = (isRateLimit || isServerErr || isTimeout) && attempt < maxRetries;

            if (shouldRetry) {
                console.warn(`OpenRouter Error on attempt ${attempt}: ${error.message}. Retrying in ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 2;
            } else {
                console.error("OpenRouter Final Error:", error.response?.data || error.message);
                throw new Error("OpenRouter API Error");
            }
        }
    }
}