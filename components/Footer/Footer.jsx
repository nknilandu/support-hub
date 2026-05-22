import {
  Mail,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import GradientText from "../ui/Text/GradientText";
import TextBadge from "../ui/Badge/TextBadge"
import { FaGithub } from "react-icons/fa";
import { TiSocialLinkedin } from "react-icons/ti";
import { RiTwitterXLine } from "react-icons/ri";

const footerLinks = [
  {
    title: "Product",
    links: ["Features", "Pricing", "Security", "Demo"],
  },
  {
    title: "Company",
    links: ["About", "Contact", "Changelog", "Roadmap"],
  },
  {
    title: "Resources",
    links: ["Docs", "API", "Support", "Status"],
  },
];

const socialLinks = [
  {
    label: "Github",
    icon: FaGithub,
    href: "#",
  },
  {
    label: "Twitter",
    icon: RiTwitterXLine,
    href: "#",
  },
  {
    label: "LinkedIn",
    icon: TiSocialLinkedin,
    href: "#",
  },
];

export default function Footer() {
  return (
    <footer className="w-full border-t-0 border-base-content/5 bg-base-100/60">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* Brand area */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-content">
                <Sparkles size={15} strokeWidth={2} />
              </div>

              <span className="text-xl font-semibold tracking-tight text-base-content">
                Support<GradientText>Hub</GradientText>
              </span>
            </div>

            <p className="mt-4 max-w-md text-sm leading-6 text-base-content/70">
              AI-assisted support workspace for teams that need faster triage,
              human-approved replies, and cleaner support workflows.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <TextBadge variant="cyan" size="sm" uppercase={false}>
                AI Support
              </TextBadge>
              <TextBadge variant="green" size="sm" uppercase={false}>
                Human Review
              </TextBadge>
              <TextBadge variant="blue" size="sm" uppercase={false}>
                SaaS Ready
              </TextBadge>
            </div>

            <a
              href="mailto:nknilandu@gmail.com"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-base-content/70 transition hover:text-primary"
            >
              <Mail size={15} strokeWidth={2} />
              support@example.com
            </a>
          </div>

          {/* Links */}
          <div className="grid gap-8 sm:grid-cols-3">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-base-content">
                  {group.title}
                </h3>

                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm text-base-content/60 transition hover:text-primary"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-5 border-t border-base-content/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-base-content/50">
            © {new Date().getFullYear()} SupportHub. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="#"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:gap-2"
            >
              Start free
              <ArrowRight size={14} strokeWidth={2} />
            </a>

            <div className="h-4 w-px bg-base-content/10" />

            <div className="flex items-center gap-2">
              {socialLinks.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-content/10 text-base-content/60 transition hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
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