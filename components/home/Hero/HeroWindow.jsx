import { Bell, Search, Send, Sparkles } from "lucide-react";
import GradientShadow from "../../../components/ui/Shadow/GradientShadowWrapper";
import TextBadge from "../../../components/ui/Badge/TextBadge";

const HeroWindow = () => {
  const tickets = [
    {
      id: "TCK-1A1F",
      title: "Privacy breach: customer data visible",
      name: "Nilandu",
      time: "2m",
      priority: "Critical",
      active: true,
    },
    {
      id: "TCK-1A1E",
      title: "Payment pending after transaction",
      name: "Tariq Hasan",
      time: "14m",
      priority: "High",
    },
    {
      id: "TCK-1A1D",
      title: "Adjust email notification settings",
      name: "Sadia Islam",
      time: "1h",
      priority: "Low",
      aiResolved: true,
    },
    {
      id: "TCK-1A1C",
      title: "Login failure with valid credentials",
      name: "Rafiul Karim",
      time: "3h",
      priority: "Med",
      aiResolved: true,
    },
  ];

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case "Critical":
        return "red";
      case "High":
        return "orange";
      case "Med":
        return "yellow";
      case "Low":
        return "green";
      default:
        return "slate";
    }
  };

  const floatingCards = [
    {
      title: "AI CONFIDENCE",
      value: "85% – 94%",
      meta: "Auto root-cause triage",
      icon: "✦",
      position: "left-2 bottom-16",
      iconClass: "bg-primary/10 text-primary",
      metaClass: "text-success",
    },
    {
      title: "AI RESOLVED",
      value: "64%",
      meta: "Instant first response",
      icon: "✓",
      position: "left-0 top-20",
      iconClass: "bg-success/10 text-success",
      metaClass: "text-base-content/50",
    },
    {
      title: "URGENT QUEUE",
      value: "2 Critical",
      meta: "Flagged automatically",
      icon: "!",
      position: "right-0 top-36",
      iconClass: "bg-error/10 text-error",
      metaClass: "text-error",
    },
  ];

  return (
    <div className="relative mx-auto min-h-[380px] w-full max-w-xl p-6">
      {/* Floating cards */}
      {floatingCards.map((card) => (
        <div
          key={card.title}
          className={`absolute ${card.position} z-20 hidden rounded-2xl border border-base-content/10 bg-base-100/80 p-3 shadow-xl backdrop-blur-md md:block`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${card.iconClass}`}
            >
              {card.icon}
            </div>

            <div>
              <p className="text-[8px] font-semibold text-base-content/50">
                {card.title}
              </p>

              <p className="text-[12px] font-bold leading-none text-base-content">
                {card.value}
              </p>

              <p className={`text-[10px] ${card.metaClass}`}>{card.meta}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Browser window */}
      <GradientShadow glowClassName="opacity-30 blur-md" radius="rounded-3xl">
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
              supporthub.app / agent / tickets
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
                <h3 className="text-[13px] font-bold">Company Tickets</h3>
                <span className="badge badge-primary badge-xs">24</span>
              </div>

              <div>
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`border-b border-base-content/10 px-3 py-2.5 transition ${
                      ticket.active
                        ? "border-l-4 border-l-primary bg-gradient-to-r from-primary/10 to-secondary/10"
                        : "hover:bg-base-200/70"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-base-content/45">
                        {ticket.id}
                      </span>
                      <span className="text-[10px] text-base-content/50">
                        {ticket.time}
                      </span>
                    </div>

                    <p className="mt-0.5 line-clamp-1 text-[11px] font-semibold">
                      {ticket.title}
                    </p>

                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[10px] text-base-content/55">
                        {ticket.name}
                      </span>

                      <TextBadge
                        variant={getPriorityVariant(ticket.priority)}
                        size="xs"
                        className="border-none text-[8px]"
                      >
                        {ticket.priority}
                      </TextBadge>
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            {/* Main content */}
            <main className="col-span-7 bg-base-100 p-4">
              <div className="mb-2">
                <p className="text-[10px] font-medium text-base-content/45">
                  TCK-1A1F · Nilandu · Assigned to Farhan
                </p>
                <h2 className="text-[13px] font-bold leading-tight">
                  Privacy breach: customer data visible
                </h2>

                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <TextBadge variant="blue" size="sm">
                    Bug
                  </TextBadge>
                  <TextBadge variant="red" size="sm">
                    Critical
                  </TextBadge>
                  <TextBadge variant="green" size="sm">
                    85% Confidence
                  </TextBadge>
                </div>
              </div>

              <div className="mt-2.5 rounded-2xl border border-base-content/10 bg-base-200/70 p-3">
                <p className="mb-1 text-[10px] font-bold text-warning">
                  ⚡ LIKELY ROOT CAUSE
                </p>
                <p className="text-[10px] leading-relaxed text-base-content/70">
                  Missing per-user authorization check on order endpoint allows
                  viewing other customer records via URL parameter changes.
                </p>
              </div>

              <div className="mt-2.5 rounded-2xl border border-primary/30 bg-base-100 p-3 shadow-sm">
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-primary">
                    ✦ SUPPORT CONVERSATION
                  </p>
                  <TextBadge
                    variant="green"
                    size="sm"
                    className="rounded-md border-none"
                  >
                    Active
                  </TextBadge>
                </div>

                <p className="rounded-xl bg-gradient-to-r from-primary/15 to-secondary/15 p-2 text-[10px] leading-relaxed text-base-content/80">
                  Thank you for reporting this, Nilandu. Our security team is
                  investigating and patching the endpoint immediately.
                </p>

                <div className="mt-2 flex items-center justify-end gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-primary to-secondary px-2.5 py-1 text-[9px] font-semibold text-primary-content">
                    <Sparkles size={10} />
                    Suggest reply
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-lg border border-base-content/15 bg-base-200 px-2.5 py-1 text-[9px] font-semibold text-base-content/75">
                    <Send size={9} />
                    Send
                  </span>
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
