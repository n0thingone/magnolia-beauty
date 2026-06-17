import Link from "next/link";

export default function PendientePage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#2A0E1E_0%,#4A1035_60%,#2A0E1E_100%)] px-5 py-10 text-white">
      <div className="mx-auto max-w-[430px] rounded-[24px] border border-yellow-300/30 bg-yellow-400/15 p-6 text-center backdrop-blur-md">
        <div className="text-5xl">⏳</div>

        <h1 className="mt-4 font-serif text-3xl font-bold">
          Pago pendiente
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/60">
          Mercado Pago todavía está procesando el pago. Te recomendamos esperar
          la confirmación.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-2xl bg-[#E535AA] px-6 py-3 text-sm font-bold text-white"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}