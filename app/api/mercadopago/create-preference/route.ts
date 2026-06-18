import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

function getErrorDetails(error: unknown) {
  try {
    return JSON.parse(JSON.stringify(error));
  } catch {
    return String(error);
  }
}

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://magnolia-beauty-iota.vercel.app"
  );
}

export async function POST(request: Request) {
  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const webhookUrl = process.env.MERCADO_PAGO_WEBHOOK_URL;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing MERCADO_PAGO_ACCESS_TOKEN" },
        { status: 500 },
      );
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Missing Supabase env vars" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const appointmentId = body.appointmentId as string | undefined;

    if (!appointmentId) {
      return NextResponse.json(
        { error: "appointmentId is required" },
        { status: 400 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select(
        `
        id,
        service_name_snapshot,
        deposit_amount_snapshot,
        appointment_date,
        start_time,
        customers (
          first_name,
          last_name,
          phone_raw
        )
      `,
      )
      .eq("id", appointmentId)
      .single();

    if (appointmentError || !appointment) {
      console.error("Appointment error:", appointmentError);

      return NextResponse.json(
        { error: "Appointment not found", details: appointmentError },
        { status: 404 },
      );
    }

    const depositAmount = Number(appointment.deposit_amount_snapshot || 0);

    if (depositAmount <= 0) {
      return NextResponse.json(
        { error: "Deposit amount must be greater than 0" },
        { status: 400 },
      );
    }

    const customer = Array.isArray(appointment.customers)
      ? appointment.customers[0]
      : appointment.customers;

    const mpClient = new MercadoPagoConfig({
      accessToken,
    });

    const preference = new Preference(mpClient);

    const baseUrl = getBaseUrl();

    const preferenceBody = {
      items: [
        {
          id: appointment.id,
          title: `Seña ${appointment.service_name_snapshot}`,
          description: `Turno Magnolia Beauty - ${appointment.appointment_date} ${appointment.start_time}`,
          quantity: 1,
          currency_id: "ARS",
          unit_price: depositAmount,
        },
      ],

      payer: {
        name: customer?.first_name || undefined,
        surname: customer?.last_name || undefined,
      },

      external_reference: appointment.id,

      metadata: {
        appointment_id: appointment.id,
      },

      back_urls: {
        success: `${baseUrl}/reservar/exito?appointment_id=${appointment.id}`,
        failure: `${baseUrl}/reservar/error?appointment_id=${appointment.id}`,
        pending: `${baseUrl}/reservar/pendiente?appointment_id=${appointment.id}`,
      },

      auto_return: "approved",

      notification_url: webhookUrl || undefined,
    };

    const createdPreference = await preference.create({
      body: preferenceBody,
    });

    const preferenceId = createdPreference.id;
    const initPoint = createdPreference.init_point;

    if (!preferenceId || !initPoint) {
      console.error("Preference response:", createdPreference);

      return NextResponse.json(
        {
          error: "Could not create Mercado Pago preference",
          details: createdPreference,
        },
        { status: 500 },
      );
    }

    await supabase
      .from("appointments")
      .update({
        mercado_pago_preference_id: preferenceId,
      })
      .eq("id", appointment.id);

    return NextResponse.json({
      preferenceId,
      initPoint,
    });
  } catch (error) {
    const details = getErrorDetails(error);

    console.error("Create preference error:", details);

    return NextResponse.json(
      {
        error: "Unexpected error creating preference",
        details,
      },
      { status: 500 },
    );
  }
}