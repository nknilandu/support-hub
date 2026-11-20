import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Link as ScrollLink, scroller } from "react-scroll";
import {
  FileText,
  ShieldCheck,
  ArrowLeft,
  Scale,
  Lock,
  Sparkles,
  CreditCard,
  Users,
  Database,
  KeyRound,
  Mail,
} from "lucide-react";
import Badge from "@/components/ui/Badge/PromoBadge";
import GradientText from "@/components/ui/Text/GradientText";
import SoftIconCard from "@/components/ui/Card/SoftIconCard";
import CardWithBlurBlob from "@/components/ui/Card/CardWithBlurBlob";

const termsItems = [
  {
    title: "1. Workspace Accounts & Role Access",
    description:
      "SupportHub organizes access across Owner, Manager, Agent, and Customer roles. Workspace owners and managers are responsible for reviewing staff join requests and managing role assignments within their company.",
    icon: Users,
    variant: "orange",
  },
  {
    title: "2. AI-Assisted Features & Human Control",
    description:
      "AI features—including AI First Response, automated triage, root-cause diagnostics, and Suggest Reply—are designed to assist support workflows. Agents and teams remain responsible for reviewing outbound communications.",
    icon: Sparkles,
    variant: "cyan",
  },
  {
    title: "3. Subscriptions, Quotas & Billing",
    description:
      "Workspaces operate under Starter, Growth, Scale, or Enterprise monthly limits for managers, agents, tickets, and AI replies. Paid plans are billed securely via Stripe and can be upgraded or managed from the Owner billing dashboard.",
    icon: CreditCard,
    variant: "pink",
  },
  {
    title: "4. Acceptable Use & Fair Limits",
    description:
      "You agree not to misuse API endpoints, bypass workspace quotas, attempt unauthorized cross-company access, or submit unlawful or abusive content through support tickets.",
    icon: Scale,
    variant: "blue",
  },
];

const privacyItems = [
  {
    title: "1. Information We Collect",
    description:
      "We collect account details (name, email, profile photo, role, and company affiliation) via Firebase Authentication, along with support tickets, messages, and workspace activity logs needed to run your helpdesk.",
    icon: Database,
    variant: "green",
  },
  {
    title: "2. Company-Scoped Data Isolation",
    description:
      "Every ticket, team member, and conversation is strictly scoped to its organization (companyId). Users can only access records permitted by their assigned role and active workspace membership.",
    icon: Lock,
    variant: "cyan",
  },
  {
    title: "3. AI Processing & Backend Key Security",
    description:
      "Ticket descriptions and conversation prompts sent for AI triage or reply suggestions are processed exclusively on our backend servers. AI provider API keys are never exposed to client browsers.",
    icon: KeyRound,
    variant: "purple",
  },
  {
    title: "4. Payment Security & Contact",
    description:
      "Payment card details are handled directly by Stripe—SupportHub only stores subscription status, plan tier, and transaction references. For privacy or data removal inquiries, contact nknilandu@gmail.com.",
    icon: ShieldCheck,
    variant: "orange",
  },
];

export default function LegalPage() {
  const { hash } = useLocation();

  useEffect(() => {
    const targetId = hash ? hash.replace("#", "") : "terms";
    const timer = setTimeout(() => {
      scroller.scrollTo(targetId, {
        smooth: true,
        offset: -96,
        duration: 500,
      });
    }, 80);

    return () => clearTimeout(timer);
  }, [hash]);

  return (
    <div className="min-h-screen bg-base-200/30 pb-24 pt-24">
      <div className="mx-auto max-w-5xl px-6">
        {/* Top back link + header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-base-content/60 transition hover:text-primary"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>
        </div>

        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <Badge icon={Scale} text="Legal & Compliance" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-base-content md:text-5xl">
            Terms &amp; <GradientText>Privacy Policy</GradientText>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-base-content/70 md:text-base">
            Clear guidelines on how SupportHub workspaces operate, how AI
            assistance is governed, and how your organization&apos;s data stays
            isolated and protected.
          </p>

          {/* Smooth Scroll Section Switcher */}
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-base-content/10 bg-base-100/80 p-1.5 shadow-xs backdrop-blur-xl">
            <ScrollLink
              to="terms"
              smooth
              offset={-96}
              duration={500}
              spy
              activeClass="bg-gradient-to-r from-primary/15 to-secondary/15 text-primary font-semibold"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-base-content/70 transition hover:bg-base-content/5 hover:text-base-content"
            >
              <FileText size={15} />
              Terms &amp; Conditions
            </ScrollLink>

            <ScrollLink
              to="privacy"
              smooth
              offset={-96}
              duration={500}
              spy
              activeClass="bg-gradient-to-r from-primary/15 to-secondary/15 text-primary font-semibold"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-base-content/70 transition hover:bg-base-content/5 hover:text-base-content"
            >
              <ShieldCheck size={15} />
              Privacy Policy
            </ScrollLink>
          </div>
        </div>

        {/* ============================= */}
        {/* TERMS & CONDITIONS SECTION    */}
        {/* ============================= */}
        <section id="terms" className="mt-16 scroll-mt-24">
          <div className="mb-6 flex flex-col justify-between gap-2 border-b border-base-content/10 pb-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Section 01
              </span>
              <h2 className="mt-1 text-2xl font-semibold text-base-content">
                Terms &amp; Conditions
              </h2>
            </div>
            <p className="text-xs text-base-content/50">
              Effective Date: November 2026
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {termsItems.map(({ title, description, icon: Icon, variant }) => (
              <CardWithBlurBlob key={title} className="h-full p-6">
                <SoftIconCard
                  icon={Icon}
                  variant={variant}
                  className="mb-4 h-10 w-10"
                  size={18}
                  strokeWidth={2}
                />
                <h3 className="text-base font-semibold text-base-content">
                  {title}
                </h3>
                <p className="mt-2.5 text-sm leading-6 text-base-content/70">
                  {description}
                </p>
              </CardWithBlurBlob>
            ))}
          </div>
        </section>

        {/* ============================= */}
        {/* PRIVACY POLICY SECTION        */}
        {/* ============================= */}
        <section id="privacy" className="mt-20 scroll-mt-24">
          <div className="mb-6 flex flex-col justify-between gap-2 border-b border-base-content/10 pb-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                Section 02
              </span>
              <h2 className="mt-1 text-2xl font-semibold text-base-content">
                Privacy Policy
              </h2>
            </div>
            <p className="text-xs text-base-content/50">
              Last Updated: November 2026
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {privacyItems.map(({ title, description, icon: Icon, variant }) => (
              <CardWithBlurBlob key={title} className="h-full p-6">
                <SoftIconCard
                  icon={Icon}
                  variant={variant}
                  className="mb-4 h-10 w-10"
                  size={18}
                  strokeWidth={2}
                />
                <h3 className="text-base font-semibold text-base-content">
                  {title}
                </h3>
                <p className="mt-2.5 text-sm leading-6 text-base-content/70">
                  {description}
                </p>
              </CardWithBlurBlob>
            ))}
          </div>
        </section>

        {/* Contact Box */}
        <div className="mt-14 rounded-2xl border border-base-content/10 bg-base-100/80 p-6 text-center shadow-xs">
          <p className="text-sm text-base-content/75">
            Have questions about our Terms or Privacy practices?
          </p>
          <a
            href="mailto:nknilandu@gmail.com"
            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:underline"
          >
            <Mail size={15} />
            nknilandu@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
