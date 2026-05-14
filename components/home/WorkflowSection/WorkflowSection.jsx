import {
  MessageSquare,
  Bot,
  CheckCircle2,
  Tag,
  PencilLine,
  BarChart3,
  Workflow,
} from "lucide-react";

import Badge from "../../ui/Badge/PromoBadge";
import GradientIconCard from "../../ui/Card/GradientIconCard";
import GradientCard from "../../ui/Card/GradientCard";
import CardWithBlurBlob from "../../ui/Card/CardWithBlurBlob";

const workflowSteps = [
  {
    step: "01",
    title: "Customer submits issue",
    description:
      "Ticket created from the support portal, email, or embedded widget.",
    icon: MessageSquare,
  },
  {
    step: "02",
    title: "AI generates first response",
    description:
      "Instant contextual reply attempts to deflect common questions.",
    icon: Bot,
  },
  {
    step: "03",
    title: "Solved or human support",
    description:
      "Customer marks the ticket resolved or requests a human agent.",
    icon: CheckCircle2,
  },
  {
    step: "04",
    title: "Classification & priority",
    description: "Category, intent, and priority detected before triage.",
    icon: Tag,
  },
  {
    step: "05",
    title: "Agent gets summary & draft",
    description: "AI summary plus a polished reply draft, awaiting approval.",
    icon: PencilLine,
  },
  {
    step: "06",
    title: "Resolved & tracked",
    description: "Outcome logged, CSAT captured, AI performance measured.",
    icon: BarChart3,
  },
];

export default function WorkflowSection() {
  return (
    <section className="w-full bg-base-200/30 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Badge */}
        <div className="mb-4 flex justify-center">
          <Badge icon={Workflow} label="" text="How it works" />
        </div>

        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-base-content/90 md:text-4xl">
            From issue submitted to ticket resolved
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-base-content/70 md:text-base">
            A simple AI-assisted workflow from issue submission to ticket
            resolution. AI suggests. Humans stay in control. Every outbound reply requires explicit agent approval.
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
              className="min-h-[190px] p-4 text-center"
              contentClassName="items-center"
            >
              {/* Mobile step badge */}
              <div className="mb-4 flex justify-center lg:hidden">
                <GradientCard className="h-10 w-10 rounded-full text-xs font-bold">
                  {step}
                </GradientCard>
              </div>

              <div className="flex justify-center items-center">
                <GradientIconCard
                icon={Icon}
                size={16}
                strokeWidth={2}
                className="mb-4 from-primary/10 to-secondary/20 text-primary"
                iconClassName="text-primary"
              />

              </div>

              
              <h3 className="mx-auto max-w-[140px] text-sm font-semibold leading-5 text-base-content">
                {title}
              </h3>

              <p className="mx-auto mt-3 max-w-[150px] text-xs leading-5 text-base-content/60">
                {description}
              </p>
            </CardWithBlurBlob>
          ))}
        </div>
      </div>
    </section>
  );
}