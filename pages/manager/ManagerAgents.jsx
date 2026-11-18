import { useContext, useEffect, useRef, useState } from "react";

import {
  Clock3,
  Headphones,
  Search,
  ShieldCheck,
  TicketCheck,
  Users,
  UserX,
  X,
} from "lucide-react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useSearchParams } from "react-router";
import { toast } from "react-toastify";

import { AuthContext } from "../../app/providers/AuthProvider";
import LoadingPage from "../loading/LoadingPage/LoadingPage";

import CardWithBlurBlob from "../../components/ui/Card/CardWithBlurBlob";
import SoftIconCard from "../../components/ui/Card/SoftIconCard";
import TextBadge from "../../components/ui/Badge/TextBadge";
import GradientButton from "../../components/ui/Button/GradientButton";
import Pagination from "../../components/ui/Pagination/pagination";

// =====================================================
// CONFIGURATION
// =====================================================

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3021"
).replace(/\/+$/, "");

const APPROVAL_META = {
  approved: { label: "Approved", variant: "green" },
  pending: { label: "Pending", variant: "warning" },
  rejected: { label: "Rejected", variant: "red" },
};

const ACCOUNT_META = {
  active: { label: "Active", variant: "cyan" },
  suspended: { label: "Suspended", variant: "red" },
};

const SELECT_CLASS =
  "h-11 min-w-[165px] rounded-xl border border-base-content/10 bg-base-100 px-4 text-sm outline-none transition focus:border-primary/40";

const EMPTY_COUNTS = {
  total: 0,
  approved: 0,
  pending: 0,
  suspended: 0,
  totalSolved: 0,
};

const ACTION_TITLES = {
  approve: "Approve Agent",
  reject: "Reject Agent Application",
  suspend: "Suspend Agent Account",
  activate: "Activate Agent Account",
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

function retryRequest(failureCount, error) {
  if (error?.status >= 400 && error?.status < 500) {
    return false;
  }

  return failureCount < 1;
}

function pollingInterval(query) {
  return [401, 403, 404].includes(query.state.error?.status) ? false : 30_000;
}

function safePage(value, currentPage, totalPages) {
  const next = typeof value === "function" ? value(currentPage) : value;

  if (!Number.isInteger(next)) return currentPage;

  return Math.max(1, Math.min(next, totalPages));
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

// =====================================================
// SHARED UI
// =====================================================

function AgentAvatar({ agent, large = false }) {
  const [failed, setFailed] = useState(false);
  const sizeClass = large ? "h-14 w-14" : "h-9 w-9";

  useEffect(() => {
    setFailed(false);
  }, [agent.photoURL]);

  if (agent.photoURL && !failed) {
    return (
      <img
        src={agent.photoURL}
        alt={agent.displayName || "Agent"}
        onError={() => setFailed(true)}
        className={`${sizeClass} shrink-0 rounded-xl object-cover`}
      />
    );
  }

  return (
    <SoftIconCard
      icon={Headphones}
      variant="purple"
      size={large ? 22 : 16}
      className={`${sizeClass} shrink-0`}
    />
  );
}

function AgentModal({ title, onClose, busy = false, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;

    if (dialog && !dialog.open) {
      dialog.showModal();
    }

    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  function closeModal() {
    if (!busy) onClose();
  }

  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={(event) => {
        event.preventDefault();
        closeModal();
      }}
    >
      <div className="modal-box max-w-2xl rounded-2xl border border-base-content/10 bg-base-100 p-6">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-base-content/10 pb-4">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>

          <button
            type="button"
            aria-label="Close modal"
            disabled={busy}
            onClick={closeModal}
            className="btn btn-ghost btn-square btn-sm rounded-xl"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>

      <form method="dialog" className="modal-backdrop">
        <button type="button" disabled={busy} onClick={closeModal}>
          Close
        </button>
      </form>
    </dialog>
  );
}

function AgentTableSkeleton() {
  return (
    <tbody aria-label="Loading agents" aria-busy="true">
      {Array.from({ length: 5 }, (_, index) => (
        <tr key={index} className="h-[76px]">
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="skeleton h-9 w-9 shrink-0 rounded-xl" />

              <div className="min-w-[150px] space-y-2">
                <div
                  className={`skeleton h-4 rounded-md ${
                    index % 2 === 0 ? "w-28" : "w-36"
                  }`}
                />
                <div className="skeleton h-3 w-40 rounded-md" />
              </div>
            </div>
          </td>

          <td className="px-5 py-3.5">
            <div className="skeleton h-6 w-20 rounded-lg" />
          </td>

          <td className="px-5 py-3.5">
            <div className="skeleton h-6 w-16 rounded-lg" />
          </td>

          <td className="px-5 py-3.5 text-center">
            <div className="skeleton mx-auto h-5 w-7 rounded-md" />
          </td>

          <td className="px-5 py-3.5 text-center">
            <div className="skeleton mx-auto h-6 w-10 rounded-lg" />
          </td>

          <td className="px-5 py-3.5">
            <div className="skeleton h-4 w-24 rounded-md" />
          </td>

          <td className="px-5 py-3.5">
            <div className="flex justify-end gap-2">
              <div className="skeleton h-8 w-20 rounded-xl" />
              <div className="skeleton h-8 w-16 rounded-xl" />
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
}

function AgentDetailsSkeleton() {
  return (
    <div
      className="space-y-5"
      aria-label="Loading agent details"
      aria-busy="true"
    >
      <div className="flex items-center gap-3.5">
        <div className="skeleton h-14 w-14 shrink-0 rounded-xl" />

        <div className="space-y-2">
          <div className="skeleton h-4 w-36 rounded-md" />
          <div className="skeleton h-3 w-48 rounded-md" />

          <div className="flex gap-2">
            <div className="skeleton h-5 w-20 rounded-lg" />
            <div className="skeleton h-5 w-16 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-xl border border-base-content/10 bg-base-200/30 p-4 text-sm sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="space-y-2">
            <div className="skeleton h-3 w-20 rounded-md" />
            <div className="skeleton h-4 w-16 rounded-md" />
          </div>
        ))}
      </div>

      <div>
        <div className="skeleton mb-3 h-4 w-32 rounded-md" />

        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3 rounded-xl border border-base-content/10 px-3.5 py-2.5"
            >
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded-md" />
                <div className="skeleton h-3 w-1/2 rounded-md" />
              </div>

              <div className="space-y-2">
                <div className="skeleton ml-auto h-5 w-16 rounded-lg" />
                <div className="skeleton h-3 w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// PROFILE GATE
// =====================================================

export default function ManagerAgents() {
  const { user, loading: authLoading } = useContext(AuthContext);

  const profileQuery = useQuery({
    queryKey: ["manager-profile", user?.uid],
    enabled: !!user && !authLoading,

    queryFn: async ({ signal }) => {
      const result = await apiRequest(user, "/users/me", {
        signal,
      });

      if (!result.user) {
        throw new Error("Unable to read your profile");
      }

      return result.user;
    },

    retry: retryRequest,
    staleTime: 30_000,
  });

  if (authLoading || (!!user && profileQuery.isPending)) {
    return <LoadingPage />;
  }

  const manager = profileQuery.data;

  const isManager = manager?.role === "manager" && manager?.status === "active";

  if (!user || profileQuery.isError || !isManager) {
    return (
      <div className="p-4 lg:p-5">
        <CardWithBlurBlob className="p-5" interactive={false}>
          <p className="text-sm text-base-content/70">
            {!user
              ? "Sign in with your manager account to continue."
              : profileQuery.isError
                ? profileQuery.error.message
                : "An active manager account is required."}
          </p>

          {user && profileQuery.isError && (
            <button
              type="button"
              onClick={() => profileQuery.refetch()}
              disabled={profileQuery.isFetching}
              className="mt-3 text-sm text-primary hover:underline"
            >
              {profileQuery.isFetching ? "Retrying..." : "Try again"}
            </button>
          )}
        </CardWithBlurBlob>
      </div>
    );
  }

  return (
    <ManagerAgentsContent
      key={`${user.uid}:${manager.companyId || ""}`}
      user={user}
      companyId={manager.companyId}
    />
  );
}

// =====================================================
// MANAGER AGENTS CONTENT
// =====================================================

function ManagerAgentsContent({ user, companyId }) {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [approvalFilter, setApprovalFilter] = useState(() => {
    const value = searchParams.get("approval");

    return ["approved", "pending", "rejected"].includes(value) ? value : "";
  });

  const [accountFilter, setAccountFilter] = useState("");
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState(null);
  const [reason, setReason] = useState("");
  const [actionError, setActionError] = useState("");
  const [solvedPage, setSolvedPage] = useState(1);

  const submitLock = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  // =====================================================
  // STABLE COMPANY SUMMARY
  // =====================================================

  const summaryQuery = useQuery({
    queryKey: ["manager-agents-summary", user.uid, companyId],

    queryFn: async ({ signal }) => {
      const result = await apiRequest(user, "/manager/agents?page=1", {
        signal,
      });

      if (!result.counts || !result.seats) {
        throw new Error("Incomplete agent summary response");
      }

      return {
        counts: result.counts,
        seats: result.seats,
      };
    },

    retry: retryRequest,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    refetchInterval: pollingInterval,
  });

  // =====================================================
  // FILTERED TABLE
  // =====================================================

  const listQuery = useQuery({
    queryKey: [
      "manager-agents",
      user.uid,
      companyId,
      debouncedSearch,
      approvalFilter,
      accountFilter,
      page,
    ],

    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({
        page: String(page),
        search: debouncedSearch,
        approval: approvalFilter,
        status: accountFilter,
      });

      const result = await apiRequest(
        user,
        `/manager/agents?${params.toString()}`,
        { signal },
      );

      if (!Array.isArray(result.agents) || !result.pagination) {
        throw new Error("Incomplete agents response");
      }

      return result;
    },

    retry: retryRequest,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
    refetchInterval: pollingInterval,
  });

  const accessDenied = [
    listQuery.error?.status,
    summaryQuery.error?.status,
  ].some((status) => [401, 403, 404].includes(status));

  const data = accessDenied ? null : listQuery.data;
  const summaryData = accessDenied ? null : summaryQuery.data;

  const tableLoading = !accessDenied && listQuery.isPending;

  const summaryLoading =
    !accessDenied && summaryQuery.isPending && !summaryData;

  const visibleAgents = data?.agents || [];
  const counts = summaryData?.counts || EMPTY_COUNTS;
  const seats = summaryData?.seats || {};

  const totalPages = data?.pagination?.totalPages || 1;
  const currentPage = data?.pagination?.page || page;
  const filteredTotal = data?.pagination?.total || 0;

  const configuredLimit = typeof seats.limit === "number" ? seats.limit : null;

  const limitReached = seats.enforced !== false && seats.limitReached === true;

  useEffect(() => {
    const serverPage = data?.pagination?.page;

    if (serverPage && serverPage !== page) {
      setPage(serverPage);
    }
  }, [data?.pagination?.page, page]);

  // =====================================================
  // DETAILS
  // =====================================================

  const detailsQuery = useQuery({
    queryKey: [
      "manager-agent-details",
      user.uid,
      companyId,
      modal?.uid,
      solvedPage,
    ],

    enabled: !accessDenied && modal?.type === "details",

    queryFn: async ({ signal }) => {
      const result = await apiRequest(
        user,
        `/manager/agents/${encodeURIComponent(
          modal.uid,
        )}?solvedPage=${solvedPage}`,
        { signal },
      );

      if (!result.agent) {
        throw new Error("Incomplete agent details response");
      }

      return result;
    },

    retry: retryRequest,
    staleTime: 0,
  });

  const selectedAgent =
    modal?.type === "details" ? detailsQuery.data?.agent : modal?.agent;

  const solvedTickets = selectedAgent?.solvedTickets || [];
  const solvedPagination = detailsQuery.data?.solvedPagination;

  // =====================================================
  // ACTIONS
  // =====================================================

  const actionMutation = useMutation({
    mutationFn: ({ uid, action, actionReason }) =>
      apiRequest(user, `/manager/agents/${encodeURIComponent(uid)}/action`, {
        method: "PATCH",
        body: {
          action,
          ...(actionReason ? { reason: actionReason } : {}),
        },
      }),
  });

  const actionLoading = actionMutation.isPending;

  function resetFilters() {
    setSearch("");
    setDebouncedSearch("");
    setApprovalFilter("");
    setAccountFilter("");
    setPage(1);
  }

  function openModal(type, agent) {
    if (submitLock.current || accessDenied) return;

    setReason("");
    setActionError("");
    setSolvedPage(1);
    actionMutation.reset();

    setModal({
      type,
      uid: agent.uid,
      agent,
    });
  }

  function closeModal() {
    if (!submitLock.current) setModal(null);
  }

  function refreshManagerQueries() {
    void Promise.allSettled([
      queryClient.invalidateQueries({
        queryKey: ["manager-agents"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["manager-agents-summary"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["manager-agent-details"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["manager-overview"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["manager-tickets"],
      }),
    ]);
  }

  async function handleActionSubmit(event) {
    event.preventDefault();

    if (!selectedAgent || !modal || submitLock.current || accessDenied) {
      return;
    }

    if (modal.type === "approve" && limitReached) {
      setActionError("Agent seat limit reached.");
      return;
    }

    if (modal.type === "reject" && !reason.trim()) {
      setActionError("Please provide a rejection reason.");
      return;
    }

    submitLock.current = true;
    setActionError("");

    try {
      const result = await actionMutation.mutateAsync({
        uid: selectedAgent.uid,
        action: modal.type,
        actionReason: ["approve", "reject"].includes(modal.type)
          ? reason.trim()
          : "",
      });

      toast.success(result.message || "Agent updated successfully");

      setModal(null);
      refreshManagerQueries();
    } catch (error) {
      setActionError(error.message || "Unable to update agent");

      if ([401, 403, 409].includes(error.status)) {
        refreshManagerQueries();
      }
    } finally {
      submitLock.current = false;
    }
  }

  const stats = [
    {
      title: "Total Agents",
      value: counts.total,
      note: "Company roster",
      icon: Users,
      variant: "blue",
    },
    {
      title: "Agent Seats",
      value:
        configuredLimit === null
          ? counts.approved
          : `${counts.approved}/${configuredLimit}`,
      note:
        configuredLimit === null
          ? "Limit not configured"
          : `${seats.remainingSeats ?? 0} seats remaining`,
      icon: ShieldCheck,
      variant: "purple",
    },
    {
      title: "Pending Review",
      value: counts.pending,
      note: "Awaiting approval",
      icon: Clock3,
      variant: "warning",
    },
    {
      title: "Tickets Solved",
      value: counts.totalSolved,
      note: "Resolved by agents",
      icon: TicketCheck,
      variant: "green",
    },
    {
      title: "Suspended",
      value: counts.suspended,
      note: "Access restricted",
      icon: UserX,
      variant: "red",
    },
  ];

  function renderActions(agent, inModal = false) {
    const permission = agent.permission;

    const canApprove =
      ["pending", "rejected"].includes(agent.verifyIdAgent) &&
      permission?.canApprove !== false;

    const canReject =
      agent.verifyIdAgent === "pending" && permission?.canReject !== false;

    const canSuspend =
      agent.verifyIdAgent === "approved" &&
      agent.status === "active" &&
      permission?.canSuspend !== false;

    const canActivate =
      agent.verifyIdAgent === "approved" &&
      agent.status === "suspended" &&
      permission?.canActivate !== false;

    return (
      <>
        {canApprove && (
          <GradientButton
            size="sm"
            disabled={limitReached || actionLoading}
            title={limitReached ? "Agent seat limit reached" : "Approve agent"}
            onClick={() => openModal("approve", agent)}
            buttonClassName="from-success/15 to-success/25 text-success"
          >
            Approve
          </GradientButton>
        )}

        {canReject && (
          <GradientButton
            size="sm"
            disabled={actionLoading}
            onClick={() => openModal("reject", agent)}
            buttonClassName="from-error/15 to-error/25 text-error"
          >
            Reject
          </GradientButton>
        )}

        {(canSuspend || canActivate) && (
          <GradientButton
            size="sm"
            disabled={actionLoading}
            onClick={() =>
              openModal(canSuspend ? "suspend" : "activate", agent)
            }
            buttonClassName={
              canSuspend
                ? "from-warning/15 to-warning/25 text-warning"
                : "from-success/15 to-success/25 text-success"
            }
          >
            {canSuspend
              ? inModal
                ? "Suspend Account"
                : "Suspend"
              : inModal
                ? "Activate Account"
                : "Activate"}
          </GradientButton>
        )}
      </>
    );
  }

  const tableError = accessDenied
    ? listQuery.error || summaryQuery.error
    : !data
      ? listQuery.error
      : null;

  return (
    <div className="p-4 lg:p-5">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Support Agents
          </h1>

          <TextBadge variant="purple" size="sm">
            Team
          </TextBadge>
        </div>

        <p className="mt-1 text-sm text-base-content/60">
          {data && listQuery.isError
            ? "Could not refresh. Showing the last loaded agent data."
            : "Manage agent approvals, account status, and view solved ticket details."}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((item) => (
          <CardWithBlurBlob
            key={item.title}
            interactive={false}
            className="h-full p-4"
          >
            {summaryLoading ? (
              <div role="status" aria-label={`Loading ${item.title}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="skeleton h-10 w-10 shrink-0 rounded-xl" />
                  <div className="skeleton h-8 w-16 rounded-lg" />
                </div>

                <div className="skeleton mt-3 h-5 w-28 rounded-md" />
                <div className="skeleton mt-1 h-4 w-32 max-w-full rounded-md" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <SoftIconCard
                    icon={item.icon}
                    variant={item.variant}
                    size={17}
                  />

                  <p className="text-2xl font-semibold tabular-nums">
                    {summaryData ? item.value : "—"}
                  </p>
                </div>

                <p className="mt-3 text-sm font-medium text-base-content/80">
                  {item.title}
                </p>

                <p className="mt-0.5 text-xs text-base-content/50">
                  {summaryData ? item.note : "Summary unavailable"}
                </p>
              </>
            )}
          </CardWithBlurBlob>
        ))}
      </div>

      {summaryQuery.isError && !accessDenied && (
        <div role="alert" className="mt-2 text-xs text-base-content/60">
          {summaryData
            ? "Could not refresh summary. Showing the last loaded counts."
            : "Unable to load agent summary."}{" "}
          <button
            type="button"
            disabled={summaryQuery.isFetching}
            onClick={() => summaryQuery.refetch()}
            className="text-primary hover:underline disabled:opacity-50"
          >
            {summaryQuery.isFetching ? "Retrying..." : "Retry"}
          </button>
        </div>
      )}

      {/* Search & Dropdown Filters */}
      <CardWithBlurBlob className="my-5 p-4" interactive={false}>
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40"
            />

            <input
              type="search"
              value={search}
              maxLength={100}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search agent by name or email..."
              className="h-11 w-full rounded-xl border border-base-content/10 bg-base-100 pl-11 pr-4 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <select
            value={approvalFilter}
            onChange={(event) => {
              setApprovalFilter(event.target.value);
              setPage(1);
            }}
            className={SELECT_CLASS}
          >
            <option value="">All Approval</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={accountFilter}
            onChange={(event) => {
              setAccountFilter(event.target.value);
              setPage(1);
            }}
            className={SELECT_CLASS}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
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

      {/* Agents Table */}
      <CardWithBlurBlob className="overflow-hidden p-0" interactive={false}>
        {tableError ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <SoftIconCard icon={Users} variant="slate" />

            <p className="mt-3 text-lg font-medium text-base-content/70">
              Unable to load agents
            </p>

            <p className="mt-1 max-w-md text-sm text-base-content/50">
              {tableError.message}
            </p>

            <button
              type="button"
              disabled={listQuery.isFetching || summaryQuery.isFetching}
              onClick={() => {
                void listQuery.refetch();
                void summaryQuery.refetch();
              }}
              className="mt-3 text-sm text-primary hover:underline"
            >
              {listQuery.isFetching || summaryQuery.isFetching
                ? "Retrying..."
                : "Try again"}
            </button>
          </div>
        ) : !tableLoading && visibleAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <SoftIconCard icon={Users} variant="slate" />

            <p className="mt-3 text-lg font-medium text-base-content/70">
              No agents found
            </p>

            <p className="mt-1 max-w-md text-sm text-base-content/50">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr className="border-b border-base-content/10 text-xs uppercase tracking-wider text-base-content/50">
                  <th className="px-5 py-3.5 font-semibold">Agent</th>
                  <th className="px-5 py-3.5 font-semibold">Approval</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-center font-semibold">
                    Active Tickets
                  </th>
                  <th className="px-5 py-3.5 text-center font-semibold">
                    Solved Tickets
                  </th>
                  <th className="px-5 py-3.5 font-semibold">Joined</th>
                  <th className="px-5 py-3.5 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              {tableLoading ? (
                <AgentTableSkeleton />
              ) : (
                <tbody className="divide-y divide-base-content/5 text-sm">
                  {visibleAgents.map((agent) => {
                    const approvalInfo = APPROVAL_META[agent.verifyIdAgent] || {
                      label: "Unknown",
                      variant: "slate",
                    };

                    const accountInfo = ACCOUNT_META[agent.status] || {
                      label: "Unknown",
                      variant: "slate",
                    };

                    return (
                      <tr
                        key={agent.uid}
                        onClick={() => openModal("details", agent)}
                        className="cursor-pointer transition-colors hover:bg-base-200/50"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <AgentAvatar agent={agent} />

                            <div className="min-w-0">
                              <p className="truncate font-medium text-base-content">
                                {agent.displayName || "Unnamed agent"}
                              </p>
                              <p className="truncate text-xs text-base-content/50">
                                {agent.email || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <TextBadge size="sm" variant={approvalInfo.variant}>
                            {approvalInfo.label}
                          </TextBadge>
                        </td>

                        <td className="px-5 py-3.5">
                          <TextBadge size="sm" variant={accountInfo.variant}>
                            {accountInfo.label}
                          </TextBadge>
                        </td>

                        <td className="px-5 py-3.5 text-center font-medium text-base-content/80">
                          {agent.activeCount ?? 0}
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          <TextBadge size="sm" variant="green">
                            {agent.solvedCount ?? 0}
                          </TextBadge>
                        </td>

                        <td className="whitespace-nowrap px-5 py-3.5 text-xs text-base-content/60">
                          {formatDate(agent.createdAt)}
                        </td>

                        <td
                          className="px-5 py-3.5 text-right"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="inline-flex items-center justify-end gap-2">
                            {renderActions(agent)}
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
          <p className="text-xs text-base-content/60">
            {tableLoading
              ? "Loading agents..."
              : tableError
                ? "Agents unavailable"
                : visibleAgents.length
                  ? `Showing ${visibleAgents.length} of ${filteredTotal} agents · Click any row for details`
                  : "No agent found"}
          </p>

          {!tableLoading && !tableError && visibleAgents.length > 0 && (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              setPage={(value) =>
                setPage(safePage(value, currentPage, totalPages))
              }
            />
          )}
        </div>
      </CardWithBlurBlob>

      {/* Agent Details Modal */}
      {modal?.type === "details" && !accessDenied && (
        <AgentModal title="Agent Details" onClose={closeModal}>
          {detailsQuery.isPending ? (
            <AgentDetailsSkeleton />
          ) : detailsQuery.isError ? (
            <div className="space-y-3 text-sm">
              <p className="text-error">{detailsQuery.error.message}</p>

              <button
                type="button"
                disabled={detailsQuery.isFetching}
                onClick={() => detailsQuery.refetch()}
                className="text-primary hover:underline"
              >
                {detailsQuery.isFetching ? "Retrying..." : "Try again"}
              </button>
            </div>
          ) : selectedAgent ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <AgentAvatar agent={selectedAgent} large />

                  <div>
                    <h3 className="text-base font-semibold">
                      {selectedAgent.displayName || "Unnamed agent"}
                    </h3>

                    <p className="text-xs text-base-content/60">
                      {selectedAgent.email || "—"}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <TextBadge
                        size="sm"
                        variant={
                          APPROVAL_META[selectedAgent.verifyIdAgent]?.variant ||
                          "slate"
                        }
                      >
                        {APPROVAL_META[selectedAgent.verifyIdAgent]?.label ||
                          "Unknown"}
                      </TextBadge>

                      <TextBadge
                        size="sm"
                        variant={
                          ACCOUNT_META[selectedAgent.status]?.variant || "slate"
                        }
                      >
                        {ACCOUNT_META[selectedAgent.status]?.label || "Unknown"}
                      </TextBadge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {renderActions(selectedAgent, true)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl border border-base-content/10 bg-base-200/30 p-4 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-base-content/50">Active Tickets</p>
                  <p className="mt-1 font-semibold">
                    {selectedAgent.activeCount ?? 0}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-base-content/50">Solved Tickets</p>
                  <p className="mt-1 font-semibold text-success">
                    {selectedAgent.solvedCount ?? 0}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-base-content/50">Joined</p>
                  <p className="mt-1 text-xs font-medium">
                    {formatDate(selectedAgent.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-base-content/50">Last Updated</p>
                  <p className="mt-1 text-xs font-medium">
                    {formatDate(selectedAgent.updatedAt)}
                  </p>
                </div>
              </div>

              {selectedAgent.verifyIdAgent === "approved" &&
                (selectedAgent.approvedBy || selectedAgent.approvedReason) && (
                  <div className="rounded-xl border border-success/20 bg-success/5 p-3.5 text-sm">
                    <p className="font-medium text-success">Approval Details</p>

                    {selectedAgent.approvedBy && (
                      <p className="mt-1 text-xs text-base-content/70">
                        Approved by:{" "}
                        <span className="font-medium text-base-content">
                          {selectedAgent.approvedBy.displayName ||
                            selectedAgent.approvedBy.email ||
                            selectedAgent.approvedBy.uid}
                        </span>
                        {selectedAgent.approvedAt &&
                          ` · ${formatDate(selectedAgent.approvedAt, true)}`}
                      </p>
                    )}

                    {selectedAgent.approvedReason && (
                      <p className="mt-1 text-xs text-base-content/70">
                        Reason: {selectedAgent.approvedReason}
                      </p>
                    )}
                  </div>
                )}

              {selectedAgent.rejectionReason && (
                <div className="rounded-xl border border-error/20 bg-error/5 p-3.5 text-sm">
                  <p className="font-medium text-error">Rejection Reason</p>
                  <p className="mt-1 text-xs text-base-content/70">
                    {selectedAgent.rejectionReason}
                  </p>
                </div>
              )}

              <div>
                <h4 className="mb-2.5 text-sm font-semibold">
                  Solved Tickets ({selectedAgent.solvedCount ?? 0})
                </h4>

                {solvedTickets.length === 0 ? (
                  <p className="rounded-xl border border-base-content/10 p-4 text-center text-xs text-base-content/50">
                    No tickets solved by this agent yet.
                  </p>
                ) : (
                  <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                    {solvedTickets.map((ticket) => (
                      <div
                        key={ticket._id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-base-content/10 px-3.5 py-2.5 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {ticket.aiResult?.ticketTitle || "Support Ticket"}
                          </p>

                          <p className="mt-0.5 text-xs text-base-content/50">
                            {ticket.ticketNumber} ·{" "}
                            {ticket.aiResult?.category || "General"}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <TextBadge size="sm" variant="green">
                            {ticket.status}
                          </TextBadge>

                          <p className="mt-1 text-[11px] text-base-content/40">
                            {formatDate(ticket.resolvedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {solvedPagination?.totalPages > 1 && (
                  <div className="mt-3 flex justify-end">
                    <Pagination
                      page={solvedPagination.page}
                      totalPages={solvedPagination.totalPages}
                      setPage={(value) =>
                        setSolvedPage(
                          safePage(
                            value,
                            solvedPagination.page,
                            solvedPagination.totalPages,
                          ),
                        )
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </AgentModal>
      )}

      {/* Confirm Action Modal (Dashboard-style dialog) */}
      {modal && modal.type !== "details" && selectedAgent && !accessDenied && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md"
            onClick={(event) => event.stopPropagation()}
          >
            <CardWithBlurBlob
              interactive={false}
              className="border border-base-content/10 bg-base-100 p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3 border-b border-base-content/10 pb-4">
                <div>
                  <h3 className="text-base font-bold">
                    {ACTION_TITLES[modal.type]}
                  </h3>
                  <p className="mt-0.5 text-xs text-base-content/55">
                    {selectedAgent.displayName || "Unnamed agent"} (
                    {selectedAgent.email || "—"})
                  </p>
                </div>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={closeModal}
                  aria-label="Close modal"
                  className="rounded-xl p-1.5 text-base-content/50 transition hover:bg-base-content/10 hover:text-base-content"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleActionSubmit} className="mt-4 space-y-4">
                {modal.type === "approve" && (
                  <>
                    <p className="rounded-xl border border-success/20 bg-success/5 p-3.5 text-sm text-base-content/75">
                      {configuredLimit === null ? (
                        <>
                          Approve <strong>{selectedAgent.displayName}</strong>{" "}
                          to join your company&apos;s support team?
                        </>
                      ) : (
                        `Approving this agent uses 1 company seat (${counts.approved}/${configuredLimit} currently used).`
                      )}
                    </p>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-base-content/75">
                        Approval Reason / Note{" "}
                        <span className="font-normal text-base-content/45">
                          (Optional)
                        </span>
                      </label>

                      <textarea
                        maxLength={300}
                        disabled={actionLoading}
                        value={reason}
                        onChange={(event) => {
                          setReason(event.target.value);
                          setActionError("");
                        }}
                        placeholder="Write approval reason or onboarding note..."
                        className="min-h-24 w-full rounded-xl border border-base-content/10 bg-base-100 p-3 text-sm outline-none focus:border-primary/40"
                      />
                    </div>
                  </>
                )}

                {modal.type === "reject" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-base-content/75">
                      Rejection Reason
                    </label>

                    <textarea
                      required
                      maxLength={300}
                      disabled={actionLoading}
                      value={reason}
                      onChange={(event) => {
                        setReason(event.target.value);
                        setActionError("");
                      }}
                      placeholder="Write why this application is rejected..."
                      className="min-h-24 w-full rounded-xl border border-base-content/10 bg-base-100 p-3 text-sm outline-none focus:border-primary/40"
                    />
                  </div>
                )}

                {modal.type === "suspend" && (
                  <p className="rounded-xl border border-warning/20 bg-warning/5 p-3.5 text-sm text-base-content/75">
                    Suspending will block workspace access.{" "}
                    {selectedAgent.activeCount > 0 &&
                      `Note: ${selectedAgent.activeCount} active ticket(s) will remain assigned until reassigned.`}
                  </p>
                )}

                {modal.type === "activate" && (
                  <p className="rounded-xl border border-base-content/10 p-3.5 text-sm text-base-content/75">
                    Restore active workspace access for{" "}
                    <strong>{selectedAgent.displayName}</strong>?
                  </p>
                )}

                {actionError && (
                  <p className="text-xs font-medium text-error">
                    {actionError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2.5 border-t border-base-content/10 pt-4">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={closeModal}
                    className="h-9 rounded-xl border border-base-content/10 px-4 text-sm font-medium transition hover:bg-base-200"
                  >
                    Cancel
                  </button>

                  <GradientButton
                    type="submit"
                    size="sm"
                    disabled={actionLoading}
                    buttonClassName={
                      modal.type === "approve"
                        ? "from-success/80 to-success text-white px-4"
                        : modal.type === "reject"
                          ? "from-error/80 to-error text-white px-4"
                          : "from-primary/15 to-secondary/20 text-base-content px-4"
                    }
                  >
                    {actionLoading
                      ? "Saving..."
                      : modal.type === "approve"
                        ? "Confirm Approve"
                        : modal.type === "reject"
                          ? "Confirm Reject"
                          : "Confirm"}
                  </GradientButton>
                </div>
              </form>
            </CardWithBlurBlob>
          </div>
        </div>
      )}
    </div>
  );
}
