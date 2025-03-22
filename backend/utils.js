import speech from "@google-cloud/speech";
import fs from "fs";
import env from "dotenv";

env.config();

const client = new speech.SpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS),
});

export async function transcribeAudio(filePath) {
  const file = fs.readFileSync(filePath);
  const audioBytes = file.toString("base64");

  const request = {
    audio: { content: audioBytes },
    config: {
      encoding: "MP3", // Change based on your audio format
      sampleRateHertz: 44100, // Adjust to match the audio file's sample rate
      languageCode: "en-US", // Change this for different languages
    },
  };

  const [response] = await client.recognize(request);
  const transcription = response.results
    .map((result) => result.alternatives[0].transcript)
    .join("\n");

  return transcription;
}
