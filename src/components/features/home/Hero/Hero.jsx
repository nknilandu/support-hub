import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { Link as ScrollLink } from "react-scroll";
import { ArrowRight, CheckCircle, Sparkles, Workflow } from "lucide-react";

import Badge from "@/components/ui/Badge/PromoBadge";
import GradientButton from "@/components/ui/Button/GradientButton";
import GradientText from "@/components/ui/Text/GradientText";
import HeroWindow from "./HeroWindow";
import { AuthContext } from "@/providers/AuthProvider";

const ROLE_DASHBOARD_MAP = {
  owner: "/owner/dashboard",
  manager: "/manager/dashboard",
  agent: "/agent/dashboard",
  customer: "/customer/dashboard",
};

const Hero = () => {
  const companies = ["Linear", "Notion", "Vercel", "Framer", "Loom", "Stripe"];
  const trustItems = [
    "AI First Response",
    "Auto Root-Cause Triage",
    "Human Handoff Ready",
  ];

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
    <section className="relative mx-auto min-h-screen max-w-7xl overflow-hidden">
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(currentColor 1px, transparent 1px),
            linear-gradient(90deg, currentColor 1px, transparent 1px)
        `,
          backgroundSize: "60px 60px",
          backgroundPosition: "center center",
          color: "rgba(120, 120, 120, 0.45)",

          WebkitMaskImage:
            "radial-gradient(circle at center, black 0%, black 10%, transparent 80%)",
          maskImage:
            "radial-gradient(circle at center, black 0%, black 10%, transparent 50%)",
        }}
      />

      {/* Center Soft Blob */}
      <div className="absolute left-1/3 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/40 blur-[140px]" />

      {/* Content */}
      <div className="relative z-10 mt-30 flex min-h-[95svh] flex-col items-center justify-center px-6 lg:mt-5">
        <div className="flex w-full flex-col items-center justify-center gap-10 lg:flex-row lg:gap-5">
          <div className="w-full min-w-0 lg:flex-1">
            <div className="mx-auto flex max-w-2xl flex-col items-center space-y-6 text-center lg:mx-0 lg:items-start lg:text-left">
              {/* Badge */}
              <Badge
                icon={Sparkles}
                label="AI Workspace"
                text="AI-powered support is here"
              />

              {/* Heading */}
              <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-base-content md:text-5xl xl:text-6xl">
                Resolve Customer Tickets{" "}
                <GradientText>Faster with AI</GradientText>
              </h1>

              {/* Description */}
              <p className="max-w-xl text-base-content/70 sm:text-md md:text-lg">
                SupportHub is the AI-first helpdesk for modern teams. Deliver
                instant first responses, diagnose root causes, and craft agent
                replies in seconds — without losing human control.
              </p>

              {/* Buttons */}
              <div className="flex w-fit flex-wrap items-center justify-center gap-4 lg:justify-start">
                <Link to={primaryCtaPath}>
                  <GradientButton
                    buttonClassName="w-fit rounded-xl px-6"
                    shadow
                    glowClassName="opacity-60 blur-md"
                  >
                    {user && userRole ? "Go to Dashboard" : "Start Free"}
                    <ArrowRight className="h-5 w-5" />
                  </GradientButton>
                </Link>

                <ScrollLink to="workflow" smooth offset={-20} duration={500}>
                  <GradientButton
                    type="button"
                    shadow
                    buttonClassName="px-6 from-primary/5 to-secondary/10 text-base-content/90"
                    glowClassName="opacity-30 blur-xs"
                  >
                    View Workflow
                    <Workflow size={16} strokeWidth={2} />
                  </GradientButton>
                </ScrollLink>
              </div>

              {/* Trust Indicators */}
              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs text-base-content/60 lg:justify-start">
                {trustItems.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full min-w-0 lg:flex-1">
            <div className="mx-auto w-full max-w-[620px] overflow-hidden">
              <HeroWindow />
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 text-center lg:mt-10">
          <p className="text-xs uppercase tracking-[0.2em] text-base-content/60">
            Built for support teams using modern tools
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {companies.map((company) => (
              <span
                key={company}
                className="text-md font-semibold text-base-content/40 transition hover:text-base-content/70 sm:text-md"
              >
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
