"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  Clock,
  CreditCard,
  DollarSign,
  TrendingUp,
  Wallet,
} from "lucide-react";

const CASH_MOVEMENTS = [
  {
    id: 1,
    client: "Camila Pérez",
    service: "Kapping",
    date: "2026-06-18",
    time: "10:30",
    total: 18000,
    deposit: 5000,
    remainingPaid: 13000,
    paymentMethod: "Efectivo",
    status: "Pagado completo",
    duration: 90,
  },
  {
    id: 2,
    client: "Sofía López",
    service: "Semipermanente",
    date: "2026-06-18",
    time: "12:00",
    total: 15000,
    deposit: 5000,
    remainingPaid: 10000,
    paymentMethod: "Transferencia",
    status: "Pagado completo",
    duration: 60,
  },
  {
    id: 3,
    client: "Martina Díaz",
    service: "Soft Gel",
    date: "2026-06-18",
    time: "15:30",
    total: 22000,
    deposit: 5000,
    remainingPaid: 0,
    paymentMethod: "Pendiente",
    status: "Pendiente restante",
    duration: 90,
  },
  {
    id: 4,
    client: "Valentina García",
    service: "Soft Gel",
    date: "2026-06-19",
    time: "17:00",
    total: 22000,
    deposit: 5000,
    remainingPaid: 0,
    paymentMethod: "Pendiente",
    status: "Turno futuro",
    duration: 90,
  },
];

const money = (n: number) => `$${n.toLocaleString("es-AR")}`;

const formatDate = (date: string) => date.split("-").reverse().join("/");

function MetricCard({
  label,
  value,
  subtitle,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-[20px] border p-4 backdrop-blur-md",
        highlight
          ? "border-[#E535AA]/45 bg-[#E535AA]/18"
          : "border-white/15 bg-white/10",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/35">
            {label}
          </div>

          <div className="mt-2 font-serif text-[25px] font-bold leading-none text-white">
            {value}
          </div>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#FAD8F0]">
          {icon}
        </div>
      </div>

      <div className="mt-3 text-xs leading-5 text-white/45">{subtitle}</div>
    </div>
  );
}

function PaymentBadge({ method }: { method: string }) {
  const styles: Record<string, string> = {
    Efectivo: "border-emerald-300/30 bg-emerald-400/15 text-emerald-200",
    Transferencia: "border-blue-300/30 bg-blue-400/15 text-blue-200",
    "Mercado Pago": "border-cyan-300/30 bg-cyan-400/15 text-cyan-200",
    Pendiente: "border-yellow-300/30 bg-yellow-400/15 text-yellow-200",
  };

  return (
    <span
      className={[
        "rounded-full border px-3 py-1 text-[11px] font-bold",
        styles[method] || "border-white/15 bg-white/10 text-white/60",
      ].join(" ")}
    >
      {method}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "Pagado completo":
      "border-emerald-300/30 bg-emerald-400/15 text-emerald-200",
    "Pendiente restante":
      "border-yellow-300/30 bg-yellow-400/15 text-yellow-200",
    "Turno futuro": "border-purple-300/30 bg-purple-400/15 text-purple-200",
  };

  return (
    <span
      className={[
        "rounded-full border px-3 py-1 text-[11px] font-bold",
        styles[status] || "border-white/15 bg-white/10 text-white/60",
      ].join(" ")}
    >
      {status}
    </span>
  );
}

export default function CajaPage() {
  const totalDeposits = CASH_MOVEMENTS.reduce(
    (acc, item) => acc + item.deposit,
    0,
  );

  const totalRemainingPaid = CASH_MOVEMENTS.reduce(
    (acc, item) => acc + item.remainingPaid,
    0,
  );

  const totalCollected = totalDeposits + totalRemainingPaid;

  const pendingToCollect = CASH_MOVEMENTS.reduce(
    (acc, item) => acc + (item.total - item.deposit - item.remainingPaid),
    0,
  );

  const completedMinutes = CASH_MOVEMENTS.filter(
    (item) => item.status === "Pagado completo",
  ).reduce((acc, item) => acc + item.duration, 0);

  const completedHours = completedMinutes / 60;

  const averagePerHour =
    completedHours > 0 ? Math.round(totalRemainingPaid / completedHours) : 0;

  const cashTotal = CASH_MOVEMENTS.filter(
    (item) => item.paymentMethod === "Efectivo",
  ).reduce((acc, item) => acc + item.remainingPaid, 0);

  const transferTotal = CASH_MOVEMENTS.filter(
    (item) => item.paymentMethod === "Transferencia",
  ).reduce((acc, item) => acc + item.remainingPaid, 0);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(160deg,#2A0E1E_0%,#4A1035_60%,#2A0E1E_100%)] px-5 py-6 text-white">
      <div className="pointer-events-none absolute right-[-140px] top-[-120px] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(229,53,170,0.18)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-[-120px] left-[-120px] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(229,53,170,0.10)_0%,transparent_70%)]" />

      <div className="relative z-[1] mx-auto max-w-[1000px]">
        <header className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/85 backdrop-blur-md transition hover:bg-white/15"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-[3px] text-[#FAD8F0]">
                Panel Admin
              </div>

              <h1 className="mt-1 font-serif text-[32px] font-bold leading-none text-white">
                Caja
              </h1>

              <p className="mt-2 text-sm text-white/45">
                Ganancias, señas, restantes, horas y métodos de pago.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white/75 backdrop-blur-md">
            Hoy · 18/06/2026
          </div>
        </header>

        <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label="Cobrado"
            value={money(totalCollected)}
            subtitle="Señas + restantes pagados"
            icon={<DollarSign size={20} />}
            highlight
          />

          <MetricCard
            label="Señas"
            value={money(totalDeposits)}
            subtitle="Reservas cobradas"
            icon={<CreditCard size={20} />}
          />

          <MetricCard
            label="Restantes"
            value={money(totalRemainingPaid)}
            subtitle="Cobrado en el turno"
            icon={<Wallet size={20} />}
          />

          <MetricCard
            label="Pendiente"
            value={money(pendingToCollect)}
            subtitle="Todavía falta cobrar"
            icon={<Banknote size={20} />}
          />
        </section>

        <section className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-[20px] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/35">
                  Horas trabajadas
                </div>

                <div className="mt-2 font-serif text-[26px] font-bold leading-none">
                  {Math.floor(completedMinutes / 60)}h {completedMinutes % 60}m
                </div>
              </div>

              <Clock size={21} className="text-[#FAD8F0]" />
            </div>
          </div>

          <div className="rounded-[20px] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/35">
                  Promedio/hora
                </div>

                <div className="mt-2 font-serif text-[24px] font-bold leading-none text-[#FAD8F0]">
                  {money(averagePerHour)}
                </div>
              </div>

              <TrendingUp size={21} className="text-[#FAD8F0]" />
            </div>
          </div>
        </section>

        <section className="mb-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
            <h2 className="font-serif text-2xl font-bold text-white">
              Métodos de pago
            </h2>

            <div className="mt-5 flex flex-col gap-3">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-white/55">Efectivo</span>
                  <span className="font-bold text-white">
                    {money(cashTotal)}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-300/70"
                    style={{
                      width:
                        totalRemainingPaid > 0
                          ? `${(cashTotal / totalRemainingPaid) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-white/55">Transferencia</span>
                  <span className="font-bold text-white">
                    {money(transferTotal)}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-blue-300/70"
                    style={{
                      width:
                        totalRemainingPaid > 0
                          ? `${(transferTotal / totalRemainingPaid) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#E535AA]/35 bg-[#E535AA]/15 p-5 backdrop-blur-md">
            <div className="text-[11px] font-bold uppercase tracking-[3px] text-[#FAD8F0]">
              Lectura rápida
            </div>

            <h2 className="mt-2 font-serif text-2xl font-bold text-white">
              Hoy cobraste {money(totalCollected)}
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/55">
              De eso, {money(totalDeposits)} entró como seña y{" "}
              {money(totalRemainingPaid)} como restante cobrado en turnos. Todavía
              quedan {money(pendingToCollect)} pendientes por cobrar.
            </p>

            <div className="mt-5 rounded-2xl bg-white/10 p-4">
              <div className="text-[10px] font-bold uppercase tracking-[2px] text-white/35">
                Nota
              </div>
              <p className="mt-2 text-sm leading-6 text-white/55">
                Después, al marcar un turno como atendido, ella va a cargar el
                método de pago y el monto cobrado. Esta caja se actualiza sola.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
          <div className="mb-5">
            <h2 className="font-serif text-2xl font-bold text-white">
              Movimientos
            </h2>
            <p className="mt-1 text-sm text-white/40">
              Resumen por turno y cobro.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {CASH_MOVEMENTS.map((movement) => {
              const remaining =
                movement.total - movement.deposit - movement.remainingPaid;

              return (
                <div
                  key={movement.id}
                  className="rounded-[22px] border border-white/10 bg-white/10 p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-white">
                          {movement.client}
                        </h3>

                        <StatusBadge status={movement.status} />
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/45">
                        <span>
                          {movement.service} · {formatDate(movement.date)}
                        </span>

                        <span>{movement.time}</span>

                        <span>{movement.duration} min</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:items-end">
                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <PaymentBadge method={movement.paymentMethod} />

                        <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
                          Total {money(movement.total)}
                        </div>

                        <div className="rounded-full bg-[#E535AA]/15 px-3 py-1 text-xs font-bold text-[#FAD8F0]">
                          Seña {money(movement.deposit)}
                        </div>

                        <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/65">
                          Restante cobrado {money(movement.remainingPaid)}
                        </div>

                        <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/50">
                          Falta {money(remaining)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}