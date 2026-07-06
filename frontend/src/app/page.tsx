import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <section className="max-w-3xl text-center">
        <p className="mb-3 text-sm uppercase tracking-wide text-neutral-500">
          CinePortal
        </p>

        <h1 className="text-5xl font-bold">
          Find what to watch across streaming services.
        </h1>

        <p className="mt-5 text-lg text-neutral-400">
          Search movies and shows using text or voice, then get personalized
          recommendations based on your watch history.
        </p>

        <div className="mt-8">
          <Link
            href="/search"
            className="rounded-lg bg-white px-6 py-3 font-medium text-black hover:bg-neutral-200"
          >
            Start Searching
          </Link>
          <Link
            href="/billing"
            className="rounded-lg border border-neutral-700 px-6 py-3 font-medium text-white hover:bg-neutral-900"
          >
            View Plans
          </Link>
          <Link
            href="/support"
            className="rounded-lg border border-neutral-700 px-6 py-3 font-medium text-white hover:bg-neutral-900"
          >
            Get Support
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-white px-6 py-3 font-medium text-black hover:bg-neutral-200"
          >
            Create Account
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-neutral-700 px-6 py-3 font-medium text-white hover:bg-neutral-900"
          >
            Log In
          </Link>

          <Link
            href="/search"
            className="rounded-lg border border-neutral-700 px-6 py-3 font-medium text-white hover:bg-neutral-900"
          >
            Search
          </Link>
        </div>
      </section>
    </main>
  );
}