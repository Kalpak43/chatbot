import { Mic, MicOff } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

const VoiceToText: React.FC<{
  onVoice: (text: string) => void;
}> = ({ onVoice }) => {
  // Check if SpeechRecognition is available
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<typeof SpeechRecognition | null>(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      console.error("Web Speech API is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening
    recognition.interimResults = true; // Show interim results
    recognition.lang = "en-US"; // Set language

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interimTranscript += event.results[i][0].transcript + " ";
        }
      }

      if (finalTranscript.trim()) {
        onVoice(finalTranscript.trim()); // Pass final result to parent component
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended.");
      setIsListening(false); // Update state when recognition stops
    };

    recognitionRef.current = recognition; // Store in ref

    return () => {
      recognition.stop(); // Cleanup on unmount
    };
  }, []);

  // Start recognition
  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Stop Listening
  const stopListening = () => {
    if (recognitionRef.current) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  return (
    <button
      type="button"
      onClick={isListening ? stopListening : startListening}
      className="btn btn-soft btn-primary btn-sm max-md:order-2"
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
};

export default VoiceToText;
