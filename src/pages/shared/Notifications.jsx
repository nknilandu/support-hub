import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Ticket,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import GradientButton from "@/components/ui/Button/GradientButton";
import GradientText from "@/components/ui/Text/GradientText";
import { cn } from "@/lib/cn";
import { AuthContext } from "@/providers/AuthProvider";

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
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getNotificationIcon = (type) => {
  if (type?.includes("reply")) {
    return <MessageSquare size={17} strokeWidth={2} />;
  }
  if (type?.includes("ticket")) {
    return <Ticket size={17} strokeWidth={2} />;
  }
  return <Sparkles size={17} strokeWidth={2} />;
};

export default function Notifications() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all"); // "all" | "unread"
  const limit = 15;

  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["notificationsPage", user?.uid, page, limit],
    enabled: !!user,
    queryFn: async () => {
      const token = await user.getIdToken();
      const res = await fetch(
        `https://support-hub-server.vercel.app/notifications?page=${page}&limit=${limit}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to load notifications");
      }
      return result;
    },
  });

  const allNotifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;
  const pagination = data?.pagination || {
    total: 0,
    page: 1,
    limit,
    totalPages: 1,
  };

  const displayedNotifications =
    filter === "unread"
      ? allNotifications.filter((item) => !item.isRead)
      : allNotifications;

  // =====================================================
  // MARK SINGLE NOTIFICATION AS READ
  // =====================================================
  const markOneReadMutation = useMutation({
    mutationFn: async (notificationId) => {
      const token = await user.getIdToken();
      const res = await fetch(
        `https://support-hub-server.vercel.app/notifications/${notificationId}`,
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
        queryKey: ["notificationsPage", user?.uid],
      });
      queryClient.invalidateQueries({
        queryKey: ["userNotifications", user?.uid],
      });
    },
  });

  // =====================================================
  // MARK ALL AS READ
  // =====================================================
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const token = await user.getIdToken();
      const res = await fetch("https://support-hub-server.vercel.app/notifications/read-all", {
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
        queryKey: ["notificationsPage", user?.uid],
      });
      queryClient.invalidateQueries({
        queryKey: ["userNotifications", user?.uid],
      });
    },
  });

  const handleCardClick = (item) => {
    if (!item.isRead) {
      markOneReadMutation.mutate(item._id);
    }
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <section className="min-h-screen bg-base-200/40 pb-16 pt-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* ================= HEADER ================= */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 text-primary">
                <Bell size={20} strokeWidth={2} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
                All <GradientText>Notifications</GradientText>
              </h1>
            </div>
            <p className="mt-1.5 text-sm text-base-content/60">
              Stay updated on ticket assignments, replies, and status changes.
            </p>
          </div>

          {unreadCount > 0 && (
            <GradientButton
              type="button"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              shadow
              buttonClassName="px-4 py-2 text-xs font-semibold from-base-100 to-base-200 text-primary"
              glowClassName="opacity-30 blur-xs"
            >
              <span className="inline-flex items-center gap-1.5">
                <CheckCheck size={15} />
                {markAllReadMutation.isPending
                  ? "Marking..."
                  : `Mark all as read (${unreadCount})`}
              </span>
            </GradientButton>
          )}
        </div>

        {/* ================= FILTER TABS ================= */}
        <div className="mt-6 flex items-center justify-between border-b border-base-content/10 pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={cn(
                "rounded-xl px-4 py-1.5 text-xs font-semibold transition",
                filter === "all"
                  ? "bg-primary text-primary-content shadow-xs"
                  : "bg-base-100 text-base-content/70 hover:bg-base-200",
              )}
            >
              All ({pagination.total})
            </button>

            <button
              type="button"
              onClick={() => setFilter("unread")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-semibold transition",
                filter === "unread"
                  ? "bg-primary text-primary-content shadow-xs"
                  : "bg-base-100 text-base-content/70 hover:bg-base-200",
              )}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                    filter === "unread"
                      ? "bg-white/20 text-white"
                      : "bg-red-500/15 text-red-500",
                  )}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {pagination.totalPages > 1 && (
            <span className="text-xs text-base-content/50">
              Page {pagination.page} of {pagination.totalPages}
            </span>
          )}
        </div>

        {/* ================= CONTENT ================= */}
        <div className="mt-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-base-content/10 bg-base-100 py-16">
              <span className="loading loading-spinner loading-md text-primary"></span>
              <p className="mt-3 text-sm text-base-content/60">
                Loading notifications...
              </p>
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-sm text-red-500">
              {error?.message ||
                "Something went wrong while loading notifications."}
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-base-content/10 bg-base-100 px-6 py-16 text-center shadow-2xs">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-base-200 text-base-content/40">
                <Bell size={24} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-base-content">
                {filter === "unread"
                  ? "No unread notifications"
                  : "No notifications yet"}
              </h3>
              <p className="mt-1 max-w-sm text-xs text-base-content/60">
                {filter === "unread"
                  ? "You have read all your notifications on this page."
                  : "When there are updates on your tickets or account, they will appear here."}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayedNotifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleCardClick(item)}
                  className={cn(
                    "group relative flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 transition-all duration-200",
                    item.isRead
                      ? "border-base-content/10 bg-base-100/70 hover:border-base-content/20 hover:bg-base-100"
                      : "border-primary/25 bg-primary/[0.04] shadow-2xs hover:border-primary/40 hover:bg-primary/[0.07]",
                  )}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition",
                      item.isRead
                        ? "bg-base-200 text-base-content/55"
                        : "bg-primary/15 text-primary",
                    )}
                  >
                    {getNotificationIcon(item.type)}
                  </div>

                  {/* Text Body */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {!item.isRead && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                        <h4
                          className={cn(
                            "text-sm",
                            item.isRead
                              ? "font-medium text-base-content/85"
                              : "font-semibold text-base-content",
                          )}
                        >
                          {item.title}
                        </h4>
                        {item.ticketNumber && (
                          <span className="rounded-md bg-base-200 px-2 py-0.5 font-mono text-[11px] font-medium text-base-content/70">
                            {item.ticketNumber}
                          </span>
                        )}
                      </div>

                      <span className="text-xs text-base-content/45">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-relaxed text-base-content/70 sm:text-sm">
                      {item.message}
                    </p>

                    {/* Footer Actions */}
                    <div className="mt-2.5 flex items-center gap-3">
                      {item.path && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-85 transition group-hover:opacity-100">
                          View details
                          <ExternalLink size={12} />
                        </span>
                      )}

                      {!item.isRead && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markOneReadMutation.mutate(item._id);
                          }}
                          disabled={markOneReadMutation.isPending}
                          className="inline-flex items-center gap-1 rounded-lg bg-base-200/80 px-2 py-0.5 text-[11px] font-medium text-base-content/70 transition hover:bg-primary/15 hover:text-primary"
                        >
                          <Check size={12} />
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= PAGINATION ================= */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-base-content/10 bg-base-100 px-4 py-3">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1.5 rounded-xl border border-base-content/10 bg-base-200/60 px-3.5 py-2 text-xs font-semibold text-base-content transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={15} />
              Previous
            </button>

            <span className="text-xs font-medium text-base-content/65">
              Page{" "}
              <strong className="text-base-content">{pagination.page}</strong>{" "}
              of{" "}
              <strong className="text-base-content">
                {pagination.totalPages}
              </strong>
            </span>

            <button
              type="button"
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page >= pagination.totalPages}
              className="inline-flex items-center gap-1.5 rounded-xl border border-base-content/10 bg-base-200/60 px-3.5 py-2 text-xs font-semibold text-base-content transition hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
