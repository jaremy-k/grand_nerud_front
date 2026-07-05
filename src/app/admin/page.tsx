"use client";

import { Page } from "@/components/blocks";
import { Button } from "@/components/ui/button";
import {
  endOfDay,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import { ru } from "date-fns/locale";
import useAuthContext from "@/contexts/auth-context";
import { formatCurrency } from "@/lib/formatters";
import { capitalizeFirstLetter } from "@/lib/typography";
import { dealsService, usersService } from "@/services";
import { DealDto, UserDto } from "@definitions/dto";
import {
  BarChart3Icon,
  Box,
  CalendarIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { getStageBadgeClass } from "@features/deals/utils/stage-colors";

type PeriodKey = "7" | "30" | "90" | "365" | "all";

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "7", label: "7 дней" },
  { key: "30", label: "30 дней" },
  { key: "90", label: "90 дней" },
  { key: "365", label: "Год" },
  { key: "all", label: "Всё время" },
];

function getDateRange(periodKey: PeriodKey): { start: Date; end: Date } | null {
  const end = endOfDay(new Date());
  if (periodKey === "all") return null;
  const days = Number(periodKey);
  const start = startOfDay(subDays(end, days));
  return { start, end };
}

function filterDealsByPeriod(
  deals: DealDto[],
  periodKey: PeriodKey
): DealDto[] {
  const range = getDateRange(periodKey);
  if (!range) return deals;
  return deals.filter((d) => {
    const date = parseISO(d.createdAt);
    return isWithinInterval(date, { start: range.start, end: range.end });
  });
}

export default function AdminDashboardPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<PeriodKey>("30");
  const [deals, setDeals] = useState<DealDto[]>([]);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!user?.admin) return;
    setLoading(true);
    setError("");
    try {
      const [usersRes, dealsRes] = await Promise.allSettled([
        usersService.getUsers(),
        dealsService.getDealsAdmin(),
      ]);
      if (usersRes.status === "fulfilled") setUsers(usersRes.value);
      else setUsers([]);
      if (dealsRes.status === "fulfilled") {
        setDeals(dealsRes.value);
      } else {
        setDeals([]);
        const msg =
          dealsRes.reason?.message === "Not Found"
            ? "Сервис статистики недоступен"
            : "Не удалось загрузить данные. Проверьте доступ к API статистики.";
        setError(msg);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message === "Not Found"
            ? "Сервис статистики недоступен"
            : err.message
          : "Не удалось загрузить данные"
      );
    } finally {
      setLoading(false);
    }
  }, [user?.admin]);

  useEffect(() => {
    if (!user) return;
    if (!user.admin) {
      navigate("/deals", { replace: true });
      return;
    }
    loadData();
  }, [user, user?.admin, navigate, loadData]);

  if (!user) {
    return (
      <Page
        breadcrumbLinks={[
          { label: "Сделки", href: "/deals" },
          { label: "Статистика", href: "/admin" },
        ]}
      >
        <div className="py-10 text-center text-muted-foreground">
          Войдите для доступа
        </div>
      </Page>
    );
  }

  if (!user.admin) {
    return null;
  }

  const filteredDeals = filterDealsByPeriod(deals, period);
  const range = getDateRange(period);

  // KPI
  const totalRevenue = filteredDeals.reduce(
    (s, d) => s + (d.totalAmount ?? d.amountSalesTotal ?? 0),
    0
  );
  const totalProfit = filteredDeals.reduce((s, d) => s + (d.companyProfit ?? 0), 0);
  const avgDeal = filteredDeals.length
    ? totalRevenue / filteredDeals.length
    : 0;

  // По этапам
  const byStage = filteredDeals.reduce<
    Record<string, { count: number; sum: number; name: string }>
  >((acc, d) => {
    const key = d.stage?._id ?? d.stageId ?? "—";
    const name = d.stage?.name ?? "Без этапа";
    if (!acc[key]) acc[key] = { count: 0, sum: 0, name };
    acc[key].count += 1;
    acc[key].sum += d.totalAmount ?? d.amountSalesTotal ?? 0;
    return acc;
  }, {});

  // По услугам
  const byService = filteredDeals.reduce<
    Record<string, { count: number; sum: number; name?: string }>
  >((acc, d) => {
    const key = d.service?._id ?? d.serviceId ?? "—";
    const name = d.service?.name ?? "Без услуги";
    if (!acc[key]) acc[key] = { count: 0, sum: 0, name };
    acc[key].count += 1;
    acc[key].sum += d.totalAmount ?? d.amountSalesTotal ?? 0;
    acc[key].name = name;
    return acc;
  }, {});

  // По материалам
  const byMaterial = filteredDeals.reduce<
    Record<string, { count: number; sum: number; name?: string }>
  >((acc, d) => {
    const key = d.material?._id ?? d.materialId ?? "—";
    const name = d.material?.name ?? "Без материала";
    if (!acc[key]) acc[key] = { count: 0, sum: 0, name };
    acc[key].count += 1;
    acc[key].sum += d.totalAmount ?? d.amountSalesTotal ?? 0;
    acc[key].name = name;
    return acc;
  }, {});

  // По менеджерам
  const byUser = filteredDeals.reduce<
    Record<string, { count: number; sum: number; name?: string }>
  >((acc, d) => {
    const key = d.user?._id ?? d.userId ?? "—";
    const name = d.user?.name ?? d.user?.email ?? "Не указан";
    if (!acc[key]) acc[key] = { count: 0, sum: 0, name };
    acc[key].count += 1;
    acc[key].sum += d.totalAmount ?? d.amountSalesTotal ?? 0;
    acc[key].name = name;
    return acc;
  }, {});

  // Динамика по дням
  const byDay: Record<string, { count: number; sum: number }> = {};
  filteredDeals.forEach((d) => {
    const day = format(parseISO(d.createdAt), "yyyy-MM-dd");
    if (!byDay[day]) byDay[day] = { count: 0, sum: 0 };
    byDay[day].count += 1;
    byDay[day].sum += d.totalAmount ?? d.amountSalesTotal ?? 0;
  });
  const sortedDays = Object.entries(byDay).sort(
    ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
  );
  const maxByDay = Math.max(
    ...sortedDays.map(([, v]) => v.count),
    1
  );

  const maxByStage = Math.max(...Object.values(byStage).map((v) => v.count), 1);
  const maxByService = Math.max(
    ...Object.values(byService).map((v) => v.count),
    1
  );
  const maxByMaterial = Math.max(
    ...Object.values(byMaterial).map((v) => v.count),
    1
  );
  const maxByUser = Math.max(...Object.values(byUser).map((v) => v.count), 1);

  return (
    <Page
      breadcrumbLinks={[
        { label: "Сделки", href: "/deals" },
        { label: "Статистика", href: "/admin" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Дашборд аналитики
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            {PERIODS.map((p) => (
              <Button
                key={p.key}
                variant={period === p.key ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(p.key)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {range && (
          <p className="text-sm text-muted-foreground">
            Период: {format(range.start, "d MMM yyyy", { locale: ru })} —{" "}
            {format(range.end, "d MMM yyyy", { locale: ru })}
          </p>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error === "Not Found"
              ? "Сервис статистики недоступен"
              : error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* KPI */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BarChart3Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">Сделок</span>
                </div>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {filteredDeals.length}
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUpIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Выручка</span>
                </div>
                <p className="mt-2 text-2xl font-semibold tabular-nums text-primary">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-sm font-medium">Маржа</span>
                </div>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {formatCurrency(totalProfit)}
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-sm font-medium">Средний чек</span>
                </div>
                <p className="mt-2 text-2xl font-semibold tabular-nums">
                  {formatCurrency(avgDeal)}
                </p>
              </div>
            </div>

            {/* Динамика по дням */}
            <section className="rounded-xl border bg-card p-4 shadow-sm">
              <h2 className="mb-4 text-base font-semibold">
                Динамика по дням
              </h2>
              {sortedDays.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Нет данных за выбранный период
                </p>
              ) : (
                <div className="space-y-2">
                  {sortedDays.map(([day, v]) => (
                    <div
                      key={day}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="w-24 shrink-0 text-muted-foreground">
                        {format(parseISO(day), "d MMM", { locale: ru })}
                      </span>
                      <div className="flex flex-1 items-center gap-2">
                        <div
                          className="h-6 rounded bg-primary/20"
                          style={{
                            width: `${(v.count / maxByDay) * 100}%`,
                            minWidth: v.count ? 4 : 0,
                          }}
                        />
                        <span className="w-12 tabular-nums">
                          {v.count} шт
                        </span>
                        <span className="w-24 text-right tabular-nums text-muted-foreground">
                          {formatCurrency(v.sum)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {/* По этапам */}
              <section className="rounded-xl border bg-card p-4 shadow-sm">
                <h2 className="mb-4 text-base font-semibold">
                  По этапам сделки
                </h2>
                {Object.entries(byStage).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Нет данных
                  </p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(byStage).map(([id, v]) => (
                      <div key={id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStageBadgeClass(id)}`}
                          >
                            {capitalizeFirstLetter(v.name)}
                          </span>
                          <span className="tabular-nums">
                            {v.count} шт · {formatCurrency(v.sum)}
                          </span>
                        </div>
                        <div
                          className="h-2 rounded bg-muted"
                          style={{
                            width: `${(v.count / maxByStage) * 100}%`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* По услугам */}
              <section className="rounded-xl border bg-card p-4 shadow-sm">
                <h2 className="mb-4 text-base font-semibold">По услугам</h2>
                {Object.entries(byService).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Нет данных</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(byService).map(([id, v]) => (
                      <div key={id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>
                            {v.name
                              ? capitalizeFirstLetter(v.name)
                              : id}
                          </span>
                          <span className="tabular-nums">
                            {v.count} шт · {formatCurrency(v.sum)}
                          </span>
                        </div>
                        <div
                          className="h-2 rounded bg-muted"
                          style={{
                            width: `${(v.count / maxByService) * 100}%`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* По материалам */}
              <section className="rounded-xl border bg-card p-4 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
                  <Box className="h-4 w-4" />
                  По материалам
                </h2>
                {Object.entries(byMaterial).length === 0 ? (
                  <p className="text-sm text-muted-foreground">Нет данных</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(byMaterial).map(([id, v]) => (
                      <div key={id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>
                            {v.name
                              ? capitalizeFirstLetter(v.name)
                              : id}
                          </span>
                          <span className="tabular-nums">
                            {v.count} шт · {formatCurrency(v.sum)}
                          </span>
                        </div>
                        <div
                          className="h-2 rounded bg-muted"
                          style={{
                            width: `${(v.count / maxByMaterial) * 100}%`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* По менеджерам */}
            <section className="rounded-xl border bg-card p-4 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
                <UsersIcon className="h-4 w-4" />
                По менеджерам
              </h2>
              {Object.entries(byUser).length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет данных</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(byUser).map(([id, v]) => (
                    <div key={id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{v.name ?? id}</span>
                        <span className="tabular-nums">
                          {v.count} шт · {formatCurrency(v.sum)}
                        </span>
                      </div>
                      <div
                        className="h-2 rounded bg-muted"
                        style={{
                          width: `${(v.count / maxByUser) * 100}%`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </Page>
  );
}
