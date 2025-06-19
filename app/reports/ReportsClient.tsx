"use client";
import { useState, FormEvent } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type Student = { id: string; name: string; batch: string };
export type Transaction = {
  id: string;
  student: { name: string; batch: string };
  type: string;
  amount: string;
  mode: string;
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
  const [concessionTotal, setConcessionTotal] = useState("0");

  function downloadBalancesPdf() {
    const doc = new jsPDF();
    doc.text("Student Balances", 14, 10);
    if (balances.length > 0) {
      const totalFee = balances.reduce((sum, b) => sum + parseFloat(b.totalFee), 0).toFixed(2);
      const totalBal = balances.reduce((sum, b) => sum + parseFloat(b.balance), 0).toFixed(2);
      autoTable(doc, {
        head: [["S.No.", "Name", "Batch", "Total Fee", "Balance"]],
        body: balances.map((b, i) => [i + 1, b.name, b.batch, b.totalFee, b.balance]),
        foot: [[{ content: "Total", colSpan: 3 }, totalFee, totalBal]],
        startY: 20,
        theme: "grid",
      });
    }
    doc.save("balances.pdf");
  }

  function downloadTransactionsPdf() {
    const doc = new jsPDF();
    doc.text("Transactions", 14, 10);
    if (transactions.length > 0) {
      const paymentTotal = totals
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
        .toFixed(2);
      const footRows = [
        ...totals.map((t) => [
          { content: `Total ${t.mode}`, colSpan: 5 },
          t.amount,
        ]),
        [{ content: "Total Concession", colSpan: 5 }, concessionTotal],
        [{ content: "Total", colSpan: 5 }, paymentTotal],
      ];
      autoTable(doc, {
        head: [[
          "S.No.",
          "Date",
          "Name",
          "Batch",
          "Amount",
          "Payment Mode",
        ]],
        body: transactions.map((t, i) => [
          i + 1,
          t.createdAt.slice(0, 10),
          t.student.name,
          t.student.batch,
          t.amount,
          t.mode,
        ]),
        foot: footRows,
        startY: 20,
        theme: "grid",
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
      setConcessionTotal(data.concessionTotal);
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
          <form onSubmit={getBalances} className="space-y-2 border p-4 rounded bg-white dark:bg-gray-900">
            <h2 className="font-semibold">Student Balances</h2>
            <select
              className="w-full border p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
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
              className="w-full border p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
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
          <form onSubmit={getTransactions} className="space-y-2 border p-4 rounded bg-white dark:bg-gray-900">
            <h2 className="font-semibold">Transactions</h2>
            <select
              className="w-full border p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
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
              className="w-full border p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
              placeholder="Name (optional)"
              value={tName}
              onChange={(e) => setTName(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                type="date"
                className="w-full border p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
              <input
                type="date"
                className="w-full border p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">
              Get Transactions
            </button>
          </form>
          {transactions.length > 0 ? (
            <table className="min-w-full border mt-2">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1 text-left">S.No.</th>
                  <th className="border px-2 py-1 text-left">Date</th>
                  <th className="border px-2 py-1 text-left">Name</th>
                  <th className="border px-2 py-1 text-left">Batch</th>
                  <th className="border px-2 py-1 text-left">Amount</th>
                  <th className="border px-2 py-1 text-left">Payment Mode</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, i) => (
                  <tr key={t.id} className="odd:bg-white even:bg-gray-50">
                    <td className="border px-2 py-1">{i + 1}</td>
                    <td className="border px-2 py-1">
                      {t.createdAt.slice(0, 10)}
                    </td>
                    <td className="border px-2 py-1">{t.student.name}</td>
                    <td className="border px-2 py-1">{t.student.batch}</td>
                    <td className="border px-2 py-1">{t.amount}</td>
                    <td className="border px-2 py-1">{t.mode}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {totals.map((t) => (
                  <tr key={t.mode} className="font-semibold">
                    <td className="border px-2 py-1" colSpan={5}>
                      Total {t.mode}
                    </td>
                    <td className="border px-2 py-1">{t.amount}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="border px-2 py-1" colSpan={5}>
                    Total Concession
                  </td>
                  <td className="border px-2 py-1">{concessionTotal}</td>
                </tr>
                <tr className="font-semibold">
                  <td className="border px-2 py-1" colSpan={5}>
                    Total
                  </td>
                  <td className="border px-2 py-1">
                    {totals
                      .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                      .toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p>No transactions</p>
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
