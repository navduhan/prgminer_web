// Not Found page

// Author: Naveen Duhan

// import dependencies

import Link from "next/link";

// not found page component
const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-green-50/20 to-blue-50/20">
      <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-green-100/50">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">The page you are looking for does not exist.</p>
        <Link
          href="/"
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl
                     hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;