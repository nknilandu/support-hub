import { useContext, useEffect, useRef, useState } from "react";
import { Link as ScrollLink } from "react-scroll";
import {
  User,
  Mail,
  LogOut,
  Pencil,
  Menu,
  X,
  Moon,
  Sun,
  Bot,
  CheckCheck,
  ChevronRight,
  Bell,
  Sparkles,
} from "lucide-react";

import { cn } from "../../src/lib/cn";
import GradientButton from "../ui/Button/GradientButton";
import GradientText from "../ui/Text/GradientText";
import TextBadge from "../ui/Badge/TextBadge";
import { AuthContext } from "../../app/providers/AuthProvider";
import { Link, NavLink, useNavigate } from "react-router";
import Swal from "sweetalert2";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const navLinks = [
  { label: "Features", to: "features" },
  { label: "Workflow", to: "workflow" },
  { label: "Pricing", to: "pricing" },
  { label: "Security", to: "security" },
];

const navByRole = {
  manager: [
    { label: "Dashboard", path: "/manager/dashboard" },
    { label: "Tickets", path: "/manager/tickets" },
    { label: "Employees", path: "/manager/employees" },
    { label: "Company", path: "/manager/company" },
  ],
  owner: [
    { label: "Dashboard", path: "/owner/dashboard" },
    { label: "Tickets", path: "/owner/tickets" },
    { label: "Agents", path: "/owner/agents" },
    { label: "Customers", path: "/owner/customers" },
  ],
  agent: [
    { label: "Dashboard", path: "/agent/dashboard" },
    { label: "Company Tickets", path: "/agent/tickets" },
    { label: "My Tickets", path: "/agent/my-tickets" },
    { label: "AI Assistant", path: "/agent/ai-assistant" },
  ],
  customer: [
    { label: "Dashboard", path: "/customer/dashboard" },
    { label: "My Tickets", path: "/customer/tickets" },
    { label: "New Ticket", path: "/customer/tickets/new" },
    { label: "AI Assistant", path: "/customer/ai-assistant" },
  ],
  platform: [
    { label: "Dashboard", path: "/platform/dashboard" },
    { label: "Organizations", path: "/platform/organizations" },
    { label: "Tickets", path: "/platform/tickets" },
    { label: "Metrics", path: "/platform/metrics" },
  ],
  platform_admin: [
    { label: "Dashboard", path: "/platform/dashboard" },
    { label: "Organizations", path: "/platform/organizations" },
    { label: "Tickets", path: "/platform/tickets" },
    { label: "Metrics", path: "/platform/metrics" },
  ],
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return "";
  const diffSec = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000,
  );
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateString).toLocaleDateString();
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const { user, loading, logOut, fetchUserRole } = useContext(AuthContext);
  const [userRole, setUserRole] = useState(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isAuthenticated = !loading && Boolean(user);
  const links = isAuthenticated && userRole ? navByRole[userRole] || [] : [];

  // =========== Fetching userRole ===============
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

  // =========== Close dropdowns on outside click ===========
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============ Fetching notifications =============
  const { data: notifData } = useQuery({
    queryKey: ["userNotifications", user?.uid],
    enabled: isAuthenticated,
    refetchInterval: 30000,
    queryFn: async () => {
      const token = await user.getIdToken();
      const res = await fetch("http://localhost:3021/notifications?limit=10", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch notifications");
      }
      return result;
    },
  });

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;

  // ============ Mark single notification as read =============
  const markOneReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const token = await user.getIdToken();
      const res = await fetch(
        `http://localhost:3021/notifications/${notificationId}`,
        {
          method: "PATCH",
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to update notification");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userNotifications", user?.uid],
      });
      queryClient.invalidateQueries({
        queryKey: ["notificationsPage", user?.uid],
      });
    },
  });

  // ============ Mark all notifications as read =============
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const token = await user.getIdToken();
      const res = await fetch("http://localhost:3021/notifications/read-all", {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to mark all as read");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userNotifications", user?.uid],
      });
      queryClient.invalidateQueries({
        queryKey: ["notificationsPage", user?.uid],
      });
    },
  });

  const handleNotificationClick = (item) => {
    if (!item.isRead) {
      markOneReadMutation.mutate(item._id);
    }
    setIsNotifOpen(false);
    setIsOpen(false);
    if (item.path) {
      navigate(item.path);
    }
  };

  // +++++++++++ Control theme +++++++++++++++++
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  // ========= Scroll control ==============
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => {
    setIsOpen(false);
  };

  // ++++++++ LogOut ++++++++++++
  const handleLogout = () => {
    setIsProfileOpen(false);
    setIsOpen(false);

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

  const formattedRole = userRole
    ? userRole.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  return (
    <header
      className={cn(
        "fixed left-0 top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "border-b border-base-content/10 bg-base-100/80 shadow-sm shadow-base-content/5 backdrop-blur-xl"
          : "border-b border-transparent bg-base-200/80 backdrop-blur-md",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-content shadow-sm">
            <div className="absolute inset-0 rounded-xl bg-white/10" />
            <Bot size={18} strokeWidth={2.2} className="relative z-10" />
          </div>

          <span className="text-lg font-bold tracking-tight text-base-content">
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
        </Link>

        {/* ===================== Desktop nav ================ */}
        <div className="hidden items-center gap-1 rounded-2xl border border-base-content/10 bg-base-100/60 p-1 shadow-xs backdrop-blur-xl lg:flex">
          {isAuthenticated
            ? links.map((link, i) => (
                <NavLink
                  key={i}
                  to={link.path}
                  end={
                    link.path === "/customer/tickets" ||
                    link.path === "/agent/tickets"
                  }
                  className={({ isActive }) =>
                    cn(
                      "rounded-xl px-4 py-1.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-primary/15 to-secondary/15 font-semibold text-primary shadow-2xs"
                        : "text-base-content/70 hover:bg-base-content/5 hover:text-base-content",
                    )
                  }
                >
                  {link.label}
                </NavLink>
              ))
            : navLinks.map((link, i) => (
                <ScrollLink
                  key={i}
                  to={link.to}
                  smooth
                  offset={-20}
                  duration={500}
                  spy
                  activeClass="bg-gradient-to-r from-primary/15 to-secondary/15 text-primary font-semibold rounded-xl"
                  className="cursor-pointer rounded-xl px-4 py-1.5 text-sm font-medium text-base-content/70 transition-all duration-200 hover:bg-base-content/5 hover:text-base-content"
                >
                  {link.label}
                </ScrollLink>
              ))}
        </div>

        {/* =============== Desktop right side =================== */}
        <div className="hidden items-center gap-2.5 lg:flex">
          {loading ? (
            <span className="loading loading-spinner loading-sm text-primary"></span>
          ) : isAuthenticated ? (
            <>
              {/* Notification Bell + Dropdown */}
              <div ref={notifRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotifOpen((prev) => !prev);
                    setIsProfileOpen(false);
                  }}
                  aria-label="Notifications"
                  className={cn(
                    "relative flex h-10 w-10 items-center justify-center rounded-xl border border-base-content/10 bg-base-100/70 text-base-content/75 transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary",
                    isNotifOpen &&
                      "border-primary/40 bg-primary/10 text-primary",
                  )}
                >
                  <Bell size={17} strokeWidth={2} />

                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-base-100">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 top-12 z-50 w-96 overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 shadow-2xl">
                    {/* Dropdown Header */}
                    <div className="flex items-center justify-between border-b border-base-content/10 bg-base-200/50 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-base-content">
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
                            {unreadCount} new
                          </span>
                        )}
                      </div>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => markAllReadMutation.mutate()}
                          disabled={markAllReadMutation.isPending}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary transition hover:bg-primary/10 disabled:opacity-50"
                        >
                          <CheckCheck size={14} />
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Dropdown Body */}
                    <div className="max-h-80 divide-y divide-base-content/10 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-base-200 text-base-content/40">
                            <Bell size={18} />
                          </div>
                          <p className="text-xs font-medium text-base-content/70">
                            You&apos;re all caught up!
                          </p>
                          <p className="mt-0.5 text-[11px] text-base-content/50">
                            No notifications to show right now.
                          </p>
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <button
                            key={item._id}
                            type="button"
                            onClick={() => handleNotificationClick(item)}
                            className={cn(
                              "flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-base-200/60",
                              !item.isRead && "bg-primary/5",
                            )}
                          >
                            <span
                              className={cn(
                                "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                                item.isRead
                                  ? "bg-base-content/20"
                                  : "bg-primary ring-4 ring-primary/15",
                              )}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-xs font-semibold text-base-content">
                                  {item.title}
                                </p>
                                <span className="shrink-0 text-[10px] text-base-content/45">
                                  {formatRelativeTime(item.createdAt)}
                                </span>
                              </div>
                              <p className="mt-0.5 line-clamp-2 text-xs text-base-content/70">
                                {item.message}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    {/* Dropdown Footer -> View All Page */}
                    <div className="border-t border-base-content/10 bg-base-200/40 p-2">
                      <Link
                        to="/notifications"
                        onClick={() => setIsNotifOpen(false)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-primary transition hover:bg-primary/10"
                      >
                        View all notifications
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <GradientButton
                type="button"
                onClick={handleTheme}
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

              {/* Profile Button + Dropdown */}
              <div ref={profileRef} className="relative">
                <GradientButton
                  disabled={loading}
                  type="button"
                  onClick={() => {
                    setIsProfileOpen((prev) => !prev);
                    setIsNotifOpen(false);
                  }}
                  shadow
                  className="w-10"
                  buttonClassName="p-0 from-base-100 to-base-200 text-base-content/90"
                  glowClassName="opacity-30 blur-xs"
                >
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="userPhoto"
                      className="h-full w-full rounded-xl object-cover object-center"
                    />
                  ) : (
                    <User size={17} strokeWidth={2} />
                  )}
                </GradientButton>

                {isProfileOpen && (
                  <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-base-content/10 bg-base-100 p-4 shadow-2xl">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-base-content/10 bg-base-200 text-primary">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt="userPhoto"
                            className="h-full w-full rounded-full object-cover object-center"
                          />
                        ) : (
                          <User size={18} strokeWidth={2} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-base-content">
                          {user.displayName || "User"}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-base-content/60">
                          <Mail size={12} strokeWidth={2} />
                          <span className="truncate">{user.email}</span>
                        </div>

                        {formattedRole && (
                          <TextBadge
                            className="mt-2 gap-1 font-semibold"
                            size="sm"
                            variant={
                              formattedRole.toLowerCase() === "customer"
                                ? "green"
                                : formattedRole.toLowerCase() === "agent"
                                  ? "cyan"
                                  : formattedRole.toLowerCase() === "manager"
                                    ? "pink"
                                    : formattedRole.toLowerCase() === "owner"
                                      ? "orange"
                                      : "purple"
                            }
                          >
                            <Sparkles size={10} strokeWidth={2.2} />
                            <span>{formattedRole}</span>
                          </TextBadge>
                        )}
                      </div>
                    </div>

                    <div className="my-3.5 h-px bg-base-content/10" />

                    <div className="grid grid-cols-2 gap-2">
                      {userRole && (
                        <Link
                          to={`/profile`}
                          onClick={() => setIsProfileOpen(false)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-base-content/10 bg-base-200/60 px-3 py-2 text-xs font-semibold text-base-content transition hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil size={13} strokeWidth={2} />
                          Profile
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500/15"
                      >
                        <LogOut size={13} strokeWidth={2} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <GradientButton
                type="button"
                onClick={handleTheme}
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

              <div className="flex w-fit items-center gap-2.5">
                <Link to="/login">
                  <GradientButton
                    shadow
                    buttonClassName="px-5 from-base-100 to-base-200 text-base-content/90"
                    glowClassName="opacity-30 blur-xs"
                  >
                    Login
                  </GradientButton>
                </Link>
                <Link to="/register">
                  <GradientButton
                    buttonClassName="w-fit rounded-xl px-5"
                    shadow
                    glowClassName="opacity-60 blur-md"
                  >
                    Sign Up
                  </GradientButton>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Mobile controls (Clean: only Menu toggle button; Theme & Notification moved inside drawer) */}
        <div className="flex items-center lg:hidden">
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
              <X size={18} strokeWidth={2} />
            ) : (
              <Menu size={18} strokeWidth={2} />
            )}

            {!isOpen && isAuthenticated && unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-base-100" />
            )}
          </GradientButton>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        className={cn(
          "overflow-hidden border-t border-base-content/10 bg-base-100/95 shadow-2xl backdrop-blur-xl transition-all duration-300 lg:hidden",
          isOpen ? "max-h-[760px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          {/* User Profile Card inside Drawer */}
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-3">
              <span className="loading loading-spinner loading-sm text-primary"></span>
              <p className="text-sm text-base-content/70">Loading account...</p>
            </div>
          ) : (
            isAuthenticated && (
              <>
                <div className="flex items-center gap-3 rounded-2xl border border-base-content/10 bg-base-200/60 p-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-base-content/10 bg-base-100 text-primary">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="userPhoto"
                        className="h-full w-full rounded-full object-cover object-center"
                      />
                    ) : (
                      <User size={18} strokeWidth={2} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-base-content">
                        {user.displayName || "User"}
                      </p>
                      {formattedRole && (
                        <span className="shrink-0 rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {formattedRole}
                        </span>
                      )}
                    </div>

                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-base-content/60">
                      <Mail size={12} strokeWidth={2} />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                </div>
                <div className="my-4 h-px bg-base-content/10" />
              </>
            )
          )}

          {/* Nav Links */}
          <div className="flex flex-col gap-1.5">
            {isAuthenticated
              ? links.map((link, i) => (
                  <NavLink
                    key={i}
                    to={link.path}
                    end={
                      link.path === "/customer/tickets" ||
                      link.path === "/agent/tickets"
                    }
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                        isActive
                          ? "bg-gradient-to-r from-primary/15 to-secondary/15 font-semibold text-primary"
                          : "text-base-content/75 hover:bg-base-200/70 hover:text-base-content",
                      )
                    }
                  >
                    <span>{link.label}</span>
                    <ChevronRight size={15} className="opacity-40" />
                  </NavLink>
                ))
              : navLinks.map((link, i) => (
                  <ScrollLink
                    key={i}
                    to={link.to}
                    smooth
                    offset={-20}
                    duration={500}
                    onClick={closeMenu}
                    spy
                    activeClass="bg-gradient-to-r from-primary/15 to-secondary/15 text-primary font-semibold rounded-xl"
                    className="flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium text-base-content/75 transition hover:bg-base-200/70 hover:text-base-content"
                  >
                    <span>{link.label}</span>
                  </ScrollLink>
                ))}

            {/* Notifications Link inside Drawer (Only when logged in) */}
            {isAuthenticated && (
              <NavLink
                to="/notifications"
                onClick={closeMenu}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-gradient-to-r from-primary/15 to-secondary/15 font-semibold text-primary"
                      : "text-base-content/75 hover:bg-base-200/70 hover:text-base-content",
                  )
                }
              >
                <span className="flex items-center gap-2.5">
                  <span>Notifications</span>
                </span>

                <div className="flex items-center gap-1.5">
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                  <ChevronRight size={15} className="opacity-40" />
                </div>
              </NavLink>
            )}
          </div>

          {/* Theme Switcher inside Drawer */}
          <div className="mt-3 border-t border-base-content/10 pt-3">
            <button
              type="button"
              onClick={handleTheme}
              className="flex w-full items-center justify-between rounded-xl border border-base-content/10 bg-base-200/50 px-3.5 py-2.5 text-sm font-medium text-base-content/80 transition hover:border-primary/30 hover:text-primary"
            >
              <span className="flex items-center gap-2.5">
                {theme === "dark" ? (
                  <Sun size={16} strokeWidth={2} className="text-amber-400" />
                ) : (
                  <Moon size={16} strokeWidth={2} className="text-primary" />
                )}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </span>
              <span className="rounded-lg bg-base-100 px-2 py-0.5 text-xs font-semibold text-base-content/60 shadow-2xs">
                {theme === "dark" ? "Off" : "On"}
              </span>
            </button>
          </div>

          {/* Bottom Action Buttons */}
          {isAuthenticated ? (
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {userRole && (
                <Link
                  to={`/${userRole}/profile`}
                  onClick={closeMenu}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-base-content/10 bg-base-200 px-4 text-xs font-semibold text-base-content transition hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                >
                  <Pencil size={14} strokeWidth={2} />
                  Profile
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 text-xs font-semibold text-red-500 transition hover:bg-red-500/15"
              >
                <LogOut size={14} strokeWidth={2} />
                Logout
              </button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <Link to="/login" onClick={closeMenu} className="w-full">
                <GradientButton
                  shadow
                  className="w-full"
                  buttonClassName="px-4 from-base-100 to-base-200 text-base-content/90"
                  glowClassName="opacity-30 blur-xs"
                >
                  Login
                </GradientButton>
              </Link>
              <Link to="/register" onClick={closeMenu} className="w-full">
                <GradientButton
                  className="w-full"
                  buttonClassName="rounded-xl px-4"
                  shadow
                  glowClassName="opacity-60 blur-md"
                >
                  Sign Up
                </GradientButton>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
