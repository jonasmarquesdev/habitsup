import { Logo } from "./Logo";
import UserMenu from "./UserMenu";

export function Nav() {
  return (
    <div className="flex items-center justify-between w-full py-4 px-8">
      <Logo />

      <UserMenu />
    </div>
  );
}
