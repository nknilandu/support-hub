import {
  Building2,
  Lock,
  KeyRound,
  Webhook,
  FileWarning,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

import Badge from "../../ui/Badge/PromoBadge";
import CardWithBlurBlob from "../../ui/Card/CardWithBlurBlob";
import GradientIconCard from "../../ui/Card/GradientIconCard";

const securityItems = [
  {
    title: "Organization-level data isolation",
    description:
      "Tenant boundaries enforced at the data layer for every read and write.",
    icon: Building2,
  },
  {
    title: "Role-based route protection",
    description:
      "Frontend and API routes guarded by role on every request.",
    icon: Lock,
  },
  {
    title: "AI API keys stay on backend",
    description:
      "No provider key ever ships to the browser.",
    icon: KeyRound,
  },
  {
    title: "Stripe webhook verification",
    description:
      "All webhook events verified with signing secrets.",
    icon: Webhook,
  },
  {
    title: "File type and size restrictions",
    description:
      "Uploads validated server-side to prevent abuse.",
    icon: FileWarning,
  },
  {
    title: "Customers cannot see internal notes",
    description:
      "Agent collaboration stays private by design.",
    icon: EyeOff,
  },
];

export default function SecuritySection() {
  return (
    <section className="w-full bg-base-200/30 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Badge */}
        <div className="mb-4 flex justify-center">
          <Badge icon={ShieldCheck} label="" text="Security" />
        </div>

        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-base-content/90 md:text-4xl">
            Designed with SaaS security fundamentals
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-base-content/70 md:text-base">
  Core protections are built into the product architecture — from tenant
  isolation to role-based access and backend-only AI keys.
</p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {securityItems.map(({ title, description, icon: Icon }) => (
            <CardWithBlurBlob
              key={title}
              className="p-6"
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