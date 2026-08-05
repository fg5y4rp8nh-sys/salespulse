"use client";

import { useEffect, useState } from "react";

// Эффект «печатающегося» текста с мигающим курсором.
export function TypeIn({
  text,
  className = "",
  speed = 38,
}: {
  text: string;
  className?: string;
  speed?: number;
}) {
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Уважаем системную настройку «уменьшить движение».
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(text.length);
      setDone(true);
      return;
    }
    setShown(0);
    setDone(false);
    const id = setInterval(() => {
      setShown((n) => {
        if (n >= text.length) {
          clearInterval(id);
          setDone(true);
          return n;
        }
        return n + 1;
      });
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <span className={className}>
      {/* Невидимая копия держит высоту блока — текст не «прыгает». */}
      <span className="invisible block h-0 overflow-hidden" aria-hidden="true">
        {text}
      </span>
      <span aria-label={text}>{text.slice(0, shown)}</span>
      <span className={`type-caret ${done ? "type-caret-done" : ""}`} aria-hidden="true" />
    </span>
  );
}
