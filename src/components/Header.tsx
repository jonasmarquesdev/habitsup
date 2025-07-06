"use client";
import { Plus, X } from "phosphor-react";
import * as Dialog from "@radix-ui/react-dialog";
import { NewHabitForm } from "./NewHabitForm";
import { useState } from "react";
import { ViewModeButtons } from "./SummaryTable";

interface HeaderProps {
  viewMode: 'year' | 'month';
  setViewMode: (mode: 'year' | 'month') => void;
}

export function Header({ viewMode, setViewMode }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto flex items-center justify-between">
      <ViewModeButtons viewMode={viewMode} setViewMode={setViewMode} />
      
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger
          type="button"
          className="group select-none focus:outline-none focus:ring-none border border-violet-500 font-semibold rounded-lg px-4 py-2 lg:px-6 lg:py-4 flex items-center gap-3 hover:border-violet-300 transition-colors"
        >
          <Plus size={20} className="group text-violet-500 group-hover:text-white" />
            <span className="text-sm">Novo hábito</span>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="w-screen h-screen bg-black/80 fixed inset-0" />

          <Dialog.Content className="absolute z-50 p-5 lg:p-10 bg-zinc-900 rounded-2xl w-full max-w-md top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/3">
            <Dialog.Close className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-200 transition-colors">
              <X size={24} aria-label="close" />
            </Dialog.Close>

            <Dialog.Title className="text-3xl leading-tight font-extrabold">
              Criar hábito
            </Dialog.Title>
            
            <NewHabitForm onSuccess={() => setOpen(false)} />
          </Dialog.Content>

        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
