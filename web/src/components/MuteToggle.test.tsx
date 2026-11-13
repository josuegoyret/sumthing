import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { areSoundsMuted, saveSoundsMuted } from "../keySounds";
import MuteToggle from "./MuteToggle";

vi.mock("../keySounds", () => ({
  areSoundsMuted: vi.fn(() => false),
  saveSoundsMuted: vi.fn(),
}));

describe("MuteToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts with the saved choice", () => {
    vi.mocked(areSoundsMuted).mockReturnValueOnce(true);

    render(<MuteToggle />);

    expect(screen.getByRole("button", { name: "Mute sounds" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("mutes and unmutes the sounds", async () => {
    const user = userEvent.setup();
    render(<MuteToggle />);
    const toggle = screen.getByRole("button", { name: "Mute sounds" });

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(saveSoundsMuted).toHaveBeenLastCalledWith(true);

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(saveSoundsMuted).toHaveBeenLastCalledWith(false);
  });
});
