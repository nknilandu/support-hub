import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { CheckCircle2, ArrowRight, Gem } from "lucide-react";

import Badge from "@/components/ui/Badge/PromoBadge";
import { cn } from "@/lib/cn";
import CardWithBlurBlob from "@/components/ui/Card/CardWithBlurBlob";
import GradientButton from "@/components/ui/Button/GradientButton";
import { AuthContext } from "@/providers/AuthProvider";

// Synced with backend ownerRoutes.js SUBSCRIPTION_PLANS
const pricingPlans = [
  {
    id: "starter",
    name: "Starter",
    price: "$19",
    period: "/ mo",
    description: "For small support teams.",
    features: [
      "2 Managers & 6 Support Agents",
      "500 tickets per month",
      "250 AI replies per month",
    ],
    buttonText: "Choose Starter",
    highlighted: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: "$49",
    period: "/ mo",
    description: "For growing multi-manager teams.",
    features: [
      "5 Managers & 15 Support Agents",
      "Unlimited monthly tickets",
      "2,500 AI replies per month",
    ],
    buttonText: "Choose Growth",
    highlighted: true,
  },
  {
    id: "scale",
    name: "Scale",
    price: "$99",
    period: "/ mo",
    description: "For high-volume support operations.",
    features: [
      "10 Managers & 40 Support Agents",
      "Unlimited monthly tickets",
      "10,000 AI replies per month",
    ],
    buttonText: "Choose Scale",
    highlighted: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$249",
    period: "/ mo",
    description: "For large organizations.",
    features: [
      "25 Managers & 100 Support Agents",
      "Unlimited monthly tickets",
      "Unlimited AI replies",
    ],
    buttonText: "Choose Enterprise",
    highlighted: false,
  },
];

function PricingCard({ plan, targetPath }) {
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
          "flex h-full flex-col justify-between p-6",
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
        {/* Top content */}
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
        </div>

        {/* Bottom CTA */}
        <Link to={targetPath} className="mt-6 block">
          <GradientButton
            className="w-full"
            buttonClassName={cn(
              "w-full",
              plan.highlighted
                ? "from-primary to-secondary text-primary-content hover:opacity-90"
                : "border border-base-content/15 from-base-100 to-base-100 text-base-content hover:border-primary/40 hover:text-primary",
            )}
            glowClassName={
              plan.highlighted ? "opacity-60 blur-md" : "opacity-0"
            }
          >
            {plan.buttonText}
          </GradientButton>
        </Link>
      </CardWithBlurBlob>
    </div>
  );
}

export default function PricingSection() {
  const { user, fetchUserRole } = useContext(AuthContext);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    let active = true;
    if (!user) {
      setUserRole(null);
      return;
    }

    fetchUserRole(user).then((role) => {
      if (active) setUserRole(role);
    });

    return () => {
      active = false;
    };
  }, [user, fetchUserRole]);

  const targetPath = userRole === "owner" ? "/owner/subscription" : "/register";

  return (
    <section id="pricing" className="w-full bg-base-200/30 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-4 flex justify-center">
          <Badge icon={Gem} text="Pricing Plan" />
        </div>

        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-base-content/90 md:text-4xl">
            Plans that grow with your support team
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-base-content/70 md:text-base">
            Start free with our Default Plan (1 Manager, 3 Agents, 30 tickets
            &amp; 50 AI replies/mo). Upgrade anytime via Stripe.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} targetPath={targetPath} />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            to={targetPath}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-3"
          >
            {userRole === "owner"
              ? "Manage workspace subscription & billing"
              : "Start free with Default Plan"}
            <ArrowRight size={15} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
