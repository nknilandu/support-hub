import {
  MessageSquare,
  Tag,
  ClipboardList,
  PencilLine,
  Sparkles,
  Bot,
  ShieldCheck,
  BarChart3,
  Route,
  Lightbulb,
} from "lucide-react";

import Badge from "../../ui/Badge/PromoBadge";
import GradientIconCard from "../../ui/Card/GradientIconCard";
import CardWithBlurBlob from "../../ui/Card/CardWithBlurBlob";

const solutions = [
  {
    title: "AI First Response",
    description: "contextual reply the moment a ticket is created.",
    icon: MessageSquare,
    preview: "first-response",
  },
  {
    title: "Smart Ticket Classification",
    description:
      "Auto-detected category, priority, and intent — before an agent picks it up. Smart AI triage routes every ticket to the right workflow in seconds.",
    icon: Tag,
    preview: "classification",
  },
  {
    title: "Conversation Summary",
    description:
      "Long threads collapsed into a single, scannable brief for the next agent.",
    icon: ClipboardList,
    preview: "summary",
  },
  {
    title: "AI Reply Draft",
    description:
      "A polished draft your agent can approve, edit, or rewrite — never sent without review.",
    icon: PencilLine,
    preview: "draft",
  },
  {
    title: "AI Triage Assistant",
    description:
      "New tickets are routed by urgency, customer context, and issue type automatically.",
    icon: Bot,
    preview: "classification",
  },
  {
    title: "Human Approval Gate",
    description:
      "AI can suggest actions, but sensitive replies stay locked until an agent approves.",
    icon: ShieldCheck,
    preview: "draft",
  },
  {
    title: "Support Insights",
    description:
      "Track repeated issues, slow queues, and automation impact from one clear view.",
    icon: BarChart3,
    preview: "summary",
  },
  {
    title: "Smart Escalation",
    description: "Pushed to the right team before customers lose patience.",
    icon: Route,
    preview: "first-response",
  },
];

function SolutionPreview({ type }) {
  const boxClass =
    "rounded-xl border border-base-content/10 bg-base-100/70 p-2.5";

  if (type === "first-response") {
    return (
      <div className={boxClass}>
        <div className="mb-1.5 flex items-center gap-2 text-[11px] font-medium text-primary">
          <Sparkles size={12} strokeWidth={2} />
          <span>AI assistant</span>
        </div>

        <p className="line-clamp-2 text-[11px] leading-4 text-base-content/70">
          Try resetting from Settings → Security. Did this resolve it?
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-success/15 px-2 py-0.5 text-[9px] font-medium text-success">
            Yes, solved
          </span>

          <span className="rounded-md bg-base-200 px-2 py-0.5 text-[9px] font-medium text-base-content/60">
            Need a human
          </span>
        </div>
      </div>
    );
  }

  if (type === "classification") {
    return (
      <div className={boxClass}>
        <div className="mb-2 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-info/30 bg-info/10 px-2 py-0.5 text-[9px] font-medium text-info">
            Billing
          </span>

          <span className="rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[9px] font-medium text-warning">
            High
          </span>

          <span className="rounded-full border border-base-content/10 bg-base-200 px-2 py-0.5 text-[9px] font-medium text-base-content/60">
            Refund intent
          </span>
        </div>

        <div className="h-1 overflow-hidden rounded-full bg-base-200">
          <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-primary to-secondary" />
        </div>
      </div>
    );
  }

  if (type === "summary") {
    return (
      <div className={boxClass}>
        <ul className="space-y-0.5 text-[11px] leading-4 text-base-content/70">
          <li>· Failed payout on Nov 14</li>
          <li>· 2 cards declined</li>
          <li>· Wants escalation today</li>
        </ul>
      </div>
    );
  }

  return (
    <div className={boxClass}>
      <p className="line-clamp-2 text-[11px] leading-4 text-base-content/70">
        Hi Mia, thanks for the patience. I’ve reissued the payout and you’ll see
        it...
      </p>

      <div className="mt-2 flex gap-1.5">
        <button
          type="button"
          className="rounded-md bg-gradient-to-r from-primary to-secondary px-2 py-0.5 text-[9px] font-semibold text-primary-content"
        >
          Approve
        </button>

        <button
          type="button"
          className="rounded-md border border-base-content/10 bg-base-100 px-2 py-0.5 text-[9px] font-medium text-base-content/60"
        >
          Edit
        </button>
      </div>
    </div>
  );
}

export default function SolutionSection() {
  return (
    <section className="w-full bg-base-200/30 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Badge */}
        <div className="mb-4 flex justify-center">
          <Badge
            icon={Lightbulb}
            // label="Solution"
            text="AI-assisted support"
          />
        </div>

        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-base-content/90 md:text-4xl">
            AI-assisted support without losing human control
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-base-content/70 md:text-base">
            Every AI action is reviewable. Every reply is approved by a human
            before it reaches the customer.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {solutions.map(({ title, description, icon: Icon, preview }) => (
            <CardWithBlurBlob key={title}>
              <GradientIconCard
                icon={Icon}
                size={17}
                strokeWidth={2}
                className="mb-3 from-primary/10 to-secondary/20 "
                iconClassName="text-primary"
              />

              <h3 className="text-sm font-semibold text-base-content">
                {title}
              </h3>

              <p className="mt-2 line-clamp-3 text-sm leading-5 text-base-content/70">
                {description}
              </p>

              <div className="mt-auto pt-3">
                <SolutionPreview type={preview} />
              </div>
            </CardWithBlurBlob>
          ))}
        </div>
      </div>
    </section>
  );
}
