"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clock,
  Edit,
  Plus,
  Save,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const SERVICES = [
  {
    id: 1,
    name: "Semipermanente",
    description: "Esmaltado semipermanente con terminación prolija y duradera",
    duration: 60,
    price: 15000,
    deposit: 5000,
    active: true,
    emoji: "✨",
  },
  {
    id: 2,
    name: "Kapping",
    description: "Refuerzo sobre uña natural para mayor resistencia",
    duration: 90,
    price: 18000,
    deposit: 5000,
    active: true,
    emoji: "💎",
  },
  {
    id: 3,
    name: "Soft Gel",
    description: "Extensiones soft gel con acabado natural y elegante",
    duration: 90,
    price: 22000,
    deposit: 5000,
    active: true,
    emoji: "💅",
  },
];

const money = (n: number) => `$${n.toLocaleString("es-AR")}`;

function ServiceCard({
  service,
}: {
  service: {
    id: number;
    name: string;
    description: string;
    duration: number;
    price: number;
    deposit: number;
    active: boolean;
    emoji: string;
  };
}) {
  return (
    <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E535AA]/20 text-xl">
            {service.emoji}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-serif text-[24px] font-bold leading-none text-white">
                {service.name}
              </h2>

              {service.active ? (
                <span className="rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-[11px] font-bold text-emerald-200">
                  Activo
                </span>
              ) : (
                <span className="rounded-full border border-red-300/30 bg-red-400/15 px-3 py-1 text-[11px] font-bold text-red-200">
                  Inactivo
                </span>
              )}
            </div>

            <p className="mt-2 text-sm leading-6 text-white/45">
              {service.description}
            </p>
          </div>
        </div>

        <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/70 transition hover:bg-white/15">
          <Edit size={16} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-white/10 p-3">
          <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/35">
            Precio
          </div>
          <div className="mt-2 text-[15px] font-bold text-white">
            {money(service.price)}
          </div>
        </div>

        <div className="rounded-2xl bg-white/10 p-3">
          <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/35">
            Seña
          </div>
          <div className="mt-2 text-[15px] font-bold text-[#FAD8F0]">
            {money(service.deposit)}
          </div>
        </div>

        <div className="rounded-2xl bg-white/10 p-3">
          <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/35">
            Duración
          </div>
          <div className="mt-2 inline-flex items-center gap-1 text-[15px] font-bold text-white">
            <Clock size={13} />
            {service.duration}m
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-xs font-bold text-white/75 transition hover:bg-white/15">
          <Edit size={14} />
          Editar
        </button>

        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-xs font-bold text-white/75 transition hover:bg-white/15">
          {service.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          {service.active ? "Desactivar" : "Activar"}
        </button>
      </div>
    </div>
  );
}

export default function ServiciosPage() {
  const activeServices = SERVICES.filter((service) => service.active).length;
  const averageDeposit = Math.round(
    SERVICES.reduce((acc, service) => acc + service.deposit, 0) / SERVICES.length,
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
                Servicios
              </h1>

              <p className="mt-2 text-sm text-white/45">
                Precios, señas, duración y disponibilidad.
              </p>
            </div>
          </div>

          <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E535AA] px-4 py-3 text-sm font-bold text-white shadow-[0_6px_24px_rgba(229,53,170,0.35)]">
            <Plus size={16} />
            Nuevo servicio
          </button>
        </header>

        <section className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-[18px] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/35">
              Total
            </div>
            <div className="mt-2 font-serif text-[24px] font-bold leading-none">
              {SERVICES.length}
            </div>
          </div>

          <div className="rounded-[18px] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/35">
              Activos
            </div>
            <div className="mt-2 font-serif text-[24px] font-bold leading-none text-emerald-200">
              {activeServices}
            </div>
          </div>

          <div className="rounded-[18px] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/35">
              Seña prom.
            </div>
            <div className="mt-2 font-serif text-[22px] font-bold leading-none text-[#FAD8F0]">
              {money(averageDeposit)}
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-[22px] border border-[#E535AA]/35 bg-[#E535AA]/15 p-4 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <Check size={18} className="mt-0.5 shrink-0 text-[#FAD8F0]" />
            <div>
              <div className="text-sm font-bold text-white">
                Importante para precios
              </div>
              <p className="mt-1 text-sm leading-6 text-white/50">
                Cuando conectemos Supabase, si ella cambia el precio de un
                servicio, los turnos ya reservados van a mantener el precio viejo.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}

          <button className="flex min-h-[230px] flex-col items-center justify-center rounded-[24px] border border-dashed border-white/20 bg-white/5 p-5 text-white/50 transition hover:bg-white/10 hover:text-white/75">
            <Plus size={28} />
            <span className="mt-3 text-sm font-bold">Agregar otro servicio</span>
            <span className="mt-1 text-xs">Ej: retiro, diseño, reparación</span>
          </button>
        </section>

        <div className="mt-5">
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#E535AA,#B8147E)] px-5 py-4 text-sm font-bold text-white shadow-[0_6px_24px_rgba(229,53,170,0.35)]">
            <Save size={16} />
            Guardar cambios
          </button>
        </div>
      </div>
    </main>
  );
}