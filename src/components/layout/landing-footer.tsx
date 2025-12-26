import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Youtube } from "lucide-react";
import { APP_NAME, SOCIAL_LINKS } from "@/lib/config/constants";

export function LandingFooter() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="bg-muted border-t border-border py-12">
			<div className="container mx-auto px-6 lg:px-16">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
					{/* Brand */}
					<div className="md:col-span-2">
						<Link to="/" className="flex items-center gap-2 mb-4">
							<img
								src="/awalbaru-logo.jpeg"
								alt={`${APP_NAME} Logo`}
								width={40}
								height={40}
								className="object-contain rounded-md"
							/>
							<div className="text-lg font-bold">
								<span className="text-foreground">Awal</span>
								<span className="text-brand-primary">Baru.com</span>
							</div>
						</Link>
						<p className="text-sm text-muted-foreground max-w-sm">
							Membantu orang Indonesia meraih American Dream melalui pendidikan
							dan bimbingan yang terpercaya.
						</p>
					</div>

					{/* Quick Links */}
					<div>
						<h4 className="font-semibold text-foreground mb-4">Menu</h4>
						<ul className="space-y-2">
							<li>
								<Link
									to="/courses"
									className="text-sm text-muted-foreground hover:text-brand-primary transition-colors"
								>
									Kursus
								</Link>
							</li>
							<li>
								<Link
									to="/tentang"
									className="text-sm text-muted-foreground hover:text-brand-primary transition-colors"
								>
									Tentang Tedchay
								</Link>
							</li>
							<li>
								<Link
									to="/harga"
									className="text-sm text-muted-foreground hover:text-brand-primary transition-colors"
								>
									Harga
								</Link>
							</li>
						</ul>
					</div>

					{/* Social */}
					<div>
						<h4 className="font-semibold text-foreground mb-4">Ikuti Kami</h4>
						<div className="flex items-center gap-4">
							<a
								href={SOCIAL_LINKS.youtube}
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:text-brand-primary transition-colors"
								aria-label="YouTube Tedchay"
							>
								<Youtube className="w-5 h-5" />
							</a>
							<a
								href={SOCIAL_LINKS.instagram}
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:text-brand-primary transition-colors"
								aria-label="Instagram"
							>
								<Instagram className="w-5 h-5" />
							</a>
							<a
								href="#"
								className="text-muted-foreground hover:text-brand-primary transition-colors"
								aria-label="LinkedIn"
							>
								<Linkedin className="w-5 h-5" />
							</a>
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
					<p className="text-sm text-muted-foreground">
						© {currentYear} {APP_NAME}. All rights reserved.
					</p>
					<div className="flex items-center gap-6 text-sm text-muted-foreground">
						<Link to="#" className="hover:text-brand-primary transition-colors">
							Kebijakan Privasi
						</Link>
						<Link to="#" className="hover:text-brand-primary transition-colors">
							Syarat & Ketentuan
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
