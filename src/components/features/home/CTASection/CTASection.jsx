import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { Link as ScrollLink } from "react-scroll";
import {
  ArrowRight,
  Workflow,
  Crown,
  ShieldCheck,
  Headphones,
  UserRound,
} from "lucide-react";

import GradientButton from "@/components/ui/Button/GradientButton";
import GradientText from "@/components/ui/Text/GradientText";
import TextBadge from "@/components/ui/Badge/TextBadge";
import { AuthContext } from "@/providers/AuthProvider";

const ROLE_DASHBOARD_MAP = {
  owner: "/owner/dashboard",
  manager: "/manager/dashboard",
  agent: "/agent/dashboard",
  customer: "/customer/dashboard",
};

const workspaceRoles = [
  {
    label: "Owner",
    variant: "orange",
    icon: Crown,
  },
  {
    label: "Manager",
    variant: "pink",
    icon: ShieldCheck,
  },
  {
    label: "Agent",
    variant: "cyan",
    icon: Headphones,
  },
  {
    label: "Customer",
    variant: "green",
    icon: UserRound,
  },
];

export default function CTASection() {
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

  const primaryCtaPath =
    user && userRole ? ROLE_DASHBOARD_MAP[userRole] || "/" : "/register";

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
            Start with a free company workspace, collaborate across dedicated
            team roles, and resolve tickets faster with AI assistance.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={primaryCtaPath}>
              <GradientButton
                shadow
                buttonClassName="px-6"
                glowClassName="opacity-60"
              >
                {user && userRole ? "Go to Dashboard" : "Start Free"}
                <ArrowRight size={16} strokeWidth={2} />
              </GradientButton>
            </Link>

            <ScrollLink to="workflow" smooth offset={-20} duration={500}>
              <GradientButton
                type="button"
                shadow
                buttonClassName="px-6 from-base-100 to-base-200 text-base-content/90"
                glowClassName="opacity-30 blur-xs"
              >
                View Workflow
                <Workflow size={16} strokeWidth={2} />
              </GradientButton>
            </ScrollLink>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-base-content/60">
            <span>Workspace roles supported:</span>

            {workspaceRoles.map(({ label, variant, icon: Icon }) => (
              <TextBadge
                key={label}
                variant={variant}
                size="md"
                className="gap-1.5 border-none py-1"
              >
                <Icon size={12} strokeWidth={2.2} />
                <span>{label}</span>
              </TextBadge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
