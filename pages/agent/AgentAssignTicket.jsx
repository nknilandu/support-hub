import { useContext, useEffect, useState } from "react";
import GradientButton from "../../components/ui/Button/GradientButton";
import TextBadge from "../../components/ui/Badge/TextBadge";
import CardWithBlurBlob from "../../components/ui/Card/CardWithBlurBlob";
import { Search, Ticket } from "lucide-react";
import SoftIconCard from "../../components/ui/Card/SoftIconCard";
import { Link } from "react-router";
import { AuthContext } from "../../app/providers/AuthProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Pagination from "../../components/ui/Pagination/pagination";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import LoadingPage from "../loading/LoadingPage/LoadingPage";
import AccountStatusNotice from "../../components/ui/Notice/AccountStatusNotice";

const AgentAssignTicket = () => {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [assignLoading, setAssignLoading] = useState(null);

  // Debounce search input & reset to page 1
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

  // ========== load agent profile ==============
  const {
    data: currentAgentData,
    isLoading: agentLoading,
    isError: agentError,
    error: agentErrorInfo,
    isFetching: agentFetching,
    refetch: refetchAgent,
  } = useQuery({
    queryKey: ["currentAgent", user?.uid],
    enabled: !!user,
    queryFn: async () => {
      const token = await user.getIdToken();
      const res = await fetch("http://localhost:3021/users/me", {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to load profile");
      }

      return result.user;
    },
  });

  const isApproved =
    currentAgentData?.role === "agent" &&
    currentAgentData?.status === "active" &&
    currentAgentData?.verifyIdAgent === "approved";

  // ========== load assigned tickets ==============
  const {
    data,
    isLoading: loading,
    isError: ticketsError,
    error: ticketsErrorInfo,
    refetch,
  } = useQuery({
    queryKey: [
      "myAssignedTickets",
      user?.uid,
      debouncedSearch,
      status,
      priority,
      category,
      page,
    ],
    enabled: !!user && isApproved,
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
        `http://localhost:3021/agent/assigned-tickets?${params.toString()}`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch assigned tickets");
      }
      return result;
    },
  });

  const tickets = data?.data || [];
  const pagination = data?.pagination || {};

  // ===================== handle release click ====================
  const handleRelease = async (ticketId) => {
    const result = await Swal.fire({
      title: "Return ticket to queue?",
      text: "This ticket will be removed from your assigned list and returned to the company queue.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, return to queue",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setAssignLoading(ticketId);
      const token = await user.getIdToken();

      const res = await fetch(
        `http://localhost:3021/agent/tickets/${ticketId}/release`,
        {
          method: "PATCH",
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      const responseData = await res.json();
      if (!res.ok || !responseData.success) {
        throw new Error(
          responseData.message || "Failed to return ticket to queue",
        );
      }

      await refetch();
      queryClient.invalidateQueries({ queryKey: ["companyTickets"] });
      queryClient.invalidateQueries({ queryKey: ["agentDashboard"] });

      Swal.fire({
        title: "Returned!",
        text: "The ticket has been returned to the company queue.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Release ticket error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setAssignLoading(null);
    }
  };

  if (agentLoading) {
    return <LoadingPage />;
  }

  if (agentError) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-5 text-center">
        <h2 className="text-lg font-semibold text-error">
          Failed to load agent profile
        </h2>

        <p className="mt-2 text-sm text-base-content/60">
          {agentErrorInfo?.message || "Something went wrong"}
        </p>

        <button
          type="button"
          onClick={() => refetchAgent()}
          className="btn btn-primary btn-sm mt-4"
        >
          Retry
        </button>
      </div>
    );
  }

if (!isApproved) {
    const noticeStatus =
      currentAgentData?.status === "suspended"
        ? "suspended"
        : currentAgentData?.verifyIdAgent === "rejected"
          ? "rejected"
          : "pending";

    return (
      <AccountStatusNotice
        role="agent"
        status={noticeStatus}
        rejectionReason={currentAgentData?.rejectionReason}
        userEmail={currentAgentData?.email || user?.email}
        companyName={currentAgentData?.companyName}
        isChecking={agentFetching}
        onRefresh={refetchAgent}
      />
    );
  }

  return (
    <div className="p-4 lg:p-5">
      {/* header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            My Assigned Tickets
          </h1>
        </div>

        <p className="mt-1 text-sm text-base-content/60">
          Review and manage tickets currently assigned to you.
        </p>
      </div>

      {/* Filters */}
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
              placeholder="Search by title, ticket number, or customer email..."
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

      {/* Tickets Table */}
      <CardWithBlurBlob className="overflow-hidden p-0" interactive={false}>
        {!loading && ticketsError ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <p className="font-semibold text-error">
              Failed to load assigned tickets
            </p>

            <p className="mt-2 text-sm text-base-content/60">
              {ticketsErrorInfo?.message || "Something went wrong."}
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

            <p className="mb-3 mt-3 text-xl text-base-content/60">
              No assigned tickets found
            </p>

            <p className="mt-1 max-w-md text-sm text-base-content/60">
              You currently have no tickets assigned to you, or your selected
              filters did not match any ticket.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr className="text-sm uppercase text-base-content/50">
                  <th className="p-5 font-semibold">Ticket</th>
                  <th className="p-5 font-semibold">Customer</th>
                  <th className="p-5 font-semibold">Category</th>
                  <th className="p-5 font-semibold">Priority</th>
                  <th className="p-5 font-semibold">Status</th>
                  <th className="p-5 font-semibold">Updated</th>
                  <th className="p-5 font-semibold"></th>
                </tr>
              </thead>

              {loading ? (
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {/* Ticket */}
                      <td className="max-w-md px-5 py-3">
                        <div className="space-y-2">
                          <div className="skeleton h-3 w-3/12"></div>
                          <div className="skeleton h-3 w-6/12"></div>
                          <div className="skeleton h-3 w-48"></div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="max-w-58 p-5">
                        <div className="space-y-2">
                          <div className="skeleton h-4 w-2/3"></div>
                          <div className="skeleton h-4 w-40"></div>
                        </div>
                      </td>

                      {/* Category */}
                      <td>
                        <div className="skeleton h-5 w-16"></div>
                      </td>

                      {/* Priority */}
                      <td>
                        <div className="skeleton h-5 w-16"></div>
                      </td>

                      {/* Status */}
                      <td>
                        <div className="skeleton h-5 w-16"></div>
                      </td>

                      {/* Updated */}
                      <td>
                        <div className="skeleton h-5 w-20"></div>
                      </td>

                      {/* Action */}
                      <td>
                        <div className="flex gap-2">
                          <div className="skeleton h-8 w-16"></div>
                          <div className="skeleton h-8 w-16"></div>
                        </div>
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

                    const normalizedStatus = (
                      ticket.status || "open"
                    ).toLowerCase();
                    const canRelease = ticket?.permission?.canRelease === true;

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
                                ticket.subject ||
                                "Untitled Ticket"}
                            </h3>

                            <p className="line-clamp-1 max-w-11/12 text-sm text-base-content/60">
                              {ticket.aiResult?.summary ||
                                ticket.description ||
                                "No summary available"}
                            </p>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="p-5">
                          <div>
                            <p className="text-sm font-medium text-base-content/80">
                              {ticket?.userInfo?.displayName || "N/A"}
                            </p>
                            <p className="mt-1 text-xs text-base-content/50">
                              {ticket?.userInfo?.email || "N/A"}
                            </p>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-5">
                          <TextBadge variant="cyan">
                            {ticket.aiResult?.category ||
                              ticket.category ||
                              "General"}
                          </TextBadge>
                        </td>

                        {/* Priority */}
                        <td className="p-5">
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
                              normalizedStatus === "open"
                                ? "blue"
                                : normalizedStatus === "assigned"
                                  ? "purple"
                                  : normalizedStatus === "in_progress"
                                    ? "yellow"
                                    : normalizedStatus === "resolved"
                                      ? "green"
                                      : "slate"
                            }
                          >
                            {normalizedStatus.replaceAll("_", " ")}
                          </TextBadge>
                        </td>

                        {/* Updated */}
                        <td className="p-5">
                          <span className="text-sm text-base-content/60">
                            {ticket.updatedAt
                              ? new Date(ticket.updatedAt).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <Link to={`/agent/tickets/${ticket._id}`}>
                              <GradientButton
                                size="sm"
                                buttonClassName="from-primary/20 to-secondary/10 text-base-content"
                              >
                                View
                              </GradientButton>
                            </Link>

                            {canRelease && (
                              <GradientButton
                                size="sm"
                                onClick={() => handleRelease(ticket._id)}
                                disabled={assignLoading === ticket._id}
                                buttonClassName="from-primary/10 to-secondary/20 text-base-content"
                              >
                                {assignLoading === ticket._id ? (
                                  <div className="px-4">
                                    <span className="loading loading-spinner loading-xs"></span>
                                  </div>
                                ) : (
                                  "Release"
                                )}
                              </GradientButton>
                            )}
                          </div>
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

export default AgentAssignTicket;
