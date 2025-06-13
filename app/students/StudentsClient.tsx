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

  async function refresh() {
    const res = await fetch("/api/students");
    if (res.ok) {
      const data = await res.json();
      setStudents(data);
    }
  }

  async function addStudent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, batch, totalFee }),
    });
    setName("");
    setBatch("");
    setTotalFee("");
    refresh();
  }

  async function deleteStudent(id: string) {
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    setStudents((s) => s.filter((st) => st.id !== id));
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
      </form>
      <ul className="space-y-2">
        {students.map((s) => (
          <li key={s.id} className="flex justify-between border p-2 rounded">
            <span>
              {s.name} - {s.batch} - {s.totalFee}
            </span>
            {isAdmin && (
              <button
                onClick={() => deleteStudent(s.id)}
                className="text-red-600"
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
