import { Link, useLocation, useNavigate } from "react-router";
import { scroller } from "react-scroll";
import {
  Mail,
  ArrowRight,
  Sparkles,
  Crown,
  ShieldCheck,
  Headphones,
  UserRound,
} from "lucide-react";
import { FaGithub, FaFacebook } from "react-icons/fa";
import { TiSocialLinkedin } from "react-icons/ti";
import GradientText from "@/components/ui/Text/GradientText";
import TextBadge from "@/components/ui/Badge/TextBadge";

const productLinks = [
  { label: "Features", to: "features" },
  { label: "Workflow", to: "workflow" },
  { label: "Pricing", to: "pricing" },
  { label: "Security", to: "security" },
];

const workspaceLinks = [
  { label: "Create Workspace", path: "/register" },
  { label: "Sign In", path: "/login" },
  { label: "Notifications", path: "/notifications" },
  { label: "Profile Settings", path: "/profile" },
];

const legalLinks = [
  { label: "Terms & Conditions", path: "/legal#terms" },
  { label: "Privacy Policy", path: "/legal#privacy" },
];

const roleBadges = [
  { label: "Owner", variant: "orange", icon: Crown },
  { label: "Manager", variant: "pink", icon: ShieldCheck },
  { label: "Agent", variant: "cyan", icon: Headphones },
  { label: "Customer", variant: "green", icon: UserRound },
];

const socialLinks = [
  {
    label: "GitHub",
    icon: FaGithub,
    href: "https://github.com/nknilandu",
  },
  {
    label: "LinkedIn",
    icon: TiSocialLinkedin,
    href: "https://www.linkedin.com/in/nilandu",
  },
  {
    label: "Facebook",
    icon: FaFacebook,
    href: "https://www.facebook.com/nknilandu",
  },
];

export default function Footer() {
  const logo = "/logo.png";
  const location = useLocation();
  const navigate = useNavigate();

  const handleSectionScroll = (sectionId) => {
    if (location.pathname === "/") {
      scroller.scrollTo(sectionId, {
        smooth: true,
        offset: -20,
        duration: 500,
      });
    } else {
      navigate("/");
      setTimeout(() => {
        scroller.scrollTo(sectionId, {
          smooth: true,
          offset: -20,
          duration: 500,
        });
      }, 120);
    }
  };

  return (
    <footer className="w-full border-t border-base-content/10 bg-base-100/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
          {/* Brand area */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img
                src={logo}
                alt="SupportHub logo"
                className="h-8 w-8 object-cover object-center"
              />

              <span className="text-xl font-bold tracking-tight text-base-content">
                Support<GradientText>Hub</GradientText>
              </span>

              <TextBadge
                variant="info"
                size="sm"
                className="gap-1 border-none px-2.5 py-1 font-semibold normal-case"
              >
                <Sparkles size={10} strokeWidth={2.3} />
                <span className="mt-px">AI Workshop</span>
              </TextBadge>
            </Link>

            <p className="mt-4 max-w-md text-sm leading-6 text-base-content/70">
              AI-assisted customer support workspace built for instant first
              responses, automated root-cause triage, and real-time human
              collaboration.
            </p>

            {/* Role badges */}
            <div className="mt-5 flex flex-wrap gap-2">
              {roleBadges.map(({ label, variant, icon: Icon }) => (
                <TextBadge
                  key={label}
                  variant={variant}
                  size="sm"
                  className="gap-1 border-none px-2.5 py-1 font-semibold normal-case"
                >
                  <Icon size={10} strokeWidth={2.3} />
                  <span className="mt-px">{label}</span>
                </TextBadge>
              ))}
            </div>

            <a
              href="mailto:nknilandu@gmail.com"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-base-content/70 transition hover:text-primary"
            >
              <Mail size={15} strokeWidth={2} className="text-primary" />
              nknilandu@gmail.com
            </a>
          </div>

          {/* Navigation Columns */}
          <div className="grid gap-8 sm:grid-cols-3">
            {/* Product (Scroll Links) */}
            <div>
              <h3 className="text-sm font-semibold text-base-content">
                Product
              </h3>

              <ul className="mt-4 space-y-3">
                {productLinks.map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => handleSectionScroll(item.to)}
                      className="cursor-pointer text-sm text-base-content/60 transition hover:text-primary"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Workspace (Router Links) */}
            <div>
              <h3 className="text-sm font-semibold text-base-content">
                Workspace
              </h3>

              <ul className="mt-4 space-y-3">
                {workspaceLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className="text-sm text-base-content/60 transition hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-base-content">Legal</h3>

              <ul className="mt-4 space-y-3">
                {legalLinks.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className="text-sm text-base-content/60 transition hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-4 border-t border-base-content/10 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/55">
            <span className="text-sm">
              © {new Date().getFullYear()} SupportHub. All rights reserved.
            </span>
            <span className="text-base-content/30">•</span>
            <span>
              Built by{" "}
              <a
                href="https://github.com/nknilandu"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-base-content/75 transition hover:text-primary"
              >
                Nilandu Kumar Das Vapon
              </a>
            </span>
            <span className="text-base-content/30">•</span>
            <Link to="/legal#terms" className="transition hover:text-primary">
              Terms
            </Link>
            <span className="text-base-content/30">•</span>
            <Link to="/legal#privacy" className="transition hover:text-primary">
              Privacy
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:gap-2"
            >
              Start free
              <ArrowRight size={14} strokeWidth={2.2} />
            </Link>

            <div className="h-4 w-px bg-base-content/10" />

            <div className="flex items-center gap-2">
              {socialLinks.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-base-content/10 bg-base-200/50 text-base-content/65 transition hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
