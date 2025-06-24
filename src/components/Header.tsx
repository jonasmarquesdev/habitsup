"use client";
import { Plus, X } from "phosphor-react";
import * as Dialog from "@radix-ui/react-dialog";
import { NewHabitForm } from "./NewHabitForm";
import { useState } from "react";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto flex items-center justify-end">
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger
          type="button"
          className="border border-violet-500 font-semibold rounded-lg px-6 py-4 flex items-center gap-3 hover:border-violet-300 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-background"
        >
          <Plus size={20} className="text-violet-500" />
          Nova activity
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="w-screen h-screen bg-black/80 fixed inset-0" />

          <Dialog.Content className="absolute p-10 bg-zinc-900 rounded-2xl w-full max-w-md top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Dialog.Close className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-200 transition-colors">
              <X size={24} aria-label="close" />
            </Dialog.Close>

            <Dialog.Title className="text-3xl leading-tight font-extrabold">
              Criar activity
            </Dialog.Title>
            
            <NewHabitForm onSuccess={() => setOpen(false)} />
          </Dialog.Content>

        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
