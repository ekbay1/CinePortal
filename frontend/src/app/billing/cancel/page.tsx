import Link from "next/link";

export default function BillingCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <section className="max-w-xl rounded-xl border border-neutral-800 bg-neutral-950 p-8 text-center">
        <p className="mb-2 text-sm uppercase tracking-wide text-neutral-500">
          Checkout Canceled
        </p>

        <h1 className="text-4xl font-bold">No subscription was created</h1>

        <p className="mt-4 text-neutral-400">
          You can return to billing and choose a base plan or streaming add-on
          whenever you are ready.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/billing"
            className="rounded-lg bg-white px-6 py-3 font-medium text-black hover:bg-neutral-200"
          >
            Back to Billing
          </Link>

          <Link
            href="/dashboard"
            className="rounded-lg border border-neutral-700 px-6 py-3 font-medium text-white hover:bg-neutral-900"
          >
            Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}