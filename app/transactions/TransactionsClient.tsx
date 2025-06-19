"use client";
import { useState, FormEvent } from "react";

export type Transaction = {
  id: string;
  studentId: string;
  student: { name: string; batch: string };
  createdById: string;
  type: string;
  amount: string;
  mode: string | null;
  approved: boolean;
  createdAt: string;
};

export type Student = { id: string; name: string; batch: string };

export default function TransactionsClient({
  students,
  initialTransactions,
  isAdmin,
  userId,
}: {
  students: Student[];
  initialTransactions: Transaction[];
  isAdmin: boolean;
  userId: string;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>(
    initialTransactions
  );
  const [studentId, setStudentId] = useState(students[0]?.id || "");
  const [type, setType] = useState("payment");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("cash");

  async function refresh() {
    const res = await fetch("/api/transactions");
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
      body: JSON.stringify({ studentId, type, amount, mode }),
    });
    setAmount("");
    refresh();
  }

  async function deleteTransaction(id: string) {
    if (!confirm("Delete this transaction?")) return;
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold">Transactions</h1>
      <form onSubmit={addTransaction} className="space-y-2 border p-4 rounded bg-white dark:bg-gray-900">
        <select
          className="w-full border p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-gray-100"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} - {s.batch}
            </option>
          ))}
        </select>
        <select
          className="w-full border p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-gray-100"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="payment">payment</option>
          <option value="concession">concession</option>
        </select>
        <input
          className="w-full border p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-gray-100"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {type === "payment" && (
          <select
            className="w-full border p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-gray-100"
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
        {transactions.map((t) => {
          const canDelete =
            isAdmin ||
            (t.createdById === userId &&
              Date.now() - new Date(t.createdAt).getTime() < 5 * 60 * 1000);
          return (
            <li key={t.id} className="border p-2 rounded">
              <div className="flex justify-between">
                <span>
                  {t.student.name} - {t.student.batch} : {t.type} {t.amount} {t.mode ? `(${t.mode})` : ""}
                </span>
                <div className="space-x-2">
                  {!t.approved && t.type === "concession" && (
                    <span className="text-orange-600">Pending</span>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
