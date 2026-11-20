import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Flame,
  Inbox,
  MessageSquareText,
  PieChart as PieChartIcon,
  RefreshCw,
  Ticket,
  UserCheck,
} from "lucide-react";

import {
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

import { Link } from "react-router";
import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";

import { AuthContext } from "@/providers/AuthProvider";
import CardWithBlurBlob from "@/components/ui/Card/CardWithBlurBlob";
import SoftIconCard from "@/components/ui/Card/SoftIconCard";
import TextBadge from "@/components/ui/Badge/TextBadge";
import LoadingPage from "@/pages/system/LoadingPage";
import AccountStatusNotice from "@/components/ui/Notice/AccountStatusNotice";

const API_URL = "https://support-hub-server.vercel.app";

const statusColors = {
  open: "#3b82f6",
  assigned: "#A855F7",
  in_progress: "#f59e0b",
  resolved: "#22c55e",
  closed: "#64748b",
};

const statusVariants = {
  open: "blue",
  assigned: "purple",
  in_progress: "yellow",
  resolved: "green",
  closed: "slate",
};

const priorityColors = {
  low: "#22C55E",
  medium: "#EAB308",
  high: "#F97316",
  critical: "#ef4444",
};

const priorityVariants = {
  low: "green",
  medium: "yellow",
  high: "warning",
  critical: "red",
};

const tooltipStyle = {
  backgroundColor: "#1e293b",
  border: "none",
  borderRadius: "12px",
  fontSize: "11px",
};

async function fetchApi(user, path, signal) {
  const token = await user.getIdToken();

  const response = await fetch(`${API_URL}${path}`, {
    signal,
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result || result.success === false) {
    const error = new Error(
      result?.message || `Request failed (${response.status})`,
    );

    error.status = response.status;
    throw error;
  }

  return result;
}

function getPriority(ticket) {
  if (typeof ticket.priority === "string" && ticket.priority.trim()) {
    return ticket.priority.trim().toLowerCase();
  }

  const states = Array.isArray(ticket.aiResult?.states)
    ? ticket.aiResult.states
    : [];

  const priority = states.find(
    (item) =>
      String(item.title || "")
        .trim()
        .toLowerCase() === "priority",
  );

  return String(priority?.value || "")
    .trim()
    .toLowerCase();
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

function EmptyState({ icon = Inbox, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
      <SoftIconCard icon={icon} variant="slate" className="mb-3" />

      <p className="text-sm font-medium text-base-content/70">{title}</p>

      {description && (
        <p className="mt-2 max-w-sm text-xs leading-5 text-base-content/50">
          {description}
        </p>
      )}
    </div>
  );
}

function ErrorState({ message, onRetry, fetching }) {
  return (
    <div className="rounded-xl border border-error/20 bg-error/5 p-5">
      <p className="text-sm text-error">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        disabled={fetching}
        className="mt-3 text-xs font-medium underline disabled:opacity-50"
      >
        {fetching ? "Retrying..." : "Try again"}
      </button>
    </div>
  );
}

export default function AgentDashboard() {
  const { user } = useContext(AuthContext);

  // =====================================================
  // CURRENT AGENT
  // =====================================================

  const agentQuery = useQuery({
    queryKey: ["currentAgent", user?.uid],
    enabled: Boolean(user),
    retry: false,

    queryFn: async ({ signal }) => {
      const result = await fetchApi(user, "/users/me", signal);
      return result.user;
    },
  });

  const currentAgent = agentQuery.data;

  const isApproved = currentAgent?.verifyIdAgent === "approved";

  const canLoadDashboard =
    Boolean(user) &&
    !agentQuery.isError &&
    currentAgent?.role === "agent" &&
    currentAgent?.status === "active" &&
    isApproved;

  // =====================================================
  // DASHBOARD
  // =====================================================

  const dashboardQuery = useQuery({
    queryKey: ["agentDashboard", user?.uid],
    enabled: canLoadDashboard,
    retry: false,

    queryFn: ({ signal }) =>
      fetchApi(user, "/dashboard/agent-overview", signal),

    refetchInterval: (query) =>
      query.state.status === "error" ? false : 15000,
  });

  // =====================================================
  // RECENT NOTIFICATIONS
  // =====================================================

  const notificationQuery = useQuery({
    queryKey: ["agentDashboardNotification", user?.uid],
    enabled: canLoadDashboard,
    retry: false,

    queryFn: async ({ signal }) => {
      const result = await fetchApi(
        user,
        "/notifications?limit=4&page=1",
        signal,
      );

      return Array.isArray(result.notifications) ? result.notifications : [];
    },

    refetchInterval: (query) =>
      query.state.status === "error" ? false : 30000,
  });

  const data = dashboardQuery.data;
  const metrics = data?.metrics || {};

  const recentTickets = Array.isArray(data?.recentTickets)
    ? data.recentTickets
    : [];

  const urgentTickets = Array.isArray(data?.urgentTickets)
    ? data.urgentTickets
    : [];

  const notifications = notificationQuery.data || [];

  const stats = [
    {
      title: "Assigned to Me",
      value: metrics.assignedToMe || 0,
      meta: "Assigned + in progress",
      icon: UserCheck,
      variant: "purple",
    },
    {
      title: "Unassigned Company Tickets",
      value: metrics.openCompanyTickets || 0,
      meta: "Available to claim",
      icon: Inbox,
      variant: "cyan",
    },
    {
      title: "In Progress",
      value: metrics.inProgressTickets || 0,
      meta: "My active work",
      icon: Clock3,
      variant: "warning",
    },
    {
      title: "Critical & High Priority",
      value: metrics.urgentActionableTickets || 0,
      meta: "Queue + my active tickets",
      icon: Flame,
      variant: "red",
    },
  ];

  const statusData = Object.keys(statusColors).map((key) => ({
    key,
    name:
      key === "in_progress"
        ? "In Progress"
        : key.charAt(0).toUpperCase() + key.slice(1),
    value: data?.statusChart?.[key] || 0,
  }));

  const priorityData = Object.keys(priorityColors).map((key) => ({
    key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: data?.priorityChart?.[key] || 0,
  }));

  const hasStatusData = statusData.some((item) => item.value > 0);
  const hasPriorityData = priorityData.some((item) => item.value > 0);

  const refreshDashboard = () =>
    Promise.all([
      agentQuery.refetch(),
      dashboardQuery.refetch(),
      notificationQuery.refetch(),
    ]);

  // =====================================================
  // ACCESS / LOADING / ERROR
  // =====================================================

  if (!user) {
    return (
      <div className="p-5">
        <EmptyState
          title="Sign in required"
          description="Sign in with your support agent account."
        />
      </div>
    );
  }

  if (agentQuery.isLoading) {
    return <LoadingPage />;
  }

  if (agentQuery.isError) {
    return (
      <div className="p-5">
        <ErrorState
          message={agentQuery.error.message}
          onRetry={() => agentQuery.refetch()}
          fetching={agentQuery.isFetching}
        />
      </div>
    );
  }

  if (
    !currentAgent ||
    currentAgent.role !== "agent" ||
    !["active", "suspended"].includes(currentAgent.status)
  ) {
    return (
      <div className="p-5">
        <EmptyState
          title="Agent dashboard unavailable"
          description="An active support agent account is required."
        />
      </div>
    );
  }

  if (currentAgent.status === "suspended" || !isApproved) {
    const noticeStatus =
      currentAgent.status === "suspended"
        ? "suspended"
        : currentAgent.verifyIdAgent === "rejected"
          ? "rejected"
          : "pending";

    return (
      <AccountStatusNotice
        role="agent"
        status={noticeStatus}
        rejectionReason={currentAgent.rejectionReason}
        userEmail={currentAgent.email || user?.email}
        companyName={currentAgent.companyName}
        isChecking={agentQuery.isFetching}
        onRefresh={() => agentQuery.refetch()}
      />
    );
  }

  if (dashboardQuery.isLoading) {
    return <LoadingPage />;
  }

  // Do not show API errors as zero tickets.
  if (dashboardQuery.isError || !data) {
    return (
      <div className="p-5">
        <ErrorState
          message={
            dashboardQuery.error?.message || "Dashboard data is unavailable"
          }
          onRetry={() => dashboardQuery.refetch()}
          fetching={dashboardQuery.isFetching}
        />
      </div>
    );
  }

  return (
    <section className="relative min-h-full space-y-3 p-4 lg:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Agent Dashboard</h1>
          <p className="text-xs text-base-content/50">
            Company queue and your support workload
          </p>
        </div>

        <button
          type="button"
          onClick={refreshDashboard}
          disabled={
            agentQuery.isFetching ||
            dashboardQuery.isFetching ||
            notificationQuery.isFetching
          }
          className="flex items-center gap-2 rounded-xl border border-base-content/10 px-3 py-2 text-xs disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={dashboardQuery.isFetching ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Top statistics */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <CardWithBlurBlob
            key={item.title}
            className="p-4"
            interactive={false}
          >
            <div className="flex items-start justify-between gap-3">
              <SoftIconCard icon={item.icon} size={15} variant={item.variant} />

              <p className="text-right text-[10px] text-base-content/50">
                {item.meta}
              </p>
            </div>

            <div className="mt-5">
              <h2 className="text-3xl font-semibold leading-none">
                {item.value}
              </h2>

              <p className="mt-2 text-xs text-base-content/60">{item.title}</p>
            </div>
          </CardWithBlurBlob>
        ))}
      </div>

      <div className="flex flex-col items-start gap-3 xl:flex-row">
        {/* Left column */}
        <div className="min-w-0 w-full space-y-3 xl:w-2/3">
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Company status chart */}
            <CardWithBlurBlob className="min-w-0 p-5" interactive={false}>
              <h3 className="text-sm font-semibold">Ticket Status</h3>
              <p className="text-[11px] text-base-content/50">
                All tickets in your company
              </p>

              {!hasStatusData ? (
                <EmptyState icon={PieChartIcon} title="No status data yet" />
              ) : (
                <div className="mt-3 h-[260px] w-full">
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
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={1}
                      >
                        {statusData.map((item) => (
                          <Cell key={item.key} fill={statusColors[item.key]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardWithBlurBlob>

            {/* Actionable priority chart */}
            <CardWithBlurBlob className="min-w-0 p-5" interactive={false}>
              <h3 className="text-sm font-semibold">Priority Breakdown</h3>
              <p className="text-[11px] text-base-content/50">
                Unassigned queue + my active tickets
              </p>

              {!hasPriorityData ? (
                <EmptyState
                  icon={Flame}
                  title="No priority data for actionable tickets"
                />
              ) : (
                <div className="mt-3 h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={priorityData}
                      margin={{ top: 10, left: -25 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(148,163,184,0.26)"
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
                        cursor={{ fill: "transparent" }}
                        contentStyle={tooltipStyle}
                        labelStyle={{ color: "#f8fafc" }}
                        itemStyle={{ color: "#f8fafc" }}
                      />

                      <Bar
                        dataKey="value"
                        name="Tickets"
                        radius={[8, 8, 0, 0]}
                        barSize={45}
                      >
                        {priorityData.map((item) => (
                          <Cell
                            key={item.key}
                            fill={priorityColors[item.key]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardWithBlurBlob>
          </div>

          {/* Recent company tickets */}
          <CardWithBlurBlob className="overflow-hidden p-0" interactive={false}>
            <div className="flex items-center justify-between gap-3 border-b border-base-content/5 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">
                  Recent Company Tickets
                </h2>

                <p className="mt-1 text-[11px] text-base-content/50">
                  Latest {recentTickets.length} of {data.recentTotal || 0}
                  {" · "}Sorted by latest update
                </p>
              </div>

              <Link
                to="/agent/tickets"
                className="flex shrink-0 items-center gap-2 text-xs text-base-content/60 hover:text-primary"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {recentTickets.length === 0 ? (
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
                    {recentTickets.map((ticket) => {
                      const priority = getPriority(ticket);
                      const canRead = ticket.permission?.canRead === true;

                      const assignment = ticket.currentAgent?.uid
                        ? ticket.currentAgent.uid === user.uid
                          ? "Assigned to me"
                          : "Another agent"
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
                            <p className="font-mono text-[11px] text-base-content/50">
                              {ticket.ticketNumber}
                            </p>

                            {canRead ? (
                              <Link
                                to={`/agent/tickets/${ticket._id}`}
                                className="mt-1 block line-clamp-1 text-sm font-medium hover:text-primary"
                              >
                                {ticketTitle}
                              </Link>
                            ) : (
                              <p className="mt-1 line-clamp-1 text-sm font-medium">
                                {ticketTitle}
                              </p>
                            )}

                            <p className="mt-1 line-clamp-1 text-xs text-base-content/50">
                              {ticket.aiResult?.summary ||
                                "No summary available"}
                            </p>

                            {!canRead && (
                              <span className="mt-1 block text-[10px] text-base-content/40">
                                Summary only
                              </span>
                            )}
                          </td>

                          <td>
                            <TextBadge
                              variant={priorityVariants[priority] || "slate"}
                            >
                              {priority || "Not set"}
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

                          <td className="text-xs text-base-content/60">
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

        {/* Right column */}
        <div className="w-full space-y-3 xl:w-1/3">
          {/* Unassigned urgent queue */}
          <CardWithBlurBlob className="p-5" interactive={false}>
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">
                  Unassigned Urgent Tickets
                </h3>
                <p className="mt-1 text-[11px] text-base-content/50">
                  High / critical tickets waiting for an agent
                </p>
              </div>

              <TextBadge variant="red">{data.urgentTotal || 0}</TextBadge>
            </div>

            {urgentTickets.length === 0 ? (
              <EmptyState
                icon={Flame}
                title="No unassigned urgent tickets"
                description="There are no open, unassigned high or critical priority tickets in your company queue."
              />
            ) : (
              <>
                <p className="mb-3 text-[11px] text-base-content/50">
                  Showing {urgentTickets.length} of {data.urgentTotal}
                  {" · "}Critical first, then oldest
                </p>

                <div className="space-y-2">
                  {urgentTickets.map((ticket) => {
                    const priority = getPriority(ticket);

                    return (
                      <Link
                        key={ticket._id}
                        to={`/agent/tickets/${ticket._id}`}
                        className="block rounded-xl border-2 border-dashed border-base-content/10 px-4 py-4 transition hover:border-primary/30 hover:bg-primary/5"
                      >
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <p className="font-mono text-[11px] text-base-content/50">
                            {ticket.ticketNumber}
                          </p>

                          <TextBadge
                            variant={priorityVariants[priority] || "red"}
                          >
                            {priority || "Not set"}
                          </TextBadge>
                        </div>

                        <h4 className="line-clamp-2 text-sm font-semibold">
                          {ticket.aiResult?.ticketTitle || "Untitled Ticket"}
                        </h4>

                        <p className="mt-1 truncate text-xs text-base-content/50">
                          {ticket.userInfo?.displayName ||
                            ticket.customerName ||
                            ticket.email ||
                            "Customer"}
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <TextBadge variant="blue">Unassigned</TextBadge>

                          <span className="flex items-center gap-1 text-[11px] text-primary">
                            View & claim <ArrowRight size={12} />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <Link
                  to="/agent/tickets"
                  className="mt-4 flex items-center justify-center gap-2 text-xs text-primary"
                >
                  Open company queue <ArrowRight size={14} />
                </Link>
              </>
            )}
          </CardWithBlurBlob>

          {/* Notifications */}
          <CardWithBlurBlob className="p-5" interactive={false}>
            <h3 className="text-sm font-semibold">Recent Activity</h3>
            <p className="text-[11px] text-base-content/50">
              Your latest notifications
            </p>

            {notificationQuery.isLoading ? (
              <div className="mt-5 space-y-3">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="skeleton h-12 w-full" />
                ))}
              </div>
            ) : notificationQuery.isError ? (
              <div className="mt-4">
                <ErrorState
                  message={notificationQuery.error.message}
                  onRetry={() => notificationQuery.refetch()}
                  fetching={notificationQuery.isFetching}
                />
              </div>
            ) : notifications.length === 0 ? (
              <EmptyState
                icon={MessageSquareText}
                title="No recent notifications"
              />
            ) : (
              <div className="mt-5 space-y-4">
                {notifications.map((item) => (
                  <div key={item._id} className="flex items-start gap-3">
                    <SoftIconCard
                      icon={MessageSquareText}
                      size={14}
                      variant={
                        item.type === "ticket_resolved"
                          ? "green"
                          : item.type === "customer_reply"
                            ? "purple"
                            : "slate"
                      }
                      className="h-8 w-8 shrink-0 rounded-xl"
                    />

                    <div className="min-w-0">
                      <p className="text-xs font-medium">{item.title}</p>
                      <p className="mt-1 text-[11px] leading-5 text-base-content/50">
                        {item.message}
                      </p>
                      <p className="mt-1 text-[10px] text-base-content/40">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardWithBlurBlob>

          {/* Work insights */}
          <CardWithBlurBlob className="p-5" interactive={false}>
            <h3 className="text-sm font-semibold">Agent Work Insights</h3>

            <div className="mt-4 space-y-3">
              {[
                `${metrics.assignedToMe || 0} active tickets assigned to you.`,
                `${metrics.inProgressTickets || 0} tickets currently in progress.`,
                `${metrics.unassignedUrgentTickets || 0} urgent tickets waiting for an agent.`,
                `${metrics.resolvedToday || 0} currently resolved or closed tickets resolved by you today.`,
              ].map((text) => (
                <div key={text} className="flex gap-3">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-success"
                  />
                  <p className="text-xs leading-5 text-base-content/70">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </CardWithBlurBlob>
        </div>
      </div>
    </section>
  );
}
