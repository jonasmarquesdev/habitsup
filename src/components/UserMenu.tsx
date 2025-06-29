"use client";

import { Button } from "./ui/button";
import {
  HomeIcon,
  LogOutIcon,
  Crown,
  Settings,
  CalendarArrowUp,
} from "lucide-react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { useAuth } from "@/contexts/UserContext";
import { useEffect, useState } from "react";
import { User } from "@/interfaces/User";
import { Skeleton } from "./ui/skeleton";
import { ActivityModal } from "./ActivityModal";
import { SettingsModal } from "./SettingsModal";

const UserMenu = () => {
  const { getUsuario, logout, isAuthenticatedBoolean } = useAuth();
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticatedBoolean) return;
    const fetchUser = async () => {
      setLoading(true);
      const currentUser = await getUsuario();
      setUser(currentUser);
      setLoading(false);
    };
    fetchUser();
  }, [getUsuario, isAuthenticatedBoolean]);

  const data = {
    user: user,
  };

  const buttons = [
    {
      label: "Início",
      href: "/",
      icon: <HomeIcon size={16} />,
      onClick: undefined,
    },
    {
      label: "Hábitos",
      href: "#",
      icon: <CalendarArrowUp size={16} />,
      onClick: () => setActivityModalOpen(true),
    },
    {
      label: "Assinatura",
      href: "/#",
      icon: <Crown size={16} />,
    },
    {
      label: "Configurações",
      href: "#",
      icon: <Settings size={16} />,
      onClick: () => setSettingsModalOpen(true),
    },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-between">
        <Button
          variant="outline"
          className="bg-transparent flex items-center gap-4 border-none"
          disabled
        >
          <Skeleton className="h-5 w-20 rounded bg-zinc-600" />
          <Skeleton className="h-10 w-10 rounded-full bg-zinc-600" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-between">
      <ActivityModal
        open={activityModalOpen}
        onOpenChange={setActivityModalOpen}
      />
      <SettingsModal
        open={settingsModalOpen}
        onOpenChange={setSettingsModalOpen}
      />
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="bg-transparent flex items-center gap-4 border-none"
          >
            <p>{data?.user?.name}</p>
            <Avatar>
              <AvatarImage src={data?.user?.image as string | undefined} />
              <AvatarFallback>
                {data?.user?.name?.split(" ")[0]?.[0]}
                {data?.user?.name?.split(" ")[1]?.[0] ?? ""}
              </AvatarFallback>
            </Avatar>
          </Button>
        </SheetTrigger>

        <SheetContent aria-describedby={undefined}>
          <SheetHeader>
            <SheetTitle className="text-left">Menu</SheetTitle>
          </SheetHeader>

          <div className="flex justify-between pt-6">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={data?.user?.image as string | undefined} />
                <AvatarFallback>
                  {data?.user?.name?.split(" ")[0]?.[0]}
                  {data?.user?.name?.split(" ")[1]?.[0] ?? ""}
                </AvatarFallback>
              </Avatar>

              <div>
                <h3 className="font-semibold">{data?.user?.name}</h3>
                <span className="block text-xs text-muted-foreground">
                  {data?.user?.email}
                </span>
              </div>
            </div>
          </div>

          <div className="py-6">
            <Separator />
          </div>

          <div className="space-y-2">
            {buttons.map((button, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start space-x-3 rounded-full text-sm font-normal"
                asChild
                onClick={button.onClick}
              >
                {button.onClick ? (
                  <Link href="#">
                    {button.icon}
                    <span className="block">{button.label}</span>
                  </Link>
                ) : (
                  <Link
                    href={button.href}
                    className=""
                    tabIndex={button.label === "Assinatura" ? -1 : 0}
                    aria-disabled={button.label === "Assinatura"}
                    style={
                      button.label === "Assinatura"
                        ? { pointerEvents: "none", opacity: 0.5 }
                        : {}
                    }
                  >
                    {button.icon}
                    <span className="block">{button.label}</span>
                  </Link>
                )}
              </Button>
            ))}
          </div>

          <div className="py-6">
            <Separator />
          </div>

          {data?.user && (
            <Button
              variant="ghost"
              className="w-full justify-start space-x-3 rounded-full text-sm font-normal"
              onClick={() => logout()}
            >
              <LogOutIcon size={16} />
              <span className="block">Sair da conta</span>
            </Button>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default UserMenu;
