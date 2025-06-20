"use client";
import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { formatInr } from "@/lib/format";

type Student = {
  id: string;
  name: string;
  batch: string;
  totalFee: string;
  balance: string;
};

export default function HomeClient() {
  const [batch, setBatch] = useState("");
  const [name, setName] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [filtered, setFiltered] = useState<Student[]>([]);

  async function fetchStudents() {
    const res = await fetch("/api/reports/balance");
    if (res.ok) {
      const data = await res.json();
      setStudents(data);
      setFiltered(data);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  function applyFilters() {
    const b = batch.trim();
    const n = name.trim().toLowerCase();
    setFiltered(
      students.filter(
        (s) =>
          (b === "" || s.batch === b) &&
          (n === "" || s.name.toLowerCase().includes(n))
      )
    );
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    applyFilters();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="flex gap-2 flex-wrap items-end">
        <input
          className="border p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-gray-100"
          placeholder="Batch"
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
        />
        <input
          className="border p-2 rounded bg-white text-black dark:bg-gray-800 dark:text-gray-100"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">
          Filter
        </button>
      </form>
      {filtered.length === 0 ? (
        <p>No students found</p>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="border px-2 py-1 text-left text-black dark:text-gray-200">S. No.</th>
              <th className="border px-2 py-1 text-left text-black dark:text-gray-200">Name</th>
              <th className="border px-2 py-1 text-left text-black dark:text-gray-200">Batch</th>
              <th className="border px-2 py-1 text-left text-black dark:text-gray-200">Total Fee</th>
              <th className="border px-2 py-1 text-left text-black dark:text-gray-200">Balance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700">
                <td className="border px-2 py-1 text-black dark:text-gray-200">{i + 1}</td>
                <td className="border px-2 py-1 text-blue-600 hover:underline text-black dark:text-gray-200">
                  <Link href={`/students/${s.id}`}>{s.name}</Link>
                </td>
                <td className="border px-2 py-1 text-black dark:text-gray-200">{s.batch}</td>
                <td className="border px-2 py-1 text-black dark:text-gray-200">{formatInr(s.totalFee)}</td>
                <td className="border px-2 py-1 text-black dark:text-gray-200">{formatInr(s.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
