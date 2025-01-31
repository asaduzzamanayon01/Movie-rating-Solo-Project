"use client";

import React, { useState, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "sonner";
import Link from "next/link";

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
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect");

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
                    router.push(
                        `/login?redirect=${encodeURIComponent(
                            redirect || "/movies"
                        )}`
                    );
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
        <div className="bg-white p-6 shadow-md rounded-lg">
            <form
                onSubmit={handleSubmit}
                className="space-y-5 max-w-md mx-auto"
            >
                <h1 className="text-4xl text-center font-extrabold bg-gradient-to-r from-pink-400 to-red-500 text-transparent bg-clip-text">
                    Rotten Tomatoes
                </h1>
                <h1 className="text-3xl font-bold">Register</h1>

                {/* First Name */}
                <div>
                    <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 text-white border rounded ${
                            errors.firstName
                                ? "border-red-500"
                                : "border-gray-300"
                        }`}
                    />
                    {errors.firstName && (
                        <p className="text-red-500 text-sm">
                            {errors.firstName}
                        </p>
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
                        className={`w-full px-3 py-2 text-white border rounded ${
                            errors.lastName
                                ? "border-red-500"
                                : "border-gray-300"
                        }`}
                    />
                    {errors.lastName && (
                        <p className="text-red-500 text-sm">
                            {errors.lastName}
                        </p>
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
                        className={`w-full px-3 py-2 text-white border rounded ${
                            errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {errors.email && (
                        <p className="text-red-500 text-sm">{errors.email}</p>
                    )}
                </div>

                {/* Phone (Optional) */}
                <div>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Phone (Optional)"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 text-white border rounded ${
                            errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                    />
                    {errors.phone && (
                        <p className="text-red-500 text-sm">{errors.phone}</p>
                    )}
                </div>

                {/* Address */}
                <div>
                    <input
                        type="text"
                        name="address"
                        placeholder="Enter Address"
                        value={formData.address}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 text-white border rounded ${
                            errors.address
                                ? "border-red-500"
                                : "border-gray-300"
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
                        className={`w-full px-3 py-2 text-white border rounded ${
                            errors.password
                                ? "border-red-500"
                                : "border-gray-300"
                        }`}
                    />
                    {errors.password && (
                        <p className="text-red-500 text-sm">
                            {errors.password}
                        </p>
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
                        className={`w-full px-3 py-2 text-white border rounded ${
                            errors.confirm_password
                                ? "border-red-500"
                                : "border-gray-300"
                        }`}
                    />
                    {errors.confirm_password && (
                        <p className="text-red-500 text-sm">
                            {errors.confirm_password}
                        </p>
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
            <p className="text-center mt-2">
                Already have an account ?{" "}
                <strong>
                    <Link href="/login?from=register">Login</Link>
                </strong>
            </p>
        </div>
    );
};

export default RegisterForm;
