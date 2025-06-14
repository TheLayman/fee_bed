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
          {studentInfo.name} - {studentInfo.batch}
        </span>
        {isAdmin && !editingProfile && (
          <button onClick={startProfileEdit} className="text-blue-600">
            Edit Profile
          </button>
        )}
      </h1>
      {editingProfile && (
        <form onSubmit={updateProfile} className="space-y-2 border p-4 rounded">
          <input
            className="w-full border p-2 rounded"
            placeholder="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <input
            className="w-full border p-2 rounded"
            placeholder="Batch"
            value={editBatch}
            onChange={(e) => setEditBatch(e.target.value)}
          />
          <input
            className="w-full border p-2 rounded"
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
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={() => setEditingProfile(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
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
          <li key={t.id} className="border p-2 rounded flex justify-between">
            <span>
              {t.createdAt.slice(0, 10)} - {t.type} {t.amount} {t.mode ? `(${t.mode})` : ""}
              {!t.approved && t.type === "concession" && (
                <span className="text-orange-600"> Pending</span>
              )}
            </span>
            {isAdmin && (
              <button onClick={() => deleteTransaction(t.id)} className="text-red-600">
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

