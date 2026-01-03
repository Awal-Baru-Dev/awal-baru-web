import { createFileRoute } from "@tanstack/react-router";
import { LandingHeader, LandingFooter } from "@/components/layout";
import { LandingCTA } from "@/components/landing";
import {
  Award,
  Rocket,
  MapPin,
  Baby,
  Plane,
  GraduationCap,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import { APP_NAME, BRAND } from "@/lib/config/constants";

export const Route = createFileRoute("/tentang")({
  component: TentangPage,
});

function TentangPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-hero-gradient text-white">
          <div className="container mx-auto px-6 lg:px-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Tentang {BRAND.founder}
                </h1>
                <p className="text-xl text-white/90 leading-relaxed mb-4">
                  Dari dapur Indonesia ke dapur New York City — perjalanan
                  seorang chef yang mewujudkan American Dream melalui DV
                  Lottery.
                </p>
                <div className="flex items-center gap-2 text-white/80">
                  <Award className="w-5 h-5" />
                  <span>DV Lottery Winner 2021</span>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                <img
                  src="/tedchay-hero.png"
                  alt={BRAND.founder}
                  className="w-full max-w-md rounded-2xl shadow-2xl border-4 border-white/10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-6 lg:px-16">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">
              Perjalanan {BRAND.founder}
            </h2>

            <div className="max-w-3xl mx-auto">
              <Timeline />
            </div>
          </div>
        </section>

        {/* Mission Section - Revised */}
        <section className="py-24 bg-muted/30 relative overflow-hidden">
          {/* Background Blur Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-5 pointer-events-none">
            <div className="absolute top-20 left-20 w-64 h-64 bg-brand-primary rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-brand-cta rounded-full blur-[100px]" />
          </div>

          <div className="container mx-auto px-6 lg:px-16 relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Tentang {APP_NAME}
              </h2>

              <div className="text-lg text-muted-foreground leading-relaxed space-y-6">
                <p>
                  {APP_NAME} adalah platform inspiratif dan informatif bagi
                  orang Indonesia yang ingin memulai langkah pertama menuju
                  kehidupan baru di luar negeri — baik untuk bekerja, kuliah,
                  maupun mencari peluang baru.
                </p>
                <p>
                  Kami percaya bahwa setiap perjalanan besar dimulai dari satu
                  langkah kecil. Melalui panduan, cerita nyata, dan tips
                  praktis, kami membantu kamu memahami proses dan persiapan
                  penting.
                </p>
              </div>

              {/* Quote Box */}
              <div className="mt-10 p-8 bg-background border border-border/50 rounded-2xl shadow-sm relative">
                <div className="text-4xl text-brand-primary/20 absolute top-4 left-4 font-serif">
                  "
                </div>
                <p className="text-xl font-medium text-brand-primary italic relative z-10">
                  Temukan inspirasi dan informasi yang bisa membuka jalan menuju
                  impianmu. Karena setiap keberanian untuk memulai adalah
                  AwalBaru menuju masa depan yang lebih baik.
                </p>
              </div>
            </div>

            {/* Mission Cards Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <MissionCard
                icon={GraduationCap}
                title="Edukasi"
                description="Memberikan pengetahuan lengkap tentang proses imigrasi & visa Amerika."
              />
              <MissionCard
                icon={MapPin}
                title="Bimbingan"
                description="Panduan langkah demi langkah berdasarkan pengalaman nyata, bukan teori semata."
              />
              <MissionCard
                icon={Rocket}
                title="Komunitas"
                description="Membangun jaringan support system sesama pejuang American Dream."
              />
            </div>
          </div>
        </section>

        <LandingCTA
          title="Mulai Perjalananmu Bersama Tedchay"
          subtitle="Pelajari dari pengalaman langsung seseorang yang sudah mewujudkan American Dream."
          buttonText="Lihat Kursus"
          buttonLink="/courses"
        />
      </main>

      <LandingFooter />
    </div>
  );
}

interface TimelineItem {
  year: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TIMELINE_ITEMS: TimelineItem[] = [
  {
    year: "1995",
    title: "Lahir dan Tumbuh di Indonesia",
    description: "Memulai perjalanan hidup di Indonesia",
    icon: Baby,
  },
  {
    year: "2017",
    title: "Kuliah di Luar Negeri",
    description: "Pengalaman pertama kuliah di luar negeri (Perancis)",
    icon: GraduationCap,
  },
  {
    year: "2018",
    title: "Kerja di Luar Negeri",
    description: "Pengalaman kerja pertama di luar negeri (Australia)",
    icon: Briefcase,
  },
  {
    year: "2021",
    title: "Mencoba DV Lottery",
    description: "Mendaftar program DV Lottery Amerika Serikat",
    icon: Award,
  },
  {
    year: "2023",
    title: "Pindah ke Amerika Serikat",
    description: "Resmi pindah ke Amerika Serikat sebagai Green Card holder",
    icon: Plane,
  },
  {
    year: "2025",
    title: "Membangun AwalBaru.com",
    description:
      "Memulai misi untuk membantu orang Indonesia lainnya meraih American Dream",
    icon: Rocket,
  },
];

function Timeline() {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-8">
        {TIMELINE_ITEMS.map((item, index) => (
          <TimelineCard key={index} item={item} />
        ))}
      </div>
    </div>
  );
}

function TimelineCard({ item }: { item: TimelineItem }) {
  const Icon = item.icon;

  return (
    <div className="relative flex gap-6">
      <div className="relative z-10 w-16 h-16 rounded-full border-4 border-background bg-background flex items-center justify-center shrink-0">
        <div className="absolute inset-0 rounded-full bg-brand-primary/10" />

        <Icon className="relative z-10 w-6 h-6 text-brand-primary" />
      </div>

      <div className="bg-card border border-border rounded-xl p-6 flex-1 card-hover">
        <div className="text-sm text-brand-primary font-semibold mb-1">
          {item.year}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {item.title}
        </h3>
        <p className="text-muted-foreground">{item.description}</p>
      </div>
    </div>
  );
}

function MissionCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="bg-background border border-border/50 rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-primary group-hover:text-white transition-colors">
        <Icon className="w-6 h-6 text-brand-primary group-hover:text-white transition-colors" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
