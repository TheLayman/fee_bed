"use client";
import { useState, FormEvent } from "react";

export type Student = { id: string; name: string; batch: string };
export type Transaction = {
  id: string;
  student: { name: string; batch: string };
  type: string;
  amount: string;
  mode: string | null;
  approved: boolean;
  createdAt: string;
};
export type Balance = { id: string; name: string; batch: string; balance: string };

export default function ReportsClient({ students }: { students: Student[] }) {
  const batches = Array.from(new Set(students.map((s) => s.batch)));
  const [batch, setBatch] = useState("");
  const [name, setName] = useState("");
  const [balances, setBalances] = useState<Balance[]>([]);

  const [tBatch, setTBatch] = useState("");
  const [tName, setTName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState<{ mode: string; amount: string }[]>([]);

  async function getBalances(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (batch) params.append("batch", batch);
    if (name) params.append("name", name);
    const res = await fetch(`/api/reports/balance?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setBalances(data);
    }
  }

  async function getTransactions(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (tBatch) params.append("batch", tBatch);
    if (tName) params.append("name", tName);
    if (start) params.append("start", start);
    if (end) params.append("end", end);
    const res = await fetch(`/api/reports/transactions?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setTransactions(data.transactions);
      setTotals(data.totals);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold">Reports</h1>

      <form onSubmit={getBalances} className="space-y-2 border p-4 rounded">
        <h2 className="font-semibold">Student Balances</h2>
        <select
          className="w-full border p-2 rounded"
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
        >
          <option value="">All Batches</option>
          {batches.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <input
          className="w-full border p-2 rounded"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">
          Get Balances
        </button>
      </form>
      <ul className="space-y-1">
        {balances.map((b) => (
          <li key={b.id} className="border p-2 rounded">
            {b.name} - {b.batch}: {b.balance}
          </li>
        ))}
        {balances.length === 0 && <p>No results</p>}
      </ul>

      <form onSubmit={getTransactions} className="space-y-2 border p-4 rounded">
        <h2 className="font-semibold">Transactions</h2>
        <select
          className="w-full border p-2 rounded"
          value={tBatch}
          onChange={(e) => setTBatch(e.target.value)}
        >
          <option value="">All Batches</option>
          {batches.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <input
          className="w-full border p-2 rounded"
          placeholder="Name (optional)"
          value={tName}
          onChange={(e) => setTName(e.target.value)}
        />
        <div className="flex gap-2">
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">
          Get Transactions
        </button>
      </form>
      <ul className="space-y-1">
        {transactions.map((t) => (
          <li key={t.id} className="border p-2 rounded">
            {t.createdAt.slice(0, 10)} - {t.student.name} - {t.student.batch}: {t.type}{" "}
            {t.amount} {t.mode ? `(${t.mode})` : ""}
          </li>
        ))}
        {transactions.length === 0 && <p>No transactions</p>}
      </ul>
      {totals.length > 0 && (
        <div className="space-y-1">
          {totals.map((t) => (
            <p key={t.mode}>Total {t.mode}: {t.amount}</p>
          ))}
        </div>
      )}
    </div>
  );
}
