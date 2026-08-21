import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-12">
      {/* Background decorations */}
      <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="absolute -right-40 -top-20 h-96 w-96 rounded-full bg-purple-500/15 blur-3xl" />
      <div className="absolute -bottom-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-400/10 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
        {/* 404 */}
        <div className="mb-8">
          <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 bg-clip-text text-[120px] font-black leading-none tracking-tighter text-transparent sm:text-[170px]">
            404
          </h1>
        </div>

        {/* Content Card */}
        <div className="rounded-3xl border border-gray-200 bg-white/80 p-8 shadow-xl shadow-blue-500/10 backdrop-blur-xl sm:p-12">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 ring-1 ring-blue-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-8 w-8 text-purple-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 9.75l.75.75m3.75-.75l-.75.75m-3.75 3.75l.75-.75m3.75.75l-.75-.75M12 21a9 9 0 100-18 9 9 0 000 18z"
              />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Page not found
          </h2>

          {/* Description */}
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
            Sorry, we couldn't find the page you're looking for. It may have
            been moved, deleted, or the URL might be incorrect.
          </p>

          {/* Button */}
          <div className="mt-8">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-purple-500/30 active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>

              Back to Home
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-gray-400">
          Error code: 404 · Page unavailable
        </p>
      </div>
    </div>
  );
}