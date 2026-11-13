import { useRef, useState } from "react";
import type { CalculatorClient, Dictation } from "../calculatorClient";
import { UNREACHABLE_MESSAGE } from "../calculatorState";
import { type Recording, startRecording } from "../microphone";

export const MAX_RECORDING_MS = 15000;
const BANNER_MS = 3000;
const TICK_MS = 250;
const MICROPHONE_MESSAGE = "Allow the microphone to dictate.";

export type DictationStatus = "idle" | "starting" | "recording" | "processing";

export type Banner =
  | { kind: "listening" }
  | { kind: "transcript"; text: string }
  | { kind: "error"; message: string; isSticky: boolean };

type DictationOptions = {
  client: CalculatorClient;
  screen: string;
  onDictated: (dictation: Dictation) => void;
};

function closesByItself(banner: Banner) {
  return (
    banner.kind === "transcript" ||
    (banner.kind === "error" && !banner.isSticky)
  );
}

export function useDictation({ client, screen, onDictated }: DictationOptions) {
  const [status, setStatus] = useState<DictationStatus>("idle");
  const [level, setLevel] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [banner, setBanner] = useState<Banner>({ kind: "listening" });
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const recording = useRef<Recording | null>(null);
  const tick = useRef<ReturnType<typeof setInterval>>(undefined);
  const bannerTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  function closeBanner() {
    clearTimeout(bannerTimeout.current);
    setIsBannerOpen(false);
  }

  function openBanner(next: Banner) {
    clearTimeout(bannerTimeout.current);
    setBanner(next);
    setIsBannerOpen(true);
    if (closesByItself(next)) {
      bannerTimeout.current = setTimeout(closeBanner, BANNER_MS);
    }
  }

  function endRecording() {
    const current = recording.current;
    recording.current = null;
    clearInterval(tick.current);
    setLevel(0);
    return current;
  }

  async function stop() {
    const current = endRecording();
    if (current === null) return;
    setStatus("processing");
    closeBanner();
    const outcome = await client.dictate(await current.stop(), screen);
    setStatus("idle");
    if (outcome.kind === "result") {
      onDictated(outcome);
      openBanner({ kind: "transcript", text: outcome.transcript });
      return;
    }
    const message =
      outcome.kind === "unreachable" ? UNREACHABLE_MESSAGE : outcome.message;
    openBanner({ kind: "error", message, isSticky: false });
  }

  async function start() {
    setStatus("starting");
    try {
      recording.current = await startRecording(setLevel);
    } catch {
      setStatus("idle");
      openBanner({
        kind: "error",
        message: MICROPHONE_MESSAGE,
        isSticky: true,
      });
      return;
    }
    const startedAt = Date.now();
    setElapsedMs(0);
    setStatus("recording");
    openBanner({ kind: "listening" });
    tick.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setElapsedMs(Math.min(elapsed, MAX_RECORDING_MS));
      if (elapsed >= MAX_RECORDING_MS) stop();
    }, TICK_MS);
  }

  function cancel() {
    endRecording()?.cancel();
    setStatus("idle");
    closeBanner();
  }

  function toggle() {
    if (status === "idle") start();
    if (status === "recording") stop();
  }

  function dismissBanner() {
    if (status === "recording") {
      cancel();
      return;
    }
    closeBanner();
  }

  return {
    status,
    level,
    elapsedMs,
    banner,
    isBannerOpen,
    toggle,
    dismissBanner,
  };
}
