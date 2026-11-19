import { useContext, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  CreditCard,
  Crown,
  Receipt,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserCheck,
  Users,
  X,
  Zap,
} from "lucide-react";
import { toast } from "react-toastify";

import { AuthContext } from "../../app/providers/AuthProvider";
import CardWithBlurBlob from "../../components/ui/Card/CardWithBlurBlob";
import SoftIconCard from "../../components/ui/Card/SoftIconCard";
import TextBadge from "../../components/ui/Badge/TextBadge";
import GradientButton from "../../components/ui/Button/GradientButton";
import { cn } from "../../src/lib/cn";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3021"
).replace(/\/+$/, "");

const PLAN_VISUALS = {
  default: { icon: Zap, variant: "slate" },
  starter: { icon: Zap, variant: "blue" },
  growth: { icon: Sparkles, variant: "purple" },
  scale: { icon: Crown, variant: "cyan" },
  enterprise: { icon: Building2, variant: "orange" },
};

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
    throw new Error(result?.message || `Request failed (${response.status})`);
  }

  return result;
}

function getTimeRemaining(expiryIso) {
  if (!expiryIso) return { label: "0 days", isUrgent: false };
  const diffMs = new Date(expiryIso).getTime() - Date.now();
  if (Number.isNaN(diffMs) || diffMs <= 0) {
    return { label: "0 days", isUrgent: true };
  }

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  return {
    label: days === 0 ? `${hours}h left` : `${days}d ${hours}h left`,
    isUrgent: days <= 5,
  };
}

export default function OwnerSubscription() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [selectedPlanModal, setSelectedPlanModal] = useState(null);

  const subQuery = useQuery({
    queryKey: ["owner-subscription", user?.uid || null],
    enabled: !authLoading && !!user,
    queryFn: ({ signal }) =>
      apiRequest(user, "/owner/subscription", { method: "GET", signal }),
    staleTime: 15_000,
  });

  const checkoutMutation = useMutation({
    mutationFn: (planId) =>
      apiRequest(user, "/owner/subscription/checkout-session", {
        method: "POST",
        body: { planId },
      }),
    onSuccess: (res) => {
      if (res?.url) {
        window.location.assign(res.url);
      } else {
        toast.error("Stripe checkout URL not received");
      }
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to start Stripe checkout");
    },
  });

  const plans = subQuery.data?.plans || [];
  const subscription = subQuery.data?.subscription || null;
  const invoices = subQuery.data?.invoices || [];

  const dueInfo = useMemo(
    () => getTimeRemaining(subscription?.expiresAt),
    [subscription?.expiresAt],
  );

  const usage = subscription?.usage || {
    managersUsed: 0,
    agentsUsed: 0,
    aiRepliesUsed: 0,
    aiRepliesLimit: 50,
  };

  const managerLimit = subscription?.limits?.managers ?? 1;
  const agentLimit = subscription?.limits?.agents ?? 3;
  const ticketLimitLabel = subscription?.limits?.ticketsLabel || "30 / mo";
  const aiLimit = subscription?.limits?.aiReplies;

  const managerPercent = managerLimit
    ? Math.min(100, Math.round((usage.managersUsed / managerLimit) * 100))
    : 0;
  const agentPercent = agentLimit
    ? Math.min(100, Math.round((usage.agentsUsed / agentLimit) * 100))
    : 0;
  const aiPercent =
    aiLimit === null
      ? 20
      : aiLimit > 0
        ? Math.min(100, Math.round((usage.aiRepliesUsed / aiLimit) * 100))
        : 0;

  const isLoading =
    authLoading || (user && subQuery.isPending && !subscription);

  if (isLoading) {
    return (
      <div className="space-y-5 p-4 lg:p-6">
        <div className="skeleton h-8 w-56 rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardWithBlurBlob key={i} className="p-5" interactive={false}>
              <div className="skeleton h-9 w-9 rounded-xl" />
              <div className="skeleton mt-4 h-5 w-28 rounded" />
              <div className="skeleton mt-3 h-8 w-24 rounded" />
              <div className="skeleton mt-5 h-11 w-full rounded-2xl" />
            </CardWithBlurBlob>
          ))}
        </div>
      </div>
    );
  }

  if (subQuery.error && !subscription) {
    return (
      <div className="p-4 lg:p-6">
        <CardWithBlurBlob className="p-8 text-center" interactive={false}>
          <p className="text-sm font-medium text-base-content/75">
            {subQuery.error.message}
          </p>
          <GradientButton
            size="sm"
            className="mt-4"
            onClick={() => subQuery.refetch()}
            buttonClassName="from-primary to-secondary text-white px-4"
          >
            Retry
          </GradientButton>
        </CardWithBlurBlob>
      </div>
    );
  }

  const currentVisual =
    PLAN_VISUALS[subscription?.planId] || PLAN_VISUALS.default;
  const CurrentIcon = currentVisual.icon;

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* 1. HEADER */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            Subscription &amp; Billing
          </h1>
          <TextBadge
            variant={
              subscription?.status === "active"
                ? "green"
                : subscription?.status === "expired"
                  ? "red"
                  : "blue"
            }
            size="sm"
          >
            {subscription?.status === "active"
              ? "Active"
              : subscription?.status === "expired"
                ? "Expired"
                : "Default"}
          </TextBadge>
        </div>
        <p className="mt-1 text-sm text-base-content/60">
          Upgrade your monthly workspace limits with Stripe.
        </p>
      </div>

      {/* 2. CURRENT PLAN & USAGE */}
      <div className="grid gap-4 xl:grid-cols-12">
        <CardWithBlurBlob className="p-5 xl:col-span-8" interactive={false}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-content/10 pb-4">
            <div className="flex items-center gap-3">
              <SoftIconCard
                icon={CurrentIcon}
                variant={currentVisual.variant}
                size={20}
              />
              <div>
                <h2 className="text-base font-semibold">
                  {subscription?.planName}
                </h2>
                <p className="text-xs text-base-content/55">
                  {subscription?.tagline}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {subscription?.price}
              </p>
              <p className="text-[11px] text-base-content/50">
                Tickets Quota: {ticketLimitLabel}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {/* Managers */}
            <div className="rounded-xl border border-base-content/10 bg-base-200/35 p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-base-content/75">
                  <ShieldCheck size={14} className="text-primary" />
                  Managers
                </span>
                <span className="font-semibold">
                  {usage.managersUsed} / {managerLimit}
                </span>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-base-300/80">
                <div
                  style={{ width: `${managerPercent}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                />
              </div>
            </div>

            {/* Agents */}
            <div className="rounded-xl border border-base-content/10 bg-base-200/35 p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-base-content/75">
                  <UserCheck size={14} className="text-secondary" />
                  Agents
                </span>
                <span className="font-semibold">
                  {usage.agentsUsed} / {agentLimit}
                </span>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-base-300/80">
                <div
                  style={{ width: `${agentPercent}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-secondary to-accent"
                />
              </div>
            </div>

            {/* AI Replies */}
            <div className="rounded-xl border border-base-content/10 bg-base-200/35 p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-base-content/75">
                  <Sparkles size={14} className="text-accent" />
                  AI Replies
                </span>
                <span className="font-semibold">
                  {usage.aiRepliesUsed} /{" "}
                  {aiLimit === null ? "Unlimited" : aiLimit}
                </span>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-base-300/80">
                <div
                  style={{ width: `${aiPercent}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                />
              </div>
            </div>
          </div>
        </CardWithBlurBlob>

        {/* Billing Info Card (No dashes) */}
        <CardWithBlurBlob
          className="flex flex-col justify-between p-5 xl:col-span-4"
          interactive={false}
        >
          <div className="space-y-3 text-xs">
            <h3 className="text-sm font-semibold">Billing Info</h3>
            <div className="space-y-2.5 rounded-xl border border-base-content/10 bg-base-200/35 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-base-content/55">Billing Cycle</span>
                <span className="font-semibold">
                  {subscription?.billingCycle || "Not Subscribed"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base-content/55">Expire Date</span>
                <span className="flex items-center gap-1 font-semibold">
                  <CalendarClock size={13} className="text-primary" />
                  {subscription?.expireDate || "Not Applicable"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base-content/55">Remaining</span>
                <span
                  className={cn(
                    "font-semibold",
                    dueInfo.isUrgent ? "text-warning" : "text-success",
                  )}
                >
                  {dueInfo.label}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-3 text-center text-[11px] text-base-content/50">
            Payments powered by Stripe
          </p>
        </CardWithBlurBlob>
      </div>

      {/* 3. 4 MONTHLY PRICING PLANS */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const visual = PLAN_VISUALS[plan.id] || PLAN_VISUALS.starter;
          const PlanIcon = visual.icon;
          const isCurrent =
            plan.id === subscription?.planId &&
            subscription?.status === "active";
          const isFeatured = Boolean(plan.featured);

          return (
            <CardWithBlurBlob
              key={plan.id}
              interactive={!isCurrent}
              className={cn(
                "flex flex-col justify-between p-5 transition",
                isFeatured &&
                  "border-primary/50 ring-1 ring-primary/25 shadow-md",
                isCurrent && !isFeatured && "border-success/40",
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <SoftIconCard
                    icon={PlanIcon}
                    variant={visual.variant}
                    size={17}
                  />
                  {isCurrent ? (
                    <TextBadge variant="green" size="sm">
                      Current
                    </TextBadge>
                  ) : plan.badge ? (
                    <TextBadge variant={visual.variant} size="sm">
                      {plan.badge}
                    </TextBadge>
                  ) : null}
                </div>

                <h3 className="mt-3.5 text-base font-semibold">{plan.name}</h3>
                <p className="mt-0.5 text-xs text-base-content/55">
                  {plan.tagline}
                </p>

                <div className="mt-4 flex items-baseline gap-1 border-b border-base-content/10 pb-4">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-xs text-base-content/50">/ month</span>
                </div>

                {/* Limits */}
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-base-content/10 bg-base-200/40 p-3 text-xs">
                  <div>
                    <p className="text-[10px] uppercase text-base-content/50">
                      Managers
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 font-bold">
                      <ShieldCheck size={13} className="text-primary" />
                      {plan.limits.managers}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-base-content/50">
                      Agents
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 font-bold">
                      <Users size={13} className="text-secondary" />
                      {plan.limits.agents}
                    </p>
                  </div>
                  <div className="col-span-2 border-t border-base-content/10 pt-2">
                    <p className="text-[10px] uppercase text-base-content/50">
                      Tickets
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 font-semibold">
                      <Ticket size={13} className="text-accent" />
                      {plan.limits.ticketsLabel}
                    </p>
                  </div>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-base-content/75">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2">
                      <Check size={14} className="shrink-0 text-success" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-2">
                {isCurrent ? (
                  <button
                    type="button"
                    disabled
                    className="flex h-11 w-full items-center justify-center gap-1.5 rounded-2xl border border-success/30 bg-success/10 text-xs font-semibold text-success"
                  >
                    <CheckCircle2 size={15} /> Current Plan
                  </button>
                ) : isFeatured ? (
                  <button
                    type="button"
                    onClick={() => setSelectedPlanModal(plan)}
                    className="flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 text-xs font-semibold text-white shadow-md shadow-primary/20 transition hover:opacity-95"
                  >
                    Choose {plan.name}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSelectedPlanModal(plan)}
                    className="flex h-11 w-full items-center justify-center rounded-2xl border border-base-content/15 bg-base-100 px-4 text-xs font-semibold text-base-content transition hover:border-primary/40 hover:bg-base-200/60"
                  >
                    Choose {plan.name}
                  </button>
                )}
              </div>
            </CardWithBlurBlob>
          );
        })}
      </div>

      {/* 4. PAYMENT HISTORY */}
      <CardWithBlurBlob className="overflow-hidden p-0" interactive={false}>
        <div className="flex items-center gap-2.5 border-b border-base-content/10 px-5 py-4">
          <SoftIconCard icon={Receipt} variant="slate" size={16} />
          <div>
            <h3 className="text-sm font-semibold">Payment History</h3>
            <p className="text-xs text-base-content/50">
              Completed Stripe transactions
            </p>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-base-content/55">
            No payments recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr className="text-xs uppercase text-base-content/50">
                  <th className="px-5 py-3.5 font-semibold">Invoice</th>
                  <th className="px-5 py-3.5 font-semibold">Plan</th>
                  <th className="px-5 py-3.5 font-semibold">Transaction ID</th>
                  <th className="px-5 py-3.5 font-semibold">Date</th>
                  <th className="px-5 py-3.5 font-semibold">Amount</th>
                  <th className="px-5 py-3.5 text-right font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {invoices.map((inv) => (
                  <tr key={inv._id}>
                    <td className="px-5 py-3.5 font-mono text-xs font-medium">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-5 py-3.5 font-medium">{inv.planName}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-base-content/55">
                      {inv.transactionId}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-base-content/60">
                      {inv.date}
                    </td>
                    <td className="px-5 py-3.5 font-semibold">{inv.amount}</td>
                    <td className="px-5 py-3.5 text-right">
                      <TextBadge
                        variant="green"
                        size="sm"
                        className="capitalize"
                      >
                        {inv.status}
                      </TextBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardWithBlurBlob>

      {/* CONFIRMATION MODAL */}
      {selectedPlanModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() =>
            !checkoutMutation.isPending && setSelectedPlanModal(null)
          }
        >
          <div className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardWithBlurBlob
              interactive={false}
              className="border border-base-content/10 bg-base-100 p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3 border-b border-base-content/10 pb-4">
                <div>
                  <h3 className="text-base font-bold">
                    Confirm {selectedPlanModal.name} Plan
                  </h3>
                  <p className="mt-0.5 text-xs text-base-content/55">
                    Proceed to Stripe Checkout
                  </p>
                </div>
                <button
                  type="button"
                  disabled={checkoutMutation.isPending}
                  onClick={() => setSelectedPlanModal(null)}
                  className="rounded-xl p-1.5 text-base-content/50 hover:bg-base-content/10"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 space-y-2 rounded-xl border border-base-content/10 bg-base-200/40 p-3.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-base-content/60">Plan</span>
                  <span className="font-semibold">
                    {selectedPlanModal.name} (Monthly)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/60">Limits</span>
                  <span className="font-semibold">
                    {selectedPlanModal.limits.managers} Managers ·{" "}
                    {selectedPlanModal.limits.agents} Agents ·{" "}
                    {selectedPlanModal.limits.ticketsLabel} Tickets
                  </span>
                </div>
                <div className="flex justify-between border-t border-base-content/10 pt-2 text-sm">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-primary">
                    ${selectedPlanModal.price} / mo
                  </span>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-base-content/10 pt-4">
                <button
                  type="button"
                  disabled={checkoutMutation.isPending}
                  onClick={() => setSelectedPlanModal(null)}
                  className="h-10 rounded-xl border border-base-content/10 px-4 text-xs font-medium hover:bg-base-200"
                >
                  Cancel
                </button>
                <GradientButton
                  type="button"
                  size="sm"
                  disabled={checkoutMutation.isPending}
                  onClick={() => checkoutMutation.mutate(selectedPlanModal.id)}
                  buttonClassName="from-primary to-secondary text-white px-5 h-10"
                >
                  <CreditCard size={15} />
                  <span>
                    {checkoutMutation.isPending
                      ? "Redirecting..."
                      : "Pay with Stripe"}
                  </span>
                </GradientButton>
              </div>
            </CardWithBlurBlob>
          </div>
        </div>
      )}
    </div>
  );
}
