import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

export default function registration() {
  return (
    <div className=" flex justify-center items-center h-screen">
      <form className="m-5 p-5 w-[550px] bg-slate-100 rounded-lg">
        <h1 className="text-center text-2xl font-bold">Registration</h1>
        <div className="mt-4">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            placeholder="Type your first name"
            name="firstName"
            type="text"
          />
          <span className="text-red-400"></span>
        </div>
        <div className="mt-4">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            placeholder="Type your last name"
            name="lastName"
            type="text"
          />
          <span className="text-red-400"></span>
        </div>
        <div className="mt-4">
          <Label htmlFor="email">Email</Label>
          <Input placeholder="Type your email" name="email" type="email" />
          <span className="text-red-400"></span>
        </div>
        <div className="mt-4">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            placeholder="Type your phone number"
            name="phone"
            type="number"
          />
          <span className="text-red-400"></span>
        </div>
        <div className="mt-4">
          <Label htmlFor="address">Address</Label>
          <Input placeholder="Type your address" name="address" type="text" />
          <span className="text-red-400"></span>
        </div>
        <div className="mt-4">
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            placeholder="Type your password"
            name="password"
          />
          <span className="text-red-400"></span>
        </div>
        <div className="mt-4">
          <Button className="w-full">Submit</Button>
        </div>
      </form>
    </div>
  );
}
