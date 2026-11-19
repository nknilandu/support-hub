import {
  Sparkles,
  Tag,
  Stethoscope,
  Wand2,
  MessagesSquare,
  Bot,
  UserCheck,
  BarChart3,
  Lightbulb,
} from "lucide-react";

import Badge from "../../ui/Badge/PromoBadge";
import GradientIconCard from "../../ui/Card/GradientIconCard";
import CardWithBlurBlob from "../../ui/Card/CardWithBlurBlob";

const solutions = [
  {
    title: "AI First Response & Escalation",
    description:
      "Instant AI diagnosis during ticket creation — resolves common issues immediately or escalates with full context attached.",
    icon: Sparkles,
    preview: "first-response",
  },
  {
    title: "Auto Triage & Risk Scoring",
    description:
      "Automatically detects category, priority, risk level, and confidence score before an agent opens the ticket.",
    icon: Tag,
    preview: "triage",
  },
  {
    title: "Root Cause & Resolution Steps",
    description:
      "Surfaces likely root causes, impact-ranked recommendations, and step-by-step resolution guides for agents.",
    icon: Stethoscope,
    preview: "root-cause",
  },
  {
    title: "One-Click Suggest Reply",
    description:
      "Agents can generate a polished response from ticket context or expand a rough note with a single click.",
    icon: Wand2,
    preview: "suggest-reply",
  },
  {
    title: "Real-Time Support Conversation",
    description:
      "Live message thread between customer and assigned agent with instant release and resolve controls.",
    icon: MessagesSquare,
    preview: "conversation",
  },
  {
    title: "Customer & Agent AI Assistant",
    description:
      "Dedicated AI chat workspace with searchable conversation history for both customers and support agents.",
    icon: Bot,
    preview: "ai-assistant",
  },
  {
    title: "Urgent Queue & Smart Assignment",
    description:
      "Flags critical/high priority tickets for managers and owners to assign or reassign to approved agents.",
    icon: UserCheck,
    preview: "assignment",
  },
  {
    title: "Workspace Metrics & Quotas",
    description:
      "Tracks AI vs. human resolution rates, weekly activity, team approvals, and monthly plan usage.",
    icon: BarChart3,
    preview: "metrics",
  },
];

function SolutionPreview({ type }) {
  const boxClass =
    "rounded-xl border border-base-content/10 bg-base-100/70 p-2.5";

  if (type === "first-response") {
    return (
      <div className={boxClass}>
        <div className="mb-1.5 flex items-center justify-between text-[10px] font-medium text-primary">
          <span className="flex items-center gap-1">
            <Sparkles size={11} strokeWidth={2} />
            AI First Response
          </span>
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px]">
            Step 2 of 4
          </span>
        </div>

        <p className="line-clamp-2 text-[11px] leading-4 text-base-content/70">
          AI analyzed your issue. Resolve now or escalate with AI context
          attached.
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-success/15 px-2 py-0.5 text-[9px] font-medium text-success">
            Resolved by AI
          </span>
          <span className="rounded-md bg-gradient-to-r from-primary to-secondary px-2 py-0.5 text-[9px] font-medium text-primary-content">
            Escalate to human
          </span>
        </div>
      </div>
    );
  }

  if (type === "triage") {
    return (
      <div className={boxClass}>
        <div className="mb-2 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-info/30 bg-info/10 px-2 py-0.5 text-[9px] font-semibold text-info">
            BUG
          </span>
          <span className="rounded-full border border-error/30 bg-error/10 px-2 py-0.5 text-[9px] font-semibold text-error">
            CRITICAL
          </span>
          <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[9px] font-semibold text-success">
            85% CONFIDENCE
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-base-200">
          <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-primary to-secondary" />
        </div>
      </div>
    );
  }

  if (type === "root-cause") {
    return (
      <div className={boxClass}>
        <p className="text-[10px] font-semibold text-warning">
          Likely Root Cause
        </p>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-base-content/70">
          Missing per-user authorization check on order endpoint.
        </p>
        <div className="mt-1.5 flex items-center gap-1.5 text-[9px] font-medium text-base-content/60">
          <span className="rounded bg-error/10 px-1.5 py-0.5 text-error">
            High Impact
          </span>
          <span>· Step 1: Verify &amp; Patch</span>
        </div>
      </div>
    );
  }

  if (type === "suggest-reply") {
    return (
      <div className={boxClass}>
        <p className="line-clamp-2 text-[11px] leading-4 text-base-content/60">
          Write a reply or add a draft for AI to improve...
        </p>

        <div className="mt-2 flex items-center justify-end gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-primary to-secondary px-2 py-0.5 text-[9px] font-semibold text-primary-content">
            <Sparkles size={9} />
            Suggest reply
          </span>
          <span className="rounded-md border border-base-content/15 bg-base-200 px-2 py-0.5 text-[9px] font-medium text-base-content/70">
            Send
          </span>
        </div>
      </div>
    );
  }

  if (type === "conversation") {
    return (
      <div className={boxClass}>
        <div className="mb-1.5 flex items-center justify-between text-[10px]">
          <span className="font-semibold text-base-content">
            Support Conversation
          </span>
          <div className="flex gap-1">
            <span className="rounded bg-error/15 px-1.5 py-0.5 text-[8px] font-semibold text-error">
              Release
            </span>
            <span className="rounded bg-success/15 px-1.5 py-0.5 text-[8px] font-semibold text-success">
              Resolve
            </span>
          </div>
        </div>
        <p className="line-clamp-2 rounded-lg bg-primary/10 px-2 py-1 text-[10px] leading-3.5 text-base-content/80">
          Thank you for reporting this. Our security team is investigating...
        </p>
      </div>
    );
  }

  if (type === "ai-assistant") {
    return (
      <div className={boxClass}>
        <div className="mb-1 flex items-center justify-between text-[10px]">
          <span className="flex items-center gap-1 font-semibold text-secondary">
            <Bot size={11} />
            AI Assistant
          </span>
          <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[8px] font-semibold text-primary">
            + New Chat
          </span>
        </div>
        <p className="line-clamp-2 text-[11px] leading-4 text-base-content/70">
          Troubleshoot issues, analyze tickets, and summarize conversations.
        </p>
      </div>
    );
  }

  if (type === "assignment") {
    return (
      <div className={boxClass}>
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold text-base-content">
            Urgent Tickets
          </span>
          <span className="rounded-full bg-error/15 px-2 py-0.5 text-[8px] font-bold text-error">
            CRITICAL
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-base-content/65">
          <span>Status: OPEN</span>
          <span className="font-medium text-primary">Assign Agent →</span>
        </div>
      </div>
    );
  }

  return (
    <div className={boxClass}>
      <div className="flex items-center justify-between text-[10px] font-medium text-base-content/75">
        <span>AI Replies Quota</span>
        <span className="font-semibold text-primary">2 / 50</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-base-200">
        <div className="h-full w-[28%] rounded-full bg-gradient-to-r from-primary to-secondary" />
      </div>
      <p className="mt-1.5 text-[10px] text-base-content/55">
        Managers, Agents &amp; AI usage tracked live
      </p>
    </div>
  );
}

export default function SolutionSection() {
  return (
    <section id="features" className="w-full bg-base-200/30 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Badge */}
        <div className="mb-4 flex justify-center">
          <Badge icon={Lightbulb} text="AI-assisted support" />
        </div>

        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-base-content/90 md:text-4xl">
            AI-assisted support without losing human control
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-base-content/70 md:text-base">
            From instant AI first responses and root-cause triage to one-click
            agent reply suggestions — every workflow stays transparent and
            human-controlled.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {solutions.map(({ title, description, icon: Icon, preview }) => (
            <CardWithBlurBlob key={title} className="flex h-full flex-col p-5">
              <GradientIconCard
                icon={Icon}
                size={17}
                strokeWidth={2}
                className="mb-3 from-primary/10 to-secondary/20"
                iconClassName="text-primary"
              />

              <h3 className="text-sm font-semibold text-base-content">
                {title}
              </h3>

              <p className="mt-2 line-clamp-3 text-sm leading-5 text-base-content/70">
                {description}
              </p>

              <div className="mt-auto pt-4">
                <SolutionPreview type={preview} />
              </div>
            </CardWithBlurBlob>
          ))}
        </div>
      </div>
    </section>
  );
}
