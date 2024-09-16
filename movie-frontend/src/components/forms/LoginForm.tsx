"use client";

import Link from "next/link";

const LoginForm = () => {
  return (
    <div className="bg-white p-6 shadow-md rounded-lg">
      <form className="space-y-6 bg-white max-w-md mx-auto">
        <h1 className="text-4xl text-center font-extrabold bg-gradient-to-r from-pink-400 to-red-500 text-transparent bg-clip-text">
          Rotten Tomatoes
        </h1>
        <h1 className="text-2xl font-bold">Login</h1>

        {/* Email */}
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className={`w-full px-3 py-2 border rounded`}
          />
        </div>

        {/* Password */}
        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            className={`w-full px-3 py-2 border rounded`}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded focus:outline-none focus:ring"
        >
          {/* {loading ? "Submitting..." : "Register"} */} Login
        </button>
      </form>
      <p className="text-center mt-2">
        Do not have an account ?{" "}
        <strong>
          <Link href="/register">Register</Link>
        </strong>
      </p>
    </div>
  );
};

export default LoginForm;
