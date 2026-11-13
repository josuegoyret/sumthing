import { X } from "lucide-react";
import { type Banner, MAX_RECORDING_MS } from "../hooks/useDictation";
import "./DictationBanner.css";

const MS_PER_SECOND = 1000;
const SECONDS_WIDTH = 2;

type DictationBannerProps = {
  banner: Banner;
  isOpen: boolean;
  elapsedMs: number;
  onDismiss: () => void;
};

function clockOf(ms: number) {
  const seconds = Math.floor(ms / MS_PER_SECOND);
  return `0:${String(seconds).padStart(SECONDS_WIDTH, "0")}`;
}

function textOf(banner: Banner, elapsedMs: number) {
  switch (banner.kind) {
    case "listening":
      return `Listening ${clockOf(elapsedMs)} / ${clockOf(MAX_RECORDING_MS)}`;
    case "transcript":
      return `“${banner.text}”`;
    case "error":
      return banner.message;
    default:
      return banner satisfies never;
  }
}

export default function DictationBanner({
  banner,
  isOpen,
  elapsedMs,
  onDismiss,
}: DictationBannerProps) {
  return (
    <div
      className="dictation-banner"
      data-kind={banner.kind}
      hidden={!isOpen}
      role={banner.kind === "error" ? "alert" : undefined}
    >
      <span className="dictation-banner-dot" aria-hidden="true" />
      <p className="dictation-banner-text">{textOf(banner, elapsedMs)}</p>
      <button
        type="button"
        className="dictation-banner-close"
        aria-label={banner.kind === "listening" ? "Cancel dictation" : "Close"}
        onClick={onDismiss}
      >
        <X />
      </button>
    </div>
  );
}
