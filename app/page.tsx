"use client";

import Link from "next/link";
import { Shield, Sparkles, Clock } from "lucide-react";

const C = {
  fuchsia: "#E535AA",
  fuchsiaDeep: "#B8147E",
  fuchsiaLight: "#FAD8F0",
  white: "#FFFFFF",
};

const SERVICES = [
  {
    id: 1,
    name: "Manicura Completa",
    duration: 45,
    price: 3500,
    emoji: "💅",
  },
  {
    id: 2,
    name: "Semipermanente",
    duration: 60,
    price: 5500,
    emoji: "✨",
  },
  {
    id: 3,
    name: "Kapping",
    duration: 90,
    price: 8000,
    emoji: "💎",
  },
  {
    id: 4,
    name: "Nail Art",
    duration: 75,
    price: 7000,
    emoji: "🌸",
  },
];

const money = (n: number) => `$${n.toLocaleString("es-AR")}`;

function Logo({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="50" fill={C.fuchsia} />

      <g fill="white" opacity="0.95">
        <path d="M22 28 L23.5 24 L25 28 L29 29.5 L25 31 L23.5 35 L22 31 L18 29.5 Z" />
      </g>

      <g fill="white" opacity="0.95">
        <path d="M72 64 L73 61 L74 64 L77 65 L74 66 L73 69 L72 66 L69 65 Z" />
      </g>

      <path
        d="M20 72 C20 72 22 40 26 36 C30 32 34 36 36 42 C38 48 40 56 42 56
        C44 56 46 42 50 38 C54 34 58 36 60 42 C62 48 64 56 66 58
        C68 60 70 58 72 54"
        stroke="#D42828"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(160deg,#2A0E1E_0%,#4A1035_60%,#2A0E1E_100%)] text-white relative">
      <div className="pointer-events-none absolute -right-32 -top-32 h-[450px] w-[450px] rounded-full bg-[radial-gradient(circle,rgba(229,53,170,0.20)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-16 -left-20 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(229,53,170,0.12)_0%,transparent_70%)]" />

      <div className="absolute right-5 top-5 z-10">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white/70 backdrop-blur-md transition hover:bg-white/15 hover:text-white"
        >
          <Shield size={13} />
          Panel Admin
        </Link>
      </div>

      <section className="relative z-[1] flex min-h-screen flex-col items-center justify-center px-6 pb-10 pt-24 text-center">
        <div className="mb-7">
          <Logo size={88} />
        </div>

        <div className="mb-3 text-[11px] font-bold uppercase tracking-[5px] text-[#FAD8F0]">
          Studio
        </div>

        <h1 className="font-serif text-[54px] font-bold leading-none tracking-[-1px] text-white/95">
          Magnolia
        </h1>

        <h2 className="mb-5 font-serif text-[28px] italic tracking-[6px] text-[#FAD8F0]">
          BEAUTY
        </h2>

        <p className="mb-10 max-w-[320px] text-[16px] leading-8 text-white/60">
          Reservá tu turno online. Sin esperas, sin llamadas.
        </p>

        <Link
          href="/reservar"
          className="inline-flex items-center gap-3 rounded-full bg-[linear-gradient(135deg,#E535AA,#B8147E)] px-12 py-[18px] text-[16px] font-bold text-white shadow-[0_8px_32px_rgba(229,53,170,0.50)] transition hover:scale-[1.02]"
        >
          <Sparkles size={18} />
          Reservar turno
        </Link>

        <div className="mt-7 flex flex-wrap justify-center gap-5 text-xs text-white/35">
          <span>✓ Pago seguro</span>
          <span>✓ Confirmación inmediata</span>
          <span>✓ Cancelá gratis</span>
        </div>

        <div className="mt-14 grid w-full max-w-[520px] grid-cols-2 gap-3">
          {SERVICES.map((service) => (
            <div
              key={service.id}
              className="rounded-[18px] border border-white/15 bg-white/10 p-4 text-left backdrop-blur-md"
            >
              <div className="mb-2 text-2xl">{service.emoji}</div>

              <div className="text-[13px] font-bold text-white/90">
                {service.name}
              </div>

              <div className="mt-1 text-[13px] font-bold text-[#FAD8F0]">
                {money(service.price)}
              </div>

              <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-white/35">
                <Clock size={11} />
                {service.duration} min
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}