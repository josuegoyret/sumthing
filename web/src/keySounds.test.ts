import { Howler } from "howler";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("howler", () => ({
  Howl: vi.fn(function () {
    return { play: vi.fn() };
  }),
  Howler: { mute: vi.fn() },
}));

const MUTED_STORAGE_KEY = "sumthing:muted";

async function loadKeySounds() {
  vi.resetModules();
  return import("./keySounds");
}

describe("keySounds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("starts with sound on", async () => {
    const { areSoundsMuted } = await loadKeySounds();

    expect(areSoundsMuted()).toBe(false);
    expect(Howler.mute).toHaveBeenCalledWith(false);
  });

  it("restores a saved mute when it loads", async () => {
    localStorage.setItem(MUTED_STORAGE_KEY, "true");

    const { areSoundsMuted } = await loadKeySounds();

    expect(areSoundsMuted()).toBe(true);
    expect(Howler.mute).toHaveBeenCalledWith(true);
  });

  it("mutes the sounds and saves the choice", async () => {
    const { areSoundsMuted, saveSoundsMuted } = await loadKeySounds();

    saveSoundsMuted(true);

    expect(Howler.mute).toHaveBeenLastCalledWith(true);
    expect(areSoundsMuted()).toBe(true);
  });
});
