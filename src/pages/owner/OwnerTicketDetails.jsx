import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleCheck,
  Clock3,
  Clock4,
  Lightbulb,
  MessagesSquare,
  SendHorizonal,
  TicketCheck,
  TicketX,
  TriangleAlert,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  WandSparkles,
  X,
} from "lucide-react";

import Swal from "sweetalert2";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { AuthContext } from "@/providers/AuthProvider";
import { formatRelativeDate } from "@/lib/formatRelativeDate";

import GradientButton from "@/components/ui/Button/GradientButton";
import CardWithBlurBlob from "@/components/ui/Card/CardWithBlurBlob";
import TextBadge from "@/components/ui/Badge/TextBadge";
import SoftIconCard from "@/components/ui/Card/SoftIconCard";
import GradientCard from "@/components/ui/Card/GradientCard";

const API_BASE_URL = "https://support-hub-server.vercel.app";

const progressColorMap = {
  green: "text-success",
  success: "text-success",
  emerald: "text-emerald-500",
  yellow: "text-warning",
  warning: "text-warning",
  amber: "text-amber-500",
  red: "text-error",
  error: "text-error",
  blue: "text-info",
  cyan: "text-cyan-500",
  purple: "text-purple-500",
  pink: "text-pink-500",
  slate: "text-base-content/60",
};

const statusVariants = {
  open: "blue",
  assigned: "purple",
  in_progress: "yellow",
  resolved: "green",
  closed: "slate",
};

// =====================================================
// API HELPERS
// =====================================================

async function apiRequest(user, path, options = {}) {
  if (!user) throw new Error("Authentication required");

  const token = await user.getIdToken();
  const { body, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success === false || !result) {
    const error = new Error(
      result?.message || `Request failed (${response.status})`,
    );
    error.status = response.status;
    throw error;
  }

  return result;
}

// =====================================================
// UI HELPERS
// =====================================================

function Avatar({ src, name, className = "h-9 w-9" }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary`}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={name || "User"}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{(name || "U").trim().charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

const markdownComponents = {
  p: ({ children }) => (
    <p className="mb-2 whitespace-pre-wrap last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>
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
    <blockquote className="my-2 border-l-2 border-current/30 pl-3 italic">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-lg bg-black/10 p-3">
      {children}
    </pre>
  ),
  code: ({ children }) => (
    <code className="rounded bg-black/10 px-1 py-0.5 text-xs">{children}</code>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="table table-sm">{children}</table>
    </div>
  ),
};

// =====================================================
// POLISHED SKELETON LOADER (Exact Layout Match)
// =====================================================

function TicketDetailsSkeleton() {
  return (
    <div
      aria-label="Loading ticket details"
      aria-busy="true"
      className="space-y-5 p-4 lg:p-5"
    >
      {/* Header Skeleton */}
      <CardWithBlurBlob interactive={false}>
        <div className="mb-4">
          <div className="skeleton h-4 w-44 rounded-md" />
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="skeleton h-4 w-20 rounded-md" />
              <div className="skeleton h-6 w-24 rounded-full" />
            </div>

            <div className="skeleton mt-3 h-7 w-4/5 max-w-xl rounded-lg sm:h-8" />
            <div className="skeleton mt-2.5 h-4 w-full max-w-2xl rounded-md" />
            <div className="skeleton mt-1.5 h-4 w-2/3 max-w-lg rounded-md" />

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <div className="skeleton h-6 w-20 rounded-full" />
              <div className="skeleton h-6 w-28 rounded-full" />
              <div className="skeleton h-6 w-24 rounded-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-72 lg:shrink-0">
            <div className="rounded-2xl border border-base-content/10 bg-base-100/60 px-4 py-3">
              <div className="skeleton h-3 w-14 rounded" />
              <div className="skeleton mt-2 h-4 w-24 rounded" />
            </div>

            <div className="rounded-2xl border border-base-content/10 bg-base-100/60 px-4 py-3">
              <div className="skeleton h-3 w-14 rounded" />
              <div className="skeleton mt-2 h-4 w-24 rounded" />
            </div>

            <div className="sm:col-span-2">
              <div className="skeleton h-11 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </CardWithBlurBlob>

      {/* Main Split View Skeleton */}
      <div className="grid h-[89svh] min-h-0 gap-3 lg:grid-cols-2">
        {/* Left Details Skeleton */}
        <CardWithBlurBlob
          interactive={false}
          className="h-full overflow-hidden"
        >
          <div className="space-y-6">
            <div className="rounded-2xl border border-base-content/10 p-4">
              <div className="skeleton h-4 w-40 rounded-md" />
              <div className="skeleton mt-3 h-3.5 w-full rounded" />
              <div className="skeleton mt-2 h-3.5 w-11/12 rounded" />
              <div className="skeleton mt-2 h-3.5 w-3/4 rounded" />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="skeleton h-4 w-28 rounded" />
              <div className="skeleton h-4 w-32 rounded" />
              <div className="skeleton h-4 w-24 rounded" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-2xl border border-base-content/10 p-4"
                >
                  <div className="space-y-2">
                    <div className="skeleton h-3.5 w-20 rounded" />
                    <div className="skeleton h-3 w-16 rounded" />
                  </div>
                  <div className="skeleton h-10 w-10 rounded-full" />
                </div>
              ))}
            </div>

            <div className="space-y-2 border-b border-base-content/10 pb-5">
              <div className="skeleton h-6 w-44 rounded-lg" />
              <div className="skeleton h-3.5 w-full rounded" />
              <div className="skeleton h-3.5 w-5/6 rounded" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="skeleton h-24 rounded-2xl" />
              <div className="skeleton h-24 rounded-2xl" />
            </div>
          </div>
        </CardWithBlurBlob>

        {/* Right Conversation Skeleton */}
        <CardWithBlurBlob
          interactive={false}
          className="hidden h-full flex-col overflow-hidden p-0 lg:flex"
        >
          <div className="flex items-center justify-between border-b border-base-content/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="skeleton h-10 w-10 rounded-xl" />
              <div className="space-y-1.5">
                <div className="skeleton h-4 w-40 rounded" />
                <div className="skeleton h-3 w-52 rounded" />
              </div>
            </div>
            <div className="skeleton h-8 w-20 rounded-xl" />
          </div>

          <div className="flex-1 space-y-6 p-5">
            <div className="flex flex-col items-center">
              <div className="flex -space-x-3">
                <div className="skeleton h-12 w-12 rounded-full" />
                <div className="skeleton h-12 w-12 rounded-full" />
              </div>
              <div className="skeleton mt-3 h-5 w-32 rounded" />
              <div className="skeleton mt-1.5 h-3 w-44 rounded" />
            </div>

            <div className="flex items-start gap-3">
              <div className="skeleton h-8 w-8 shrink-0 rounded-full" />
              <div className="skeleton h-20 w-3/4 rounded-2xl" />
            </div>

            <div className="flex flex-row-reverse items-start gap-3">
              <div className="skeleton h-8 w-8 shrink-0 rounded-full" />
              <div className="skeleton h-20 w-3/4 rounded-2xl" />
            </div>
          </div>

          <div className="border-t border-base-content/10 p-4">
            <div className="skeleton h-16 w-full rounded-2xl" />
            <div className="mt-3 flex items-center justify-between">
              <div className="skeleton h-3 w-36 rounded" />
              <div className="skeleton h-8 w-20 rounded-xl" />
            </div>
          </div>
        </CardWithBlurBlob>
      </div>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function OwnerTicketDetails() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { ticketId } = useParams();

  return (
    <OwnerTicketDetailsContent
      key={`${user?.uid || "guest"}:${ticketId}`}
      user={user}
      authLoading={authLoading}
      ticketId={ticketId}
    />
  );
}

function OwnerTicketDetailsContent({ user, authLoading, ticketId }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("details");
  const [message, setMessage] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAgentUid, setSelectedAgentUid] = useState("");

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 1. Fetch Ticket Details
  const ticketQuery = useQuery({
    queryKey: ["owner-ticket-details", user?.uid || null, ticketId],
    enabled: !authLoading && !!user && !!ticketId,
    queryFn: ({ signal }) =>
      apiRequest(user, `/owner/tickets/${ticketId}`, { method: "GET", signal }),
    staleTime: 10_000,
    retry: (failureCount, error) => {
      if (error?.status >= 400 && error?.status < 500) return false;
      return failureCount < 1;
    },
  });

  const ticketData = ticketQuery.data?.ticket || ticketQuery.data?.data || null;

  const status = ticketData?.status || "";
  const agentInfo = ticketData?.currentAgentInfo || ticketData?.agentInfo || {};

  // Hide conversation panel when ticket is solved by AI OR open without an assigned agent
  const isAiSolved =
    ticketData?.aiResolved === true ||
    ticketData?.supportMode === "ai" ||
    ticketData?.resolutionSource === "ai";
  const isUnassignedOpen = status === "open" && !agentInfo?.uid;
  const showConversation = Boolean(
    ticketData && !isAiSolved && !isUnassignedOpen,
  );

  // 2. Fetch Conversations (only when conversation panel is visible)
  const messagesQuery = useQuery({
    queryKey: ["owner-ticket-messages", user?.uid || null, ticketId],
    enabled:
      !authLoading &&
      !!user &&
      !!ticketId &&
      showConversation &&
      ticketData?.permission?.canReadMessages !== false,
    queryFn: ({ signal }) =>
      apiRequest(user, `/owner/tickets/${ticketId}/messages`, {
        method: "GET",
        signal,
      }),
    refetchInterval:
      showConversation && !["resolved", "closed"].includes(status)
        ? 15_000
        : false,
  });

  const conversations = messagesQuery.data?.conversations || [];

  // 3. Fetch Eligible Agents when assign modal opens
  const eligibleAgentsQuery = useQuery({
    queryKey: ["owner-eligible-agents", user?.uid || null, ticketId],
    enabled: isAssignModalOpen && !!user && !!ticketId,
    queryFn: ({ signal }) =>
      apiRequest(user, `/owner/tickets/${ticketId}/eligible-agents`, {
        method: "GET",
        signal,
      }),
    staleTime: 10_000,
  });

  const eligibleAgents = eligibleAgentsQuery.data?.agents || [];

  // 4. Assign / Reassign Mutation
  const assignMutation = useMutation({
    mutationFn: (agentUid) =>
      apiRequest(user, `/owner/tickets/${ticketId}/assign`, {
        method: "PATCH",
        body: { agentUid },
      }),
    onSuccess: (res) => {
      toast.success(res?.message || "Agent assigned successfully");
      setIsAssignModalOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["owner-ticket-details", user?.uid || null, ticketId],
      });
      queryClient.invalidateQueries({ queryKey: ["owner-tickets"] });
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to assign agent");
    },
  });

  // 5. Unassign Mutation
  const unassignMutation = useMutation({
    mutationFn: () =>
      apiRequest(user, `/owner/tickets/${ticketId}/unassign`, {
        method: "PATCH",
      }),
    onSuccess: (res) => {
      toast.success(res?.message || "Agent unassigned from ticket");
      setActiveTab("details");
      queryClient.invalidateQueries({
        queryKey: ["owner-ticket-details", user?.uid || null, ticketId],
      });
      queryClient.invalidateQueries({ queryKey: ["owner-tickets"] });
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to unassign agent");
    },
  });

  // 6. Resolve Mutation
  const resolveMutation = useMutation({
    mutationFn: () =>
      apiRequest(user, `/owner/tickets/${ticketId}/resolve`, {
        method: "PATCH",
      }),
    onSuccess: (res) => {
      setMessage("");
      toast.success(res?.message || "Ticket resolved successfully");
      queryClient.invalidateQueries({
        queryKey: ["owner-ticket-details", user?.uid || null, ticketId],
      });
      queryClient.invalidateQueries({ queryKey: ["owner-tickets"] });
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to resolve ticket");
    },
  });

  // 7. Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: (draft) =>
      apiRequest(user, `/owner/tickets/${ticketId}/messages`, {
        method: "POST",
        body: { message: draft },
      }),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({
        queryKey: ["owner-ticket-messages", user?.uid || null, ticketId],
      });
      queryClient.invalidateQueries({
        queryKey: ["owner-ticket-details", user?.uid || null, ticketId],
      });
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to send message");
    },
  });

  const busy =
    assignMutation.isPending ||
    unassignMutation.isPending ||
    resolveMutation.isPending ||
    sendMessageMutation.isPending;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [message, activeTab, showConversation]);

  useEffect(() => {
    if (!showConversation) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [conversations.length, activeTab, showConversation]);

  if (authLoading || (user && ticketQuery.isPending && !ticketData)) {
    return <TicketDetailsSkeleton />;
  }

  if (!user) {
    return (
      <div className="p-4 lg:p-5">
        <CardWithBlurBlob className="p-10 text-center" interactive={false}>
          <p className="text-base font-medium text-base-content/75">
            Authentication required
          </p>
          <p className="mt-1 text-sm text-base-content/55">
            Sign in with your workspace owner account to view ticket details.
          </p>
        </CardWithBlurBlob>
      </div>
    );
  }

  if (ticketQuery.error && !ticketData) {
    return (
      <div className="p-4 lg:p-5">
        <CardWithBlurBlob className="p-10 text-center" interactive={false}>
          <p className="text-base font-medium text-base-content/75">
            Unable to load ticket details
          </p>
          <p className="mt-1 text-sm text-base-content/55">
            {ticketQuery.error.message || "Ticket not found or unavailable."}
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/owner/tickets")}
              className="rounded-xl border border-base-content/15 px-4 py-2 text-xs font-medium hover:bg-base-200"
            >
              Back to Tickets
            </button>
            <GradientButton
              type="button"
              size="sm"
              onClick={() => ticketQuery.refetch()}
              buttonClassName="from-primary to-secondary text-white px-4"
            >
              Try again
            </GradientButton>
          </div>
        </CardWithBlurBlob>
      </div>
    );
  }

  const aiResult = ticketData?.aiResult || {};
  const permission = ticketData?.permission || {};
  const customerInfo = ticketData?.userInfo || {};

  const states = Array.isArray(aiResult.states) ? aiResult.states : [];
  const metrics = Array.isArray(aiResult.metrics) ? aiResult.metrics : [];
  const recommendations = Array.isArray(aiResult.recommendations)
    ? aiResult.recommendations
    : [];
  const steps = Array.isArray(aiResult.steps) ? aiResult.steps : [];

  const originalDescription =
    typeof ticketData?.ticketData === "string"
      ? ticketData.ticketData
      : ticketData?.ticketData?.description || ticketData?.description || "";

  const title =
    aiResult.ticketTitle ||
    ticketData?.ticketData?.subject ||
    ticketData?.subject ||
    "Untitled Ticket";

  const isClosedOrResolved = ["resolved", "closed"].includes(status);
  const canAssignOrReassign =
    permission.canAssign ?? (!isClosedOrResolved && !isAiSolved);
  const canUnassign =
    permission.canUnassign ?? (!isClosedOrResolved && Boolean(agentInfo?.uid));
  const canResolve =
    permission.canResolve ?? (!isClosedOrResolved && !isAiSolved);
  const canSendMessage =
    permission.canSendMessage ?? (!isClosedOrResolved && !isAiSolved);

  // =====================================================
  // HANDLERS
  // =====================================================

  const openAssignModal = () => {
    setSelectedAgentUid(agentInfo?.uid || "");
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!selectedAgentUid || busy) return;
    assignMutation.mutate(selectedAgentUid);
  };

  const handleTicketAction = async (action) => {
    if (busy) return;

    const result = await Swal.fire({
      title:
        action === "unassign"
          ? "Unassign current agent?"
          : "Resolve this ticket?",
      text:
        action === "unassign"
          ? "This ticket will return to the company queue."
          : "This ticket will be marked as resolved. Further replies will be disabled.",
      icon: action === "unassign" ? "warning" : "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText:
        action === "unassign" ? "Yes, unassign" : "Yes, resolve",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    if (action === "unassign") {
      unassignMutation.mutate();
    } else if (action === "resolve") {
      resolveMutation.mutate();
    }
  };

  const handleSendMessage = () => {
    const draft = message.trim();
    if (!canSendMessage || !draft || busy) return;

    if (draft.length > 10000) {
      toast.error("Message must be at most 10000 characters");
      return;
    }

    sendMessageMutation.mutate(draft);
  };

  return (
    <div className="space-y-5 p-4 lg:p-5">
      {/* Ticket header */}
      <CardWithBlurBlob interactive={false}>
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate("/owner/tickets")}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-base-content/60 transition hover:text-primary"
          >
            <ArrowLeft size={14} />
            Back to Workspace Tickets
          </button>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/50">
              <span className="font-mono">
                # {ticketData.ticketNumber || "—"}
              </span>

              <TextBadge variant={statusVariants[status] || "slate"}>
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current" />
                {status.replaceAll("_", " ") || "Unknown"}
              </TextBadge>

              {isAiSolved && (
                <TextBadge variant="purple">AI resolved</TextBadge>
              )}
            </div>

            <h1 className="mt-3 text-xl font-bold leading-tight sm:text-2xl">
              {title}
            </h1>

            <p className="mt-1 max-w-4xl whitespace-pre-wrap text-sm leading-6 text-base-content/60">
              {aiResult.summary || originalDescription}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {(aiResult.category || ticketData.category) && (
                <TextBadge variant="cyan">
                  {aiResult.category || ticketData.category}
                </TextBadge>
              )}

              {states.map((item, index) => (
                <TextBadge key={index} variant={item.variant || "slate"}>
                  {item.value} {item.title}
                </TextBadge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:shrink-0">
            {[
              {
                label: "Created",
                value: ticketData.createdAt,
                Icon: CalendarDays,
              },
              {
                label: "Updated",
                value: ticketData.updatedAt,
                Icon: Clock3,
              },
            ].map(({ label, value, Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-base-content/10 bg-base-100/60 px-4 py-3"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-base-content/50">
                  <Icon size={13} />
                  {label}
                </div>

                <p className="mt-1 text-xs font-medium sm:text-sm">
                  {value ? formatRelativeDate(value) : "—"}
                </p>
              </div>
            ))}

            <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
              {canAssignOrReassign && (
                <GradientButton
                  size="md"
                  className="flex-1"
                  disabled={busy}
                  onClick={openAssignModal}
                  buttonClassName="from-primary to-secondary text-white"
                >
                  <UserPlus size={16} />
                  {agentInfo?.uid ? "Reassign" : "Assign Agent"}
                </GradientButton>
              )}

              {canUnassign && (
                <GradientButton
                  size="md"
                  className="flex-1"
                  disabled={busy}
                  onClick={() => handleTicketAction("unassign")}
                  buttonClassName="from-red-500/80 to-red-600/85 text-white"
                >
                  <UserMinus size={16} />
                  {unassignMutation.isPending ? "Unassigning..." : "Unassign"}
                </GradientButton>
              )}

              {status === "resolved" && (
                <GradientButton
                  size="md"
                  disabled
                  className="w-full"
                  buttonClassName="from-success/5 to-success/10 text-success opacity-100"
                >
                  <TicketCheck size={16} />
                  Ticket Resolved
                </GradientButton>
              )}

              {status === "closed" && (
                <GradientButton
                  size="md"
                  disabled
                  className="w-full"
                  buttonClassName="from-base-content/5 to-base-content/10 text-base-content/60 opacity-100"
                >
                  <TicketX size={16} />
                  Ticket Closed
                </GradientButton>
              )}
            </div>
          </div>
        </div>
      </CardWithBlurBlob>

      {/* Mobile tabs (only shown when conversation panel is visible) */}
      {showConversation && (
        <div className="flex justify-center lg:hidden">
          <div className="grid w-fit grid-cols-2">
            {["details", "messages"].map((tab, index) => (
              <GradientButton
                key={tab}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className="min-w-[120px]"
                rounded={
                  index === 0
                    ? "rounded-none rounded-l-xl"
                    : "rounded-none rounded-r-xl"
                }
                buttonClassName={
                  activeTab === tab
                    ? "from-primary to-secondary text-white"
                    : "from-primary/10 to-secondary/10 text-base-content"
                }
              >
                {tab === "details" ? "Details" : "Messages"}
              </GradientButton>
            ))}
          </div>
        </div>
      )}

      {/* Main Layout: 2-column split when conversation is visible, full width when hidden */}
      <div
        className={`grid min-h-0 gap-3 ${
          showConversation ? "h-[89svh] lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* Details panel */}
        <CardWithBlurBlob
          interactive={false}
          className={`min-h-0 overflow-hidden ${
            showConversation ? "h-full" : ""
          } ${
            !showConversation || activeTab === "details" ? "block" : "hidden"
          } lg:block`}
        >
          <div
            className={`${
              showConversation ? "h-full overflow-y-auto pr-2" : ""
            }`}
          >
            {originalDescription && (
              <div className="mb-5 rounded-2xl border border-base-content/10 p-4">
                <h2 className="text-sm font-semibold">
                  Customer&apos;s Description
                </h2>

                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-base-content/70">
                  {originalDescription}
                </p>
              </div>
            )}

            {metrics.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {metrics.map((item, index) => (
                  <div key={index} className="mr-6 flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <p className="text-xs text-base-content/60">
                      {item.label}:
                    </p>
                    <p className="text-xs font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            )}

            {states.length > 0 && (
              <div
                className={`mt-5 grid gap-4 ${
                  states.length >= 3
                    ? "md:grid-cols-2 lg:grid-cols-3"
                    : states.length === 2
                      ? "sm:grid-cols-2"
                      : "grid-cols-1"
                }`}
              >
                {states.map((state, index) => {
                  const value = Math.min(
                    100,
                    Math.max(0, parseFloat(state.value) || 0),
                  );

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
                          <p className="text-[11px] text-base-content/60">
                            {state.description}
                          </p>
                        </div>

                        {String(state.value).includes("%") ? (
                          <div
                            className={`radial-progress shrink-0 text-[10px] font-semibold ${
                              progressColorMap[state.variant] || "text-primary"
                            }`}
                            style={{
                              "--value": value,
                              "--size": "2.7rem",
                            }}
                            role="progressbar"
                            aria-label={state.title}
                            aria-valuenow={value}
                            aria-valuemin={0}
                            aria-valuemax={100}
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

            {aiResult.rootCause && (
              <div className="mt-6 border-b border-base-content/10 pb-5">
                <div className="flex items-center gap-2">
                  <SoftIconCard
                    icon={TriangleAlert}
                    className="h-6 w-6 rounded-lg"
                    size={14}
                    variant="warning"
                  />
                  <h2 className="text-xl font-semibold">Likely Root Cause</h2>
                </div>

                <p className="mt-2 text-sm leading-6 text-base-content/80">
                  {aiResult.rootCause}
                </p>
              </div>
            )}

            {recommendations.length > 0 && (
              <div className="mt-6 border-b border-base-content/10 pb-5">
                <div className="flex items-center gap-2">
                  <SoftIconCard
                    icon={Lightbulb}
                    className="h-6 w-6 rounded-lg"
                    size={14}
                    variant="cyan"
                  />
                  <h2 className="text-xl font-semibold">Recommended Actions</h2>
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {recommendations.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 rounded-2xl border-2 border-dashed border-base-content/10 p-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10">
                        <CheckCircle2 size={16} className="text-success" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{item.title}</h3>
                          {item.impact && (
                            <TextBadge variant={item.variant || "slate"}>
                              {item.impact}
                            </TextBadge>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-base-content/60">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {steps.length > 0 && (
              <div className="mt-6 border-b border-base-content/10 pb-5">
                <div className="flex items-center gap-2">
                  <SoftIconCard
                    icon={Clock4}
                    className="h-6 w-6 rounded-lg"
                    size={14}
                    variant="pink"
                  />
                  <h2 className="text-xl font-semibold">
                    Suggested Resolution Steps
                  </h2>
                </div>

                <div className="mt-8 space-y-6">
                  {steps.map((step, index) => (
                    <div key={index} className="relative flex gap-5">
                      <div className="relative flex flex-col items-center">
                        <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-base-300 text-sm font-semibold">
                          {step.id || index + 1}
                        </div>

                        {index !== steps.length - 1 && (
                          <div className="absolute -bottom-4 top-10 w-px bg-base-content/20" />
                        )}
                      </div>

                      <div className="flex-1 pb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{step.title}</h3>

                          {step.estimatedTime && (
                            <span className="badge badge-sm bg-base-content/10">
                              {step.estimatedTime}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-base-content/60">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {aiResult.escalation?.reason && (
              <div className="mt-6">
                <div className="flex items-center gap-2">
                  <SoftIconCard
                    icon={WandSparkles}
                    className="h-6 w-6 rounded-lg"
                    size={14}
                    variant="purple"
                  />
                  <h2 className="text-xl font-semibold">
                    Why AI Recommends This
                  </h2>
                </div>

                <p className="mt-2 text-sm leading-6 text-base-content/80">
                  {aiResult.escalation.reason}
                </p>
              </div>
            )}

            {aiResult.escalation && (
              <div
                className={`mt-6 rounded-2xl border p-4 ${
                  aiResult.escalation.recommended
                    ? "border-warning/20 bg-warning/5"
                    : "border-success/20 bg-success/5"
                }`}
              >
                <div className="flex gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white ${
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

                  <div>
                    <h3 className="font-semibold">
                      {aiResult.escalation.recommended
                        ? "Human Review Recommended"
                        : "Self-Service Recommended"}
                    </h3>

                    <p className="mt-1 text-sm text-base-content/60">
                      {aiResult.escalation.recommended
                        ? "This issue may need agent assistance due to complexity, risk, or account-specific factors."
                        : "The suggested steps may help the customer resolve this issue."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardWithBlurBlob>

        {/* Conversation panel (Hidden when ticket is open/unassigned or solved by AI) */}
        {showConversation && (
          <CardWithBlurBlob
            interactive={false}
            className={`h-full min-h-0 flex-col overflow-hidden p-0 ${
              activeTab === "messages" ? "flex" : "hidden lg:flex"
            }`}
          >
            <div className="shrink-0 border-b border-base-content/10 px-5 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <SoftIconCard
                  icon={MessagesSquare}
                  variant="primary"
                  className="shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">
                    Support Conversation
                  </h3>
                  <p className="truncate text-xs text-base-content/60">
                    {[customerInfo.displayName, customerInfo.email]
                      .filter(Boolean)
                      .join(" · ") || "Customer conversation"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {canResolve && (
                    <GradientButton
                      size="sm"
                      disabled={busy}
                      onClick={() => handleTicketAction("resolve")}
                      buttonClassName="from-green-500/80 to-green-600/85 text-white"
                    >
                      <CircleCheck size={16} />
                      {resolveMutation.isPending ? "Resolving..." : "Resolve"}
                    </GradientButton>
                  )}
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
              <div className="mb-8 flex flex-col items-center text-center">
                <div className="flex -space-x-3">
                  <Avatar
                    src={customerInfo.photoURL}
                    name={customerInfo.displayName || "Customer"}
                    className="h-12 w-12 ring-2 ring-base-100"
                  />
                  <Avatar
                    src={agentInfo?.photoURL || user?.photoURL}
                    name={
                      agentInfo?.displayName ||
                      user?.displayName ||
                      "Support Team"
                    }
                    className="h-12 w-12 ring-2 ring-base-100"
                  />
                </div>

                <h3 className="mt-2 text-lg font-semibold">
                  {customerInfo.displayName || "Customer"}
                </h3>

                {customerInfo.email && (
                  <p className="text-xs text-base-content/60">
                    {customerInfo.email}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <TextBadge variant="blue" size="xs">
                    {customerInfo.role || "customer"}
                  </TextBadge>

                  {agentInfo?.displayName && (
                    <TextBadge variant="purple" size="xs">
                      Agent: {agentInfo.displayName}
                    </TextBadge>
                  )}

                  {customerInfo.status && (
                    <TextBadge
                      variant={
                        customerInfo.status === "active" ? "green" : "slate"
                      }
                      size="xs"
                    >
                      {customerInfo.status}
                    </TextBadge>
                  )}
                </div>

                <p className="mt-4 text-xs text-base-content/50">
                  {canSendMessage
                    ? `You are responding as ${
                        user?.displayName || "Workspace Owner"
                      }.`
                    : "This conversation is read-only."}
                </p>
              </div>

              {messagesQuery.isPending ? (
                <div className="space-y-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="skeleton h-8 w-8 shrink-0 rounded-full" />
                    <div className="skeleton h-16 w-2/3 rounded-2xl" />
                  </div>
                  <div className="flex flex-row-reverse items-start gap-3">
                    <div className="skeleton h-8 w-8 shrink-0 rounded-full" />
                    <div className="skeleton h-16 w-2/3 rounded-2xl" />
                  </div>
                </div>
              ) : conversations.length === 0 ? (
                <p className="py-6 text-center text-sm text-base-content/50">
                  {canSendMessage
                    ? "No messages yet. Send a reply to get started."
                    : "No messages in this conversation."}
                </p>
              ) : (
                conversations.map((item) => {
                  const senderUid =
                    item.sender?.uid || item.senderUid || item.uid || "";
                  const currentUid = user?.uid || "";
                  const isMine =
                    Boolean(senderUid && currentUid) &&
                    String(senderUid).trim() === String(currentUid).trim();

                  return (
                    <div
                      key={item._id}
                      className={`flex min-w-0 items-start gap-3 ${
                        isMine ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Avatar
                        src={item.sender?.photoURL || item.photoURL}
                        name={
                          item.sender?.displayName || item.senderName || "User"
                        }
                        className="h-8 w-8"
                      />

                      <div className="min-w-0 max-w-[85%] sm:max-w-[75%]">
                        <GradientCard
                          className={`max-w-full px-4 py-3 text-sm leading-relaxed shadow-none ${
                            isMine
                              ? "ml-auto rounded-b-2xl rounded-l-2xl rounded-r-lg from-primary/95 to-secondary/95 text-white"
                              : "rounded-b-2xl rounded-l-lg rounded-r-2xl from-primary/10 to-secondary/5 text-base-content"
                          }`}
                        >
                          <div className="min-w-0 break-words [overflow-wrap:anywhere]">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={markdownComponents}
                            >
                              {item.message || ""}
                            </ReactMarkdown>
                          </div>
                        </GradientCard>

                        <p
                          className={`mt-1 text-[11px] text-base-content/40 ${
                            isMine ? "text-end" : ""
                          }`}
                        >
                          {item.sender?.displayName ||
                            item.senderName ||
                            "User"}
                          {item.sender?.role || item.senderRole
                            ? ` (${item.sender?.role || item.senderRole})`
                            : ""}
                          {" · "}
                          {item.createdAt
                            ? formatRelativeDate(item.createdAt)
                            : ""}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Reply composer */}
            {canSendMessage ? (
              <div className="shrink-0 border-t border-base-content/10 bg-base-100/70 p-4">
                <div className="rounded-2xl border border-base-content/10 bg-primary/2 px-4 py-3">
                  <textarea
                    ref={textareaRef}
                    rows={2}
                    value={message}
                    maxLength={10000}
                    aria-label="Reply to customer"
                    disabled={busy}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        !event.shiftKey &&
                        !event.nativeEvent.isComposing
                      ) {
                        event.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Write a reply to customer & agent..."
                    className="max-h-[120px] w-full resize-none overflow-y-auto bg-transparent text-sm outline-none disabled:opacity-60"
                  />
                </div>

                <div className="mt-2 flex justify-between gap-2 text-[11px] text-base-content/45">
                  <span>Enter to send · Shift+Enter for a new line</span>
                  <span>{message.length}/10000</span>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-base-content/50">
                    Reply to {customerInfo.displayName || "Customer"}
                  </p>

                  <div className="flex flex-wrap justify-end gap-2">
                    <GradientButton
                      size="sm"
                      onClick={handleSendMessage}
                      disabled={busy || !message.trim()}
                      buttonClassName="from-primary to-secondary text-white disabled:opacity-50"
                    >
                      <SendHorizonal size={16} />
                      {sendMessageMutation.isPending ? "Sending..." : "Send"}
                    </GradientButton>
                  </div>
                </div>
              </div>
            ) : (
              <div className="shrink-0 border-t border-base-content/10 p-4 text-center text-sm text-base-content/60">
                {status === "closed"
                  ? "This ticket is closed. Messages are read-only."
                  : status === "resolved"
                    ? "This ticket is resolved. Messages are read-only."
                    : "You cannot send messages to this ticket."}
              </div>
            )}
          </CardWithBlurBlob>
        )}
      </div>

      {/* Assign / Reassign modal */}
      {isAssignModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => !busy && setIsAssignModalOpen(false)}
        >
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardWithBlurBlob
              interactive={false}
              className="border border-base-content/10 bg-base-100 p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3 border-b border-base-content/10 pb-4">
                <div className="flex items-center gap-3">
                  <SoftIconCard
                    icon={UserPlus}
                    variant="primary"
                    className="h-10 w-10 shrink-0 rounded-xl"
                  />
                  <div>
                    <h3 className="text-base font-bold">
                      {agentInfo?.uid
                        ? "Reassign Ticket"
                        : "Assign Ticket to Agent"}
                    </h3>
                    <p className="mt-0.5 line-clamp-1 font-mono text-xs text-base-content/50">
                      #{ticketData.ticketNumber} · {title}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setIsAssignModalOpen(false)}
                  aria-label="Close modal"
                  className="rounded-xl p-1.5 text-base-content/50 transition hover:bg-base-content/10 hover:text-base-content"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAssignSubmit} className="mt-5 space-y-5">
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-base-content/75">
                    <Users size={14} className="text-primary" />
                    Select Active &amp; Approved Agent
                  </label>

                  {eligibleAgentsQuery.isPending ? (
                    <div className="skeleton h-11 w-full rounded-xl" />
                  ) : eligibleAgentsQuery.error ? (
                    <p className="text-xs text-error">
                      {eligibleAgentsQuery.error.message ||
                        "Failed to load agents"}
                    </p>
                  ) : (
                    <select
                      value={selectedAgentUid}
                      onChange={(e) => setSelectedAgentUid(e.target.value)}
                      required
                      disabled={busy || eligibleAgents.length === 0}
                      className="select select-bordered h-11 w-full rounded-xl border-base-content/15 bg-base-100/80 text-xs font-medium focus:border-primary focus:outline-none"
                    >
                      <option value="" disabled>
                        {eligibleAgents.length === 0
                          ? "No active approved agents available"
                          : "Choose an agent..."}
                      </option>
                      {eligibleAgents.map((ag) => (
                        <option key={ag.uid} value={ag.uid}>
                          {ag.displayName || ag.email} ({ag.email}) · Active:{" "}
                          {ag.activeCount ?? 0}
                        </option>
                      ))}
                    </select>
                  )}

                  <p className="mt-2 text-[11px] leading-relaxed text-base-content/50">
                    Only verified, active agents in this company can be assigned
                    to this ticket.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 border-t border-base-content/10 pt-4">
                  <GradientButton
                    type="button"
                    size="sm"
                    disabled={busy}
                    onClick={() => setIsAssignModalOpen(false)}
                    buttonClassName="from-base-content/10 to-base-content/5 text-base-content/80 hover:from-base-content/15 hover:to-base-content/10 px-4"
                  >
                    Cancel
                  </GradientButton>

                  <GradientButton
                    type="submit"
                    size="sm"
                    disabled={
                      busy ||
                      !selectedAgentUid ||
                      selectedAgentUid === agentInfo?.uid
                    }
                    buttonClassName="from-primary to-secondary text-white px-4"
                  >
                    <UserCheck size={15} className="shrink-0" />
                    <span>
                      {assignMutation.isPending
                        ? "Saving..."
                        : "Confirm Assignment"}
                    </span>
                  </GradientButton>
                </div>
              </form>
            </CardWithBlurBlob>
          </div>
        </div>
      )}
    </div>
  );
}
