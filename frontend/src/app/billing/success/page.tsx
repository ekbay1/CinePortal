import Link from "next/link";

export default function BillingSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <section className="max-w-xl text-center">
        <h1 className="text-4xl font-bold">Subscription successful</h1>

        <p className="mt-4 text-neutral-400">
          Your Stripe test subscription was completed. The webhook should update your local subscription status.
        </p>

        <Link
          href="/billing"
          className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-medium text-black hover:bg-neutral-200"
        >
          Back to Billing
        </Link>
      </section>
    </main>
  );
}