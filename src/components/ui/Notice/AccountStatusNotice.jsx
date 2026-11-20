import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock3,
  Headphones,
  HelpCircle,
  Lock,
  Mail,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  XCircle,
} from "lucide-react";
import CardWithBlurBlob from "../Card/CardWithBlurBlob";
import SoftIconCard from "../Card/SoftIconCard";
import TextBadge from "../Badge/TextBadge";
import GradientButton from "../Button/GradientButton";

const STATUS_CONFIG = {
  pending: {
    icon: Clock3,
    variant: "yellow",
    badgeText: "Verification In Progress",
    defaultTitle: "Your Account is Pending Approval",
    subtitle:
      "We are verifying your workspace membership before unlocking dashboard access.",
    managerMessage:
      "Your manager profile has been successfully registered. The company owner needs to review and approve your join request before you can manage tickets, agents, and customers.",
    agentMessage:
      "Your support agent profile has been successfully registered. A workspace manager or company owner needs to review and approve your join request before you can handle customer tickets.",
    nextSteps: [
      "No further action is required from you right now.",
      "Your workspace administrator has been notified of your pending request.",
      "Once approved, click 'Check Status' below or refresh the page to enter your dashboard.",
    ],
  },
  rejected: {
    icon: XCircle,
    variant: "red",
    badgeText: "Application Declined",
    defaultTitle: "Workspace Join Request Rejected",
    subtitle:
      "Your request to join this company workspace was not approved by the administrator.",
    managerMessage:
      "Your manager join request was declined by the company owner. Access to company data, agent approvals, and ticket queues remains locked.",
    agentMessage:
      "Your support agent join request was declined by your workspace manager or owner. Access to customer queues and support tools remains locked.",
    nextSteps: [
      "Review the administrator's rejection note below carefully.",
      "Contact your company owner or team lead if you believe this was a mistake.",
      "If re-invited or updated by the admin, click 'Check Status' to re-verify your access.",
    ],
  },
  suspended: {
    icon: ShieldAlert,
    variant: "red",
    badgeText: "Access Restricted",
    defaultTitle: "Your Workspace Account is Suspended",
    subtitle:
      "Your account permissions have been temporarily paused by an administrator.",
    managerMessage:
      "Your manager privileges have been temporarily suspended by the company owner. You cannot view or modify workspace tickets, agents, or settings until reactivated.",
    agentMessage:
      "Your support agent privileges have been temporarily suspended by your manager or company owner. Active ticket handling and replies are paused until reactivated.",
    nextSteps: [
      "Reach out to your workspace owner or manager for clarification.",
      "Existing company records and ticket histories remain safely preserved.",
      "Once your account is reactivated, click 'Check Status' to resume work.",
    ],
  },
};

const ROLE_CONFIG = {
  agent: {
    icon: Headphones,
    variant: "cyan",
    label: "Support Agent",
    approverLabel: "Workspace Manager / Owner",
  },
  manager: {
    icon: ShieldCheck,
    variant: "pink",
    label: "Manager",
    approverLabel: "Company Owner",
  },
};

const ROLE_CAPABILITIES = {
  manager: [
    "Monitor company-wide ticket analytics & SLA performance",
    "Approve, reject, or manage support agent seats",
    "Assign high-priority tickets and oversee escalations",
    "Manage customer workspace access and ticket histories",
  ],
  agent: [
    "Claim and resolve assigned customer support tickets",
    "Collaborate with AI-assisted ticket summaries & suggestions",
    "Track personal resolution metrics and active queue",
    "Update ticket statuses and communicate with customers",
  ],
};

function resolveStatusType(status = "", message = "") {
  const normalizedStatus = String(status).toLowerCase();
  const normalizedMsg = String(message).toLowerCase();

  if (normalizedStatus === "rejected" || normalizedMsg.includes("rejected")) {
    return "rejected";
  }

  if (
    normalizedStatus === "suspended" ||
    normalizedMsg.includes("suspended") ||
    normalizedMsg.includes("not active")
  ) {
    return "suspended";
  }

  return "pending";
}

export default function AccountStatusNotice({
  role = "agent", // "manager" | "agent"
  status, // optional: "pending" | "rejected" | "suspended"
  errorMessage = "",
  rejectionReason = "",
  companyName = "",
  userEmail = "",
  isChecking = false,
  onRefresh,
  onSignOut,
}) {
  const type = resolveStatusType(status, errorMessage);
  const config = STATUS_CONFIG[type] || STATUS_CONFIG.pending;

  const normalizedRole =
    String(role).toLowerCase() === "manager" ? "manager" : "agent";
  const isManager = normalizedRole === "manager";
  const roleInfo = ROLE_CONFIG[normalizedRole];
  const RoleIcon = roleInfo.icon;
  const approverLabel = roleInfo.approverLabel;

  const description =
    errorMessage || (isManager ? config.managerMessage : config.agentMessage);
  const capabilities = ROLE_CAPABILITIES[normalizedRole];

  return (
    <section className="flex min-h-[calc(100vh-4.5rem)] w-full flex-col justify-center p-4 lg:p-6">
      <CardWithBlurBlob
        className="flex w-full flex-1 flex-col justify-between p-6 sm:p-8 lg:p-10"
        interactive={false}
      >
        {/* TOP BANNER & HEADER */}
        <div>
          <div className="flex flex-col justify-between gap-4 border-b border-base-content/10 pb-6 lg:flex-row lg:items-center">
            <div className="flex items-start gap-4">
              <SoftIconCard
                icon={config.icon}
                size={26}
                variant={config.variant}
                className="h-14 w-14 shrink-0 rounded-2xl"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <TextBadge variant={config.variant}>
                    {config.badgeText}
                  </TextBadge>

                  {/* Role Badge matching Profile.jsx */}
                  <TextBadge variant={roleInfo.variant}>
                    <RoleIcon size={13} className="mr-1" />
                    {roleInfo.label}
                  </TextBadge>

                  {/* Company Badge matching Profile.jsx */}
                  {companyName && (
                    <TextBadge variant="purple">
                      <Building2 size={13} className="mr-1" />
                      {companyName}
                    </TextBadge>
                  )}
                </div>

                <h1 className="mt-2.5 text-xl font-bold tracking-tight text-base-content sm:text-2xl">
                  {config.defaultTitle}
                </h1>
                <p className="mt-1 text-xs text-base-content/60 sm:text-sm">
                  {config.subtitle}
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-2.5">
              {typeof onRefresh === "function" && (
                <GradientButton
                  type="button"
                  size="sm"
                  disabled={isChecking}
                  onClick={onRefresh}
                  buttonClassName="from-primary to-secondary text-white whitespace-nowrap px-5 h-10"
                >
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw
                      size={14}
                      className={isChecking ? "animate-spin" : ""}
                    />
                    {isChecking
                      ? "Checking Status..."
                      : "Check Approval Status"}
                  </span>
                </GradientButton>
              )}

              {typeof onSignOut === "function" && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="h-10 rounded-xl border border-base-content/15 px-4 text-xs font-medium text-base-content/75 transition hover:bg-base-200 hover:text-base-content"
                >
                  Switch Account
                </button>
              )}
            </div>
          </div>

          {/* MAIN EXPLANATION & REJECTION REASON */}
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-base-content/10 bg-base-200/35 p-4 sm:p-5">
              <p className="text-sm leading-relaxed text-base-content/80">
                {description}
              </p>

              {(userEmail || companyName) && (
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-base-content/10 pt-3.5 text-xs text-base-content/60">
                  {userEmail && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail size={13} className="text-primary" />
                      Signed in as:{" "}
                      <strong className="font-medium text-base-content">
                        {userEmail}
                      </strong>
                    </span>
                  )}
                  {companyName && (
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 size={13} className="text-primary" />
                      Workspace:{" "}
                      <strong className="font-medium text-base-content">
                        {companyName}
                      </strong>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <UserCheck size={13} className="text-primary" />
                    Reviewer:{" "}
                    <strong className="font-medium text-base-content">
                      {approverLabel}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {/* REJECTION REASON ALERT BOX */}
            {type === "rejected" && (
              <div className="rounded-2xl border border-error/25 bg-error/5 p-4 sm:p-5">
                <div className="flex items-center gap-2 text-error">
                  <AlertTriangle size={16} />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Administrator Rejection Note
                  </h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-base-content/80">
                  {rejectionReason ||
                    "No specific reason was attached by the administrator. Please reach out to your company owner for more information."}
                </p>
              </div>
            )}
          </div>

          {/* 3-COLUMN DETAILED INFORMATION GRID */}
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {/* COLUMN 1: VERIFICATION TIMELINE */}
            <div className="rounded-2xl border border-base-content/10 bg-base-100/60 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-base-content">
                <ShieldCheck size={16} className="text-primary" />
                <span>Onboarding Progress</span>
              </div>

              <div className="mt-4 space-y-4">
                {/* Step 1 */}
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-success"
                  />
                  <div>
                    <p className="text-xs font-semibold text-base-content">
                      1. Account Registered
                    </p>
                    <p className="mt-0.5 text-[11px] leading-4 text-base-content/55">
                      Your profile and role credentials are saved in the system.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3">
                  {type === "pending" ? (
                    <Clock3
                      size={17}
                      className="mt-0.5 shrink-0 text-warning"
                    />
                  ) : (
                    <XCircle size={17} className="mt-0.5 shrink-0 text-error" />
                  )}
                  <div>
                    <p className="text-xs font-semibold text-base-content">
                      2.{" "}
                      {type === "pending"
                        ? "Admin Approval Pending"
                        : type === "rejected"
                          ? "Approval Declined"
                          : "Account Suspended"}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-4 text-base-content/55">
                      {type === "pending"
                        ? `Waiting for ${approverLabel} to verify your request.`
                        : `Action taken by ${approverLabel}.`}
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 opacity-60">
                  <Lock
                    size={17}
                    className="mt-0.5 shrink-0 text-base-content/50"
                  />
                  <div>
                    <p className="text-xs font-semibold text-base-content">
                      3. Full Workspace Access
                    </p>
                    <p className="mt-0.5 text-[11px] leading-4 text-base-content/55">
                      Dashboard, ticket queues, and tools unlock automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: WHAT YOU CAN DO NEXT */}
            <div className="rounded-2xl border border-base-content/10 bg-base-100/60 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-base-content">
                <HelpCircle size={16} className="text-warning" />
                <span>What You Should Do Next</span>
              </div>

              <ul className="mt-4 space-y-3">
                {config.nextSteps.map((step, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2.5 text-xs leading-5 text-base-content/70"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 3: ROLE CAPABILITIES PREVIEW */}
            <div className="rounded-2xl border border-base-content/10 bg-base-100/60 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-base-content">
                <Sparkles size={16} className="text-secondary" />
                <span>Unlocked After Approval</span>
              </div>

              <ul className="mt-4 space-y-3">
                {capabilities.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2.5 text-xs leading-5 text-base-content/70"
                  >
                    <CheckCircle2
                      size={14}
                      className="mt-0.5 shrink-0 text-success/80"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* BOTTOM FOOTER BAR */}
        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-base-content/10 pt-4 text-xs text-base-content/50 sm:flex-row sm:items-center">
          <p>
            Need immediate access? Ask your{" "}
            <span className="font-medium text-base-content/75">
              {approverLabel}
            </span>{" "}
            to approve your account from their team management panel.
          </p>
          <p className="font-mono text-[11px]">
            Status: {type.toUpperCase()} · Role: {normalizedRole.toUpperCase()}
          </p>
        </div>
      </CardWithBlurBlob>
    </section>
  );
}
