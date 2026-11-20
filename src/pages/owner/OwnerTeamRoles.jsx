import { useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Clock3,
  Crown,
  Search,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserMinus,
  Users,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import { AuthContext } from "@/providers/AuthProvider";
import CardWithBlurBlob from "@/components/ui/Card/CardWithBlurBlob";
import SoftIconCard from "@/components/ui/Card/SoftIconCard";
import TextBadge from "@/components/ui/Badge/TextBadge";
import GradientButton from "@/components/ui/Button/GradientButton";
import Pagination from "@/components/ui/Pagination/pagination";
import { cn } from "@/lib/cn";

// =====================================================
// CONFIGURATION
// =====================================================

const API_BASE_URL = "https://support-hub-server.vercel.app";

const ROLE_META = {
  manager: { label: "Manager", variant: "pink" },
  agent: { label: "Agent", variant: "cyan" },
  customer: { label: "Customer", variant: "green" },
};

const STATUS_META = {
  active: { label: "Active", variant: "green" },
  pending: { label: "Pending", variant: "yellow" },
  suspended: { label: "Suspended", variant: "red" },
  rejected: { label: "Rejected", variant: "slate" },
};

const SELECT_CLASS =
  "h-11 min-w-[160px] rounded-xl border border-base-content/10 bg-base-100 px-4 text-sm outline-none transition focus:border-primary/40";

// =====================================================
// API & UI HELPERS
// =====================================================

async function apiRequest(user, path, options = {}) {
  if (!user) throw new Error("Authentication required");

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

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
}

function MemberAvatar({ src, name }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/15 text-sm font-semibold text-primary">
      {src && !failed ? (
        <img
          src={src}
          alt={name || "Member"}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span>{(name || "U").trim().charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
}

// =====================================================
// OWNER TEAM & ROLES
// =====================================================

export default function OwnerTeamRoles() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "all";
  const statusFilter = searchParams.get("status") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );

  // Modal: { type: "role" | "approve" | "reject" | "status", member: object }
  const [modal, setModal] = useState(null);
  const [selectedRole, setSelectedRole] = useState("agent");
  const [reasonInput, setReasonInput] = useState("");
  const [modalError, setModalError] = useState("");

  // Sync debounced search input to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get("search") || "";
      const nextSearch = searchInput.trim();
      if (currentSearch === nextSearch) return;

      const next = new URLSearchParams(searchParams);
      if (nextSearch) next.set("search", nextSearch);
      else next.delete("search");
      next.delete("page");
      setSearchParams(next, { replace: true });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, searchParams, setSearchParams]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    params.set("page", String(page));
    if (searchParams.get("search")) {
      params.set("search", searchParams.get("search"));
    }
    if (statusFilter) {
      params.set("status", statusFilter);
    }
    return params.toString();
  }, [activeTab, page, searchParams, statusFilter]);

  const teamQuery = useQuery({
    queryKey: ["owner-team", user?.uid || null, queryString],
    enabled: !authLoading && !!user,
    queryFn: ({ signal }) =>
      apiRequest(user, `/owner/team?${queryString}`, { method: "GET", signal }),
    staleTime: 10_000,
    placeholderData: (prev) => prev,
  });

  const actionMutation = useMutation({
    mutationFn: ({ uid, payload }) =>
      apiRequest(user, `/owner/team/${encodeURIComponent(uid)}/action`, {
        method: "PATCH",
        body: payload,
      }),
    onSuccess: (res, variables) => {
      if (variables.payload.action === "reject") {
        toast.info(res?.message || "Join request rejected");
      } else {
        toast.success(res?.message || "Team member updated");
      }
      setModal(null);
      queryClient.invalidateQueries({ queryKey: ["owner-team"] });
      queryClient.invalidateQueries({ queryKey: ["owner-overview"] });
    },
    onError: (err) => {
      setModalError(err?.message || "Failed to update member");
    },
  });

  const counts = teamQuery.data?.counts || {
    all: 0,
    managers: 0,
    agents: 0,
    customers: 0,
    pending: 0,
    seatsUsed: 0,
    seatsLimit: 0,
  };

  const visibleMembers = teamQuery.data?.members || [];
  const pagination = teamQuery.data?.pagination || {
    page: 1,
    total: 0,
    totalPages: 1,
  };

  function updateParams(patch, resetPage = true) {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, val]) => {
      if (val) next.set(key, String(val));
      else next.delete(key);
    });
    if (resetPage) next.delete("page");
    setSearchParams(next, { replace: true });
  }

  function resetFilters() {
    setSearchInput("");
    setSearchParams(new URLSearchParams(), { replace: true });
  }

  function openModal(type, member) {
    setModalError("");
    setReasonInput("");
    setSelectedRole(member.role === "manager" ? "agent" : "manager");
    setModal({ type, member });
  }

  function handleModalSubmit(e) {
    e.preventDefault();
    if (!modal?.member || actionMutation.isPending) return;

    const { type, member } = modal;

    if (type === "role") {
      actionMutation.mutate({
        uid: member.uid,
        payload: { action: "role", role: selectedRole },
      });
      return;
    }

    if (type === "approve") {
      actionMutation.mutate({
        uid: member.uid,
        payload: { action: "approve" },
      });
      return;
    }

    if (type === "reject") {
      if (!reasonInput.trim()) {
        setModalError("Please enter a rejection reason.");
        return;
      }
      actionMutation.mutate({
        uid: member.uid,
        payload: { action: "reject", reason: reasonInput.trim() },
      });
      return;
    }

    if (type === "status") {
      const nextAction =
        member.displayStatus === "suspended" ? "activate" : "suspend";
      actionMutation.mutate({
        uid: member.uid,
        payload: { action: nextAction },
      });
    }
  }

  const tabs = [
    { key: "all", label: "All Members", count: counts.all },
    { key: "manager", label: "Managers", count: counts.managers },
    { key: "agent", label: "Agents", count: counts.agents },
    { key: "customer", label: "Customers", count: counts.customers },
    { key: "pending", label: "Pending Requests", count: counts.pending },
  ];

  const stats = [
    {
      title: "Staff Seats Used",
      value: `${counts.seatsUsed}/${counts.seatsLimit}`,
      note: "Active managers & agents",
      icon: Crown,
      variant: "purple",
    },
    {
      title: "Managers",
      value: counts.managers,
      note: "Team leads & supervisors",
      icon: ShieldCheck,
      variant: "pink",
    },
    {
      title: "Support Agents",
      value: counts.agents,
      note: "Ticket handling staff",
      icon: UserCheck,
      variant: "cyan",
    },
    {
      title: "Customers",
      value: counts.customers,
      note: "Workspace end-users",
      icon: Users,
      variant: "blue",
    },
    {
      title: "Pending Approvals",
      value: counts.pending,
      note: "Awaiting owner review",
      icon: Clock3,
      variant: "warning",
    },
  ];

  const isLoading =
    authLoading || (user && teamQuery.isPending && !teamQuery.data);

  return (
    <div className="p-4 lg:p-5">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Team &amp; Roles
          </h1>
          <TextBadge variant="purple" size="sm">
            Owner Access
          </TextBadge>
        </div>

        <p className="mt-1 text-sm text-base-content/60">
          Manage managers, support agents, customers, and role permissions in
          your workspace.
        </p>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {isLoading
          ? Array.from({ length: 5 }).map((_, idx) => (
              <CardWithBlurBlob
                key={idx}
                interactive={false}
                className="h-full p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="skeleton h-10 w-10 rounded-xl" />
                  <div className="skeleton h-7 w-14 rounded-lg" />
                </div>
                <div className="skeleton mt-3 h-4 w-28 rounded" />
                <div className="skeleton mt-1.5 h-3 w-36 rounded" />
              </CardWithBlurBlob>
            ))
          : stats.map((item) => (
              <CardWithBlurBlob
                key={item.title}
                interactive={false}
                className="h-full p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <SoftIconCard
                    icon={item.icon}
                    variant={item.variant}
                    size={17}
                  />
                  <p className="text-2xl font-semibold tabular-nums">
                    {item.value}
                  </p>
                </div>

                <p className="mt-3 text-sm font-medium text-base-content/80">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs text-base-content/50">
                  {item.note}
                </p>
              </CardWithBlurBlob>
            ))}
      </div>

      {/* Role Tabs + Filters */}
      <CardWithBlurBlob className="my-5 p-4" interactive={false}>
        {/* Role Tabs */}
        <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-base-content/10 pb-3.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() =>
                  updateParams({ tab: tab.key === "all" ? "" : tab.key })
                }
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition",
                  isActive
                    ? "bg-primary/15 text-primary shadow-xs"
                    : "text-base-content/65 hover:bg-base-200/70 hover:text-base-content",
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "bg-base-200 text-base-content/60",
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Status Filter */}
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40"
            />
            <input
              type="search"
              value={searchInput}
              maxLength={100}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search member by name or email..."
              className="h-11 w-full rounded-xl border border-base-content/10 bg-base-100 pl-11 pr-4 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <select
            aria-label="Account Status"
            value={statusFilter}
            onChange={(e) => updateParams({ status: e.target.value })}
            className={SELECT_CLASS}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="rejected">Rejected</option>
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

      {/* Members Table */}
      <CardWithBlurBlob className="overflow-hidden p-0" interactive={false}>
        {isLoading ? (
          <div className="divide-y divide-base-content/10 p-5">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="skeleton h-9 w-9 rounded-xl" />
                  <div className="space-y-1.5">
                    <div className="skeleton h-4 w-36 rounded" />
                    <div className="skeleton h-3 w-48 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="skeleton h-6 w-20 rounded-full" />
                  <div className="skeleton h-6 w-16 rounded-full" />
                  <div className="skeleton h-4 w-28 rounded" />
                  <div className="skeleton h-8 w-28 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : teamQuery.error ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <p className="text-base font-medium text-base-content/75">
              Unable to load workspace team
            </p>
            <p className="mt-1 text-sm text-base-content/55">
              {teamQuery.error.message}
            </p>
            <GradientButton
              size="sm"
              className="mt-4"
              onClick={() => teamQuery.refetch()}
              buttonClassName="from-primary to-secondary text-white px-4"
            >
              Try again
            </GradientButton>
          </div>
        ) : visibleMembers.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center px-5 py-20 text-center"
            role="status"
          >
            <SoftIconCard icon={Users} variant="slate" />
            <p className="mb-2 mt-3 text-xl text-base-content/60">
              No team members found
            </p>
            <p className="max-w-md text-sm text-base-content/60">
              Try switching role tabs or adjusting your search filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr className="text-sm uppercase text-base-content/50">
                  <th scope="col" className="p-5 font-semibold">
                    Member
                  </th>
                  <th scope="col" className="p-5 font-semibold">
                    Role
                  </th>
                  <th scope="col" className="p-5 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="p-5 font-semibold">
                    Activity
                  </th>
                  <th scope="col" className="p-5 font-semibold">
                    Joined
                  </th>
                  <th scope="col" className="p-5 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleMembers.map((member) => {
                  const effectiveStatus =
                    member.displayStatus || member.status || "active";

                  const roleInfo = ROLE_META[member.role] || {
                    label: member.role,
                    variant: "slate",
                  };
                  const statusInfo = STATUS_META[effectiveStatus] || {
                    label: effectiveStatus,
                    variant: "slate",
                  };

                  return (
                    <tr key={member._id || member.uid}>
                      {/* Member */}
                      <td className="min-w-60 px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <MemberAvatar
                            src={member.photoURL}
                            name={member.displayName || member.email}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-base-content">
                              {member.displayName || "Unnamed Member"}
                            </p>
                            <p className="truncate text-xs text-base-content/50">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="p-5">
                        <TextBadge variant={roleInfo.variant}>
                          {roleInfo.label}
                        </TextBadge>
                      </td>

                      {/* Status */}
                      <td className="p-5">
                        <TextBadge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </TextBadge>
                      </td>

                      {/* Activity */}
                      <td className="whitespace-nowrap p-5 text-sm text-base-content/70">
                        {member.role === "customer"
                          ? `${member.ticketsCount ?? 0} tickets created`
                          : `${member.ticketsHandled ?? 0} tickets solved`}
                      </td>

                      {/* Joined */}
                      <td className="whitespace-nowrap p-5 text-sm text-base-content/60">
                        {formatDate(member.createdAt || member.joinedAt)}
                      </td>

                      {/* Actions */}
                      <td className="p-5 text-right">
                        {effectiveStatus === "pending" ? (
                          <div className="inline-flex items-center gap-2">
                            <GradientButton
                              size="sm"
                              onClick={() => openModal("approve", member)}
                              buttonClassName="from-success/20 to-success/10 text-success"
                            >
                              <span className="flex items-center gap-1">
                                <Check size={14} /> Approve
                              </span>
                            </GradientButton>

                            <button
                              type="button"
                              onClick={() => openModal("reject", member)}
                              className="inline-flex h-8 items-center gap-1 rounded-xl border border-error/20 bg-error/10 px-3 text-xs font-medium text-error transition hover:bg-error/20"
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        ) : effectiveStatus === "rejected" ? (
                          <GradientButton
                            size="sm"
                            onClick={() => openModal("approve", member)}
                            buttonClassName="from-success/20 to-success/10 text-success"
                          >
                            <span className="flex items-center gap-1">
                              <Check size={14} /> Re-Approve
                            </span>
                          </GradientButton>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            {member.role !== "customer" && (
                              <GradientButton
                                size="sm"
                                onClick={() => openModal("role", member)}
                                buttonClassName="from-primary/20 to-secondary/10 text-base-content"
                              >
                                <span className="flex items-center gap-1.5">
                                  <UserCog size={14} /> Change Role
                                </span>
                              </GradientButton>
                            )}

                            <button
                              type="button"
                              onClick={() => openModal("status", member)}
                              className={cn(
                                "inline-flex h-8 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition",
                                effectiveStatus === "suspended"
                                  ? "border-success/20 bg-success/10 text-success hover:bg-success/20"
                                  : "border-error/20 bg-error/10 text-error hover:bg-error/20",
                              )}
                            >
                              {effectiveStatus === "suspended" ? (
                                <>
                                  <UserCheck size={14} /> Activate
                                </>
                              ) : (
                                <>
                                  <UserMinus size={14} /> Suspend
                                </>
                              )}
                            </button>
                          </div>
                        )}
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
            {visibleMembers.length === 0
              ? "No member found"
              : `Showing ${visibleMembers.length} of ${pagination.total} members`}
          </p>

          {visibleMembers.length > 0 && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              setPage={(val) => {
                const next =
                  typeof val === "function" ? val(pagination.page) : val;
                const clamped = Math.max(
                  1,
                  Math.min(next, pagination.totalPages),
                );
                updateParams({ page: clamped > 1 ? clamped : "" }, false);
              }}
            />
          )}
        </div>
      </CardWithBlurBlob>

      {/* ===================================================== */}
      {/* OWNER ACTION MODAL (Role / Approve / Reject / Status) */}
      {/* ===================================================== */}
      {modal?.member && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => !actionMutation.isPending && setModal(null)}
        >
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardWithBlurBlob
              interactive={false}
              className="border border-base-content/10 bg-base-100 p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3 border-b border-base-content/10 pb-4">
                <div>
                  <h3 className="text-base font-bold">
                    {modal.type === "role" && "Update Member Role"}
                    {modal.type === "approve" && "Approve Team Member"}
                    {modal.type === "reject" && "Reject Join Request"}
                    {modal.type === "status" &&
                      ((modal.member.displayStatus || modal.member.status) ===
                      "suspended"
                        ? "Activate Account"
                        : "Suspend Account")}
                  </h3>
                  <p className="mt-0.5 text-xs text-base-content/55">
                    {modal.member.displayName || modal.member.email} (
                    {modal.member.email})
                  </p>
                </div>

                <button
                  type="button"
                  disabled={actionMutation.isPending}
                  onClick={() => setModal(null)}
                  className="rounded-xl p-1.5 text-base-content/50 transition hover:bg-base-content/10"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleModalSubmit} className="mt-4 space-y-4">
                {modal.type === "role" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-base-content/75">
                      Assign Workspace Role
                    </label>
                    <select
                      value={selectedRole}
                      disabled={actionMutation.isPending}
                      onChange={(e) => {
                        setSelectedRole(e.target.value);
                        setModalError("");
                      }}
                      className="h-11 w-full rounded-xl border border-base-content/10 bg-base-100 px-3.5 text-sm outline-none focus:border-primary/40"
                    >
                      <option value="manager">
                        Manager (Can manage agents &amp; tickets)
                      </option>
                      <option value="agent">
                        Agent (Handles assigned customer tickets)
                      </option>
                    </select>
                  </div>
                )}

                {modal.type === "approve" && (
                  <p className="rounded-xl border border-success/20 bg-success/5 p-3.5 text-sm text-base-content/75">
                    Approve{" "}
                    <strong>
                      {modal.member.displayName || modal.member.email}
                    </strong>{" "}
                    as a{" "}
                    <strong className="capitalize">{modal.member.role}</strong>?
                    This will use 1 workspace staff seat ({counts.seatsUsed}/
                    {counts.seatsLimit}).
                  </p>
                )}

                {modal.type === "reject" && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-base-content/75">
                      Rejection Reason
                    </label>
                    <textarea
                      required
                      maxLength={300}
                      disabled={actionMutation.isPending}
                      value={reasonInput}
                      onChange={(e) => {
                        setReasonInput(e.target.value);
                        setModalError("");
                      }}
                      placeholder="Write why this request is being rejected..."
                      className="min-h-24 w-full rounded-xl border border-base-content/10 bg-base-100 p-3 text-sm outline-none focus:border-primary/40"
                    />
                  </div>
                )}

                {modal.type === "status" && (
                  <p className="rounded-xl border border-base-content/10 bg-base-200/40 p-3.5 text-sm text-base-content/75">
                    {(modal.member.displayStatus || modal.member.status) ===
                    "suspended" ? (
                      <>
                        Restore workspace access for{" "}
                        <strong>
                          {modal.member.displayName || modal.member.email}
                        </strong>
                        ?
                      </>
                    ) : (
                      <>
                        Suspend{" "}
                        <strong>
                          {modal.member.displayName || modal.member.email}
                        </strong>
                        ? They will not be able to access the workspace until
                        reactivated.
                      </>
                    )}
                  </p>
                )}

                {modalError && (
                  <p className="text-xs font-medium text-error">{modalError}</p>
                )}

                <div className="flex justify-end gap-2 border-t border-base-content/10 pt-4">
                  <button
                    type="button"
                    disabled={actionMutation.isPending}
                    onClick={() => setModal(null)}
                    className="h-9 rounded-xl border border-base-content/10 px-4 text-sm font-medium transition hover:bg-base-200"
                  >
                    Cancel
                  </button>
                  <GradientButton
                    type="submit"
                    size="sm"
                    disabled={actionMutation.isPending}
                    buttonClassName="from-primary/20 to-secondary/10 text-base-content px-4"
                  >
                    {actionMutation.isPending ? "Saving..." : "Confirm"}
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
