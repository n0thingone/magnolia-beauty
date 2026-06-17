"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MessageSquare,
  Phone,
  Search,
  Star,
  User,
} from "lucide-react";

const CLIENTS = [
  {
    id: 1,
    name: "Camila Pérez",
    whatsappRaw: "2984 123456",
    whatsappNormalized: "5492984123456",
    instagram: "@camiperez",
    visits: 5,
    totalSpent: 85000,
    lastService: "Kapping",
    lastDate: "2026-06-18",
    favoriteService: "Kapping",
    status: "Frecuente",
  },
  {
    id: 2,
    name: "Sofía López",
    whatsappRaw: "2984 555777",
    whatsappNormalized: "5492984555777",
    instagram: "@sofilopez",
    visits: 3,
    totalSpent: 45000,
    lastService: "Semipermanente",
    lastDate: "2026-06-18",
    favoriteService: "Semipermanente",
    status: "Activa",
  },
  {
    id: 3,
    name: "Martina Díaz",
    whatsappRaw: "2984 888999",
    whatsappNormalized: "5492984888999",
    instagram: "",
    visits: 1,
    totalSpent: 22000,
    lastService: "Soft Gel",
    lastDate: "2026-06-18",
    favoriteService: "Soft Gel",
    status: "Nueva",
  },
  {
    id: 4,
    name: "Valentina García",
    whatsappRaw: "2984 333222",
    whatsappNormalized: "5492984333222",
    instagram: "@valengarcia",
    visits: 4,
    totalSpent: 78000,
    lastService: "Soft Gel",
    lastDate: "2026-06-19",
    favoriteService: "Soft Gel",
    status: "Frecuente",
  },
];

const money = (n: number) => `$${n.toLocaleString("es-AR")}`;

const formatDate = (date: string) => date.split("-").reverse().join("/");

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Frecuente: "border-[#E535AA]/40 bg-[#E535AA]/15 text-[#FAD8F0]",
    Activa: "border-emerald-300/30 bg-emerald-400/15 text-emerald-200",
    Nueva: "border-blue-300/30 bg-blue-400/15 text-blue-200",
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

function ClientCard({
  client,
}: {
  client: {
    id: number;
    name: string;
    whatsappRaw: string;
    whatsappNormalized: string;
    instagram: string;
    visits: number;
    totalSpent: number;
    lastService: string;
    lastDate: string;
    favoriteService: string;
    status: string;
  };
}) {
  const whatsappUrl = `https://wa.me/${client.whatsappNormalized}`;

  return (
    <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E535AA]/20 text-sm font-black text-[#FAD8F0]">
          {client.name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-[23px] font-bold leading-none text-white">
              {client.name}
            </h2>

            <StatusBadge status={client.status} />
          </div>

          <div className="mt-2 flex flex-col gap-1 text-sm text-white/45">
            <span className="inline-flex items-center gap-2">
              <Phone size={14} />
              {client.whatsappRaw}
            </span>

            {client.instagram && (
              <span className="inline-flex items-center gap-2">
                <User size={14} />
                {client.instagram}
              </span>
            )}
          </div>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/75 transition hover:bg-white/15"
        >
          <MessageSquare size={16} />
        </a>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-white/10 p-3">
          <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/35">
            Visitas
          </div>
          <div className="mt-2 font-serif text-[23px] font-bold leading-none text-white">
            {client.visits}
          </div>
        </div>

        <div className="rounded-2xl bg-white/10 p-3">
          <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/35">
            Total
          </div>
          <div className="mt-2 text-[15px] font-bold text-[#FAD8F0]">
            {money(client.totalSpent)}
          </div>
        </div>

        <div className="rounded-2xl bg-white/10 p-3">
          <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/35">
            Favorito
          </div>
          <div className="mt-2 text-[13px] font-bold leading-tight text-white">
            {client.favoriteService}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-4">
        <div className="text-[10px] font-bold uppercase tracking-[2px] text-white/35">
          Último turno
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/65">
          <span className="inline-flex items-center gap-1">
            <Calendar size={14} />
            {formatDate(client.lastDate)}
          </span>

          <span>{client.lastService}</span>
        </div>
      </div>
    </div>
  );
}

export default function ClientasPage() {
  const totalSpent = CLIENTS.reduce((acc, client) => acc + client.totalSpent, 0);

  const totalVisits = CLIENTS.reduce((acc, client) => acc + client.visits, 0);

  const frequentClients = CLIENTS.filter(
    (client) => client.status === "Frecuente",
  ).length;

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
                Clientas
              </h1>

              <p className="mt-2 text-sm text-white/45">
                Historial por WhatsApp, visitas y servicios favoritos.
              </p>
            </div>
          </div>
        </header>

        <section className="mb-4 grid grid-cols-3 gap-3">
          <div className="rounded-[18px] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/35">
              Clientas
            </div>
            <div className="mt-2 font-serif text-[24px] font-bold leading-none">
              {CLIENTS.length}
            </div>
          </div>

          <div className="rounded-[18px] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/35">
              Visitas
            </div>
            <div className="mt-2 font-serif text-[24px] font-bold leading-none text-[#FAD8F0]">
              {totalVisits}
            </div>
          </div>

          <div className="rounded-[18px] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
            <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/35">
              Frecuentes
            </div>
            <div className="mt-2 font-serif text-[24px] font-bold leading-none text-emerald-200">
              {frequentClients}
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-[22px] border border-[#E535AA]/35 bg-[#E535AA]/15 p-4 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <Star size={18} className="mt-0.5 shrink-0 text-[#FAD8F0]" />

            <div>
              <div className="text-sm font-bold text-white">
                Detección de clientas
              </div>

              <p className="mt-1 text-sm leading-6 text-white/50">
                La clienta se identifica por WhatsApp normalizado. Si vuelve a
                reservar con el mismo número, no se duplica: se suma al historial.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-[22px] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
            />

            <input
              placeholder="Buscar por nombre, WhatsApp o Instagram..."
              className="w-full rounded-[16px] border border-white/15 bg-white/10 py-4 pl-12 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#E535AA]"
            />
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          {CLIENTS.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </section>

        <section className="mt-4 rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
          <div className="text-[11px] font-bold uppercase tracking-[3px] text-[#FAD8F0]">
            Resumen
          </div>

          <h2 className="mt-2 font-serif text-2xl font-bold text-white">
            Total histórico {money(totalSpent)}
          </h2>

          <p className="mt-3 text-sm leading-6 text-white/50">
            Después esto se calcula con los turnos atendidos y cobrados. Sirve
            para saber qué clientas vuelven, cuánto gastan y qué servicio piden
            más.
          </p>
        </section>
      </div>
    </main>
  );
}