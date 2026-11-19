import {
  Building2,
  Lock,
  KeyRound,
  CreditCard,
  Gauge,
  MessageSquareLock,
  ShieldCheck,
} from "lucide-react";

import Badge from "../../ui/Badge/PromoBadge";
import CardWithBlurBlob from "../../ui/Card/CardWithBlurBlob";
import GradientIconCard from "../../ui/Card/GradientIconCard";

const securityItems = [
  {
    title: "Company-level data isolation",
    description:
      "Workspace boundaries enforced via company-scoped queries on every read and write.",
    icon: Building2,
  },
  {
    title: "Role & approval route guards",
    description:
      "Firebase token verification paired with strict role and staff approval checks on every API call.",
    icon: Lock,
  },
  {
    title: "AI API keys stay on backend",
    description:
      "All AI generation and ticket triage run server-side — no provider key ever ships to the browser.",
    icon: KeyRound,
  },
  {
    title: "Server-side Stripe verification",
    description:
      "Checkout sessions and workspace ownership are verified on the backend before activating plans.",
    icon: CreditCard,
  },
  {
    title: "Workspace quotas & rate limits",
    description:
      "Seat limits, monthly ticket caps, and API rate limiting protect every workspace from abuse.",
    icon: Gauge,
  },
  {
    title: "Scoped conversation access",
    description:
      "Only authorized customers, assigned agents, managers, and owners can view or reply to tickets.",
    icon: MessageSquareLock,
  },
];

export default function SecuritySection() {
  return (
    <section id="security" className="w-full bg-base-200/30 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Badge */}
        <div className="mb-4 flex justify-center">
          <Badge icon={ShieldCheck} text="Security" />
        </div>

        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-base-content/90 md:text-4xl">
            Designed with SaaS security fundamentals
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-base-content/70 md:text-base">
            Core protections are built into the product architecture — from
            company isolation to role-based access and backend-only AI keys.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {securityItems.map(({ title, description, icon: Icon }) => (
            <CardWithBlurBlob
              key={title}
              className="h-full p-6"
              blobColor="bg-primary/10"
              blobHoverColor="group-hover:bg-primary/20"
            >
              <GradientIconCard
                icon={Icon}
                size={17}
                strokeWidth={2}
                className="mb-5 from-primary/10 to-secondary/20 text-primary"
                iconClassName="text-primary"
              />

              <h3 className="text-sm font-semibold text-base-content">
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
