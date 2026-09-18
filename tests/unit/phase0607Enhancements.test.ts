import { describe, it, expect } from "vitest";
import { validateChatMessage } from "../../src/app/features/chat-calls/services/chatModerationService";
import { DELIVERY_STAGE_LABELS } from "../../src/app/features/interdepartment-collaboration/components/CommittedProposalDeliveryPanel";

describe("Phase 6 & 7 System Enhancements", () => {
  describe("Phase 6: Chat Content Moderation", () => {
    it("validates permissible official chat communications", () => {
      const res = validateChatMessage("Please review the latest project milestone delivery by end of day.");
      expect(res.isValid).toBe(true);
      expect(res.reason).toBeUndefined();
    });

    it("intercepts and sanitizes English profanity and harassment", () => {
      const res = validateChatMessage("This is bullshit, do not fuck this up.");
      expect(res.isValid).toBe(false);
      expect(res.reason).toBeDefined();
      expect(res.sanitizedText).toContain("****");
    });

    it("intercepts Tagalog profanity and slurs", () => {
      const res = validateChatMessage("Huwag kang gago, ayusin mo yan.");
      expect(res.isValid).toBe(false);
      expect(res.reason).toBeDefined();
    });

    it("intercepts Cebuano/Bisaya profanity and slurs", () => {
      const res = validateChatMessage("Yawa gyud, piste kaayo.");
      expect(res.isValid).toBe(false);
      expect(res.reason).toBeDefined();
    });

    it("enforces strict maximum 1,000 character length restriction", () => {
      const overlyLongText = "A".repeat(1001);
      const res = validateChatMessage(overlyLongText);
      expect(res.isValid).toBe(false);
      expect(res.reason).toContain("1,000-character limit");
    });
  });

  describe("Phase 7: Delivery Stage & Archive Labels", () => {
    it("provides the expected delivery labels for stages including archived", () => {
      expect(DELIVERY_STAGE_LABELS.ready_to_archive).toBe("Ready to archive");
      expect(DELIVERY_STAGE_LABELS.archived).toBe("Delivery archived");
    });
  });
});
