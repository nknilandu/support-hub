import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Flame,
  Inbox,
  MessageSquareText,
  ShieldAlert,
  Sparkles,
  Ticket,
  TicketCheck,
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

import { AuthContext } from "../../app/providers/AuthProvider";
import CardWithBlurBlob from "../../components/ui/Card/CardWithBlurBlob";
import GradientButton from "../../components/ui/Button/GradientButton";
import SoftIconCard from "../../components/ui/Card/SoftIconCard";
import TextBadge from "../../components/ui/Badge/TextBadge";

// =============================
// =============================
const loading = false;
const notifyLoading = false;
const data = {
  success: true,

  metrics: {
    assignedToMe: 8,
    openCompanyTickets: 24,
    inProgressTickets: 6,
    highPriorityTickets: 5,
    waitingCustomerTickets: 4,
    resolvedToday: 12,
  },

  statusChart: {
    open: 10,
    assigned: 8,
    in_progress: 6,
    waiting_customer: 4,
    resolved: 12,
    closed: 3,
  },

  priorityChart: {
    low: 9,
    medium: 15,
    high: 7,
    critical: 3,
  },

  recentTickets: [
    {
      _id: "1",
      ticketNumber: "TKT-1042",
      customerName: "Sarah Chen",
      companyName: "Acme Co",
      priority: "High",
      status: "in_progress",
      aiResult: {
        ticketTitle: "Unable to login after password reset",
        summary:
          "Customer cannot access account after resetting password. Possible auth cache or token issue.",
      },
    },
    {
      _id: "2",
      ticketNumber: "TKT-1041",
      customerName: "David Miller",
      companyName: "Bright Labs",
      priority: "Critical",
      status: "open",
      aiResult: {
        ticketTitle: "Payment failed but card was charged",
        summary:
          "Duplicate payment risk. Gateway charged customer but subscription status did not update.",
      },
    },
    {
      _id: "3",
      ticketNumber: "TKT-1040",
      customerName: "Nadia Islam",
      companyName: "Northstar Ltd",
      priority: "Medium",
      status: "waiting_customer",
      aiResult: {
        ticketTitle: "Account verification email never arrived",
        summary:
          "Customer did not receive verification email. Needs SMTP or spam-folder check.",
      },
    },
    {
      _id: "4",
      ticketNumber: "TKT-1039",
      customerName: "Omar Rahman",
      companyName: "Vertex Corp",
      priority: "High",
      status: "assigned",
      aiResult: {
        ticketTitle: "Dashboard loads extremely slowly",
        summary:
          "Customer reports 30+ second dashboard loading time after recent data import.",
      },
    },
    {
      _id: "5",
      ticketNumber: "TKT-1038",
      customerName: "Emily Johnson",
      companyName: "PixelDesk",
      priority: "Medium",
      status: "in_progress",
      aiResult: {
        ticketTitle: "Bug: export CSV returns empty file",
        summary:
          "CSV export completes but generated file has no rows despite visible table data.",
      },
    },
  ],

  urgentTickets: [
    {
      _id: "2",
      ticketNumber: "TKT-1041",
      customerName: "David Miller",
      companyName: "Bright Labs",
      priority: "Critical",
      subject: "Payment failed but card was charged",
      aiResult: {
        ticketTitle: "Payment failed but card was charged",
      },
    },
    {
      _id: "1",
      ticketNumber: "TKT-1042",
      customerName: "Sarah Chen",
      companyName: "Acme Co",
      priority: "High",
      subject: "Unable to login after password reset",
      aiResult: {
        ticketTitle: "Unable to login after password reset",
      },
    },
    {
      _id: "4",
      ticketNumber: "TKT-1039",
      customerName: "Omar Rahman",
      companyName: "Vertex Corp",
      priority: "High",
      subject: "Dashboard loads extremely slowly",
      aiResult: {
        ticketTitle: "Dashboard loads extremely slowly",
      },
    },
  ],

  aiInsights: [
    {
      _id: "2",
      ticketNumber: "TKT-1041",
      riskLabel: "High Risk",
      insight:
        "Duplicate charge with failed subscription status. Payment gateway webhook confirmation may be lost.",
    },
    {
      _id: "4",
      ticketNumber: "TKT-1039",
      riskLabel: "High Risk",
      insight:
        "Performance issue affects business dashboard. Customer may churn if response is delayed.",
    },
    {
      _id: "1",
      ticketNumber: "TKT-1042",
      riskLabel: "Medium Risk",
      insight:
        "Login issue after password reset may affect multiple customers if auth token cache is failing.",
    },
  ],
};

const notificationData = [
  {
    type: "agent_reply",
    title: "Replied to Sarah Chen",
    message: "Password reset troubleshooting steps sent • 9:40 AM",
  },
  {
    type: "ticket_assigned",
    title: "Added internal note",
    message: "Auth cache issue suspected in TKT-1042 • 8:45 AM",
  },
  {
    type: "ticket_assigned",
    title: "Claimed ticket from Vertex Corp",
    message: "Dashboard loading issue assigned to you • 8:20 AM",
  },
  {
    type: "ticket_resolved",
    title: "Resolved invoice request",
    message: "Missing invoice ticket closed successfully • Yesterday",
  },
];
// =============================
// =============================
const statusColors = {
  open: "#3b82f6",
  assigned: "#6366f1",
  in_progress: "#f59e0b",
  waiting_customer: "#a855f7",
  resolved: "#22c55e",
  closed: "#64748b",
};

const priorityColors = {
  low: "#94a3b8",
  medium: "#3b82f6",
  high: "#f97316",
  critical: "#ef4444",
};

const getStatusVariant = (status) => {
  switch (status) {
    case "open":
      return "cyan";
    case "assigned":
      return "purple";
    case "in_progress":
      return "orange";
    case "waiting_customer":
      return "pink";
    case "resolved":
      return "green";
    case "closed":
      return "gray";
    default:
      return "gray";
  }
};

const getPriorityVariant = (priority) => {
  const value = priority?.toLowerCase();

  switch (value) {
    case "low":
      return "slate";
    case "medium":
      return "cyan";
    case "high":
      return "orange";
    case "critical":
      return "red";
    default:
      return "gray";
  }
};

const formatStatus = (status) => {
  if (!status) return "Unknown";
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const AgentDashboard = () => {
  const { user } = useContext(AuthContext);

  // const { data, isLoading: loading } = useQuery({
  //   queryKey: ["agentDashboard"],
  //   enabled: !!user?.accessToken,
  //   queryFn: async () => {
  //     const res = await fetch(
  //       "http://localhost:3021/dashboard/agent-overview",
  //       {
  //         headers: {
  //           authorization: `Bearer ${user.accessToken}`,
  //         },
  //       },
  //     );

  //     const result = await res.json();

  //     if (!res.ok || result.success === false) {
  //       throw new Error(result.message || "Failed to fetch agent dashboard");
  //     }

  //     return result;
  //   },
  // });

  // const { data: notificationData = [], isLoading: notifyLoading } = useQuery({
  //   queryKey: ["agentDashboardNotification"],
  //   enabled: !!user?.accessToken,
  //   queryFn: async () => {
  //     const res = await fetch("http://localhost:3021/notifications?limit=4", {
  //       headers: {
  //         authorization: `Bearer ${user.accessToken}`,
  //       },
  //     });

  //     const result = await res.json();

  //     if (!res.ok || !result.success) {
  //       throw new Error(result.message || "Failed to fetch notifications");
  //     }

  //     return result.notifications || [];
  //   },
  // });

  const stats = [
    {
      title: "Assigned to Me",
      value: data?.metrics?.assignedToMe || 0,
      meta: "+2 today",
      icon: UserCheck,
      variant: "info",
    },
    // {
    //   title: "Open Company Tickets",
    //   value: data?.metrics?.openCompanyTickets || 0,
    //   meta: "+5 this week",
    //   icon: Inbox,
    //   variant: "cyan",
    // },
    {
      title: "In Progress",
      value: data?.metrics?.inProgressTickets || 0,
      meta: "Active work",
      icon: Clock3,
      variant: "warning",
    },
    // {
    //   title: "High Priority",
    //   value: data?.metrics?.highPriorityTickets || 0,
    //   meta: "Needs action",
    //   icon: Flame,
    //   variant: "orange",
    // },
    {
      title: "Waiting Customer",
      value: data?.metrics?.waitingCustomerTickets || 0,
      meta: "Awaiting reply",
      icon: MessageSquareText,
      variant: "purple",
    },
    {
      title: "Resolved Today",
      value: data?.metrics?.resolvedToday || 0,
      meta: "+3 vs yesterday",
      icon: TicketCheck,
      variant: "success",
    },
  ];

  const statusData = [
    {
      name: "Open",
      key: "open",
      value: data?.statusChart?.open || 0,
    },
    {
      name: "Assigned",
      key: "assigned",
      value: data?.statusChart?.assigned || 0,
    },
    {
      name: "In Progress",
      key: "in_progress",
      value: data?.statusChart?.in_progress || 0,
    },
    {
      name: "Waiting Customer",
      key: "waiting_customer",
      value: data?.statusChart?.waiting_customer || 0,
    },
    {
      name: "Resolved",
      key: "resolved",
      value: data?.statusChart?.resolved || 0,
    },
    {
      name: "Closed",
      key: "closed",
      value: data?.statusChart?.closed || 0,
    },
  ];

  const priorityData = [
    {
      name: "Low",
      key: "low",
      value: data?.priorityChart?.low || 0,
    },
    {
      name: "Medium",
      key: "medium",
      value: data?.priorityChart?.medium || 0,
    },
    {
      name: "High",
      key: "high",
      value: data?.priorityChart?.high || 0,
    },
    {
      name: "Critical",
      key: "critical",
      value: data?.priorityChart?.critical || 0,
    },
  ];

  const urgentTickets =  [];

  return (
    <section className="relative min-h-full p-4 lg:p-5">
      {/* ========================= */}
      {/* TOP STATS - 6 CARDS */}
      {/* ========================= */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <CardWithBlurBlob key={i} interactive={false} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="skeleton h-10 w-10 rounded-xl"></div>
                  <div className="skeleton h-4 w-10"></div>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="skeleton h-8 w-24"></div>
                  <div className="skeleton h-4 w-10"></div>
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
            {/* Ticket Status Donut chart */}
            <CardWithBlurBlob
              className="w-full p-5 xl:w-1/2"
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
                  <div className="mb-2">
                    <h3 className="text-sm font-semibold">Ticket Status</h3>
                    <p className="text-[11px] text-base-content/50">
                      Distribution across 6 ticket states
                    </p>
                  </div>

                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "10px",
                          }}
                          itemStyle={{ color: "#f8fafc" }}
                        />

                        <Legend
                          verticalAlign="bottom"
                          align="center"
                          iconType="circle"
                          wrapperStyle={{
                            fontSize: "12px",
                            paddingTop: "20px",
                          }}
                          formatter={(value, entry) => {
                            return `${value} (${entry.payload.value})`;
                          }}
                        />

                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={50}
                          outerRadius={88}
                          paddingAngle={1}
                        >
                          {statusData.map((entry) => (
                            <Cell
                              key={entry.key}
                              fill={statusColors[entry.key]}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </CardWithBlurBlob>

            {/* Priority Breakdown bar chart */}
            <CardWithBlurBlob
              className="w-full p-5 xl:w-1/2"
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
                    <h3 className="text-sm font-semibold">
                      Priority Breakdown
                    </h3>
                    <p className="text-[11px] text-base-content/50">
                      Tickets by severity
                    </p>
                  </div>

                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={priorityData} margin={{
                          top: 5,
                          left: -30,
                        }}>
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

                        <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={70}>
                          {priorityData.map((entry) => (
                            <Cell
                              key={entry.key}
                              fill={priorityColors[entry.key]}
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
          {/* ============= table ================= */}
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

              {/* table */}
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
                  <Link to="/customer/tickets/new">
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

        <div className="w-full xl:w-1/3  flex flex-col sm:flex-row xl:flex-col gap-3">
          <div className="space-y-3 w-full">
            {/* Urgent Tickets */}
            <CardWithBlurBlob className="p-5" interactive={false}>
              {loading ? (
                <div>
                  <div className="skeleton h-4 w-28"></div>
                  <div className="mt-2 skeleton h-3 w-36"></div>
                  <div className="mt-6 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="skeleton h-20 w-full"></div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
            
                  

                    <div className="mb-5">
                      <h3 className="text-sm font-semibold">Urgent Tickets</h3>
                      <p className="text-[11px] text-base-content/50">
                        Needs attention now
                      </p>
                    </div>
             

                  {urgentTickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-5 py-8 text-center">
                  <SoftIconCard
                    icon={Flame}
                    className="mb-2"
                    variant="slate"
                  ></SoftIconCard>

                  <h3 className="text-base-content/60">
                   No urgent tickets right now.
                  </h3>

                  <p className="mt-2 max-w-sm text-xs text-base-content/60">
                    You're all caught up. None of your active support tickets currently require
  urgent action or immediate follow-up.

                  </p>
                </div>
                  ) : (
                    <div className="space-y-3">
                      {urgentTickets.slice(0, 4).map((ticket) => (
                        <Link
                          key={ticket._id}
                          to={`/agent/tickets/${ticket._id}`}
                          className="block rounded-2xl border border-base-content/10 p-4 transition hover:border-primary/30 hover:bg-primary/5"
                        >
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <p className="text-[11px] font-medium text-base-content/50">
                              {ticket.ticketNumber}
                            </p>

                            <TextBadge
                              variant={getPriorityVariant(
                                ticket.priority || "High",
                              )}
                            >
                              {ticket.priority || "High"}
                            </TextBadge>
                          </div>

                          <h4 className="text-sm font-semibold line-clamp-1">
                            {ticket.aiResult?.ticketTitle ||
                              ticket.subject ||
                              "Urgent ticket"}
                          </h4>

                          <p className="mt-1 text-xs text-base-content/50 line-clamp-1">
                            {ticket.companyName ||
                              ticket.customerName ||
                              "Company"}
                          </p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardWithBlurBlob>

             {/* Recent Activity */}
        <CardWithBlurBlob className="p-5 xl:col-span-2" interactive={false}>
          {notifyLoading || loading ? (
            <div>
              <div className="skeleton h-4 w-32"></div>

              <div className="mt-6 space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="skeleton h-8 w-8 rounded-xl"></div>
                    <div className="w-full space-y-2">
                      <div className="skeleton h-3 w-1/2"></div>
                      <div className="skeleton h-3 w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-semibold">Recent Activity</h3>
              <p className="text-[11px] text-base-content/50">
                Your latest actions
              </p>

              {notificationData.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-5 py-8 text-center">
                                  <SoftIconCard
                                    icon={MessageSquareText}
                                    className="mb-2"
                                    variant="slate"
                                  ></SoftIconCard>
                
                                  <h3 className="text-base-content/60">
                                    No Recent Activity Yet
                                  </h3>
                
                                <p className="mt-2 max-w-sm text-xs text-base-content/50">
                    Ticket claims, replies, notes, and status changes will
                    appear here.
                  </p>
                                </div>

              
              ) : (
                <div className="mt-5 space-y-4">
                  {notificationData.map((act, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <SoftIconCard
                        icon={MessageSquareText}
                        size={14}
                        variant={
                          act.type === "ticket_resolved"
                            ? "green"
                            : act.type === "agent_reply"
                              ? "purple"
                              : act.type === "ticket_assigned"
                                ? "cyan"
                                : "slate"
                        }
                        className="h-8 w-8 shrink-0 rounded-xl"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium">
                          {act.title}
                        </p>

                        <p className="mt-1 text-[10px] text-base-content/40">
                          {act.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardWithBlurBlob>

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
      <h3 className="text-sm font-semibold">Agent Work Insights</h3>

      <div className="mt-4 space-y-3">
        <div className="flex gap-3">
          <CheckCircle2 size={16} className="text-success mt-0.5" />

          <p className="text-xs text-base-content/70">
            You currently have{" "}
            <span className="font-semibold text-base-content">
              {data?.metrics?.assignedToMe || 0}
            </span>{" "}
            tickets assigned to you.
          </p>
        </div>

        <div className="flex gap-3">
          <CheckCircle2 size={16} className="text-success mt-0.5" />

          <p className="text-xs text-base-content/70">
            You are actively working on{" "}
            <span className="font-semibold text-base-content">
              {data?.metrics?.inProgressTickets || 0}
            </span>{" "}
            in-progress tickets.
          </p>
        </div>

        <div className="flex gap-3">
          <CheckCircle2 size={16} className="text-success mt-0.5" />

          <p className="text-xs text-base-content/70">
            You resolved{" "}
            <span className="font-semibold text-base-content">
              {data?.metrics?.resolvedToday || 0}
            </span>{" "}
            tickets today.
          </p>
        </div>
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

export default AgentDashboard;
