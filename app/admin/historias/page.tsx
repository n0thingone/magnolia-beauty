"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  CalendarDays,
  Copy,
  Download,
  Share2,
  Sparkles,
} from "lucide-react";

const ALL_SLOTS = ["10:30", "12:00", "14:00", "15:30", "17:00"];

const BLOCKING_STATUSES = ["pending_payment", "paid", "confirmed"];

const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

type RangeMode = "today" | "tomorrow" | "week";

type Appointment = {
  appointment_date: string;
  start_time: string;
  status: string;
};

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseLocalDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDayTitle(date: string) {
  const parsed = parseLocalDate(date);
  const dayName = DAYS_ES[parsed.getDay()].toUpperCase();
  const dayNumber = String(parsed.getDate()).padStart(2, "0");

  return `${dayName} ${dayNumber}`;
}

function formatLongDate(date: string) {
  const parsed = parseLocalDate(date);
  return `${parsed.getDate()} de ${MONTHS_ES[parsed.getMonth()]}`;
}

function getNextBusinessDays(start: Date, amount: number) {
  const days: string[] = [];
  let cursor = new Date(start);

  while (days.length < amount) {
    if (cursor.getDay() !== 0) {
      days.push(toDateInputValue(cursor));
    }

    cursor = addDays(cursor, 1);
  }

  return days;
}

function getDatesForMode(mode: RangeMode) {
  const today = new Date();

  if (mode === "today") {
    return [toDateInputValue(today)];
  }

  if (mode === "tomorrow") {
    const tomorrow = addDays(today, 1);
    return tomorrow.getDay() === 0
      ? [toDateInputValue(addDays(tomorrow, 1))]
      : [toDateInputValue(tomorrow)];
  }

  return getNextBusinessDays(today, 3);
}

function getStorySubtitle(mode: RangeMode, dates: string[]) {
  if (mode === "today") return `Hoy ${formatLongDate(dates[0])}`;
  if (mode === "tomorrow") return `Mañana ${formatLongDate(dates[0])}`;

  return `Semana del ${formatLongDate(dates[0])} al ${formatLongDate(
    dates[dates.length - 1],
  )}`;
}

function groupOccupiedByDate(appointments: Appointment[]) {
  return appointments.reduce<Record<string, string[]>>((acc, appointment) => {
    const date = appointment.appointment_date;
    const time = String(appointment.start_time).slice(0, 5);

    if (!acc[date]) acc[date] = [];
    if (!acc[date].includes(time)) acc[date].push(time);

    return acc;
  }, {});
}

export default function AdminHistoriasPage() {
  const storyRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<RangeMode>("week");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const dates = useMemo(() => getDatesForMode(mode), [mode]);

  const occupiedByDate = useMemo(
    () => groupOccupiedByDate(appointments),
    [appointments],
  );

  const subtitle = useMemo(() => getStorySubtitle(mode, dates), [mode, dates]);

  const instagramText = useMemo(() => {
    const lines = [
      "MAGNOLIA BEAUTY 🌸",
      "",
      "Turnos disponibles 💅",
      subtitle,
      "",
    ];

    dates.forEach((date) => {
      lines.push(`${formatDayTitle(date)}`);

      ALL_SLOTS.forEach((slot) => {
        const occupied = (occupiedByDate[date] || []).includes(slot);
        lines.push(`${slot} ${occupied ? "❌ Ocupado" : "✅ Disponible"}`);
      });

      lines.push("");
    });

    lines.push("Reservá tu turno por la app ✨");
    lines.push("magnolia-beauty-iota.vercel.app");

    return lines.join("\n");
  }, [dates, occupiedByDate, subtitle]);

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);

      const from = dates[0];
      const to = dates[dates.length - 1];

      const { data, error } = await supabase
        .from("appointments")
        .select("appointment_date, start_time, status")
        .gte("appointment_date", from)
        .lte("appointment_date", to)
        .in("status", BLOCKING_STATUSES);

      if (error) {
        console.error("Error loading appointments:", error);
        alert("No pudimos cargar los turnos para la historia.");
        setAppointments([]);
        setLoading(false);
        return;
      }

      setAppointments((data || []) as Appointment[]);
      setLoading(false);
    };

    loadAppointments();
  }, [dates]);

  const createCanvas = async () => {
    if (!storyRef.current) return null;

    return html2canvas(storyRef.current, {
      backgroundColor: null,
      scale: 3,
      useCORS: true,
    });
  };

  const downloadStory = async () => {
    setSaving(true);

    const canvas = await createCanvas();

    if (!canvas) {
      setSaving(false);
      return;
    }

    const link = document.createElement("a");
    link.download = `magnolia-turnos-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    setSaving(false);
  };

  const shareStory = async () => {
    setSaving(true);

    const canvas = await createCanvas();

    if (!canvas) {
      setSaving(false);
      return;
    }

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setSaving(false);
        return;
      }

      const file = new File([blob], `magnolia-turnos-${Date.now()}.png`, {
        type: "image/png",
      });

      const nav = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean;
      };

      if (navigator.share && (!nav.canShare || nav.canShare({ files: [file] }))) {
        try {
          await navigator.share({
            title: "Turnos disponibles Magnolia Beauty",
            text: "Turnos disponibles Magnolia Beauty 🌸",
            files: [file],
          });
        } catch (error) {
          console.error("Share cancelled/error:", error);
        }
      } else {
        const link = document.createElement("a");
        link.download = file.name;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      }

      setSaving(false);
    }, "image/png");
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(instagramText);
    alert("Texto copiado para Instagram ✅");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(160deg,#2A0E1E_0%,#4A1035_60%,#2A0E1E_100%)] px-5 py-6 text-white">
      <div className="pointer-events-none absolute right-[-140px] top-[-120px] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(229,53,170,0.18)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-[-140px] left-[-120px] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(229,53,170,0.10)_0%,transparent_70%)]" />

      <div className="relative z-[1] mx-auto max-w-[1100px]">
        <header className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/85 backdrop-blur-md transition hover:bg-white/15"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-[3px] text-[#FAD8F0]">
                Magnolia Beauty
              </div>

              <h1 className="mt-1 font-serif text-[32px] font-bold leading-none text-white">
                Historias de Turnos ✨
              </h1>

              <p className="mt-2 text-sm text-white/45">
                Generá una historia lista para Instagram con horarios reales.
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex flex-col gap-5">
            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-[#FAD8F0]" />
                <h2 className="font-serif text-2xl font-bold">
                  Configurar historia
                </h2>
              </div>

              <div>
                <div className="mb-3 text-[11px] font-bold uppercase tracking-[2px] text-white/35">
                  Rango
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "today", label: "Hoy" },
                    { id: "tomorrow", label: "Mañana" },
                    { id: "week", label: "Semana" },
                  ].map((item) => {
                    const active = mode === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => setMode(item.id as RangeMode)}
                        className={[
                          "rounded-2xl px-4 py-3 text-sm font-bold transition",
                          active
                            ? "bg-[#E535AA] text-white shadow-[0_6px_22px_rgba(229,53,170,0.35)]"
                            : "border border-white/15 bg-white/10 text-white/60 hover:bg-white/15",
                        ].join(" ")}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[2px] text-white/35">
                  Estado
                </div>

                <div className="mt-2 text-sm leading-6 text-white/60">
                  {loading
                    ? "Cargando turnos..."
                    : `Usando ${appointments.length} turnos bloqueados para esta historia.`}
                </div>

                <div className="mt-3 text-xs leading-5 text-white/35">
                  Se marcan como ocupados: pendiente de pago, seña pagada y
                  confirmados.
                </div>
              </div>

              <div className="mt-2 grid gap-3">
                <button
                  disabled={saving}
                  onClick={downloadStory}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E535AA] px-5 py-4 text-sm font-bold text-white shadow-[0_6px_24px_rgba(229,53,170,0.35)] transition hover:scale-[1.01] disabled:cursor-wait disabled:opacity-60"
                >
                  <Download size={17} />
                  Guardar imagen
                </button>

                <button
                  disabled={saving}
                  onClick={shareStory}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-sm font-bold text-white/80 transition hover:bg-white/15 disabled:cursor-wait disabled:opacity-60"
                >
                  <Share2 size={17} />
                  Compartir
                </button>

                <button
                  onClick={copyText}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-sm font-bold text-white/80 transition hover:bg-white/15"
                >
                  <Copy size={17} />
                  Copiar texto
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[2px] text-white/35">
                  Vista previa
                </div>
                <h2 className="mt-1 font-serif text-2xl font-bold text-white">
                  Formato historia 9:16
                </h2>
              </div>

              <CalendarDays size={22} className="text-[#FAD8F0]" />
            </div>

            <div className="flex justify-center">
              <div
                ref={storyRef}
                className="relative h-[720px] w-[405px] overflow-hidden rounded-[34px] bg-[radial-gradient(circle_at_80%_10%,#EF6BAE_0%,transparent_30%),linear-gradient(160deg,#2A0E1E_0%,#68174B_55%,#2A0E1E_100%)] px-6 py-8 text-white shadow-2xl"
              >
                <div className="pointer-events-none absolute left-[-70px] top-[80px] h-[180px] w-[180px] rounded-full bg-[#FAD8F0]/20 blur-3xl" />
                <div className="pointer-events-none absolute bottom-[-70px] right-[-70px] h-[220px] w-[220px] rounded-full bg-[#E535AA]/25 blur-3xl" />

                <div className="relative z-[1] text-center">
                  <div className="text-[15px] font-bold uppercase tracking-[6px] text-white/80">
                    Magnolia Beauty 🌸
                  </div>

                  <div className="mx-auto mt-4 h-px w-28 bg-[#FAD8F0]/45" />

                  <h1 className="mt-6 font-serif text-[54px] font-bold leading-[0.9] tracking-wide text-white drop-shadow">
                    TURNOS
                    <br />
                    DISPONIBLES
                  </h1>

                  <div className="mt-4 text-[17px] font-semibold text-[#FAD8F0]">
                    ✦ {subtitle} ✦
                  </div>
                </div>

                <div
                  className={[
                    "relative z-[1] mt-7 grid gap-3",
                    dates.length === 1 ? "grid-cols-1" : "grid-cols-3",
                  ].join(" ")}
                >
                  {dates.map((date) => {
                    const occupied = occupiedByDate[date] || [];

                    return (
                      <div
                        key={date}
                        className="rounded-[22px] border border-[#FAD8F0]/35 bg-white/10 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-md"
                      >
                        <div className="mb-3 text-center">
                          <div className="text-[20px]">🗓️</div>
                          <div className="mt-1 text-[17px] font-bold uppercase tracking-[3px]">
                            {formatDayTitle(date)}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {ALL_SLOTS.map((slot) => {
                            const isOccupied = occupied.includes(slot);

                            return (
                              <div
                                key={slot}
                                className={[
                                  "rounded-2xl px-3 py-2",
                                  isOccupied
                                    ? "bg-white/45 text-zinc-600"
                                    : "bg-white/90 text-[#C3167E]",
                                ].join(" ")}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div>
                                    <div
                                      className={[
                                        "text-[17px] font-black leading-none",
                                        isOccupied && "line-through",
                                      ]
                                        .filter(Boolean)
                                        .join(" ")}
                                    >
                                      {slot}
                                    </div>
                                    <div className="mt-1 text-[11px] font-bold">
                                      {isOccupied ? "Ocupado" : "Disponible"}
                                    </div>
                                  </div>

                                  <div
                                    className={[
                                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[16px] font-black text-white",
                                      isOccupied
                                        ? "bg-zinc-400"
                                        : "bg-[#E535AA]",
                                    ].join(" ")}
                                  >
                                    {isOccupied ? "×" : "✓"}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="relative z-[1] mt-7 rounded-[28px] border border-[#FAD8F0]/35 bg-[linear-gradient(135deg,#E535AA,#A91473)] p-5 text-center shadow-[0_12px_40px_rgba(229,53,170,0.30)]">
                  <div className="font-serif text-[33px] font-bold leading-none">
                    Reservá tu turno
                  </div>

                  <div className="mx-auto mt-3 inline-flex rounded-full bg-[#2A0E1E]/45 px-6 py-2 font-serif text-[25px] italic text-[#FAD8F0]">
                    por la app 💅
                  </div>
                </div>

                <div className="relative z-[1] mt-6 text-center text-[13px] font-medium text-white/65">
                  🌐 magnolia-beauty-iota.vercel.app
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}