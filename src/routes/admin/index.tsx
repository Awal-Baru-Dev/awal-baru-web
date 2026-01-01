import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  ArrowRight,
  CreditCard,
  BarChart3,
  PieChart,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

import { createBrowserClient } from "@/lib/db/supabase/client";
import { getAdminTransactions } from "@/features/transactions/server";
import { getAdminCourses } from "@/features/courses/actions";
import type { AdminCourseListItem } from "@/lib/db/types";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const supabase = createBrowserClient();

      const { data: statsData, error: statsError } = await supabase.rpc(
        "get_admin_dashboard_stats"
      );
      if (statsError) throw statsError;

      const { data: trxData } = await getAdminTransactions();
      const recentTrx = trxData?.slice(0, 5) || [];

      const { data: courseData } = await getAdminCourses();

      const safeCourses = (courseData || []) as AdminCourseListItem[];

      const popularCourses = safeCourses
        .sort((a, b) => (b.student_count || 0) - (a.student_count || 0))
        .slice(0, 4);

      return {
        stats: statsData as {
          totalRevenue: number;
          totalUsers: number;
          activeCourses: number;
          sales24h: number;
          revenueChart: { date: string; total: number }[];
        },
        recentTrx,
        popularCourses,
        allCourses: safeCourses,
      };
    },
  });

  const categoryStats = useMemo(() => {
    if (!data?.allCourses) return [];

    const stats: Record<string, number> = {};
    let totalStudentInCategories = 0;

    data.allCourses.forEach((course) => {
      if (course.category === "Bundle") return;

      const cat = course.category || "Lainnya";
      const count = course.student_count || 0;

      stats[cat] = (stats[cat] || 0) + count;
      totalStudentInCategories += count;
    });

    return Object.entries(stats)
      .map(([name, value]) => ({
        name,
        value,
        percentage:
          totalStudentInCategories > 0
            ? (value / totalStudentInCategories) * 100
            : 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [data?.allCourses]);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatRupiahCompact = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const stats = data?.stats;

  const maxChartValue = Math.max(
    ...(stats?.revenueChart?.map((d) => d.total) || [0]),
    1
  );

  const MAX_BAR_HEIGHT_PX = 150;

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Ringkasan aktivitas platform AwalBaru hari ini.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-primary">
              {formatRupiah(stats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Akumulasi pendapatan bersih
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              User terdaftar aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kursus Aktif</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeCourses || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Siap dipelajari siswa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Penjualan 24 Jam
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats?.sales24h || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Transaksi sukses terbaru
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                Tren Pendapatan (7 Hari Terakhir)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!stats?.revenueChart || stats.revenueChart.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm bg-muted/20 rounded-lg border border-dashed">
                  Belum ada data penjualan minggu ini
                </div>
              ) : (
                <div className="h-[200px] flex items-end justify-between gap-2 pt-4 px-2">
                  {stats.revenueChart.map((item, idx) => {
                    const barHeight =
                      (item.total / maxChartValue) * MAX_BAR_HEIGHT_PX;

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col justify-end items-center gap-2 group relative h-full"
                      >
                        <div
                          className="w-full bg-brand-primary/20 hover:bg-brand-primary/80 transition-all duration-300 rounded-t-sm relative group cursor-pointer"
                          style={{
                            height: `${Math.max(barHeight, 4)}px`,
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            {formatRupiahCompact(item.total)}
                          </div>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium h-4">
                          {item.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Transaksi Terbaru</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/transactions">
                  Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.recentTrx.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Belum ada transaksi.
                  </div>
                ) : (
                  data?.recentTrx.map((trx) => (
                    <div
                      key={trx.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {trx.user_name || "User"}
                          </p>
                          <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {trx.course_title}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatRupiah(trx.amount_paid)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(trx.created_at).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "short" }
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kursus Terpopuler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data?.popularCourses.map((course) => (
                  <div key={course.id} className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-md bg-muted overflow-hidden border shrink-0">
                      {course.thumbnail_url && (
                        <img
                          src={course.thumbnail_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      <p
                        className="text-sm font-medium line-clamp-1"
                        title={course.title}
                      >
                        {course.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{course.student_count || 0} Siswa</span>
                      </div>
                    </div>
                    <div className="font-bold text-sm">
                      {course.price === 0
                        ? "Free"
                        : formatRupiahCompact(course.price)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-muted-foreground" />
                Kategori Favorit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {categoryStats.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    Belum ada data kategori
                  </div>
                ) : (
                  categoryStats.map((cat) => (
                    <div key={cat.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {cat.value} Siswa
                        </span>
                      </div>
                      <Progress value={cat.percentage} className="h-2" />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <Skeleton className="col-span-4 h-[300px] rounded-xl" />
        <Skeleton className="col-span-3 h-[300px] rounded-xl" />
      </div>
    </div>
  );
}
