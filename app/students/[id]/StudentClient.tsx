"use client";
import { useState, FormEvent } from "react";

export type Student = {
  id: string;
  name: string;
  batch: string;
  totalFee: string;
};

export type Transaction = {
  id: string;
  studentId: string;
  createdById: string;
  type: string;
  amount: string;
  mode: string | null;
  approved: boolean;
  createdAt: string;
};

export default function StudentClient({
  student,
  initialTransactions,
  isAdmin,
}: {
  student: Student;
  initialTransactions: Transaction[];
  isAdmin: boolean;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [type, setType] = useState("payment");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("cash");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [editType, setEditType] = useState("payment");
  const [editAmount, setEditAmount] = useState("");
  const [editMode, setEditMode] = useState("cash");

  async function refresh() {
    const res = await fetch(`/api/transactions?studentId=${student.id}`);
    if (res.ok) {
      const data = await res.json();
      setTransactions(data);
    }
  }

  async function addTransaction(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id, type, amount, mode }),
    });
    setAmount("");
    refresh();
  }

  function startEdit(t: Transaction) {
    setEditing(t);
    setEditType(t.type);
    setEditAmount(t.amount);
    setEditMode(t.mode || "cash");
  }

  async function updateTransaction(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    await fetch(`/api/transactions/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: editType, amount: editAmount, mode: editMode }),
    });
    setEditing(null);
    refresh();
  }

  async function deleteTransaction(id: string) {
    if (!confirm("Delete this transaction?")) return;
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold">
        {student.name} - {student.batch}
      </h1>
      <form onSubmit={addTransaction} className="space-y-2 border p-4 rounded">
        <select
          className="w-full border p-2 rounded"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="payment">payment</option>
          <option value="concession">concession</option>
        </select>
        <input
          className="w-full border p-2 rounded"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {type === "payment" && (
          <select
            className="w-full border p-2 rounded"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="cash">cash</option>
            <option value="online">online</option>
          </select>
        )}
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">
          Add Transaction
        </button>
      </form>
      <ul className="space-y-2">
        {transactions.map((t) => (
          <li key={t.id} className="border p-2 rounded">
            {editing && editing.id === t.id ? (
              <form onSubmit={updateTransaction} className="space-y-2">
                <select
                  className="w-full border p-2 rounded"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                >
                  <option value="payment">payment</option>
                  <option value="concession">concession</option>
                </select>
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Amount"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                />
                {editType === "payment" && (
                  <select
                    className="w-full border p-2 rounded"
                    value={editMode}
                    onChange={(e) => setEditMode(e.target.value)}
                  >
                    <option value="cash">cash</option>
                    <option value="online">online</option>
                  </select>
                )}
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">
                    Save
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-300 rounded"
                    onClick={() => setEditing(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-between">
                <span>
                  {t.createdAt.slice(0, 10)} - {t.type} {t.amount} {t.mode ? `(${t.mode})` : ""}
                  {!t.approved && t.type === "concession" && (
                    <span className="text-orange-600"> Pending</span>
                  )}
                </span>
                {isAdmin && (
                  <div className="space-x-2">
                    <button onClick={() => startEdit(t)} className="text-blue-600">
                      Edit
                    </button>
                    <button onClick={() => deleteTransaction(t.id)} className="text-red-600">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

