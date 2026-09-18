import { describe, it, expect } from "vitest";
import { validateChatMessage } from "../../src/app/features/chat-calls/services/chatModerationService";

describe("chatModerationService", () => {
  it("allows standard, clean messages", () => {
    const result = validateChatMessage("Good morning team, let's proceed with the task review.");
    expect(result.isValid).toBe(true);
    expect(result.reason).toBeUndefined();
    expect(result.sanitizedText).toBe("Good morning team, let's proceed with the task review.");
  });

  it("flags and sanitizes English profanity", () => {
    const result = validateChatMessage("This is total bullshit and fuck this");
    expect(result.isValid).toBe(false);
    expect(result.reason).toBeDefined();
    expect(result.sanitizedText).toContain("****");
  });

  it("flags Tagalog profanity", () => {
    const result = validateChatMessage("Wag kang gago pre, tapusin mo yan");
    expect(result.isValid).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it("flags Cebuano/Bisaya profanity", () => {
    const result = validateChatMessage("Peste yawa gyud kaayo ni");
    expect(result.isValid).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it("detects leetspeak and elongated words", () => {
    const result = validateChatMessage("yaaaawa man diay ni");
    expect(result.isValid).toBe(false);
  });

  it("enforces maximum 1000 character limit", () => {
    const longMessage = "a".repeat(1005);
    const result = validateChatMessage(longMessage);
    expect(result.isValid).toBe(false);
    expect(result.reason).toContain("1,000-character limit");
  });
});
