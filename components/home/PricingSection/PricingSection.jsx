import { CheckCircle2, ArrowRight, Gem } from "lucide-react";

import Badge from "../../ui/Badge/PromoBadge";
import { cn } from "../../../src/lib/cn";
import CardWithBlurBlob from "../../ui/Card/CardWithBlurBlob";
import GradientButton from "../../ui/Button/GradientButton";

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "/ mo",
    description: "Try the platform with a small team.",
    features: ["2 agents", "50 tickets / month", "100 AI credits / month"],
    buttonText: "Start free",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$29",
    period: "/ mo",
    description: "For lean support teams getting started.",
    features: ["5 agents", "500 tickets / month", "1,000 AI credits / month"],
    buttonText: "Choose Starter",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$99",
    period: "/ mo",
    description: "For growing teams that need automation.",
    features: [
      "15 agents",
      "3,000 tickets / month",
      "10,000 AI credits / month",
    ],
    buttonText: "Choose Pro",
    highlighted: true,
  },
  {
    name: "Business",
    price: "$299",
    period: "/ mo",
    description: "For high-volume support operations.",
    features: [
      "50 agents",
      "10,000 tickets / month",
      "50,000 AI credits / month",
    ],
    buttonText: "Choose Business",
    highlighted: false,
  },
];

function PricingCard({ plan }) {
  return (
    <div className="group relative pt-4 transition duration-200 hover:-translate-y-1">
      {plan.highlighted && (
        <div className="absolute left-1/2 top-4 z-30 -translate-x-1/2 -translate-y-1/2">
          <span className="inline-flex whitespace-nowrap rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-primary-content shadow-md">
            Most Popular
          </span>
        </div>
      )}

      <CardWithBlurBlob
        interactive={false}
        className={cn(
          "h-full p-6",
          "group-hover:shadow-lg",
          plan.highlighted &&
            "border-primary/40 shadow-xl shadow-primary/10 ring-1 ring-primary/25",
        )}
        blobColor={plan.highlighted ? "bg-primary/15" : "bg-primary/10"}
        blobHoverColor={
          plan.highlighted
            ? "group-hover:bg-secondary/20"
            : "group-hover:bg-primary/20"
        }
      >
        {/* content */}
        <div>
          <h3 className="text-sm font-medium text-base-content/80">
            {plan.name}
          </h3>

          <div className="mt-4 flex items-end gap-1">
            <span className="text-4xl font-semibold tracking-tight text-base-content">
              {plan.price}
            </span>
            <span className="pb-1 text-sm text-base-content/70">
              {plan.period}
            </span>
          </div>

          <p className="mt-3 min-h-[48px] text-sm leading-6 text-base-content/70">
            {plan.description}
          </p>

          <ul className="mt-5 space-y-3">
            {plan.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-sm text-base-content"
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
          <GradientButton
            className="w-full mt-5"
            buttonClassName={`${
              plan.highlighted
                ? "bg-gradient-to-r from-primary to-secondary text-primary-content hover:opacity-90"
                : "border border-base-content/15 bg-base-100 text-base-content hover:border-primary/40 hover:text-primary"
            }`}
          >
            {plan.buttonText}
          </GradientButton>
        </div>
      </CardWithBlurBlob>
    </div>
  );
}

export default function PricingSection() {
  return (
    <section className="w-full bg-base-200/30 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-4 flex justify-center">
          <Badge icon={Gem} text="Pricing Plan" />
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-base-content/90 md:text-4xl">
            Plans that grow with your support team
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-base-content/70 md:text-base">
            Start free. Upgrade when ticket volume or AI usage requires it.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3"
          >
            View full pricing
            <ArrowRight size={15} strokeWidth={2} />
          </a>
        </div>
      </div>
    </section>
  );
}
