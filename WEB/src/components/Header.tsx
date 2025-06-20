"use client";
import { Plus } from "phosphor-react";
import { useState } from "react";

export function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handle() {
    setIsModalOpen(!isModalOpen);
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex items-center justify-between">
      <h1 className="text-4xl font-bold text-violet-700 tracking-tight">
        System
      </h1>

      {isModalOpen ? <h1>teste</h1> : null}

      <button
        type="button"
        onClick={handle}
        className="border border-violet-500 font-semibold rounded-lg px-6 py-4 flex items-center gap-3 hover:border-violet-300 transition-colors"
      >
        <Plus size={20} className="text-violet-500" />
        New
      </button>
    </div>
  );
}
