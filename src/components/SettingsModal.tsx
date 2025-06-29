"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "@/contexts/UserContext";
import { User } from "@/interfaces/User";
import { X } from "lucide-react";
import { Skeleton } from "./ui/skeleton";

export function SettingsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { getUsuario, isAuthenticatedBoolean } = useAuth();
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticatedBoolean || !open) return;
    const fetchUser = async () => {
      setLoading(true);
      const currentUser = await getUsuario();
      setUser(currentUser);
      setLoading(false);
    };
    fetchUser();
  }, [getUsuario, isAuthenticatedBoolean, open]);

  const settingsSections = [
    {
      title: "CONFIGURAÇÕES DE USUÁRIO",
      items: [
        {
          label: "Minha conta",
          description: "Perfis",
          href: "#",
        },
      ],
    },
  ];

  const userProfileData = {
    displayName: user?.name || "",
    username: user?.email?.split("@")[0] || "",
    email: user?.email || "",
    phone: "************8743",
    image: user?.image,
  };

  if (loading) {
    return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 min-w-[1000px] max-w-[1000px] min-h-[700px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-zinc-900 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-xl font-bold">
                Configurações
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:pointer-events-none dark:ring-offset-zinc-950 dark:focus:ring-zinc-300 p-1 hover:bg-zinc-800"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
            <ScrollArea className="h-[700px] w-full pr-6 pl-6">
              <div className="flex justify-center w-full">
                {/* Sidebar Skeleton */}
                <div className="w-80 bg-zinc-800 min-h-[650px] p-4 border-r border-zinc-700 rounded-l-lg">
                  <div className="mb-6">
                    <Skeleton className="h-6 w-16 bg-zinc-700" />
                  </div>
                  <div className="space-y-6">
                    <div>
                      <Skeleton className="h-4 w-40 bg-zinc-700 mb-3" />
                      <div className="space-y-1">
                        <Skeleton className="h-10 w-full bg-zinc-700 rounded-md" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Skeleton */}
                <div className="flex-1 px-8 flex justify-center w-full py-8">
                  <div className="max-w-2xl w-full">
                    {/* Tabs Skeleton */}
                    <div className="flex gap-6 mb-8 border-b border-zinc-700">
                      <Skeleton className="h-6 w-20 bg-zinc-700" />
                      <Skeleton className="h-6 w-16 bg-zinc-700" />
                    </div>

                    {/* Profile Section Skeleton */}
                    <div className="bg-zinc-800 rounded-lg p-6 mb-6">
                      <div className="flex items-center gap-4 mb-6">
                        <Skeleton className="w-20 h-20 rounded-full bg-zinc-700" />
                        <div className="flex-1">
                          <Skeleton className="h-6 w-32 bg-zinc-700 mb-2" />
                          <div className="flex items-center gap-2">
                            <Skeleton className="w-4 h-4 rounded-full bg-zinc-700" />
                            <Skeleton className="w-4 h-4 rounded-full bg-zinc-700" />
                          </div>
                        </div>
                        <Skeleton className="h-10 w-40 bg-zinc-700 rounded-md" />
                      </div>

                      {/* Form Fields Skeleton */}
                      <div className="space-y-6">
                        {[...Array(4)].map((_, i) => (
                          <div key={i}>
                            <Skeleton className="h-4 w-24 bg-zinc-700 mb-2" />
                            <div className="flex items-center gap-2">
                              <Skeleton className="flex-1 h-10 bg-zinc-700 rounded-md" />
                              <Skeleton className="h-8 w-16 bg-zinc-700 rounded-md" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 min-w-[800px] max-w-[1000px] min-h-[600px] max-h-[800px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-zinc-900 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-bold">
              Configurações
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 disabled:pointer-events-none dark:ring-offset-zinc-950 dark:focus:ring-zinc-300 p-1 hover:bg-zinc-800"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
            <div className="flex justify-center w-full">
              {/* Sidebar */}
              <div className="w-60 bg-zinc-800 min-h-[650px] p-4 border-r border-zinc-700 rounded-l-lg">
                <div className="space-y-6">
                  {settingsSections.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      <h3 className="text-xs font-semibold text-zinc-500 mb-3 tracking-wider">
                        {section.title}
                      </h3>
                      <div className="space-y-1">
                        {section.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className={`flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                              item.label === "Minha conta"
                                ? "bg-zinc-700 text-white"
                                : "text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
                            }`}
                          >
                            <div className="flex-1">
                              <div className="font-medium">{item.label}</div>
                              {item.description && (
                                <div className="text-xs text-zinc-500">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 px-8 flex justify-center w-full py-8">
                <div className="max-w-2xl w-full">
                  {/* Security and Status Tabs */}
                  <div className="flex gap-6 mb-8 border-b border-zinc-700">
                    <button className="pb-3 text-blue-400 border-b-2 border-blue-400 font-medium">
                      Segurança
                    </button>
                    <button className="pb-3 text-zinc-400 hover:text-zinc-300">
                      Status
                    </button>
                  </div>

                  {/* Profile Section */}
                  <div className="bg-zinc-800 rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar className="w-20 h-20">
                        <AvatarImage
                          src={userProfileData.image}
                          className="transition-opacity duration-300"
                        />
                        <AvatarFallback className="text-lg bg-zinc-700 text-white">
                          {userProfileData.displayName
                            ?.split(" ")[0]?.[0]
                            ?.toUpperCase() || "U"}
                          {userProfileData.displayName
                            ?.split(" ")[1]?.[0]
                            ?.toUpperCase() ?? ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold mb-1">
                          {userProfileData.displayName}
                        </h2>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                          <div className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Editar foto
                      </Button>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-6">
                      {/* Display Name */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          Nome Exibido
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-md px-3 py-2 text-white">
                            {userProfileData.displayName}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-zinc-400 hover:text-white px-2 bg-zinc-700 hover:bg-zinc-600"
                          >
                            Editar
                          </Button>
                        </div>
                      </div>

                      {/* Username */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          Nome De Usuário
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-md px-3 py-2 text-white">
                            {userProfileData.username}_
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-zinc-400 hover:text-white px-2 opacity-0"
                          >
                            Editar
                          </Button>
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          E-Mail
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-md px-3 py-2 text-white">
                            {userProfileData.email.replace(/(.{3}).*(@.*)/, "***$2")}
                            <span className="text-blue-400 ml-2 text-sm cursor-pointer hover:underline">
                              Mostrar
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-zinc-400 hover:text-white px-2 bg-zinc-700 hover:bg-zinc-600"
                          >
                            Editar
                          </Button>
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          Telefone
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 rounded-md px-3 py-2 text-white">
                            {userProfileData.phone}
                            <span className="text-blue-400 ml-2 text-sm cursor-pointer hover:underline">
                              Mostrar
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-zinc-400 hover:text-white px-2"
                            >
                              Remover
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-zinc-400 hover:text-white px-2 bg-zinc-700 hover:bg-zinc-600"
                            >
                              Editar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
