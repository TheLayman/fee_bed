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
  userId,
}: {
  student: Student;
  initialTransactions: Transaction[];
  isAdmin: boolean;
  userId: string;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [type, setType] = useState("payment");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("cash");
  const [studentInfo, setStudentInfo] = useState(student);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(student.name);
  const [editBatch, setEditBatch] = useState(student.batch);
  const [editTotalFee, setEditTotalFee] = useState(student.totalFee);

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

  function startProfileEdit() {
    setEditingProfile(true);
    setEditName(studentInfo.name);
    setEditBatch(studentInfo.batch);
    setEditTotalFee(studentInfo.totalFee);
  }

  async function updateProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch(`/api/students/${studentInfo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, batch: editBatch, totalFee: editTotalFee }),
    });
    if (res.ok) {
      const data = await res.json();
      setStudentInfo(data);
    }
    setEditingProfile(false);
  }

  async function deleteTransaction(id: string) {
    if (!confirm("Delete this transaction?")) return;
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold flex justify-between">
        <span>
          Name: {studentInfo.name}, Batch: {studentInfo.batch}
        </span>
        {isAdmin && !editingProfile && (
          <button onClick={startProfileEdit} className="text-blue-600">
            Edit Profile
          </button>
        )}
      </h1>
      {editingProfile && (
        <form onSubmit={updateProfile} className="space-y-2 border p-4 rounded bg-white dark:bg-gray-900">
          <input
            className="w-full border p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-gray-100"
            placeholder="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <input
            className="w-full border p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-gray-100"
            placeholder="Batch"
            value={editBatch}
            onChange={(e) => setEditBatch(e.target.value)}
          />
          <input
            type="number"
            step="1"
            className="w-full border p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-gray-100"
            placeholder="Total Fee"
            value={editTotalFee}
            onChange={(e) => setEditTotalFee(e.target.value)}
          />
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">
              Save
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-black dark:text-gray-100"
              onClick={() => setEditingProfile(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <form onSubmit={addTransaction} className="space-y-2 border p-4 rounded bg-white dark:bg-gray-900">
        <select
          className="w-full border p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-gray-100"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="payment">payment</option>
          <option value="concession">concession</option>
        </select>
        <input
          type="number"
          step="1"
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
      <h2 className="font-semibold">Previous Transactions</h2>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="border px-2 py-1 text-left text-black dark:text-gray-200">Date</th>
            <th className="border px-2 py-1 text-left text-black dark:text-gray-200">Type</th>
            <th className="border px-2 py-1 text-left text-black dark:text-gray-200">Amount</th>
            <th className="border px-2 py-1 text-left text-black dark:text-gray-200">Mode</th>
            <th className="border px-2 py-1 text-left text-black dark:text-gray-200">Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const canDelete =
              isAdmin ||
              (t.createdById === userId &&
                Date.now() - new Date(t.createdAt).getTime() < 5 * 60 * 1000);
            return (
              <tr
                key={t.id}
                className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700"
              >
                <td className="border px-2 py-1 text-black dark:text-gray-200">
                  {t.createdAt.slice(0, 10)}
                </td>
                <td className="border px-2 py-1 text-black dark:text-gray-200">
                  {t.type}
                </td>
                <td className="border px-2 py-1 text-black dark:text-gray-200">
                  {t.amount}
                </td>
                <td className="border px-2 py-1 text-black dark:text-gray-200">
                  {t.mode ?? (t.type === "concession" ? "concession" : "")}
                </td>
                <td className="border px-2 py-1 text-black dark:text-gray-200 space-x-2">
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

