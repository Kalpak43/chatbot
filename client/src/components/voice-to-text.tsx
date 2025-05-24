import React, { useEffect, useRef } from "react";

// Define global types for SpeechRecognition
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

interface VoiceToTextProps {
  isListening: boolean;
  onListeningChange: (isListening: boolean) => void;
  onVoice: (text: string) => void;
  children: React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
}

const VoiceToText: React.FC<VoiceToTextProps> = ({
  isListening,
  onListeningChange,
  onVoice,
  children,
}) => {
  // Check if SpeechRecognition is available
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

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
      onListeningChange(false);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended.");
      onListeningChange(false); // Update state when recognition stops
    };

    recognitionRef.current = recognition; // Store in ref

    return () => {
      if (recognition) {
        recognition.stop(); // Cleanup on unmount
      }
    };
  }, []);

  // Start or stop recognition based on isListening prop
  useEffect(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        // Handle cases where recognition is already started
        console.error("Error starting recognition:", error);
      }
    } else {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Handle cases where recognition is already stopped
        console.error("Error stopping recognition:", error);
      }
    }
  }, [isListening]);

  // Toggle recognition
  const toggleListening = () => {
    onListeningChange(!isListening);
  };

  // Clone and pass the onClick handler to the child element
  return React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // Use type assertion to handle the typing issue
      return React.cloneElement(child as React.ReactElement<any>, {
        onClick: (e: React.MouseEvent) => {
          // Call the original onClick if it exists
          if (child.props.onClick) {
            child.props.onClick(e);
          }
          // Toggle listening state
          toggleListening();
        },
      });
    }
    return child;
  });
};

export default VoiceToText;
