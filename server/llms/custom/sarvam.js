import { LLM } from "@langchain/core/language_models/llms";
import { GenerationChunk } from "@langchain/core/outputs";
import dotenv from "dotenv"
dotenv.config()

export class SarvamAI extends LLM {
    apiKey;
    model;
    temperature;
    constructor(fields) {
        super(fields);
        this.apiKey = fields.apiKey;
        this.model = fields.model ?? "sarvam-m";
        this.temperature = fields.temperature ?? 0.7;
    }

    _llmType() {
        return "sarvam-ai";
    }

    // Used when stream: false
    async _call(prompt, _options, _runManager) {
        const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-subscription-key": this.apiKey,
            },
            body: JSON.stringify({
                model: this.model,
                messages: [{ role: "user", content: prompt }],
                temperature: this.temperature,
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error(`Sarvam AI API error: ${response.statusText}`);
        }

        const json = await response.json();
        return json.choices[0]?.message?.content || "";
    }

    // Used when stream: true
    async * _streamResponseChunks(prompt, options, runManager) {
        const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-subscription-key": this.apiKey,
            },
            body: JSON.stringify({
                model: this.model,
                messages: [{ role: "user", content: prompt }],
                temperature: this.temperature,
                stream: true,
            }),
        });

        if (!response.ok) {
            throw new Error(`Sarvam AI API error: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            // Split by newlines (you may get multiple messages per chunk)
            const lines = buffer.split('\n');

            // Keep the last partial line in the buffer
            buffer = lines.pop() ?? '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith('data:')) continue;

                const jsonString = trimmed.replace(/^data:\s*/, '');
                if (jsonString === '[DONE]') continue;

                try {
                    const parsed = JSON.parse(jsonString);
                    const content = parsed?.choices?.[0]?.delta?.content;
                    if (content) {
                        yield new GenerationChunk({ text: content });
                        await runManager?.handleLLMNewToken(content);
                    }
                } catch (err) {
                    console.error('Skipping malformed JSON chunk:', jsonString);
                }
            }
        }
    }
}