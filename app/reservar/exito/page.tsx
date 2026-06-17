import Link from "next/link";
import { supabase } from "@/lib/supabase";

type ExitoPageProps = {
  searchParams: Promise<{
    appointment_id?: string;
  }>;
};

const magnoliaWhatsapp =
  process.env.NEXT_PUBLIC_MAGNOLIA_WHATSAPP || "5492984533694";

const money = (n: number) => `$${n.toLocaleString("es-AR")}`;

const formatDate = (date: string) => date.split("-").reverse().join("/");

const formatTime = (time: string) => time.slice(0, 5);

export default async function ExitoPage({ searchParams }: ExitoPageProps) {
  const params = await searchParams;
  const appointmentId = params.appointment_id;

  let appointment: any = null;

  if (appointmentId) {
    const { data } = await supabase
      .from("appointments")
      .select(
        `
        id,
        service_name_snapshot,
        service_emoji_snapshot,
        appointment_date,
        start_time,
        total_price_snapshot,
        deposit_amount_snapshot,
        deposit_paid,
        remaining_amount,
        status,
        customer_notes,
        customers (
          first_name,
          last_name,
          phone_raw,
          instagram
        )
      `,
      )
      .eq("id", appointmentId)
      .single();

    appointment = data;
  }

  const customer = Array.isArray(appointment?.customers)
    ? appointment.customers[0]
    : appointment?.customers;

  const customerName = customer
    ? `${customer.first_name} ${customer.last_name}`
    : "Clienta";

  const serviceName = appointment?.service_name_snapshot || "Turno";
  const serviceEmoji = appointment?.service_emoji_snapshot || "💅";

  const appointmentDate = appointment?.appointment_date
    ? formatDate(appointment.appointment_date)
    : "-";

  const appointmentTime = appointment?.start_time
    ? formatTime(appointment.start_time)
    : "-";

  const deposit =
    appointment?.deposit_paid && appointment.deposit_paid > 0
      ? appointment.deposit_paid
      : appointment?.deposit_amount_snapshot || 0;

  const total = appointment?.total_price_snapshot || 0;

  const remaining =
    appointment?.remaining_amount && appointment.remaining_amount > 0
      ? appointment.remaining_amount
      : Math.max(total - deposit, 0);

  const message = encodeURIComponent(
    `Hola! Solicité un turno en Magnolia Beauty y pagué la seña 💅

Servicio: ${serviceEmoji} ${serviceName}
Día: ${appointmentDate}
Horario: ${appointmentTime}

Nombre: ${customerName}
WhatsApp: ${customer?.phone_raw || "-"}

Seña: ${deposit > 0 ? money(deposit) : "A confirmar"}
Total: ${total > 0 ? money(total) : "A confirmar"}
Resta: ${remaining > 0 ? money(remaining) : "A confirmar"}

Estado: seña pagada / pendiente de confirmación

Gracias!`,
  );

  const whatsappUrl = `https://wa.me/${magnoliaWhatsapp}?text=${message}`;

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#2A0E1E_0%,#4A1035_60%,#2A0E1E_100%)] px-5 py-10 text-white">
      <div className="mx-auto max-w-[430px]">
        <div className="rounded-[24px] border border-emerald-300/30 bg-emerald-400/15 p-6 text-center backdrop-blur-md">
          <div className="text-5xl">✅</div>

          <h1 className="mt-4 font-serif text-3xl font-bold">
            Seña enviada
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/60">
            Recibimos tu solicitud. Para confirmar más rápido, mandale el
            recordatorio a Magnolia por WhatsApp.
          </p>
        </div>

        {appointment ? (
          <div className="mt-4 rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
            <div className="text-[11px] font-bold uppercase tracking-[3px] text-[#FAD8F0]">
              Resumen del turno
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[2px] text-white/35">
                  Servicio
                </div>
                <div className="mt-1 font-serif text-2xl font-bold text-white">
                  {serviceEmoji} {serviceName}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-[2px] text-white/35">
                    Día
                  </div>
                  <div className="mt-1 text-sm font-bold text-white/90">
                    {appointmentDate}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-[2px] text-white/35">
                    Horario
                  </div>
                  <div className="mt-1 text-sm font-bold text-white/90">
                    {appointmentTime}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <div className="text-[11px] font-bold uppercase tracking-[2px] text-white/35">
                  Clienta
                </div>

                <div className="mt-1 text-sm font-bold text-white/90">
                  {customerName}
                </div>

                <div className="mt-1 text-sm text-white/50">
                  WhatsApp: {customer?.phone_raw || "-"}
                </div>

                {customer?.instagram && (
                  <div className="mt-1 text-sm text-white/50">
                    Instagram: {customer.instagram}
                  </div>
                )}
              </div>

              {appointment.customer_notes && (
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-[2px] text-white/35">
                    Nota
                  </div>
                  <div className="mt-1 text-sm text-white/70">
                    {appointment.customer_notes}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-[#E535AA]/30 bg-[#E535AA]/15 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[2px] text-white/35">
                    Total
                  </div>
                  <div className="mt-1 text-sm font-bold text-[#FAD8F0]">
                    {total > 0 ? money(total) : "-"}
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-300/25 bg-emerald-400/10 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[2px] text-white/35">
                    Seña
                  </div>
                  <div className="mt-1 text-sm font-bold text-emerald-200">
                    {deposit > 0 ? money(deposit) : "-"}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[2px] text-white/35">
                    Resta
                  </div>
                  <div className="mt-1 text-sm font-bold text-white/80">
                    {remaining > 0 ? money(remaining) : "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-[24px] border border-white/15 bg-white/10 p-5 text-center text-sm text-white/60 backdrop-blur-md">
            No pudimos cargar el resumen del turno, pero podés enviar el
            recordatorio igual.
          </div>
        )}

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 flex w-full items-center justify-center rounded-2xl bg-[#25D366] px-6 py-4 text-center text-sm font-bold text-white shadow-[0_6px_24px_rgba(37,211,102,0.28)]"
        >
          Enviar recordatorio a Magnolia
        </a>

        <Link
          href="/"
          className="mt-3 flex w-full items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-sm font-bold text-white/70"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}