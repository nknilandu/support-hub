import { useContext, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { AuthContext } from "@/providers/AuthProvider";
import CardWithBlurBlob from "@/components/ui/Card/CardWithBlurBlob";
import GradientButton from "@/components/ui/Button/GradientButton";

const API_BASE_URL = "https://support-hub-server.vercel.app";

export default function OwnerPaymentSuccess() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const sessionId = searchParams.get("session_id");

  const {
    data,
    isLoading: queryLoading,
    isError: queryError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["verify-stripe-payment", sessionId, user?.uid],
    enabled: !authLoading && Boolean(user) && Boolean(sessionId),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    queryFn: async () => {
      const token = await user.getIdToken();
      const res = await fetch(
        `${API_BASE_URL}/owner/subscription/verify-payment?session_id=${encodeURIComponent(sessionId)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );
      const result = await res.json().catch(() => null);
      if (!res.ok || !result?.success) {
        throw new Error(result?.message || "Payment verification failed");
      }
      return result;
    },
  });

  useEffect(() => {
    if (data?.success) {
      queryClient.invalidateQueries({ queryKey: ["owner-subscription"] });
      queryClient.invalidateQueries({ queryKey: ["owner-overview"] });
    }
  }, [data, queryClient]);

  const isLoading = authLoading || (Boolean(sessionId) && queryLoading);
  const isError = !sessionId || queryError;
  const invoice = data?.invoice;

  return (
    <div className="flex min-h-[75vh] items-center justify-center p-4">
      <CardWithBlurBlob
        interactive={false}
        className="w-full max-w-md p-8 text-center"
      >
        {isLoading ? (
          <div className="space-y-3 py-6">
            <Loader2 size={38} className="mx-auto animate-spin text-primary" />
            <h2 className="text-lg font-semibold">Verifying Payment...</h2>
            <p className="text-xs text-base-content/60">
              Please wait while we confirm your Stripe payment.
            </p>
          </div>
        ) : isError ? (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error/15 text-error">
              <XCircle size={30} />
            </div>
            <h2 className="text-xl font-bold">Verification Failed</h2>
            <p className="text-xs text-base-content/60">
              {error?.message || "Invalid payment session."}
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              {sessionId && (
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl bg-primary px-4 text-xs font-semibold text-white hover:bg-primary/90"
                >
                  Retry Verification
                </button>
              )}
              <Link
                to="/owner/subscription"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-base-content/15 px-5 text-xs font-semibold hover:bg-base-200"
              >
                Back to Subscription
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h2 className="text-xl font-bold">Payment Successful!</h2>
              <p className="mt-1 text-xs text-base-content/60">
                {data?.message || "Your workspace subscription is now active."}
              </p>
            </div>

            {invoice && (
              <div className="space-y-2 rounded-xl border border-base-content/10 bg-base-200/40 p-4 text-left text-xs">
                <div className="flex justify-between">
                  <span className="text-base-content/60">Invoice</span>
                  <span className="font-mono font-semibold">
                    {invoice.invoiceNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/60">Plan</span>
                  <span className="font-semibold">{invoice.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/60">Amount Paid</span>
                  <span className="font-bold text-success">
                    {invoice.amount}
                  </span>
                </div>
                {invoice.transactionId && (
                  <div className="flex justify-between gap-2 border-t border-base-content/10 pt-2">
                    <span className="shrink-0 text-base-content/60">
                      Transaction ID
                    </span>
                    <span className="truncate font-mono text-[11px]">
                      {invoice.transactionId}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2">
              <Link to="/owner/subscription" className="block">
                <GradientButton
                  type="button"
                  size="sm"
                  buttonClassName="w-full h-10 from-primary to-secondary text-white"
                >
                  <span>Go to Subscription</span>
                  <ArrowRight size={15} />
                </GradientButton>
              </Link>
            </div>
          </div>
        )}
      </CardWithBlurBlob>
    </div>
  );
}
