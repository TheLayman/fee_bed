"use client";
import { useState } from "react";

export type Approval = {
  id: string;
  student: { name: string; batch: string };
  amount: string;
};

export default function ApprovalsClient({ initialApprovals }: { initialApprovals: Approval[] }) {
  const [items, setItems] = useState<Approval[]>(initialApprovals);

  async function approve(id: string) {
    await fetch(`/api/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: true }),
    });
    setItems((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold">Approve Concessions</h1>
      <ul className="space-y-2">
        {items.map((a) => (
          <li key={a.id} className="border p-2 rounded flex justify-between">
            <span>
              {a.student.name} - {a.student.batch}: {a.amount}
            </span>
            <button onClick={() => approve(a.id)} className="text-blue-600">
              Approve
            </button>
          </li>
        ))}
        {items.length === 0 && <p>No pending concessions</p>}
      </ul>
    </div>
  );
}
