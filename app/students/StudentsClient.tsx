"use client";
import { useState, FormEvent } from "react";

export type Student = {
  id: string;
  name: string;
  batch: string;
  totalFee: string;
};

export default function StudentsClient({
  initialStudents,
  isAdmin,
}: {
  initialStudents: Student[];
  isAdmin: boolean;
}) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [name, setName] = useState("");
  const [batch, setBatch] = useState("");
  const [totalFee, setTotalFee] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Student | null>(null);
  const [editName, setEditName] = useState("");
  const [editBatch, setEditBatch] = useState("");
  const [editTotalFee, setEditTotalFee] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/students");
    if (res.ok) {
      const data = await res.json();
      setStudents(data);
    }
  }

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
    refresh();
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
    const res = await fetch("/api/students/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ students }),
    });
    if (!res.ok) {
      const text = await res.text();
      setImportError(text);
      alert(text);
      return;
    }
    setCsvFile(null);
    (e.target as HTMLFormElement).reset();
    refresh();
  }

  async function deleteStudent(id: string) {
    if (!confirm("Delete this student?")) return;
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    setStudents((s) => s.filter((st) => st.id !== id));
  }

  function startEdit(student: Student) {
    setEditing(student);
    setEditName(student.name);
    setEditBatch(student.batch);
    setEditTotalFee(student.totalFee);
    setEditError(null);
  }

  async function updateStudent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setEditError(null);
    const res = await fetch(`/api/students/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        batch: editBatch,
        totalFee: editTotalFee,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      setEditError(text);
      alert(text);
      return;
    }
    setEditing(null);
    refresh();
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
      <ul className="space-y-2">
        {students.map((s) => (
          <li key={s.id} className="border p-2 rounded space-y-2">
            {editing && editing.id === s.id ? (
              <form onSubmit={updateStudent} className="space-y-2">
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
                    onClick={() => setEditing(null)}
                    className="px-4 py-2 bg-gray-300 rounded"
                  >
                    Cancel
                  </button>
                </div>
                {editError && <p className="text-red-600">{editError}</p>}
              </form>
            ) : (
              <div className="flex justify-between items-center">
                <span>
                  {s.name} - {s.batch} - {s.totalFee}
                </span>
                {isAdmin && (
                  <div className="space-x-2">
                    <button onClick={() => startEdit(s)} className="text-blue-600">
                      Edit
                    </button>
                    <button onClick={() => deleteStudent(s.id)} className="text-red-600">
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
