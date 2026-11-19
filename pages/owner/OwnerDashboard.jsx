import {
  ArrowRight,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Crown,
  Flame,
  Inbox,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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

const roleBadgeVariants = {
  manager: "pink",
  agent: "cyan",
  customer: "green",
};

const resolutionColors = {
  ai: "#8b5cf6",
  agent: "#22c55e",
  unknown: "#64748b",
};

const categoryColors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899"];

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

function getTimeRemaining(expiryIso) {
  if (!expiryIso) return { label: "0 days", days: 0, isUrgent: false };
  const target = new Date(expiryIso).getTime();
  if (Number.isNaN(target))
    return { label: "0 days", days: 0, isUrgent: false };

  const diffMs = target - Date.now();
  if (diffMs <= 0) {
    return { label: "0 days", days: 0, isUrgent: true };
  }

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days === 0) {
    return { label: `${hours}h left`, days: 0, isUrgent: true };
  }

  return {
    label: `${days}d ${hours}h left`,
    days,
    isUrgent: days <= 5,
  };
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

async function fetchOwnerOverview({ user, signal }) {
  const result = await apiRequest(user, "/dashboard/owner-overview", {
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

function OwnerDashboardSkeleton() {
  return (
    <section
      aria-label="Loading owner overview"
      aria-busy="true"
      className="relative min-h-full space-y-4 p-4 lg:p-6"
    >
      {/* 1. TOP HEADER SKELETON */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="skeleton h-7 w-44 rounded-lg" />
            <div className="skeleton h-6 w-28 rounded-lg" />
            <div className="skeleton h-6 w-24 rounded-lg" />
          </div>
          <div className="skeleton mt-2 h-3.5 w-80 max-w-full rounded-md" />
        </div>
        <div className="skeleton h-9 w-32 rounded-xl" />
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
              <div className="skeleton h-7 w-16 rounded-lg" />
              <div className="skeleton mt-2.5 h-3.5 w-28 rounded-md" />
              <div className="skeleton mt-1.5 h-3 w-32 max-w-full rounded-md" />
            </div>
          </CardWithBlurBlob>
        ))}
      </div>

      {/* 3. TOP ROW: THREE CHARTS SKELETON */}
      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, idx) => (
          <CardWithBlurBlob
            key={idx}
            className="min-w-0 p-5"
            interactive={false}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-1.5">
                <div className="skeleton h-4 w-36 rounded-md" />
                <div className="skeleton h-3 w-48 rounded-md" />
              </div>
              <div className="skeleton h-5 w-14 rounded-lg" />
            </div>

            <div className="mt-4 flex h-[230px] flex-col justify-end rounded-xl border border-base-content/5 bg-base-200/20 p-4">
              {idx === 0 && (
                <div className="my-auto space-y-4 px-2">
                  <div className="skeleton h-3 w-full rounded-md" />
                  <div className="skeleton h-3 w-5/6 rounded-md" />
                  <div className="skeleton h-3 w-full rounded-md" />
                  <div className="skeleton h-3 w-4/6 rounded-md" />
                </div>
              )}

              {idx === 1 && (
                <div className="flex h-36 items-end justify-around gap-3 px-2">
                  <div className="skeleton h-20 w-7 rounded-t-md" />
                  <div className="skeleton h-28 w-7 rounded-t-md" />
                  <div className="skeleton h-16 w-7 rounded-t-md" />
                  <div className="skeleton h-32 w-7 rounded-t-md" />
                  <div className="skeleton h-24 w-7 rounded-t-md" />
                </div>
              )}

              {idx === 2 && (
                <div className="my-auto flex flex-col items-center justify-center gap-4">
                  <div className="skeleton h-32 w-32 rounded-full" />
                  <div className="flex gap-4">
                    <div className="skeleton h-3 w-20 rounded-md" />
                    <div className="skeleton h-3 w-20 rounded-md" />
                  </div>
                </div>
              )}
            </div>
          </CardWithBlurBlob>
        ))}
      </div>

      {/* 4. SECOND ROW: CATEGORY CHART + SUBSCRIPTION CARD SKELETON */}
      <div className="grid items-stretch gap-3 xl:grid-cols-12">
        <CardWithBlurBlob
          className="min-w-0 p-5 xl:col-span-8"
          interactive={false}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1.5">
              <div className="skeleton h-4 w-36 rounded-md" />
              <div className="skeleton h-3 w-64 rounded-md" />
            </div>
            <div className="skeleton h-5 w-24 rounded-lg" />
          </div>

          <div className="mt-4 flex h-[230px] flex-col justify-around rounded-xl border border-base-content/5 bg-base-200/20 p-4">
            <div className="skeleton h-4 w-5/6 rounded-r-md" />
            <div className="skeleton h-4 w-4/6 rounded-r-md" />
            <div className="skeleton h-4 w-3/6 rounded-r-md" />
            <div className="skeleton h-4 w-2/6 rounded-r-md" />
          </div>
        </CardWithBlurBlob>

        <CardWithBlurBlob
          className="flex flex-col justify-between p-5 xl:col-span-4"
          interactive={false}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="skeleton h-4 w-36 rounded-md" />
                <div className="skeleton h-3 w-48 rounded-md" />
              </div>
              <div className="skeleton h-5 w-14 rounded-lg" />
            </div>

            <div className="space-y-3 rounded-xl border border-base-content/10 bg-base-200/40 p-4">
              <div className="flex justify-between">
                <div className="skeleton h-4 w-28 rounded-md" />
                <div className="skeleton h-4 w-16 rounded-md" />
              </div>
              <div className="skeleton h-2 w-full rounded-full" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="skeleton h-8 w-full rounded-md" />
                <div className="skeleton h-8 w-full rounded-md" />
                <div className="skeleton h-8 w-full rounded-md" />
                <div className="skeleton h-8 w-full rounded-md" />
              </div>
            </div>
          </div>

          <div className="skeleton mx-auto mt-4 h-3.5 w-40 rounded-md" />
        </CardWithBlurBlob>
      </div>
    </section>
  );
}

// =====================================================
// AUTH + QUERY
// =====================================================

export default function OwnerDashboard() {
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
    queryKey: ["owner-overview", session.user?.uid || null],

    enabled: session.ready && !!session.user,

    queryFn: ({ signal }) =>
      fetchOwnerOverview({
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
    return <OwnerDashboardSkeleton />;
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
                : "Sign in with your owner account to continue."
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
            title="Unable to load owner dashboard"
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
    <OwnerDashboardContent
      key={session.user.uid}
      user={session.user}
      data={data}
      refreshError={error}
    />
  );
}

// =====================================================
// MAIN DASHBOARD CONTENT
// =====================================================

function OwnerDashboardContent({ user, data, refreshError }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [reviewModal, setReviewModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState("");

  const submitLock = useRef(false);

  const companyName = data.company?.companyName || "Your Company";
  const subscription = data.subscription || {};

  const pendingRequestsList = useMemo(
    () =>
      (data.pendingRoleRequests || []).map((member) => ({
        ...member,
        name: member.displayName || member.name || "Unnamed Member",
      })),
    [data.pendingRoleRequests],
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
    resolvedTickets: count(data.metrics.resolvedTickets),
    resolvedByAi: count(data.metrics.resolvedByAi),
    resolvedByAgent: count(data.metrics.resolvedByAgent),
    urgentTickets: count(data.metrics.urgentTickets),
    managersCount: count(data.metrics.managersCount),
    agentsCount: count(data.metrics.agentsCount),
    customersCount: count(data.metrics.customersCount),
    pendingApprovals: count(data.metrics.pendingApprovals),
  };

  const seatsUsed = count(subscription.seatsUsed);
  const seatsLimit =
    typeof subscription.seatsLimit === "number" ? subscription.seatsLimit : 4; // Default: 1 manager + 3 agents = 4
  const seatPercentage =
    seatsLimit > 0
      ? Math.min(100, Math.round((seatsUsed / seatsLimit) * 100))
      : 0;

  const dueInfo = useMemo(
    () => getTimeRemaining(subscription.expiresAt),
    [subscription.expiresAt],
  );

  const statusChartData = useMemo(() => {
    const s = data.statusChart || {};

    return [
      { key: "open", name: "Open", value: count(s.open) },
      { key: "assigned", name: "Assigned", value: count(s.assigned) },
      { key: "in_progress", name: "Pending", value: count(s.in_progress) },
      { key: "resolved", name: "Resolved", value: count(s.resolved) },
      { key: "closed", name: "Closed", value: count(s.closed) },
      ...(count(s.unknown) > 0
        ? [{ key: "unknown", name: "Unknown", value: count(s.unknown) }]
        : []),
    ];
  }, [data.statusChart]);

  const resolutionData = useMemo(() => {
    const resolution = data.resolutionChart || {};

    return [
      { key: "ai", name: "AI Resolved", value: count(resolution.ai) },
      { key: "agent", name: "Human Agent", value: count(resolution.agent) },
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

  const weeklyActivityData = data.weeklyActivityChart || [];
  const categoryChartData = data.categoryChart || [];

  const aiResolutionPercent =
    metrics.resolvedTickets > 0
      ? Math.round((metrics.resolvedByAi / metrics.resolvedTickets) * 100)
      : 0;

  const summaryCards = [
    {
      title: "Current Plan",
      value: subscription.price || "$0/mo",
      meta: `${subscription.planName || "Default Plan"} · ${
        subscription.status === "active"
          ? "Active"
          : subscription.status === "expired"
            ? "Expired"
            : "Default"
      }`,
      icon: CreditCard,
      variant: "purple",
      to: "/owner/subscription",
    },
    {
      title: "Team & Seats",
      value: `${seatsUsed}/${seatsLimit ?? "∞"}`,
      meta: `${metrics.managersCount} Managers · ${metrics.agentsCount} Agents`,
      icon: ShieldCheck,
      variant: "cyan",
      to: "/owner/team",
    },
    {
      title: "Total Customers",
      value: metrics.customersCount,
      meta: "Registered in workspace",
      icon: Users,
      variant: "blue",
      to: "/owner/team?tab=customer",
    },
    {
      title: "Total Tickets",
      value: metrics.totalTickets,
      meta: "All company tickets",
      icon: Ticket,
      variant: "warning",
      to: "/owner/tickets",
    },
    {
      title: "Resolved Tickets",
      value: metrics.resolvedTickets,
      meta: `AI: ${metrics.resolvedByAi} · Agents: ${metrics.resolvedByAgent}`,
      icon: CheckCircle2,
      variant: "green",
      to: "/owner/tickets?status=resolved",
    },
    {
      title: "Urgent Tickets",
      value: metrics.urgentTickets,
      meta: "High & Critical priority",
      icon: Flame,
      variant: "red",
      to: "/owner/tickets?priority=high",
    },
  ];

  // =====================================================
  // TEAM REQUEST APPROVE / REJECT MUTATION
  // =====================================================

  const teamActionMutation = useMutation({
    mutationFn: ({ uid, action, reason }) =>
      apiRequest(user, `/owner/team/${encodeURIComponent(uid)}/action`, {
        method: "PATCH",
        body: {
          action,
          ...(action === "reject" ? { reason } : {}),
        },
      }),
  });

  const actionLoading = teamActionMutation.isPending;

  const refreshOwnerQueries = () => {
    void Promise.allSettled([
      queryClient.invalidateQueries({ queryKey: ["owner-overview"] }),
      queryClient.invalidateQueries({ queryKey: ["owner-team"] }),
      queryClient.invalidateQueries({ queryKey: ["owner-subscription"] }),
    ]);
  };

  const openReviewModal = (member, action) => {
    if (submitLock.current || !member?.uid) return;

    setRejectionReason("");
    setActionError("");
    teamActionMutation.reset();

    setReviewModal({
      member,
      action,
    });
  };

  const closeReviewModal = () => {
    if (!submitLock.current) {
      setReviewModal(null);
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!reviewModal || submitLock.current) return;

    const { member, action } = reviewModal;

    if (action === "reject" && !rejectionReason.trim()) {
      setActionError("Please provide a rejection reason.");
      return;
    }

    submitLock.current = true;
    setActionError("");

    try {
      const result = await teamActionMutation.mutateAsync({
        uid: member.uid,
        action,
        reason: rejectionReason.trim(),
      });

      toast.success(
        result.message ||
          (action === "approve"
            ? `${member.name} approved successfully`
            : `${member.name}'s request rejected`),
      );

      setReviewModal(null);
      refreshOwnerQueries();
    } catch (err) {
      setActionError(err.message || "Unable to update team request");

      if ([401, 403, 404, 409].includes(err.status)) {
        refreshOwnerQueries();
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold">Owner Overview</h1>
            <TextBadge variant="orange" className="gap-1 capitalize">
              <Crown size={11} />
              {companyName}
            </TextBadge>
            {subscription.planName && (
              <TextBadge variant="purple">{subscription.planName}</TextBadge>
            )}
            {refreshError && (
              <TextBadge variant="slate">Refresh failed</TextBadge>
            )}
          </div>
          <p className="mt-1 text-xs text-base-content/50">
            {refreshError
              ? "Showing the last loaded data. Automatic refresh will retry."
              : "Manage workspace subscription, team roles, company tickets, and overall performance."}
          </p>
        </div>

        <Link to="/owner/subscription">
          <GradientButton
            size="sm"
            buttonClassName="from-primary/15 to-secondary/20 text-base-content px-3.5"
          >
            <span className="flex items-center gap-1.5 text-xs">
              Manage Plan <ArrowRight size={13} />
            </span>
          </GradientButton>
        </Link>
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

      {/* 3. TOP ROW: THREE CHARTS */}
      <div className="grid gap-3 md:grid-cols-3">
        {/* Chart 1: Weekly Ticket Activity */}
        <CardWithBlurBlob className="min-w-0 p-5" interactive={false}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">Weekly Ticket Activity</h3>
              <p className="text-[11px] text-base-content/50">
                Created vs resolved across 7 days
              </p>
            </div>
            <TextBadge variant="blue" size="sm">
              7 Days
            </TextBadge>
          </div>

          <div className="mt-3 h-[235px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyActivityData}
                margin={{ top: 10, left: -26, right: 6 }}
              >
                <defs>
                  <linearGradient id="ownerCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="ownerResolved"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(148,163,184,0.2)"
                />
                <XAxis
                  dataKey="day"
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
                <Area
                  type="monotone"
                  dataKey="created"
                  name="Created"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#ownerCreated)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#ownerResolved)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardWithBlurBlob>

        {/* Chart 2: All Ticket Status */}
        <CardWithBlurBlob className="min-w-0 p-5" interactive={false}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">All Ticket Status</h3>
              <p className="text-[11px] text-base-content/50">
                Open, assigned, pending, resolved &amp; closed
              </p>
            </div>
            <TextBadge variant="slate" size="sm">
              {metrics.totalTickets}
            </TextBadge>
          </div>

          <div className="mt-3 h-[235px] w-full">
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
                  maxBarSize={52}
                >
                  {statusChartData.map((entry) => (
                    <Cell key={entry.key} fill={statusColors[entry.key]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardWithBlurBlob>

        {/* Chart 3: Resolution Breakdown */}
        <CardWithBlurBlob className="min-w-0 p-5" interactive={false}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">Resolution Breakdown</h3>
              <p className="text-[11px] text-base-content/50">
                AI vs Human Agent resolution
              </p>
            </div>
            <TextBadge variant="purple" size="sm">
              {aiResolutionPercent}% AI
            </TextBadge>
          </div>

          <div className="mt-3 h-[235px] w-full">
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
      </div>

      {/* 4. SECOND ROW: CATEGORY CHART (LEFT 8 COLS) + SUBSCRIPTION CARD (RIGHT 4 COLS) */}
      <div className="grid items-stretch gap-3 xl:grid-cols-12">
        {/* Left: Chart 4 - Tickets by Category */}
        <CardWithBlurBlob
          className="min-w-0 p-5 xl:col-span-8"
          interactive={false}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">Tickets by Category</h3>
              <p className="text-[11px] text-base-content/50">
                Distribution of customer support requests by issue category
              </p>
            </div>
            <TextBadge variant="cyan" size="sm">
              Top {categoryChartData.length || 5} Categories
            </TextBadge>
          </div>

          {categoryChartData.length === 0 ? (
            <EmptyState
              icon={Ticket}
              title="No categorized tickets yet"
              description="Category breakdown will appear once support tickets are submitted."
            />
          ) : (
            <div className="mt-3 h-[235px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryChartData}
                  layout="vertical"
                  margin={{ top: 6, left: 6, right: 20, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="rgba(148,163,184,0.2)"
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    width={92}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(148,163,184,0.08)" }}
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: "#f8fafc" }}
                  />
                  <Bar
                    dataKey="tickets"
                    name="Tickets"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={28}
                  >
                    {categoryChartData.map((entry, idx) => (
                      <Cell
                        key={entry.category}
                        fill={categoryColors[idx % categoryColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardWithBlurBlob>

        {/* Right: Subscription Status Card with Gradient Progressbar & Expiry Details */}
        <CardWithBlurBlob
          className="flex flex-col justify-between p-5 xl:col-span-4"
          interactive={false}
        >
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Subscription Status</h3>
                <p className="mt-0.5 text-[11px] text-base-content/50">
                  Plan validity, billing &amp; seat capacity
                </p>
              </div>
              <TextBadge
                variant={
                  subscription.status === "active"
                    ? "green"
                    : subscription.status === "expired"
                      ? "red"
                      : "blue"
                }
                className="capitalize"
              >
                {subscription.status === "active"
                  ? "Active"
                  : subscription.status === "expired"
                    ? "Expired"
                    : "Default"}
              </TextBadge>
            </div>

            <div className="mt-4 rounded-xl border border-base-content/10 bg-base-200/40 p-4">
              {/* Plan Name & Price */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-primary" />
                  <span className="text-xs font-semibold">
                    {subscription.planName || "Default Plan"}
                  </span>
                </div>
                <span className="text-sm font-bold text-primary">
                  {subscription.price || "$0/mo"}
                </span>
              </div>

              {/* Gradient Progress Bar */}
              <div className="mt-3.5">
                <div className="mb-1.5 flex items-center justify-between text-[11px] text-base-content/65">
                  <span>Workspace Seats</span>
                  <span className="font-medium">
                    {seatsUsed} / {seatsLimit} ({seatPercentage}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-base-300/80">
                  <div
                    style={{ width: `${seatPercentage}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                  />
                </div>
              </div>

              {/* Subscription Details: No dashes */}
              <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-base-content/10 pt-3 text-[11px]">
                <div>
                  <p className="text-base-content/50">Expire Date</p>
                  <p className="mt-0.5 flex items-center gap-1 font-semibold text-base-content">
                    <CalendarClock size={12} className="text-primary" />
                    {subscription.expireDate || "Not Applicable"}
                  </p>
                </div>

                <div>
                  <p className="text-base-content/50">Time Due</p>
                  <p
                    className={cn(
                      "mt-0.5 font-semibold",
                      dueInfo.isUrgent ? "text-warning" : "text-success",
                    )}
                  >
                    {dueInfo.label}
                  </p>
                </div>

                <div>
                  <p className="text-base-content/50">Billing Cycle</p>
                  <p className="mt-0.5 font-medium text-base-content/80">
                    {subscription.billingCycle || "Not Subscribed"}
                  </p>
                </div>

                <div>
                  <p className="text-base-content/50">Ticket Quota</p>
                  <p className="mt-0.5 font-medium text-base-content/80">
                    {subscription.monthlyTicketLimit || "30 / mo"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/owner/subscription"
            className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            Upgrade or manage billing <ArrowRight size={13} />
          </Link>
        </CardWithBlurBlob>
      </div>

      {/* 5. MAIN TWO-COLUMN LAYOUT (Tables + Urgent & Activity) */}
      <div className="grid items-start gap-3 xl:grid-cols-12">
        {/* LEFT COLUMN (8 cols) */}
        <div className="min-w-0 space-y-3 xl:col-span-8">
          {/* A. PENDING TEAM & ROLE REQUESTS */}
          <CardWithBlurBlob className="overflow-hidden p-0" interactive={false}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-content/5 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">
                    Pending Team &amp; Role Requests
                  </h2>
                  <TextBadge variant="warning">
                    {metrics.pendingApprovals}
                  </TextBadge>
                </div>
                <p className="mt-0.5 text-[11px] text-base-content/50">
                  Approve or review new agent and manager join requests
                </p>
              </div>

              <Link
                to="/owner/team?tab=pending"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Manage Team <ArrowRight size={13} />
              </Link>
            </div>

            {pendingRequestsList.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No pending team requests"
                description="All team role and onboarding requests have been reviewed."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr className="text-[11px] uppercase text-base-content/50">
                      <th className="px-5">Member</th>
                      <th>Requested Role</th>
                      <th>Requested</th>
                      <th>Status</th>
                      <th className="pr-5 text-right">Quick Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequestsList.map((member) => (
                      <tr key={member._id || member.uid}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/15 text-xs font-semibold text-warning">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium">
                                {member.name}
                              </p>
                              <p className="truncate text-[11px] text-base-content/50">
                                {member.email || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td>
                          <TextBadge
                            variant={
                              roleBadgeVariants[member.requestedRole] || "slate"
                            }
                            className="capitalize"
                          >
                            {member.requestedRole}
                          </TextBadge>
                        </td>

                        <td className="whitespace-nowrap text-xs text-base-content/60">
                          {formatTimeAgo(member.createdAt)}
                        </td>

                        <td>
                          <TextBadge variant="yellow">Pending</TextBadge>
                        </td>

                        <td className="pr-5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => openReviewModal(member, "approve")}
                              className="inline-flex items-center gap-1 rounded-lg bg-success/15 px-2.5 py-1 text-[11px] font-medium text-success transition hover:bg-success/25 disabled:opacity-50"
                            >
                              <Check size={12} /> Approve
                            </button>
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => openReviewModal(member, "reject")}
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
                to="/owner/tickets"
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
                              to={`/owner/tickets/${ticket._id}`}
                              className="mt-1 block line-clamp-1 text-sm font-medium hover:text-primary"
                            >
                              {ticketTitle}
                            </Link>

                            <p className="mt-1 line-clamp-1 text-xs text-base-content/50">
                              {ticket.aiResult?.summary ||
                                `Customer: ${
                                  ticket.userInfo?.displayName || "Unknown"
                                }`}
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
                            to={`/owner/tickets/${ticket._id}`}
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
                  to="/owner/tickets?priority=high"
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
                  Workspace ticket escalations, team requests, and updates will
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

      {/* TEAM APPROVE / REJECT MODAL */}
      {reviewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={closeReviewModal}
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
                      ? "Approve Team Request"
                      : "Reject Team Request"}
                  </h3>
                  <p className="mt-0.5 text-xs text-base-content/55">
                    {reviewModal.member.name} ({reviewModal.member.email || "—"}
                    )
                  </p>
                </div>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={closeReviewModal}
                  aria-label="Close modal"
                  className="rounded-xl p-1.5 text-base-content/50 transition hover:bg-base-content/10 hover:text-base-content"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
                {reviewModal.action === "approve" ? (
                  <p className="rounded-xl border border-success/20 bg-success/5 p-3.5 text-sm text-base-content/75">
                    Approve <strong>{reviewModal.member.name}</strong> as{" "}
                    <strong className="capitalize">
                      {reviewModal.member.requestedRole}
                    </strong>{" "}
                    in {companyName}&apos;s workspace?
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
                      placeholder="Write why this request is rejected..."
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
                    onClick={closeReviewModal}
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
