import { useContext, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router";
import logo from "../../../src/assets/logo.png";
import GradientText from "../../../components/ui/Text/GradientText";

import {
  LayoutGrid,
  Ticket,
  PlusCircle,
  Sparkles,
  User,
  Users,
  UserRound,
  CreditCard,
  BarChart3,
  History,
  Settings,
  Building2,
  Activity,
  PanelLeftOpen,
  PanelLeftClose,
  X,
  Menu,
  Bell,
  Moon,
  Sun,
} from "lucide-react";
import GradientButton from "../../../components/ui/Button/GradientButton";
import CardWithBlurBlob from "../../../components/ui/Card/CardWithBlurBlob";
import { AuthContext } from "../../providers/AuthProvider";
import LoadingPage from "../../../pages/loading/LoadingPage/LoadingPage";
import TextBadge from "../../../components/ui/Badge/TextBadge";

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const { user, loading, userRole } = useContext(AuthContext);

  const notifications = [{ id: 1, title: "New ticket assigned" }];
  const hasNotifications = notifications.length > 0;

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  // ======== nav item =======
  const dashboardNav = {
    customer: [
      {
        label: "Dashboard",
        icon: LayoutGrid,
        path: "/customer/dashboard",
      },
      {
        label: "My Tickets",
        icon: Ticket,
        path: "/customer/tickets",
      },
      {
        label: "New Ticket",
        icon: PlusCircle,
        path: "/customer/tickets/new",
      },
      {
        label: "AI Assistant",
        icon: Sparkles,
        path: "/support",
      },
      {
        label: "Profile",
        icon: User,
        path: "/settings/profile",
      },
    ],

    agent: [
      {
        label: "Dashboard",
        icon: LayoutGrid,
        path: "/agent/dashboard",
      },
      {
        label: "My Tickets",
        icon: Ticket,
        path: "/agent/tickets",
      },
      {
        label: "Activity",
        icon: Activity,
        path: "/agent/activity",
      },
      {
        label: "AI Assistant",
        icon: Sparkles,
        path: "/agent/ai-assistant",
      },
      {
        label: "Profile",
        icon: User,
        path: "/settings/profile",
      },
    ],

    owner: [
      {
        label: "Dashboard",
        icon: LayoutGrid,
        path: "/owner/dashboard",
      },
      {
        label: "Tickets",
        icon: Ticket,
        path: "/owner/tickets",
      },
      {
        label: "Agents",
        icon: Users,
        path: "/owner/agents",
      },
      {
        label: "Customers",
        icon: UserRound,
        path: "/owner/customers",
      },
      {
        label: "Billing",
        icon: CreditCard,
        path: "/owner/billing",
      },
      {
        label: "Usage",
        icon: BarChart3,
        path: "/owner/usage",
      },
      {
        label: "Activity Logs",
        icon: History,
        path: "/owner/activity-logs",
      },
      {
        label: "Settings",
        icon: Settings,
        path: "/owner/settings",
      },
    ],

    platform: [
      {
        label: "Organizations",
        icon: Building2,
        path: "/platform/organizations",
      },
      {
        label: "Metrics",
        icon: BarChart3,
        path: "/platform/metrics",
      },
    ],
  };

  const navItems = dashboardNav[userRole] || [];

  // get first name
  const getFirstName = (fullName) => {
    if (!fullName) return "there";
    return fullName.trim().split(" ")[0];
  };

  // +++++++++++ control theme +++++++++++++++++
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <div className="h-screen overflow-hidden bg-base-200/40">
      <div className="flex h-full">
        {/* ============================= */}
        {/* MOBILE OVERLAY */}
        {/* ============================= */}

        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm xl:hidden"
          />
        )}

        {/* ============================= */}
        {/* SIDEBAR */}
        {/* ============================= */}

        <aside
          style={{
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
          className={`
            fixed left-0 top-0 z-50 flex h-screen flex-col
            border-r border-base-content/10
            bg-base-100/95 backdrop-blur-xl
            transition-all duration-300

            w-[85vw] max-w-[320px]

            xl:static
            xl:max-w-none
            ${collapsed ? "xl:w-[64px]" : "xl:w-[260px]"}

            ${
              mobileOpen
                ? "translate-x-0"
                : "-translate-x-full xl:translate-x-0"
            }
          `}
        >
          {/* ============================= */}
          {/* LOGO */}
          {/* ============================= */}

          <div className="flex items-center border-b border-base-content/10 px-3 py-4 justify-center ">
            <div
              className={`flex w-full items-center gap-3 ${collapsed ? "justify-center" : "justify-between"}`}
            >
              {collapsed || (
                <div className="flex justify-center items-center gap-2">
                  <img
                    src={logo}
                    alt="logo"
                    className="h-7 w-7 object-contain"
                  />

                  <div className="w-full">
                    <h2 className="truncate text-sm font-semibold leading-none">
                      Support<GradientText>Hub</GradientText>
                    </h2>

                    <p className="truncate text-xs text-base-content/50">
                      AI Workspace
                    </p>
                  </div>
                </div>
              )}

              {/* desktop collapse */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden xl:flex btn btn-square btn-sm rounded-lg"
              >
                {collapsed ? (
                  <PanelLeftOpen size={17} />
                ) : (
                  <PanelLeftClose size={17} />
                )}
              </button>
            </div>

            {/* mobile close */}
            <button
              onClick={() => setMobileOpen(false)}
              className="btn btn-square rounded-xl btn-sm xl:hidden"
            >
              <X size={16} />
            </button>
          </div>

          {/* ============================= */}
          {/* NAVIGATION */}
          {/* ============================= */}

          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-1">
              {loading || !userRole ? (
                <>
                  <div className="h-11 rounded-xl skeleton" />
                  <div className="h-11 rounded-xl skeleton mt-2" />
                  <div className="h-11 rounded-xl skeleton mt-2" />
                  <div className="h-11 rounded-xl skeleton mt-2" />
                  <div className="h-11 rounded-xl skeleton mt-2" />
                </>
              ) : (
                navItems?.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.label}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `
                relative flex items-center rounded-xl
                px-3 py-3 text-sm transition-all

                ${
                  isActive
                    ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-base-content"
                    : "text-base-content/70 hover:bg-base-200"
                }

                ${collapsed ? "xl:justify-center xl:px-0" : "gap-3"}
              `
                      }
                    >
                      <Icon size={18} className="shrink-0" />

                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  );
                })
              )}
            </div>
          </div>

          {/* ============================= */}
          {/* AI CARD */}
          {/* ============================= */}

          {loading ||
            (!collapsed && (
              <div className="p-3">
                <CardWithBlurBlob className="p-3">
                  <div className="flex items-center gap-3">
                    <img src={logo} alt="logo" className="h-8 w-8" />

                    <div className="min-w-0">
                      <h3 className="truncate text-xs font-semibold">
                        AI Assistant
                      </h3>

                      <p className="truncate text-[10px] text-base-content/50">
                        First-response suggestions
                      </p>
                    </div>
                  </div>

                  <GradientButton
                    className="mt-3 w-full"
                    buttonClassName="btn-sm w-full"
                  >
                    Ask AI
                  </GradientButton>
                </CardWithBlurBlob>
              </div>
            ))}
        </aside>

        {/* ============================= */}
        {/* MAIN AREA */}
        {/* ============================= */}

        <div className="flex min-w-0 flex-1 flex-col">
          {/* ============================= */}
          {/* TOPBAR HEADER */}
          {/* ============================= */}

          <header className="sticky top-0 z-30 border-b border-base-content/10 bg-base-100/80 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 lg:px-6">
              {/* left */}
              <div className="flex items-center gap-3 min-w-0">
                {/* mobile menu */}
                <button
                  onClick={() => setMobileOpen(true)}
                  className="btn btn-square rounded-xl btn-sm xl:hidden h-9 w-9"
                >
                  <Menu size={17} />
                </button>

                {/* header */}
                <div className="xl:flex flex-col min-w-0 flex-1">
                  <h1 className="flex items-center text-xl font-semibold tracking-tight">
                    <span className="mr-1">Welcome back,</span>

                    {loading ? (
                      <div className="mx-1 h-5 w-12 skeleton" />
                    ) : (
                      <GradientText className="capitalize">
                        {getFirstName(user?.displayName)}
                      </GradientText>
                    )}

                    {!loading && userRole && (
                      <TextBadge
                        className="ml-2 mt-1"
                        size="sm"
                        variant={
                          userRole.toLowerCase() === "owner"
                            ? "pink"
                            : userRole.toLowerCase() === "agent"
                              ? "green"
                              : "cyan"
                        }
                      >
                        {userRole}
                      </TextBadge>
                    )}
                  </h1>
                  <p className="text-xs text-base-content/60 truncate">
                    Track and continue with support agents.
                  </p>
                </div>
              </div>

              {/* right */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTheme}
                  aria-label="Toggle theme"
                  className="h-10 w-10 flex justify-center items-center rounded-xl border border-base-content/10 text-base-content/70 backdrop-blur-xl transition hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                >
                  {theme === "dark" ? (
                    <Sun size={17} strokeWidth={2} />
                  ) : (
                    <Moon size={17} strokeWidth={2} />
                  )}
                </button>
                {loading ? (
                  <>
                    <div className="h-10 w-10 skeleton rounded-xl" />
                    <div className="h-10 w-10 skeleton rounded-xl" />
                  </>
                ) : (
                  <>
                    <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-base-content/10 text-base-content/70 backdrop-blur-xl transition hover:border-primary/30 hover:bg-primary/10 hover:text-primary">
                      <Bell size={16} />
                      {hasNotifications && (
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-base-100" />
                      )}
                    </button>

                    {/* profile */}
                    <button className="btn btn-square rounded-xl border border-base-content/10 bg-base-100 overflow-hidden">
                      <img
                        src={user?.photoURL}
                        alt="user icon"
                        className="object-cover object-center"
                      />
                    </button>
                  </>
                )}

                {/* Notification */}
              </div>
            </div>
          </header>

          {/* ============================= */}
          {/* PAGE CONTENT */}
          {/* ============================= */}

          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            {loading ? <LoadingPage></LoadingPage> : <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
