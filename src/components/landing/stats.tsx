interface StatItem {
	number: string;
	label: string;
}

const STATS: StatItem[] = [
	{ number: "10", label: "Video Pembelajaran" },
	{ number: "100%", label: "Pengalaman Nyata" },
];

export function LandingStats() {
	return (
    <section className="bg-gradient-to-b from-muted to-background py-20">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 md:gap-16">
          {STATS.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface StatCardProps {
	stat: StatItem;
}

function StatCard({ stat }: StatCardProps) {
	return (
		<div className="text-center space-y-3 group">
			<div className="text-6xl font-bold text-brand-primary group-hover:scale-110 transition-transform duration-300">
				{stat.number}
			</div>
			<div className="text-lg text-foreground font-medium">{stat.label}</div>
			<div className="w-16 h-1 bg-brand-cta/30 mx-auto rounded-full group-hover:w-24 group-hover:bg-brand-cta transition-all duration-300" />
		</div>
	);
}
