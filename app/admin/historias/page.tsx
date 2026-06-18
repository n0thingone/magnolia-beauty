"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Copy,
  Download,
  Eye,
  Share2,
  Sparkles,
} from "lucide-react";

const ALL_SLOTS = ["10:30", "12:00", "14:00", "15:30", "17:00"];

const BLOCKING_STATUSES = [
  "pending_payment",
  "paid",
  "deposit_paid",
  "confirmed",
  "rescheduled",
  "completed",
];

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

function blobFromCanvas(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

export default function AdminHistoriasPage() {
  const storyRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<RangeMode>("week");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);

  const dates = useMemo(() => getDatesForMode(mode), [mode]);

  const occupiedByDate = useMemo(
    () => groupOccupiedByDate(appointments),
    [appointments],
  );

  const subtitle = useMemo(() => getStorySubtitle(mode, dates), [mode, dates]);

  const totalAvailable = useMemo(() => {
    return dates.reduce((acc, date) => {
      const occupied = occupiedByDate[date] || [];
      return acc + ALL_SLOTS.filter((slot) => !occupied.includes(slot)).length;
    }, 0);
  }, [dates, occupiedByDate]);

  const totalOccupied = useMemo(() => {
    return dates.reduce((acc, date) => {
      const occupied = occupiedByDate[date] || [];
      return acc + occupied.length;
    }, 0);
  }, [dates, occupiedByDate]);

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
      setGeneratedUrl(null);
      setGeneratedBlob(null);

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

  useEffect(() => {
    return () => {
      if (generatedUrl) URL.revokeObjectURL(generatedUrl);
    };
  }, [generatedUrl]);

  const createStoryFile = async () => {
    if (!storyRef.current) {
      throw new Error("No existe storyRef");
    }

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });

    const canvas = await html2canvas(storyRef.current, {
      backgroundColor: "#2A0E1E",
      scale: 1,
      useCORS: true,
      logging: false,
    });

    const blob = await blobFromCanvas(canvas);

    if (!blob) {
      throw new Error("No se pudo crear el blob de la imagen");
    }

    const url = URL.createObjectURL(blob);

    return { blob, url };
  };

  const generateStory = async () => {
    setGenerating(true);

    try {
      if (generatedUrl) URL.revokeObjectURL(generatedUrl);

      const result = await createStoryFile();

      setGeneratedBlob(result.blob);
      setGeneratedUrl(result.url);
    } catch (error) {
      console.error("Error generando historia:", error);
      alert("No pudimos generar la historia. Probá de nuevo.");
    } finally {
      setGenerating(false);
    }
  };

  const downloadStory = async () => {
    try {
      let blob = generatedBlob;

      if (!blob) {
        const result = await createStoryFile();
        blob = result.blob;
        setGeneratedBlob(result.blob);
        setGeneratedUrl(result.url);
      }

      const link = document.createElement("a");
      link.download = `magnolia-turnos-${Date.now()}.png`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error descargando historia:", error);
      alert("No pudimos guardar la imagen.");
    }
  };

  const shareStory = async () => {
    try {
      let blob = generatedBlob;

      if (!blob) {
        const result = await createStoryFile();
        blob = result.blob;
        setGeneratedBlob(result.blob);
        setGeneratedUrl(result.url);
      }

      const file = new File([blob], `magnolia-turnos-${Date.now()}.png`, {
        type: "image/png",
      });

      const nav = navigator as Navigator & {
        canShare?: (data: ShareData) => boolean;
      };

      if (
        navigator.share &&
        (!nav.canShare || nav.canShare({ files: [file] }))
      ) {
        await navigator.share({
          title: "Turnos disponibles Magnolia Beauty",
          text: "Turnos disponibles Magnolia Beauty 🌸",
          files: [file],
        });
      } else {
        await downloadStory();
      }
    } catch (error) {
      console.error("Error compartiendo historia:", error);
    }
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(instagramText);
    alert("Texto copiado para Instagram ✅");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(160deg,#2A0E1E_0%,#4A1035_60%,#2A0E1E_100%)] px-5 py-6 text-white">
      <div className="pointer-events-none absolute right-[-140px] top-[-120px] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(229,53,170,0.18)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-[-140px] left-[-120px] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(229,53,170,0.10)_0%,transparent_70%)]" />

      <div className="relative z-[1] mx-auto max-w-[520px]">
        <header className="mb-6 flex items-center gap-3">
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

            <h1 className="mt-1 font-serif text-[30px] font-bold leading-none text-white">
              Historias
            </h1>

            <p className="mt-2 text-sm text-white/45">
              Generá una imagen lista para subir a Instagram.
            </p>
          </div>
        </header>

        <section className="rounded-[26px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles size={18} className="text-[#FAD8F0]" />
            <h2 className="font-serif text-2xl font-bold">
              Crear historia de turnos
            </h2>
          </div>

          <div className="mb-5">
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

          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <div className="flex items-start gap-3">
              <CalendarDays size={18} className="mt-1 text-[#FAD8F0]" />

              <div>
                <div className="text-sm font-bold text-white">{subtitle}</div>

                <div className="mt-1 text-xs leading-5 text-white/45">
                  {loading
                    ? "Cargando turnos..."
                    : `${totalAvailable} disponibles · ${totalOccupied} ocupados`}
                </div>

                <div className="mt-2 text-xs leading-5 text-white/35">
                  Ocupa horarios con seña pagada, confirmados, atendidos,
                  pendientes de pago y reagendados.
                </div>
              </div>
            </div>
          </div>

          <button
            disabled={loading || generating}
            onClick={generateStory}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E535AA] px-5 py-4 text-sm font-bold text-white shadow-[0_6px_24px_rgba(229,53,170,0.35)] transition hover:scale-[1.01] disabled:cursor-wait disabled:opacity-60"
          >
            {generating ? "Generando..." : "Generar historia"}
            <Sparkles size={17} />
          </button>

          {generatedUrl && (
            <div className="mt-5 rounded-[22px] border border-emerald-300/25 bg-emerald-400/10 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-100">
                <CheckCircle size={17} />
                Historia generada ✅
              </div>

              <div className="mt-3 grid gap-2">
                <a
                  href={generatedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 py-4 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  <Eye size={17} />
                  Ver imagen
                </a>

                <button
                  onClick={shareStory}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-4 text-sm font-bold text-white transition hover:scale-[1.01]"
                >
                  <Share2 size={17} />
                  Compartir
                </button>

                <button
                  onClick={downloadStory}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-sm font-bold text-white/80 transition hover:bg-white/15"
                >
                  <Download size={17} />
                  Guardar imagen
                </button>

                <button
                  onClick={copyText}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-sm font-bold text-white/80 transition hover:bg-white/15"
                >
                  <Copy size={17} />
                  Copiar texto
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <div
        aria-hidden="true"
        className="absolute left-[-9999px] top-0 overflow-hidden"
      >
        <div
          ref={storyRef}
          style={{
            width: 1080,
            height: 1920,
          }}
          className="relative overflow-hidden bg-[radial-gradient(circle_at_85%_8%,#F075B5_0%,transparent_27%),linear-gradient(160deg,#2A0E1E_0%,#68174B_56%,#210817_100%)] px-[72px] py-[92px] text-white"
        >
          <div className="absolute left-[-180px] top-[170px] h-[360px] w-[360px] rounded-full bg-[#FAD8F0]/20 blur-[80px]" />
          <div className="absolute bottom-[-170px] right-[-160px] h-[460px] w-[460px] rounded-full bg-[#E535AA]/25 blur-[90px]" />
          <div className="absolute right-[75px] top-[300px] text-[54px] text-white/70">
            ✦
          </div>
          <div className="absolute left-[90px] top-[560px] text-[32px] text-[#FAD8F0]/70">
            ✦
          </div>

          <div className="relative z-[1] text-center">
            <div className="text-[34px] font-bold uppercase tracking-[12px] text-white/80">
              Magnolia Beauty 🌸
            </div>

            <div className="mx-auto mt-[34px] h-px w-[270px] bg-[#FAD8F0]/45" />

            <h1 className="mt-[60px] font-serif text-[128px] font-bold leading-[0.9] tracking-wide text-white drop-shadow">
              TURNOS
              <br />
              DISPONIBLES
            </h1>

            <div className="mt-[36px] text-[38px] font-semibold text-[#FAD8F0]">
              ✦ {subtitle} ✦
            </div>
          </div>

          <div
            className={[
              "relative z-[1] mt-[78px] grid gap-[26px]",
              dates.length === 1 ? "grid-cols-1" : "grid-cols-3",
            ].join(" ")}
          >
            {dates.map((date) => {
              const occupied = occupiedByDate[date] || [];

              return (
                <div
                  key={date}
                  className="rounded-[46px] border border-[#FAD8F0]/35 bg-white/10 p-[26px] shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur-md"
                >
                  <div className="mb-[28px] text-center">
                    <div className="text-[38px]">🗓️</div>
                    <div className="mt-[10px] text-[38px] font-bold uppercase tracking-[6px]">
                      {formatDayTitle(date)}
                    </div>
                  </div>

                  <div className="flex flex-col gap-[18px]">
                    {ALL_SLOTS.map((slot) => {
                      const isOccupied = occupied.includes(slot);

                      return (
                        <div
                          key={slot}
                          className={[
                            "rounded-[30px] px-[28px] py-[24px]",
                            isOccupied
                              ? "bg-white/55 text-zinc-600"
                              : "bg-white/95 text-[#C3167E]",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between gap-[18px]">
                            <div>
                              <div
                                className={[
                                  "text-[42px] font-black leading-none",
                                  isOccupied ? "line-through" : "",
                                ].join(" ")}
                              >
                                {slot}
                              </div>
                              <div className="mt-[10px] text-[24px] font-bold">
                                {isOccupied ? "Ocupado" : "Disponible"}
                              </div>
                            </div>

                            <div
                              className={[
                                "flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full text-[42px] font-black text-white",
                                isOccupied ? "bg-zinc-400" : "bg-[#E535AA]",
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

          <div className="relative z-[1] mt-[80px] rounded-[58px] border border-[#FAD8F0]/35 bg-[linear-gradient(135deg,#E535AA,#A91473)] p-[48px] text-center shadow-[0_18px_70px_rgba(229,53,170,0.34)]">
            <div className="font-serif text-[76px] font-bold leading-none">
              Reservá tu turno
            </div>

            <div className="mx-auto mt-[28px] inline-flex rounded-full bg-[#2A0E1E]/45 px-[72px] py-[22px] font-serif text-[54px] italic text-[#FAD8F0]">
              por la app 💅
            </div>
          </div>

          <div className="relative z-[1] mt-[58px] text-center text-[30px] font-medium text-white/65">
            🌐 magnolia-beauty-iota.vercel.app
          </div>
        </div>
      </div>
    </main>
  );
}