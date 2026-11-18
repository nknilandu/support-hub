import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Flame,
  Inbox,
  MessageSquareText,
  Ticket,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Link, useNavigate } from "react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";

import CardWithBlurBlob from "../../components/ui/Card/CardWithBlurBlob";
import SoftIconCard from "../../components/ui/Card/SoftIconCard";
import TextBadge from "../../components/ui/Badge/TextBadge";
import GradientButton from "../../components/ui/Button/GradientButton";
import { cn } from "../../src/lib/cn";

// =====================================================
// CONFIGURATION
// =====================================================

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3021"
).replace(/\/+$/, "");

const statusColors = {
  open: "#3b82f6",
  assigned: "#A855F7",
  in_progress: "#f59e0b",
  resolved: "#22c55e",
  closed: "#64748b",
  unknown: "#94a3b8",
};

const statusVariants = {
  open: "blue",
  assigned: "purple",
  in_progress: "yellow",
  resolved: "green",
  closed: "slate",
};

const priorityVariants = {
  low: "green",
  medium: "yellow",
  high: "warning",
  critical: "red",
};

const resolutionColors = {
  ai: "#8b5cf6",
  agent: "#22c55e",
  unknown: "#64748b",
};

const tooltipStyle = {
  backgroundColor: "#1e293b",
  border: "none",
  borderRadius: "12px",
  fontSize: "11px",
  color: "#f8fafc",
};

// =====================================================
// HELPERS
// =====================================================

function count(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

function formatTimeAgo(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMins = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 60000),
  );

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return `${Math.floor(diffHours / 24)}d ago`;
}

function normalizeTicket(ticket) {
  return {
    ...ticket,
    currentAgent: ticket.currentAgent?.uid
      ? {
          ...ticket.currentAgent,
          name:
            ticket.currentAgent.displayName ||
            ticket.currentAgent.name ||
            "Assigned agent",
        }
      : null,

    userInfo: {
      ...ticket.userInfo,
      displayName:
        ticket.userInfo?.displayName || ticket.customerName || "Unknown",
    },
  };
}

function safeActivityPath(value) {
  if (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    !/[\u0000-\u001f\u007f]/.test(value)
  ) {
    return value;
  }

  return "/notifications";
}

async function apiRequest(user, path, options = {}) {
  if (!user) {
    throw new Error("Authentication required");
  }

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

async function fetchManagerOverview({ user, signal }) {
  const result = await apiRequest(user, "/dashboard/manager-overview", {
    method: "GET",
    signal,
  });

  if (!result.company || !result.metrics) {
    throw new Error("Incomplete dashboard response.");
  }

  return result;
}

function EmptyState({ icon = Inbox, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
      <SoftIconCard icon={icon} variant="slate" className="mb-3" />
      <p className="text-sm font-medium text-base-content/70">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-sm text-xs leading-5 text-base-content/50">
          {description}
        </p>
      )}
    </div>
  );
}

// =====================================================
// SKELETON LOADING VIEW
// =====================================================

function ManagerDashboardSkeleton() {
  return (
    <section
      aria-label="Loading workspace overview"
      aria-busy="true"
      className="relative min-h-full space-y-4 p-4 lg:p-6"
    >
      {/* 1. TOP HEADER SKELETON */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="skeleton h-7 w-48 rounded-lg" />
          <div className="skeleton h-6 w-28 rounded-lg" />
        </div>
        <div className="skeleton mt-2 h-3.5 w-80 max-w-full rounded-md" />
      </div>

      {/* 2. SIX SUMMARY CARDS SKELETON */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, idx) => (
          <CardWithBlurBlob
            key={idx}
            className="h-full p-4"
            interactive={false}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="skeleton h-9 w-9 shrink-0 rounded-xl" />
              <div className="skeleton h-3.5 w-3.5 rounded-md" />
            </div>

            <div className="mt-4">
              <div className="skeleton h-7 w-14 rounded-lg" />
              <div className="skeleton mt-2.5 h-3.5 w-28 rounded-md" />
              <div className="skeleton mt-1.5 h-3 w-32 max-w-full rounded-md" />
            </div>
          </CardWithBlurBlob>
        ))}
      </div>

      {/* 3. THREE CHARTS ROW SKELETON */}
      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, idx) => (
          <CardWithBlurBlob
            key={idx}
            className="min-w-0 p-5"
            interactive={false}
          >
            <div className="skeleton h-4 w-36 rounded-md" />
            <div className="skeleton mt-1.5 h-3 w-48 rounded-md" />

            <div className="mt-4 flex h-[230px] flex-col justify-end rounded-xl border border-base-content/5 bg-base-200/20 p-4">
              {idx === 0 && (
                <div className="flex h-36 items-end justify-around gap-3 px-2">
                  <div className="skeleton h-20 w-7 rounded-t-md" />
                  <div className="skeleton h-28 w-7 rounded-t-md" />
                  <div className="skeleton h-16 w-7 rounded-t-md" />
                  <div className="skeleton h-32 w-7 rounded-t-md" />
                  <div className="skeleton h-24 w-7 rounded-t-md" />
                </div>
              )}

              {idx === 1 && (
                <div className="my-auto flex flex-col items-center justify-center gap-4">
                  <div className="skeleton h-32 w-32 rounded-full" />
                  <div className="flex gap-4">
                    <div className="skeleton h-3 w-20 rounded-md" />
                    <div className="skeleton h-3 w-20 rounded-md" />
                  </div>
                </div>
              )}

              {idx === 2 && (
                <div className="my-auto space-y-4 px-2">
                  <div className="skeleton h-3 w-full rounded-md" />
                  <div className="skeleton h-3 w-5/6 rounded-md" />
                  <div className="skeleton h-3 w-full rounded-md" />
                  <div className="skeleton h-3 w-4/6 rounded-md" />
                  <div className="mt-4 flex justify-center gap-4 pt-2">
                    <div className="skeleton h-3 w-16 rounded-md" />
                    <div className="skeleton h-3 w-16 rounded-md" />
                  </div>
                </div>
              )}
            </div>
          </CardWithBlurBlob>
        ))}
      </div>

      {/* 4. MAIN TWO-COLUMN LAYOUT SKELETON */}
      <div className="grid items-start gap-3 xl:grid-cols-12">
        {/* LEFT COLUMN (8 cols) */}
        <div className="min-w-0 space-y-3 xl:col-span-8">
          {/* A. Pending Agent Approvals Table Skeleton */}
          <CardWithBlurBlob className="overflow-hidden p-0" interactive={false}>
            <div className="flex items-center justify-between gap-3 border-b border-base-content/5 px-5 py-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="skeleton h-4 w-44 rounded-md" />
                  <div className="skeleton h-5 w-8 rounded-lg" />
                </div>
                <div className="skeleton h-3 w-64 rounded-md" />
              </div>
              <div className="skeleton h-3.5 w-20 rounded-md" />
            </div>

            <div className="divide-y divide-base-content/5">
              {Array.from({ length: 3 }, (_, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="skeleton h-8 w-8 shrink-0 rounded-full" />
                    <div className="space-y-1.5">
                      <div className="skeleton h-3.5 w-28 rounded-md" />
                      <div className="skeleton h-3 w-40 rounded-md" />
                    </div>
                  </div>
                  <div className="skeleton h-3 w-14 rounded-md" />
                  <div className="skeleton h-5 w-16 rounded-lg" />
                  <div className="skeleton h-5 w-16 rounded-lg" />
                  <div className="flex gap-1.5">
                    <div className="skeleton h-6 w-16 rounded-lg" />
                    <div className="skeleton h-6 w-14 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </CardWithBlurBlob>

          {/* B. Recent Company Tickets Skeleton */}
          <CardWithBlurBlob className="overflow-hidden p-0" interactive={false}>
            <div className="flex items-center justify-between gap-3 border-b border-base-content/5 px-5 py-4">
              <div className="space-y-1.5">
                <div className="skeleton h-4 w-44 rounded-md" />
                <div className="skeleton h-3 w-52 rounded-md" />
              </div>
              <div className="skeleton h-3.5 w-16 rounded-md" />
            </div>

            <div className="divide-y divide-base-content/5">
              {Array.from({ length: 5 }, (_, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5"
                >
                  <div className="min-w-[200px] flex-1 space-y-1.5">
                    <div className="skeleton h-3 w-28 rounded-md" />
                    <div className="skeleton h-4 w-64 max-w-full rounded-md" />
                    <div className="skeleton h-3 w-48 max-w-full rounded-md" />
                  </div>
                  <div className="skeleton h-5 w-16 rounded-lg" />
                  <div className="skeleton h-5 w-20 rounded-lg" />
                  <div className="skeleton h-3.5 w-24 rounded-md" />
                  <div className="skeleton h-3.5 w-20 rounded-md" />
                </div>
              ))}
            </div>
          </CardWithBlurBlob>
        </div>

        {/* RIGHT COLUMN (4 cols) */}
        <div className="w-full space-y-3 xl:col-span-4">
          {/* A. Urgent Tickets Skeleton */}
          <CardWithBlurBlob className="p-5" interactive={false}>
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="skeleton h-4 w-32 rounded-md" />
                <div className="skeleton h-3 w-48 rounded-md" />
              </div>
              <div className="skeleton h-5 w-8 rounded-lg" />
            </div>

            <div className="space-y-2.5">
              {Array.from({ length: 3 }, (_, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border-2 border-dashed border-base-content/10 px-4 py-3.5"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="skeleton h-3 w-32 rounded-md" />
                    <div className="skeleton h-5 w-16 rounded-lg" />
                  </div>
                  <div className="skeleton h-4 w-5/6 rounded-md" />
                  <div className="skeleton mt-1.5 h-3 w-1/2 rounded-md" />
                  <div className="mt-3 flex items-center justify-between">
                    <div className="skeleton h-5 w-20 rounded-lg" />
                    <div className="skeleton h-3.5 w-12 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </CardWithBlurBlob>

          {/* B. Recent Activity Skeleton */}
          <CardWithBlurBlob className="p-5" interactive={false}>
            <div className="mb-4 flex items-center justify-between">
              <div className="skeleton h-4 w-28 rounded-md" />
              <div className="skeleton h-3.5 w-14 rounded-md" />
            </div>

            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, idx) => (
                <div key={idx} className="flex items-start gap-3 p-1.5">
                  <div className="skeleton h-8 w-8 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3.5 w-3/4 rounded-md" />
                    <div className="skeleton h-3 w-full rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </CardWithBlurBlob>
        </div>
      </div>
    </section>
  );
}

// =====================================================
// AUTH + QUERY
// =====================================================

export default function ManagerDashboard() {
  const [session, setSession] = useState({
    ready: false,
    user: null,
    error: null,
  });

  useEffect(() => {
    let unsubscribe;

    try {
      unsubscribe = onAuthStateChanged(
        getAuth(),
        (user) => {
          setSession({
            ready: true,
            user,
            error: null,
          });
        },
        (error) => {
          setSession({
            ready: true,
            user: null,
            error,
          });
        },
      );
    } catch (error) {
      setSession({
        ready: true,
        user: null,
        error,
      });
    }

    return () => unsubscribe?.();
  }, []);

  const { data, error, isPending, isFetching, refetch } = useQuery({
    queryKey: ["manager-overview", session.user?.uid || null],

    enabled: session.ready && !!session.user,

    queryFn: ({ signal }) =>
      fetchManagerOverview({
        user: session.user,
        signal,
      }),

    staleTime: 15_000,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,

    refetchInterval: (query) =>
      [401, 403, 404].includes(query.state.error?.status) ? false : 30_000,

    retry: (failureCount, requestError) => {
      if (requestError?.status >= 400 && requestError?.status < 500) {
        return false;
      }

      return failureCount < 1;
    },
  });

  if (!session.ready || (session.user && isPending)) {
    return <ManagerDashboardSkeleton />;
  }

  if (session.error || !session.user) {
    return (
      <section className="relative min-h-full space-y-4 p-4 lg:p-6">
        <CardWithBlurBlob className="p-5" interactive={false}>
          <EmptyState
            icon={UserCheck}
            title={
              session.error
                ? "Unable to verify your session"
                : "Authentication required"
            }
            description={
              session.error
                ? "Please reload the page and try again."
                : "Sign in with your manager account to continue."
            }
          />
        </CardWithBlurBlob>
      </section>
    );
  }

  const accessDenied = [401, 403, 404].includes(error?.status);

  if (!data || accessDenied) {
    return (
      <section className="relative min-h-full space-y-4 p-4 lg:p-6">
        <CardWithBlurBlob className="p-5" interactive={false}>
          <EmptyState
            icon={Inbox}
            title="Unable to load dashboard"
            description={error?.message || "Please try again."}
          />

          <div className="flex justify-center">
            <GradientButton
              type="button"
              size="sm"
              disabled={isFetching}
              onClick={() => refetch()}
              buttonClassName="from-primary to-secondary text-white whitespace-nowrap px-4"
            >
              {isFetching ? "Retrying..." : "Try again"}
            </GradientButton>
          </div>
        </CardWithBlurBlob>
      </section>
    );
  }

  return (
    <ManagerDashboardContent
      key={session.user.uid}
      user={session.user}
      data={data}
      refreshError={error}
    />
  );
}

// =====================================================
// ORIGINAL DASHBOARD DESIGN + REAL API DATA
// =====================================================

function ManagerDashboardContent({ user, data, refreshError }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [reviewModal, setReviewModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState("");

  const submitLock = useRef(false);

  const companyName = data.company?.companyName || "Your Company";

  const pendingAgentsList = useMemo(
    () =>
      (data.pendingAgentApprovals || []).map((agent) => ({
        ...agent,
        name: agent.displayName || agent.name || "Unnamed Agent",
      })),
    [data.pendingAgentApprovals],
  );

  const recentList = useMemo(
    () => (data.recentTickets || []).map(normalizeTicket),
    [data.recentTickets],
  );

  const sortedUrgentTickets = useMemo(() => {
    const list = (data.urgentTickets || []).map(normalizeTicket);

    list.sort((a, b) => {
      const pA = a.priority === "critical" ? 0 : 1;
      const pB = b.priority === "critical" ? 0 : 1;
      if (pA !== pB) return pA - pB;

      const uA = !a.currentAgent?.uid ? 0 : 1;
      const uB = !b.currentAgent?.uid ? 0 : 1;
      if (uA !== uB) return uA - uB;

      const aTime = new Date(a.createdAt).getTime() || 0;
      const bTime = new Date(b.createdAt).getTime() || 0;

      return aTime - bTime;
    });

    return list;
  }, [data.urgentTickets]);

  const notifications = data.notifications || [];

  const metrics = {
    totalTickets: count(data.metrics.totalTickets),
    unassignedTickets: count(data.metrics.unassignedTickets),
    activeHumanTickets: count(data.metrics.activeHumanTickets),
    resolvedTickets: count(data.metrics.resolvedTickets),
    resolvedByAi: count(data.metrics.resolvedByAi),
    resolvedByAgent: count(data.metrics.resolvedByAgent),
    urgentTickets: count(data.metrics.urgentTickets),
    pendingAgentApprovals: count(data.metrics.pendingAgentApprovals),
  };

  const statusChartData = useMemo(() => {
    const s = data.statusChart || {};

    return [
      { key: "open", name: "Open", value: count(s.open) },
      {
        key: "assigned",
        name: "Assigned",
        value: count(s.assigned),
      },
      {
        key: "in_progress",
        name: "Pending",
        value: count(s.in_progress),
      },
      {
        key: "resolved",
        name: "Resolved",
        value: count(s.resolved),
      },
      { key: "closed", name: "Closed", value: count(s.closed) },
      ...(count(s.unknown) > 0
        ? [
            {
              key: "unknown",
              name: "Unknown",
              value: count(s.unknown),
            },
          ]
        : []),
    ];
  }, [data.statusChart]);

  const resolutionData = useMemo(() => {
    const resolution = data.resolutionChart || {};

    return [
      {
        key: "ai",
        name: "AI Resolved",
        value: count(resolution.ai),
      },
      {
        key: "agent",
        name: "Human Agent",
        value: count(resolution.agent),
      },
      ...(count(resolution.unknown) > 0
        ? [
            {
              key: "unknown",
              name: "Unknown Source",
              value: count(resolution.unknown),
            },
          ]
        : []),
    ];
  }, [data.resolutionChart]);

  const activityData = data.activityChart || [];

  const summaryCards = [
    {
      title: "Total Tickets",
      value: metrics.totalTickets,
      meta: "All company tickets",
      icon: Ticket,
      variant: "blue",
      to: "/manager/tickets",
    },
    {
      title: "Unassigned Tickets",
      value: metrics.unassignedTickets,
      meta: "Current · Open queue",
      icon: Inbox,
      variant: "cyan",
      to: "/manager/tickets?status=open&unassigned=true",
    },
    {
      title: "Active Human Tickets",
      value: metrics.activeHumanTickets,
      meta: "Current · Assigned & active",
      icon: UserCheck,
      variant: "purple",
      to: "/manager/tickets?status=assigned,in_progress",
    },
    {
      title: "Resolved Tickets",
      value: metrics.resolvedTickets,
      meta: `AI: ${metrics.resolvedByAi} · Agents: ${metrics.resolvedByAgent}`,
      icon: CheckCircle2,
      variant: "green",
      to: "/manager/tickets?status=resolved,closed",
    },
    {
      title: "Urgent Tickets",
      value: metrics.urgentTickets,
      meta: "Current · High & Critical",
      icon: Flame,
      variant: "red",
      to: "/manager/tickets?priority=high,critical&unresolved=true",
    },
    {
      title: "Pending Agent Approvals",
      value: metrics.pendingAgentApprovals,
      meta: "Current · Needs review",
      icon: Users,
      variant: "warning",
      to: "/manager/agents?approval=pending",
    },
  ];

  // =====================================================
  // AGENT APPROVE / REJECT ACTION
  // =====================================================

  const agentActionMutation = useMutation({
    mutationFn: ({ uid, action, reason }) =>
      apiRequest(user, `/manager/agents/${encodeURIComponent(uid)}/action`, {
        method: "PATCH",
        body: {
          action,
          ...(action === "reject" ? { reason } : {}),
        },
      }),
  });

  const actionLoading = agentActionMutation.isPending;

  const refreshDashboardQueries = () => {
    void Promise.allSettled([
      queryClient.invalidateQueries({ queryKey: ["manager-overview"] }),
      queryClient.invalidateQueries({ queryKey: ["manager-agents"] }),
      queryClient.invalidateQueries({ queryKey: ["manager-agents-summary"] }),
      queryClient.invalidateQueries({ queryKey: ["manager-agent-details"] }),
    ]);
  };

  const openAgentReviewModal = (agent, action) => {
    if (submitLock.current || !agent?.uid) return;

    setRejectionReason("");
    setActionError("");
    agentActionMutation.reset();

    setReviewModal({
      agent,
      action, // "approve" | "reject"
    });
  };

  const closeAgentReviewModal = () => {
    if (!submitLock.current) {
      setReviewModal(null);
    }
  };

  const handleAgentReviewSubmit = async (event) => {
    event.preventDefault();

    if (!reviewModal || submitLock.current) return;

    const { agent, action } = reviewModal;

    if (action === "reject" && !rejectionReason.trim()) {
      setActionError("Please provide a rejection reason.");
      return;
    }

    submitLock.current = true;
    setActionError("");

    try {
      const result = await agentActionMutation.mutateAsync({
        uid: agent.uid,
        action,
        reason: rejectionReason.trim(),
      });

      toast.success(
        result.message ||
          (action === "approve"
            ? "Agent approved successfully"
            : "Agent application rejected"),
      );

      setReviewModal(null);
      refreshDashboardQueries();
    } catch (err) {
      setActionError(err.message || "Unable to update agent");

      if ([401, 403, 404, 409].includes(err.status)) {
        refreshDashboardQueries();
      }
    } finally {
      submitLock.current = false;
    }
  };

  const handleActivityClick = (act) => {
    navigate(safeActivityPath(act.path));
  };

  return (
    <section className="relative min-h-full space-y-4 p-4 lg:p-6">
      {/* 1. TOP HEADER */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold">Workspace Overview</h1>
          <TextBadge variant="purple">{companyName}</TextBadge>

          {refreshError && (
            <TextBadge variant="slate">Refresh failed </TextBadge>
          )}
        </div>
        <p className="mt-1 text-xs text-base-content/50">
          {refreshError
            ? "Showing the last loaded data. Automatic refresh will retry."
            : "Monitor tickets, pending agent approvals, and support performance."}
        </p>
      </div>

      {/* 2. SIX SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {summaryCards.map((card) => (
          <Link key={card.title} to={card.to} className="group block">
            <CardWithBlurBlob
              className="h-full p-4 transition group-hover:border-primary/30"
              interactive={true}
            >
              <div className="flex items-start justify-between gap-2">
                <SoftIconCard
                  icon={card.icon}
                  size={15}
                  variant={card.variant}
                />
                <ArrowRight
                  size={13}
                  className="text-base-content/30 transition group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </div>

              <div className="mt-4">
                <h2 className="text-2xl font-semibold leading-none">
                  {card.value}
                </h2>
                <p className="mt-2 text-xs font-medium text-base-content/80">
                  {card.title}
                </p>
                <p className="mt-1 text-[10px] text-base-content/50">
                  {card.meta}
                </p>
              </div>
            </CardWithBlurBlob>
          </Link>
        ))}
      </div>

      {/* 3. THREE CHARTS ROW */}
      <div className="grid gap-3 md:grid-cols-3">
        {/* Chart 1: All Ticket Status */}
        <CardWithBlurBlob className="min-w-0 p-5" interactive={false}>
          <h3 className="text-sm font-semibold">All Ticket Status</h3>
          <p className="text-[11px] text-base-content/50">
            Open, assigned, pending, resolved &amp; closed
          </p>

          <div className="mt-3 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusChartData}
                margin={{ top: 10, left: -26, right: 6 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(148,163,184,0.2)"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148,163,184,0.08)" }}
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: "#f8fafc" }}
                />
                <Bar
                  dataKey="value"
                  name="Tickets"
                  radius={[6, 6, 0, 0]}
                  barSize={28}
                >
                  {statusChartData.map((entry) => (
                    <Cell key={entry.key} fill={statusColors[entry.key]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardWithBlurBlob>

        {/* Chart 2: Resolution Breakdown */}
        <CardWithBlurBlob className="min-w-0 p-5" interactive={false}>
          <h3 className="text-sm font-semibold">Resolution Breakdown</h3>
          <p className="text-[11px] text-base-content/50">
            Actual ticket resolution source
          </p>

          <div className="mt-3 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: "#f8fafc" }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px" }}
                  formatter={(value, entry) =>
                    `${value} (${entry?.payload?.value || 0})`
                  }
                />
                <Pie
                  data={resolutionData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={45}
                  outerRadius={76}
                  paddingAngle={2}
                >
                  {resolutionData.map((item) => (
                    <Cell key={item.key} fill={resolutionColors[item.key]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardWithBlurBlob>

        {/* Chart 3: Ticket Activity */}
        <CardWithBlurBlob className="min-w-0 p-5" interactive={false}>
          <h3 className="text-sm font-semibold">Ticket Activity</h3>
          <p className="text-[11px] text-base-content/50">
            Daily created vs resolved tickets
          </p>

          <div className="mt-3 h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={activityData}
                margin={{ top: 10, left: -26, right: 6 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(148,163,184,0.2)"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px" }}
                />
                <Line
                  type="monotone"
                  dataKey="created"
                  name="Created"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 2.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 2.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardWithBlurBlob>
      </div>

      {/* 4. MAIN TWO-COLUMN LAYOUT */}
      <div className="grid items-start gap-3 xl:grid-cols-12">
        {/* LEFT COLUMN (8 cols) */}
        <div className="min-w-0 space-y-3 xl:col-span-8">
          {/* A. PENDING AGENT APPROVALS TABLE */}
          <CardWithBlurBlob className="overflow-hidden p-0" interactive={false}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-content/5 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">
                    Pending Agent Approvals
                  </h2>
                  <TextBadge variant="warning">
                    {metrics.pendingAgentApprovals}
                  </TextBadge>
                </div>
                <p className="mt-0.5 text-[11px] text-base-content/50">
                  Review and verify new support agent join requests
                </p>
              </div>

              <Link
                to="/manager/agents?approval=pending"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Manage All <ArrowRight size={13} />
              </Link>
            </div>

            {pendingAgentsList.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No pending agent approval requests"
                description="All agent onboarding requests have been reviewed."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr className="text-[11px] uppercase text-base-content/50">
                      <th className="px-5">Applicant</th>
                      <th>Requested</th>
                      <th>Account</th>
                      <th>Status</th>
                      <th className="pr-5 text-right">Quick Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingAgentsList.map((agent) => (
                      <tr key={agent._id || agent.uid}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/15 text-xs font-semibold text-warning">
                              {agent.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium">
                                {agent.name}
                              </p>
                              <p className="truncate text-[11px] text-base-content/50">
                                {agent.email || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="whitespace-nowrap text-xs text-base-content/60">
                          {formatTimeAgo(agent.createdAt)}
                        </td>

                        <td>
                          <TextBadge
                            variant={agent.status === "active" ? "blue" : "red"}
                          >
                            {agent.status === "active"
                              ? "Active"
                              : agent.status === "suspended"
                                ? "Suspended"
                                : agent.status || "Unknown"}
                          </TextBadge>
                        </td>

                        <td>
                          <TextBadge variant="yellow">Pending</TextBadge>
                        </td>

                        <td className="pr-5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() =>
                                openAgentReviewModal(agent, "approve")
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-success/15 px-2.5 py-1 text-[11px] font-medium text-success transition hover:bg-success/25 disabled:opacity-50"
                            >
                              <Check size={12} /> Approve
                            </button>
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() =>
                                openAgentReviewModal(agent, "reject")
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-error/15 px-2.5 py-1 text-[11px] font-medium text-error transition hover:bg-error/25 disabled:opacity-50"
                            >
                              <X size={12} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardWithBlurBlob>

          {/* B. RECENT COMPANY TICKETS */}
          <CardWithBlurBlob className="overflow-hidden p-0" interactive={false}>
            <div className="flex items-center justify-between gap-3 border-b border-base-content/5 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">
                  Recent Company Tickets
                </h2>
                <p className="mt-1 text-[11px] text-base-content/50">
                  Latest {Math.min(recentList.length, 10)} of{" "}
                  {metrics.totalTickets}
                  {" · "}Sorted by latest update
                </p>
              </div>

              <Link
                to="/manager/tickets"
                className="flex shrink-0 items-center gap-2 text-xs text-base-content/60 hover:text-primary"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {recentList.length === 0 ? (
              <EmptyState
                icon={Ticket}
                title="No company tickets found"
                description="New company tickets will appear here."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr className="text-[11px] uppercase text-base-content/50">
                      <th className="px-5">Ticket</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Assignment</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentList.slice(0, 10).map((ticket) => {
                      const assignment = ticket.currentAgent?.uid
                        ? ticket.currentAgent.name
                        : ticket.aiResolved === true
                          ? "AI resolved"
                          : ticket.status === "open"
                            ? "Unassigned"
                            : "No current agent";

                      const ticketTitle =
                        ticket.aiResult?.ticketTitle || "Untitled Ticket";

                      return (
                        <tr key={ticket._id}>
                          <td className="min-w-[220px] max-w-sm px-5 py-3">
                            <div className="flex items-center gap-2">
                              <p className="font-mono text-[11px] text-base-content/50">
                                {ticket.ticketNumber}
                              </p>
                              {ticket.aiResolved && (
                                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                  AI
                                </span>
                              )}
                            </div>

                            <Link
                              to={`/manager/tickets/${ticket._id}`}
                              className="mt-1 block line-clamp-1 text-sm font-medium hover:text-primary"
                            >
                              {ticketTitle}
                            </Link>

                            <p className="mt-1 line-clamp-1 text-xs text-base-content/50">
                              {ticket.aiResult?.summary ||
                                `Customer: ${ticket.userInfo?.displayName || "Unknown"}`}
                            </p>
                          </td>

                          <td>
                            <TextBadge
                              variant={
                                priorityVariants[ticket.priority] || "slate"
                              }
                            >
                              {ticket.priority || "Not set"}
                            </TextBadge>
                          </td>

                          <td>
                            <TextBadge
                              variant={statusVariants[ticket.status] || "slate"}
                            >
                              {(ticket.status || "unknown").replaceAll(
                                "_",
                                " ",
                              )}
                            </TextBadge>
                          </td>

                          <td className="whitespace-nowrap text-xs text-base-content/60">
                            {assignment}
                          </td>

                          <td className="whitespace-nowrap text-xs text-base-content/60">
                            {formatDate(ticket.updatedAt || ticket.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardWithBlurBlob>
        </div>

        {/* RIGHT COLUMN (4 cols): Urgent Tickets + Recent Activity */}
        <div className="w-full space-y-3 xl:col-span-4">
          {/* A. URGENT TICKETS */}
          <CardWithBlurBlob className="p-5" interactive={false}>
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Urgent Tickets</h3>
                <p className="mt-1 text-[11px] text-base-content/50">
                  High / critical tickets requiring attention
                </p>
              </div>

              <TextBadge variant="red">{metrics.urgentTickets}</TextBadge>
            </div>

            {sortedUrgentTickets.length === 0 ? (
              <EmptyState
                icon={Flame}
                title="No urgent tickets right now"
                description="All unresolved high and critical human-support tickets are clear."
              />
            ) : (
              <>
                <p className="mb-3 text-[11px] text-base-content/50">
                  Showing {sortedUrgentTickets.length} of{" "}
                  {metrics.urgentTickets} urgent tickets · Critical first,
                  unassigned first, then oldest
                </p>

                <div className="space-y-2.5">
                  {sortedUrgentTickets.map((ticket) => {
                    const isUnassigned = !ticket.currentAgent?.uid;

                    return (
                      <div
                        key={ticket._id}
                        className="block rounded-xl border-2 border-dashed border-base-content/10 px-4 py-3.5 transition hover:border-primary/30 hover:bg-primary/5"
                      >
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-[11px] text-base-content/50">
                              {ticket.ticketNumber}
                            </p>
                            <span className="flex items-center gap-1 text-[10px] text-base-content/45">
                              <Clock3 size={10} />
                              {formatTimeAgo(ticket.createdAt)}
                            </span>
                          </div>

                          <TextBadge
                            variant={priorityVariants[ticket.priority] || "red"}
                          >
                            {ticket.priority || "Not set"}
                          </TextBadge>
                        </div>

                        <h4 className="line-clamp-2 text-sm font-semibold">
                          {ticket.aiResult?.ticketTitle || "Untitled Ticket"}
                        </h4>

                        <p className="mt-1 truncate text-xs text-base-content/50">
                          {ticket.userInfo?.displayName || "Customer"}
                          {!isUnassigned && (
                            <> · Assigned: {ticket.currentAgent.name}</>
                          )}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          {isUnassigned ? (
                            <TextBadge variant="blue">Open</TextBadge>
                          ) : (
                            <TextBadge variant="yellow">
                              {(ticket.status || "unknown").replaceAll(
                                "_",
                                " ",
                              )}
                            </TextBadge>
                          )}

                          <Link
                            to={`/manager/tickets/${ticket._id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                          >
                            View <ArrowRight size={12} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Link
                  to="/manager/tickets?priority=high,critical&unresolved=true"
                  className="mt-4 flex items-center justify-center gap-2 text-xs text-primary hover:underline"
                >
                  Open urgent queue <ArrowRight size={14} />
                </Link>
              </>
            )}
          </CardWithBlurBlob>

          {/* B. RECENT ACTIVITY */}
          <CardWithBlurBlob className="p-5" interactive={false}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-5 py-8 text-center">
                <SoftIconCard
                  icon={MessageSquareText}
                  className="mb-2"
                  variant="slate"
                />
                <h3 className="text-sm font-medium text-base-content/70">
                  No Recent Activity Yet
                </h3>
                <p className="mt-2 max-w-sm text-xs text-base-content/60">
                  Workspace ticket escalations, agent requests, and updates will
                  appear here.
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Recent Activity</h3>
                  <Link
                    to="/notifications"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View all
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {notifications.map((act) => (
                    <button
                      key={act._id}
                      type="button"
                      onClick={() => handleActivityClick(act)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl p-2 text-left transition hover:bg-base-200/70",
                        !act.isRead && "bg-primary/5",
                      )}
                    >
                      <SoftIconCard
                        icon={MessageSquareText}
                        size={14}
                        variant={
                          act.type === "ticket_created"
                            ? "cyan"
                            : act.type === "ticket_resolved"
                              ? "green"
                              : act.type === "ticket_assigned"
                                ? "blue"
                                : act.type === "profile_updated"
                                  ? "pink"
                                  : act.type === "warning"
                                    ? "yellow"
                                    : act.type === "agent_reply"
                                      ? "purple"
                                      : "slate"
                        }
                        className="h-8 w-8 shrink-0 rounded-xl"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {!act.isRead && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          )}
                          <p className="truncate text-xs font-medium">
                            {act?.title}
                          </p>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-base-content/60">
                          {act?.message}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardWithBlurBlob>
        </div>
      </div>

      {/* AGENT APPROVE / REJECT MODAL */}
      {reviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={closeAgentReviewModal}
        >
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardWithBlurBlob
              interactive={false}
              className="border border-base-content/10 bg-base-100 p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3 border-b border-base-content/10 pb-4">
                <div>
                  <h3 className="text-base font-bold">
                    {reviewModal.action === "approve"
                      ? "Approve Agent"
                      : "Reject Agent Application"}
                  </h3>
                  <p className="mt-0.5 text-xs text-base-content/55">
                    {reviewModal.agent.name} ({reviewModal.agent.email || "—"})
                  </p>
                </div>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={closeAgentReviewModal}
                  aria-label="Close modal"
                  className="rounded-xl p-1.5 text-base-content/50 transition hover:bg-base-content/10 hover:text-base-content"
                >
                  <X size={16} />
                </button>
              </div>

              <form
                onSubmit={handleAgentReviewSubmit}
                className="mt-4 space-y-4"
              >
                {reviewModal.action === "approve" ? (
                  <p className="rounded-xl border border-success/20 bg-success/5 p-3.5 text-sm text-base-content/75">
                    Approve <strong>{reviewModal.agent.name}</strong> to join{" "}
                    {companyName}&apos;s support team?
                  </p>
                ) : (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-base-content/75">
                      Rejection Reason
                    </label>
                    <textarea
                      required
                      maxLength={300}
                      disabled={actionLoading}
                      value={rejectionReason}
                      onChange={(e) => {
                        setRejectionReason(e.target.value);
                        setActionError("");
                      }}
                      placeholder="Write why this application is rejected..."
                      className="min-h-24 w-full rounded-xl border border-base-content/10 bg-base-100 p-3 text-sm outline-none focus:border-primary/40"
                    />
                  </div>
                )}

                {actionError && (
                  <p className="text-xs font-medium text-error">
                    {actionError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2.5 border-t border-base-content/10 pt-4">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={closeAgentReviewModal}
                    className="h-9 rounded-xl border border-base-content/10 px-4 text-sm font-medium transition hover:bg-base-200"
                  >
                    Cancel
                  </button>

                  <GradientButton
                    type="submit"
                    size="sm"
                    disabled={actionLoading}
                    buttonClassName={
                      reviewModal.action === "approve"
                        ? "from-success/80 to-success text-white px-4"
                        : "from-error/80 to-error text-white px-4"
                    }
                  >
                    {actionLoading
                      ? "Saving..."
                      : reviewModal.action === "approve"
                        ? "Confirm Approve"
                        : "Confirm Reject"}
                  </GradientButton>
                </div>
              </form>
            </CardWithBlurBlob>
          </div>
        </div>
      )}
    </section>
  );
}
