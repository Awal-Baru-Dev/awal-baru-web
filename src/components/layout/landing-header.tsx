import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Moon, Sun, User, LogOut, LayoutDashboard, ChevronDown, Bell } from "lucide-react";
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

					{/* Notification Bell - Right */}
					<Button variant="ghost" size="icon" className="relative">
						<Bell className="h-5 w-5" />
					</Button>
				</div>

				{/* Desktop Header */}
				<div className="hidden md:flex items-center justify-between h-20">
					{/* Logo */}
					<Link to="/" className="flex items-center gap-2">
						<img
							src="/awalbaru-logo.jpeg"
							alt={`${APP_NAME} Logo`}
							width={50}
							height={50}
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

						{/* Auth Section */}
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

						{/* Auth Links - Mobile */}
						<div className="border-t border-border pt-4 mt-2 flex flex-col gap-2">
							{isLoading ? (
								<div className="w-full h-10 bg-muted animate-pulse rounded-md" />
							) : isAuthenticated ? (
								<>
									{/* User info */}
									<div className="flex items-center gap-3 py-2 px-1">
										<div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center">
											<span className="text-brand-primary font-semibold">
												{displayName.charAt(0).toUpperCase()}
											</span>
										</div>
										<div>
											<p className="font-medium text-foreground">
												{displayName}
											</p>
											<p className="text-xs text-muted-foreground">
												{user?.email}
											</p>
										</div>
									</div>

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
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="flex items-center gap-2 px-2"
				>
					<div className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center">
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
					</div>
					<span className="hidden lg:inline-block font-medium max-w-[120px] truncate">
						{displayName}
					</span>
					<ChevronDown className="w-4 h-4 text-muted-foreground" />
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
