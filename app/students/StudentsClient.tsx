"use client";
import { useState, FormEvent } from "react";

export default function StudentsClient() {
  const [name, setName] = useState("");
  const [batch, setBatch] = useState("");
  const [totalFee, setTotalFee] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  async function addStudent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, batch, totalFee }),
    });
    if (!res.ok) {
      const text = await res.text();
      setError(text);
      alert(text);
      return;
    }
    setName("");
    setBatch("");
    setTotalFee("");
  }

  async function importStudents(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!csvFile) return;
    setImportError(null);
    const text = await csvFile.text();
    const rows = text.trim().split(/\r?\n/);
    const students = rows.map((r) => {
      const [n, b, a] = r.split(",");
      return { name: n?.trim(), batch: b?.trim(), totalFee: a?.trim() };
    });
    try {
      const res = await fetch("/api/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students }),
      });
      if (!res.ok) {
        const text = await res.text();
        setImportError(text);
        alert(`Import failed: ${text}`);
        return;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setImportError(msg);
      alert(`Import failed: ${msg}`);
      return;
    }
    setCsvFile(null);
    (e.target as HTMLFormElement).reset();
  }


  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold">Students</h1>
      <form onSubmit={addStudent} className="space-y-2 border p-4 rounded">
        <input
          className="w-full border p-2 rounded"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Batch"
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Total Fee"
          value={totalFee}
          onChange={(e) => setTotalFee(e.target.value)}
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">
          Add Student
        </button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
      <form onSubmit={importStudents} className="space-y-2 border p-4 rounded">
        <input
          type="file"
          accept=".csv"
          className="w-full"
          onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">
          Import CSV
        </button>
        {importError && <p className="text-red-600">{importError}</p>}
      </form>
    </div>
  );
}
