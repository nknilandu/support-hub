import { useContext, useState } from "react";
import GradientButton from "../../components/ui/Button/GradientButton";
import TextBadge from "../../components/ui/Badge/TextBadge";
import CardWithBlurBlob from "../../components/ui/Card/CardWithBlurBlob";
import { Search, Ticket } from "lucide-react";
import SoftIconCard from "../../components/ui/Card/SoftIconCard";
import { Link } from "react-router";
import { AuthContext } from "../../app/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import Pagination from "../../components/ui/Pagination/pagination";
import { toast } from "react-toastify";

const AgentCompanyTickets = () => {
  const { user } = useContext(AuthContext);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [assignLoading, setAssignLoading] = useState(null);

  //   ==== handle reset ========
  const handleReset = () => {
    setSearch("");
    setStatus("");
    setPriority("");
    setCategory("");
    refetch();
  };
  //   ========== load data from database ==============
  const {
    data,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["companyTickets", search, status, priority, category, page],
    enabled: !!user?.accessToken,
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3021/agent/company-tickets?search=${search}&status=${status}&priority=${priority}&category=${category}&page=${page}&limit=10`,
        {
          headers: {
            authorization: `Bearer ${user.accessToken}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch tickets");
      }
      return res.json();
    },
  });

  const tickets = data?.data || [];
  const pagination = data?.pagination || {};
  const currentAgent = data?.currentAgent;

  // console.log(tickets);

  //===================== handle click ====================
  const handleAssign = async (ticketId) => {
    try {
      setAssignLoading(ticketId);
      const res = await fetch(
        `http://localhost:3021/agent/tickets/${ticketId}/assign`,
        {
          method: "PATCH",
          headers: {
            authorization: `Bearer ${user.accessToken}`,
          },
        },
      );

      const data = await res.json();
      // console.log(data);

      if (data.success) {
        toast(`Ticket Assigned`);
        refetch();
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setAssignLoading(null);
    }
  };

  //  ++++++++++++++++++

  return (
    <div className="p-4 lg:p-5">
      {/* header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Company Tickets
          </h1>
        </div>

        <p className="mt-1 text-sm text-base-content/60">
          Manage customer tickets assigned to your company queue.
        </p>
      </div>

      {/* ======================================= */}

      <CardWithBlurBlob className="p-4 my-5" interactive={false}>
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              size={18}
              className="
      absolute
      left-4
      top-1/2
      -translate-y-1/2
      text-base-content/40
      pointer-events-none
    "
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or ticket number or customer email..."
              className="
      w-full
      h-11
      rounded-xl
      border border-base-content/10
      bg-base-100
      pl-11
      pr-4
      text-sm
      outline-none
      transition
      focus:border-primary/40
      focus:ring-4
      focus:ring-primary/10
    "
            />
          </div>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="
        h-11
        min-w-[160px]
        rounded-xl
        border border-base-content/10
        bg-base-100
        px-4
        text-sm
        outline-none
      "
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
            onChange={(e) => setPriority(e.target.value)}
            className="
        h-11
        min-w-[160px]
        rounded-xl
        border border-base-content/10
        bg-base-100
        px-4
        text-sm
        outline-none
      "
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
            onChange={(e) => setCategory(e.target.value)}
            className="
        h-11
        min-w-40
        rounded-xl
        border border-base-content/10
        bg-base-100
        px-4
        text-sm
        outline-none
      "
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
            onClick={handleReset}
            className="
        h-11
        px-5
        rounded-xl
        border border-base-content/10
        text-sm font-medium
        hover:bg-base-200
        transition
      "
          >
            Reset
          </button>
        </div>
      </CardWithBlurBlob>

      {/* ======================================= */}
      <CardWithBlurBlob className="overflow-hidden p-0" interactive={false}>
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr className="text-sm uppercase text-base-content/50">
                <th className="p-5 font-semibold">Ticket</th>
                <th className="p-5 font-semibold">Customer</th>
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
                    {/* Ticket */}
                    <td className="max-w-md px-5 py-0">
                      <div className="space-y-2">
                        <div className="skeleton h-3 w-3/12"></div>
                        <div className="skeleton h-3 w-6/12"></div>
                        <div className="skeleton h-3 w-sm"></div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="max-w-58 p-5">
                      <div className="space-y-2">
                        <div className="skeleton h-4 w-2/3"></div>
                        <div className="skeleton h-4 w-52"></div>
                      </div>
                    </td>
                    {/* Category */}
                    <td>
                      <div className="skeleton h-5 w-7/12"></div>
                    </td>
                    {/* Priority */}
                    <td>
                      <div className="skeleton h-5 w-7/12"></div>
                    </td>
                    {/* Status */}
                    <td>
                      <div className="skeleton h-5 w-7/12"></div>
                    </td>
                    {/* Status */}
                    <td>
                      <div className="skeleton h-5 w-7/12"></div>
                    </td>
                    {/* Updated */}
                    <td>
                      <div className="skeleton h-5 w-7/12"></div>
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
            ) : tickets.length === 0 ? (
              <tbody>
                <tr>
                  <td>
                    <div className="w-106"></div>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket._id}>
                    {/* Ticket */}
                    <td className="max-w-md px-5 py-2">
                      <div>
                        <p className="text-xs text-base-content/50">
                          {ticket.ticketNumber}
                        </p>

                        <h3 className="font-medium line-clamp-1">
                          {ticket.aiResult?.ticketTitle ||
                            ticket.subject ||
                            "Untitled Ticket"}
                        </h3>

                        <p className="max-w-11/12 text-sm text-base-content/60 line-clamp-1">
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
                          {ticket.email || ticket.customerEmail || "No email"}
                        </p>
                        <p className="text-xs text-base-content/50 mt-1">
                          {ticket.uid || "null"}
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
                        variant={
                          ticket?.aiResult?.states?.find(
                            (item) => item.title?.toLowerCase() === "priority",
                          )?.variant
                        }
                      >
                        {
                          ticket?.aiResult?.states?.find(
                            (item) => item.title?.toLowerCase() === "priority",
                          )?.value
                        }
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
                                  : "gray"
                        }
                      >
                        {(ticket.status || "open").replaceAll("_", " ")}
                      </TextBadge>
                    </td>

                    {/* Assigned */}
                    <td>
                      {ticket.assignedAgent ? (
                        <div>
                          <p className="text-sm font-medium text-base-content/80">
                            {ticket.assignedAgent.displayName || "Agent"}
                          </p>

                          <p className="text-xs text-base-content/50">
                            {ticket.assignedAgent.email || "email not found"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs italic text-base-content/40">
                          Unassigned
                        </p>
                      )}
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
                        {(!ticket.assignedAgent ||
                          ticket.assignedAgent.email === currentAgent) && (
                          <Link to={`/agent/tickets/${ticket._id}`}>
                            <GradientButton
                              size="sm"
                              buttonClassName="
          from-primary/20
          to-secondary/10
          text-base-content
        "
                            >
                              View
                            </GradientButton>
                          </Link>
                        )}

                        {!ticket.assignedAgent && ticket.status === "open" && (
                          <GradientButton
                            size="sm"
                            onClick={() => handleAssign(ticket._id)}
                            disabled={assignLoading === ticket._id}
                            buttonClassName="
        from-primary/10
        to-secondary/20
        text-base-content
      "
                          >
                            {assignLoading === ticket._id ? (
                              <div className="px-3">
                                <span className="loading loading-spinner loading-xs"></span>
                              </div>
                            ) : (
                              "Assign"
                            )}
                          </GradientButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {/* ================== */}
        {!loading && tickets.length === 0 && (
          <div className="py-20 px-5 text-center flex flex-col justify-center items-center">
            <SoftIconCard icon={Ticket} variant="slate" />

            <p className="mt-3 text-xl text-base-content/60 mb-3">
              No company tickets found
            </p>

            <p className="text-sm text-base-content/60 mt-1 max-w-md">
              No customer tickets are available in your company queue right now,
              or your current filters did not match any ticket.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-base-content/10 px-5 py-3">
          <p className="text-sm text-base-content/60">
            {loading ? (
              <span>Loading tickets...</span>
            ) : tickets.length === 0 ? (
              <span>No ticket found</span>
            ) : (
              <span>
                Showing {tickets.length} of {pagination.total} tickets
              </span>
            )}
          </p>

          {/* ========= pagination ========== */}

          {!loading && tickets.length !== 0 && (
            <Pagination
              page={page}
              setPage={setPage}
              totalPages={pagination.totalPages || 1}
            ></Pagination>
          )}

          {/* ==================== */}
        </div>
      </CardWithBlurBlob>
    </div>
  );
};

export default AgentCompanyTickets;
