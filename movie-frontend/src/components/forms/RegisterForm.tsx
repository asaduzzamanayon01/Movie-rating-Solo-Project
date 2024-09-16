"use client";

import React, { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../app/context/AuthContext";
import { toast } from "sonner";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  password: string;
  confirm_password: string;
}

interface ErrorDetail {
  code: string;
  expected: string;
  received: string;
  path: string[];
  message: string;
}

interface Errors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  password?: string;
  confirm_password?: string;
  [key: string]: string | undefined;
}

const RegisterForm = () => {
  const { loading, setLoading } = useContext(AuthContext)!;
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirm_password: "",
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
      const response = await fetch("http://localhost:8000/api/register", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("Successfully registered! Redirecting...");
        setTimeout(() => {
          router.push("/login");
        }, 1000); // Redirect after 2 seconds
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
          // Display general error message like "Email already exists"
          toast.error(errorData.message);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 shadow-md rounded-lg max-w-md mx-auto"
    >
      <h1 className="text-2xl font-semibold text-center text-gray-800">
        Register
      </h1>

      {/* First Name */}
      <div>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${
            errors.firstName ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.firstName && (
          <p className="text-red-500 text-sm">{errors.firstName}</p>
        )}
      </div>

      {/* Last Name */}
      <div>
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${
            errors.lastName ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.lastName && (
          <p className="text-red-500 text-sm">{errors.lastName}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${
            errors.email ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      {/* Phone (Optional) */}
      <div>
        <input
          type="tel"
          name="phone"
          placeholder="Phone (Optional)"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${
            errors.phone ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
      </div>

      {/* Address */}
      <div>
        <input
          type="text"
          name="address"
          placeholder="Enter Address"
          value={formData.address}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${
            errors.address ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.address && (
          <p className="text-red-500 text-sm">{errors.address}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${
            errors.password ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <input
          type="password"
          name="confirm_password"
          placeholder="Confirm Password"
          value={formData.confirm_password}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded ${
            errors.confirm_password ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.confirm_password && (
          <p className="text-red-500 text-sm">{errors.confirm_password}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded focus:outline-none focus:ring"
      >
        {loading ? "Submitting..." : "Register"}
      </button>
    </form>
  );
};

export default RegisterForm;
