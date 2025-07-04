import React from "react";
import { Link } from "react-router-dom"; // remove if not using React Router

const NotFound = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white px-6">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold tracking-widest text-red-500 animate-pulse">
          404
        </h1>
        <p className="text-2xl md:text-3xl font-light mt-6">Page Not Found</p>
        <p className="mt-4 text-gray-400">
          The page you're looking for doesn’t exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-block px-6 py-2 text-sm font-semibold text-white bg-red-500 rounded hover:bg-red-600 transition"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
