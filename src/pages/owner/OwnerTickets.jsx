import { useEffect, useState } from "react";
import { RefreshCw, Search, Ticket } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import GradientButton from "@/components/ui/Button/GradientButton";
import TextBadge from "@/components/ui/Badge/TextBadge";
import CardWithBlurBlob from "@/components/ui/Card/CardWithBlurBlob";
import SoftIconCard from "@/components/ui/Card/SoftIconCard";
import Pagination from "@/components/ui/Pagination/pagination";

// =====================================================
// CONFIGURATION
// =====================================================

const API_BASE_URL = "https://support-hub-server.vercel.app";

const STATUS = {
  open: { label: "Open", variant: "blue" },
  assigned: { label: "Assigned", variant: "purple" },
  in_progress: { label: "In Progress", variant: "yellow" },
  resolved: { label: "Resolved", variant: "green" },
  closed: { label: "Closed", variant: "slate" },
};

const PRIORITY = {
  low: { label: "Low", variant: "green" },
  medium: { label: "Medium", variant: "yellow" },
  high: { label: "High", variant: "orange" },
  critical: { label: "Critical", variant: "red" },
};

const CATEGORIES = [
  "technical",
  "billing",
  "account",
  "refund",
  "bug",
  "feature",
  "other",
];

const SELECT_CLASS =
  "h-11 min-w-[160px] rounded-xl border border-base-content/10 bg-base-100 px-4 text-sm outline-none transition focus:border-primary/40";

// =====================================================
// HELPERS
// =====================================================

function formatDate(value, withTime = false) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
    timeZone: "Asia/Dhaka",
  });
}

function parsePositivePage(value) {
  if (!value || !/^[1-9]\d*$/.test(value)) return 1;
  const num = Number(value);
  return Number.isSafeInteger(num) ? num : 1;
}

async function apiRequest(user, path, options = {}) {
  if (!user) {
    throw new Error("Authentication required");
  }

  const token = await user.getIdToken();
  const { body, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success === false || !result) {
    const error = new Error(
      result?.message || `Request failed (${response.status})`,
    );
    error.status = response.status;
    throw error;
  }

  return result;
}

async function fetchOwnerTickets({ user, filters, signal }) {
  const params = new URLSearchParams();

  params.set("page", String(filters.page));
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.category) params.set("category", filters.category);
  if (filters.unassigned) params.set("unassigned", "true");
  if (filters.unresolved) params.set("unresolved", "true");

  return apiRequest(user, `/owner/tickets?${params.toString()}`, {
    method: "GET",
    signal,
  });
}

// =====================================================
// SKELETON LOADER
// =====================================================

function OwnerTicketsSkeleton() {
  return (
    <div
      aria-label="Loading workspace tickets"
      aria-busy="true"
      className="p-4 lg:p-5"
    >
      <div>
        <div className="flex items-center gap-2">
          <div className="skeleton h-8 w-52 rounded-lg" />
          <div className="skeleton h-5 w-24 rounded-lg" />
        </div>
        <div className="skeleton mt-2 h-4 w-96 max-w-full rounded-md" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, idx) => (
          <CardWithBlurBlob
            key={idx}
            interactive={false}
            className="h-full p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="skeleton h-10 w-10 rounded-xl" />
              <div className="skeleton h-7 w-12 rounded-lg" />
            </div>
            <div className="skeleton mt-3 h-4 w-28 rounded-md" />
          </CardWithBlurBlob>
        ))}
      </div>

      <CardWithBlurBlob className="my-5 p-4" interactive={false}>
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="skeleton h-11 flex-1 rounded-xl" />
          <div className="skeleton h-11 w-40 rounded-xl" />
          <div className="skeleton h-11 w-40 rounded-xl" />
          <div className="skeleton h-11 w-40 rounded-xl" />
          <div className="skeleton h-11 w-24 rounded-xl" />
        </div>
      </CardWithBlurBlob>

      <CardWithBlurBlob className="overflow-hidden p-0" interactive={false}>
        <div className="divide-y divide-base-content/10">
          {Array.from({ length: 6 }, (_, idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-64 flex-1 space-y-2">
                <div className="skeleton h-3 w-24 rounded-md" />
                <div className="skeleton h-4 w-64 max-w-full rounded-md" />
                <div className="skeleton h-3 w-52 max-w-full rounded-md" />
              </div>
              <div className="skeleton h-4 w-32 rounded-md" />
              <div className="skeleton h-6 w-20 rounded-lg" />
              <div className="skeleton h-6 w-16 rounded-lg" />
              <div className="skeleton h-6 w-20 rounded-lg" />
              <div className="skeleton h-4 w-28 rounded-md" />
              <div className="skeleton h-8 w-24 rounded-xl" />
            </div>
          ))}
        </div>
      </CardWithBlurBlob>
    </div>
  );
}

// =====================================================
// OWNER TICKETS
// =====================================================

export default function OwnerTickets() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [session, setSession] = useState({
    ready: false,
    user: null,
    error: null,
  });

  useEffect(() => {
    let unsubscribe;

    try {
      unsubscribe = onAuthStateChanged(
        getAuth(),
        (user) => {
          setSession({ ready: true, user, error: null });
        },
        (error) => {
          setSession({ ready: true, user: null, error });
        },
      );
    } catch (error) {
      setSession({ ready: true, user: null, error });
    }

    return () => unsubscribe?.();
  }, []);

  // Read filters from URL so dashboard links (?status=resolved, ?priority=high, etc.) work seamlessly
  const urlSearch = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const priorityFilter = searchParams.get("priority") || "";
  const categoryFilter = searchParams.get("category") || "";
  const unassignedOnly = searchParams.get("unassigned") === "true";
  const unresolvedOnly = searchParams.get("unresolved") === "true";
  const page = parsePositivePage(searchParams.get("page"));

  const [searchInput, setSearchInput] = useState(urlSearch);

  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // Debounce search input -> URL search param
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed === urlSearch) return;

      const next = new URLSearchParams(searchParams);
      if (trimmed) next.set("search", trimmed);
      else next.delete("search");
      next.set("page", "1");
      setSearchParams(next, { replace: true });
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, urlSearch, searchParams, setSearchParams]);

  const filters = {
    page,
    search: urlSearch,
    status: statusFilter,
    priority: priorityFilter,
    category: categoryFilter,
    unassigned: unassignedOnly,
    unresolved: unresolvedOnly,
  };

  const { data, error, isPending, isFetching, refetch } = useQuery({
    queryKey: ["owner-tickets", session.user?.uid || null, filters],
    enabled: session.ready && !!session.user,
    queryFn: ({ signal }) =>
      fetchOwnerTickets({
        user: session.user,
        filters,
        signal,
      }),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    retry: (failureCount, requestError) => {
      if (requestError?.status >= 400 && requestError?.status < 500) {
        return false;
      }
      return failureCount < 1;
    },
  });

  function updateFilterParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);

    if (key === "status" && value !== "open") {
      next.delete("unassigned");
    }
    next.set("page", "1");
    setSearchParams(next);
  }

  function resetFilters() {
    setSearchInput("");
    setSearchParams({});
  }

  function changePage(value) {
    const totalPages = data?.pagination?.totalPages || 1;
    const current = data?.pagination?.page || page;
    const requested = typeof value === "function" ? value(current) : value;

    if (!Number.isInteger(requested)) return;
    const safePage = Math.max(1, Math.min(requested, totalPages));

    const next = new URLSearchParams(searchParams);
    next.set("page", String(safePage));
    setSearchParams(next);
  }

  if (!session.ready || (session.user && isPending && !data)) {
    return <OwnerTicketsSkeleton />;
  }

  if (session.error || !session.user) {
    return (
      <div className="p-4 lg:p-5">
        <CardWithBlurBlob className="p-10 text-center" interactive={false}>
          <p className="text-base font-medium text-base-content/75">
            {session.error
              ? "Unable to verify your session"
              : "Authentication required"}
          </p>
          <p className="mt-1 text-sm text-base-content/55">
            Sign in with your workspace owner account to view tickets.
          </p>
        </CardWithBlurBlob>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-4 lg:p-5">
        <CardWithBlurBlob className="p-10 text-center" interactive={false}>
          <p className="text-base font-medium text-base-content/75">
            Unable to load workspace tickets
          </p>
          <p className="mt-1 text-sm text-base-content/55">
            {error.message || "Please try again."}
          </p>
          <div className="mt-4 flex justify-center">
            <GradientButton
              type="button"
              size="sm"
              disabled={isFetching}
              onClick={() => refetch()}
              buttonClassName="from-primary to-secondary text-white px-4"
            >
              {isFetching ? "Retrying..." : "Try again"}
            </GradientButton>
          </div>
        </CardWithBlurBlob>
      </div>
    );
  }

  const counts = data?.counts || {
    total: 0,
    unassigned: 0,
    active: 0,
    resolved: 0,
    closed: 0,
  };

  const visibleTickets = data?.tickets || [];
  const pagination = data?.pagination || {
    page: 1,
    total: 0,
    totalPages: 1,
  };

  const companyName = data?.company?.companyName;

  // Handle single or comma-separated query params cleanly in dropdowns
  const selectedStatus = statusFilter.includes(",") ? "" : statusFilter;
  const selectedPriority = priorityFilter.includes(",") ? "" : priorityFilter;

  const hasActiveFilters = Boolean(
    urlSearch ||
    statusFilter ||
    priorityFilter ||
    categoryFilter ||
    unassignedOnly ||
    unresolvedOnly,
  );

  return (
    <div className="p-4 lg:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Workspace Tickets
            </h1>
            {companyName && (
              <TextBadge variant="purple" size="sm">
                {companyName}
              </TextBadge>
            )}
            <TextBadge variant="warning" size="sm">
              Live
            </TextBadge>
          </div>

          <p className="mt-1 text-sm text-base-content/60">
            Monitor customer tickets and agent assignments across your company
            workspace.
          </p>
        </div>

        <button
          type="button"
          disabled={isFetching}
          onClick={() => refetch()}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-base-content/10 bg-base-100 px-3.5 text-xs font-medium text-base-content/75 transition hover:bg-base-200 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {[
          ["total", "Total Tickets", "blue"],
          ["unassigned", "Unassigned/Open", "cyan"],
          ["active", "Active Tickets", "purple"],
          ["resolved", "Resolved", "green"],
          ["closed", "Closed", "slate"],
        ].map(([key, label, variant]) => (
          <CardWithBlurBlob
            key={key}
            interactive={false}
            className="h-full p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <SoftIconCard icon={Ticket} variant={variant} size={17} />

              <p className="text-2xl font-semibold tabular-nums">
                {counts[key] ?? 0}
              </p>
            </div>

            <p className="mt-3 text-sm text-base-content/60">{label}</p>
          </CardWithBlurBlob>
        ))}
      </div>

      {/* Filters */}
      <CardWithBlurBlob className="my-5 p-4" interactive={false}>
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
          <div className="relative min-w-0 flex-1 lg:min-w-64">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40"
            />

            <input
              type="search"
              aria-label="Search company tickets"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              maxLength={100}
              placeholder="Search by title, ticket number, or customer..."
              className="h-11 w-full rounded-xl border border-base-content/10 bg-base-100 pl-11 pr-4 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <select
            aria-label="Status"
            value={selectedStatus}
            onChange={(event) =>
              updateFilterParam("status", event.target.value)
            }
            className={SELECT_CLASS}
          >
            <option value="">All Status</option>
            {Object.entries(STATUS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Priority"
            value={selectedPriority}
            onChange={(event) =>
              updateFilterParam("priority", event.target.value)
            }
            className={SELECT_CLASS}
          >
            <option value="">All Priority</option>
            {Object.entries(PRIORITY).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Category"
            value={categoryFilter}
            onChange={(event) =>
              updateFilterParam("category", event.target.value)
            }
            className={SELECT_CLASS}
          >
            <option value="">All Category</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={!hasActiveFilters}
            onClick={resetFilters}
            className="h-11 rounded-xl border border-base-content/10 px-5 text-sm font-medium transition hover:bg-base-200 disabled:opacity-45"
          >
            Reset
          </button>
        </div>

        {(unassignedOnly ||
          unresolvedOnly ||
          statusFilter.includes(",") ||
          priorityFilter.includes(",")) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-base-content/10 pt-3 text-xs text-base-content/60">
            <span>Active preset filter:</span>
            {unassignedOnly && (
              <TextBadge variant="cyan" size="sm">
                Unassigned queue
              </TextBadge>
            )}
            {unresolvedOnly && (
              <TextBadge variant="warning" size="sm">
                Unresolved only
              </TextBadge>
            )}
            {statusFilter.includes(",") && (
              <TextBadge variant="blue" size="sm">
                Status: {statusFilter.replaceAll(",", ", ")}
              </TextBadge>
            )}
            {priorityFilter.includes(",") && (
              <TextBadge variant="red" size="sm">
                Priority: {priorityFilter.replaceAll(",", ", ")}
              </TextBadge>
            )}
          </div>
        )}
      </CardWithBlurBlob>

      {/* Tickets Table */}
      <CardWithBlurBlob className="overflow-hidden p-0" interactive={false}>
        {visibleTickets.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center px-5 py-20 text-center"
            role="status"
          >
            <SoftIconCard icon={Ticket} variant="slate" />

            <p className="mb-3 mt-3 text-xl text-base-content/60">
              No company tickets found
            </p>

            <p className="mt-1 max-w-md text-sm text-base-content/60">
              {hasActiveFilters
                ? "Your current filters did not match any ticket. Try another search or reset the filters."
                : "No tickets have been created in your workspace yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr className="text-sm uppercase text-base-content/50">
                  {[
                    "Ticket",
                    "Customer",
                    "Category",
                    "Priority",
                    "Status",
                    "Assigned",
                    "Updated",
                  ].map((label) => (
                    <th key={label} scope="col" className="p-5 font-semibold">
                      {label}
                    </th>
                  ))}

                  <th scope="col" className="p-5 font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleTickets.map((ticket) => {
                  const agent = ticket.agentInfo;

                  const priorityInfo = PRIORITY[ticket.priority] || {
                    label: ticket.priority || "Not set",
                    variant: "slate",
                  };

                  const statusInfo = STATUS[ticket.status] || {
                    label: ticket.status || "Unknown",
                    variant: "slate",
                  };

                  return (
                    <tr key={ticket._id}>
                      <td className="min-w-64 max-w-md px-5 py-3">
                        <p className="font-mono text-xs text-base-content/50">
                          {ticket.ticketNumber || "—"}
                        </p>

                        <h3 className="line-clamp-1 font-medium">
                          {ticket.aiResult?.ticketTitle || "Untitled Ticket"}
                        </h3>

                        <p className="line-clamp-1 max-w-11/12 text-sm text-base-content/60">
                          {ticket.aiResult?.summary || "No summary available"}
                        </p>
                      </td>

                      <td className="p-5">
                        <p className="whitespace-nowrap text-sm font-medium text-base-content/80">
                          {ticket.userInfo?.displayName ||
                            "Customer unavailable"}
                        </p>

                        <p className="mt-1 text-xs text-base-content/50">
                          {ticket.userInfo?.email || "—"}
                        </p>
                      </td>

                      <td className="p-5">
                        <TextBadge variant="cyan">
                          {ticket.aiResult?.category || "Not set"}
                        </TextBadge>
                      </td>

                      <td className="p-5">
                        <TextBadge variant={priorityInfo.variant}>
                          {priorityInfo.label}
                        </TextBadge>
                      </td>

                      <td>
                        <TextBadge
                          variant={statusInfo.variant}
                          className="whitespace-nowrap"
                        >
                          {statusInfo.label}
                        </TextBadge>
                      </td>

                      <td>
                        {ticket.resolutionSource === "ai" ||
                        ticket.aiResolved === true ? (
                          <p className="whitespace-nowrap text-xs font-semibold text-base-content/40">
                            Resolved by AI
                          </p>
                        ) : agent ? (
                          <div>
                            <p className="whitespace-nowrap text-sm font-medium text-base-content/80">
                              {agent.displayName || "Assigned agent"}
                            </p>

                            <p className="text-xs text-base-content/50">
                              {agent.email || "—"}
                            </p>

                            {agent.status === "suspended" && (
                              <div className="mt-1">
                                <TextBadge variant="red" size="sm">
                                  Suspended
                                </TextBadge>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs italic text-base-content/40">
                            {ticket.agentUid
                              ? "Agent unavailable"
                              : "Unassigned"}
                          </p>
                        )}
                      </td>

                      <td className="p-5">
                        <span className="whitespace-nowrap text-sm text-base-content/60">
                          {formatDate(ticket.updatedAt || ticket.createdAt)}
                        </span>
                      </td>

                      <td className="p-5">
                        <Link to={`/owner/tickets/${ticket._id}`}>
                          <GradientButton
                            size="sm"
                            buttonClassName="from-primary/20 to-secondary/10 text-base-content"
                          >
                            View Details
                          </GradientButton>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-base-content/10 px-5 py-3 sm:flex-row">
          <p className="text-sm text-base-content/60">
            {visibleTickets.length === 0
              ? "No ticket found"
              : `Showing ${visibleTickets.length} of ${pagination.total} tickets`}
          </p>

          {visibleTickets.length > 0 && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              setPage={changePage}
            />
          )}
        </div>
      </CardWithBlurBlob>
    </div>
  );
}
