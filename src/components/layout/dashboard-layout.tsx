import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Home,
  BookOpen,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Library,
  PanelLeft,
  PanelLeftClose,
  Moon,
  Sun,
  ChevronsUpDown,
  HelpCircle,
  MessageCircle,
  ChevronDown,
  ShieldCheck
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CourseSearchDropdown } from "@/components/shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser, getUserDisplayName } from "@/contexts/user-context";
import { useTheme } from "@/contexts/theme-context";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/config/constants";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// Main navigation items (Belajar section)
const mainNavItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/courses", label: "Katalog Kursus", icon: Library },
  { to: "/dashboard/kursus", label: "Kursus Saya", icon: BookOpen },
];

// Help navigation items (Bantuan section)
const helpNavItems = [
  { to: "/dashboard/bantuan", label: "Pusat Bantuan", icon: HelpCircle },
  { to: "/dashboard/kontak", label: "Hubungi Kami", icon: MessageCircle },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-collapsed") === "true";
    }
    return false;
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useUser();
  const { theme, toggleTheme } = useTheme();
  const displayName = getUserDisplayName(user, profile);
  const isAdmin = profile?.role === "admin";

  // Persist collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-muted-foreground hover:text-brand-primary"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <Link to="/" className="flex items-center gap-2">
          <img
            src="/awalbaru-logo.jpeg"
            alt={APP_NAME}
            className="h-10 w-10 rounded-lg"
          />
          <span className="text-lg font-bold text-brand-primary">
            Awal<span className="text-foreground">Baru</span>
          </span>
        </Link>

        <Link to="/dashboard/profil" onClick={() => setSidebarOpen(false)}>
          <div className="w-9 h-9 bg-brand-primary/10 rounded-full flex items-center justify-center">
            <span className="text-brand-primary font-semibold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        </Link>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-sidebar border-r border-sidebar-border z-50 transition-all duration-300 flex flex-col",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-16" : "lg:w-64",
          "w-64" // Always full width on mobile
        )}
      >
        {/* Sidebar header */}
        <div
          className={cn(
            "h-16 flex items-center border-b border-sidebar-border/50",
            isCollapsed ? "justify-center px-2" : "justify-between px-4"
          )}
        >
          {/* Logo - hidden when collapsed on desktop, visible on mobile */}
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2",
              isCollapsed && "lg:hidden"
            )}
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

          {/* Toggle button - desktop only (on the right) */}
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

          {/* Close button - mobile only */}
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
          {/* Belajar Section */}
          <div>
            <div className={cn("px-3 py-2", isCollapsed && "lg:hidden")}>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Belajar
              </span>
            </div>
            <ul className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.to ||
                  (item.to === "/courses" &&
                    location.pathname.startsWith("/courses/"));

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
                      {isActive && (
                        <ChevronRight className="w-4 h-4 ml-auto lg:hidden" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div
              className={cn(
                "my-3 mx-3 h-px bg-border",
                isCollapsed && "lg:mx-auto lg:w-8"
              )}
            />
          </div>

          {/* Bantuan Section */}
          <div>
            <div className={cn("px-3 py-2", isCollapsed && "lg:hidden")}>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Bantuan
              </span>
            </div>
            <ul className="space-y-1">
              {helpNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;

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
                      {isActive && (
                        <ChevronRight className="w-4 h-4 ml-auto lg:hidden" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex-1" />
        </nav>

        <div className="p-2 border-t border-sidebar-border lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <div className="w-9 h-9 bg-brand-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-primary font-semibold text-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium text-sidebar-foreground truncate text-sm">
                    {displayName}
                  </p>
                </div>
                <ChevronsUpDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm text-muted-foreground truncate">
                  {user?.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isAdmin && (
                <>
                  <DropdownMenuItem
                    asChild
                    className="bg-primary/10 text-primary focus:bg-primary/20 font-medium cursor-pointer"
                  >
                    <Link
                      to="/admin"
                      className="cursor-pointer w-full flex items-center"
                    >
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem asChild>
                <Link
                  to="/dashboard/profil"
                  onClick={() => setSidebarOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === "light" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
                {theme === "light" ? "Mode Gelap" : "Mode Terang"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  navigate({ to: "/logout" });
                }}
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content area */}
      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          isCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        <header
          className={cn(
            "hidden lg:flex h-16 items-center justify-between px-6 border-b border-border bg-background sticky top-0 z-40"
          )}
        >
          {/* Search bar */}
          <CourseSearchDropdown />

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={
                theme === "light"
                  ? "Beralih ke mode gelap"
                  : "Beralih ke mode terang"
              }
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {/* User Dropdown Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 hover:bg-accent"
                >
                  <div className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-brand-primary font-semibold text-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="font-medium leading-none">{displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem
                      asChild
                      className="bg-primary/10 text-primary focus:bg-primary/20 font-medium cursor-pointer"
                    >
                      <Link
                        to="/admin"
                        className="cursor-pointer w-full flex items-center"
                      >
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/profil" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => navigate({ to: "/logout" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="pt-16 lg:pt-0">{children}</main>
      </div>
    </div>
  );
}
