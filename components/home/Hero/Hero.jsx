import Badge from "../../ui/Badge/PromoBadge";
import GradientButton from "../../ui/Button/GradientButton";
import GradientText from "../../ui/Text/GradientText";
import HeroWindow from "./HeroWindow";
import { ArrowRight, CheckCircle, Sparkles, Workflow } from "lucide-react";

const Hero = () => {
  const companies = ["Linear", "Notion", "Vercel", "Framer", "Loom", "Stripe"];
  const trustItems = [
    "Instant Replies",
    "Smart ticket routing",
    "Human handoff ready",
  ];

  return (
    <section className="relative min-h-screen overflow-hidden max-w-7xl mx-auto">
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
      {/* <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/40 blur-[140px]" /> */}
      <div className="absolute left-1/3 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/40 blur-[140px]" />

      {/* Content */}
      <div className="relative z-10 min-h-[95svh] px-6 mt-30 lg:mt-5 flex flex-col items-center justify-center">
        <div className="flex w-full flex-col items-center justify-center gap-10 lg:flex-row lg:gap-5">
          <div className="w-full min-w-0 lg:flex-1">
            <div className="mx-auto max-w-2xl space-y-6 text-center lg:mx-0 lg:text-left flex flex-col items-center lg:items-start">
              {/* Badge */}
              <Badge
                icon={Sparkles}
                label="New"
                text="AI-powered support is here"
              />

              {/* Heading */}
              <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-base-content md:text-5xl xl:text-6xl">
                Resolve Customer Tickets{" "}
                <GradientText>Faster with AI</GradientText>
              </h1>

              {/* Description */}
              <p className="max-w-xl text-base-content/70 sm:text-md md:text-lg">
                Support Hub is the AI-first helpdesk for modern teams. Triage,
                summarize, and reply to tickets in seconds — without losing the
                human touch.{" "}
              </p>
              {/* Buttons */}
              <div className="flex flex-wrap items-center justify-start gap-4 w-fit">
                <div>
                  <GradientButton
                    buttonClassName="w-fit rounded-xl px-6"
                    shadow
                    glowClassName="opacity-60 blur-md"
                  >
                    Start free trial
                    <ArrowRight className="h-5 w-5" />
                  </GradientButton>
                </div>

                <GradientButton
                  shadow
                  buttonClassName="px-6 from-primary/5 to-secondary/10 text-base-content/90"
                  glowClassName="opacity-30 blur-xs"
                >
                  View Workflow
                  <Workflow size={16} strokeWidth={2}></Workflow>
                </GradientButton>
              </div>

              {/* Trust Indicators */}
              <div className="mt-7 flex flex-wrap items-center justify-start gap-x-8 gap-y-4 text-xs text-base-content/60">
                {trustItems.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              {/* ================ */}
            </div>
          </div>
          <div className="w-full min-w-0 lg:flex-1">
            <div className="mx-auto w-full max-w-[620px] overflow-hidden">
              <HeroWindow />
            </div>
          </div>
        </div>
        {/* =================== */}

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:mt-10 text-center ">
          <p className="text-xs  uppercase tracking-[0.2em] text-base-content/60">
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
