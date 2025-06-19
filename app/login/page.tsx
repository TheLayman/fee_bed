"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Login() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          signIn("credentials", { username, password, callbackUrl: "/" });
        }}
        className="card shadow w-96 bg-base-100 space-y-4 p-6"
      >
        <h1 className="text-xl font-bold text-center">
          Jagannatha Group Fee Portal – Login
        </h1>
        <input
          placeholder="Username"
          className="input input-bordered w-full"
          value={username}
          onChange={(e) => setU(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="input input-bordered w-full"
          value={password}
          onChange={(e) => setP(e.target.value)}
        />
        <button className="btn btn-primary w-full">Sign in</button>
      </form>
    </div>
  );
}
