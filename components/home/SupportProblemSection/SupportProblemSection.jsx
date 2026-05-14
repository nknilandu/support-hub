import {
  Inbox,
  AlertTriangle,
  Repeat2,
  Clock,
  CircleAlert,
} from "lucide-react";
import Badge from "../../ui/Badge/PromoBadge";

const problems = [
  {
    title: "Tickets pile up",
    description: "Inboxes overflow before agents can triage what matters most.",
    icon: Inbox,
  },
  {
    title: "Priority is unclear",
    description: "Critical issues hide between low-effort questions and noise.",
    icon: AlertTriangle,
  },
  {
    title: "Agents repeat replies",
    description:
      "The same answers get rewritten across dozens of conversations.",
    icon: Repeat2,
  },
  {
    title: "Customers wait too long",
    description: "First-response delays erode trust and balloon escalations.",
    icon: Clock,
  },
];

export default function SupportProblemSection() {
  return (
    <section className="w-full pb-28 md:pb-32 ">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-4 flex justify-center">
          <Badge
            icon={CircleAlert}
            label="Problem"
            text="Support teams lose time"
          />
        </div>

        <h2 className="mx-auto max-w-2xl text-center text-3xl font-semibold tracking-tight text-base-content/90 md:text-4xl">
          Support teams lose time before they even start solving
        </h2>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 p-6 transition duration-200 hover:-translate-y-1 shadow-xs hover:shadow-lg"
            >
              {/* blob */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/20 blur-2xl transition group-hover:bg-primary/30" />
              <div className="pointer-events-none absolute right-20 -top-5 h-10 w-10 rounded-full bg-secondary/50 blur-2xl transition group-hover:bg-primary/30" />

              <div className="relative z-10">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-error/10 text-error">
                  <Icon size={18} strokeWidth={2} />
                </div>

                <h3 className="text-md font-semibold text-base-content/90">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-base-content/50">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
