import {
  MessageSquare,
  Sparkles,
  CheckCircle2,
  UserCheck,
  Wand2,
  BarChart3,
  Workflow,
} from "lucide-react";

import Badge from "@/components/ui/Badge/PromoBadge";
import GradientIconCard from "@/components/ui/Card/GradientIconCard";
import GradientCard from "@/components/ui/Card/GradientCard";
import CardWithBlurBlob from "@/components/ui/Card/CardWithBlurBlob";

const workflowSteps = [
  {
    step: "01",
    title: "Customer describes issue",
    description:
      "Customer submits issue details from the support portal with full context.",
    icon: MessageSquare,
  },
  {
    step: "02",
    title: "AI diagnosis & triage",
    description:
      "AI detects category, priority, risk level, root cause, and resolution steps.",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "Solved or escalated",
    description:
      "Marked resolved by AI immediately or escalated to the human queue.",
    icon: CheckCircle2,
  },
  {
    step: "04",
    title: "Assigned to an agent",
    description:
      "Managers or owners assign open tickets to an active, approved agent.",
    icon: UserCheck,
  },
  {
    step: "05",
    title: "Live chat & Suggest reply",
    description:
      "Agent chats in real time and uses one-click Suggest reply when needed.",
    icon: Wand2,
  },
  {
    step: "06",
    title: "Resolved & tracked",
    description:
      "Ticket marked resolved and tracked across workspace analytics.",
    icon: BarChart3,
  },
];

export default function WorkflowSection() {
  return (
    <section className="w-full bg-base-200/30 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Badge */}
        <div className="mb-4 flex justify-center">
          <Badge icon={Workflow} text="How it works" />
        </div>

        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-base-content/90 md:text-4xl">
            From issue submitted to ticket resolved
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-base-content/70 md:text-base">
            A clear AI-assisted lifecycle from instant triage to human
            resolution — AI assists every step while your team stays in full
            control.
          </p>
        </div>

        {/* Desktop timeline */}
        <div className="relative mt-10 hidden lg:block">
          <div className="absolute left-[7%] right-[7%] top-6 h-0.5 bg-gradient-to-r from-primary via-secondary/80 to-primary" />

          <div className="grid grid-cols-6 gap-4">
            {workflowSteps.map(({ step }) => (
              <div key={step} className="flex justify-center">
                <GradientCard className="z-10 h-fit w-fit rounded-full">
                  <div className="m-1 flex h-10 w-10 items-center justify-center rounded-full bg-base-100 font-semibold text-base-content/80">
                    {step}
                  </div>
                </GradientCard>
              </div>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {workflowSteps.map(({ step, title, description, icon: Icon }) => (
            <CardWithBlurBlob
              key={step}
              className="h-full min-h-[195px] p-4 text-center"
              contentClassName="items-center"
            >
              {/* Mobile step badge */}
              <div className="mb-4 flex justify-center lg:hidden">
                <GradientCard className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold">
                  {step}
                </GradientCard>
              </div>

              <div className="flex items-center justify-center">
                <GradientIconCard
                  icon={Icon}
                  size={16}
                  strokeWidth={2}
                  className="mb-4 from-primary/10 to-secondary/20 text-primary"
                  iconClassName="text-primary"
                />
              </div>

              <h3 className="mx-auto max-w-[150px] text-sm font-semibold leading-5 text-base-content">
                {title}
              </h3>

              <p className="mx-auto mt-3 max-w-[165px] text-xs leading-5 text-base-content/65">
                {description}
              </p>
            </CardWithBlurBlob>
          ))}
        </div>
      </div>
    </section>
  );
}
