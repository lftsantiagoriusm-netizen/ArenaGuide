import { primaryNavigation } from "@/lib/navigation";
import { NavLink } from "./nav-link";

export function BottomNavigation() {
  return (
    <nav
      aria-label="Navegación principal"
      className="border-border bg-background/95 fixed inset-x-0 bottom-0 z-30 flex border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      {primaryNavigation.map((item) => (
        <NavLink key={item.href} {...item} mobile />
      ))}
    </nav>
  );
}
