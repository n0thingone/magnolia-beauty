"use client";

import { useEffect } from "react";

type NotifyMagnoliaEmailProps = {
  appointmentId?: string;
};

export default function NotifyMagnoliaEmail({
  appointmentId,
}: NotifyMagnoliaEmailProps) {
  useEffect(() => {
    if (!appointmentId) return;

    const storageKey = `magnolia-email-sent-${appointmentId}`;

    if (localStorage.getItem(storageKey)) return;

    fetch("/api/magnolia/notify-reservation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ appointment_id: appointmentId }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("No se pudo enviar el mail");
        localStorage.setItem(storageKey, "1");
      })
      .catch((error) => {
        console.error("Error enviando mail a Magnolia:", error);
      });
  }, [appointmentId]);

  return null;
}