import { ArrowRight, Workflow } from "lucide-react";

import GradientButton from "../../ui/Button/GradientButton";
import GradientText from "../../ui/Text/GradientText";
import TextBadge from "../../ui/Badge/TextBadge";

const demoRoles = [
  {
    label: "Platform",
    variant: "cyan",
  },
  {
    label: "Owner",
    variant: "blue",
  },
  {
    label: "Agent",
    variant: "pink",
  },
  {
    label: "Customer",
    variant: "green",
  },
];

export default function CTASection() {
  return (
    <section className="w-full border-b border-base-content/10 bg-base-200/30 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-base-content md:text-5xl">
            Launch a smarter{" "}
            <GradientText gradientClassName="from-primary to-secondary">
              support workspace
            </GradientText>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-base-content/70 md:text-base">
            Start with a free company workspace, test the demo roles, and see
            how AI can reduce repetitive support work.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <GradientButton
              shadow
              buttonClassName="px-6"
              glowClassName="opacity-60"
            >
              Start Free
              <ArrowRight size={16} strokeWidth={2} />
            </GradientButton>

            <GradientButton
              shadow
              buttonClassName="px-6 from-base-100 to-base-200 text-base-content/90"
              glowClassName="opacity-30 blur-xs"
            >
              View Workflow
              <Workflow size={16} strokeWidth={2}></Workflow>
            </GradientButton>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-base-content/60">
            <span>Demo roles available:</span>

            {demoRoles.map((role) => (
              <TextBadge
                key={role.label}
                variant={role.variant}
                size="md"
                className="font-medium normal-case"
              >
                {role.label}
              </TextBadge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
