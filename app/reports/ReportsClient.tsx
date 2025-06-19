"use client";
import { useState, FormEvent } from "react";
import { jsPDF } from "jspdf";

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
export type Balance = {
  id: string;
  name: string;
  batch: string;
  totalFee: string;
  balance: string;
};

export default function ReportsClient({ students }: { students: Student[] }) {
  const batches = Array.from(new Set(students.map((s) => s.batch)));
  const [reportType, setReportType] = useState<"balance" | "transactions">(
    "balance"
  );
  const [batch, setBatch] = useState("");
  const [name, setName] = useState("");
  const [balances, setBalances] = useState<Balance[]>([]);

  const [tBatch, setTBatch] = useState("");
  const [tName, setTName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState<{ mode: string; amount: string }[]>([]);

  function downloadBalancesPdf() {
    const doc = new jsPDF();
    doc.text("Student Balances", 10, 10);
    balances.forEach((b, i) => {
      const line = `${i + 1}. ${b.name} - ${b.batch}: Fee ${b.totalFee} Balance ${b.balance}`;
      doc.text(line, 10, 20 + i * 10);
    });
    if (balances.length > 0) {
      const totalFee = balances
        .reduce((sum, b) => sum + parseFloat(b.totalFee), 0)
        .toFixed(2);
      const totalBal = balances
        .reduce((sum, b) => sum + parseFloat(b.balance), 0)
        .toFixed(2);
      const y = 20 + balances.length * 10 + 10;
      doc.text(`Total  ${totalFee}  ${totalBal}`, 10, y);
    }
    doc.save("balances.pdf");
  }

  function downloadTransactionsPdf() {
    const doc = new jsPDF();
    doc.text("Transactions", 10, 10);
    transactions.forEach((t, i) => {
      const line = `${t.createdAt.slice(0, 10)} - ${t.student.name} - ${t.student.batch}: ${t.type} ${t.amount}${t.mode ? ` (${t.mode})` : ""}`;
      doc.text(line, 10, 20 + i * 10);
    });
    if (totals.length > 0) {
      let y = 20 + transactions.length * 10 + 10;
      totals.forEach((t, i) => {
        doc.text(`Total ${t.mode}: ${t.amount}`, 10, y + i * 10);
      });
    }
    doc.save("transactions.pdf");
  }

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
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setReportType("balance")}
          className={`px-4 py-2 rounded ${reportType === "balance" ? "bg-blue-600 text-white" : "bg-gray-200 text-black dark:bg-gray-700 dark:text-white"}`}
        >
          Balance Reports
        </button>
        <button
          type="button"
          onClick={() => setReportType("transactions")}
          className={`px-4 py-2 rounded ${reportType === "transactions" ? "bg-blue-600 text-white" : "bg-gray-200 text-black dark:bg-gray-700 dark:text-white"}`}
        >
          Transaction Reports
        </button>
      </div>

      {reportType === "balance" && (
        <>
          <form onSubmit={getBalances} className="space-y-2 border p-4 rounded">
            <h2 className="font-semibold">Student Balances</h2>
            <select
              className="w-full border p-2 rounded text-black"
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
              className="w-full border p-2 rounded text-black"
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">
              Get Balances
            </button>
          </form>
          {balances.length === 0 && <p>No results</p>}
          {balances.length > 0 && (
            <>
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="border px-2 py-1 text-left text-black dark:text-gray-200">S.No.</th>
                    <th className="border px-2 py-1 text-left text-black dark:text-gray-200">Name</th>
                    <th className="border px-2 py-1 text-left text-black dark:text-gray-200">Batch</th>
                    <th className="border px-2 py-1 text-left text-black dark:text-gray-200">Total Fee</th>
                    <th className="border px-2 py-1 text-left text-black dark:text-gray-200">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.map((b, i) => (
                    <tr key={b.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700">
                      <td className="border px-2 py-1 text-black dark:text-gray-200">{i + 1}</td>
                      <td className="border px-2 py-1 text-black dark:text-gray-200">{b.name}</td>
                      <td className="border px-2 py-1 text-black dark:text-gray-200">{b.batch}</td>
                      <td className="border px-2 py-1 text-black dark:text-gray-200">{b.totalFee}</td>
                      <td className="border px-2 py-1 text-black dark:text-gray-200">{b.balance}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-semibold">
                    <td className="border px-2 py-1 text-black dark:text-gray-200" colSpan={3}>
                      Total
                    </td>
                    <td className="border px-2 py-1 text-black dark:text-gray-200">
                      {balances
                        .reduce((sum, b) => sum + parseFloat(b.totalFee), 0)
                        .toFixed(2)}
                    </td>
                    <td className="border px-2 py-1 text-black dark:text-gray-200">
                      {balances
                        .reduce((sum, b) => sum + parseFloat(b.balance), 0)
                        .toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
              <button
                type="button"
                onClick={downloadBalancesPdf}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
              >
                Download PDF
              </button>
            </>
          )}
        </>
      )}

      {reportType === "transactions" && (
        <>
          <form onSubmit={getTransactions} className="space-y-2 border p-4 rounded">
            <h2 className="font-semibold">Transactions</h2>
            <select
              className="w-full border p-2 rounded text-black"
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
              className="w-full border p-2 rounded text-black"
              placeholder="Name (optional)"
              value={tName}
              onChange={(e) => setTName(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                type="date"
                className="w-full border p-2 rounded text-black"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
              <input
                type="date"
                className="w-full border p-2 rounded text-black"
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
          {transactions.length > 0 && (
            <button
              type="button"
              onClick={downloadTransactionsPdf}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Download PDF
            </button>
          )}
        </>
      )}
    </div>
  );
}
