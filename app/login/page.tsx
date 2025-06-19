"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Login() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          signIn("credentials", { username, password, callbackUrl: "/" });
        }}
        className="w-80 space-y-4 border p-6 rounded bg-white dark:bg-gray-900"
      >
        <h1 className="text-xl font-bold text-center">
          Jagannatha Group Fee Portal – Login
        </h1>
        <input
          placeholder="Username"
          className="w-full border p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
          value={username}
          onChange={(e) => setU(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
          value={password}
          onChange={(e) => setP(e.target.value)}
        />
        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded">
          Sign in
        </button>
      </form>
    </div>
  );
}
