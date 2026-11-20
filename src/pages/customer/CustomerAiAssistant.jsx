import { useContext, useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Gauge,
  MessagesSquare,
  Plus,
  Search,
  SendHorizonal,
  Sparkles,
  Ticket,
  UserRoundSearch,
} from "lucide-react";
import GradientButton from "@/components/ui/Button/GradientButton";
import CardWithBlurBlob from "@/components/ui/Card/CardWithBlurBlob";
import SoftIconCard from "@/components/ui/Card/SoftIconCard";
import { toast } from "react-toastify";
import { AuthContext } from "@/providers/AuthProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatRelativeDate } from "@/lib/formatRelativeDate";
import GradientIconCard from "@/components/ui/Card/GradientIconCard";
import GradientCard from "@/components/ui/Card/GradientCard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const customerSuggestions = [
  {
    icon: Ticket,
    title: "Check my support ticket",
    subtitle: "Get status, priority, and next steps",
  },
  {
    icon: UserRoundSearch,
    title: "I can’t log in to my account",
    subtitle: "Find common login problems and fixes",
  },
  {
    icon: Gauge,
    title: "My dashboard is not loading",
    subtitle: "Troubleshoot loading or performance issues",
  },
  {
    icon: Sparkles,
    title: "Help me explain my issue",
    subtitle: "Write a clear message for support",
  },
  {
    icon: MessagesSquare,
    title: "Summarize my conversation",
    subtitle: "Understand what happened and what to do next",
  },
  {
    icon: Ticket,
    title: "I need help with billing",
    subtitle: "Explain invoice, payment, or charge issues",
  },
  {
    icon: UserRoundSearch,
    title: "Update my account information",
    subtitle: "Get guidance for profile or account changes",
  },
  {
    icon: Gauge,
    title: "Something is not working",
    subtitle: "Diagnose errors and possible solutions",
  },
  {
    icon: Sparkles,
    title: "Create a support request",
    subtitle: "Generate a professional support message",
  },
  {
    icon: MessagesSquare,
    title: "Understand the support reply",
    subtitle: "Explain the response in simple language",
  },
];

const CustomerAiAssistant = () => {
  const { user } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  const [isAiTyping, setIsAiTyping] = useState(false);
  const [pendingMessages, setPendingMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const sendingRef = useRef(false);
  const queryClient = useQueryClient();

  const [suggestions] = useState(() =>
    [...customerSuggestions].sort(() => Math.random() - 0.5).slice(0, 4),
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  // =========================
  // GET CONVERSATION HISTORY
  // =========================
  const {
    data: conversations = [],
    isLoading: listLoading,
    isError: listError,
    error: listErrorInfo,
    refetch: refetchList,
  } = useQuery({
    queryKey: ["ai-conversations", user?.uid, debouncedSearch],
    enabled: !!user,
    queryFn: async () => {
      const token = await user.getIdToken();
      const params = new URLSearchParams({ search: debouncedSearch });
      const res = await fetch(
        `https://support-hub-server.vercel.app/ai/conversations?${params.toString()}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch conversations");
      }
      return result.data;
    },
  });

  // =================================
  // GET MESSAGES FOR ACTIVE CHAT
  // =================================
  const {
    data: messages = [],
    isLoading: messagesLoading,
    isError: messagesError,
    error: messagesErrorInfo,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ["conversation-messages", user?.uid, conversationId],
    enabled: !!user && !!conversationId,
    queryFn: async () => {
      const token = await user.getIdToken();
      const res = await fetch(
        `https://support-hub-server.vercel.app/ai/conversations/${conversationId}/messages`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch messages");
      }
      return result.data;
    },
  });

  const visibleMessages = [...messages, ...pendingMessages];

  // Auto-scroll to bottom when messages change or AI is typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages.length, isAiTyping]);

  // ++++++++++++++++++++++++++++++++++++++++++++++++
  // SEND MESSAGE TO AI
  // ++++++++++++++++++++++++++++++++++++++++++++++++
  const handleSend = async () => {
    const text = message.trim();

    if (!text || isAiTyping || sendingRef.current) return;

    sendingRef.current = true;

    const tempUserId = `temp-user-${Date.now()}`;

    const userTempMessage = {
      _id: tempUserId,
      sender: "user",
      message: text,
      createdAt: new Date().toISOString(),
      temp: true,
    };

    const currentConversationId = conversationId;

    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsAiTyping(true);

    // Show user message immediately
    setPendingMessages((prev) => [...prev, userTempMessage]);

    try {
      const token = await user.getIdToken();
      const res = await fetch("https://support-hub-server.vercel.app/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: text,
          conversationId: currentConversationId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "AI chat failed");
      }

      const newId = data.conversationId;
      const savedUserMessage = data.messages.user;
      const savedAiMessage = data.messages.ai;

      setConversationId(newId);
      setActiveChat(newId);

      queryClient.setQueryData(
        ["conversation-messages", user?.uid, newId],
        (old = []) => {
          const oldMessages = Array.isArray(old) ? old : [];
          return [...oldMessages, savedUserMessage, savedAiMessage];
        },
      );

      // Remove temp message after real DB messages are cached
      setPendingMessages((prev) => prev.filter((m) => m._id !== tempUserId));
      refetchList();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
      console.error(err);

      // Mark failed temp message so user sees the error indicator
      setPendingMessages((prev) =>
        prev.map((m) => (m._id === tempUserId ? { ...m, error: true } : m)),
      );
    } finally {
      sendingRef.current = false;
      setIsAiTyping(false);
    }
  };

  // ====================
  const handleInput = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    const maxHeight = 96; // approx 4 lines
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";
  };

  const handleCopy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Copied to clipboard", { autoClose: 1500 });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy text");
    }
  };

  const handleNewChat = () => {
    if (sendingRef.current) {
      toast.info("Please finish the current AI response first.");
      return;
    }

    setConversationId(null);
    setActiveChat(null);
    setPendingMessages([]);
    setMessage("");
    setIsAiTyping(false);
    setOpen(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // =============================================
  return (
    <CardWithBlurBlob
      className="m-4 flex h-[88svh] flex-col p-0 lg:m-5"
      interactive={false}
    >
      {/* header */}
      <div className="flex justify-between border-b border-base-content/15 px-5 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SoftIconCard
            icon={Sparkles}
            variant="primary"
            className="shrink-0"
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <h3 className="truncate font-semibold">AI Assistant</h3>

            <p className="truncate text-xs text-base-content/60">
              Real-time AI Support &amp; Insights
            </p>
          </div>

          <GradientButton
            className="md:hidden"
            size="sm"
            buttonClassName="from-primary/10 to-secondary/15 text-base-content/80"
            onClick={() => setOpen((p) => !p)}
          >
            <MessagesSquare size={15} />
            {open ? "Chat" : "History"}
          </GradientButton>
        </div>
      </div>

      {/* body */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left Sidebar: Conversation History */}
        <div
          className={`
            flex flex-col overflow-hidden border-r border-base-content/15
            transition-all duration-300 ease-in-out
            ${
              open
                ? "w-full opacity-100 md:w-5/12 lg:w-3/12"
                : "w-0 opacity-0 md:w-4/12 md:opacity-100 lg:w-3/12"
            }
          `}
        >
          <div className="flex px-5 py-3">
            <div className="flex w-full items-center justify-between gap-2">
              <div className="flex min-w-0 items-center justify-center gap-3">
                <MessagesSquare size={16} className="shrink-0" />
                <h3 className="truncate font-semibold">History</h3>
              </div>

              <GradientButton
                size="sm"
                disabled={listLoading || isAiTyping}
                onClick={handleNewChat}
                buttonClassName={`${listLoading ? "from-primary/10 to-secondary/20" : ""}`}
              >
                <Plus size={16} />
                New Chat
              </GradientButton>
            </div>
          </div>

          {/* search */}
          <div className="relative mx-5 my-2">
            <Search
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="h-9 w-full rounded-xl border border-base-content/10 bg-base-100 pl-11 pr-4 text-sm outline-none transition focus:border-primary/40 focus:ring-3 focus:ring-primary/10"
            />
          </div>

          {listLoading ? (
            <div className="mx-5 my-3 flex-1 space-y-2">
              <div className="skeleton h-13 w-full rounded-xl" />
              <div className="skeleton h-13 w-full rounded-xl" />
              <div className="skeleton h-13 w-full rounded-xl" />
              <div className="skeleton h-13 w-full rounded-xl" />
              <div className="skeleton h-13 w-full rounded-xl" />
            </div>
          ) : listError ? (
            <div className="p-5 text-center">
              <p className="text-sm text-error">
                {listErrorInfo?.message || "Failed to load conversations."}
              </p>

              <button
                type="button"
                onClick={() => refetchList()}
                className="btn btn-sm btn-outline mt-3"
              >
                Retry
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <div className="max-w-xs text-center">
                <SoftIconCard
                  icon={MessagesSquare}
                  variant="slate"
                  className="mx-auto mb-4"
                />

                <h3 className="mb-2 text-base font-semibold">
                  {debouncedSearch
                    ? "No matching chats"
                    : "No conversations yet"}
                </h3>

                <p className="max-w-[300px] text-sm text-base-content/60">
                  {debouncedSearch
                    ? "Try a different keyword or clear the search filter."
                    : "Start a new chat to get AI-powered support, insights, and ticket assistance."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
              {conversations.map((item) => (
                <CardWithBlurBlob
                  key={item._id}
                  onClick={() => {
                    if (sendingRef.current) {
                      toast.info(
                        "Please finish the current AI response first.",
                      );
                      return;
                    }

                    if (activeChat !== item._id) {
                      setPendingMessages([]);
                      setActiveChat(item._id);
                      setConversationId(item._id);
                    }

                    setOpen(false);
                  }}
                  interactive={false}
                  blobClassName="bg-transparent"
                  blobHoverColor="group-hover:none"
                  className={`cursor-pointer rounded-xl border-none px-3 py-2 transition hover:bg-base-300 ${
                    activeChat === item._id
                      ? "bg-gradient-to-r from-primary/10 to-secondary/10"
                      : ""
                  }`}
                >
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-medium">
                        {item?.preview || "New Conversation"}
                      </h4>

                      <p className="truncate text-xs text-base-content/60">
                        {item?.details || "No messages yet"}
                      </p>
                    </div>

                    <span className="shrink-0 text-[10px] text-base-content/40">
                      {formatRelativeDate(item?.updatedAt)}
                    </span>
                  </div>
                </CardWithBlurBlob>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Chat Area */}
        <div
          className={`
            mx-auto flex min-h-0 flex-col overflow-hidden px-5 pb-3 pt-5
            transition-all duration-300 ease-in-out
            ${open ? "w-0 opacity-0 md:w-7/12 md:opacity-100 lg:w-9/12" : "w-full opacity-100 md:w-8/12 lg:w-9/12"}
          `}
        >
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-5 pr-1">
              {messagesLoading && visibleMessages.length === 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-start gap-5">
                    <GradientIconCard
                      icon={Sparkles}
                      variant="primary"
                      className="shrink-0"
                    />

                    <div className="w-full max-w-[70%] space-y-2">
                      <span className="skeleton block h-4 w-9/12" />
                      <span className="skeleton block h-4 w-11/12" />
                      <span className="skeleton block h-4 w-7/12" />
                    </div>
                  </div>
                </div>
              ) : messagesError ? (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <p className="text-sm text-error">
                    {messagesErrorInfo?.message || "Failed to load messages."}
                  </p>

                  <button
                    type="button"
                    onClick={() => refetchMessages()}
                    className="btn btn-sm btn-outline mt-3"
                  >
                    Retry
                  </button>
                </div>
              ) : visibleMessages.length > 0 ? (
                <div className="mx-auto w-full max-w-4xl space-y-5">
                  {visibleMessages.map((item) =>
                    item.sender === "user" ? (
                      <div key={item._id} className="flex w-full justify-end">
                        <div className="max-w-[80%]">
                          <GradientCard className="whitespace-pre-wrap from-primary/20 to-secondary/20 px-5 py-3 text-sm leading-relaxed text-base-content">
                            {item.message}
                          </GradientCard>

                          {item.error && (
                            <p className="mt-1 text-right text-xs text-error">
                              Message failed to send
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        key={item._id}
                        className="flex w-full justify-start gap-4"
                      >
                        <GradientIconCard
                          icon={Sparkles}
                          variant="primary"
                          className="shrink-0"
                        />

                        <div className="min-w-0 max-w-[85%]">
                          <div className="wrap-break-word rounded-2xl text-sm leading-relaxed">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => (
                                  <p className="mb-2 last:mb-0">{children}</p>
                                ),
                                strong: ({ children }) => (
                                  <strong className="font-semibold">
                                    {children}
                                  </strong>
                                ),
                                ul: ({ children }) => (
                                  <ul className="my-2 list-disc space-y-1 pl-5">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="my-2 list-decimal space-y-1 pl-5">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => (
                                  <li className="pl-1">{children}</li>
                                ),
                                code: ({ children }) => (
                                  <code className="rounded bg-base-content/10 px-1.5 py-0.5 text-xs">
                                    {children}
                                  </code>
                                ),
                              }}
                            >
                              {item.message || ""}
                            </ReactMarkdown>
                          </div>

                          {item.message && (
                            <div className="mt-3 flex gap-4 text-xs text-base-content/50">
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopy(item._id, item.message)
                                }
                                className="flex items-center gap-1 transition hover:text-primary"
                              >
                                {copiedId === item._id ? (
                                  <>
                                    <Check size={14} className="text-success" />
                                    <span className="text-success">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={14} />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  )}

                  {isAiTyping && (
                    <div className="flex items-center justify-start gap-3">
                      <GradientIconCard
                        icon={Sparkles}
                        variant="primary"
                        className="shrink-0"
                      />

                      <div className="space-y-2">
                        <span className="skeleton skeleton-text text-sm">
                          Generating a helpful response...
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex min-h-full w-full flex-col items-center justify-center px-4">
                  <GradientIconCard
                    icon={Sparkles}
                    variant="primary"
                    className="mb-4 h-11 w-11 shrink-0"
                  />

                  <h2 className="mb-3 text-center text-3xl font-bold">
                    How can I help today?
                  </h2>

                  <p className="mb-8 max-w-xl text-center text-sm text-base-content/60">
                    Ask questions, troubleshoot issues, analyze tickets, and get
                    instant support guidance.
                  </p>

                  <div className="grid w-full max-w-3xl gap-3 md:grid-cols-2">
                    {suggestions.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setMessage(`${item.title}: ${item.subtitle}`);
                          textareaRef.current?.focus();
                        }}
                        className="cursor-pointer rounded-2xl border border-base-content/10 px-5 py-4 transition hover:bg-base-200"
                      >
                        <div className="flex items-start gap-4">
                          <item.icon size={18} className="mt-1 text-primary" />

                          <div>
                            <h4 className="text-sm font-medium">
                              {item.title}
                            </h4>
                            <p className="mt-1 text-xs text-base-content/60">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Box */}
          <div className="mx-auto w-full max-w-4xl border-t border-base-content/10 pt-2">
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-base-content/10 bg-primary/2 py-3 pl-4 pr-3">
              <Sparkles size={18} className="shrink-0 text-primary" />

              <textarea
                ref={textareaRef}
                rows={1}
                onInput={handleInput}
                value={message}
                disabled={isAiTyping}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask anything about your issue..."
                className="max-h-24 flex-1 resize-none bg-transparent text-sm outline-none overflow-y-auto"
              />

              <div className="flex self-end">
                <GradientButton
                  onClick={handleSend}
                  disabled={isAiTyping || !message.trim()}
                  size="sm"
                  buttonClassName={`h-8 w-8 p-1 ${
                    isAiTyping || !message.trim()
                      ? "from-primary/10 to-secondary/20 opacity-60 cursor-not-allowed"
                      : "from-primary to-secondary text-white"
                  }`}
                >
                  <SendHorizonal size={16} />
                </GradientButton>
              </div>
            </div>

            <p className="mt-2 text-center text-xs text-base-content/40">
              AI may produce inaccurate information. Press Enter to send.
            </p>
          </div>
        </div>
      </div>
    </CardWithBlurBlob>
  );
};

export default CustomerAiAssistant;
