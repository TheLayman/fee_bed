"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ id: string; name: string; batch: string }>>([]);
  const router = useRouter();

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/students?q=${encodeURIComponent(q)}`, { signal: controller.signal })
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setResults(data))
      .catch(() => {});
    return () => controller.abort();
  }, [query]);

  function select(id: string) {
    setQuery("");
    setResults([]);
    router.push(`/students/${id}`);
  }

  return (
    <div className="relative">
      <input
        className="border rounded p-1 text-black"
        placeholder="Search students"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results.length > 0 && (
        <ul className="absolute z-10 bg-white text-black border w-56 max-h-60 overflow-auto">
          {results.map((s) => (
            <li
              key={s.id}
              className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
              onClick={() => select(s.id)}
            >
              {s.name} - {s.batch}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
