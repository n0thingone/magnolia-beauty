"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

type ShareDataWithFiles = ShareData & {
  files?: File[];
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

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillStyle: string,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function strokeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  strokeStyle: string,
  lineWidth: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

export default function AdminHistoriasPage() {
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
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No se pudo crear el canvas");
    }

    const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
    gradient.addColorStop(0, "#2A0E1E");
    gradient.addColorStop(0.55, "#68174B");
    gradient.addColorStop(1, "#210817");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    ctx.beginPath();
    ctx.arc(920, 130, 260, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(240,117,181,0.22)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(110, 1780, 280, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(229,53,170,0.18)";
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.font = "bold 62px Arial";
    ctx.fillText("✦", 950, 330);
    ctx.fillText("✦", 110, 535);

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.font = "bold 34px Arial";
    ctx.fillText("MAGNOLIA BEAUTY 🌸", 540, 105);

    ctx.strokeStyle = "rgba(250,216,240,0.45)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(400, 150);
    ctx.lineTo(680, 150);
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 112px Georgia";
    ctx.fillText("TURNOS", 540, 270);
    ctx.fillText("DISPONIBLES", 540, 390);

    ctx.fillStyle = "#FAD8F0";
    ctx.font = "bold 38px Arial";
    ctx.fillText(`✦ ${subtitle} ✦`, 540, 455);

    const cardTop = 545;
    const cardGap = 24;
    const cardWidth =
      dates.length === 1 ? 880 : Math.floor((880 - cardGap * 2) / 3);
    const cardStartX = 100;

    dates.forEach((date, dateIndex) => {
      const x =
        dates.length === 1
          ? cardStartX
          : cardStartX + dateIndex * (cardWidth + cardGap);

      const y = cardTop;
      const occupied = occupiedByDate[date] || [];

      roundRect(ctx, x, y, cardWidth, 770, 42, "rgba(255,255,255,0.12)");
      strokeRoundRect(
        ctx,
        x,
        y,
        cardWidth,
        770,
        42,
        "rgba(250,216,240,0.35)",
        2,
      );

      ctx.textAlign = "center";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = dates.length === 1 ? "bold 44px Arial" : "bold 34px Arial";
      ctx.fillText(formatDayTitle(date), x + cardWidth / 2, y + 78);

      ALL_SLOTS.forEach((slot, slotIndex) => {
        const isOccupied = occupied.includes(slot);
        const slotX = x + 24;
        const slotY = y + 125 + slotIndex * 118;
        const slotW = cardWidth - 48;
        const slotH = 92;

        roundRect(
          ctx,
          slotX,
          slotY,
          slotW,
          slotH,
          26,
          isOccupied ? "rgba(255,255,255,0.52)" : "rgba(255,255,255,0.96)",
        );

        ctx.textAlign = "left";
        ctx.fillStyle = isOccupied ? "#555555" : "#C3167E";
        ctx.font = dates.length === 1 ? "bold 42px Arial" : "bold 34px Arial";
        ctx.fillText(slot, slotX + 24, slotY + 42);

        if (isOccupied) {
          ctx.strokeStyle = "#555555";
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(slotX + 20, slotY + 34);
          ctx.lineTo(slotX + 112, slotY + 34);
          ctx.stroke();
        }

        ctx.font = dates.length === 1 ? "bold 23px Arial" : "bold 18px Arial";
        ctx.fillText(
          isOccupied ? "Ocupado" : "Disponible",
          slotX + 24,
          slotY + 72,
        );

        ctx.textAlign = "center";
        ctx.beginPath();
        ctx.arc(slotX + slotW - 40, slotY + 46, 28, 0, Math.PI * 2);
        ctx.fillStyle = isOccupied ? "#9CA3AF" : "#E535AA";
        ctx.fill();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 36px Arial";
        ctx.fillText(isOccupied ? "×" : "✓", slotX + slotW - 40, slotY + 58);
      });
    });

    roundRect(ctx, 105, 1395, 870, 245, 58, "#E535AA");

    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 74px Georgia";
    ctx.fillText("Reservá tu turno", 540, 1490);

    roundRect(ctx, 305, 1530, 470, 82, 42, "rgba(42,14,30,0.45)");
    ctx.fillStyle = "#FAD8F0";
    ctx.font = "italic 48px Georgia";
    ctx.fillText("por la app 💅", 540, 1586);

    ctx.fillStyle = "rgba(255,255,255,0.68)";
    ctx.font = "bold 30px Arial";
    ctx.fillText("🌐 magnolia-beauty-iota.vercel.app", 540, 1725);

    const blob = await blobFromCanvas(canvas);

    if (!blob) {
      throw new Error("No se pudo crear la imagen");
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
        canShare?: (data: ShareDataWithFiles) => boolean;
      };

      const shareData: ShareDataWithFiles = {
        title: "Turnos disponibles Magnolia Beauty",
        text: "Turnos disponibles Magnolia Beauty 🌸",
        files: [file],
      };

      if (navigator.share && (!nav.canShare || nav.canShare(shareData))) {
        await navigator.share(shareData);
      } else {
        await downloadStory();
      }
    } catch (error) {
      console.error("Error compartiendo historia:", error);
    }
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(instagramText);
      alert("Texto copiado para Instagram ✅");
    } catch (error) {
      console.error("Error copiando texto:", error);
      alert("No pudimos copiar el texto.");
    }
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
    </main>
  );
}