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
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import CardWithBlurBlob from "../../components/ui/Card/CardWithBlurBlob";
import GradientButton from "../../components/ui/Button/GradientButton";
import SoftIconCard from "../../components/ui/Card/SoftIconCard";
import TextBadge from "../../components/ui/Badge/TextBadge";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { AuthContext } from "../../app/providers/AuthProvider";
import { Link } from "react-router";

const CustomerDashboardPage = () => {
  const { user } = useContext(AuthContext);

  // =========================
  const { data, isLoading: loading } = useQuery({
    queryKey: ["customerDashboard"],
    enabled: !!user?.accessToken,
    queryFn: async () => {
      const res = await fetch(
        "http://localhost:3021/dashboard/customer-overview",
        {
          headers: {
            authorization: `Bearer ${user.accessToken}`,
          },
        },
      );

      return res.json();
    },
  });

  // ============ fatching notification =============
  const { data: notificationData, isLoading: notifyLoading } = useQuery({
    queryKey: ["customerDashboardNotification"],
    enabled: !!user?.accessToken,
    queryFn: async () => {
      const res = await fetch("http://localhost:3021/notifications?limit=3", {
        headers: {
          authorization: `Bearer ${user.accessToken}`,
        },
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch tickets");
      }
      return result.notifications;
    },
  });

  // STATS DATA
  const stats = [
    {
      title: "Open tickets",
      value: data?.metrics?.openTickets,
      meta: "Awaiting reply",
      icon: Ticket,
      variant: "info",
    },
    {
      title: "Pending tickets",
      value: data?.metrics?.pendingTickets,
      meta: "Need response",
      icon: Clock3,
      variant: "warning",
    },
    {
      title: "Total tickets",
      value: data?.metrics?.totalTickets,
      meta: "Last 30 days",
      icon: MessageSquareText,
      variant: "success",
    },
    {
      title: "AI-assisted",
      value: data?.metrics?.aiResolved,
      meta: "Resolved faster",
      icon: Sparkles,
      variant: "primary",
    },
  ];

  // Current Status
  const statusData = [
    { name: "Open", value: data?.statusChart?.open },
    { name: "Pending", value: data?.statusChart?.pending },
    { name: "Resolved", value: data?.statusChart?.resolved },
  ];

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
                  <div className="skeleton h-4 w-10 "></div>
                </div>
                <div className="mt-5 space-y-2">
                  <div className="skeleton h-8 w-24 "></div>
                  <div className="skeleton h-4 w-10 "></div>
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

      <div className="mt-3 flex flex-col xl:flex-row gap-3 w-full justify-center items-start">
        {/* ====== */}
        <div className="w-full xl:w-2/3 flex flex-col gap-3 justify-center items-center">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {/* Activity Area Chart */}
            <CardWithBlurBlob
              className="w-full xl:w-2/3 p-5 xl:col-span-2"
              interactive={false}
            >
              {loading ? (
                <div>
                  <div className="mb-6 space-y-2">
                    <div className="skeleton h-4 w-24 "></div>
                    <div className="skeleton h-4 w-36 "></div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="skeleton h-4 w-full "></div>
                    <div className="skeleton h-4 w-full "></div>
                    <div className="skeleton h-4 w-1/2 mb-7"></div>
                    <div className="skeleton h-4 w-full "></div>
                    <div className="skeleton h-4 w-full "></div>
                    <div className="skeleton h-4 w-1/2 "></div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold">Ticket Activity</h3>
                    <p className="text-[11px] text-base-content/50">
                      Trends in the last 7 days
                    </p>
                  </div>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data?.activityChart}>
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
                          stroke="rgba(255,255,255,0.05)"
                        />
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 10 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "10px",
                          }}
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
              className="w-full p-5 xl:w-1/3"
              interactive={false}
            >
              {loading ? (
                <div>
                  <div className="mb-6 space-y-2">
                    <div className="skeleton h-4 w-24 "></div>
                    <div className="skeleton h-4 w-36 "></div>
                  </div>
                  <div className="space-y-2.5">
                    <div className="skeleton h-4 w-full "></div>
                    <div className="skeleton h-4 w-full "></div>
                    <div className="skeleton h-4 w-1/2 mb-7"></div>
                    <div className="skeleton h-4 w-full "></div>
                    <div className="skeleton h-4 w-full "></div>
                    <div className="skeleton h-4 w-1/2 "></div>
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
                      <BarChart data={statusData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="rgba(255,255,255,0.05)"
                        />
                        <XAxis
                          dataKey="name"
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
                            fontSize: "10px",
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill="#8b5cf6"
                          radius={[6, 6, 0, 0]}
                          barSize={35}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </CardWithBlurBlob>
          </div>

          {/* Recent Tickets Table */}
          <div className="w-full">
            {/* ======================= */}
            <CardWithBlurBlob
              className="overflow-hidden p-0"
              interactive={false}
            >
              {/* header */}
              {loading ? (
                <div className="flex items-center justify-between border-b border-base-content/5 px-5 py-3">
                  <div>
                    <div className="skeleton h-3 my-2 w-20"></div>
                    <div className="skeleton h-3 my-2 w-30"></div>
                  </div>
                  <div className="skeleton h-5 my-2 w-20"></div>
                </div>
              ) : (
                <div className="flex items-center justify-between border-b border-base-content/5 px-5 py-4">
                  <div>
                    <h2 className="text-sm font-semibold">Recent tickets</h2>
                    <p className="text-[11px] text-base-content/50 uppercase tracking-wider">
                      Latest updates
                    </p>
                  </div>
                  <Link
                    to="/customer/tickets"
                    className="flex items-center gap-2 text-xs font-medium text-base-content/50 hover:gap-3 hover:text-primary transition-all"
                  >
                    View all <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    {loading ? (
                      <tr>
                        <th>
                          <div className="skeleton h-5 my-2 ml-1 w-20"></div>
                        </th>
                        <th>
                          <div className="skeleton h-5 my-2 w-20"></div>
                        </th>
                        <th>
                          <div className="skeleton h-5 my-2 w-20"></div>
                        </th>
                        <th>
                          <div className="skeleton h-5 my-2 w-20"></div>
                        </th>
                        <th>
                          <div className="skeleton h-5 my-2 w-20"></div>
                        </th>
                      </tr>
                    ) : (
                      <tr className="text-sm uppercase text-base-content/50">
                        <th className="p-5 font-semibold">Ticket</th>
                        <th className="p-5 font-semibold">Category</th>
                        <th className="p-5 font-semibold">Priority</th>
                        <th className="p-5 font-semibold">Status</th>
                        <th className="p-5 font-semibold">Updated</th>
                        <th className="p-5 font-semibold"></th>
                      </tr>
                    )}
                  </thead>

                  {loading ? (
                    <tbody>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          {/* Ticket */}
                          <td className="max-w-lg p-5">
                            <div className="space-y-2">
                              <div className="skeleton h-4 w-3/12"></div>
                              <div className="skeleton h-4 w-6/12"></div>
                              <div className="skeleton h-4 w-sm"></div>
                            </div>
                          </td>
                          {/* Category */}
                          <td>
                            <div className="skeleton h-5 w-7/12"></div>
                          </td>
                          {/* Priority */}
                          <td>
                            <div className="skeleton h-5 w-7/12"></div>
                          </td>
                          {/* Status */}
                          <td>
                            <div className="skeleton h-5 w-7/12"></div>
                          </td>
                          {/* Updated */}
                          <td>
                            <div className="skeleton h-5 w-7/12"></div>
                          </td>
                          {/* Action */}
                          <td>
                            <div className="skeleton h-8 w-16"></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  ) : data?.recentTickets?.length === 0 ? (
                    <tbody>
                      <tr>
                        <td>
                          <div className="w-106"></div>
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                    <tbody>
                      {data?.recentTickets?.map((ticket) => (
                        <tr key={ticket._id}>
                          {/* Ticket */}
                          <td className="max-w-lg p-5">
                            <div>
                              <p className="text-xs text-base-content/50">
                                {ticket.ticketNumber}
                              </p>

                              <h3 className="font-medium">
                                {ticket.aiResult.ticketTitle}
                              </h3>

                              <p className="max-w-11/12 text-sm text-base-content/60 line-clamp-1">
                                {ticket.aiResult.summary}
                              </p>
                            </div>
                          </td>

                          {/* Category */}
                          <td>
                            <TextBadge variant="cyan">
                              {ticket.aiResult.category}
                            </TextBadge>
                          </td>

                          {/* Priority */}
                          <td>
                            <TextBadge
                              variant={
                                ticket?.aiResult?.states?.find(
                                  (item) =>
                                    item.title?.toLowerCase() === "priority",
                                )?.variant
                              }
                            >
                              {
                                ticket?.aiResult?.states?.find(
                                  (item) =>
                                    item.title?.toLowerCase() === "priority",
                                )?.value
                              }
                            </TextBadge>
                          </td>

                          {/* Status */}
                          <td>
                            <TextBadge
                              variant={
                                ticket.status === "open"
                                  ? "cyan"
                                  : ticket.status === "in_progress"
                                    ? "orange"
                                    : ticket.status === "resolved"
                                      ? "green"
                                      : "gray"
                              }
                            >
                              {ticket.status.replace("_", " ")}
                            </TextBadge>
                          </td>

                          {/* Updated */}
                          <td>
                            <span className="text-sm text-base-content/60">
                              {new Date(ticket.updatedAt).toLocaleDateString()}
                            </span>
                          </td>

                          {/* Action */}
                          <td>
                            <GradientButton
                              // onClick = data?._id
                              buttonClassName="
              from-primary/10
              to-secondary/10
              text-base-content
            "
                            >
                              View
                            </GradientButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  )}
                </table>
              </div>

              {/* ================== */}
              {!loading && data?.recentTickets?.length === 0 && (
                <div className="py-14 px-5 text-center flex flex-col justify-center items-center">
                  <SoftIconCard icon={Ticket} variant="slate"></SoftIconCard>
                  <p className="mt-3 text-xl text-base-content/60 mb-3">
                    No tickets found
                  </p>
                  <p className="text-sm text-base-content/60 mt-1 max-w-md">
                    You don’t have any support tickets yet. Create your first
                    ticket to get help from our support system or AI assistant.
                  </p>
                  <Link to="new">
                    <GradientButton className="mt-5" buttonClassName="px-8">
                      Create Ticket
                    </GradientButton>
                  </Link>
                </div>
              )}
            </CardWithBlurBlob>

            {/* ======================= */}
          </div>
        </div>
        {/* ====== */}
        <div className="w-full xl:w-1/3  flex flex-col sm:flex-row xl:flex-col gap-3">
          <div className="space-y-3 w-full">
            {/* AI CTA */}
            {!loading && (
              <CardWithBlurBlob className="p-5 border-primary/20 bg-primary/5">
                <div className="flex items-center gap-3">
                  <SoftIconCard icon={Sparkles} variant="primary" size={16} />
                  <h3 className="text-sm font-semibold">AI Quick Solve</h3>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-base-content/70 italic">
                  "Get an AI-generated draft before opening a ticket to save
                  time."
                </p>
                <Link to="/">
                <GradientButton
                  className="mt-5 w-full"
                  buttonClassName="btn-sm w-full rounded-xl"
                >
                  Ask AI Assistant
                </GradientButton>
                </Link>
              </CardWithBlurBlob>
            )}

            {/* Activity Feed */}
            <CardWithBlurBlob className="p-5" interactive={false}>
              {notifyLoading ? (
                <div>
                  <div className="skeleton h-4 w-30 mb-6"></div>

                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <div className="shrink-0 skeleton h-8 w-8 rounded-xl"></div>
                        <div className="w-full min-w-0">
                          <div className="skeleton h-3 w-2/3 mb-2"></div>
                          <div className="skeleton h-3 w-1/3 mb-2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : notificationData.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-5 py-8 text-center">
                  <SoftIconCard
                    icon={MessageSquareText}
                    className="mb-2"
                    variant="slate"
                  ></SoftIconCard>

                  <h3 className="text-base-content/60">
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
                  <h3 className="text-sm font-semibold mb-5">
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {notificationData.map((act, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <SoftIconCard
                          icon={MessageSquareText}
                          size={14}
                          variant={
                            act.type === "ticket_created"
                              ? "cyan"
                              : act.type === "ticket_resolved"
                                ? "green"
                                : act.type === "agent_reply"
                                  ? "purple"
                                  : "slate"
                          }
                          className="h-8 w-8 rounded-xl shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">
                            {act.ticketNumber}
                          </p>
                          <p className="text-[10px] text-base-content/40 mt-1">
                            {act.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardWithBlurBlob>
          </div>

          <div className="space-y-3 w-full">
            {/* Support Insights */}
            <CardWithBlurBlob className="p-5" interactive={false}>
              {loading ? (
                <div>
                  <div className="skeleton h-4 w-30 mb-6"></div>
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
                      <CheckCircle2 size={16} className="text-success mt-0.5" />

                      <p className="text-xs text-base-content/70">
                        {data?.insights?.resolutionRate || 0}% of your tickets
                        were resolved within 24 hours.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <CheckCircle2 size={16} className="text-success mt-0.5" />

                      <p className="text-xs text-base-content/70">
                        Average response time improved by 22% this month.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <CheckCircle2 size={16} className="text-success mt-0.5" />

                      <p className="text-xs text-base-content/70">
                        AI helped resolve {data?.insights?.aiResolved || 0}{" "}
                        support requests.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardWithBlurBlob>

            {/* Popular Resources */}
            <CardWithBlurBlob className="p-5" interactive={false}>
              {loading ? (
                <div>
                  <div className="skeleton h-4 w-30 mb-6"></div>
                  <div className="mt-4 space-y-3">
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-full"></div>
                    <div className="skeleton h-4 w-full"></div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-semibold">Popular Resources</h3>
                  <div className="mt-4 space-y-3">
                    <button className="w-full text-left">
                      <p className="text-xs font-medium">How refunds work</p>
                      <p className="text-[10px] text-base-content/50">
                        Billing
                      </p>
                    </button>
                    <button className="w-full text-left">
                      <p className="text-xs font-medium">
                        Slack integration setup
                      </p>
                      <p className="text-[10px] text-base-content/50">
                        Integration
                      </p>
                    </button>
                    <button className="w-full text-left">
                      <p className="text-xs font-medium">
                        Account recovery guide
                      </p>
                      <p className="text-[10px] text-base-content/50">
                        Account
                      </p>
                    </button>
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

export default CustomerDashboardPage;
