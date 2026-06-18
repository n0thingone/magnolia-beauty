"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
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
  MessageCircle,
  CheckCircle,
  XCircle,
  BadgeCheck,
  Sparkles,
} from "lucide-react";

type Customer = {
  first_name: string | null;
  last_name: string | null;
  phone_raw: string | null;
  instagram: string | null;
};

type Appointment = {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string | null;
  status: string;
  service_name_snapshot: string | null;
  service_emoji_snapshot: string | null;
  total_price_snapshot: number | null;
  deposit_amount_snapshot: number | null;
  deposit_paid: number | null;
  remaining_amount: number | null;
  customer_notes: string | null;
  customers: Customer | Customer[] | null;
};

const money = (n: number) => `$${n.toLocaleString("es-AR")}`;

const formatDate = (date: string) => date.split("-").reverse().join("/");

const formatTime = (time: string) => time.slice(0, 5);

const todayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getCustomer = (appointment: Appointment) => {
  if (Array.isArray(appointment.customers)) {
    return appointment.customers[0] || null;
  }

  return appointment.customers || null;
};

const getCustomerName = (appointment: Appointment) => {
  const customer = getCustomer(appointment);

  if (!customer) return "Clienta";

  const firstName = customer.first_name || "";
  const lastName = customer.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || "Clienta";
};

const normalizeWhatsapp = (phone: string) => {
  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.startsWith("54")) return digits;

  return `549${digits}`;
};

const openWhatsapp = (phone: string | null | undefined, message: string) => {
  if (!phone) {
    alert("Esta clienta no tiene WhatsApp cargado.");
    return;
  }

  const normalizedPhone = normalizeWhatsapp(phone);
  const url = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(
    message,
  )}`;

  window.open(url, "_blank", "noopener,noreferrer");
};

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending_payment: "Pendiente de pago",
    paid: "Seña pagada",
    confirmed: "Confirmado",
    completed: "Atendido",
    cancelled: "Cancelado",
    expired: "Expirado",
  };

  return labels[status] || status;
};

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
    pending_payment: "border-yellow-300/30 bg-yellow-400/15 text-yellow-200",
    paid: "border-[#E535AA]/40 bg-[#E535AA]/15 text-[#FAD8F0]",
    confirmed: "border-emerald-300/30 bg-emerald-400/15 text-emerald-200",
    completed: "border-sky-300/30 bg-sky-400/15 text-sky-200",
    cancelled: "border-red-300/30 bg-red-400/15 text-red-200",
    expired: "border-white/15 bg-white/10 text-white/50",
  };

  return (
    <span
      className={[
        "rounded-full border px-3 py-1 text-[11px] font-bold",
        styles[status] || "border-white/15 bg-white/10 text-white/60",
      ].join(" ")}
    >
      {statusLabel(status)}
    </span>
  );
}

export default function AdminPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const today = todayDate();

  const loadAppointments = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        id,
        appointment_date,
        start_time,
        end_time,
        status,
        service_name_snapshot,
        service_emoji_snapshot,
        total_price_snapshot,
        deposit_amount_snapshot,
        deposit_paid,
        remaining_amount,
        customer_notes,
        customers (
          first_name,
          last_name,
          phone_raw,
          instagram
        )
      `,
      )
      .eq("appointment_date", today)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Error loading appointments:", error);
      alert("No pudimos cargar los turnos.");
      setLoading(false);
      return;
    }

    setAppointments((data || []) as Appointment[]);
    setLoading(false);
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const activeAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          appointment.status !== "cancelled" && appointment.status !== "expired",
      ),
    [appointments],
  );

  const confirmedAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          appointment.status === "confirmed" ||
          appointment.status === "completed",
      ),
    [appointments],
  );

  const depositsToday = useMemo(
    () =>
      appointments.reduce((acc, appointment) => {
        const paid = Number(appointment.deposit_paid || 0);
        return acc + paid;
      }, 0),
    [appointments],
  );

  const estimatedToday = useMemo(
    () =>
      activeAppointments.reduce((acc, appointment) => {
        return acc + Number(appointment.total_price_snapshot || 0);
      }, 0),
    [activeAppointments],
  );

  const pendingToCollect = useMemo(
    () =>
      activeAppointments.reduce((acc, appointment) => {
        const total = Number(appointment.total_price_snapshot || 0);
        const deposit = Number(appointment.deposit_paid || 0);
        return acc + Math.max(total - deposit, 0);
      }, 0),
    [activeAppointments],
  );

  const workedMinutes = useMemo(
    () =>
      confirmedAppointments.reduce((acc, appointment) => {
        if (!appointment.start_time || !appointment.end_time) return acc;

        const [startHours, startMinutes] = appointment.start_time
          .slice(0, 5)
          .split(":")
          .map(Number);

        const [endHours, endMinutes] = appointment.end_time
          .slice(0, 5)
          .split(":")
          .map(Number);

        const startTotal = startHours * 60 + startMinutes;
        const endTotal = endHours * 60 + endMinutes;

        return acc + Math.max(endTotal - startTotal, 0);
      }, 0),
    [confirmedAppointments],
  );

  const workedHours = Math.floor(workedMinutes / 60);
  const workedRemainder = workedMinutes % 60;

  const updateAppointmentStatus = async (
    appointment: Appointment,
    status: string,
  ) => {
    setActionLoadingId(appointment.id);

    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", appointment.id);

    if (error) {
      console.error("Error updating appointment:", error);
      alert("No se pudo actualizar el turno.");
      setActionLoadingId(null);
      return false;
    }

    await loadAppointments();
    setActionLoadingId(null);
    return true;
  };

  const confirmAppointment = async (appointment: Appointment) => {
    const ok = await updateAppointmentStatus(appointment, "confirmed");

    if (!ok) return;

    const customer = getCustomer(appointment);
    const customerName = getCustomerName(appointment);
    const serviceEmoji = appointment.service_emoji_snapshot || "💅";
    const serviceName = appointment.service_name_snapshot || "Turno";

    const message = `Hola ${customerName}! 🌸 Te confirmamos tu turno en Magnolia Beauty ✅

Servicio: ${serviceEmoji} ${serviceName}
Día: ${formatDate(appointment.appointment_date)}
Horario: ${formatTime(appointment.start_time)}

Tu seña ya figura pagada.
Te esperamos 💕`;

    openWhatsapp(customer?.phone_raw, message);
  };

  const cancelAppointment = async (appointment: Appointment) => {
    const confirmed = confirm("¿Seguro que querés cancelar este turno?");

    if (!confirmed) return;

    const ok = await updateAppointmentStatus(appointment, "cancelled");

    if (!ok) return;

    const customer = getCustomer(appointment);
    const customerName = getCustomerName(appointment);
    const serviceEmoji = appointment.service_emoji_snapshot || "💅";
    const serviceName = appointment.service_name_snapshot || "Turno";

    const message = `Hola ${customerName}! 🌸 Te escribimos de Magnolia Beauty.

Tenemos que cancelar/reprogramar tu turno:

Servicio: ${serviceEmoji} ${serviceName}
Día: ${formatDate(appointment.appointment_date)}
Horario: ${formatTime(appointment.start_time)}

Escribinos por acá y coordinamos un nuevo horario 💕`;

    openWhatsapp(customer?.phone_raw, message);
  };

  const completeAppointment = async (appointment: Appointment) => {
    const confirmed = confirm("¿Marcar este turno como atendido?");

    if (!confirmed) return;

    await updateAppointmentStatus(appointment, "completed");
  };

  const nextAppointment = activeAppointments.find(
    (appointment) =>
      appointment.status === "paid" ||
      appointment.status === "confirmed" ||
      appointment.status === "pending_payment",
  );

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
                Dashboard real de turnos, señas, caja y horas trabajadas.
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

            <Link
              href="/admin/historias"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E535AA]/35 bg-[#E535AA]/15 px-4 py-3 text-sm font-bold text-[#FAD8F0] backdrop-blur-md transition hover:bg-[#E535AA]/25"
            >
              <Sparkles size={16} />
              Historias
            </Link>
          </div>
        </header>

        <section className="mb-7 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Turnos hoy"
            value={String(activeAppointments.length)}
            subtitle={`${appointments.length} registros totales del día`}
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
            subtitle="Total de servicios activos agendados"
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
            subtitle="Calculado por confirmados/atendidos"
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
                  Confirmá, cancelá o marcá como atendido.
                </p>
              </div>

              <Link
                href="/admin/agenda"
                className="rounded-full bg-[#E535AA] px-4 py-2 text-xs font-bold text-white"
              >
                Ver agenda
              </Link>
            </div>

            {loading ? (
              <div className="rounded-[20px] border border-white/10 bg-white/10 p-6 text-center text-sm text-white/50">
                Cargando turnos...
              </div>
            ) : appointments.length === 0 ? (
              <div className="rounded-[20px] border border-white/10 bg-white/10 p-6 text-center text-sm text-white/50">
                No hay turnos cargados para hoy.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {appointments.map((appointment) => {
                  const customer = getCustomer(appointment);
                  const customerName = getCustomerName(appointment);
                  const total = Number(appointment.total_price_snapshot || 0);
                  const depositPaid = Number(appointment.deposit_paid || 0);
                  const remaining = Math.max(total - depositPaid, 0);
                  const isLoading = actionLoadingId === appointment.id;

                  return (
                    <div
                      key={appointment.id}
                      className="rounded-[20px] border border-white/10 bg-white/10 p-4"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E535AA]/20 text-lg">
                              {appointment.service_emoji_snapshot || "💅"}
                            </div>

                            <div>
                              <div className="font-bold text-white">
                                {customerName}
                              </div>

                              <div className="mt-1 text-sm text-white/45">
                                {appointment.service_name_snapshot || "Turno"} ·{" "}
                                {formatTime(appointment.start_time)}
                              </div>

                              <div className="mt-1 text-xs text-white/35">
                                WhatsApp: {customer?.phone_raw || "-"}
                                {customer?.instagram
                                  ? ` · Instagram: ${customer.instagram}`
                                  : ""}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                            <StatusBadge status={appointment.status} />

                            <div className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-bold text-white/80">
                              {money(total)}
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-2 text-xs text-white/50 sm:grid-cols-3">
                          <div className="rounded-2xl bg-white/10 p-3">
                            <span className="font-bold text-white/35">
                              Seña:
                            </span>{" "}
                            {money(depositPaid)}
                          </div>

                          <div className="rounded-2xl bg-white/10 p-3">
                            <span className="font-bold text-white/35">
                              Resta:
                            </span>{" "}
                            {money(remaining)}
                          </div>

                          <div className="rounded-2xl bg-white/10 p-3">
                            <span className="font-bold text-white/35">
                              Fecha:
                            </span>{" "}
                            {formatDate(appointment.appointment_date)}
                          </div>
                        </div>

                        {appointment.customer_notes && (
                          <div className="rounded-2xl bg-white/10 p-3 text-sm leading-6 text-white/60">
                            <span className="font-bold text-white/35">
                              Nota:
                            </span>{" "}
                            {appointment.customer_notes}
                          </div>
                        )}

                        <div className="grid gap-2 sm:grid-cols-3">
                          {appointment.status === "paid" && (
                            <button
                              disabled={isLoading}
                              onClick={() => confirmAppointment(appointment)}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-60"
                            >
                              <BadgeCheck size={16} />
                              Confirmar + WhatsApp
                            </button>
                          )}

                          {appointment.status === "confirmed" && (
                            <button
                              disabled={isLoading}
                              onClick={() => completeAppointment(appointment)}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-600 disabled:cursor-wait disabled:opacity-60"
                            >
                              <CheckCircle size={16} />
                              Marcar atendido
                            </button>
                          )}

                          {["paid", "confirmed", "pending_payment"].includes(
                            appointment.status,
                          ) && (
                            <button
                              disabled={isLoading}
                              onClick={() => cancelAppointment(appointment)}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-wait disabled:opacity-60"
                            >
                              <XCircle size={16} />
                              Cancelar + WhatsApp
                            </button>
                          )}

                          {customer?.phone_raw && (
                            <button
                              disabled={isLoading}
                              onClick={() => {
                                const message = `Hola ${customerName}! 🌸 Te escribimos de Magnolia Beauty por tu turno.

Servicio: ${
                                  appointment.service_emoji_snapshot || "💅"
                                } ${appointment.service_name_snapshot || "Turno"}
Día: ${formatDate(appointment.appointment_date)}
Horario: ${formatTime(appointment.start_time)}

Cualquier cosa escribinos por acá 💕`;

                                openWhatsapp(customer.phone_raw, message);
                              }}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white/80 transition hover:bg-white/15 disabled:cursor-wait disabled:opacity-60"
                            >
                              <MessageCircle size={16} />
                              WhatsApp
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                  href="/admin/historias"
                  className="flex items-center justify-between rounded-2xl border border-[#E535AA]/30 bg-[#E535AA]/15 p-4 text-[#FAD8F0] transition hover:bg-[#E535AA]/25"
                >
                  <span className="inline-flex items-center gap-3 font-bold">
                    <Sparkles size={18} className="text-[#FAD8F0]" />
                    Historias
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

              {nextAppointment ? (
                <>
                  <h3 className="mt-2 font-serif text-2xl font-bold text-white">
                    {nextAppointment.service_name_snapshot || "Turno"} ·{" "}
                    {formatTime(nextAppointment.start_time)}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/55">
                    {getCustomerName(nextAppointment)} figura como{" "}
                    <strong>{statusLabel(nextAppointment.status)}</strong>.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="mt-2 font-serif text-2xl font-bold text-white">
                    Sin próximos turnos
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/55">
                    Todavía no hay turnos activos cargados para hoy.
                  </p>
                </>
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}