import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  ArrowUpRight,
  Clock3,
  Search,
  Ticket,
  UserCheck,
  UserRound,
  Users,
  UserX,
  X,
} from "lucide-react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";

import { AuthContext } from "../../app/providers/AuthProvider";
import LoadingPage from "../loading/LoadingPage/LoadingPage";
import CardWithBlurBlob from "../../components/ui/Card/CardWithBlurBlob";
import SoftIconCard from "../../components/ui/Card/SoftIconCard";
import TextBadge from "../../components/ui/Badge/TextBadge";
import GradientButton from "../../components/ui/Button/GradientButton";
import Pagination from "../../components/ui/Pagination/pagination";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3021"
).replace(/\/+$/, "");

const ACCOUNT_META = {
  active: { label: "Active", variant: "cyan" },
  suspended: { label: "Suspended", variant: "red" },
};

const TICKET_STATUS_META = {
  open: { label: "Open", variant: "blue" },
  assigned: { label: "Assigned", variant: "purple" },
  in_progress: { label: "In Progress", variant: "warning" },
  reopened: { label: "Reopened", variant: "orange" },
  resolved: { label: "Resolved", variant: "green" },
  closed: { label: "Closed", variant: "slate" },
};

const SELECT_CLASS =
  "h-11 min-w-[175px] rounded-xl border border-base-content/10 bg-base-100 px-4 text-sm outline-none transition focus:border-primary/40";

const EMPTY_COUNTS = {
  total: 0,
  activeAccounts: 0,
  suspendedAccounts: 0,
  withActiveTickets: 0,
  totalTickets: 0,
};

function formatDate(value, withTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Asia/Dhaka",
  });
}

async function fetchWithAuth(user, path, options = {}) {
  const token = await user.getIdToken();
  const { body, ...rest } = options;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || data?.success === false || !data) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }

  return data;
}

// =====================================================
// SHARED COMPONENTS
// =====================================================

function CustomerAvatar({ customer, large = false }) {
  const [failed, setFailed] = useState(false);
  const sizeClass = large ? "h-14 w-14" : "h-9 w-9";

  useEffect(() => {
    setFailed(false);
  }, [customer?.photoURL]);

  if (customer?.photoURL && !failed) {
    return (
      <img
        src={customer.photoURL}
        alt={customer.displayName || "Customer"}
        onError={() => setFailed(true)}
        className={`${sizeClass} shrink-0 rounded-xl object-cover`}
      />
    );
  }

  return (
    <SoftIconCard
      icon={UserRound}
      variant="blue"
      size={large ? 22 : 16}
      className={`${sizeClass} shrink-0`}
    />
  );
}

function CustomerModal({ title, onClose, busy = false, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  const handleClose = () => {
    if (!busy) onClose();
  };

  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={(e) => {
        e.preventDefault();
        handleClose();
      }}
    >
      <div className="modal-box max-w-2xl rounded-2xl border border-base-content/10 bg-base-100 p-6">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-base-content/10 pb-4">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <button
            type="button"
            aria-label="Close modal"
            disabled={busy}
            onClick={handleClose}
            className="btn btn-ghost btn-square btn-sm rounded-xl"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>

      <form method="dialog" className="modal-backdrop">
        <button type="button" disabled={busy} onClick={handleClose}>
          Close
        </button>
      </form>
    </dialog>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function ManagerCustomers() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [ticketFilter, setTicketFilter] = useState("");
  const [page, setPage] = useState(1);

  // modal: { type: "details" | "suspend" | "activate", uid: string, customer: object }
  const [modal, setModal] = useState(null);
  const [actionError, setActionError] = useState("");
  const [ticketPage, setTicketPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // 1. Verify Manager Profile
  const {
    data: manager,
    isLoading: profileLoading,
    isError: profileError,
    error: profileErrorInfo,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["manager-profile", user?.uid],
    enabled: !!user && !authLoading,
    queryFn: async () => {
      const res = await fetchWithAuth(user, "/users/me");
      return res.user;
    },
    staleTime: 30_000,
  });

  const isManager = manager?.role === "manager" && manager?.status === "active";

  // 2. Load Customers List & Summary Stats
  const {
    data,
    isLoading,
    isPlaceholderData,
    isError: customersError,
    error: customersErrorInfo,
    isFetching,
    refetch: refetchCustomers,
  } = useQuery({
    queryKey: [
      "manager-customers",
      user?.uid,
      debouncedSearch,
      accountFilter,
      ticketFilter,
      page,
    ],
    enabled: !!user && isManager,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        search: debouncedSearch,
        status: accountFilter,
        activity: ticketFilter,
      });
      return fetchWithAuth(user, `/manager/customers?${params.toString()}`);
    },
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  });

  // 3. Load Single Customer Details
  const {
    data: detailsData,
    isLoading: detailsLoading,
    isError: detailsError,
    error: detailsErrorInfo,
    refetch: refetchDetails,
  } = useQuery({
    queryKey: ["manager-customer-details", user?.uid, modal?.uid, ticketPage],
    enabled: !!user && isManager && modal?.type === "details" && !!modal?.uid,
    queryFn: () =>
      fetchWithAuth(
        user,
        `/manager/customers/${encodeURIComponent(modal.uid)}?ticketPage=${ticketPage}`,
      ),
    staleTime: 0,
  });

  // 4. Mutation for Suspend / Activate
  const actionMutation = useMutation({
    mutationFn: ({ uid, action }) =>
      fetchWithAuth(
        user,
        `/manager/customers/${encodeURIComponent(uid)}/action`,
        {
          method: "PATCH",
          body: { action },
        },
      ),
    onSuccess: (res) => {
      toast.success(res.message || "Customer updated successfully");
      setModal(null);
      queryClient.invalidateQueries({ queryKey: ["manager-customers"] });
      queryClient.invalidateQueries({ queryKey: ["manager-customer-details"] });
      queryClient.invalidateQueries({ queryKey: ["manager-overview"] });
    },
    onError: (err) => {
      setActionError(err.message || "Unable to update customer");
      if ([401, 403, 409].includes(err.status)) {
        queryClient.invalidateQueries({ queryKey: ["manager-customers"] });
      }
    },
  });

  function resetFilters() {
    setSearch("");
    setDebouncedSearch("");
    setAccountFilter("");
    setTicketFilter("");
    setPage(1);
  }

  function openModal(type, customer) {
    setActionError("");
    setTicketPage(1);
    actionMutation.reset();
    setModal({ type, uid: customer.uid, customer });
  }

  function closeModal() {
    if (!actionMutation.isPending) setModal(null);
  }

  function handleStatusSubmit(e) {
    e.preventDefault();
    if (!selectedCustomer || !modal || actionMutation.isPending) return;

    setActionError("");
    actionMutation.mutate({
      uid: selectedCustomer.uid,
      action: modal.type,
    });
  }

  if (authLoading || (!!user && profileLoading)) {
    return <LoadingPage />;
  }

  if (!user || profileError || !isManager) {
    return (
      <div className="p-4 lg:p-5">
        <CardWithBlurBlob className="p-5" interactive={false}>
          <p className="text-sm text-base-content/70">
            {!user
              ? "Sign in with your manager account to continue."
              : profileError
                ? profileErrorInfo?.message
                : "An active manager account is required."}
          </p>

          {user && profileError && (
            <button
              type="button"
              onClick={() => refetchProfile()}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Try again
            </button>
          )}
        </CardWithBlurBlob>
      </div>
    );
  }

  const visibleCustomers = data?.customers || [];
  const counts = data?.counts || EMPTY_COUNTS;
  const pagination = data?.pagination || {};

  const totalPages = pagination.totalPages || 1;
  const currentPage = pagination.page || page;
  const filteredTotal = pagination.total || 0;

  const tableLoading = isLoading || isPlaceholderData;
  const selectedCustomer =
    modal?.type === "details" ? detailsData?.customer : modal?.customer;
  const customerTickets = selectedCustomer?.tickets || [];
  const ticketPagination = detailsData?.ticketPagination;

  const stats = [
    {
      title: "Total Customers",
      value: counts.total,
      note: "Registered in workspace",
      icon: Users,
      variant: "blue",
    },
    {
      title: "Active Accounts",
      value: counts.activeAccounts,
      note: "Can submit tickets",
      icon: UserCheck,
      variant: "green",
    },
    {
      title: "With Open Tickets",
      value: counts.withActiveTickets,
      note: "Currently in queue",
      icon: Clock3,
      variant: "warning",
    },
    {
      title: "Total Tickets",
      value: counts.totalTickets,
      note: "Submitted by customers",
      icon: Ticket,
      variant: "purple",
    },
    {
      title: "Suspended",
      value: counts.suspendedAccounts,
      note: "Account restricted",
      icon: UserX,
      variant: "red",
    },
  ];

  return (
    <div className="p-4 lg:p-5">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <TextBadge variant="green" size="sm">
            Directory
          </TextBadge>
        </div>
        <p className="mt-1 text-sm text-base-content/60">
          View customer profiles, ticket history, and manage account access.
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
            {isLoading ? (
              <div>
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
                    {data ? item.value : "—"}
                  </p>
                </div>
                <p className="mt-3 text-sm font-medium text-base-content/80">
                  {item.title}
                </p>
                <p className="mt-0.5 text-xs text-base-content/50">
                  {data ? item.note : "Summary unavailable"}
                </p>
              </>
            )}
          </CardWithBlurBlob>
        ))}
      </div>

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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer by name or email..."
              className="h-11 w-full rounded-xl border border-base-content/10 bg-base-100 pl-11 pr-4 text-sm outline-none transition focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <select
            value={accountFilter}
            onChange={(e) => {
              setAccountFilter(e.target.value);
              setPage(1);
            }}
            className={SELECT_CLASS}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={ticketFilter}
            onChange={(e) => {
              setTicketFilter(e.target.value);
              setPage(1);
            }}
            className={SELECT_CLASS}
          >
            <option value="">All Ticket Activity</option>
            <option value="has_active">Has Active Tickets</option>
            <option value="no_active">No Active Tickets</option>
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

      {/* Clean Consistent Table */}
      <CardWithBlurBlob className="overflow-hidden p-0" interactive={false}>
        {!tableLoading && customersError ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <SoftIconCard icon={Users} variant="slate" />
            <p className="mt-3 text-lg font-medium text-base-content/70">
              Unable to load customers
            </p>
            <p className="mt-1 max-w-md text-sm text-base-content/50">
              {customersErrorInfo?.message || "Something went wrong."}
            </p>
            <button
              type="button"
              disabled={isFetching}
              onClick={() => refetchCustomers()}
              className="mt-3 text-sm text-primary hover:underline"
            >
              {isFetching ? "Retrying..." : "Try again"}
            </button>
          </div>
        ) : !tableLoading && visibleCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <SoftIconCard icon={Users} variant="slate" />
            <p className="mt-3 text-lg font-medium text-base-content/70">
              No customers found
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
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-center font-semibold">
                    Total Tickets
                  </th>
                  <th className="px-5 py-3.5 text-center font-semibold">
                    Active
                  </th>
                  <th className="px-5 py-3.5 text-center font-semibold">
                    Solved
                  </th>
                  <th className="px-5 py-3.5 font-semibold">Joined</th>
                  <th className="px-5 py-3.5 font-semibold">Last Ticket</th>
                  <th className="px-5 py-3.5 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              {tableLoading ? (
                <tbody>
                  {Array.from({ length: 5 }, (_, idx) => (
                    <tr key={idx} className="h-[76px]">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="skeleton h-9 w-9 shrink-0 rounded-xl" />
                          <div className="min-w-[150px] space-y-2">
                            <div
                              className={`skeleton h-4 rounded-md ${
                                idx % 2 === 0 ? "w-28" : "w-36"
                              }`}
                            />
                            <div className="skeleton h-3 w-40 rounded-md" />
                          </div>
                        </div>
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
                      <td className="px-5 py-3.5 text-center">
                        <div className="skeleton mx-auto h-6 w-10 rounded-lg" />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="skeleton h-4 w-24 rounded-md" />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="skeleton h-4 w-24 rounded-md" />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end">
                          <div className="skeleton h-8 w-20 rounded-xl" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody className="divide-y divide-base-content/5 text-sm">
                  {visibleCustomers.map((customer) => {
                    const accountInfo =
                      ACCOUNT_META[customer.status] || ACCOUNT_META.active;
                    const busy = actionMutation.isPending;

                    return (
                      <tr
                        key={customer.uid}
                        onClick={() => openModal("details", customer)}
                        className="cursor-pointer transition-colors hover:bg-base-200/50"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <CustomerAvatar customer={customer} />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-base-content">
                                {customer.displayName || "Unnamed customer"}
                              </p>
                              <p className="truncate text-xs text-base-content/50">
                                {customer.email || "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <TextBadge size="sm" variant={accountInfo.variant}>
                            {accountInfo.label}
                          </TextBadge>
                        </td>

                        <td className="px-5 py-3.5 text-center font-medium text-base-content/80">
                          {customer.totalTickets ?? 0}
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          <TextBadge
                            size="sm"
                            variant={
                              (customer.activeCount ?? 0) > 0
                                ? "warning"
                                : "slate"
                            }
                          >
                            {customer.activeCount ?? 0}
                          </TextBadge>
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          <TextBadge size="sm" variant="green">
                            {customer.solvedCount ?? 0}
                          </TextBadge>
                        </td>

                        <td className="whitespace-nowrap px-5 py-3.5 text-xs text-base-content/60">
                          {formatDate(customer.createdAt)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-3.5 text-xs text-base-content/60">
                          {customer.lastTicketAt ? (
                            formatDate(customer.lastTicketAt)
                          ) : (
                            <span className="italic text-base-content/40">
                              Not created yet
                            </span>
                          )}
                        </td>

                        <td
                          className="px-5 py-3.5 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <GradientButton
                            size="sm"
                            disabled={busy}
                            onClick={() =>
                              openModal(
                                customer.status === "active"
                                  ? "suspend"
                                  : "activate",
                                customer,
                              )
                            }
                            buttonClassName={
                              customer.status === "active"
                                ? "from-warning/15 to-warning/25 text-warning"
                                : "from-success/15 to-success/25 text-success"
                            }
                          >
                            {customer.status === "active"
                              ? "Suspend"
                              : "Activate"}
                          </GradientButton>
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
              ? "Loading customers..."
              : customersError
                ? "Customers unavailable"
                : visibleCustomers.length
                  ? `Showing ${visibleCustomers.length} of ${filteredTotal} customers · Click any row for details`
                  : "No customer found"}
          </p>

          {!tableLoading && !customersError && visibleCustomers.length > 0 && (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              setPage={(val) => {
                const next = typeof val === "function" ? val(currentPage) : val;
                setPage(Math.max(1, Math.min(next, totalPages)));
              }}
            />
          )}
        </div>
      </CardWithBlurBlob>

      {/* ===================================================== */}
      {/* CUSTOMER DETAILS POPUP MODAL                          */}
      {/* ===================================================== */}
      {modal?.type === "details" && (
        <CustomerModal title="Customer Details" onClose={closeModal}>
          {detailsLoading ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="skeleton h-14 w-14 shrink-0 rounded-xl" />
                <div className="space-y-2">
                  <div className="skeleton h-4 w-36 rounded-md" />
                  <div className="skeleton h-3 w-48 rounded-md" />
                  <div className="flex gap-2">
                    <div className="skeleton h-5 w-16 rounded-lg" />
                    <div className="skeleton h-5 w-24 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 rounded-xl border border-base-content/10 bg-base-200/30 p-4 text-sm">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="skeleton h-3 w-20 rounded-md" />
                    <div className="skeleton h-4 w-12 rounded-md" />
                  </div>
                ))}
              </div>
              <div>
                <div className="skeleton mb-3 h-4 w-36 rounded-md" />
                <div className="space-y-2">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div
                      key={i}
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
          ) : detailsError ? (
            <div className="space-y-3 text-sm">
              <p className="text-error">{detailsErrorInfo?.message}</p>
              <button
                type="button"
                onClick={() => refetchDetails()}
                className="text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          ) : selectedCustomer ? (
            <div className="space-y-5">
              {/* Profile Header */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <CustomerAvatar customer={selectedCustomer} large />
                  <div>
                    <h3 className="text-base font-semibold">
                      {selectedCustomer.displayName || "Unnamed customer"}
                    </h3>
                    <p className="text-xs text-base-content/60">
                      {selectedCustomer.email || "—"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <TextBadge
                        size="sm"
                        variant={
                          ACCOUNT_META[selectedCustomer.status]?.variant ||
                          "slate"
                        }
                      >
                        {ACCOUNT_META[selectedCustomer.status]?.label ||
                          "Unknown"}
                      </TextBadge>
                      <span className="text-xs text-base-content/50">
                        Joined {formatDate(selectedCustomer.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {selectedCustomer.email && (
                    <Link
                      to={`/manager/tickets?search=${encodeURIComponent(selectedCustomer.email)}`}
                      onClick={closeModal}
                    >
                      <GradientButton
                        size="sm"
                        buttonClassName="from-primary/15 to-secondary/20 text-base-content"
                      >
                        <span className="flex items-center gap-1.5">
                          Tickets Queue
                          <ArrowUpRight size={14} />
                        </span>
                      </GradientButton>
                    </Link>
                  )}

                  <GradientButton
                    size="sm"
                    disabled={actionMutation.isPending}
                    onClick={() =>
                      openModal(
                        selectedCustomer.status === "active"
                          ? "suspend"
                          : "activate",
                        selectedCustomer,
                      )
                    }
                    buttonClassName={
                      selectedCustomer.status === "active"
                        ? "from-warning/15 to-warning/25 text-warning"
                        : "from-success/15 to-success/25 text-success"
                    }
                  >
                    {selectedCustomer.status === "active"
                      ? "Suspend"
                      : "Activate"}
                  </GradientButton>
                </div>
              </div>

              {/* Ticket Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 rounded-xl border border-base-content/10 bg-base-200/30 p-4 text-sm">
                <div>
                  <p className="text-xs text-base-content/50">Total Tickets</p>
                  <p className="mt-1 font-semibold">
                    {selectedCustomer.totalTickets ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Active Tickets</p>
                  <p className="mt-1 font-semibold text-warning">
                    {selectedCustomer.activeCount ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-base-content/50">Solved Tickets</p>
                  <p className="mt-1 font-semibold text-success">
                    {selectedCustomer.solvedCount ?? 0}
                  </p>
                </div>
              </div>

              {/* Submitted Tickets History */}
              <div>
                <h4 className="mb-2.5 text-sm font-semibold">
                  Submitted Tickets ({selectedCustomer.totalTickets ?? 0})
                </h4>

                {customerTickets.length === 0 ? (
                  <p className="rounded-xl border border-base-content/10 p-4 text-center text-xs text-base-content/50">
                    No tickets submitted by this customer yet.
                  </p>
                ) : (
                  <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                    {customerTickets.map((ticket) => {
                      const st = TICKET_STATUS_META[ticket.status] || {
                        label: ticket.status,
                        variant: "slate",
                      };

                      return (
                        <Link
                          key={ticket._id}
                          to={`/manager/tickets/${ticket._id}`}
                          onClick={closeModal}
                          className="flex items-center justify-between gap-3 rounded-xl border border-base-content/10 px-3.5 py-2.5 text-sm transition hover:border-primary/30 hover:bg-base-200/40"
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
                            <TextBadge size="sm" variant={st.variant}>
                              {st.label}
                            </TextBadge>
                            <p className="mt-1 text-[11px] text-base-content/40">
                              {formatDate(ticket.createdAt)}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {ticketPagination?.totalPages > 1 && (
                  <div className="mt-3 flex justify-end">
                    <Pagination
                      page={ticketPagination.page}
                      totalPages={ticketPagination.totalPages}
                      setPage={(val) => {
                        const next =
                          typeof val === "function"
                            ? val(ticketPagination.page)
                            : val;
                        setTicketPage(
                          Math.max(
                            1,
                            Math.min(next, ticketPagination.totalPages),
                          ),
                        );
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </CustomerModal>
      )}

      {/* ===================================================== */}
      {/* CONFIRM SUSPEND / ACTIVATE MODAL                      */}
      {/* ===================================================== */}
      {modal && modal.type !== "details" && selectedCustomer && (
        <CustomerModal
          title={
            modal.type === "suspend"
              ? "Suspend Customer Account"
              : "Activate Customer Account"
          }
          onClose={closeModal}
          busy={actionMutation.isPending}
        >
          <form onSubmit={handleStatusSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <CustomerAvatar customer={selectedCustomer} />
              <div>
                <p className="text-sm font-medium">
                  {selectedCustomer.displayName}
                </p>
                <p className="text-xs text-base-content/50">
                  {selectedCustomer.email}
                </p>
              </div>
            </div>

            {modal.type === "suspend" ? (
              <p className="rounded-xl border border-warning/20 bg-warning/5 p-3.5 text-sm text-base-content/70">
                Suspending will restrict{" "}
                <strong>{selectedCustomer.displayName}</strong> from creating
                new tickets in this workspace.
              </p>
            ) : (
              <p className="rounded-xl border border-base-content/10 p-3.5 text-sm text-base-content/70">
                Restore active workspace access for{" "}
                <strong>{selectedCustomer.displayName}</strong>?
              </p>
            )}

            {actionError && (
              <p className="text-xs font-medium text-error">{actionError}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={actionMutation.isPending}
                onClick={closeModal}
                className="h-9 rounded-xl border border-base-content/10 px-4 text-sm font-medium transition hover:bg-base-200"
              >
                Cancel
              </button>
              <GradientButton
                type="submit"
                size="sm"
                disabled={actionMutation.isPending}
                buttonClassName="from-primary/15 to-secondary/20 text-base-content"
              >
                {actionMutation.isPending ? (
                  <div className="px-3">
                    <span className="loading loading-spinner loading-xs" />
                  </div>
                ) : (
                  "Confirm"
                )}
              </GradientButton>
            </div>
          </form>
        </CustomerModal>
      )}
    </div>
  );
}
