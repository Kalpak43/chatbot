import { Mp3Encoder } from "@breezystack/lamejs";
import axios from "axios";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, storage } from "./firebase";

const API_URL = import.meta.env.VITE_API_URL;

export const sendPrompt = async ({
  chatHistory,
  onMessage,
  onStart,
  onEnd,
  onError,
  uid,
  id,
  signal,
}: {
  chatHistory: {
    text: string;
    role: "user" | "ai";
    attachments?: Attachment[];
  }[];
  onMessage: (msg: string) => Promise<void>;
  onStart: () => Promise<void>;
  onEnd: () => Promise<void>;
  onError: (error: unknown) => void;
  uid?: string;
  id?: string;
  signal?: AbortSignal;
}) => {
  try {
    let lock = 0;
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        history: chatHistory,
        uid,
        id,
      }),
      signal,
    });

    if (!response.ok) {
      console.error("Error:", response.statusText);
      onError(response.statusText);
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      console.error("Response body reader is null");
      onError("Response body reader is null");
      return;
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      chunk.split("\n").forEach(async (line) => {
        if (line.startsWith("data: ")) {
          try {
            if (!lock) {
              await onStart();
              lock = 1;
            }
            const parsedData = JSON.parse(line.replace("data: ", ""));
            await onMessage(parsedData.msg);
          } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            onError(parseError);
          }
        }
      });
    }
    await onEnd();
  } catch (error) {
    console.error("Streaming error:", error);
    onError(error);
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
  return markdown;
  // Ensure there's a space after markdown headers (e.g., `##Heading` -> `## Heading`)
  // .replace(/^(#{1,3})([^\s#])/gm, "$1 $2")
  // .replace(/^```|```$/g, "")
}

export async function getTitle(history: MessageType[]) {
  const res = await axios.post(`${API_URL}/api/chat/generate-title`, {
    history,
  });

  return res.data;
}

export async function uploadToStorage(file: File) {
  try {
    const user = auth.currentUser;

    if (!user) {
      console.error("User not authenticated");
      return null;
    }

    const storageRef = ref(storage, `uploads/${user.uid}/${file.name}`);

    const snapshot = await uploadBytes(storageRef, file);

    if (!snapshot.metadata) {
      console.error("Snapshot metadata is null");
      return null;
    }

    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
}
