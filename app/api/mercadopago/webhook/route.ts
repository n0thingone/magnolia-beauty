import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }

  return value;
}

function getPaymentIdFromUrl(request: Request) {
  const url = new URL(request.url);

  return (
    url.searchParams.get("data.id") ||
    url.searchParams.get("id") ||
    url.searchParams.get("payment_id")
  );
}

export async function POST(request: Request) {
  try {
    const accessToken = getEnv("MERCADO_PAGO_ACCESS_TOKEN");
    const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
    const supabaseAnonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    let body: any = null;

    try {
      body = await request.json();
    } catch {
      body = null;
    }

    const paymentId =
      body?.data?.id ||
      body?.id ||
      body?.payment_id ||
      getPaymentIdFromUrl(request);

    const eventType = body?.type || body?.topic || null;

    console.log("Mercado Pago webhook received:", {
      eventType,
      paymentId,
      body,
    });

    if (!paymentId) {
      return NextResponse.json(
        {
          ok: true,
          message: "Webhook received without payment id",
        },
        { status: 200 },
      );
    }

    const mpClient = new MercadoPagoConfig({
      accessToken,
    });

    const paymentClient = new Payment(mpClient);

    const payment = await paymentClient.get({
      id: String(paymentId),
    });

    console.log("Mercado Pago payment:", payment);

    if (payment.status !== "approved") {
      return NextResponse.json({
        ok: true,
        message: `Payment status is ${payment.status}`,
      });
    }

    const appointmentId =
      payment.external_reference ||
      payment.metadata?.appointment_id ||
      null;

    if (!appointmentId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing appointment id in payment",
        },
        { status: 400 },
      );
    }

    const amountPaid = Math.round(Number(payment.transaction_amount || 0));

    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("id,total_price_snapshot,deposit_amount_snapshot")
      .eq("id", appointmentId)
      .single();

    if (appointmentError || !appointment) {
      console.error("Appointment not found:", appointmentError);

      return NextResponse.json(
        {
          ok: false,
          error: "Appointment not found",
        },
        { status: 404 },
      );
    }

    const depositPaid = amountPaid;
    const remainingAmount = Math.max(
      Number(appointment.total_price_snapshot || 0) - depositPaid,
      0,
    );

    const { error: updateError } = await supabase
      .from("appointments")
      .update({
        status: "deposit_paid",
        deposit_paid: depositPaid,
        remaining_amount: remainingAmount,
        mercado_pago_payment_id: String(payment.id),
      })
      .eq("id", appointmentId);

    if (updateError) {
      console.error("Error updating appointment:", updateError);

      return NextResponse.json(
        {
          ok: false,
          error: "Could not update appointment",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Appointment updated",
      appointmentId,
      paymentId: payment.id,
      depositPaid,
      remainingAmount,
    });
  } catch (error) {
    console.error("Webhook error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return POST(request);
}