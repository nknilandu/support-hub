import { useContext, useEffect, useRef, useState } from "react";
import GradientButton from "../../components/ui/Button/GradientButton";
import CardWithBlurBlob from "../../components/ui/Card/CardWithBlurBlob";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Clock4,
  Lightbulb,
  MessagesSquare,
  SendHorizonal,
  Ticket,
  TicketCheck,
  TicketX,
  TriangleAlert,
  WandSparkles,
} from "lucide-react";
import TextBadge from "../../components/ui/Badge/TextBadge";
import SoftIconCard from "../../components/ui/Card/SoftIconCard";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { AuthContext } from "../../app/providers/AuthProvider";
import { formatRelativeDate } from "../../src/lib/formatRelativeDate";
import Swal from "sweetalert2";
import GradientCard from "../../components/ui/Card/GradientCard";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const variantColorMap = {
  green: "text-emerald-500",
  emerald: "text-emerald-500",
  blue: "text-blue-500",
  cyan: "text-cyan-500",
  yellow: "text-amber-500",
  amber: "text-amber-500",
  orange: "text-orange-500",
  red: "text-rose-500",
  rose: "text-rose-500",
  purple: "text-purple-500",
  slate: "text-slate-500",
};

const CustomerTicketDetails = () => {
  const { user } = useContext(AuthContext);
  const { ticketId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("details");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ==================== Auto resize textarea ====================
  const handleInput = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    const maxHeight = 120;
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";
  };

  // ==================== GET TICKET DETAILS ====================
  const {
    data: resData,
    isLoading: dataLoading,
    isError: ticketError,
    error: ticketErrorInfo,
    refetch: refetchTicket,
  } = useQuery({
    queryKey: ["ticketDetails", user?.uid, ticketId],
    enabled: !!user && !!ticketId,
    refetchInterval: 10000,
    queryFn: async () => {
      const token = await user.getIdToken();
      const res = await fetch(`http://localhost:3021/tickets/${ticketId}`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch ticket details");
      }

      return result;
    },
  });

  const ticket = resData?.data || null;
  const aiResult = ticket?.aiResult || {};
  const status = ticket?.status || null;
  const permission = ticket?.permission || {};
  const agentInfo = ticket?.currentAgentInfo || null;
  const customerInfo = {
    displayName: user?.displayName || "Customer",
    email: user?.email || null,
    photoURL: user?.photoURL || null,
  };

  // ============== GET SUPPORT CONVERSATION ================
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    isError: conversationsError,
    refetch,
  } = useQuery({
    queryKey: ["ticketMessages", user?.uid, ticketId],
    enabled: !!user && !!ticketId && !!permission?.canReadMessages,
    refetchInterval: 10000,
    queryFn: async () => {
      const token = await user.getIdToken();
      const res = await fetch(
        `http://localhost:3021/tickets/${ticketId}/conversations`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch ticket messages");
      }

      return result;
    },
  });

  const conversations = conversationsData?.data || [];

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations.length, activeTab]);

  // ================= SEND SUPPORT MESSAGE =================
  const handleSendMessage = async () => {
    if (!message.trim() || isSending) return;

    try {
      setIsSending(true);
      const token = await user.getIdToken();
      const res = await fetch(
        `http://localhost:3021/tickets/${ticketId}/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: message.trim(),
          }),
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to send message");
      }

      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      await refetch();
      await refetchTicket();
    } catch (error) {
      console.error("Send message error:", error);

      Swal.fire({
        icon: "error",
        title: "Failed to send message",
        text: error.message || "Something went wrong",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // =============== handle delete ticket =================
  const handleDeleteTicket = async () => {
    const result = await Swal.fire({
      title: "Delete this ticket?",
      text: "This action will permanently remove this support ticket and all related information. You won't be able to recover it later.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Delete Ticket",
      cancelButtonText: "Keep Ticket",
    });

    if (!result.isConfirmed) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch(`http://localhost:3021/tickets/${ticketId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const resultData = await res.json();
      if (!res.ok || !resultData.success) {
        throw new Error(resultData.message || "Failed to delete ticket");
      }

      await Swal.fire({
        title: "Deleted!",
        text: "Your support ticket has been successfully deleted.",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });

      navigate("/customer/tickets");
    } catch (error) {
      Swal.fire({
        title: "Delete Failed",
        text: error.message,
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // ============== handle close ticket =================
  const handleCloseTicket = async () => {
    const result = await Swal.fire({
      title: "Close this ticket?",
      text: "Close the ticket only after your issue has been resolved.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Close Ticket",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch(
        `http://localhost:3021/tickets/${ticketId}/close`,
        {
          method: "PATCH",
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to close ticket");
      }

      await Swal.fire({
        title: "Ticket Closed",
        text: "Your support ticket has been successfully closed.",
        icon: "success",
        confirmButtonColor: "#16a34a",
      });

      await refetchTicket();
    } catch (error) {
      console.error("Close ticket error:", error);

      Swal.fire({
        title: "Close Failed",
        text: error.message || "Something went wrong",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // =============== handle reopen ticket =================
  const handleReopenTicket = async () => {
    const result = await Swal.fire({
      title: "Reopen this ticket?",
      text: "The ticket will be returned to the support queue for an agent to handle.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Reopen Ticket",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#0ea5e9",
      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch(
        `http://localhost:3021/tickets/${ticketId}/reopen`,
        {
          method: "PATCH",
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to reopen ticket");
      }

      await Swal.fire({
        title: "Ticket Reopened",
        text: "Your ticket has been reopened and returned to the support queue.",
        icon: "success",
        confirmButtonColor: "#0ea5e9",
      });

      setActiveTab("details");
      await refetchTicket();
    } catch (error) {
      console.error("Reopen ticket error:", error);

      Swal.fire({
        title: "Reopen Failed",
        text: error.message || "Something went wrong",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const showConversationPanel =
    !dataLoading &&
    ticket?.supportMode === "human" &&
    permission?.canReadMessages;

  // ================================
  return (
    <div className="space-y-5 p-4 lg:p-5">
      {/* title card */}
      <CardWithBlurBlob
        interactive={false}
        className={`${dataLoading || !ticket ? "hidden" : "block"}`}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Left content */}
          <div className="min-w-0">
            {/* Ticket number */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/50">
              <span className="font-mono"># {ticket?.ticketNumber}</span>

              <TextBadge
                variant={
                  status === "open"
                    ? "blue"
                    : status === "assigned"
                      ? "purple"
                      : status === "in_progress"
                        ? "yellow"
                        : status === "resolved"
                          ? "green"
                          : "slate"
                }
              >
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current"></span>
                {(status || "open").replace("_", " ")}
              </TextBadge>
            </div>

            {/* Title */}
            <h1 className="mt-3 text-xl font-bold leading-tight text-base-content sm:text-2xl">
              {aiResult?.ticketTitle || "Untitled Ticket"}
            </h1>

            {/* Description */}
            <p className="mt-1 max-w-4xl text-sm leading-6 text-base-content/60">
              {aiResult?.summary}
            </p>

            {/* Badges */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {aiResult?.category && (
                <TextBadge variant="cyan">{aiResult.category}</TextBadge>
              )}
              {aiResult?.states?.map((item, i) => (
                <TextBadge key={i} variant={item.variant || "slate"}>
                  {item.value} {item.title}
                </TextBadge>
              ))}
            </div>
          </div>

          {/* Right date cards & actions */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:shrink-0">
            {/* Created */}
            <div className="rounded-2xl border border-base-content/10 bg-base-100/60 px-3 py-3 backdrop-blur-sm sm:min-w-30 sm:px-4">
              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-base-content/50">
                <CalendarDays size={13} />
                Created
              </div>

              <p className="mt-1 text-xs font-medium text-base-content sm:text-sm">
                {formatRelativeDate(ticket?.createdAt)}
              </p>
            </div>

            {/* Updated */}
            <div className="rounded-2xl border border-base-content/10 bg-base-100/60 px-3 py-3 backdrop-blur-sm sm:min-w-30 sm:px-4">
              <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-base-content/50">
                <Clock3 size={13} />
                Updated
              </div>

              <p className="mt-1 text-xs font-medium text-base-content sm:text-sm">
                {formatRelativeDate(ticket?.updatedAt)}
              </p>
            </div>

            {/* Action buttons */}
            {permission?.canReopen && (
              <GradientButton
                onClick={handleReopenTicket}
                className="w-full"
                buttonClassName="from-info/80 to-info/95 text-white"
              >
                <Ticket size={16} strokeWidth={2.2} />
                <p>Reopen</p>
              </GradientButton>
            )}

            {permission?.canClose && (
              <GradientButton
                className="w-full"
                onClick={handleCloseTicket}
                buttonClassName="from-green-500/80 to-green-600/85 text-white"
              >
                <TicketX size={18} strokeWidth={2.2} />
                <p>Close</p>
              </GradientButton>
            )}
          </div>
        </div>

        {/* ======= alert toast ======== */}
        {(status === "resolved" || status === "closed") && (
          <div className="mt-5">
            {status === "resolved" && (
              <div className="flex w-full items-center justify-start gap-3 rounded-xl border border-green-500/30 bg-success/5 px-5 py-2 font-semibold text-success">
                <TicketCheck size={16} strokeWidth={3} />
                <p>Ticket Resolved</p>
              </div>
            )}

            {status === "closed" && (
              <div className="flex w-full items-center justify-start gap-3 rounded-xl border border-base-content/10 bg-base-content/5 px-5 py-2 font-semibold text-base-content/60">
                <TicketX size={16} strokeWidth={3} />
                <p>Ticket Closed</p>
              </div>
            )}
          </div>
        )}
      </CardWithBlurBlob>

      {/* Mobile Tab Buttons */}
      {showConversationPanel && (
        <div className="flex justify-center lg:hidden">
          <div className="grid w-fit grid-cols-2">
            <GradientButton
              size="sm"
              onClick={() => setActiveTab("details")}
              className="min-w-[120px] transition"
              buttonClassName={
                activeTab === "details"
                  ? "from-primary to-secondary text-base-100"
                  : "from-primary/10 to-secondary/10 text-base-content"
              }
              rounded="rounded-none rounded-l-xl"
            >
              Details
            </GradientButton>

            <GradientButton
              size="sm"
              onClick={() => setActiveTab("messages")}
              className="min-w-[120px] transition"
              buttonClassName={
                activeTab === "messages"
                  ? "from-primary to-secondary text-base-100"
                  : "from-primary/10 to-secondary/10 text-base-content"
              }
              rounded="rounded-none rounded-r-xl"
            >
              Messages
            </GradientButton>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`grid min-h-0 gap-3 ${
          showConversationPanel
            ? "h-[85svh] lg:grid-cols-2"
            : "min-h-[60svh] grid-cols-1"
        }`}
      >
        {/* Ticket Info */}
        <CardWithBlurBlob
          interactive={false}
          className={`min-h-0 overflow-hidden ${
            activeTab === "details" ? "block" : "hidden"
          } lg:block`}
        >
          {dataLoading ? (
            <div className="my-6 flex flex-col items-start justify-start gap-3">
              <div className="skeleton h-5 w-full rounded-full"></div>
              <div className="skeleton h-5 w-full rounded-full"></div>
              <div className="skeleton h-5 w-3/4 rounded-full"></div>
              <div className="skeleton mt-4 h-5 w-1/3 rounded-full"></div>
              <div className="skeleton h-5 w-2/5 rounded-full"></div>
              <div className="skeleton h-5 w-2/5 rounded-full"></div>
            </div>
          ) : ticketError ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <h3 className="font-semibold text-error">
                Failed to load ticket
              </h3>

              <p className="mt-2 text-sm text-base-content/60">
                {ticketErrorInfo?.message || "Something went wrong."}
              </p>

              <button
                type="button"
                onClick={() => refetchTicket()}
                className="btn btn-primary btn-sm mt-4"
              >
                Retry
              </button>
            </div>
          ) : !ticket ? (
            <div className="flex h-full flex-col items-center justify-center px-5 py-8 text-center">
              <SoftIconCard
                icon={TriangleAlert}
                className="mb-3"
                variant="slate"
              />

              <h3 className="text-base font-semibold text-base-content/70">
                Ticket Not Found
              </h3>

              <p className="mt-2 max-w-sm text-xs leading-5 text-base-content/50">
                We couldn&apos;t find this support ticket. It may have been
                deleted, moved, or you may not have permission to view it.
              </p>

              <GradientButton
                size="sm"
                className="mt-5"
                onClick={() => navigate("/customer/tickets")}
              >
                Back to My Tickets
              </GradientButton>
            </div>
          ) : (
            <div className="h-full overflow-y-auto pr-2">
              {/* Metrics */}
              {aiResult?.metrics?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">
                  {aiResult.metrics.map((item, i) => (
                    <div
                      key={i}
                      className="mr-6 flex w-fit items-center justify-start"
                    >
                      <div className="h-2 w-2 rounded-full bg-success"></div>
                      <p className="ml-1 text-xs text-base-content/60">
                        {item.label}:
                      </p>
                      <p className="ml-1 text-xs font-semibold text-base-content/80">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* States */}
              {aiResult?.states?.length > 0 && (
                <div
                  className={`mt-5 grid gap-4 ${
                    aiResult.states.length >= 3
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      : aiResult.states.length === 2
                        ? "sm:grid-cols-2"
                        : "grid-cols-1"
                  }`}
                >
                  {aiResult.states.map((state, index) => {
                    const progressColor =
                      variantColorMap[state.variant] || "text-primary";

                    return (
                      <CardWithBlurBlob
                        key={index}
                        interactive={false}
                        className="p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-base-content/50">
                              {state.title}
                            </p>
                            <p className="text-[11px] text-base-content/60 lg:max-w-80">
                              {state.description}
                            </p>
                          </div>

                          {String(state.value).includes("%") ? (
                            <div
                              className={`radial-progress shrink-0 text-[10px] font-semibold ${progressColor}`}
                              style={{
                                "--value": parseInt(state.value, 10) || 0,
                                "--size": "2.7rem",
                              }}
                              aria-valuenow={parseInt(state.value, 10) || 0}
                              role="progressbar"
                            >
                              {state.value}
                            </div>
                          ) : (
                            <TextBadge
                              variant={state.variant || "slate"}
                              size="xl"
                            >
                              {state.value}
                            </TextBadge>
                          )}
                        </div>
                      </CardWithBlurBlob>
                    );
                  })}
                </div>
              )}

              {/* Root Cause */}
              {aiResult?.rootCause && (
                <div>
                  <div className="mt-6 flex items-center justify-start gap-2">
                    <SoftIconCard
                      icon={TriangleAlert}
                      className="h-6 w-6 rounded-lg"
                      size={14}
                      variant="warning"
                    />
                    <h2 className="text-xl font-semibold text-base-content/80">
                      Likely Root Cause
                    </h2>
                  </div>
                  <p className="mt-2 text-base-content/80">
                    {aiResult.rootCause}
                  </p>

                  <div className="mt-5 h-1 w-full border-t border-base-content/10" />
                </div>
              )}

              {/* Recommendations */}
              {aiResult?.recommendations?.length > 0 && (
                <div>
                  <div className="mt-6 flex items-center justify-start gap-2">
                    <SoftIconCard
                      icon={Lightbulb}
                      className="h-6 w-6 rounded-lg"
                      size={14}
                      variant="cyan"
                    />
                    <h2 className="text-xl font-semibold text-base-content/80">
                      Recommended Actions
                    </h2>
                  </div>

                  <div
                    className={`mt-5 grid gap-2 ${
                      aiResult.recommendations.length >= 2
                        ? "sm:grid-cols-2"
                        : "grid-cols-1"
                    }`}
                  >
                    {aiResult.recommendations.map((item, i) => (
                      <div
                        key={i}
                        className="group flex items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-base-content/10 p-3 transition-all hover:border-primary/20"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10">
                            <CheckCircle2 size={16} className="text-success" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold">{item.title}</h3>

                              <TextBadge variant={item.variant || "cyan"}>
                                {item.impact}
                              </TextBadge>
                            </div>

                            <p className="text-sm text-base-content/60">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 h-1 w-full border-t border-base-content/10" />
                </div>
              )}

              {/* Steps */}
              {aiResult?.steps?.length > 0 && (
                <div>
                  <div className="mt-6 flex items-center justify-start gap-2">
                    <SoftIconCard
                      icon={Clock4}
                      className="h-6 w-6 rounded-lg"
                      size={14}
                      variant="pink"
                    />
                    <h2 className="text-xl font-semibold text-base-content/80">
                      Suggested Resolution Steps
                    </h2>
                  </div>

                  <div className="mt-8 space-y-6">
                    {aiResult.steps.map((step, index) => (
                      <div key={index} className="relative flex gap-5">
                        {/* Timeline */}
                        <div className="relative flex flex-col items-center justify-start">
                          <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-base-300 text-sm font-semibold">
                            {step.id}
                          </div>

                          {index !== aiResult.steps.length - 1 && (
                            <div className="absolute -bottom-4 top-10 w-px bg-base-content/20" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{step.title}</h3>

                            <span className="badge badge-sm bg-base-content/10">
                              {step.estimatedTime}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-base-content/60">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 h-1 w-full border-t border-base-content/10" />
                </div>
              )}

              {/* Reason */}
              {aiResult?.escalation?.reason && (
                <div>
                  <div className="mt-6 flex items-center justify-start gap-2">
                    <SoftIconCard
                      icon={WandSparkles}
                      className="h-6 w-6 rounded-lg"
                      size={14}
                      variant="purple"
                    />
                    <h2 className="text-xl font-semibold text-base-content/80">
                      Why AI Recommends This
                    </h2>
                  </div>
                  <p className="mt-2 text-base-content/80">
                    {aiResult.escalation.reason}
                  </p>
                </div>
              )}

              {/* Escalation info */}
              {aiResult?.escalation && (
                <div
                  className={`mt-6 shrink-0 rounded-2xl border p-4 ${
                    aiResult.escalation.recommended
                      ? "border-warning/20 bg-warning/5"
                      : "border-success/20 bg-success/5"
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base-100 ${
                        aiResult.escalation.recommended
                          ? "bg-warning"
                          : "bg-success"
                      }`}
                    >
                      {aiResult.escalation.recommended ? (
                        <AlertTriangle size={18} />
                      ) : (
                        <CheckCircle2 size={18} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">
                        {aiResult.escalation.recommended
                          ? "Human Review Recommended"
                          : "Self-Service Recommended"}
                      </h3>

                      <p className="mt-1 text-sm text-base-content/60">
                        {aiResult.escalation.recommended
                          ? "This issue may require agent assistance due to complexity, risk, or account-specific factors."
                          : "AI believes this issue can likely be resolved without agent involvement by following the suggested steps."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Fixed permission?.canDelete check */}
              {permission?.canDelete && (
                <div className="mt-5 flex justify-end gap-3">
                  <GradientButton
                    buttonClassName="from-error/70 to-error text-white"
                    onClick={handleDeleteTicket}
                  >
                    Delete Ticket
                  </GradientButton>
                </div>
              )}
            </div>
          )}
        </CardWithBlurBlob>

        {/* ================================= */}
        {/* Conversation Panel */}
        {/* ================================= */}
        <CardWithBlurBlob
          interactive={false}
          className={`min-h-0 flex-col overflow-hidden p-0 ${
            !showConversationPanel
              ? "hidden"
              : activeTab === "messages"
                ? "flex"
                : "hidden lg:flex"
          }`}
        >
          {/* Conversation Header */}
          <div className="shrink-0 border-b border-base-content/10 px-5 py-4">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
              <SoftIconCard
                icon={MessagesSquare}
                variant="primary"
                className="shrink-0"
              />

              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="truncate font-semibold">Support Conversation</h3>

                <p className="truncate text-xs text-base-content/60">
                  {user?.displayName && user?.email
                    ? `${user.displayName} · ${user.email}`
                    : "Real-time support with AI insights."}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div
            className={`min-h-0 flex-1 space-y-6 overflow-y-auto p-5 ${
              conversations.length === 0 && !conversationsLoading
                ? "flex flex-col items-center justify-center"
                : ""
            }`}
          >
            {/* Agent & Customer Intro */}
            <div className="mb-10 flex flex-col items-center justify-center">
              <div className="avatar-group -space-x-5">
                <div className="avatar">
                  <div className="h-12 w-12">
                    <img
                      alt={agentInfo?.displayName || "Agent"}
                      className="h-full w-full bg-base-content/10 object-cover object-center"
                      src={
                        agentInfo?.photoURL ||
                        "https://ui-avatars.com/api/?name=Support+Agent&background=random"
                      }
                    />
                  </div>
                </div>
                <div className="avatar">
                  <div className="h-12 w-12">
                    <img
                      alt={customerInfo?.displayName || "Customer"}
                      className="h-full w-full bg-base-200 object-cover object-center"
                      src={
                        customerInfo?.photoURL ||
                        user?.photoURL ||
                        "https://ui-avatars.com/api/?name=Customer&background=random"
                      }
                    />
                  </div>
                </div>
              </div>
              <h3 className="mt-2 text-lg font-bold text-base-content/90">
                {agentInfo?.displayName || "Support Agent"}
              </h3>

              <p className="text-xs text-base-content/60">
                {agentInfo?.email || "Awaiting agent assignment"}
              </p>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                {agentInfo && (
                  <>
                    <TextBadge variant="blue" size="xs">
                      {agentInfo.role || "agent"}
                    </TextBadge>

                    {agentInfo.status && (
                      <TextBadge variant="green" size="xs">
                        {agentInfo.status}
                      </TextBadge>
                    )}
                  </>
                )}

                {agentInfo?.companyName && (
                  <TextBadge variant="purple" size="xs">
                    {agentInfo.companyName}
                  </TextBadge>
                )}
              </div>

              {/* Conversation Intro */}
              <div className="mt-4 text-center">
                <h4 className="text-sm font-semibold text-base-content/90">
                  Need help?
                </h4>

                <p className="mt-1.5 text-xs leading-relaxed text-base-content/60">
                  Start a conversation with{" "}
                  <span className="font-medium text-base-content/80">
                    {agentInfo?.displayName || "our support agent"}
                  </span>{" "}
                  and get personalized support.
                </p>

                <p className="mt-2 text-xs text-base-content/50">
                  You’re chatting as{" "}
                  <span className="font-medium text-base-content/70">
                    {user?.displayName || "Customer"}
                  </span>
                  .
                </p>

                {conversations.length === 0 && !conversationsLoading && (
                  <p className="mt-3 text-[11px] text-base-content/40">
                    No messages yet — send a message to get started.
                  </p>
                )}
              </div>
            </div>

            {/* Message Body */}
            <div className="h-fit w-full">
              {conversationsLoading ? (
                <div className="flex items-center justify-center text-primary">
                  <span className="loading loading-spinner loading-md"></span>
                </div>
              ) : conversationsError ? (
                <div className="p-5 text-center">
                  <p className="text-sm text-error">Failed to load messages.</p>

                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="btn btn-sm btn-outline mt-3"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                conversations.map((item) => (
                  <div
                    key={item._id}
                    className={`mt-4 flex min-w-0 items-start gap-3 ${
                      item?.sender?.role === "customer"
                        ? "flex-row-reverse"
                        : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
                      <img
                        alt={item?.sender?.displayName || "Sender"}
                        className="h-full w-full bg-base-content/5 object-cover object-center"
                        src={
                          item?.sender?.photoURL ||
                          "https://ui-avatars.com/api/?name=User&background=random"
                        }
                      />
                    </div>

                    {/* Message Content */}
                    <div className="w-0 min-w-0 max-w-[90%] flex-1 sm:max-w-[70%]">
                      <GradientCard
                        className={`
                          w-fit
                          max-w-full
                          px-4
                          py-3
                          text-sm
                          leading-relaxed
                          shadow-none
                          sm:px-5
                          ${
                            item?.sender?.role === "customer"
                              ? "ml-auto rounded-b-2xl rounded-l-2xl rounded-r-lg from-primary/95 to-secondary/95 text-white"
                              : "rounded-b-2xl rounded-l-lg rounded-r-2xl from-primary/10 to-secondary/5 text-base-content"
                          }
                        `}
                      >
                        <div className="wrap-break-word text-sm leading-relaxed">
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
                              em: ({ children }) => <em>{children}</em>,
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
                              a: ({ href, children }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline underline-offset-2"
                                >
                                  {children}
                                </a>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="my-2 border-l-2 border-current/30 pl-3 italic opacity-80">
                                  {children}
                                </blockquote>
                              ),
                              code: ({ children }) => (
                                <code className="rounded bg-black/10 px-1 py-0.5 text-xs">
                                  {children}
                                </code>
                              ),
                            }}
                          >
                            {item?.message || ""}
                          </ReactMarkdown>
                        </div>
                      </GradientCard>

                      <p
                        className={`mt-1 text-[11px] text-base-content/40 ${
                          item?.sender?.role === "customer" ? "text-end" : ""
                        }`}
                      >
                        {item?.sender?.displayName} {" · "}{" "}
                        {formatRelativeDate(item?.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Reply Composer */}
          {!["resolved", "closed"].includes(status) &&
            permission?.canSendMessage && (
              <div className="shrink-0 border-t border-base-content/10 bg-base-100/70 p-4">
                <div className="flex items-center justify-center gap-3 rounded-2xl border border-base-content/10 bg-primary/2 py-3 pl-4 pr-3">
                  <textarea
                    ref={textareaRef}
                    rows={2}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    value={message}
                    disabled={isSending}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a reply... (Press Enter to send, Shift+Enter for new line)"
                    className="max-h-28 flex-1 resize-none bg-transparent text-sm outline-none overflow-y-auto"
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between">
                  <p className="mb-2 text-xs text-base-content/50 sm:mb-0">
                    Reply to {agentInfo?.displayName || "Support Agent"}
                  </p>

                  <div className="flex flex-wrap justify-end gap-2">
                    <GradientButton
                      onClick={handleSendMessage}
                      disabled={
                        !message.trim() ||
                        isSending ||
                        conversationsLoading ||
                        !permission?.canSendMessage
                      }
                      size="sm"
                      buttonClassName={
                        !message.trim() ||
                        isSending ||
                        conversationsLoading ||
                        !permission?.canSendMessage
                          ? "from-primary/10 to-secondary/20 opacity-60 cursor-not-allowed text-base-content/50"
                          : "from-primary to-secondary text-white"
                      }
                    >
                      <SendHorizonal size={16} />
                      {isSending ? "Sending..." : "Send"}
                    </GradientButton>
                  </div>
                </div>
              </div>
            )}
        </CardWithBlurBlob>
      </div>
    </div>
  );
};

export default CustomerTicketDetails;
