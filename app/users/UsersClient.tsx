"use client";
import { useState, FormEvent } from "react";

export type User = { id: string; username: string; role: string };

export default function UsersClient({
  initialUsers,
}: {
  initialUsers: User[];
}) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [editing, setEditing] = useState<User | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("user");

  async function refresh() {
    const res = await fetch("/api/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
  }

  async function addUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    });
    setUsername("");
    setPassword("");
    setRole("user");
    refresh();
  }

  async function deleteUser(id: string) {
    if (!confirm("Delete this user?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    setUsers((u) => u.filter((user) => user.id !== id));
  }

  function startEdit(user: User) {
    setEditing(user);
    setEditUsername(user.username);
    setEditRole(user.role);
    setEditPassword("");
  }

  async function updateUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    await fetch(`/api/users/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: editUsername,
        role: editRole,
        password: editPassword || undefined,
      }),
    });
    setEditing(null);
    setEditPassword("");
    refresh();
  }

  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold">Users</h1>
      <form onSubmit={addUser} className="space-y-2 border p-4 rounded">
        <input
          className="w-full border p-2 rounded"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="w-full border p-2 rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <select
          className="w-full border p-2 rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">
          Add User
        </button>
      </form>
      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u.id} className="border p-2 rounded space-y-2">
            {editing && editing.id === u.id ? (
              <form onSubmit={updateUser} className="space-y-2">
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Username"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                />
                <input
                  type="password"
                  className="w-full border p-2 rounded"
                  placeholder="Password (leave blank to keep)"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                />
                <select
                  className="w-full border p-2 rounded"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(null)}
                    className="px-4 py-2 bg-gray-300 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-between items-center">
                <span>
                  {u.username} ({u.role})
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => startEdit(u)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
