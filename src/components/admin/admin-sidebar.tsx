import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  PanelLeft,
  PanelLeftClose,
  X,
  ChevronRight,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/config/constants";

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  className?: string;
}

const adminNavItems = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/courses", label: "Manajemen Kursus", icon: BookOpen },
  { to: "/admin/users", label: "Pengguna", icon: Users },
  { to: "/admin/transactions", label: "Transaksi", icon: CreditCard },
  { to: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export function AdminSidebar({
  sidebarOpen,
  setSidebarOpen,
  isCollapsed,
  setIsCollapsed,
  className,
}: AdminSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-full bg-sidebar border-r border-sidebar-border z-50 transition-all duration-300 flex flex-col",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        isCollapsed ? "lg:w-16" : "lg:w-64",
        "w-64",
        className
      )}
    >
      {/* Sidebar Header */}
      <div
        className={cn(
          "h-16 flex items-center border-b border-sidebar-border/50",
          isCollapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        {/* Logo */}
        <Link
          to="/admin"
          className={cn("flex items-center gap-2", isCollapsed && "lg:hidden")}
        >
          <img
            src="/awalbaru-logo.jpeg"
            alt={APP_NAME}
            className="h-8 w-8 rounded-lg"
          />
          <span className="font-bold text-brand-primary">
            Awal<span className="text-sidebar-foreground">Baru</span>
          </span>
        </Link>

        {/* Toggle Button (Desktop) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </Button>

        {/* Close Button (Mobile) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="p-2 flex-1 flex flex-col">
        <div>
          {/* Section Label */}
          <div className={cn("px-3 py-2", isCollapsed && "lg:hidden")}>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Menu Admin
            </span>
          </div>

          <ul className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.to ||
                (item.to !== "/admin" && location.pathname.startsWith(item.to));

              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center rounded-lg transition-colors",
                      isCollapsed
                        ? "lg:justify-center lg:px-0 lg:py-2.5 px-3 py-2.5 gap-3"
                        : "gap-3 px-3 py-2.5",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className={cn(isCollapsed && "lg:hidden")}>
                      {item.label}
                    </span>
                    {isActive && !isCollapsed && (
                      <ChevronRight className="w-4 h-4 ml-auto lg:block hidden" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
