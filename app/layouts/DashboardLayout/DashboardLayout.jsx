import { useContext, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
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
  Mail,
  Pencil,
  LogOut,
} from "lucide-react";
import GradientButton from "../../../components/ui/Button/GradientButton";
import CardWithBlurBlob from "../../../components/ui/Card/CardWithBlurBlob";
import { AuthContext } from "../../providers/AuthProvider";
import LoadingPage from "../../../pages/loading/LoadingPage/LoadingPage";
import TextBadge from "../../../components/ui/Badge/TextBadge";
import Swal from "sweetalert2";
import { useQuery } from "@tanstack/react-query";

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const { user, loading, logOut, fetchUserRole } = useContext(AuthContext);
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  // ============ fetching user role ==============
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!user) {
      setUserRole(null);
      return;
    }

    const loadRole = async () => {
      const role = await fetchUserRole(user);
      setUserRole(role);
    };
    loadRole();
   
  }, [user, fetchUserRole]);

  // ============ fatching notification =============
  const { data: notifications } = useQuery({
    queryKey: ["customerDashboardNotification"],
    enabled: !!user?.accessToken,
    queryFn: async () => {
      const res = await fetch("http://localhost:3021/notifications?limit=3", {
        headers: {
          authorization: `Bearer ${user.accessToken}`,
        },
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch tickets");
      }
      return result.notifications;
    },
  });
  const hasNotifications = notifications?.length > 0;

  // ======== nav item =========
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
        path: "/customer/ai-assistant",
      },
      {
        label: "Profile",
        icon: User,
        path: "/customer/profile",
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

  // ++++++++ logOut ++++++++++++
  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        logOut()
          .then(() => {
            Swal.fire({
              title: "Logged out!",
              text: "You have been logged out successfully.",
              icon: "success",
            });

            setUserRole(null);
            navigate("/login");
          })
          .catch((error) => {
            Swal.fire("Error", error.message, "error");
          });
      }
    });
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
                <Link to="/" className="flex justify-center items-center gap-2">
                  <img
                    src={logo}
                    alt="logo"
                    className="h-7 w-7 object-center object-cover"
                  />

                  <div className="w-full">
                    <h2 className="truncate text-sm font-semibold leading-none">
                      Support<GradientText>Hub</GradientText>
                    </h2>

                    <p className="truncate text-xs text-base-content/50">
                      AI Workspace
                    </p>
                  </div>
                </Link>
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
                      end={item.path === "/customer/tickets"}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `
                relative flex items-center rounded-xl
                px-3 py-3 text-sm transition-all

                ${
                  isActive
                    ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-base-content"
                    : "text-base-content/70 hover:bg-base-300"
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

          {!loading && userRole && !collapsed && (
            <div className="p-3">
              <CardWithBlurBlob className="p-3">
                <div className="flex items-center gap-3">
                  <img
                    src={logo}
                    alt="logo"
                    className="h-8 w-8 object-center object-cover"
                  />

                  <div className="min-w-0">
                    <h3 className="truncate text-xs font-semibold">
                      AI Assistant
                    </h3>

                    <p className="truncate text-[10px] text-base-content/50">
                      First-response suggestions
                    </p>
                  </div>
                </div>

                <Link to={`${userRole}/ai-assistant`}>
                <GradientButton
                  className="mt-3 w-full"
                  buttonClassName="btn-sm w-full"
                >
                  Ask AI
                </GradientButton>
                </Link>

                
              </CardWithBlurBlob>
            </div>
          )}
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
                  <h1 className="flex items-center text-xl font-semibold tracking-tight truncate">
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

                    {/* ===================== profile button ====================*/}
                    <button
                      onClick={() => setIsProfileOpen((prev) => !prev)}
                      className="btn btn-square rounded-xl border border-base-content/10 bg-base-100 overflow-hidden"
                    >
                      <img
                        src={user?.photoURL}
                        alt="user icon"
                        className="w-full h-full object-cover object-center"
                      />
                    </button>

                    {/* ========================= Profile Menu ======================== */}
                    <div className="relative">
                      {isProfileOpen && (
                        <div className="absolute right-3 top-10 z-50 w-72 rounded-2xl border border-base-content/10 bg-base-100 p-4 shadow-xl backdrop-blur-xl">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-base-200 border text-primary/20">
                              {user.photoURL ? (
                                <img
                                  src={user.photoURL}
                                  alt="userPhoto"
                                  className="h-full w-full rounded-full object-cover object-center"
                                />
                              ) : (
                                <User size={17} strokeWidth={2} />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-base-content">
                                {user.displayName}
                              </p>

                              <div className="mt-1 flex items-center gap-1.5 text-xs text-base-content/60">
                                <Mail size={12} strokeWidth={2} />
                                <span className="truncate">{user.email}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2">
                            {userRole !== null && (
                              <Link
                                to={`${userRole}/profile`}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-base-content/10 bg-base-100 px-3 py-2 text-xs font-semibold text-base-content transition hover:border-primary/30 hover:text-primary"
                              >
                                <Pencil size={13} strokeWidth={2} />
                                Edit
                              </Link>
                            )}

                            <button
                              type="button"
                              onClick={handleLogout}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500/15"
                            >
                              <LogOut size={13} strokeWidth={2} />
                              Logout
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
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
