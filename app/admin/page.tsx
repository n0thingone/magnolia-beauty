"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Scissors,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

const TODAY_APPOINTMENTS = [
  {
    id: 1,
    client: "Camila Pérez",
    service: "Kapping",
    time: "10:30",
    status: "Confirmado",
    deposit: 5000,
    total: 18000,
    duration: 90,
  },
  {
    id: 2,
    client: "Sofía López",
    service: "Semipermanente",
    time: "12:00",
    status: "Seña pagada",
    deposit: 5000,
    total: 15000,
    duration: 60,
  },
  {
    id: 3,
    client: "Martina Díaz",
    service: "Soft Gel",
    time: "15:30",
    status: "Pendiente",
    deposit: 0,
    total: 22000,
    duration: 90,
  },
];

const money = (n: number) => `$${n.toLocaleString("es-AR")}`;

function StatCard({
  title,
  value,
  subtitle,
  icon,
  highlight = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-[22px] border p-5 backdrop-blur-md",
        highlight
          ? "border-[#E535AA]/50 bg-[#E535AA]/20"
          : "border-white/15 bg-white/10",
      ].join(" ")}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[2px] text-white/35">
            {title}
          </div>

          <div className="mt-2 font-serif text-[28px] font-bold leading-none text-white">
            {value}
          </div>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#FAD8F0]">
          {icon}
        </div>
      </div>

      <div className="text-[12px] leading-5 text-white/45">{subtitle}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Confirmado: "border-emerald-300/30 bg-emerald-400/15 text-emerald-200",
    "Seña pagada": "border-[#E535AA]/40 bg-[#E535AA]/15 text-[#FAD8F0]",
    Pendiente: "border-yellow-300/30 bg-yellow-400/15 text-yellow-200",
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

export default function AdminPage() {
  const confirmedAppointments = TODAY_APPOINTMENTS.filter(
    (appointment) => appointment.status !== "Pendiente",
  );

  const depositsToday = TODAY_APPOINTMENTS.reduce(
    (acc, appointment) => acc + appointment.deposit,
    0,
  );

  const estimatedToday = TODAY_APPOINTMENTS.reduce(
    (acc, appointment) => acc + appointment.total,
    0,
  );

  const pendingToCollect = TODAY_APPOINTMENTS.reduce(
    (acc, appointment) => acc + (appointment.total - appointment.deposit),
    0,
  );

  const workedMinutes = confirmedAppointments.reduce(
    (acc, appointment) => acc + appointment.duration,
    0,
  );

  const workedHours = Math.floor(workedMinutes / 60);
  const workedRemainder = workedMinutes % 60;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(160deg,#2A0E1E_0%,#4A1035_60%,#2A0E1E_100%)] px-5 py-6 text-white">
      <div className="pointer-events-none absolute right-[-140px] top-[-120px] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(229,53,170,0.18)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-[-140px] left-[-120px] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(229,53,170,0.10)_0%,transparent_70%)]" />

      <div className="relative z-[1] mx-auto max-w-[1100px]">
        <header className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/85 backdrop-blur-md transition hover:bg-white/15"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-[3px] text-[#FAD8F0]">
                Magnolia Beauty
              </div>

              <h1 className="mt-1 font-serif text-[32px] font-bold leading-none text-white">
                Panel Admin
              </h1>

              <p className="mt-2 text-sm text-white/45">
                Dashboard general de turnos, señas, caja y horas trabajadas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 md:flex">
            <Link
              href="/admin/agenda"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white/80 backdrop-blur-md transition hover:bg-white/15"
            >
              <Calendar size={16} />
              Agenda
            </Link>

            <Link
              href="/admin/servicios"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white/80 backdrop-blur-md transition hover:bg-white/15"
            >
              <Settings size={16} />
              Servicios
            </Link>
          </div>
        </header>

        <section className="mb-7 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Turnos hoy"
            value={String(TODAY_APPOINTMENTS.length)}
            subtitle={`${confirmedAppointments.length} con seña o confirmados`}
            icon={<Calendar size={21} />}
            highlight
          />

          <StatCard
            title="Señas cobradas"
            value={money(depositsToday)}
            subtitle="Pagos recibidos como reserva"
            icon={<CreditCard size={21} />}
          />

          <StatCard
            title="Estimado hoy"
            value={money(estimatedToday)}
            subtitle="Total de servicios agendados"
            icon={<DollarSign size={21} />}
          />

          <StatCard
            title="Pendiente"
            value={money(pendingToCollect)}
            subtitle="Restante a cobrar en el local"
            icon={<Wallet size={21} />}
          />

          <StatCard
            title="Horas"
            value={`${workedHours}h ${workedRemainder}m`}
            subtitle="Calculado por turnos confirmados"
            icon={<Clock size={21} />}
          />
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white">
                  Turnos de hoy
                </h2>
                <p className="mt-1 text-sm text-white/40">
                  Vista rápida para confirmar, reagendar o marcar atendido.
                </p>
              </div>

              <Link
                href="/admin/agenda"
                className="rounded-full bg-[#E535AA] px-4 py-2 text-xs font-bold text-white"
              >
                Ver agenda
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {TODAY_APPOINTMENTS.map((appointment) => (
                <div
                  key={appointment.id}
                  className="rounded-[20px] border border-white/10 bg-white/10 p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E535AA]/20 text-lg">
                        💅
                      </div>

                      <div>
                        <div className="font-bold text-white">
                          {appointment.client}
                        </div>

                        <div className="mt-1 text-sm text-white/45">
                          {appointment.service} · {appointment.time} ·{" "}
                          {appointment.duration} min
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <StatusBadge status={appointment.status} />

                      <div className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-white/80">
                        {money(appointment.total)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-5">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <h2 className="font-serif text-2xl font-bold text-white">
                Accesos rápidos
              </h2>

              <div className="mt-5 grid gap-3">
                <Link
                  href="/admin/agenda"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 p-4 text-white/80 transition hover:bg-white/15"
                >
                  <span className="inline-flex items-center gap-3 font-bold">
                    <Calendar size={18} className="text-[#FAD8F0]" />
                    Agenda
                  </span>
                  <span className="text-white/35">→</span>
                </Link>

                <Link
                  href="/admin/servicios"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 p-4 text-white/80 transition hover:bg-white/15"
                >
                  <span className="inline-flex items-center gap-3 font-bold">
                    <Scissors size={18} className="text-[#FAD8F0]" />
                    Servicios
                  </span>
                  <span className="text-white/35">→</span>
                </Link>

                <Link
                  href="/admin/caja"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 p-4 text-white/80 transition hover:bg-white/15"
                >
                  <span className="inline-flex items-center gap-3 font-bold">
                    <DollarSign size={18} className="text-[#FAD8F0]" />
                    Caja
                  </span>
                  <span className="text-white/35">→</span>
                </Link>

                <Link
                  href="/admin/clientas"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 p-4 text-white/80 transition hover:bg-white/15"
                >
                  <span className="inline-flex items-center gap-3 font-bold">
                    <Users size={18} className="text-[#FAD8F0]" />
                    Clientas
                  </span>
                  <span className="text-white/35">→</span>
                </Link>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-[#E535AA]/15 p-5 backdrop-blur-md">
              <div className="text-[11px] font-bold uppercase tracking-[3px] text-[#FAD8F0]">
                Próximo
              </div>

              <h3 className="mt-2 font-serif text-2xl font-bold text-white">
                Soft Gel · 15:30
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/55">
                Martina Díaz todavía figura pendiente. Cuando conectemos Mercado
                Pago, este estado cambia solo con el webhook.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}