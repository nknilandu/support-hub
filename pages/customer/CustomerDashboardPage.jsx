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

// CHART DATA
const activityData = [
  { day: "Mon", tickets: 2 },
  { day: "Tue", tickets: 4 },
  { day: "Wed", tickets: 3 },
  { day: "Thu", tickets: 7 },
  { day: "Fri", tickets: 5 },
  { day: "Sat", tickets: 2 },
  { day: "Sun", tickets: 4 },
];

const statusData = [
  { name: "Open", value: 4 },
  { name: "Pending", value: 2 },
  { name: "Resolved", value: 8 },
];

const CustomerDashboardPage = () => {
  const stats = [
    { title: "Open tickets", value: "2", meta: "Awaiting reply", icon: Ticket, variant: "info" },
    { title: "Pending", value: "1", meta: "Need response", icon: Clock3, variant: "warning" },
    { title: "Resolved", value: "7", meta: "Last 30 days", icon: CheckCircle2, variant: "success" },
    { title: "AI-assisted", value: "5", meta: "Resolved faster", icon: Sparkles, variant: "primary" },
  ];

  const tickets = [
    { id: "TCK-4218", title: "Refund request for duplicate charge", status: "Open", priority: "High", updated: "3h ago" },
    { id: "TCK-4219", title: "Cannot connect Slack integration", status: "Pending", priority: "Medium", updated: "1d ago" },
    { id: "TCK-4220", title: "Invoice download fails on Safari", status: "Resolved", priority: "Low", updated: "4d ago" },
  ];

  const activities = [
    { text: "Agent replied to TCK-4218", time: "3h ago", variant: "info" },
    { text: "TCK-4220 marked resolved", time: "4d ago", variant: "success" },
    { text: "You created TCK-4219", time: "5d ago", variant: "primary" },
  ];

  return (
    <section className="relative min-h-full p-5 lg:p-7">
     

      {/* ========================= */}
      {/* STATS CARDS */}
      {/* ========================= */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <CardWithBlurBlob key={item.title} className="p-4" interactive={false}>
            <div className="flex items-start justify-between">
              <SoftIconCard icon={item.icon} size={15} variant={item.variant} className="h-9 w-9 rounded-xl" />
              <p className="text-[10px] text-base-content/50">{item.meta}</p>
            </div>
            <div className="mt-5">
              <h2 className="text-3xl font-semibold leading-none">{item.value}</h2>
              <p className="mt-2 text-xs text-base-content/60">{item.title}</p>
            </div>
          </CardWithBlurBlob>
        ))}
      </div>

      {/* ========================= */}
      {/* ANALYTICS CHARTS */}
      {/* ========================= */}
      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        {/* Activity Area Chart */}
        <CardWithBlurBlob className="p-5 xl:col-span-2" interactive={false}>
          <div className="mb-6">
            <h3 className="text-sm font-semibold">Ticket Activity</h3>
            <p className="text-[11px] text-base-content/50">Trends in the last 7 days</p>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <Tooltip 
                   contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "12px", fontSize: "10px" }}
                   itemStyle={{ color: "#f8fafc" }}
                />
                <Area type="monotone" dataKey="tickets" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorTickets)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardWithBlurBlob>

        {/* Status Bar Chart */}
        <CardWithBlurBlob className="p-5" interactive={false}>
          <div className="mb-6">
            <h3 className="text-sm font-semibold">Current Status</h3>
            <p className="text-[11px] text-base-content/50">Real-time ticket distribution</p>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <Tooltip 
                   cursor={{fill: 'transparent'}}
                   contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "12px", fontSize: "10px" }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardWithBlurBlob>
      </div>

      {/* ========================= */}
      {/* TICKETS & ACTIVITY SECTION */}
      {/* ========================= */}
      <div className="mt-5 grid gap-5 xl:grid-cols-12">
        {/* Recent Tickets Table */}
        <div className="xl:col-span-8">
          <CardWithBlurBlob className="p-0 overflow-hidden" interactive={false}>
            <div className="flex items-center justify-between border-b border-base-content/5 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">Recent tickets</h2>
                <p className="text-[11px] text-base-content/50 uppercase tracking-wider">Latest updates</p>
              </div>
              <button className="flex items-center gap-2 text-xs font-medium text-primary hover:gap-3 transition-all">
                View all <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="text-[10px] text-base-content/40 uppercase">
                    <th>Ticket</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-base-200/50 transition-colors">
                      <td className="py-4">
                        <span className="text-[10px] text-base-content/40 block mb-0.5">{t.id}</span>
                        <span className="text-xs font-medium">{t.title}</span>
                      </td>
                      <td>
                        <TextBadge size="sm" variant={t.status === "Open" ? "blue" : t.status === "Pending" ? "orange" : "green"}>
                          {t.status}
                        </TextBadge>
                      </td>
                      <td>
                        <TextBadge size="sm" variant={t.priority === "High" ? "red" : t.priority === "Medium" ? "orange" : "slate"}>
                          {t.priority}
                        </TextBadge>
                      </td>
                      <td className="text-xs text-base-content/50">{t.updated}</td>
                      <td>
                        <button className="btn btn-xs rounded-lg px-3">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardWithBlurBlob>
        </div>

        {/* Activity Sidebar */}
        <div className="xl:col-span-4 space-y-5">
          {/* AI CTA */}
          <CardWithBlurBlob className="p-5 border-primary/20 bg-primary/5">
            <div className="flex items-center gap-3">
              <SoftIconCard icon={Sparkles} variant="primary" size={16} />
              <h3 className="text-sm font-semibold">AI Quick Solve</h3>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-base-content/70 italic">
              "Get an AI-generated draft before opening a ticket to save time."
            </p>
            <GradientButton className="mt-5 w-full" buttonClassName="btn-sm w-full rounded-xl">
              Ask AI Assistant
            </GradientButton>
          </CardWithBlurBlob>

          {/* Activity Feed */}
          <CardWithBlurBlob className="p-5" interactive={false}>
             <h3 className="text-sm font-semibold mb-5">Recent Activity</h3>
             <div className="space-y-4">
                {activities.map((act, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <SoftIconCard icon={MessageSquareText} size={14} variant={act.variant} className="h-8 w-8 rounded-xl shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{act.text}</p>
                      <p className="text-[10px] text-base-content/40 mt-1">{act.time}</p>
                    </div>
                  </div>
                ))}
             </div>
          </CardWithBlurBlob>
        </div>
      </div>
    </section>
  );
};

export default CustomerDashboardPage;