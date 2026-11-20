import { Link } from "react-router";
import { ArrowLeft, XCircle } from "lucide-react";
import CardWithBlurBlob from "@/components/ui/Card/CardWithBlurBlob";
import GradientButton from "@/components/ui/Button/GradientButton";



export default function OwnerPaymentCancelled() {
  return (
    <div className="flex min-h-[75vh] items-center justify-center p-4">
      <CardWithBlurBlob
        interactive={false}
        className="w-full max-w-md p-8 text-center"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error/15 text-error">
          <XCircle size={32} />
        </div>

        <h2 className="mt-4 text-xl font-bold">Payment Cancelled</h2>
        <p className="mt-1.5 text-xs text-base-content/60">
          Your Stripe payment was cancelled or failed. No charges were made to
          your account.
        </p>

        <div className="mt-6">
          <Link to="/owner/subscription" className="block">
            <GradientButton
              type="button"
              size="sm"
              buttonClassName="w-full h-10 from-primary to-secondary text-white"
            >
              <ArrowLeft size={15} />
              <span>Return to Subscription</span>
            </GradientButton>
          </Link>
        </div>
      </CardWithBlurBlob>
    </div>
  );
}