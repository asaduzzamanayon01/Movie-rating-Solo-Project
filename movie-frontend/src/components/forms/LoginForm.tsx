/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Link from "next/link";
import { useContext, useState } from "react";
import { AuthContext } from "../../app/context/AuthContext";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
interface FormData {
  email: string;
  password: string;
}

interface ErrorDetail {
  code: string;
  expected: string;
  received: string;
  path: string[];
  message: string;
}

interface Errors {
  email?: string;
  password?: string;
  [key: string]: string | undefined;
}

const LoginForm = () => {
  const { loading, setLoading } = useContext(AuthContext)!;
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Errors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.token);
        Cookies.set("token", data.token);
        Cookies.set("userId", data.user.id);
        Cookies.set("firstName", data.user.firstName);
        console.log(Cookies.get("token"));
        toast.success("Login Successfully");
        setTimeout(() => {
          router.push("/movies");
        }, 1000);
      } else {
        const errorData = await response.json();
        if (errorData.errors) {
          const newErrors: Errors = {};
          errorData.errors.forEach((error: ErrorDetail) => {
            const field = error.path[0];
            newErrors[field] = error.message;
          });
          setErrors(newErrors);
        } else if (errorData.message) {
          toast.error(errorData.message);
        }
      }
    } catch (error) {
      console.log("error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 shadow-md rounded-lg">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white max-w-md mx-auto"
      >
        <h1 className="text-4xl text-center font-extrabold bg-gradient-to-r from-pink-400 to-red-500 text-transparent bg-clip-text">
          Rotten Tomatoes
        </h1>
        <h1 className="text-2xl font-bold">Login</h1>

        {/* Email */}
        <div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className={`w-full px-3 py-2 border rounded ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className={`w-full px-3 py-2 border rounded ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded focus:outline-none focus:ring"
        >
          {loading ? "Loading..." : "Login"}
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
