import { useContext, useState } from "react";
import GradientButton from "../../components/ui/Button/GradientButton";
import TextBadge from "../../components/ui/Badge/TextBadge";
import CardWithBlurBlob from "../../components/ui/Card/CardWithBlurBlob";
import { Search, Ticket } from "lucide-react";
import SoftIconCard from "../../components/ui/Card/SoftIconCard";
import { Link } from "react-router";
import { AuthContext } from "../../app/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";

const CustomerTicketsPage = () => {
  const { user } = useContext(AuthContext);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");

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
    data: tickets = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["myTickets", search, status, priority, category],
    enabled: !!user?.accessToken,
    queryFn: async () => {
      const res = await fetch(
        `http://localhost:3021/tickets/my-tickets?search=${search}&status=${status}&priority=${priority}&category=${category}`,
        {
          headers: {
            authorization: `Bearer ${user.accessToken}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch tickets");
      }
      const result = await res.json();
      return result.data || [];
    },
  });

  console.log(tickets);

  //  ++++++++++++++++++

  return (
    <div className="p-4 lg:p-5">
      {/* header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">My Tickets</h1>

          {/* <TextBadge variant="green">AI Enabled</TextBadge>
            
                      <TextBadge variant="blue">Avg response 12m</TextBadge> */}
        </div>

        <p className="mt-1 text-sm text-base-content/60">
          View and manage your support requests.
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
              placeholder="Search by title or ticket number..."
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
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
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
                    <td className="max-w-lg p-5">
                      <div className="space-y-2">
                        <div className="skeleton h-4 w-3/12"></div>
                        <div className="skeleton h-4 w-6/12"></div>
                        <div className="skeleton h-4 w-xl"></div>
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
                    {/* Updated */}
                    <td>
                      <div className="skeleton h-5 w-7/12"></div>
                    </td>
                    {/* Action */}
                    <td>
                      <div className="skeleton h-8 w-16"></div>
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
                    <td className="max-w-lg p-5">
                      <div>
                        <p className="text-xs text-base-content/50">
                          {ticket.ticketNumber}
                        </p>

                        <h3 className="font-medium">
                          {ticket.aiResult.ticketTitle}
                        </h3>

                        <p className="max-w-11/12 text-sm text-base-content/60 line-clamp-1">
                          {ticket.aiResult.summary}
                        </p>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <TextBadge variant="cyan">
                        {ticket.aiResult.category}
                      </TextBadge>
                    </td>

                    {/* Priority */}
                    <td>
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
                            ? "cyan"
                            : ticket.status === "in_progress"
                              ? "orange"
                              : ticket.status === "resolved"
                                ? "green"
                                : "gray"
                        }
                      >
                        {ticket.status.replace("_", " ")}
                      </TextBadge>
                    </td>

                    {/* Updated */}
                    <td>
                      <span className="text-sm text-base-content/60">
                        {new Date(ticket.updatedAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Action */}
                    <td>
                      <GradientButton
                        buttonClassName="
              from-primary/10
              to-secondary/10
              text-base-content
            "
                      >
                        View
                      </GradientButton>
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
            <SoftIconCard icon={Ticket} variant="slate"></SoftIconCard>
            <p className="mt-3 text-xl text-base-content/60 mb-3">
              No tickets found
            </p>
            <p className="text-sm text-base-content/60 mt-1 max-w-md">
              You don’t have any support tickets yet. Create your first ticket
              to get help from our support system or AI assistant.
            </p>
            <Link to="new">
              <GradientButton className="mt-5" buttonClassName="px-8">
                Create Ticket
              </GradientButton>
            </Link>

            <p className="text-xs text-base-content/40 mt-4">
              Tip: AI can automatically categorize your ticket after submission
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
              <span>Showing {tickets.length} tickets</span>
            )}
          </p>

          {/* ========= pagination ========== */}

          {!loading && tickets.length !== 0 && (
            <div className="join">
              <button className="join-item btn btn-sm">Previous</button>

              <button className="join-item btn btn-sm btn-active">1</button>

              <button className="join-item btn btn-sm">Next</button>
            </div>
          )}

          {/* ==================== */}
        </div>
      </CardWithBlurBlob>
    </div>
  );
};

export default CustomerTicketsPage;
