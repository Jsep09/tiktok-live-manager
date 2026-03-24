"use client";

import { useCallback, useEffect, useState } from "react";

export function useTTS() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  // Cached voice lookup by lang prefix
  const [thVoice, setThVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [enVoice, setEnVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.speechSynthesis) return;

    setIsSupported(true);

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);

      const en = available.find((v) => v.lang.startsWith("en")) ?? available[0] ?? null;
      const th = available.find((v) => v.lang.startsWith("th")) ?? en;
      setEnVoice(en);
      setThVoice(th);
      setSelectedVoice(en);
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) return;

      window.speechSynthesis.cancel();

      // Strip emoji and related invisible characters (ZWJ, variation selectors)
      const stripped = text.replace(
        /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]+/gu,
        ""
      );

      // Spell out digit sequences one digit at a time (e.g. "99" → "9 9")
      const processed = stripped.replace(/\d+/g, (m) => m.split("").join(" "));

      // Detect Thai characters (U+0E00–U+0E7F)
      const isThai = /[\u0E00-\u0E7F]/.test(processed);

      const utterance = new SpeechSynthesisUtterance(processed);
      if (isThai) {
        utterance.lang = "th-TH";
        if (thVoice && thVoice.lang.startsWith("th")) utterance.voice = thVoice;
        // else: let the browser pick the best available Thai voice
      } else {
        utterance.lang = enVoice?.lang ?? "en-US";
        if (enVoice) utterance.voice = enVoice;
      }
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, thVoice, enVoice]
  );

  return { speak, voices, selectedVoice, setSelectedVoice, isSupported };
}
