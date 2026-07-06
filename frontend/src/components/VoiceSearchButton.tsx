"use client";

import { useState } from "react";

type VoiceSearchButtonProps = {
  onTranscript: (transcript: string) => void;
};

export function VoiceSearchButton({ onTranscript }: VoiceSearchButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startListening() {
    setError(null);

    const SpeechRecognitionConstructor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setError("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionConstructor();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onerror = (event) => {
      setError(`Voice search error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setIsListening(true);
    recognition.start();
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={startListening}
        className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium hover:bg-neutral-900"
      >
        {isListening ? "Listening..." : "🎙 Voice Search"}
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}