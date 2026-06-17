"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit,
  MessageSquare,
  Plus,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type AppointmentStatus =
  | "pending_payment"
  | "deposit_paid"
  | "confirmed"
  | "rescheduled"
  | "completed"
  | "cancelled"
  | "no_show";

type Appointment = {
  id: string;
  customer_id: string;
  service_id: string | null;

  service_name_snapshot: string;
  service_description_snapshot: string | null;
  service_emoji_snapshot: string | null;

  appointment_date: string;
  start_time: string;
  end_time: string | null;

  status: AppointmentStatus;

  total_price_snapshot: number;
  deposit_amount_snapshot: number;
  deposit_paid: number;
  remaining_amount: number;
  remaining_paid: number;
  remaining_payment_method: string | null;

  customer_notes: string | null;
  admin_notes: string | null;

  created_at: string;

  customers: {
    first_name: string;
    last_name: string;
    phone_raw: string;
    phone_normalized: string;
    instagram: string | null;
  } | null;
};

const money = (n: number) => `$${n.toLocaleString("es-AR")}`;

const formatDate = (date: string) => date.split("-").reverse().join("/");

const formatTime = (time: string) => time.slice(0, 5);

const statusLabel: Record<AppointmentStatus, string> = {
  pending_payment: "Pendiente pago",
  deposit_paid: "Seña pagada",
  confirmed: "Confirmado",
  rescheduled: "Reagendado",
  completed: "Atendido",
  cancelled: "Cancelado",
  no_show: "No vino",
};

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const styles: Record<AppointmentStatus, string> = {
    pending_payment:
      "border-yellow-300/30 bg-yellow-400/15 text-yellow-200",
    deposit_paid: "border-[#E535AA]/40 bg-[#E535AA]/15 text-[#FAD8F0]",
    confirmed: "border-emerald-300/30 bg-emerald-400/15 text-emerald-200",
    rescheduled: "border-purple-300/30 bg-purple-400/15 text-purple-200",
    completed: "border-blue-300/30 bg-blue-400/15 text-blue-200",
    cancelled: "border-red-300/30 bg-red-400/15 text-red-200",
    no_show: "border-orange-300/30 bg-orange-400/15 text-orange-200",
  };

  return (
    <span
      className={[
        "rounded-full border px-3 py-1 text-[11px] font-bold",
        styles[status] || "border-white/15 bg-white/10 text-white/60",
      ].join(" ")}
    >
      {statusLabel[status] || status}
    </span>
  );
}

function MetricCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-[18px] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
      <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/35">
        {label}
      </div>

      <div
        className={[
          "mt-2 font-serif text-[24px] font-bold leading-none",
          highlight ? "text-[#FAD8F0]" : "text-white",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "today" | "confirmed" | "pending"
  >("all");

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      setLoadError(null);

      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
          *,
          customers (
            first_name,
            last_name,
            phone_raw,
            phone_normalized,
            instagram
          )
        `,
        )
        .order("appointment_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        console.error("Error loading appointments:", error);
        setLoadError("No pudimos cargar los turnos.");
        setLoading(false);
        return;
      }

      setAppointments((data || []) as Appointment[]);
      setLoading(false);
    };

    loadAppointments();
  }, []);

  const today = "2026-06-18";

  const filteredAppointments = useMemo(() => {
    if (filter === "today") {
      return appointments.filter(
        (appointment) => appointment.appointment_date === today,
      );
    }

    if (filter === "confirmed") {
      return appointments.filter((appointment) =>
        ["deposit_paid", "confirmed", "rescheduled"].includes(
          appointment.status,
        ),
      );
    }

    if (filter === "pending") {
      return appointments.filter(
        (appointment) => appointment.status === "pending_payment",
      );
    }

    return appointments;
  }, [appointments, filter]);

  const totalDeposits = filteredAppointments.reduce(
    (acc, item) => acc + (item.deposit_paid || 0),
    0,
  );

  const totalEstimated = filteredAppointments.reduce(
    (acc, item) => acc + (item.total_price_snapshot || 0),
    0,
  );

  const totalMinutes = filteredAppointments.reduce((acc, item) => {
    if (!item.start_time || !item.end_time) return acc;

    const [startHours, startMinutes] = item.start_time.split(":").map(Number);
    const [endHours, endMinutes] = item.end_time.split(":").map(Number);

    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;

    return acc + Math.max(endTotal - startTotal, 0);
  }, 0);

  const totalHours = Math.floor(totalMinutes / 60);
  const totalRemainder = totalMinutes % 60;

  const handleMarkCompleted = async (appointment: Appointment) => {
    const remaining =
      appointment.total_price_snapshot -
      appointment.deposit_paid -
      appointment.remaining_paid;

    const { error } = await supabase
      .from("appointments")
      .update({
        status: "completed",
        remaining_paid: appointment.remaining_paid + Math.max(remaining, 0),
        remaining_payment_method:
          appointment.remaining_payment_method || "manual",
      })
      .eq("id", appointment.id);

    if (error) {
      console.error("Error completing appointment:", error);
      alert("No pudimos marcar el turno como atendido.");
      return;
    }

    setAppointments((current) =>
      current.map((item) =>
        item.id === appointment.id
          ? {
              ...item,
              status: "completed",
              remaining_paid:
                appointment.remaining_paid + Math.max(remaining, 0),
              remaining_payment_method:
                appointment.remaining_payment_method || "manual",
            }
          : item,
      ),
    );
  };

  const handleCancel = async (appointment: Appointment) => {
    const ok = confirm("¿Seguro querés cancelar este turno?");
    if (!ok) return;

    const { error } = await supabase
      .from("appointments")
      .update({
        status: "cancelled",
      })
      .eq("id", appointment.id);

    if (error) {
      console.error("Error cancelling appointment:", error);
      alert("No pudimos cancelar el turno.");
      return;
    }

    setAppointments((current) =>
      current.map((item) =>
        item.id === appointment.id ? { ...item, status: "cancelled" } : item,
      ),
    );
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(160deg,#2A0E1E_0%,#4A1035_60%,#2A0E1E_100%)] px-5 py-6 text-white">
      <div className="pointer-events-none absolute right-[-140px] top-[-120px] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(229,53,170,0.18)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-[-120px] left-[-120px] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(229,53,170,0.10)_0%,transparent_70%)]" />

      <div className="relative z-[1] mx-auto max-w-[1000px]">
        <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
                Agenda
              </h1>

              <p className="mt-2 text-sm text-white/45">
                Turnos reales leídos desde Supabase.
              </p>
            </div>
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E535AA] px-4 py-3 text-sm font-bold text-white shadow-[0_6px_24px_rgba(229,53,170,0.35)]">
            <Plus size={16} />
            Nuevo turno
          </button>
        </header>

        <button
          onClick={() => setShowSummary((current) => !current)}
          className="mb-3 flex w-full items-center justify-between rounded-[18px] border border-white/15 bg-white/10 px-4 py-3 text-left backdrop-blur-md transition hover:bg-white/15"
        >
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[2px] text-[#FAD8F0]">
              Resumen
            </div>
            <div className="mt-1 text-sm text-white/45">
              {showSummary ? "Ocultar métricas" : "Ver turnos, señas y horas"}
            </div>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/80">
            {showSummary ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>

        {showSummary && (
          <section className="mb-4 grid grid-cols-2 gap-3">
            <MetricCard label="Turnos" value={filteredAppointments.length} />

            <MetricCard label="Señas" value={money(totalDeposits)} highlight />

            <MetricCard label="Estimado" value={money(totalEstimated)} />

            <MetricCard
              label="Horas"
              value={`${totalHours}h ${
                totalRemainder > 0 ? `${totalRemainder}m` : ""
              }`}
            />
          </section>
        )}

        <section className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold">Listado</h2>
              <p className="mt-1 text-sm text-white/40">
                Cada reserva creada desde /reservar aparece acá.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "Todos" },
                { key: "today", label: "Hoy" },
                { key: "confirmed", label: "Confirmados" },
                { key: "pending", label: "Pendientes" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() =>
                    setFilter(
                      item.key as "all" | "today" | "confirmed" | "pending",
                    )
                  }
                  className={[
                    "rounded-full border px-4 py-2 text-xs font-bold transition hover:bg-white/15",
                    filter === item.key
                      ? "border-[#E535AA]/50 bg-[#E535AA]/20 text-[#FAD8F0]"
                      : "border-white/15 bg-white/10 text-white/70",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="rounded-[22px] border border-white/10 bg-white/10 p-6 text-center text-sm text-white/55">
              Cargando turnos...
            </div>
          )}

          {loadError && (
            <div className="rounded-[22px] border border-red-300/30 bg-red-400/15 p-6 text-center text-sm text-red-100">
              {loadError}
            </div>
          )}

          {!loading && !loadError && filteredAppointments.length === 0 && (
            <div className="rounded-[22px] border border-yellow-300/30 bg-yellow-400/15 p-6 text-center text-sm text-yellow-100">
              No hay turnos para mostrar.
            </div>
          )}

          {!loading && !loadError && filteredAppointments.length > 0 && (
            <div className="flex flex-col gap-3">
              {filteredAppointments.map((appointment) => {
                const customerName = appointment.customers
                  ? `${appointment.customers.first_name} ${appointment.customers.last_name}`
                  : "Clienta sin datos";

                const phone = appointment.customers?.phone_raw || "-";

                const remaining =
                  appointment.total_price_snapshot -
                  appointment.deposit_paid -
                  appointment.remaining_paid;

                const whatsappHref = appointment.customers?.phone_normalized
                  ? `https://wa.me/${appointment.customers.phone_normalized}`
                  : "#";

                return (
                  <div
                    key={appointment.id}
                    className="rounded-[22px] border border-white/10 bg-white/10 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E535AA]/20 text-lg">
                          {appointment.service_emoji_snapshot || "💅"}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-white">
                              {customerName}
                            </h3>

                            <StatusBadge status={appointment.status} />
                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/45">
                            <span className="inline-flex items-center gap-1">
                              <Calendar size={13} />
                              {formatDate(appointment.appointment_date)}
                            </span>

                            <span className="inline-flex items-center gap-1">
                              <Clock size={13} />
                              {formatTime(appointment.start_time)}
                            </span>

                            <span>{appointment.service_name_snapshot}</span>
                          </div>

                          <div className="mt-2 text-sm text-white/45">
                            WhatsApp: {phone}
                          </div>

                          {appointment.customer_notes && (
                            <div className="mt-2 rounded-xl bg-white/10 px-3 py-2 text-xs leading-5 text-white/55">
                              Nota: {appointment.customer_notes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 lg:items-end">
                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
                            Total {money(appointment.total_price_snapshot)}
                          </div>

                          <div className="rounded-full bg-[#E535AA]/15 px-3 py-1 text-xs font-bold text-[#FAD8F0]">
                            Seña {money(appointment.deposit_paid)}
                          </div>

                          <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/60">
                            Resta {money(Math.max(remaining, 0))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
                          <button
                            onClick={() => handleMarkCompleted(appointment)}
                            disabled={appointment.status === "completed"}
                            className={[
                              "inline-flex items-center justify-center gap-1 rounded-xl border px-3 py-2 text-xs font-bold",
                              appointment.status === "completed"
                                ? "cursor-not-allowed border-blue-300/30 bg-blue-400/15 text-blue-200"
                                : "border-emerald-300/30 bg-emerald-400/15 text-emerald-200",
                            ].join(" ")}
                          >
                            <Check size={13} />
                            Atendido
                          </button>

                          <button className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white/70">
                            <Edit size={13} />
                            Reagendar
                          </button>

                          <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white/70"
                          >
                            <MessageSquare size={13} />
                            WhatsApp
                          </a>

                          <button
                            onClick={() => handleCancel(appointment)}
                            disabled={appointment.status === "cancelled"}
                            className={[
                              "inline-flex items-center justify-center gap-1 rounded-xl border px-3 py-2 text-xs font-bold",
                              appointment.status === "cancelled"
                                ? "cursor-not-allowed border-red-300/20 bg-red-400/10 text-red-200/50"
                                : "border-red-300/30 bg-red-400/15 text-red-200",
                            ].join(" ")}
                          >
                            <X size={13} />
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}