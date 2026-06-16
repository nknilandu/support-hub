import { useContext, useState } from "react";
import {
  Copy,
  Gauge,
  MessagesSquare,
  Paperclip,
  Plus,
  RefreshCcw,
  Search,
  SendHorizonal,
  Sparkles,
  Ticket,
  UserRoundSearch,
} from "lucide-react";
import GradientButton from "../../components/ui/Button/GradientButton";
import CardWithBlurBlob from "../../components/ui/Card/CardWithBlurBlob";
import SoftIconCard from "../../components/ui/Card/SoftIconCard";
import { toast } from "react-toastify";
import { AuthContext } from "../../app/providers/AuthProvider";

const CustomerAiAssistant = () => {
  const [open, setOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(1);
  const [listLoading, setListLoading] = useState(true);
  const [message, setMessage] = useState("");

  const { loading, user } = useContext(AuthContext);

  // =============
  const suggestions = [
    {
      icon: Ticket,
      title: "Analyze my support ticket",
      subtitle: "Summarize root cause and next steps",
    },
    {
      icon: UserRoundSearch,
      title: "Help me troubleshoot a login issue",
      subtitle: "Walk me through diagnostics",
    },
    {
      icon: Gauge,
      title: "Why is my dashboard not loading?",
      subtitle: "Common causes and quick fixes",
    },
    {
      icon: Sparkles,
      title: "Suggest a solution for a customer problem",
      subtitle: "Draft a reply based on context",
    },
  ];

  // =============
  const conversations = [
    {
      id: 1,
      title: "Billing invoice missing line items",
      preview: "Can you help me verify the latest invoice?",
      date: "Today",
      active: true,
    },
    {
      id: 2,
      title: "Login issue after password reset",
      preview: "I can access email but not dashboard.",
      date: "Today",
    },
    {
      id: 3,
      title: "Export ticket report",
      preview: "Need CSV export for last month tickets.",
      date: "Yesterday",
    },
    {
      id: 4,
      title: "Email notification not received",
      preview: "Users are not getting ticket updates.",
      date: "2 days ago",
    },
    {
      id: 5,
      title: "API authentication error",
      preview: "Bearer token returns unauthorized.",
      date: "Last week",
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "user",
      text: "My latest invoice is missing seat upgrades.",
      time: "01:13 PM",
    },
    {
      id: 2,
      sender: "ai",
      text: "I can help you with that. Please provide invoice number.",
      time: "02:13 PM",
    },
  ];

  // ====================
  const handleInput = (e) => {
    const textarea = e.target;

    textarea.style.height = "auto";

    const maxHeight = 72; // approx 3 lines
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";
  };

  // ++++++++++++++++++++++++++++++++++++++++++++++++
  const handleSend = async () => {
    if (!message.trim()) return;

    fetch("http://localhost:3021/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.accessToken}`,
      },
      body: JSON.stringify({
        message,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          throw new Error(data.message || "Ticket analysis failed");
        }
        console.log(data);
      })
      .catch((err) => {
        toast.error(err.message || "Something went wrong");
        console.error(err);
      })
      .finally(() => {});
  };

  // ======================================

  return (
    <CardWithBlurBlob
      className="m-5 p-0 h-[88svh] flex flex-col"
      interactive={false}
    >
      {/* header */}
      <div className="border-b border-base-content/15 px-5 py-3 flex justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <SoftIconCard
            icon={Sparkles}
            variant="primary"
            className="shrink-0"
          />

          <div className="flex flex-col min-w-0 flex-1">
            <h3 className="font-semibold truncate">AI Assistant</h3>

            <p className="text-base-content/60 text-xs truncate">
              Real-time AI Support & Insights
            </p>
          </div>

          <GradientButton
            className="md:hidden"
            size="sm"
            buttonClassName="from-primary/10 to-secondary/15 text-base-content/80"
            onClick={() => setOpen((p) => !p)}
          >
            <MessagesSquare size={15} />
            chat
          </GradientButton>
        </div>
      </div>

      {/* body */}
      <div className="flex flex-1 overflow-hidden">
        {/* ss1 */}
        <div
          className={`
    border-r border-base-content/15
    overflow-hidden
    flex flex-col
    transition-all duration-300 ease-in-out

    ${
      open
        ? "w-full md:w-5/12 lg:w-3/12 opacity-100"
        : "w-0 opacity-0 md:w-4/12 lg:w-3/12 md:opacity-100"
    }
  `}
        >
          <div className="flex px-5 py-3 ">
            <div className="w-full flex justify-between items-center gap-2">
              <div className="flex justify-center items-center gap-3 min-w-0">
                <MessagesSquare size={16} className="shrink-0" />
                <h3 className="font-semibold truncate">Conversations</h3>
              </div>

              <GradientButton
                size="sm"
                disabled={listLoading}
                buttonClassName={`${listLoading && "from-primary/10 to-secondary/20"}`}
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
              className="
      absolute
      left-4
      top-1/2
      -translate-y-1/2
      text-base-content/40
      pointer-events-none
    "
            />
            <input
              type="text"
              disabled={listLoading}
              // value={search}
              // onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="
      w-full
      h-9
      rounded-xl
      border border-base-content/10
      bg-base-100
      pl-11
      pr-4
      text-sm
      outline-none
      transition
      focus:border-primary/40
      focus:ring-3
      focus:ring-primary/10
    "
            />
          </div>

          {listLoading ? (
            <div className="flex-1 mx-5 my-3 space-y-2">
              <div className="skeleton h-13 w-full rounded-xl" />
              <div className="skeleton h-13 w-full rounded-xl" />
              <div className="skeleton h-13 w-full rounded-xl" />
              <div className="skeleton h-13 w-full rounded-xl" />
              <div className="skeleton h-13 w-full rounded-xl" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="max-w-xs text-center">
                <SoftIconCard
                  icon={MessagesSquare}
                  variant="slate"
                  className="mx-auto mb-4"
                />

                <h3 className="font-semibold text-base mb-2">
                  No conversations yet
                </h3>

                <p className="text-sm text-base-content/60 max-w-[300px]">
                  Start a new chat to get AI-powered support, insights, and
                  ticket assistance.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
              {conversations.map((item) => (
                <CardWithBlurBlob
                  key={item.id}
                  onClick={() => setActiveChat(item.id)}
                  interactive={false}
                  blobClassName="bg-transparent"
                  blobHoverColor="group-hover:none"
                  className={`
       rounded-xl px-3 py-2 transition hover:bg-base-300 border-none
      ${activeChat === item.id && "bg-gradient-to-r from-primary/10 to-secondary/10"}
    `}
                >
                  <div className="flex justify-between gap-2">
                    {/* text */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium truncate">
                        {item.title}
                      </h4>

                      <p className="text-xs text-base-content/60 truncate">
                        {item.preview}
                      </p>
                    </div>

                    {/* date */}
                    <span className="text-[10px] text-base-content/40 shrink-0">
                      {item.date}
                    </span>
                  </div>
                </CardWithBlurBlob>
              ))}
            </div>
          )}

          {/* ======================== */}
        </div>

        {/* ss2 right side */}
        <div
          className={`
            px-5 pt-5 pb-3 overflow-hidden mx-auto
            transition-all duration-300 ease-in-out flex flex-col

            ${open ? "w-0 opacity-0 md:w-8/12 md:opacity-100" : "w-full opacity-100 md:w-7/12"}
          `}
        >
          {/* ================================================== */}

          {/* ======================================
           */}

          {/* <div className="h-full px-4 py-6 overflow-y-auto">

            <div className="flex justify-end mb-6">
              <div className="max-w-[70%]">
                <div className="rounded-full bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 font-medium">
                  My latest invoice is missing seat upgrades. Can you check?
                </div>

                <p className="text-xs text-base-content/50 mt-2 text-right">
                  01:13 PM
                </p>
              </div>

              <div className="chat chat-start">
                <div className=" chat-bubble chat-bubble-neutral">
                  It's insulting!
                </div>
              </div>

              <div className="ml-3 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                SC
              </div>
            </div>

       
            <div className="flex gap-3">
              <SoftIconCard icon={Sparkles} variant="primary" />

              <div className="max-w-[70%]">
                <div className="rounded-3xl border border-base-content/10 bg-base-100 px-5 py-4 shadow-sm">
                  <p className="leading-relaxed">
                    I can't pull invoices directly, but I can help you draft a
                    ticket to Billing. Could you confirm the invoice number and
                    the date the seats were added?
                  </p>
                </div>

                <div className="flex gap-5 mt-3 text-xs text-base-content/50">
                  <span>02:13 PM</span>

                  <button className="flex items-center gap-1 hover:text-primary">
                    <Copy size={14} />
                    Copy
                  </button>

                  <button className="flex items-center gap-1 hover:text-primary">
                    <RefreshCcw size={14} />
                    Regenerate
                  </button>
                </div>
              </div>
            </div>
          </div> */}
          <div className="flex-1">
            {/* ############################################# */}

            <div className="h-full flex flex-col items-center justify-center px-4">
              <SoftIconCard
                icon={Sparkles}
                variant="primary"
                className="mb-5"
              />

              <h2 className="text-3xl font-bold mb-3 text-center">
                How can I help today?
              </h2>

              <p className="text-sm text-base-content/60 text-center max-w-xl mb-8">
                Ask questions, troubleshoot issues, analyze tickets, and get
                instant support guidance.
              </p>

              <div className="grid md:grid-cols-2 gap-3 w-full max-w-3xl">
                {suggestions.map((item, index) => (
                  <div
                    key={index}
                    onClick={() =>
                      setMessage(`${item.title}\n${item.subtitle}`)
                    }
                    className="rounded-2xl border border-base-content/10 px-5 py-4 hover:bg-base-200 transition cursor-pointer"
                  >
                    <div className="flex gap-4 items-start">
                      <item.icon size={18} className="mt-1 text-primary" />

                      <div>
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-xs text-base-content/60 mt-1">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* ================================ */}

          <div className="border-t border-base-content/10 pt-2">
            <div className=" rounded-2xl border border-base-content/10 bg-primary/2 pr-3 pl-4 py-3 flex gap-3 justify-center items-center">
              <Sparkles size={18} className="shrink-0" />

              <textarea
                // ref={textareaRef}
                rows={1}
                onInput={handleInput}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask anything about your issue..."
                className="flex-1 resize-none outline-none max-h-24 overflow-y-auto text-sm"
              />

              <div className="flex self-end">
                <GradientButton
                  onClick={handleSend}
                  size="sm"
                  buttonClassName="h-8 w-8 p-1"
                >
                  <SendHorizonal size={16} />
                </GradientButton>
              </div>
            </div>

            <p className="text-xs text-base-content/40 text-center mt-2">
              AI may produce inaccurate information. Press Enter to send.
            </p>
          </div>

          {/* ================================================== */}
        </div>
      </div>
    </CardWithBlurBlob>
  );
};

export default CustomerAiAssistant;
