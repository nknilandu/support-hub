import { useEffect, useState } from "react";
import { Search, Ticket } from "lucide-react";
import { Link, useSearchParams } from "react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import GradientButton from "../../components/ui/Button/GradientButton";
import TextBadge from "../../components/ui/Badge/TextBadge";
import CardWithBlurBlob from "../../components/ui/Card/CardWithBlurBlob";
import SoftIconCard from "../../components/ui/Card/SoftIconCard";
import Pagination from "../../components/ui/Pagination/pagination";

// =====================================================
// CONFIGURATION
// =====================================================

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3021"
).replace(/\/+$/, "");

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

const EMPTY_COUNTS = {
  total: 0,
  unassigned: 0,
  active: 0,
  resolved: 0,
  closed: 0,
};

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

function parsePage(value) {
  if (!value || !/^[1-9]\d*$/.test(value)) return 1;

  const page = Number(value);

  return Number.isSafeInteger(page) && page <= 100000 ? page : 1;
}

function combinedLabel(value, options) {
  return value
    .split(",")
    .map((key) => options[key]?.label || key)
    .join(" + ");
}

async function fetchManagerTickets({ user, filters, page, signal }) {
  const token = await user.getIdToken();

  const params = new URLSearchParams({
    page: String(page),
  });

  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }

  const response = await fetch(
    `${API_BASE_URL}/manager/tickets?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal,
    },
  );

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success !== true) {
    const error = new Error(
      result?.message ||
        `Unable to load company tickets (${response.status}).`,
    );

    error.status = response.status;
    throw error;
  }

  if (
    !Array.isArray(result.tickets) ||
    !result.pagination ||
    !result.counts
  ) {
    throw new Error("Incomplete company tickets response.");
  }

  return result;
}

// =====================================================
// SKELETONS
// =====================================================

function TicketsTableSkeleton() {
  return (
    <tbody aria-label="Loading tickets" aria-busy="true">
      {Array.from({ length: 5 }, (_, index) => (
        <tr key={index}>
          {/* Ticket */}
          <td className="min-w-64 max-w-md px-5 py-3.5">
            <div className="space-y-2">
              <div className="skeleton h-3 w-28 rounded-md" />
              <div
                className={`skeleton h-4 rounded-md ${
                  index % 2 === 0 ? "w-56" : "w-48"
                }`}
              />
              <div className="skeleton h-3 w-64 max-w-full rounded-md" />
            </div>
          </td>

          {/* Customer */}
          <td className="p-5">
            <div className="space-y-2">
              <div className="skeleton h-4 w-28 rounded-md" />
              <div className="skeleton h-3 w-36 rounded-md" />
            </div>
          </td>

          {/* Category */}
          <td className="p-5">
            <div className="skeleton h-6 w-20 rounded-lg" />
          </td>

          {/* Priority */}
          <td className="p-5">
            <div className="skeleton h-6 w-16 rounded-lg" />
          </td>

          {/* Status */}
          <td className="px-4 py-5">
            <div className="skeleton h-6 w-20 rounded-lg" />
          </td>

          {/* Assigned */}
          <td className="px-4 py-5">
            <div className="space-y-2">
              <div className="skeleton h-4 w-24 rounded-md" />
              <div className="skeleton h-3 w-32 rounded-md" />
            </div>
          </td>

          {/* Updated */}
          <td className="p-5">
            <div className="skeleton h-4 w-24 rounded-md" />
          </td>

          {/* Action */}
          <td className="p-5">
            <div className="skeleton h-8 w-24 rounded-xl" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

// =====================================================
// MANAGER TICKETS
// =====================================================

export default function ManagerTickets() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [session, setSession] = useState({
    ready: false,
    user: null,
    error: null,
  });

  const urlSearch = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(urlSearch);

  useEffect(() => {
    let unsubscribe;

    try {
      unsubscribe = onAuthStateChanged(
        getAuth(),
        (user) => {
          setSession({
            ready: true,
            user,
            error: null,
          });
        },
        (error) => {
          setSession({
            ready: true,
            user: null,
            error,
          });
        },
      );
    } catch (error) {
      setSession({
        ready: true,
        user: null,
        error,
      });
    }

    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    const trimmed = searchInput.trim();

    if (trimmed === urlSearch) return undefined;

    const timer = setTimeout(() => {
      setSearchParams(
        (previous) => {
          const next = new URLSearchParams(previous);

          if (trimmed) {
            next.set("search", trimmed);
          } else {
            next.delete("search");
          }

          next.delete("page");
          return next;
        },
        { replace: true },
      );
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, urlSearch, setSearchParams]);

  const filters = {
    search: urlSearch,
    queue: searchParams.get("queue") || "",
    status: searchParams.get("status") || "",
    priority: searchParams.get("priority") || "",
    category: searchParams.get("category") || "",
    agent: searchParams.get("agent") || "",
    resolution: searchParams.get("resolution") || "",
    unassigned: searchParams.get("unassigned") || "",
    unresolved: searchParams.get("unresolved") || "",
  };

  const page = parsePage(searchParams.get("page"));

  const {
    data,
    error,
    isPending,
    isPlaceholderData,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [
      "manager-tickets",
      session.user?.uid || null,
      filters,
      page,
    ],

    enabled: session.ready && !!session.user,

    queryFn: ({ signal }) =>
      fetchManagerTickets({
        user: session.user,
        filters,
        page,
        signal,
      }),

    placeholderData: keepPreviousData,
    staleTime: 15_000,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,

    refetchInterval: (query) =>
      [401, 403, 404].includes(query.state.error?.status)
        ? false
        : 30_000,

    retry: (failureCount, requestError) => {
      if (
        requestError?.status >= 400 &&
        requestError?.status < 500
      ) {
        return false;
      }

      return failureCount < 1;
    },
  });

  const accessDenied = [401, 403, 404].includes(error?.status);

  const usableData =
    session.user && !session.error && !accessDenied ? data : null;

  const initialLoading =
    !session.ready || (!!session.user && isPending && !usableData);

  const tableLoading =
    initialLoading || (!!session.user && isPlaceholderData);

  const visibleTickets = usableData?.tickets || [];
  const counts = usableData?.counts || EMPTY_COUNTS;

  const totalPages = usableData?.pagination?.totalPages || 1;
  const currentPage = usableData?.pagination?.page || page;
  const totalTickets = usableData?.pagination?.total || 0;

  useEffect(() => {
    const serverPage = usableData?.pagination?.page;

    if (!serverPage || serverPage === page) return;

    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);

        if (serverPage === 1) {
          next.delete("page");
        } else {
          next.set("page", String(serverPage));
        }

        return next;
      },
      { replace: true },
    );
  }, [usableData?.pagination?.page, page, setSearchParams]);

  function changeFilter(key, value) {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);

      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }

      next.delete("page");

      if (key === "status") {
        next.delete("queue");
        next.delete("unassigned");
        next.delete("unresolved");
      }

      return next;
    });
  }

  function resetFilters() {
    setSearchInput("");
    setSearchParams({});
  }

  function changePage(value) {
    const requested =
      typeof value === "function" ? value(currentPage) : value;

    if (!Number.isInteger(requested)) return;

    const nextPage = Math.max(1, Math.min(requested, totalPages));

    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);

      if (nextPage === 1) {
        next.delete("page");
      } else {
        next.set("page", String(nextPage));
      }

      return next;
    });
  }

  let emptyTitle = "No company tickets found";
  let emptyDescription =
    "Your current filters did not match any ticket. Try another search or reset the filters.";

  if (session.error) {
    emptyTitle = "Unable to verify your session";
    emptyDescription = "Please reload the page and try again.";
  } else if (!session.user) {
    emptyTitle = "Authentication required";
    emptyDescription = "Sign in with your manager account to continue.";
  } else if (!usableData && error) {
    emptyTitle = "Unable to load company tickets";
    emptyDescription = error.message;
  }

  return (
    <div className="p-4 lg:p-5">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Workspace Tickets
          </h1>
          <TextBadge variant="warning" size="sm">
            {usableData && error ? "Refresh failed" : "Live"}
          </TextBadge>
        </div>

        <p className="mt-1 text-sm text-base-content/60">
          {usableData && error
            ? "Showing the last loaded data. Automatic refresh will retry."
            : "Manage customer tickets and assignments in your company queue."}
        </p>
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
            {initialLoading ? (
              <div role="status" aria-label={`Loading ${label}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="skeleton h-10 w-10 shrink-0 rounded-xl" />
                  <div className="skeleton h-8 w-14 rounded-lg" />
                </div>
                <div className="skeleton mt-3 h-4 w-28 rounded-md" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <SoftIconCard
                    icon={Ticket}
                    variant={variant}
                    size={17}
                  />

                  <p className="text-2xl font-semibold tabular-nums">
                    {usableData ? counts[key] : "—"}
                  </p>
                </div>

                <p className="mt-3 text-sm text-base-content/60">
                  {label}
                </p>
              </>
            )}
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
            value={filters.status}
            onChange={(event) =>
              changeFilter("status", event.target.value)
            }
            className={SELECT_CLASS}
          >
            <option value="">All Status</option>

            {filters.status &&
              !Object.prototype.hasOwnProperty.call(
                STATUS,
                filters.status,
              ) && (
                <option value={filters.status}>
                  {combinedLabel(filters.status, STATUS)}
                </option>
              )}

            {Object.entries(STATUS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Priority"
            value={filters.priority}
            onChange={(event) =>
              changeFilter("priority", event.target.value)
            }
            className={SELECT_CLASS}
          >
            <option value="">All Priority</option>

            {filters.priority &&
              !Object.prototype.hasOwnProperty.call(
                PRIORITY,
                filters.priority,
              ) && (
                <option value={filters.priority}>
                  {combinedLabel(filters.priority, PRIORITY)}
                </option>
              )}

            {Object.entries(PRIORITY).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Category"
            value={filters.category}
            onChange={(event) =>
              changeFilter("category", event.target.value)
            }
            className={SELECT_CLASS}
          >
            <option value="">All Category</option>

            {filters.category &&
              !CATEGORIES.includes(filters.category) && (
                <option value={filters.category}>
                  {filters.category}
                </option>
              )}

            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={resetFilters}
            className="h-11 rounded-xl border border-base-content/10 px-5 text-sm font-medium transition hover:bg-base-200"
          >
            Reset
          </button>
        </div>
      </CardWithBlurBlob>

      {/* Tickets Table */}
      <CardWithBlurBlob className="overflow-hidden p-0" interactive={false}>
        {!tableLoading && (!usableData || visibleTickets.length === 0) ? (
          <div
            className="flex flex-col items-center justify-center px-5 py-20 text-center"
            role="status"
          >
            <SoftIconCard icon={Ticket} variant="slate" />

            <p className="mb-3 mt-3 text-xl text-base-content/60">
              {emptyTitle}
            </p>

            <p className="mt-1 max-w-md text-sm text-base-content/60">
              {emptyDescription}
            </p>

            {session.user && error && !usableData && (
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="mt-3 text-sm text-primary hover:underline"
              >
                {isFetching ? "Retrying..." : "Try again"}
              </button>
            )}
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
                    <th
                      key={label}
                      scope="col"
                      className="p-5 font-semibold"
                    >
                      {label}
                    </th>
                  ))}

                  <th scope="col" className="p-5 font-semibold">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              {tableLoading ? (
                <TicketsTableSkeleton />
              ) : (
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
                            {ticket.aiResult?.ticketTitle ||
                              "Untitled Ticket"}
                          </h3>

                          <p className="line-clamp-1 max-w-11/12 text-sm text-base-content/60">
                            {ticket.aiResult?.summary ||
                              "No summary available"}
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
                          {ticket.resolutionSource === "ai" ? (
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
                            {formatDate(
                              ticket.updatedAt || ticket.createdAt,
                            )}
                          </span>
                        </td>

                        <td className="p-5">
                          <Link to={`/manager/tickets/${ticket._id}`}>
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
              )}
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-base-content/10 px-5 py-3 sm:flex-row">
          <p className="text-sm text-base-content/60">
            {tableLoading
              ? "Loading tickets..."
              : !usableData
                ? "Tickets unavailable"
                : visibleTickets.length === 0
                  ? "No ticket found"
                  : `Showing ${visibleTickets.length} of ${totalTickets} tickets`}
          </p>

          {!tableLoading && usableData && visibleTickets.length > 0 && (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              setPage={changePage}
            />
          )}
        </div>
      </CardWithBlurBlob>
    </div>
  );
}