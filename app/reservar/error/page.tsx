import Link from "next/link";

export default function ErrorPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#2A0E1E_0%,#4A1035_60%,#2A0E1E_100%)] px-5 py-10 text-white">
      <div className="mx-auto max-w-[430px] rounded-[24px] border border-red-300/30 bg-red-400/15 p-6 text-center backdrop-blur-md">
        <div className="text-5xl">❌</div>

        <h1 className="mt-4 font-serif text-3xl font-bold">
          No se pudo pagar
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/60">
          El pago no fue aprobado. Podés volver y reservar nuevamente.
        </p>

        <Link
          href="/reservar"
          className="mt-6 inline-flex rounded-2xl bg-[#E535AA] px-6 py-3 text-sm font-bold text-white"
        >
          Intentar de nuevo
        </Link>
      </div>
    </main>
  );
}