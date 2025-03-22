import { Mp3Encoder } from "@breezystack/lamejs";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

console.log(API_URL);

export const sendPrompt = async (
  chatHistory: MessageType[],
  onMessage: (msg: string) => void
) => {
  const formData = new FormData();

  // Append chat history as a JSON string
  formData.append("history", JSON.stringify(chatHistory));

  const lastMessage = chatHistory[chatHistory.length - 1];
  if (lastMessage.file) {
    formData.append("audio", lastMessage.file);
  }

  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    body: formData, // No need to set `Content-Type`, `fetch` will handle it
  });

  if (!response.ok) {
    console.error("Error:", response.statusText);
    return;
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) return;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      chunk.split("\n").forEach((line) => {
        if (line.startsWith("data: ")) {
          const parsedData = JSON.parse(line.replace("data: ", ""));
          onMessage(parsedData.msg);
        }
      });
    }
  } catch (error) {
    console.error("Streaming error:", error);
  }
};

export const transcribeAudio = async (audioBlob: Blob) => {
  const formData = new FormData();
  const mp3Blob = await convertToMp3(audioBlob);
  const audioFile = new File([mp3Blob], "recording.mp3", {
    type: "audio/mp3",
  });

  formData.append("audio", audioFile);

  try {
    const response = await axios.post(`${API_URL}/transcribe`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Correct header for file uploads
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading audio:", error);
    return null;
  }
};

export const convertToMp3 = async (blob: Blob) => {
  // Read the audio data from the Blob
  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Convert the audio to MP3 using lamejs
  const encoder = new Mp3Encoder(
    audioBuffer.numberOfChannels,
    audioBuffer.sampleRate,
    128
  );

  const samples = audioBuffer.getChannelData(0); // Mono conversion

  // Convert Float32Array to Int16Array
  const int16Samples = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    int16Samples[i] = Math.max(-32768, Math.min(32767, samples[i] * 0x7fff));
  }

  const mp3Data = encoder.encodeBuffer(int16Samples);
  encoder.flush();

  const mp3Blob = new Blob([mp3Data], { type: "audio/mmpeg" });

  return mp3Blob;
};

export function cleanMarkdown(markdown: string) {
  return (
    markdown
      // Ensure there's a space after markdown headers (e.g., `##Heading` -> `## Heading`)
      .replace(/^(#{1,3})([^\s#])/gm, "$1 $2")
      .replace(/^```|```$/g, "")
  );
}

export async function getTitle(history: MessageType[]) {
  const res = await axios.post(`${API_URL}/generate-title`, {
    history,
  });

  return res.data;
}
