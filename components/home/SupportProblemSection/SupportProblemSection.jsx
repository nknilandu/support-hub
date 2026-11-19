import {
  Inbox,
  AlertTriangle,
  Repeat2,
  Clock,
  CircleAlert,
} from "lucide-react";

import Badge from "../../ui/Badge/PromoBadge";
import CardWithBlurBlob from "../../ui/Card/CardWithBlurBlob";
import SoftIconCard from "../../ui/Card/SoftIconCard";

const problems = [
  {
    title: "Unassigned queues pile up",
    description:
      "Routine questions flood the human queue before agents can triage what truly needs attention.",
    icon: Inbox,
  },
  {
    title: "Urgent issues hide in the noise",
    description:
      "Critical security and billing tickets get buried beneath low-priority requests.",
    icon: AlertTriangle,
  },
  {
    title: "Slow context & repetitive replies",
    description:
      "Agents spend too much time digging for root causes and rewriting the same explanations.",
    icon: Repeat2,
  },
  {
    title: "Delayed first responses",
    description:
      "Without instant AI guidance, customers wait hours for basic troubleshooting steps.",
    icon: Clock,
  },
];

export default function SupportProblemSection() {
  return (
    <section className="w-full py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-4 flex justify-center">
          <Badge
            icon={CircleAlert}
            label="Problem"
            text="Support teams lose time"
          />
        </div>

        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-base-content/90 md:text-4xl">
            Support teams lose time before they even start solving
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-base-content/70 md:text-base">
            Manual triage, scattered context, and repetitive replies slow down
            every stage of customer support.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map(({ title, description, icon: Icon }) => (
            <CardWithBlurBlob
              key={title}
              className="h-full p-6"
              blobColor="bg-error/10"
              blobHoverColor="group-hover:bg-error/20"
            >
              <SoftIconCard
                icon={Icon}
                variant="red"
                className="mb-5 h-10 w-10"
                size={18}
                strokeWidth={2}
              />

              <h3 className="text-base font-semibold text-base-content">
                {title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-base-content/70">
                {description}
              </p>
            </CardWithBlurBlob>
          ))}
        </div>
      </div>
    </section>
  );
}
