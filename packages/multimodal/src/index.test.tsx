import { describe, expect, it } from "vitest";
import { VoiceChannel } from "./index";

describe("VoiceChannel", () => {
  it("reports that the experimental component is not implemented", () => {
    expect(() => VoiceChannel({})).toThrow(
      "VoiceChannel is experimental and is not implemented yet.",
    );
  });
});
