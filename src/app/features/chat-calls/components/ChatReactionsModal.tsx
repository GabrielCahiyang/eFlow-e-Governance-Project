import { Modal, ModalBasicLayout, ModalContent, ModalHeader, Tab, TabList, TabsContext, Text } from "@vibe/core";
import { useChatDrawer } from "./ChatDrawerContext";

export function ChatReactionsModal() {
  const {
    reactionsModalContent,
    setReactionsModalContent,
    activeReactionTab,
    setActiveReactionTab,
  } = useChatDrawer();

  if (!reactionsModalContent) return null;

  const emojiEntries = Object.entries(reactionsModalContent.byEmoji).filter(
    ([, users]) => (users as string[]).length > 0,
  );
  const tabIds = ["all", ...emojiEntries.map(([emoji]) => emoji)];
  const visibleReactions = activeReactionTab === "all"
    ? reactionsModalContent.all
    : reactionsModalContent.all.filter((item: any) => item.emoji === activeReactionTab);

  return (
    <Modal
      closeButtonAriaLabel="Close message reactions"
      id="chat-message-reactions"
      onClose={() => setReactionsModalContent(null)}
      show
      size="small"
      useFixedPosition
    >
      <ModalBasicLayout>
        <ModalHeader title="Message reactions" />
        <ModalContent className="flex max-h-[420px] flex-col gap-4">
          <div className="max-w-full overflow-x-auto">
            <TabsContext activeTabId={Math.max(0, tabIds.indexOf(activeReactionTab))} id="message-reaction-tabs">
              <TabList id="message-reaction-tab-list">
                {tabIds.map((tabId) => {
                  const count = tabId === "all"
                    ? reactionsModalContent.all.length
                    : (reactionsModalContent.byEmoji[tabId] as string[]).length;
                  return (
                    <Tab key={tabId} id={`reaction-${tabId}`} active={activeReactionTab === tabId} onClick={() => setActiveReactionTab(tabId)}>
                      <span>{tabId === "all" ? "All" : <span aria-hidden="true">{tabId}</span>} <span className="tabular-nums">{count}</span></span>
                    </Tab>
                  );
                })}
              </TabList>
            </TabsContext>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto" aria-live="polite">
            {visibleReactions.map((item: any) => {
              const initials = item.name
                .split(" ")
                .map((part: string) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "?";
              return (
                <div key={`${item.name}-${item.emoji}`} className="flex items-center justify-between rounded-xl border border-neutral-100 px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-semibold text-white">{initials}</span>
                    <Text className="truncate text-neutral-900" type="text2" weight="medium">{item.name}</Text>
                  </div>
                  <span className="text-[18px]" aria-label={`Reacted with ${item.emoji}`}>{item.emoji}</span>
                </div>
              );
            })}
          </div>
        </ModalContent>
      </ModalBasicLayout>
    </Modal>
  );
}
