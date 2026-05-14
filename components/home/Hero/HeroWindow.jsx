import { Bell, Search } from "lucide-react";
import GradientShadow from "../../../components/ui/Shadow/GradientShadowWrapper";
import GradientButton from "../../../components/ui/Button/GradientButton";

const HeroWindow = () => {
  const tickets = [
    {
      id: "#4821",
      title: "Refund not received after 5 days",
      name: "Sarah K.",
      time: "2m",
      priority: "High",
      active: true,
    },
    {
      id: "#4820",
      title: "Cannot connect Slack integration",
      name: "Marco B.",
      time: "14m",
      priority: "Med",
    },
    {
      id: "#4819",
      title: "Upgrade plan to Pro tier",
      name: "Lina O.",
      time: "1h",
      priority: "Low",
    },
    {
      id: "#4818",
      title: "Invoice download fails on Safari",
      name: "Jin P.",
      time: "3h",
      priority: "High",
    },
  ];

  const floatingCards = [
    {
      title: "AVG. RESOLUTION",
      value: "3h 12m",
      meta: "↓ 38% with AI",
      icon: "↗",
      position: "left-2 bottom-18",
      iconClass: "bg-primary/10 text-primary",
      metaClass: "text-success",
    },
    //   {
    //     title: "CSAT THIS WEEK",
    //     value: "4.8 / 5",
    //     meta: "+0.3 vs last",
    //     icon: "☺",
    //     position: "right-3 top-10",
    //     iconClass: "bg-success/10 text-success",
    //     metaClass: "text-success",
    //   },
    {
      title: "RESOLVED RATE",
      value: "92%",
      meta: "weekly",
      icon: "☆",
      position: "left-0 top-20",
      iconClass: "bg-warning/10 text-warning",
      metaClass: "text-base-content/50",
    },
    {
      title: "AI DEFLECTED",
      value: "38 tickets",
      meta: "last 24h",
      icon: "✦",
      position: "right-0 top-39",
      iconClass: "bg-info/10 text-info",
      metaClass: "text-base-content/50",
    },
  ];

  return (
    <div className="relative w-full max-w-xl  min-h-[380px] mx-auto p-6">
      {/* Floating cards */}
      {floatingCards.map((card) => (
        <div
          key={card.title}
          className={`absolute ${card.position} z-20 hidden rounded-2xl bg-base-100/20 p-3 shadow-xl backdrop-blur md:block`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`grid h-8 w-8 place-items-center rounded-full ${card.iconClass}`}
            >
              {card.icon}
            </div>

            <div>
              <p className="text-[8px] font-semibold text-base-content/50">
                {card.title}
              </p>

              <p className="text-[12px] font-bold leading-none">{card.value}</p>

              <p className={`text-[11px] ${card.metaClass}`}>{card.meta}</p>
            </div>
          </div>
        </div>
      ))}


      {/* windows */}
      <GradientShadow glowClassName="opacity-30 blur-md" radius="rounded-3xl">
        {/* console */}
        <div className="relative overflow-hidden">
          {/* Browser bar */}
          <div className="flex items-center justify-between border-b border-base-300 bg-base-200 px-5 py-3">
            <div className="flex gap-2">
              <span className="h-3 w-3 rounded-full bg-error" />
              <span className="h-3 w-3 rounded-full bg-warning" />
              <span className="h-3 w-3 rounded-full bg-success" />
            </div>

            <div className="rounded-full bg-base-100 px-4 py-0.5 text-[11px] text-base-content/60">
              <span className="mr-2 text-xs text-success">●</span>
              app.support.hub / dashboard
            </div>

            <div className="flex gap-3 text-base-content/50">
              <span>
                <Search size={15} />
              </span>
              <span>
                <Bell size={15} />
              </span>
            </div>
          </div>

          <div className="grid h-full grid-cols-12">
            {/* Sidebar */}
            <aside className="col-span-5 border-r border-base-300 bg-base-100">
              <div className="flex items-center justify-between border-b border-base-300 px-4 py-3">
                <h3 className="font-bold text-[14px]">Inbox</h3>
                <span className="badge badge-primary badge-xs">128</span>
              </div>

              <div>
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`border-b border-base-content/10 px-3 py-2 ${
                      ticket.active
                        ? "bg-primary/10 border-l-4 border-l-primary"
                        : "hover:bg-base-200/70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-base-content/40">
                        {ticket.id}
                      </span>
                      <span className="text-[10px] text-base-content/50">
                        {ticket.time}
                      </span>
                    </div>

                    <p className="text-[11px] font-semibold">{ticket.title}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-base-content/50">
                        {ticket.name}
                      </span>

                      <span
                        className={`badge badge-xs ${
                          ticket.priority === "High"
                            ? "badge-error"
                            : ticket.priority === "Med"
                              ? "badge-warning"
                              : "badge-ghost"
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            {/* Main content */}
            <main className="col-span-7 bg-base-100 p-4">
              <div className="mb-2">
                <p className="text-[11px] font-medium text-base-content/40">
                  #4821 · Sarah Klein · Acme Co.
                </p>
                <h2 className="text-[14px] font-bold leading-tight">
                  Refund not received after 5 days
                </h2>

                <div className="mt-1 flex flex-wrap gap-2">
                  <span className="badge badge-xs badge-error badge-outline">
                    Billing
                  </span>
                  <span className="badge badge-xs badge-warning badge-outline">
                    High priority
                  </span>
                  <span className="badge badge-xs badge-info badge-outline">
                    Returning customer
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-base-content/10 bg-base-200/70 p-4 mt-3">
                <p className="mb-1 text-[11px] font-bold text-primary">
                  ✦ AI SUMMARY
                </p>
                <p className="text-[10px] leading-relaxed text-base-content/70">
                  Customer requested a refund on May 4. Stripe transaction
                  succeeded same day; funds are not visible. Likely bank
                  settlement delay, usually 5–7 business days.
                </p>
              </div>

              <div className="mt-3 rounded-2xl border border-primary/30 bg-base-100 p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-bold text-primary">
                    ✦ SUGGESTED REPLY
                  </p>
                  <span className="badge badge-ghost badge-xs">
                    Needs approval
                  </span>
                </div>

                <p className="text-[10px] leading-relaxed text-base-content/70">
                  Hi Sarah — I checked your account and your refund was
                  processed on May 4. Bank settlement typically takes 5–7
                  business days; please allow a little more time.
                </p>

                <div className="mt-2 flex gap-2">
                  <GradientButton buttonClassName="btn-xs hover:opacity-100 rounded-lg">
                    Approve & send
                  </GradientButton>

                  <button className="btn btn-active btn-xs rounded-lg">
                    Edit
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </GradientShadow>
    </div>
  );
};

export default HeroWindow;

