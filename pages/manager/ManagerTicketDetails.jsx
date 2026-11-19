import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";

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
  RefreshCw,
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

import { AuthContext } from "../../app/providers/AuthProvider";
import { formatRelativeDate } from "../../src/lib/formatRelativeDate";

import GradientButton from "../../components/ui/Button/GradientButton";
import CardWithBlurBlob from "../../components/ui/Card/CardWithBlurBlob";
import TextBadge from "../../components/ui/Badge/TextBadge";
import SoftIconCard from "../../components/ui/Card/SoftIconCard";
import GradientCard from "../../components/ui/Card/GradientCard";
import AccountStatusNotice from "../../components/ui/Notice/AccountStatusNotice";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3021"
).replace(/\/+$/, "");

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

// Same-file request helper.
async function requestApi(user, path, options = {}) {
  if (!user) {
    throw new Error("Please sign in to continue");
  }

  const token = await user.getIdToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
      authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success === false) {
    const error = new Error(
      result?.message || `Request failed (${response.status})`,
    );

    error.status = response.status;
    throw error;
  }

  if (!result) {
    throw new Error("The server returned an invalid response");
  }

  return result;
}

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

function ManagerTicketDetailsSkeleton() {
  return (
    <div
      aria-label="Loading ticket details"
      aria-busy="true"
      className="space-y-5 p-4 lg:p-5"
    >
      {/* Header Skeleton */}
      <CardWithBlurBlob interactive={false}>
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

// Remount when the ticket or signed-in user changes.
// Drafts and action states never carry over to another ticket.
export default function ManagerTicketDetails() {
  const { user } = useContext(AuthContext);
  const { ticketId } = useParams();

  return (
    <ManagerTicketDetailsContent
      key={`${user?.uid || "guest"}:${ticketId}`}
      user={user}
      ticketId={ticketId}
    />
  );
}

function ManagerTicketDetailsContent({ user, ticketId }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("details");
  const [message, setMessage] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAgentUid, setSelectedAgentUid] = useState("");

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const actionLock = useRef(false);
  const mountedRef = useRef(true);
  const permissionRef = useRef({});

  const busy = pendingAction !== null;
  const validTicketId = /^[a-f\d]{24}$/i.test(ticketId || "");

  const detailsKey = ["managerTicketDetails", user?.uid, ticketId];
  const messagesKey = ["ticketMessages", user?.uid, ticketId];
  const eligibleAgentsKey = ["managerEligibleAgents", user?.uid, ticketId];

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [message, activeTab]);

  // =====================================================
  // CURRENT MANAGER PROFILE GATE
  // =====================================================

  const profileQuery = useQuery({
    queryKey: ["manager-profile", user?.uid],
    enabled: Boolean(user),
    retry: false,
    queryFn: async ({ signal }) => {
      const result = await requestApi(user, "/users/me", { signal });
      return result.user;
    },
    staleTime: 30_000,
  });

  const managerProfile = profileQuery.data;
  const isRestrictedManager =
    managerProfile?.role === "manager" &&
    (managerProfile?.status !== "active" ||
      ["pending", "rejected"].includes(managerProfile?.verifyIdAgent));

  // =====================================================
  // TICKET DETAILS
  // =====================================================

  const ticketQuery = useQuery({
    queryKey: detailsKey,
    enabled: Boolean(user && validTicketId && !isRestrictedManager),
    retry: false,

    queryFn: ({ signal }) =>
      requestApi(user, `/manager/tickets/${ticketId}`, { signal }),

    refetchInterval: (query) =>
      !busy && query.state.status !== "error" ? 10000 : false,
  });

  const ticketData = ticketQuery.data?.data || ticketQuery.data?.ticket;
  const permission = ticketQuery.isError ? {} : ticketData?.permission || {};

  permissionRef.current = permission;

  const status = ticketData?.status || "";
  const aiResult = ticketData?.aiResult || {};

  const customerInfo = ticketData?.userInfo || ticketData?.customerInfo || {};
  const agentInfo =
    ticketData?.currentAgentInfo ||
    ticketData?.agentInfo ||
    ticketData?.currentAgent ||
    {};

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

  const isAiSolved =
    ticketData?.aiResolved === true ||
    ticketData?.supportMode === "ai" ||
    ticketData?.resolutionSource === "ai";
  const isUnassignedOpen = status === "open" && !agentInfo?.uid;

  const canReadTicket = permission.canRead === true;
  const canReadMessages =
    canReadTicket &&
    permission.canReadMessages === true &&
    !isAiSolved &&
    !isUnassignedOpen;
  const canSendMessage = canReadMessages && permission.canSendMessage === true;

  const isClosedOrResolved = ["resolved", "closed"].includes(status);
  const canAssignOrReassign =
    !isClosedOrResolved &&
    !isAiSolved &&
    Boolean(
      permission.canAssign ||
      permission.canReassign ||
      permission.canManageAssignment,
    );
  const canUnassign =
    !isClosedOrResolved &&
    Boolean(agentInfo?.uid) &&
    Boolean(permission.canUnassign || permission.canRelease);

  // =====================================================
  // ELIGIBLE AGENTS FOR ASSIGN / REASSIGN
  // =====================================================

  const agentsQuery = useQuery({
    queryKey: eligibleAgentsKey,
    enabled: Boolean(user && isAssignModalOpen && validTicketId),
    queryFn: ({ signal }) =>
      requestApi(user, `/manager/tickets/${ticketId}/eligible-agents`, {
        signal,
      }),
  });

  const eligibleAgents = useMemo(() => {
    return Array.isArray(agentsQuery.data?.agents)
      ? agentsQuery.data.agents
      : [];
  }, [agentsQuery.data]);

  // =====================================================
  // CONVERSATIONS
  // =====================================================

  const messagesQuery = useQuery({
    queryKey: messagesKey,

    enabled: Boolean(user && validTicketId && canReadMessages),

    retry: false,

    queryFn: ({ signal }) =>
      requestApi(user, `/tickets/${ticketId}/conversations`, {
        signal,
      }),

    refetchInterval: (query) =>
      canReadMessages && !busy && query.state.status !== "error" ? 5000 : false,
  });

  const conversations =
    canReadMessages && Array.isArray(messagesQuery.data?.data)
      ? messagesQuery.data.data
      : [];

  const lastMessageId = conversations[conversations.length - 1]?._id;

  useEffect(() => {
    if (!ticketQuery.isSuccess) return;

    if (!canReadMessages) {
      setActiveTab("details");
    }

    if (!canSendMessage) {
      setMessage("");
    }
  }, [ticketQuery.isSuccess, canReadMessages, canSendMessage]);

  useEffect(() => {
    if (!canReadMessages) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [lastMessageId, activeTab, canReadMessages]);

  // =====================================================
  // REFRESH RELATED DATA
  // =====================================================

  const refreshTicketData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: detailsKey,
        exact: true,
      }),
      queryClient.invalidateQueries({
        queryKey: messagesKey,
        exact: true,
      }),
      queryClient.invalidateQueries({
        queryKey: eligibleAgentsKey,
      }),
      queryClient.invalidateQueries({
        queryKey: ["managerTickets"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["manager-overview"],
      }),
    ]);
  };

  // =====================================================
  // ASSIGN / REASSIGN
  // =====================================================

  const openAssignModal = () => {
    setSelectedAgentUid(agentInfo?.uid || "");
    setIsAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAgentUid || actionLock.current) return;

    actionLock.current = true;
    setPendingAction("assign");

    try {
      await requestApi(user, `/manager/tickets/${ticketId}/assign`, {
        method: "PATCH",
        body: JSON.stringify({ agentUid: selectedAgentUid }),
      });

      if (!mountedRef.current) return;

      toast.success(
        agentInfo?.uid
          ? "Ticket reassigned successfully"
          : "Agent assigned successfully",
      );

      setIsAssignModalOpen(false);
      await refreshTicketData();
    } catch (error) {
      if (!mountedRef.current) return;

      toast.error(error.message || "Failed to assign agent");

      if ([403, 404, 409].includes(error.status)) {
        await refreshTicketData();
      }
    } finally {
      actionLock.current = false;

      if (mountedRef.current) {
        setPendingAction(null);
      }
    }
  };

  // =====================================================
  // UNASSIGN / RESOLVE
  // =====================================================

  const handleTicketAction = async (action) => {
    if (actionLock.current) return;

    if (action === "unassign" && !canUnassign) return;
    if (action === "resolve" && !permissionRef.current.canResolve) return;

    actionLock.current = true;
    setPendingAction(action);

    try {
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

      if (!result.isConfirmed || !mountedRef.current) return;

      await requestApi(user, `/manager/tickets/${ticketId}/${action}`, {
        method: "PATCH",
      });

      if (!mountedRef.current) return;

      toast.success(
        {
          unassign: "Agent unassigned from ticket",
          resolve: "Ticket resolved successfully",
        }[action],
      );

      if (action === "resolve") {
        setMessage("");
      }

      await refreshTicketData();
    } catch (error) {
      if (!mountedRef.current) return;

      toast.error(error.message || "Unable to update this ticket");

      if ([403, 404, 409].includes(error.status)) {
        await refreshTicketData();
      }
    } finally {
      actionLock.current = false;

      if (mountedRef.current) {
        setPendingAction(null);
      }
    }
  };

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const handleSendMessage = async () => {
    const draft = message.trim();

    if (actionLock.current || !permissionRef.current.canSendMessage || !draft) {
      return;
    }

    if (draft.length > 10000) {
      toast.error("Message must be at most 10000 characters");
      return;
    }

    actionLock.current = true;
    setPendingAction("send");

    try {
      await requestApi(user, `/tickets/${ticketId}/conversations`, {
        method: "POST",
        body: JSON.stringify({ message: draft }),
      });

      if (!mountedRef.current) return;

      setMessage("");
      await refreshTicketData();
    } catch (error) {
      if (!mountedRef.current) return;

      toast.error(error.message || "Failed to send message");

      if ([403, 404, 409].includes(error.status)) {
        await refreshTicketData();
      }
    } finally {
      actionLock.current = false;

      if (mountedRef.current) {
        setPendingAction(null);
      }
    }
  };

  // =====================================================
  // LOADING / ERROR / ACCESS STATES
  // =====================================================

  if (
    user &&
    (profileQuery.isLoading ||
      (!isRestrictedManager && validTicketId && ticketQuery.isLoading))
  ) {
    return <ManagerTicketDetailsSkeleton />;
  }

  const isAccountRestricted =
    isRestrictedManager ||
    (ticketQuery.error?.status === 403 &&
      /pending|rejected|suspended|not active|approval/i.test(
        ticketQuery.error?.message || "",
      ));

  if (isAccountRestricted) {
    const restrictedStatus =
      managerProfile?.verifyIdAgent === "rejected"
        ? "rejected"
        : managerProfile?.verifyIdAgent === "pending"
          ? "pending"
          : managerProfile?.status;

    return (
      <AccountStatusNotice
        role="manager"
        status={restrictedStatus}
        errorMessage={!managerProfile ? ticketQuery.error?.message : ""}
        rejectionReason={managerProfile?.rejectionReason}
        userEmail={managerProfile?.email || user?.email}
        companyName={managerProfile?.companyName}
        isChecking={profileQuery.isFetching || ticketQuery.isFetching}
        onRefresh={() => {
          profileQuery.refetch();
          if (!isRestrictedManager) ticketQuery.refetch();
        }}
      />
    );
  }

  if (
    !user ||
    !validTicketId ||
    ticketQuery.isError ||
    !ticketData ||
    !canReadTicket
  ) {
    const errorStatus = ticketQuery.error?.status;

    const heading = !user
      ? "Sign in required"
      : !validTicketId
        ? "Invalid ticket link"
        : errorStatus === 404
          ? "Ticket not found"
          : errorStatus === 403 || (ticketData && !canReadTicket)
            ? "Access restricted"
            : "Unable to load ticket";

    const description = !user
      ? "Please sign in with your manager or owner account to view this ticket."
      : !validTicketId
        ? "This ticket URL looks incomplete or malformed. Check the link and try again."
        : errorStatus === 404
          ? "This ticket may have been removed or does not belong to your workspace."
          : ticketQuery.error?.message ||
            "You do not currently have permission to view this ticket.";

    return (
      <div className="p-4 lg:p-5">
        <CardWithBlurBlob
          interactive={false}
          className="flex min-h-[72vh] flex-col items-center justify-center px-6 py-16 text-center"
        >
          <div className="mx-auto flex w-full max-w-sm flex-col items-center">
            <div className="relative mb-5">
              <div className="absolute -inset-2 rounded-3xl bg-warning/15 blur-md" />
              <SoftIconCard
                icon={TriangleAlert}
                variant="warning"
                size={24}
                className="relative h-14 w-14 rounded-2xl border border-warning/20 shadow-xs"
              />
            </div>

            {ticketId && (
              <span className="mb-2.5 rounded-full border border-base-content/10 bg-base-200/70 px-3 py-0.5 font-mono text-[11px] text-base-content/55">
                ID: {ticketId.slice(0, 8)}...
              </span>
            )}

            <h3 className="text-xl font-bold tracking-tight text-base-content">
              {heading}
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-base-content/60">
              {description}
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <GradientButton
                size="sm"
                onClick={() => navigate("/manager/tickets")}
                buttonClassName="from-base-content/10 to-base-content/5 text-base-content hover:from-base-content/15 hover:to-base-content/10 px-4"
              >
                <ArrowLeft size={15} />
                Back to Tickets
              </GradientButton>

              {user && validTicketId && (
                <GradientButton
                  size="sm"
                  disabled={ticketQuery.isFetching}
                  onClick={() => ticketQuery.refetch()}
                  buttonClassName="from-primary to-secondary text-white px-4"
                >
                  <RefreshCw
                    size={14}
                    className={ticketQuery.isFetching ? "animate-spin" : ""}
                  />
                  {ticketQuery.isFetching ? "Retrying..." : "Try Again"}
                </GradientButton>
              )}
            </div>
          </div>
        </CardWithBlurBlob>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 lg:p-5">
      {/* Ticket header */}
      <CardWithBlurBlob interactive={false}>
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
                  {pendingAction === "unassign" ? "Unassigning..." : "Unassign"}
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

      {/* Mobile tabs */}
      {canReadMessages && (
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

      <div
        className={`grid min-h-0 gap-3 ${
          canReadMessages ? "h-[89svh] lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* Details panel */}
        <CardWithBlurBlob
          interactive={false}
          className={`min-h-0 overflow-hidden ${
            canReadMessages ? "h-full" : ""
          } ${
            activeTab === "details" || !canReadMessages ? "block" : "hidden"
          } lg:block`}
        >
          <div
            className={`${
              canReadMessages ? "h-full overflow-y-auto pr-2" : ""
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

        {/* Conversation panel (Hidden when open/unassigned or solved by AI) */}
        {canReadMessages && (
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
                  {permission.canResolve && (
                    <GradientButton
                      size="sm"
                      disabled={busy}
                      onClick={() => handleTicketAction("resolve")}
                      buttonClassName="from-green-500/80 to-green-600/85 text-white"
                    >
                      <CircleCheck size={16} />
                      {pendingAction === "resolve" ? "Resolving..." : "Resolve"}
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
                    src={agentInfo.photoURL || user.photoURL}
                    name={
                      agentInfo.displayName ||
                      user.displayName ||
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

                  {agentInfo.displayName && (
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
                        user.displayName || "Workspace Leadership"
                      }.`
                    : "This conversation is read-only."}
                </p>
              </div>

              {messagesQuery.isLoading ? (
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
              ) : messagesQuery.isError ? (
                <div className="rounded-xl border border-error/20 bg-error/5 p-4 text-center">
                  <p className="text-sm text-error">
                    {messagesQuery.error.message}
                  </p>

                  <button
                    type="button"
                    className="mt-2 text-sm underline"
                    disabled={messagesQuery.isFetching}
                    onClick={async () => {
                      await ticketQuery.refetch();

                      if (permissionRef.current.canReadMessages) {
                        await messagesQuery.refetch();
                      }
                    }}
                  >
                    {messagesQuery.isFetching ? "Retrying..." : "Try again"}
                  </button>
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

                        if (
                          !messagesQuery.isLoading &&
                          !messagesQuery.isError
                        ) {
                          handleSendMessage();
                        }
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
                      disabled={
                        busy ||
                        !message.trim() ||
                        messagesQuery.isLoading ||
                        messagesQuery.isError
                      }
                      buttonClassName="from-primary to-secondary text-white disabled:opacity-50"
                    >
                      <SendHorizonal size={16} />
                      {pendingAction === "send" ? "Sending..." : "Send"}
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

                  {agentsQuery.isLoading ? (
                    <div className="skeleton h-11 w-full rounded-xl" />
                  ) : eligibleAgents.length === 0 ? (
                    <div className="rounded-2xl border border-warning/25 bg-warning/10 p-3.5 text-xs text-warning">
                      No active, approved agents available in this company right
                      now.
                    </div>
                  ) : (
                    <select
                      value={selectedAgentUid}
                      onChange={(e) => setSelectedAgentUid(e.target.value)}
                      required
                      disabled={busy}
                      className="select select-bordered h-11 w-full rounded-xl border-base-content/15 bg-base-100/80 text-xs font-medium focus:border-primary focus:outline-none"
                    >
                      <option value="" disabled>
                        Choose an agent...
                      </option>
                      {eligibleAgents.map((ag) => (
                        <option key={ag.uid || ag._id} value={ag.uid}>
                          {ag.displayName || ag.name} ({ag.email})
                          {typeof ag.activeCount === "number"
                            ? ` · Active: ${ag.activeCount}`
                            : ""}
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
                      busy || !selectedAgentUid || eligibleAgents.length === 0
                    }
                    buttonClassName="from-primary to-secondary text-white px-4"
                  >
                    <UserCheck size={15} className="shrink-0" />
                    <span>
                      {pendingAction === "assign"
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
