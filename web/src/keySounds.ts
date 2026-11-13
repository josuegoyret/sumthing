import { Howl, Howler } from "howler";

const CLICK_VOLUME = 0.3;
const PING_VOLUME = 0.5;
const MUTED_STORAGE_KEY = "sumthing:muted";
const MUTED = "true";

const click = new Howl({
  src: ["/sounds/click.ogg", "/sounds/click.mp3"],
  volume: CLICK_VOLUME,
});

const ping = new Howl({
  src: ["/sounds/ping.ogg", "/sounds/ping.mp3"],
  volume: PING_VOLUME,
});

Howler.mute(areSoundsMuted());

export function areSoundsMuted() {
  return localStorage.getItem(MUTED_STORAGE_KEY) === MUTED;
}

export function playClick() {
  click.play();
}

export function playPing() {
  ping.play();
}

export function saveSoundsMuted(isMuted: boolean) {
  Howler.mute(isMuted);
  localStorage.setItem(MUTED_STORAGE_KEY, String(isMuted));
}
