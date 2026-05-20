import { useEffect, useState } from "react";
import { Link as ScrollLink } from "react-scroll";
import {
  Bell,
  User,
  Mail,
  LogOut,
  Pencil,
  Menu,
  X,
  Moon,
  Sun,
  Bot,
} from "lucide-react";

import { cn } from "../../../src/lib/cn";
import GradientButton from "../../../components/ui/Button/GradientButton";
import GradientText from "../../../components/ui/Text/GradientText";
import TextBadge from "../../../components/ui/Badge/TextBadge";

const navLinks = [
  { label: "Features", to: "features" },
  { label: "Workflow", to: "workflow" },
  { label: "Pricing", to: "pricing" },
  { label: "Security", to: "security" },
];

const loggedInNavLinks = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Pricing", path: "/pricing" },
  { label: "Profile", path: "/profile" },
];

const mobileLoggedInNavLinks = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Notification", to: "/notifications", hasDot: true },
  { label: "Pricing", to: "/pricing" },
  { label: "Profile", to: "/profile" },
];

const user = {
  imageUrl:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBraP-MM0RM-sZ0Qd6JKJEldoTX6k38o_fjg&s",
  name: "Sherlock LC",
  email: "sharlockaj@gmail.com",
};

const notifications = [{ id: 1, title: "New ticket assigned" }];

const hasNotifications = notifications.length > 0;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("supporthub-theme") || "light";

    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    localStorage.setItem("supporthub-theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed left-0 top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "border-b border-base-content/10 bg-base-100/5 shadow-sm shadow-base-content/5 backdrop-blur-lg"
          : "border-b border-transparent bg-base-200 backdrop-blur-md",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <a href="#" onClick={closeMenu} className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-content shadow-sm">
            <div className="absolute inset-0 rounded-xl bg-white/10" />
            <Bot size={18} strokeWidth={2} className="relative z-10" />
          </div>

          <span className="text-lg font-semibold tracking-tight text-base-content">
            Support<GradientText>Hub</GradientText>
          </span>

          <TextBadge
            variant="cyan"
            size="sm"
            uppercase={false}
            className="hidden font-medium md:inline-flex"
          >
            AI Workspace
          </TextBadge>
        </a>

        {/*===================== Desktop  nav ================ */}
        <div className="hidden items-center rounded-2xl border border-base-content/10 bg-base-100/50 px-2 py-1 backdrop-blur-xl lg:flex">
          {loggedInNavLinks.map((index, link) => (
            <ScrollLink
              key={link.to || index}
              to={link.to}
              smooth
              offset={-20}
              duration={500}
              spy
              activeClass="bg-gradient-to-r from-primary/10 to-secondary/10 text-primary rounded-xl"
              className="rounded-xl px-4 py-2 text-sm font-medium text-base-content/65 transition hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/20 hover:text-primary"
            >
              {link.label}
            </ScrollLink>
          ))}
        </div>

        {/*=============== desktop right side ===================*/}
        <div className="hidden items-center gap-3 lg:flex">
          {/* Notification */}
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl  text-base-content/70 backdrop-blur-xl transition hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
          >
            <Bell size={17} strokeWidth={2} />

            {hasNotifications && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-base-100" />
            )}
          </button>

          {/* Theme */}
          <GradientButton
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            shadow
            buttonClassName="px-3 from-base-100 to-base-200 text-base-content/90"
            glowClassName="opacity-30 blur-xs"
          >
            {theme === "dark" ? (
              <Sun size={17} strokeWidth={2} />
            ) : (
              <Moon size={17} strokeWidth={2} />
            )}
          </GradientButton>

          <GradientButton
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            shadow
            className="w-10"
            buttonClassName="p-0 from-base-100 to-base-200 text-base-content/90"
            glowClassName="opacity-30 blur-xs"
          >
            {/* <User size={17} strokeWidth={2} /> */}
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt=""
                className="h-full w-full rounded-xl object-cover object-center"
              />
            ) : (
              <User size={17} strokeWidth={2} />
            )}
          </GradientButton>

          {/* Profile */}
          <div className="relative">
            {isProfileOpen && (
              <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-base-content/10 bg-base-100/95 p-4 shadow-xl backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-content">
                    <User size={17} strokeWidth={2} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-base-content">
                      {user.name}
                    </p>

                    <div className="mt-1 flex items-center gap-1.5 text-xs text-base-content/60">
                      <Mail size={12} strokeWidth={2} />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-base-content/10 bg-base-100 px-3 py-2 text-xs font-semibold text-base-content transition hover:border-primary/30 hover:text-primary"
                  >
                    <Pencil size={13} strokeWidth={2} />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500/15"
                  >
                    <LogOut size={13} strokeWidth={2} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <GradientButton
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            shadow
            buttonClassName="px-3 from-base-100 to-base-200 text-base-content/90"
            glowClassName="opacity-30 blur-xs"
          >
            {theme === "dark" ? (
              <Sun size={17} strokeWidth={2} />
            ) : (
              <Moon size={17} strokeWidth={2} />
            )}
          </GradientButton>

          <GradientButton
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            shadow
            className="relative"
            buttonClassName="px-3 from-base-100 to-base-200 text-base-content/90"
            glowClassName="opacity-30 blur-xs"
          >
            {isOpen ? (
              <X size={17} strokeWidth={2} />
            ) : (
              <Menu size={17} strokeWidth={2} />
            )}

            {hasNotifications && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-base-100" />
            )}
          </GradientButton>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-base-content/10 bg-base-100/10 backdrop-blur-xl transition-all duration-300 lg:hidden",
          isOpen ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="mx-auto max-w-7xl px-6 py-5">
          {/* User info */}
          <div className="flex gap-3 items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-content">
              <User size={17} strokeWidth={2} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-base-content">
                {user.name}
              </p>

              <div className="mt-1 flex items-center gap-1.5 text-xs text-base-content/60">
                <Mail size={12} strokeWidth={2} />
                <span className="truncate">{user.email}</span>
              </div>
            </div>
          </div>

          <div className="my-4 h-px bg-base-content/10" />

          {/* Nav tabs */}
          <div className="flex flex-col gap-2">
            {mobileLoggedInNavLinks.map((link) => (
              <ScrollLink
                key={link.to}
                to={link.to}
                smooth
                offset={-20}
                duration={500}
                onClick={closeMenu}
                spy
                activeClass="bg-gradient-to-r from-primary/10 to-secondary/10 text-primary rounded-xl"
                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-base-content/70 transition hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 hover:text-primary"
              >
                <span>{link.label}</span>

                {link.hasDot && hasNotifications && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                )}
              </ScrollLink>
            ))}
          </div>

          <div className="mt-5">
            <button
              type="button"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 text-sm font-semibold text-red-500 transition hover:bg-red-500/15"
            >
              <LogOut size={15} strokeWidth={2} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
