"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Lock,
  Plus,
  Save,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";

const WORK_DAYS = [
  {
    id: 1,
    day: "Lunes",
    active: true,
    slots: ["10:30", "12:00", "14:00", "15:30", "17:00"],
  },
  {
    id: 2,
    day: "Martes",
    active: true,
    slots: ["10:30", "12:00", "14:00", "15:30", "17:00"],
  },
  {
    id: 3,
    day: "Miércoles",
    active: true,
    slots: ["10:30", "12:00", "14:00", "15:30", "17:00"],
  },
  {
    id: 4,
    day: "Jueves",
    active: true,
    slots: ["10:30", "12:00", "14:00", "15:30", "17:00"],
  },
  {
    id: 5,
    day: "Viernes",
    active: true,
    slots: ["10:30", "12:00", "14:00", "15:30", "17:00"],
  },
  {
    id: 6,
    day: "Sábado",
    active: false,
    slots: [],
  },
  {
    id: 7,
    day: "Domingo",
    active: false,
    slots: [],
  },
];

const BLOCKED_DATES = [
  {
    id: 1,
    date: "2026-06-21",
    reason: "Día personal",
    type: "Día completo",
  },
  {
    id: 2,
    date: "2026-06-24",
    reason: "Turno médico",
    type: "14:00 a 15:30",
  },
];

const DEFAULT_SLOTS = ["10:30", "12:00", "14:00", "15:30", "17:00"];

const formatDate = (date: string) => date.split("-").reverse().join("/");

function DayCard({
  day,
}: {
  day: {
    id: number;
    day: string;
    active: boolean;
    slots: string[];
  };
}) {
  return (
    <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-[24px] font-bold leading-none text-white">
              {day.day}
            </h2>

            {day.active ? (
              <span className="rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-[11px] font-bold text-emerald-200">
                Activo
              </span>
            ) : (
              <span className="rounded-full border border-red-300/30 bg-red-400/15 px-3 py-1 text-[11px] font-bold text-red-200">
                Cerrado
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-white/45">
            {day.active
              ? `${day.slots.length} horarios disponibles`
              : "No se muestran turnos este día"}
          </p>
        </div>

        <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/75 transition hover:bg-white/15">
          {day.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
        </button>
      </div>

      {day.active ? (
        <div className="flex flex-wrap gap-2">
          {day.slots.map((slot) => (
            <div
              key={slot}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white/75"
            >
              <Clock size={13} />
              {slot}
              <button className="text-white/35">
                <X size={12} />
              </button>
            </div>
          ))}

          <button className="inline-flex items-center gap-2 rounded-full border border-[#E535AA]/40 bg-[#E535AA]/15 px-3 py-2 text-xs font-bold text-[#FAD8F0]">
            <Plus size={13} />
            Agregar
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white/40">
          Este día está cerrado. Al activarlo, puede usar los horarios base.
        </div>
      )}
    </div>
  );
}

export default function HorariosPage() {
  const activeDays = WORK_DAYS.filter((day) => day.active).length;

  const totalSlots = WORK_DAYS.reduce(
    (acc, day) => acc + day.slots.length,
    0,
  );

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
                Horarios
              </h1>

              <p className="mt-2 text-sm text-white/45">
                Días laborales, turnos disponibles y bloqueos.
              </p>
            </div>
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E535AA] px-4 py-3 text-sm font-bold text-white shadow-[0_6px_24px_rgba(229,53,170,0.35)]">
            <Save size={16} />
            Guardar
          </button>
        </header>

        <section className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-[18px] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/35">
              Días activos
            </div>
            <div className="mt-2 font-serif text-[24px] font-bold leading-none">
              {activeDays}
            </div>
          </div>

          <div className="rounded-[18px] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/35">
              Horarios
            </div>
            <div className="mt-2 font-serif text-[24px] font-bold leading-none text-[#FAD8F0]">
              {totalSlots}
            </div>
          </div>

          <div className="rounded-[18px] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/35">
              Bloqueos
            </div>
            <div className="mt-2 font-serif text-[24px] font-bold leading-none text-yellow-200">
              {BLOCKED_DATES.length}
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-[22px] border border-[#E535AA]/35 bg-[#E535AA]/15 p-4 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <Check size={18} className="mt-0.5 shrink-0 text-[#FAD8F0]" />

            <div>
              <div className="text-sm font-bold text-white">
                Horarios base
              </div>

              <p className="mt-1 text-sm leading-6 text-white/50">
                Los horarios que ella te pasó son:{" "}
                <span className="font-bold text-[#FAD8F0]">
                  {DEFAULT_SLOTS.join(" · ")}
                </span>
                . Después los va a poder editar desde acá sin tocar código.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-bold text-white">
                Bloqueos
              </h2>
              <p className="mt-1 text-sm text-white/40">
                Días completos, vacaciones o horarios puntuales.
              </p>
            </div>

            <button className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold text-white/75">
              <Plus size={14} />
              Bloquear
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {BLOCKED_DATES.map((blocked) => (
              <div
                key={blocked.id}
                className="rounded-[20px] border border-white/10 bg-white/10 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-yellow-400/15 text-yellow-200">
                      <Lock size={18} />
                    </div>

                    <div>
                      <div className="font-bold text-white">
                        {formatDate(blocked.date)}
                      </div>

                      <div className="mt-1 text-sm text-white/45">
                        {blocked.type} · {blocked.reason}
                      </div>
                    </div>
                  </div>

                  <button className="rounded-xl border border-red-300/30 bg-red-400/15 px-3 py-2 text-xs font-bold text-red-200">
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          {WORK_DAYS.map((day) => (
            <DayCard key={day.id} day={day} />
          ))}
        </section>

        <section className="mt-4 rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <Calendar size={18} className="mt-0.5 shrink-0 text-[#FAD8F0]" />

            <div>
              <div className="text-sm font-bold text-white">
                Próxima conexión real
              </div>

              <p className="mt-1 text-sm leading-6 text-white/50">
                Cuando conectemos Supabase, esta pantalla guarda reglas de
                disponibilidad. La reserva va a leer estos horarios y va a
                ocultar automáticamente los turnos ya ocupados o bloqueados.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}