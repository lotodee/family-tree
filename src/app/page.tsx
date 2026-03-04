import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-orange-100">
      <main className="flex flex-col items-center gap-8 p-8 text-center">
        <h1 className="text-4xl font-bold text-amber-900 md:text-5xl">
          Welcome to Grandpa&apos;s 100th
        </h1>
        <p className="max-w-md text-lg text-amber-800">
          Join the family tree, share your stories, and be part of something
          special on March 14th.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-full bg-amber-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-amber-700"
          >
            Join the Family Tree
          </Link>
          <Link
            href="/login"
            className="rounded-full border-2 border-amber-600 px-8 py-3 text-lg font-semibold text-amber-600 transition-colors hover:bg-amber-50"
          >
            Already joined? Log in
          </Link>
        </div>
      </main>
    </div>
  );
}
