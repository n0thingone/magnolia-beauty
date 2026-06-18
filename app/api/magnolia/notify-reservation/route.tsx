import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabase } from "@/lib/supabase";

const money = (n: number) => `$${n.toLocaleString("es-AR")}`;

const formatDate = (date: string) => date.split("-").reverse().join("/");

const formatTime = (time: string) => time.slice(0, 5);

export async function POST(req: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const adminEmail = process.env.MAGNOLIA_ADMIN_EMAIL;

    if (!resendApiKey) {
      return NextResponse.json(
        { ok: false, error: "Falta RESEND_API_KEY" },
        { status: 500 },
      );
    }

    if (!adminEmail) {
      return NextResponse.json(
        { ok: false, error: "Falta MAGNOLIA_ADMIN_EMAIL" },
        { status: 500 },
      );
    }

    const resend = new Resend(resendApiKey);

    const { appointment_id } = await req.json();

    if (!appointment_id) {
      return NextResponse.json(
        { ok: false, error: "Falta appointment_id" },
        { status: 400 },
      );
    }

    const { data: appointment, error } = await supabase
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
      .eq("id", appointment_id)
      .single();

    if (error || !appointment) {
      return NextResponse.json(
        { ok: false, error: "No se encontró el turno" },
        { status: 404 },
      );
    }

    const customer = Array.isArray(appointment.customers)
      ? appointment.customers[0]
      : appointment.customers;

    const customerName = customer
      ? `${customer.first_name} ${customer.last_name}`
      : "Clienta";

    const serviceName = appointment.service_name_snapshot || "Turno";
    const serviceEmoji = appointment.service_emoji_snapshot || "💅";

    const appointmentDate = appointment.appointment_date
      ? formatDate(appointment.appointment_date)
      : "-";

    const appointmentTime = appointment.start_time
      ? formatTime(appointment.start_time)
      : "-";

    const deposit =
      appointment.deposit_paid && appointment.deposit_paid > 0
        ? appointment.deposit_paid
        : appointment.deposit_amount_snapshot || 0;

    const total = appointment.total_price_snapshot || 0;

    const remaining =
      appointment.remaining_amount && appointment.remaining_amount > 0
        ? appointment.remaining_amount
        : Math.max(total - deposit, 0);

    const from =
      process.env.MAGNOLIA_FROM_EMAIL ||
      "Magnolia Beauty <onboarding@resend.dev>";

    await resend.emails.send({
      from,
      to: adminEmail,
      subject: `Nueva reserva: ${customerName} - ${appointmentDate} ${appointmentTime}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #2A0E1E;">
          <h1 style="color: #E535AA;">Nueva reserva en Magnolia Beauty 🌸</h1>

          <p>Se registró una reserva con seña pagada.</p>

          <div style="padding: 16px; border-radius: 14px; background: #fff0fa; border: 1px solid #f5b5df;">
            <p><strong>Nombre:</strong> ${customerName}</p>
            <p><strong>WhatsApp:</strong> ${customer?.phone_raw || "-"}</p>
            <p><strong>Instagram:</strong> ${customer?.instagram || "-"}</p>
            <p><strong>Servicio:</strong> ${serviceEmoji} ${serviceName}</p>
            <p><strong>Día:</strong> ${appointmentDate}</p>
            <p><strong>Horario:</strong> ${appointmentTime}</p>
            <p><strong>Estado:</strong> Seña pagada ✅</p>
            <p><strong>Seña:</strong> ${deposit > 0 ? money(deposit) : "A confirmar"}</p>
            <p><strong>Total:</strong> ${total > 0 ? money(total) : "A confirmar"}</p>
            <p><strong>Resta:</strong> ${remaining > 0 ? money(remaining) : "A confirmar"}</p>
            ${
              appointment.customer_notes
                ? `<p><strong>Nota:</strong> ${appointment.customer_notes}</p>`
                : ""
            }
          </div>

          <p style="margin-top: 18px; color: #777;">
            Este mail fue enviado automáticamente desde la app de Magnolia.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("notify-reservation error:", error);

    return NextResponse.json(
      { ok: false, error: "Error enviando notificación" },
      { status: 500 },
    );
  }
}