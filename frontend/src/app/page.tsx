import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold text-gray-900">
          Welcome to <span className="text-blue-600">DocuTrust</span>
        </h1>

        <p className="mt-3 text-2xl text-gray-600">
          Secure document management and trust system.
        </p>

        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <Link
            href="/register"
            className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600 border-gray-200 hover:border-blue-500 transition-colors bg-white shadow-sm"
          >
            <h3 className="text-2xl font-bold">Get Started &rarr;</h3>
            <p className="mt-4 text-xl">
              Create an account to securely upload and manage your documents.
            </p>
          </Link>

          <Link
            href="/login"
            className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600 border-gray-200 hover:border-blue-500 transition-colors bg-white shadow-sm"
          >
            <h3 className="text-2xl font-bold">Login &rarr;</h3>
            <p className="mt-4 text-xl">
              Already have an account? Access your dashboard here.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
