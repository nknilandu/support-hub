import {
  Crown,
  Headphones,
  UserRound,
  ShieldCheck,
  CheckCircle2,
  CircleGauge,
} from "lucide-react";

import SoftIconCard from "../../ui/Card/SoftIconCard";
import TextBadge from "../../ui/Badge/TextBadge";
import Badge from "../../ui/Badge/PromoBadge";
import CardWithBlurBlob from "../../ui/Card/CardWithBlurBlob";

const roles = [
  {
    title: "Owner dashboard",
    badge: "Owner",
    badgeVariant: "blue",
    icon: Crown,
    iconVariant: "blue",
    features: [
      "Dashboard analytics",
      "Manage agents",
      "Assign tickets",
      "Billing & usage",
    ],
  },
  {
    title: "Agent dashboard",
    badge: "Agent",
    badgeVariant: "cyan",
    icon: Headphones,
    iconVariant: "cyan",
    features: [
      "Assigned tickets",
      "Internal notes",
      "AI summary",
      "AI reply draft",
    ],
  },
  {
    title: "Customer dashboard",
    badge: "Customer",
    badgeVariant: "green",
    icon: UserRound,
    iconVariant: "green",
    features: [
      "Support portal",
      "AI first response",
      "Create ticket",
      "Track status",
    ],
  },
  {
    title: "Platform dashboard",
    badge: "Platform",
    badgeVariant: "purple",
    icon: ShieldCheck,
    iconVariant: "purple",
    features: [
      "Manage organizations",
      "Subscription status",
      "Suspend or activate companies",
    ],
  },
];

export default function RoleWorkflowSection() {
  return (
    <section className="w-full bg-base-200/30 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Badge */}
        <div className="mb-4 flex justify-center">
          <Badge icon={CircleGauge} text="Role-based dashboards" />
        </div>

        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-base-content/90 md:text-4xl">
            Separate workflows for every role
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-base-content/70 md:text-base">
            Each role sees exactly what they need — nothing more, nothing less.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map(
            ({
              title,
              badge,
              badgeVariant,
              icon: Icon,
              iconVariant,
              features,
            }) => (
              
                <CardWithBlurBlob key={title}>
                    <div>
                  {/* Icon + badge */}
                  <div className="mb-3 flex items-center justify-between">
                    <SoftIconCard
                      icon={Icon}
                      variant={iconVariant}
                      className="h-10 w-10"
                      size={18}
                      strokeWidth={2}
                    />

                    <TextBadge variant={badgeVariant} className="font-semibold">
                      {badge}
                    </TextBadge>
                  </div>

                  <h3 className="text-lg font-semibold text-base-content">
                    {title}
                  </h3>

                  <ul className="mt-2 space-y-3">
                    {features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-base-content/70"
                      >
                        <CheckCircle2
                          size={15}
                          strokeWidth={2}
                          className="shrink-0 text-success"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                </CardWithBlurBlob>
          
            ),
          )}
        </div>
      </div>
    </section>
  );
}
