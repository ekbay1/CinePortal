import Link from "next/link";

export default function BillingSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <section className="max-w-xl rounded-xl border border-neutral-800 bg-neutral-950 p-8 text-center">
        <p className="mb-2 text-sm uppercase tracking-wide text-green-500">
          Payment Successful
        </p>

        <h1 className="text-4xl font-bold">Subscription activated</h1>

        <p className="mt-4 text-neutral-400">
          Your Stripe test subscription was completed. The webhook should update
          your subscription status shortly.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/account/subscriptions"
            className="rounded-lg bg-white px-6 py-3 font-medium text-black hover:bg-neutral-200"
          >
            View Subscriptions
          </Link>

          <Link
            href="/billing"
            className="rounded-lg border border-neutral-700 px-6 py-3 font-medium text-white hover:bg-neutral-900"
          >
            Back to Billing
          </Link>
        </div>
      </section>
    </main>
  );
}