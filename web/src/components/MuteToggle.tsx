import { Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { areSoundsMuted, saveSoundsMuted } from "../keySounds";
import "./MuteToggle.css";

export default function MuteToggle() {
  const [isMuted, setIsMuted] = useState(areSoundsMuted);

  function toggleMuted() {
    setIsMuted(!isMuted);
    saveSoundsMuted(!isMuted);
  }

  return (
    <button
      type="button"
      data-slot="toggle"
      className="mute-toggle"
      aria-label="Mute sounds"
      aria-pressed={isMuted}
      onClick={toggleMuted}
    >
      {isMuted ? <VolumeX /> : <Volume2 />}
    </button>
  );
}
