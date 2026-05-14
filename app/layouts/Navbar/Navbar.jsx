import React, { useEffect, useState } from "react";
import {
  Bot,
  Boxes,
  ChevronRight,
  CircleDollarSign,
  Menu,
  Moon,
  Sparkles,
  Sun,
  X,
  Zap,
} from "lucide-react";

const navItems = [
  { label: "Product", href: "#product", icon: Boxes },
  { label: "AI", href: "#ai", icon: Bot },
  { label: "How it works", href: "#how-it-works", icon: Zap },
  { label: "Pricing", href: "#pricing", icon: CircleDollarSign },
];

const Navbar = () => {
  const [theme, setTheme] = useState("dark");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const isDark = theme === "dark";

  return (
    <header className="fixed left-0 top-0 z-50 w-full px-4 py-4">
      <nav
        className={`relative mx-auto flex max-w-7xl items-center justify-between rounded-[2rem] px-4 py-2.5 transition-all duration-500 ${
          scrolled
            ? "border border-base-content/10 bg-base-100/55 shadow-[0_20px_80px_-24px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
            : "border border-transparent bg-transparent shadow-none"
        }`}
      >
        {/* Soft navbar glow */}
        <div className="pointer-events-none absolute inset-x-10 -bottom-4 -z-10 h-10 rounded-full bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-2xl" />

        {/* Logo */}
        <a href="#" className="group flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary text-primary-content shadow-[0_12px_35px_-12px] shadow-primary/70 transition duration-300 group-hover:scale-105">
            <Sparkles className="h-5 w-5" />

            <div className="absolute inset-0 rounded-2xl border border-white/25" />
            <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 transition group-hover:opacity-100" />
            <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-secondary shadow-[0_0_18px] shadow-secondary" />
          </div>

          <div className="leading-none">
            <h2 className="text-lg font-bold tracking-tight text-base-content">
              Support<span className="text-primary">Hub</span>
            </h2>
            <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.22em] text-base-content/45">
              AI Helpdesk
            </p>
          </div>
        </a>

        {/* Desktop Center Nav */}
        <div className="hidden items-center rounded-full border border-base-content/10 bg-base-100/35 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_55px_-28px_rgba(0,0,0,0.5)] backdrop-blur-2xl lg:flex">
          {navItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <a
                key={item.label}
                href={item.href}
                className={`group relative flex items-center gap-2 overflow-hidden rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  index === 0
                    ? "bg-gradient-to-r from-primary/20 to-secondary/15 text-base-content shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    : "text-base-content/65 hover:bg-base-content/10 hover:text-base-content"
                }`}
              >
                {index === 0 && (
                  <span className="absolute inset-0 rounded-full border border-primary/25" />
                )}

                <Icon
                  className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${
                    index === 0 ? "text-primary" : ""
                  }`}
                />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* Premium Theme Switch */}
          <button
            onClick={toggleTheme}
            className="group relative flex h-11 w-[86px] items-center rounded-full border border-base-content/10 bg-base-100/35 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_14px_40px_-24px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition"
            aria-label="Toggle theme"
          >
            <span
              className={`absolute top-1 h-9 w-9 rounded-full bg-gradient-to-br shadow-lg transition-all duration-300 ${
                isDark
                  ? "left-1 translate-x-0 from-primary to-secondary shadow-primary/40"
                  : "left-1 translate-x-[42px] from-warning to-secondary shadow-warning/30"
              }`}
            />

            <span className="relative z-10 flex w-full items-center justify-between px-2">
              <Moon
                className={`h-4 w-4 transition ${
                  isDark ? "text-primary-content" : "text-base-content/35"
                }`}
              />
              <Sun
                className={`h-4 w-4 transition ${
                  isDark ? "text-base-content/35" : "text-primary-content"
                }`}
              />
            </span>
          </button>

          <button className="btn btn-ghost rounded-full px-5 font-semibold text-base-content hover:bg-base-content/10">
            Sign in
          </button>

          <button className="btn group rounded-full border-0 bg-gradient-to-r from-primary to-secondary px-6 text-primary-content shadow-[0_16px_45px_-16px] shadow-primary/70 transition hover:scale-[1.03] hover:shadow-[0_20px_55px_-16px] hover:shadow-secondary/60">
            Get Started
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="btn btn-circle border border-base-content/10 bg-base-100/35 shadow-[0_14px_40px_-24px_rgba(0,0,0,0.6)] backdrop-blur-2xl lg:hidden"
          aria-label="Open menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Dropdown */}
      {open && (
        <div className="mx-auto mt-4 max-w-7xl overflow-hidden rounded-3xl border border-base-content/10 bg-base-100/80 p-4 shadow-[0_25px_90px_-30px_rgba(0,0,0,0.65)] backdrop-blur-2xl lg:hidden">
          <div className="pointer-events-none absolute left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative z-10 grid gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-base-content/75 transition hover:bg-base-content/10 hover:text-base-content"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    {item.label}
                  </span>

                  <ChevronRight className="h-4 w-4 text-base-content/35" />
                </a>
              );
            })}
          </div>

          <div className="relative z-10 mt-4 flex flex-col gap-3 border-t border-base-content/10 pt-4 sm:flex-row">
            <button
              onClick={toggleTheme}
              className="btn flex-1 rounded-2xl border border-base-content/10 bg-base-100/40"
            >
              {isDark ? (
                <>
                  <Sun className="h-5 w-5 text-warning" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5 text-primary" />
                  Dark Mode
                </>
              )}
            </button>

            <button className="btn flex-1 rounded-2xl border-0 bg-gradient-to-r from-primary to-secondary text-primary-content shadow-lg shadow-primary/30">
              Get Started
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;