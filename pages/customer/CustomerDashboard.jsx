import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MessageSquareText,
  Sparkles,
  Ticket,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import CardWithBlurBlob from "../../components/ui/Card/CardWithBlurBlob";
import GradientButton from "../../components/ui/Button/GradientButton";
import SoftIconCard from "../../components/ui/Card/SoftIconCard";
import TextBadge from "../../components/ui/Badge/TextBadge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { AuthContext } from "../../app/providers/AuthProvider";
import { Link, useNavigate } from "react-router";
import { cn } from "../../src/lib/cn";

const CustomerDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // =========================
  // FETCH CUSTOMER OVERVIEW
  // =========================
  const {
    data,
    isLoading: loading,
    isError: dashboardError,
    error: dashboardErrorInfo,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ["customerDashboard", user?.uid],
    enabled: !!user,
    queryFn: async () => {
      const token = await user.getIdToken();
      const res = await fetch(
        "http://localhost:3021/dashboard/customer-overview",
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to load dashboard overview");
      }
      return result;
    },
  });

  // =========================
  // FETCH NOTIFICATIONS
  // =========================
  const {
    data: notificationData = [],
    isLoading: notifyLoading,
    isError: notifyError,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ["customerDashboardNotification", user?.uid],
    enabled: !!user,
    queryFn: async () => {
      const token = await user.getIdToken();
      const res = await fetch("http://localhost:3021/notifications?limit=4", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch notifications");
      }
      return result.notifications || [];
    },
  });

  // Mark notification read on click
  const markReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const token = await user.getIdToken();

      const res = await fetch(
        `http://localhost:3021/notifications/${notificationId}`,
        {
          method: "PATCH",
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.message || "Failed to mark notification as read",
        );
      }

      return result;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customerDashboardNotification", user?.uid],
      });

      queryClient.invalidateQueries({
        queryKey: ["userNotifications", user?.uid],
      });
    },

    onError: (error) => {
      console.error("Notification update failed:", error);
    },
  });

  const handleActivityClick = (act) => {
    if (!act.isRead && act._id) {
      markReadMutation.mutate(act._id);
    }
    if (act.path) {
      navigate(act.path);
    }
  };

  // Bar cell colors (matching all backend status groups)
  const barColors = {
    open: "#3b82f6", // Blue
    pending: "#f59e0b", // Amber (assigned + in_progress)
    resolved: "#22c55e", // Green
    closed: "#64748b", // Slate
  };

  // STATS DATA (100% aligned with backend metrics)
  const stats = [
    {
      title: "Open tickets",
      value: data?.metrics?.openTickets ?? 0,
      meta: "Awaiting assignment",
      icon: Ticket,
      variant: "info",
    },
    {
      title: "In progress",
      value: data?.metrics?.inProgressTickets ?? 0,
      meta: "Agent working",
      icon: Clock3,
      variant: "warning",
    },
    {
      title: "Total tickets",
      value: data?.metrics?.totalTickets ?? 0,
      meta: "All time",
      icon: MessageSquareText,
      variant: "success",
    },
    {
      title: "AI Resolved",
      value: data?.metrics?.aiResolved ?? 0,
      meta: "Resolved by AI",
      icon: Sparkles,
      variant: "primary",
    },
  ];

  // Current Status (includes Closed from backend statusChart)
  const statusData = [
    { name: "Open", value: data?.statusChart?.open ?? 0 },
    {
      name: "Pending",
      value:
        (data?.statusChart?.assigned ?? 0) +
        (data?.statusChart?.in_progress ?? 0),
    },
    { name: "Resolved", value: data?.statusChart?.resolved ?? 0 },
    { name: "Closed", value: data?.statusChart?.closed ?? 0 },
  ];

  if (dashboardError && !loading) {
    return (
      <section className="p-4 lg:p-5">
        <CardWithBlurBlob interactive={false} className="p-8 text-center">
          <h2 className="text-lg font-semibold text-error">
            Failed to load dashboard
          </h2>

          <p className="mt-2 text-sm text-base-content/60">
            {dashboardErrorInfo?.message || "Something went wrong."}
          </p>

          <button
            type="button"
            onClick={() => refetchDashboard()}
            className="btn btn-primary btn-sm mt-5"
          >
            Retry
          </button>
        </CardWithBlurBlob>
      </section>
    );
  }

  return (
    <section className="relative min-h-full p-4 lg:p-5">
      {/* ========================= */}
      {/* STATS CARDS */}
      {/* ========================= */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <CardWithBlurBlob key={i} interactive={false} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="skeleton h-10 w-10 rounded-xl"></div>
                  <div className="skeleton h-4 w-16"></div>
                </div>
                <div className="mt-5 space-y-2">
                  <div className="skeleton h-8 w-24"></div>
                  <div className="skeleton h-4 w-20"></div>
                </div>
              </CardWithBlurBlob>
            ))
          : stats.map((item) => (
              <CardWithBlurBlob
                key={item.title}
                className="p-4"
                interactive={false}
              >
                <div className="flex items-start justify-between">
                  <SoftIconCard
                    icon={item.icon}
                    size={15}
                    variant={item.variant}
                  />
                  <p className="text-[10px] text-base-content/50">
                    {item.meta}
                  </p>
                </div>
                <div className="mt-5">
                  <h2 className="text-3xl font-semibold leading-none">
                    {item.value}
                  </h2>
                  <p className="mt-2 text-xs text-base-content/60">
                    {item.title}
                  </p>
                </div>
              </CardWithBlurBlob>
            ))}
      </div>

      <div className="mt-3 flex w-full flex-col items-start justify-center gap-3 xl:flex-row">
        {/* LEFT COLUMN (Charts + Recent Tickets) */}
        <div className="flex w-full flex-col items-center justify-center gap-3 xl:w-2/3">
          <div className="flex w-full flex-col gap-3 sm:flex-row">
            {/* Activity Area Chart */}
            <CardWithBlurBlob
              className="w-full p-5 xl:col-span-2 xl:w-7/12"
              interactive={false}
            >
              {loading ? (
                <div>
                  <div className="mb-6 space-y-2">
                    <div className="skeleton h-4 w-24"></div>
                    <div className="skeleton h-4 w-36"></div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton mb-7 h-4 w-1/2"></div>
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-1/2"></div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold">Ticket Activity</h3>
                    <p className="text-[11px] text-base-content/50">
                      Trends in the last 12 months
                    </p>
                  </div>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={data?.activityChart || []}
                        margin={{
                          top: 5,
                          left: -30,
                        }}
                      >
                        <defs>
                          <linearGradient
                            id="colorTickets"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#7c3aed"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#7c3aed"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="rgba(148,163,184,0.26)"
                        />
                        <XAxis
                          dataKey="month"
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
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "11px",
                          }}
                          labelStyle={{ color: "#f8fafc" }}
                          itemStyle={{ color: "#f8fafc" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorTickets)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </CardWithBlurBlob>

            {/* Status Bar Chart */}
            <CardWithBlurBlob
              className="w-full p-5 xl:w-5/12"
              interactive={false}
            >
              {loading ? (
                <div>
                  <div className="mb-6 space-y-2">
                    <div className="skeleton h-4 w-24"></div>
                    <div className="skeleton h-4 w-36"></div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton mb-7 h-4 w-1/2"></div>
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-1/2"></div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold">Current Status</h3>
                    <p className="text-[11px] text-base-content/50">
                      Real-time ticket distribution
                    </p>
                  </div>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={statusData}
                        margin={{
                          top: 5,
                          left: -30,
                        }}
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
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "11px",
                          }}
                          labelStyle={{ color: "#f8fafc" }}
                          itemStyle={{ color: "#f8fafc" }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={38}>
                          {statusData.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={barColors[entry.name.toLowerCase()]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </CardWithBlurBlob>
          </div>

          {/* Recent Tickets Table */}
          <div className="w-full">
            <CardWithBlurBlob
              className="overflow-hidden p-0"
              interactive={false}
            >
              {/* header */}
              {loading ? (
                <div className="flex items-center justify-between border-b border-base-content/5 px-5 py-3">
                  <div>
                    <div className="skeleton my-2 h-3 w-20"></div>
                    <div className="skeleton my-2 h-3 w-28"></div>
                  </div>
                  <div className="skeleton my-2 h-5 w-20"></div>
                </div>
              ) : (
                <div className="flex items-center justify-between border-b border-base-content/5 px-5 py-4">
                  <div>
                    <h2 className="text-sm font-semibold">Recent tickets</h2>
                    <p className="text-[11px] uppercase tracking-wider text-base-content/50">
                      Latest updates
                    </p>
                  </div>
                  <Link
                    to="/customer/tickets"
                    className="flex items-center gap-2 text-xs font-medium text-base-content/50 transition-all hover:gap-3 hover:text-primary"
                  >
                    View all <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              {/* Empty State vs Table */}
              {!loading && data?.recentTickets?.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
                  <SoftIconCard icon={Ticket} variant="slate" />
                  <p className="mb-2 mt-3 text-lg font-medium text-base-content/75">
                    No tickets found
                  </p>
                  <p className="mt-1 max-w-md text-xs text-base-content/60">
                    You don’t have any support tickets yet. Create your first
                    ticket to get help from our support system or AI assistant.
                  </p>
                  <Link to="/customer/tickets/new">
                    <GradientButton className="mt-5" buttonClassName="px-8">
                      Create Ticket
                    </GradientButton>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr className="text-xs uppercase text-base-content/50">
                        <th className="p-4 font-semibold">Ticket</th>
                        <th className="p-4 font-semibold">Category</th>
                        <th className="p-4 font-semibold">Priority</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold">Updated</th>
                        <th className="p-4 font-semibold"></th>
                      </tr>
                    </thead>

                    {loading ? (
                      <tbody>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                            <td className="max-w-lg p-4">
                              <div className="space-y-2">
                                <div className="skeleton h-3 w-6/12"></div>
                                <div className="skeleton h-3 w-48"></div>
                              </div>
                            </td>
                            <td>
                              <div className="skeleton h-5 w-16"></div>
                            </td>
                            <td>
                              <div className="skeleton h-5 w-16"></div>
                            </td>
                            <td>
                              <div className="skeleton h-5 w-16"></div>
                            </td>
                            <td>
                              <div className="skeleton h-5 w-20"></div>
                            </td>
                            <td>
                              <div className="skeleton h-8 w-16"></div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    ) : (
                      <tbody>
                        {data?.recentTickets?.map((ticket) => {
                          const priorityState = ticket?.aiResult?.states?.find(
                            (item) => item.title?.toLowerCase() === "priority",
                          );

                          return (
                            <tr key={ticket._id}>
                              {/* Ticket */}
                              <td className="max-w-lg px-4 py-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-mono text-xs text-base-content/50">
                                      {ticket.ticketNumber}
                                    </p>
                                    {ticket.aiResolved && (
                                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                        AI
                                      </span>
                                    )}
                                  </div>

                                  <h3 className="font-medium">
                                    {ticket.aiResult?.ticketTitle ||
                                      "Untitled Ticket"}
                                  </h3>

                                  <p className="line-clamp-1 max-w-11/12 text-xs text-base-content/60">
                                    {ticket.aiResult?.summary}
                                  </p>
                                </div>
                              </td>

                              {/* Category */}
                              <td>
                                <TextBadge variant="cyan">
                                  {ticket.aiResult?.category || "General"}
                                </TextBadge>
                              </td>

                              {/* Priority */}
                              <td>
                                <TextBadge
                                  variant={priorityState?.variant || "slate"}
                                >
                                  {priorityState?.value || "Normal"}
                                </TextBadge>
                              </td>

                              {/* Status */}
                              <td>
                                <TextBadge
                                  variant={
                                    ticket.status === "open"
                                      ? "blue"
                                      : ticket.status === "assigned"
                                        ? "purple"
                                        : ticket.status === "in_progress"
                                          ? "yellow"
                                          : ticket.status === "resolved"
                                            ? "green"
                                            : "slate"
                                  }
                                >
                                  {ticket.status?.replace("_", " ")}
                                </TextBadge>
                              </td>

                              {/* Updated */}
                              <td>
                                <span className="text-xs text-base-content/60">
                                  {new Date(
                                    ticket.updatedAt,
                                  ).toLocaleDateString()}
                                </span>
                              </td>

                              {/* Action */}
                              <td>
                                <Link to={`/customer/tickets/${ticket._id}`}>
                                  <GradientButton
                                    size="sm"
                                    buttonClassName="from-primary/10 to-secondary/10 text-base-content"
                                  >
                                    View
                                  </GradientButton>
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    )}
                  </table>
                </div>
              )}
            </CardWithBlurBlob>
          </div>
        </div>

        {/* RIGHT COLUMN (AI CTA + Activity + Insights + Resources) */}
        <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-1/3 xl:flex-col">
          <div className="w-full space-y-3">
            {/* AI CTA */}
            {!loading && (
              <CardWithBlurBlob className="border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-3">
                  <SoftIconCard icon={Sparkles} variant="primary" size={16} />
                  <h3 className="text-sm font-semibold">AI Quick Solve</h3>
                </div>
                <p className="mt-4 text-xs italic leading-relaxed text-base-content/70">
                  &ldquo;Get an AI-generated draft before opening a ticket to
                  save time.&rdquo;
                </p>
                <Link to="/customer/ai-assistant">
                  <GradientButton
                    className="mt-5 w-full"
                    buttonClassName="btn-sm w-full rounded-xl"
                  >
                    Ask AI Assistant
                  </GradientButton>
                </Link>
              </CardWithBlurBlob>
            )}

            {/* Activity Feed (Clickable notifications) */}
            <CardWithBlurBlob className="p-5" interactive={false}>
              {notifyLoading || loading ? (
                <div>
                  <div className="skeleton mb-6 h-4 w-32"></div>

                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="skeleton h-8 w-8 shrink-0 rounded-xl"></div>
                        <div className="w-full min-w-0">
                          <div className="skeleton mb-2 h-3 w-2/3"></div>
                          <div className="skeleton mb-2 h-3 w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : notifyError ? (
                <div className="p-5 text-center">
                  <p className="text-sm text-error">
                    Failed to load notifications.
                  </p>

                  <button
                    type="button"
                    onClick={() => refetchNotifications()}
                    className="btn btn-sm btn-outline mt-3"
                  >
                    Retry
                  </button>
                </div>
              ) : notificationData.length === 0 ? (
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
                    Your latest ticket updates, agent replies, and status
                    changes will appear here once you start creating support
                    tickets.
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
                    {notificationData.map((act) => (
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

          <div className="w-full space-y-3">
            {/* Support Insights */}
            <CardWithBlurBlob className="p-5" interactive={false}>
              {loading ? (
                <div>
                  <div className="skeleton mb-6 h-4 w-32"></div>
                  <div className="mt-4 space-y-3">
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-full"></div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-semibold">Support Insights</h3>

                  <div className="mt-4 space-y-3">
                    <div className="flex gap-3">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0 text-success"
                      />

                      <p className="text-xs text-base-content/70">
                        {data?.insights?.resolutionRate ?? 0}% of your tickets
                        have been resolved or closed.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0 text-success"
                      />

                      <p className="text-xs text-base-content/70">
                        AI helped resolve {data?.insights?.aiResolved ?? 0}{" "}
                        support requests instantly.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 shrink-0 text-success"
                      />

                      <p className="text-xs text-base-content/70">
                        {(data?.metrics?.openTickets ?? 0) +
                          (data?.metrics?.pendingTickets ?? 0)}{" "}
                        active tickets are currently open or in progress.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardWithBlurBlob>

            {/* Popular Resources (Linked to AI Assistant & Ticket Creation) */}
            <CardWithBlurBlob className="p-5" interactive={false}>
              {loading ? (
                <div>
                  <div className="skeleton mb-6 h-4 w-32"></div>
                  <div className="mt-4 space-y-3">
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-full"></div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-semibold">Quick Actions</h3>
                  <div className="mt-4 space-y-2.5">
                    <Link
                      to="/customer/tickets/new"
                      className="block rounded-xl p-2 transition hover:bg-base-200/70"
                    >
                      <p className="text-xs font-medium text-base-content">
                        Submit a new support request
                      </p>
                      <p className="text-[10px] text-base-content/50">
                        Create Ticket
                      </p>
                    </Link>
                    <Link
                      to="/customer/ai-assistant"
                      className="block rounded-xl p-2 transition hover:bg-base-200/70"
                    >
                      <p className="text-xs font-medium text-base-content">
                        Troubleshoot instantly with AI
                      </p>
                      <p className="text-[10px] text-base-content/50">
                        AI Assistant
                      </p>
                    </Link>
                    <Link
                      to="/customer/tickets"
                      className="block rounded-xl p-2 transition hover:bg-base-200/70"
                    >
                      <p className="text-xs font-medium text-base-content">
                        Track open &amp; resolved tickets
                      </p>
                      <p className="text-[10px] text-base-content/50">
                        Ticket History
                      </p>
                    </Link>
                  </div>
                </div>
              )}
            </CardWithBlurBlob>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerDashboard;
