import Link from "next/link";

export default function BillingCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <section className="max-w-xl text-center">
        <h1 className="text-4xl font-bold">Checkout canceled</h1>

        <p className="mt-4 text-neutral-400">
          No subscription was created. You can return to billing and choose another plan.
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