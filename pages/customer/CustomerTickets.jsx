import { useContext, useEffect, useState } from "react";
import GradientButton from "../../components/ui/Button/GradientButton";
import TextBadge from "../../components/ui/Badge/TextBadge";
import CardWithBlurBlob from "../../components/ui/Card/CardWithBlurBlob";
import { PlusCircle, Search, Ticket } from "lucide-react";
import SoftIconCard from "../../components/ui/Card/SoftIconCard";
import { Link } from "react-router";
import { AuthContext } from "../../app/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import Pagination from "../../components/ui/Pagination/pagination";

const CustomerTickets = () => {
  const { user } = useContext(AuthContext);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search input & reset page to 1
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  // ==== handle reset ========
  const handleReset = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("");
    setPriority("");
    setCategory("");
    setPage(1);
  };

  // ========== load data from database ==============
  const {
    data,
    isLoading: loading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "myTickets",
      user?.uid,
      debouncedSearch,
      status,
      priority,
      category,
      page,
    ],
    enabled: !!user,
    queryFn: async () => {
      const token = await user.getIdToken();
      const params = new URLSearchParams({
        search: debouncedSearch,
        status,
        priority,
        category,
        page: String(page),
        limit: "10",
      });

      const res = await fetch(
        `http://localhost:3021/tickets/my-tickets?${params.toString()}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch tickets");
      }
      return result;
    },
  });

  const tickets = data?.data || [];
  const pagination = data?.pagination || {};
  const hasActiveFilters = Boolean(
    debouncedSearch || status || priority || category,
  );

  return (
    <div className="p-4 lg:p-5">
      {/* header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              My Tickets
            </h1>
            {!loading && typeof pagination.total === "number" && (
              <TextBadge variant="cyan" size="md">
                {pagination.total} Total
              </TextBadge>
            )}
          </div>

          <p className="mt-1 text-sm text-base-content/60">
            View and manage your support requests.
          </p>
        </div>

        <Link to="/customer/tickets/new">
          <GradientButton buttonClassName="gap-2 px-5">
            <PlusCircle size={16} />
            New Ticket
          </GradientButton>
        </Link>
      </div>

      {/* ======================================= */}
      {/* FILTERS */}
      {/* ======================================= */}
      <CardWithBlurBlob className="my-5 p-4" interactive={false}>
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or ticket number..."
              className="h-11 w-full rounded-xl border border-base-content/10 bg-base-100 pl-11 pr-4 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
            />
          </div>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-11 min-w-[160px] rounded-xl border border-base-content/10 bg-base-100 px-4 text-sm outline-none"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          {/* Priority */}
          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            className="h-11 min-w-[160px] rounded-xl border border-base-content/10 bg-base-100 px-4 text-sm outline-none"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="h-11 min-w-40 rounded-xl border border-base-content/10 bg-base-100 px-4 text-sm outline-none"
          >
            <option value="">All Category</option>
            <option value="technical">Technical</option>
            <option value="billing">Billing</option>
            <option value="account">Account</option>
            <option value="refund">Refund</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="other">Other</option>
          </select>

          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            className="h-11 rounded-xl border border-base-content/10 px-5 text-sm font-medium transition hover:bg-base-200"
          >
            Reset
          </button>
        </div>
      </CardWithBlurBlob>

      {/* ======================================= */}
      {/* TABLE / EMPTY STATE */}
      {/* ======================================= */}
      <CardWithBlurBlob className="overflow-hidden p-0" interactive={false}>
        {!loading && isError ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <p className="font-semibold text-error">Failed to load tickets</p>

            <p className="mt-2 text-sm text-base-content/60">
              {error?.message || "Something went wrong."}
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="btn btn-primary btn-sm mt-4"
            >
              Retry
            </button>
          </div>
        ) : !loading && tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
            <SoftIconCard icon={Ticket} variant="slate" />
            <p className="mb-2 mt-3 text-xl font-medium text-base-content/70">
              {hasActiveFilters
                ? "No matching tickets found"
                : "No tickets found"}
            </p>
            <p className="mt-1 max-w-md text-sm text-base-content/60">
              {hasActiveFilters
                ? "Try adjusting your search keywords or clearing active filters."
                : "You don’t have any support tickets yet. Create your first ticket to get help from our support system or AI assistant."}
            </p>
            {hasActiveFilters ? (
              <GradientButton
                type="button"
                onClick={handleReset}
                from="from-primary/20"
                to="to-secondary/20"
                className="mt-4"
              >
                Clear Filters
              </GradientButton>
            ) : (
              <Link to="/customer/tickets/new">
                <GradientButton className="mt-5" buttonClassName="px-8">
                  Create Ticket
                </GradientButton>
              </Link>
            )}

            <p className="mt-4 text-xs text-base-content/40">
              Tip: AI can automatically categorize your ticket after submission
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr className="text-xs uppercase text-base-content/50">
                  <th className="p-5 font-semibold">Ticket</th>
                  <th className="p-5 font-semibold">Category</th>
                  <th className="p-5 font-semibold">Priority</th>
                  <th className="p-5 font-semibold">Status</th>
                  <th className="p-5 font-semibold">Assigned</th>
                  <th className="p-5 font-semibold">Updated</th>
                  <th className="p-5 font-semibold"></th>
                </tr>
              </thead>

              {loading ? (
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="max-w-md px-5 py-3">
                        <div className="space-y-2">
                          <div className="skeleton h-3 w-3/12"></div>
                          <div className="skeleton h-3 w-6/12"></div>
                          <div className="skeleton h-3 w-full"></div>
                        </div>
                      </td>
                      <td>
                        <div className="skeleton h-5 w-16"></div>
                      </td>
                      <td>
                        <div className="skeleton h-5 w-16"></div>
                      </td>
                      <td>
                        <div className="skeleton h-5 w-16"></div>
                      </td>
                      <td>
                        <div className="skeleton h-5 w-24"></div>
                      </td>
                      <td>
                        <div className="skeleton h-5 w-20"></div>
                      </td>
                      <td>
                        <div className="skeleton h-8 w-16"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody>
                  {tickets.map((ticket) => {
                    const priorityState = ticket?.aiResult?.states?.find(
                      (item) => item.title?.toLowerCase() === "priority",
                    );

                    return (
                      <tr key={ticket._id}>
                        {/* Ticket */}
                        <td className="max-w-md px-5 py-3">
                          <div>
                            <p className="font-mono text-xs text-base-content/50">
                              {ticket.ticketNumber}
                            </p>

                            <h3 className="line-clamp-1 font-medium">
                              {ticket.aiResult?.ticketTitle ||
                                "Untitled Ticket"}
                            </h3>

                            <p className="line-clamp-1 max-w-11/12 text-sm text-base-content/60">
                              {ticket.aiResult?.summary ||
                                "No summary available"}
                            </p>
                          </div>
                        </td>

                        {/* Category */}
                        <td>
                          <TextBadge variant="cyan">
                            {ticket.aiResult?.category || "General"}
                          </TextBadge>
                        </td>

                        {/* Priority */}
                        <td>
                          <TextBadge
                            variant={priorityState?.variant || "slate"}
                          >
                            {priorityState?.value || "Normal"}
                          </TextBadge>
                        </td>

                        {/* Status */}
                        <td>
                          <TextBadge
                            variant={
                              ticket.status === "open"
                                ? "blue"
                                : ticket.status === "assigned"
                                  ? "purple"
                                  : ticket.status === "in_progress"
                                    ? "yellow"
                                    : ticket.status === "resolved"
                                      ? "green"
                                      : "slate"
                            }
                          >
                            {(ticket.status || "open").replace("_", " ")}
                          </TextBadge>
                        </td>

                        {/* Assigned */}
                        <td>
                          {ticket?.aiResolved ? (
                            <p className="text-xs font-semibold text-primary/70">
                              Resolved by AI
                            </p>
                          ) : ticket?.currentAgentInfo ? (
                            <div>
                              <p className="text-sm font-medium text-base-content/80">
                                {ticket.currentAgentInfo.displayName || "N/A"}
                              </p>

                              <p className="text-xs text-base-content/50">
                                {ticket.currentAgentInfo.email ||
                                  "Email not available"}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs italic text-base-content/40">
                              Unassigned
                            </p>
                          )}
                        </td>

                        {/* Updated */}
                        <td>
                          <span className="text-sm text-base-content/60">
                            {new Date(ticket.updatedAt).toLocaleDateString()}
                          </span>
                        </td>

                        {/* Action */}
                        <td>
                          <Link to={`/customer/tickets/${ticket._id}`}>
                            <GradientButton
                              size="sm"
                              buttonClassName="from-primary/10 to-secondary/20 text-base-content"
                            >
                              View
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
            {loading ? (
              <span>Loading tickets...</span>
            ) : tickets.length === 0 ? (
              <span>No ticket found</span>
            ) : (
              <span>
                Showing {tickets.length} of {pagination.total ?? tickets.length}{" "}
                tickets
              </span>
            )}
          </p>

          {/* ========= pagination ========== */}
          {!loading && tickets.length !== 0 && (
            <Pagination
              page={page}
              setPage={setPage}
              totalPages={pagination.totalPages || 1}
            />
          )}
        </div>
      </CardWithBlurBlob>
    </div>
  );
};

export default CustomerTickets;
