import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Menu,
  X,
  Moon,
  Sun,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/theme-context";
import { useUser, getUserDisplayName } from "@/contexts/user-context";
import { APP_NAME } from "@/lib/config/constants";

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, profile, isAuthenticated, isLoading } = useUser();
  const displayName = getUserDisplayName(user, profile);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm shadow-sm border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between h-16">
          {/* Menu Button - Left */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-muted-foreground hover:text-brand-primary"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Logo - Center */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/awalbaru-logo.jpeg"
              alt={`${APP_NAME} Logo`}
              width={40}
              height={40}
              className="object-contain rounded-md"
            />
            <span className="text-lg font-bold text-brand-primary">
              Awal<span className="text-foreground">Baru</span>
            </span>
          </Link>

          {/* Right Action - Profile Icon */}
          <div className="flex items-center justify-end">
            {isAuthenticated ? (
              <UserMenu
                displayName={displayName}
                email={user?.email}
                avatarUrl={profile?.avatar_url}
              />
            ) : (
              <div className="w-10" />
            )}
          </div>
        </div>

        {/* Desktop Header */}
        {/* FIXED: Tinggi disamakan jadi h-16 */}
        <div className="hidden md:flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            {/* FIXED: Ukuran logo disamakan 40px */}
            <img
              src="/awalbaru-logo.jpeg"
              alt={`${APP_NAME} Logo`}
              width={40}
              height={40}
              className="object-contain rounded-md"
            />
            <div className="text-xl font-bold">
              <span className="text-foreground">Awal</span>
              <span className="text-brand-primary">Baru.com</span>
            </div>
          </Link>

          {/* Center Navigation */}
          <nav className="flex items-center gap-8">
            <Link
              to="/courses"
              className="text-muted-foreground hover:text-brand-primary transition-colors text-base font-medium"
            >
              Kursus
            </Link>
            <Link
              to="/tentang"
              className="text-muted-foreground hover:text-brand-primary transition-colors text-base font-medium"
            >
              Tentang Tedchay
            </Link>
            <Link
              to="/harga"
              className="text-muted-foreground hover:text-brand-primary transition-colors text-base font-medium"
            >
              Harga
            </Link>
          </nav>

          {/* Right Actions - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {isLoading ? (
              <div className="w-20 h-9 bg-muted animate-pulse rounded-md" />
            ) : isAuthenticated ? (
              <UserMenu
                displayName={displayName}
                email={user?.email}
                avatarUrl={profile?.avatar_url}
              />
            ) : (
              <>
                <Link
                  to="/masuk"
                  className="text-muted-foreground hover:text-brand-primary transition-colors text-base font-medium"
                >
                  Masuk
                </Link>
                <Link to="/daftar">
                  <Button className="btn-cta">Daftar</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link
              to="/courses"
              className="text-muted-foreground hover:text-brand-primary transition-colors text-base font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Kursus
            </Link>
            <Link
              to="/tentang"
              className="text-muted-foreground hover:text-brand-primary transition-colors text-base font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tentang Tedchay
            </Link>
            <Link
              to="/harga"
              className="text-muted-foreground hover:text-brand-primary transition-colors text-base font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Harga
            </Link>

            <div className="border-t border-border pt-4 mt-2 flex flex-col gap-2">
              {isLoading ? (
                <div className="w-full h-10 bg-muted animate-pulse rounded-md" />
              ) : isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 text-muted-foreground hover:text-brand-primary transition-colors text-base font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>

                  <Link
                    to="/logout"
                    className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors text-base font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogOut className="w-5 h-5" />
                    Keluar
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/masuk"
                    className="text-muted-foreground hover:text-brand-primary transition-colors text-base font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link to="/daftar" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full btn-cta">Daftar</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function UserMenu({
  displayName,
  email,
  avatarUrl,
}: {
  displayName: string;
  email?: string;
  avatarUrl?: string | null;
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-0 md:px-2 hover:bg-transparent md:hover:bg-accent focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center">
              <span className="text-brand-primary font-semibold text-sm">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="hidden md:inline-block font-medium max-w-[120px] truncate">
            {displayName}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-2 border-b border-border">
          <p className="font-medium text-foreground truncate">{displayName}</p>
          {email && (
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          )}
        </div>

        <DropdownMenuItem asChild>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            to="/dashboard/profil"
            className="flex items-center gap-2 cursor-pointer"
          >
            <User className="w-4 h-4" />
            Profil
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            to="/logout"
            className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
