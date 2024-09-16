import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import React from "react";

export default function login() {
  return (
    <div className=" flex justify-center items-center h-screen">
      <form className="m-5 p-5 w-[550px] bg-slate-100 rounded-lg">
        <h1 className="text-center text-2xl font-bold">Log In</h1>
        <div className="mt-4">
          <Label htmlFor="email">Email</Label>
          <Input placeholder="Type your email" name="email" />
          <span className="text-red-400"></span>
        </div>
        <div className="mt-4">
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            placeholder="Type your password"
            name="password"
          />
          <div className="text-right font-bold">
            <Link href="/registration">Do not have account? Register</Link>
          </div>
          <span className="text-red-400"></span>
        </div>
        <div className="mt-4">
          <Button className="w-full">Submit</Button>
        </div>
      </form>
    </div>
  );
}
