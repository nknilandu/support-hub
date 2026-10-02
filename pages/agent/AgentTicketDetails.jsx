import { useContext, useState } from "react";
import GradientButton from "../../components/ui/Button/GradientButton";
import CardWithBlurBlob from "../../components/ui/Card/CardWithBlurBlob";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CircleCheck,
  CircleX,
  Clock3,
  Clock4,
  Lightbulb,
  MessagesSquare,
  SendHorizonal,
  Sparkles,
  Ticket,
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
import { toast } from "react-toastify";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AgentTicketDetails = () => {
  const { user } = useContext(AuthContext);
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [message, setMessage] = useState("");
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [resolveLoading, setResolveLoading] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);

  // ====================
  const handleInput = (e) => {
    const textarea = e.target;

    textarea.style.height = "auto";

    const maxHeight = 120; // approx 3 lines
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";
  };

  // =========================== ticket data + customer data ===================
  const {
    data: resData,
    isLoading: dataLoading,
    refetch: refetchTicket,
  } = useQuery({
    queryKey: ["ticketDetails", ticketId],

    enabled: !!user?.accessToken && !!ticketId,

    queryFn: async () => {
      const res = await fetch(`http://localhost:3021/tickets/${ticketId}`, {
        headers: {
          authorization: `Bearer ${user.accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch ticket details");
      }

      return res.json();
    },
  });

  const status = resData?.data?.status || null;
  const aiResult = resData?.data?.aiResult || [];
  const customerInfo = resData?.customerInfo || {};
  const isResolved = resData?.data?.status === "resolved";
  const permission = resData?.permission || false;
  // console.log(resData);

  // ================ GET SUPPORT CONVERSATION ==================
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    refetch,
  } = useQuery({
    queryKey: ["ticketMessages", ticketId],

    enabled: !!user?.accessToken && !!ticketId,

    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3021/tickets/${ticketId}/conversations`,
        {
          headers: {
            authorization: `Bearer ${user.accessToken}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch ticket messages");
      }

      return res.json();
    },
  });

  const conversations = conversationsData?.data || [];

  //===================== handle assign  ====================
  const handleAssign = async () => {
    try {
      setAssignLoading(true);
      const res = await fetch(
        `http://localhost:3021/agent/tickets/${ticketId}/assign`,
        {
          method: "PATCH",
          headers: {
            authorization: `Bearer ${user.accessToken}`,
          },
        },
      );

      const data = await res.json();

      if (data.success) {
        toast(`Ticket Assigned`);
        refetch();
        refetchTicket();
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setAssignLoading(false);
    }
  };

  //===================== handle release ====================
  const handleRelease = async () => {
    const result = await Swal.fire({
      title: "Return ticket to queue?",
      text: "This ticket will be removed from your assigned list and returned to the company queue.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, return to queue",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setReleaseLoading(true);

      const res = await fetch(
        `http://localhost:3021/agent/tickets/${ticketId}/release`,
        {
          method: "PATCH",
          headers: {
            authorization: `Bearer ${user.accessToken}`,
          },
        },
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to return ticket to queue");
      }
      toast.success("Ticket returned to the company queue");
      await refetchTicket();
      await refetch();

      navigate("/agent/my-tickets");

      Swal.fire({
        title: "Returned!",
        text: "The ticket has been returned to the company queue.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Release ticket error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setReleaseLoading(false);
    }
  };

  // ================= HANDLE RESOLVE =================
  const handleResolve = async () => {
    const result = await Swal.fire({
      title: "Resolve this ticket?",
      text: "This ticket will be marked as resolved and removed from your active assigned tickets.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, resolve",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setResolveLoading(true);

      const res = await fetch(
        `http://localhost:3021/agent/tickets/${ticketId}/resolve`,
        {
          method: "PATCH",
          headers: {
            authorization: `Bearer ${user.accessToken}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to resolve ticket");
      }

      toast.success("Ticket resolved successfully");

      await refetchTicket();
      await refetch();

      await Swal.fire({
        title: "Resolved!",
        text: "The ticket has been successfully resolved.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Resolve ticket error:", error);

      toast.error(error.message || "Failed to resolve ticket");
    } finally {
      setResolveLoading(false);
    }
  };

  // ================= SEND SUPPORT MESSAGE =================
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:3021/tickets/${ticketId}/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify({
            message: message.trim(),
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to send message");
      }

      // Clear composer
      setMessage("");

      await refetch();
      await refetchTicket();
    } catch (error) {
      console.error("Send message error:", error);

      Swal.fire({
        icon: "error",
        title: "Failed to send message",
        text: error.message || "Something went wrong",
      });
    }
  };

  // =============== HANDLE SUGGEST REPLY ======================
  const handleSuggestReply = async () => {
    try {
      setIsGeneratingReply(true);

      const res = await fetch("http://localhost:3021/ai/suggest-reply", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${user.accessToken}`,
        },

        body: JSON.stringify({
          ticketId,
          agentDraft: message?.trim() || "",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);

        throw new Error(errorData?.message || "Failed to generate reply");
      }

      const data = await res.json();

      if (!data?.data?.reply) {
        throw new Error("AI did not generate a reply");
      }

      setMessage(data.data.reply);

      console.log("Suggest reply:", data);
    } catch (error) {
      console.error("Suggest reply error:", error);
    } finally {
      setIsGeneratingReply(false);
    }
  };

  // =====================================
  return (
    <div className="p-5 space-y-5">
      {/* title card */}
      <CardWithBlurBlob
        interactive={false}
        className={`${dataLoading || !resData?.data ? "hidden" : "block"}`}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Left content */}
          <div className="min-w-0">
            {/* Ticket number */}
            <div className=" flex flex-wrap items-center gap-2 text-xs text-base-content/50">
              <span># {resData?.data?.ticketNumber}</span>

              <TextBadge
                variant={
                  resData?.data?.status === "open"
                    ? "blue"
                    : resData?.data?.status === "assigned"
                      ? "purple"
                      : resData?.data?.status === "in_progress"
                        ? "yellow"
                        : resData?.data?.status === "resolved"
                          ? "green"
                          : "gray"
                }
              >
                <span className="h-1.5 w-1.5 mr-1 rounded-full bg-current"></span>
                {resData?.data?.status}
              </TextBadge>
            </div>

            {/* Title */}
            <h1 className="mt-3 text-xl font-bold leading-tight text-base-content sm:text-2xl">
              {aiResult?.ticketTitle}
            </h1>

            {/* Description */}
            <p className="max-w-4xl text-sm leading-6 text-base-content/60">
              {aiResult?.summary}
            </p>

            {/* Badges */}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <TextBadge variant="cyan">{aiResult?.category}</TextBadge>
              {aiResult?.states?.map((item, i) => (
                <TextBadge key={i} variant={item.variant}>
                  {item.value} {item.title}
                </TextBadge>
              ))}
            </div>
          </div>

          {/* Right date & action area */}
          <div className="flex flex-col items-stretch gap-3 lg:items-end">
            {/* Date Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {/* Created */}
              <div className="min-w-[120px] rounded-2xl border border-base-content/10 bg-base-100/60 px-3 py-3 backdrop-blur-sm sm:min-w-[135px] sm:px-4">
                <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-base-content/50">
                  <CalendarDays size={13} />
                  Created
                </div>

                <p className="mt-1 text-xs font-medium text-base-content sm:text-sm">
                  {formatRelativeDate(resData?.data?.createdAt)}
                </p>
              </div>

              {/* Updated */}
              <div className="min-w-[120px] rounded-2xl border border-base-content/10 bg-base-100/60 px-3 py-3 backdrop-blur-sm sm:min-w-[135px] sm:px-4">
                <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-base-content/50">
                  <Clock3 size={13} />
                  Updated
                </div>

                <p className="mt-1 text-xs font-medium text-base-content sm:text-sm">
                  {formatRelativeDate(resData?.data?.updatedAt)}
                </p>
              </div>
            </div>

            {/* Resolve Action */}
            {status === "open" && (
              <GradientButton
                size="md"
                onClick={handleAssign}
                disabled={assignLoading}
                className="w-full sm:w-fit lg:self-end"
                buttonClassName={`${assignLoading ? "from-primary/10 to-secondary/10 text-base-content/50" : "from-primary to-secondary text-white"}`}
              >
                {assignLoading ? (
                  <div className="flex w-28 items-center justify-center">
                    <span className="loading loading-spinner loading-sm"></span>
                  </div>
                ) : (
                  <div className="space-x-2 flex justify-center items-center">
                    <Ticket size={16} strokeWidth={2} />
                    <p>Assign Ticket</p>
                  </div>
                )}
              </GradientButton>
            )}
          </div>
        </div>
      </CardWithBlurBlob>

      {/* Mobile Tab Buttons */}
      {resData?.data?.supportMode === "human" && permission?.isCurrentAgent && (
        <div className="flex justify-center lg:hidden">
          {/* lg:hidden */}
          <div className="grid w-fit grid-cols-2">
            <GradientButton
              size="sm"
              onClick={() => setActiveTab("details")}
              className="min-w-[120px] transition"
              buttonClassName={` ${
                activeTab === "details"
                  ? "from-primary to-secondary text-base-100"
                  : "from-primary/10 to-secondary/10 text-base-content"
              }`}
              rounded="rounded-none rounded-l-xl"
            >
              Details
            </GradientButton>

            <GradientButton
              size="sm"
              onClick={() => setActiveTab("messages")}
              className="min-w-[120px] transition"
              buttonClassName={` ${
                activeTab === "messages"
                  ? "from-primary to-secondary text-base-100"
                  : "from-primary/10 to-secondary/10 text-base-content"
              }`}
              rounded="rounded-none rounded-r-xl"
            >
              Messages
            </GradientButton>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`grid gap-3 h-[89svh] min-h-0 ${
          resData?.data?.supportMode === "human" && permission?.isCurrentAgent
            ? "lg:grid-cols-2"
            : "grid-cols-1"
        }`}
      >
        {/* Ticket Info */}
        <CardWithBlurBlob
          interactive={false}
          className={`min-h-0 overflow-hidden  ${
            activeTab === "details" ? "block" : "hidden"
          } lg:block`}
        >
          {dataLoading ? (
            <div className="my-6 flex flex-col gap-3 justify-start items-start">
              <div className="skeleton h-5 w-full rounded-full"></div>
              <div className="skeleton h-5 w-full rounded-full"></div>
              <div className="skeleton h-5 w-3/4 rounded-full"></div>
              <div className="skeleton h-5 w-1/3 rounded-full mt-4"></div>
              <div className="skeleton h-5 w-2/5 rounded-full"></div>
              <div className="skeleton h-5 w-2/5 rounded-full"></div>
              <div className="skeleton h-5 w-1/12 rounded-full"></div>
            </div>
          ) : !resData?.data ? (
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
                We couldn't find this support ticket. It may have been deleted,
                moved, or you may not have permission to view it.
              </p>

              <GradientButton
                size="sm"
                className="mt-5"
                onClick={() => window.history.back()}
              >
                Go Back
              </GradientButton>
            </div>
          ) : (
            <div className="h-full overflow-y-auto pr-2">
              {/* ============================== */}
              {aiResult?.metrics && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {aiResult?.metrics.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-start items-center w-fit mr-6"
                    >
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <p className="ml-1 text-base-content/60 text-xs">
                        {item.label}
                        {":"}
                      </p>
                      <p className="ml-1 font-semibold text-base-content/80 text-xs">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {/* +++++++++++++++++++++ */}

              {aiResult?.states && (
                <div
                  className={`grid gap-4 ${aiResult?.states?.length >= 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : aiResult?.states?.length === 2 ? "sm:grid-cols-2" : "grid-cols-1"} mt-5`}
                >
                  {aiResult?.states.map((state, index) => (
                    <CardWithBlurBlob
                      key={index}
                      interactive={false}
                      className="p-4"
                    >
                      <div className="flex flex-wrap justify-between items-center gap-3">
                        <div>
                          <p className="text-sm font-medium text-base-content/50">
                            {state.title}
                          </p>
                          <p className="lg:max-w-80 text-[11px] text-base-content/60">
                            {state.description}
                          </p>
                        </div>

                        {String(state.value).includes("%") ? (
                          <div
                            className={`shrink-0 radial-progress text-${state.variant}-500 text-[10px] font-semibold`}
                            style={{
                              "--value": parseInt(state.value, 10),
                              "--size": "2.7rem",
                            }}
                            aria-valuenow={parseInt(state.value, 10)}
                            role="progressbar"
                          >
                            {state.value}
                          </div>
                        ) : (
                          <TextBadge variant={state.variant} size="xl">
                            {state.value}
                          </TextBadge>
                        )}
                      </div>
                    </CardWithBlurBlob>
                  ))}
                </div>
              )}

              {/* +++++++++++++++++++++ */}

              {aiResult?.rootCause && (
                <div>
                  <div className="flex justify-start items-center gap-2 mt-6">
                    <SoftIconCard
                      icon={TriangleAlert}
                      className="h-6 w-6 rounded-lg"
                      size={14}
                      variant="warning"
                    ></SoftIconCard>
                    <h2 className=" font-semibold text-xl text-base-content/80">
                      Likely Root Cause
                    </h2>
                  </div>
                  <p className="mt-2 text-base-content/80">
                    {aiResult?.rootCause}
                  </p>

                  <div className="mt-5 w-full h-1 border-t border-base-content/10" />
                </div>
              )}

              {/* ++++++++++ recommendations +++++++++++ */}

              {aiResult?.recommendations?.length > 0 && (
                <div>
                  <div className="flex justify-start items-center gap-2 mt-6">
                    <SoftIconCard
                      icon={Lightbulb}
                      className="h-6 w-6 rounded-lg"
                      size={14}
                      variant="cyan"
                    ></SoftIconCard>
                    <h2 className=" font-semibold text-xl text-base-content/80">
                      Recommended Actions
                    </h2>
                  </div>
                  {/* ======== */}

                  <div
                    className={`mt-5 grid ${aiResult?.recommendations?.length >= 2 ? "sm:grid-cols-2 " : "grid-cols-1"} gap-2`}
                  >
                    {aiResult?.recommendations?.map((item, i) => (
                      <div
                        key={i}
                        className="group flex items-center justify-between gap-4 rounded-2xl border-2 p-3 transition-all border-base-content/10 border-dashed hover:border-primary/20"
                      >
                        <div className=" flex items-center gap-4">
                          {/* Icon */}
                          <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-success/10">
                            <CheckCircle2 size={16} className="text-success" />
                          </div>

                          {/* Content */}
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold">{item.title}</h3>

                              <TextBadge variant={item.variant}>
                                {item.impact}
                              </TextBadge>
                            </div>

                            <p className=" text-sm text-base-content/60">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 w-full h-1 border-t border-base-content/10" />
                </div>
              )}

              {/* ++++++++ steps +++++++++++++ */}

              {aiResult?.steps?.length > 0 && (
                <div>
                  <div className="flex justify-start items-center gap-2 mt-6">
                    <SoftIconCard
                      icon={Clock4}
                      className="h-6 w-6 rounded-lg"
                      size={14}
                      variant="pink"
                    ></SoftIconCard>
                    <h2 className=" font-semibold text-xl text-base-content/80">
                      Suggested Resolution Steps
                    </h2>
                  </div>
                  {/* ======================== */}

                  <div className="space-y-6 mt-8">
                    {aiResult?.steps?.map((step, index) => (
                      <div key={index} className="relative flex gap-5">
                        {/* Timeline */}
                        <div className="relative flex flex-col justify-start items-center">
                          <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-base-300 text-sm font-semibold">
                            {step.id}
                          </div>

                          {index !== aiResult?.steps.length - 1 && (
                            <div className="absolute top-10 -bottom-4 w-px bg-base-content/20" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{step.title}</h3>

                            <span className="badge bg-base-content/10 badge-sm">
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
                  <div className="mt-5 w-full h-1 border-t border-base-content/10" />
                </div>
              )}

              {/* ++++++++++ reason +++++++++++ */}
              {aiResult?.escalation?.reason && (
                <div>
                  <div className="flex justify-start items-center gap-2 mt-6">
                    <SoftIconCard
                      icon={WandSparkles}
                      className="h-6 w-6 rounded-lg"
                      size={14}
                      variant="purple"
                    ></SoftIconCard>
                    <h2 className=" font-semibold text-xl text-base-content/80">
                      Why AI Recommends This
                    </h2>
                  </div>
                  <p className="mt-2 text-base-content/80">
                    {aiResult?.escalation?.reason}
                  </p>
                </div>
              )}

              {/* ++++++++++ escalation info +++++++++++ */}

              {aiResult?.escalation && (
                <div
                  className={`mt-6 p-4 border rounded-2xl shrink-0 ${
                    aiResult?.escalation.recommended
                      ? "border-warning/20 bg-warning/5"
                      : "border-success/20 bg-success/5"
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`
      h-9 w-9 shrink-0
      flex items-center justify-center
      rounded-xl text-base-100
      ${aiResult?.escalation.recommended ? "bg-warning" : "bg-success"}
    `}
                    >
                      {aiResult?.escalation.recommended ? (
                        <AlertTriangle size={18} />
                      ) : (
                        <CheckCircle2 size={18} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">
                        {aiResult?.escalation.recommended
                          ? "Human Review Recommended"
                          : "Self-Service Recommended"}
                      </h3>

                      <p className="mt-1 text-sm text-base-content/60">
                        {aiResult?.escalation.recommended
                          ? "This issue may require agent assistance due to complexity, risk, or account-specific factors."
                          : "AI believes this issue can likely be resolved without agent involvement by following the suggested steps."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* +++++++++++++++++++++ */}

              {resData?.permission?.canDelete && (
                <div className="mt-5 flex gap-3 justify-end">
                  <GradientButton
                    buttonClassName="from-error/70 to-error"
                    // onClick={handleDeleteTicket}
                  >
                    Delete Ticket
                  </GradientButton>
                </div>
              )}
            </div>
          )}
        </CardWithBlurBlob>

        {/* Conversation */}
        <CardWithBlurBlob
          interactive={false}
          className={`p-0 ${
            dataLoading || !permission?.isCurrentAgent
              ? "hidden"
              : resData?.data?.supportMode === "human"
                ? activeTab === "messages"
                  ? "block"
                  : "hidden lg:block"
                : "hidden"
          }`}
        >
          {/* ======================================== chat box ============================================== */}

          {/* Conversation Header */}
          <div className="border-b border-base-content/10 px-5 py-4">
            <div className="flex flex-wrap items-center gap-3 min-w-0 flex-1">
              <SoftIconCard
                icon={MessagesSquare}
                variant="primary"
                className="shrink-0"
              />

              <div className="flex flex-col min-w-0 flex-1">
                <h3 className="font-semibold truncate">Support Conversation</h3>

                <p className="text-base-content/60 text-xs truncate">
                  {customerInfo?.displayName && customerInfo?.email
                    ? `${customerInfo.displayName} · ${customerInfo.email}`
                    : "Real-time support with AI insights."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {isResolved ? (
                  <GradientButton
                    size="sm"
                    disabled
                    buttonClassName="from-success/5 to-success/10 text-success opacity-100 cursor-default"
                  >
                    <CircleCheck size={16} strokeWidth={2} />
                    <p>Ticket Resolved</p>
                  </GradientButton>
                ) : (
                  <>
                    <GradientButton
                      size="sm"
                      onClick={handleRelease}
                      disabled={
                        releaseLoading || resolveLoading || isGeneratingReply
                      }
                      buttonClassName="from-red-500/80 to-red-600/85 text-white/80"
                    >
                      {releaseLoading ? (
                        <div className="w-17">
                          <span className="loading loading-spinner loading-xs"></span>
                        </div>
                      ) : (
                        <>
                          <CircleX size={16} strokeWidth={2} />
                          <p>Release</p>
                        </>
                      )}
                    </GradientButton>

                    <GradientButton
                      size="sm"
                      onClick={handleResolve}
                      disabled={
                        releaseLoading || resolveLoading || isGeneratingReply
                      }
                      buttonClassName="from-green-500/80 to-green-600/85 text-white/80"
                    >
                      {resolveLoading ? (
                        <div className="w-17">
                          <span className="loading loading-spinner loading-xs"></span>
                        </div>
                      ) : (
                        <>
                          <CircleCheck size={16} strokeWidth={2} />
                          <p>Resolve</p>
                        </>
                      )}
                    </GradientButton>
                  </>
                )}
              </div>
            </div>
          </div>

          {/*=========== Messages Area ==============*/}
          <div
            className={`
    flex-1
    overflow-y-auto
    p-5
    space-y-6
      
         ${
           conversations.length === 0
             ? "flex flex-col items-center justify-center"
             : ""
         }
   
            `}
          >
            {/* Customer Info */}
            <div className="flex flex-col justify-center items-center mb-10">
              <div className="avatar-group -space-x-5">
                <div className="avatar">
                  <div className="w-12 h-12">
                    <img
                      className="w-full h-full object-center object-cover  bg-base-content/10"
                      src={customerInfo?.photoURL}
                    />
                  </div>
                </div>
                <div className="avatar">
                  <div className="w-12 h-12">
                    <img
                      className="w-full h-full object-center object-cover bg-base-200"
                      src={user?.photoURL}
                    />
                  </div>
                </div>
              </div>
              <h3 className="mt-2 text-lg font-bold text-base-content/90">
                {customerInfo?.displayName || "Customer Name"}
              </h3>

              <p className="text-xs text-base-content/60">
                {customerInfo?.email || "customer@email.com"}
              </p>

              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <TextBadge variant="blue" size="xs">
                  {customerInfo?.role || "customer"}
                </TextBadge>

                <TextBadge variant="green" size="xs">
                  {customerInfo?.status || "active"}
                </TextBadge>

                <TextBadge variant="purple" size="xs">
                  {customerInfo?.companyName || "Company"}
                </TextBadge>
              </div>

              {/* Conversation Intro */}
              <div className="mt-4 text-center">
                <h4 className="text-sm font-semibold text-base-content/90">
                  Ready to help?
                </h4>

                <p className="mt-1.5 text-xs leading-relaxed text-base-content/60">
                  Start a conversation with{" "}
                  <span className="font-medium text-base-content/80">
                    {customerInfo?.displayName || "the customer"}
                  </span>{" "}
                  and provide personalized support.
                </p>

                <p className="mt-2 text-xs text-base-content/50">
                  You’re responding as{" "}
                  <span className="font-medium text-base-content/70">
                    {user?.displayName || "Support Agent"}
                  </span>
                  .
                </p>

                {conversations.length === 0 && (
                  <p className="mt-3 text-[11px] text-base-content/40">
                    No messages yet — send a message to get started.
                  </p>
                )}
              </div>
            </div>

            {/* message body */}
            <div className="w-full h-fit">
              {conversationsLoading ? (
                <div className="flex justify-center items-center text-primary">
                  <span className="loading loading-spinner loading-md "></span>
                </div>
              ) : (
                conversations.map((item) => (
                  <div
                    className={`flex ${item?.sender?.role === "agent" ? "flex-row-reverse" : ""} min-w-0 items-start gap-3 mt-4`}
                  >
                    {/* Avatar */}
                    <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden">
                      <img
                        className="object-center object-cover w-full h-full bg-base-content/5"
                        src={item?.sender?.photoURL}
                      />
                    </div>

                    {/* Message Content */}
                    <div className="min-w-0 w-0 flex-1 max-w-[90%] sm:max-w-[70%]">
                      <GradientCard
                        className={`
        w-fit
        max-w-full
        px-4
        sm:px-5
        py-3
        text-sm
        leading-relaxed
        from-primary/10
        to-secondary/5
        text-base-content
        shadow-none
        ${
          item?.sender?.role === "agent"
            ? "ml-auto from-primary/95 to-secondary/95 text-white rounded-b-2xl rounded-l-2xl rounded-r-lg"
            : "from-primary/10 to-secondary/5 text-base-content rounded-b-2xl rounded-r-2xl rounded-l-lg"
        }
              `}
                      >
                        {/* ==================== forating ======================== */}
                        <div className="text-sm leading-relaxed wrap-break-word">
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
                        className={`mt-1 text-[11px] text-base-content/40 ${item?.sender?.role === "agent" ? "text-end" : ""}`}
                      >
                        {item?.sender?.displayName} {" · "}{" "}
                        {formatRelativeDate(item?.createdAt)}{" "}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reply Composer */}
          {!isResolved && (
            <div className="p-4 border-t border-base-content/10 bg-base-100/70">
              <div className="rounded-2xl border border-base-content/10 bg-primary/2 pr-3 pl-4 py-3 flex gap-3 justify-center items-center">
                <textarea
                  rows={3}
                  onInput={handleInput}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a reply or add a draft for AI to improve..."
                  className="flex-1 resize-none outline-none max-h-24 overflow-y-auto text-sm"
                />
              </div>

              <div className="flex flex-wrap justify-between mt-3">
                <p className="text-xs text-base-content/50 mb-3">
                  Reply to {customerInfo?.displayName || "Customer"}
                </p>

                <div className="flex flex-wrap justify-end gap-2">
                  <GradientButton
                    onClick={handleSuggestReply}
                    disabled={isGeneratingReply || !permission?.canSuggestReply}
                    size="sm"
                    buttonClassName={`${
                      isGeneratingReply ||
                      conversationsLoading ||
                      !permission?.canSuggestReply
                        ? "from-primary/10 to-secondary/20 opacity-60 cursor-not-allowed text-base-content/50"
                        : "from-primary to-secondary text-white"
                    }`}
                  >
                    <Sparkles size={16} />
                    {isGeneratingReply ? "Generating..." : "Suggest reply"}
                  </GradientButton>

                  <GradientButton
                    onClick={handleSendMessage}
                    disabled={
                      !message.trim() ||
                      isGeneratingReply ||
                      conversationsLoading ||
                      !permission?.canSendMessage
                    }
                    size="sm"
                    buttonClassName={`${
                      !message.trim() ||
                      conversationsLoading ||
                      isGeneratingReply ||
                      !permission?.canSendMessage
                        ? "from-primary/10 to-secondary/20 opacity-60 cursor-not-allowed text-base-content/50"
                        : "from-primary to-secondary text-white"
                    }`}
                  >
                    <SendHorizonal size={16} />
                    Send
                  </GradientButton>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================================================ */}
        </CardWithBlurBlob>
      </div>
    </div>
  );
};

export default AgentTicketDetails;
