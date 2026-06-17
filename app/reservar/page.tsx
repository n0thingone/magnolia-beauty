"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  User,
  Phone,
  MessageSquare,
} from "lucide-react";

const ALL_SLOTS = ["10:30", "12:00", "14:00", "15:30", "17:00"];

const OCCUPIED: Record<string, string[]> = {
  "2026-06-18": ["10:30", "14:00"],
  "2026-06-19": ["12:00", "15:30"],
  "2026-06-20": ["10:30", "17:00"],
};

const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const money = (n: number) => `$${n.toLocaleString("es-AR")}`;

const priceLabel = (price: number) => {
  if (!price || price <= 0) return "Consultar";
  return money(price);
};

type Service = {
  id: string;
  name: string;
  description: string | null;
  emoji: string | null;
  duration_minutes: number;
  price: number;
  deposit_amount: number;
  is_active: boolean;
  sort_order: number;
};

type ClientData = {
  nombre: string;
  apellido: string;
  whatsapp: string;
  instagram: string;
  comentario: string;
};

function normalizePhone(value: string) {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (digits.startsWith("54")) {
    return digits;
  }

  return `549${digits}`;
}

function addMinutesToTime(time: string, minutes: number) {
  const [hoursRaw, minutesRaw] = time.split(":").map(Number);
  const start = new Date(2026, 0, 1, hoursRaw, minutesRaw);
  start.setMinutes(start.getMinutes() + minutes);

  const hours = String(start.getHours()).padStart(2, "0");
  const mins = String(start.getMinutes()).padStart(2, "0");

  return `${hours}:${mins}`;
}

function StepHeader({
  step,
  title,
  onBack,
}: {
  step: number;
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <button
        onClick={onBack}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/85 backdrop-blur-md transition hover:bg-white/15"
      >
        <ArrowLeft size={17} />
      </button>

      <div className="flex-1">
        <div className="mb-1 text-[11px] font-bold uppercase tracking-[2px] text-white/35">
          Paso {step} de 4
        </div>

        <h1 className="font-serif text-[24px] font-bold leading-none text-white/95">
          {title}
        </h1>
      </div>

      <div className="flex gap-1">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className={[
              "h-[5px] rounded-full transition",
              item <= step ? "w-6 bg-[#E535AA]" : "w-2 bg-white/15",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}

function MiniCalendar({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (date: string) => void;
}) {
  const today = new Date(2026, 5, 17);
  const [view, setView] = useState({ y: 2026, m: 5 });

  const firstDay = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();

  const cells = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const formatDate = (day: number) =>
    `${view.y}-${String(view.m + 1).padStart(2, "0")}-${String(day).padStart(
      2,
      "0",
    )}`;

  const isDisabled = (day: number | null) => {
    if (!day) return true;

    const date = new Date(view.y, view.m, day);

    return date.getDay() === 0 || date < today;
  };

  const moveMonth = (dir: number) => {
    setView((current) => {
      let month = current.m + dir;
      let year = current.y;

      if (month < 0) {
        month = 11;
        year--;
      }

      if (month > 11) {
        month = 0;
        year++;
      }

      return { y: year, m: month };
    });
  };

  return (
    <div className="rounded-[22px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => moveMonth(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/85"
        >
          <ChevronLeft size={17} />
        </button>

        <div className="font-serif text-[18px] font-bold text-white/95">
          {MONTHS_ES[view.m]} {view.y}
        </div>

        <button
          onClick={() => moveMonth(1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/85"
        >
          <ChevronRight size={17} />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAYS_ES.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-[10px] font-bold text-white/35"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          const disabled = isDisabled(day);
          const dateValue = day ? formatDate(day) : null;
          const selected = dateValue === value;

          return (
            <button
              key={index}
              disabled={disabled}
              onClick={() => dateValue && onChange(dateValue)}
              className={[
                "aspect-square rounded-xl text-[13px] font-semibold transition",
                !day && "text-transparent",
                disabled && day && "cursor-not-allowed text-white/15",
                !disabled && !selected && "text-white/80 hover:bg-white/10",
                selected &&
                  "bg-[#E535AA] text-white shadow-[0_4px_18px_rgba(229,53,170,0.45)]",
              ].join(" ")}
            >
              {day || ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  multiline = false,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  multiline?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-bold uppercase tracking-[2px] text-white/35">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
            {icon}
          </div>
        )}

        {multiline ? (
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full resize-none rounded-[16px] border border-white/15 bg-white/10 px-4 py-4 text-[15px] text-white outline-none backdrop-blur-md placeholder:text-white/25 focus:border-[#E535AA]"
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className={[
              "w-full rounded-[16px] border border-white/15 bg-white/10 py-4 text-[15px] text-white outline-none backdrop-blur-md placeholder:text-white/25 focus:border-[#E535AA]",
              icon ? "pl-12 pr-4" : "px-4",
            ].join(" ")}
          />
        )}
      </div>
    </div>
  );
}

export default function ReservarPage() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [creatingAppointment, setCreatingAppointment] = useState(false);
  const [createdAppointmentId, setCreatedAppointmentId] = useState<string | null>(
    null,
  );

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [client, setClient] = useState<ClientData>({
    nombre: "",
    apellido: "",
    whatsapp: "",
    instagram: "",
    comentario: "",
  });

  useEffect(() => {
    const loadServices = async () => {
      setLoadingServices(true);
      setServicesError(null);

      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error loading services:", error);
        setServicesError("No pudimos cargar los servicios.");
        setLoadingServices(false);
        return;
      }

      setServices(data || []);
      setLoadingServices(false);
    };

    loadServices();
  }, []);

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];

    return ALL_SLOTS.filter(
      (slot) => !(OCCUPIED[selectedDate] || []).includes(slot),
    );
  }, [selectedDate]);

  const clientIsValid =
    client.nombre.trim().length > 1 &&
    client.apellido.trim().length > 1 &&
    client.whatsapp.trim().length > 5;

  const goBack = () => {
    if (step === 1) {
      window.location.href = "/";
      return;
    }

    setStep((current) => current - 1);
  };

  const handleCreateAppointment = async () => {
    if (
      !selectedService ||
      !selectedDate ||
      !selectedTime ||
      !clientIsValid ||
      creatingAppointment
    ) {
      return;
    }

    setCreatingAppointment(true);
    setCreatedAppointmentId(null);

    const phoneNormalized = normalizePhone(client.whatsapp);

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .upsert(
        {
          first_name: client.nombre.trim(),
          last_name: client.apellido.trim(),
          phone_raw: client.whatsapp.trim(),
          phone_normalized: phoneNormalized,
          instagram: client.instagram.trim() || null,
        },
        {
          onConflict: "phone_normalized",
        },
      )
      .select("id")
      .single();

    if (customerError || !customer) {
      console.error("Error saving customer:", customerError);
      alert("No pudimos guardar los datos de la clienta.");
      setCreatingAppointment(false);
      return;
    }

    const totalPrice = selectedService.price || 0;
    const depositAmount = selectedService.deposit_amount || 0;
    const remainingAmount = Math.max(totalPrice - depositAmount, 0);

    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .insert({
        customer_id: customer.id,
        service_id: selectedService.id,

        service_name_snapshot: selectedService.name,
        service_description_snapshot: selectedService.description,
        service_emoji_snapshot: selectedService.emoji,

        appointment_date: selectedDate,
        start_time: selectedTime,
        end_time: addMinutesToTime(
          selectedTime,
          selectedService.duration_minutes,
        ),

        status: "pending_payment",

        total_price_snapshot: totalPrice,
        deposit_amount_snapshot: depositAmount,
        deposit_paid: 0,
        remaining_amount: remainingAmount,
        remaining_paid: 0,

        customer_notes: client.comentario.trim() || null,
      })
      .select("id")
      .single();

    if (appointmentError || !appointment) {
      console.error("Error saving appointment:", appointmentError);
      alert("No pudimos crear el turno.");
      setCreatingAppointment(false);
      return;
    }

    setCreatedAppointmentId(appointment.id);

const preferenceResponse = await fetch("/api/mercadopago/create-preference", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    appointmentId: appointment.id,
  }),
});

const preferenceData = await preferenceResponse.json();

if (!preferenceResponse.ok || !preferenceData.initPoint) {
  console.error("Preference error:", preferenceData);
  alert("El turno se creó, pero no pudimos abrir Mercado Pago.");
  setCreatingAppointment(false);
  return;
}

window.location.href = preferenceData.initPoint;
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(160deg,#2A0E1E_0%,#4A1035_60%,#2A0E1E_100%)] px-5 py-6 text-white">
      <div className="pointer-events-none absolute right-[-120px] top-[-100px] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(229,53,170,0.16)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-[-120px] left-[-100px] h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(229,53,170,0.10)_0%,transparent_70%)]" />

      <div className="relative z-[1] mx-auto max-w-[480px]">
        {step === 1 && (
          <>
            <StepHeader step={1} title="Elegí tu servicio" onBack={goBack} />

            {loadingServices && (
              <div className="rounded-[22px] border border-white/15 bg-white/10 p-6 text-center text-sm text-white/55 backdrop-blur-md">
                Cargando servicios...
              </div>
            )}

            {servicesError && (
              <div className="rounded-[22px] border border-red-300/30 bg-red-400/15 p-6 text-center text-sm text-red-100 backdrop-blur-md">
                {servicesError}
              </div>
            )}

            {!loadingServices && !servicesError && services.length === 0 && (
              <div className="rounded-[22px] border border-yellow-300/30 bg-yellow-400/15 p-6 text-center text-sm text-yellow-100 backdrop-blur-md">
                No hay servicios activos cargados.
              </div>
            )}

            {!loadingServices && !servicesError && services.length > 0 && (
              <div className="flex flex-col gap-3">
                {services.map((service) => {
                  const active = selectedService?.id === service.id;

                  return (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={[
                        "w-full rounded-[22px] border-2 p-5 text-left backdrop-blur-md transition",
                        active
                          ? "border-[#E535AA] bg-[#E535AA]/20 shadow-[0_6px_28px_rgba(229,53,170,0.30)]"
                          : "border-white/15 bg-white/10 hover:bg-white/15",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={[
                            "flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-2xl text-[27px]",
                            active ? "bg-[#E535AA]/25" : "bg-white/10",
                          ].join(" ")}
                        >
                          {service.emoji || "💅"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="font-serif text-[19px] font-bold text-white/95">
                            {service.name}
                          </div>

                          <div className="mt-1 text-[12px] leading-5 text-white/35">
                            {service.description || "Servicio de uñas"}
                          </div>

                          <div className="mt-2 flex items-center gap-4">
                            <span className="inline-flex items-center gap-1 text-xs text-white/55">
                              <Clock size={12} />
                              {service.duration_minutes} min
                            </span>

                            <span className="text-[16px] font-extrabold text-[#FAD8F0]">
                              {priceLabel(service.price)}
                            </span>
                          </div>
                        </div>

                        <div
                          className={[
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition",
                            active
                              ? "border-[#E535AA] bg-[#E535AA]"
                              : "border-white/20 bg-transparent",
                          ].join(" ")}
                        >
                          {active && <Check size={14} strokeWidth={3} />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              disabled={!selectedService}
              onClick={() => selectedService && setStep(2)}
              className={[
                "mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-[15px] font-bold transition",
                selectedService
                  ? "bg-[linear-gradient(135deg,#E535AA,#B8147E)] text-white shadow-[0_6px_24px_rgba(229,53,170,0.45)] hover:scale-[1.01]"
                  : "cursor-not-allowed bg-white/10 text-white/30",
              ].join(" ")}
            >
              Continuar
              <ChevronRight size={17} />
            </button>

            <div className="mt-5 rounded-[18px] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <Sparkles
                  size={18}
                  className="mt-0.5 shrink-0 text-[#FAD8F0]"
                />

                <p className="text-sm leading-6 text-white/55">
                  En el próximo paso elegís fecha y horario disponible. Después
                  cargás tus datos y pagás la seña.
                </p>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <StepHeader step={2} title="Fecha y horario" onBack={goBack} />

            {selectedService && (
              <div className="mb-4 rounded-[18px] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
                <div className="text-xs font-bold uppercase tracking-[2px] text-white/35">
                  Servicio elegido
                </div>

                <div className="mt-1 flex items-center justify-between gap-3">
                  <div className="font-serif text-[20px] font-bold text-white/95">
                    {selectedService.emoji || "💅"} {selectedService.name}
                  </div>

                  <div className="text-sm font-bold text-[#FAD8F0]">
                    {priceLabel(selectedService.price)}
                  </div>
                </div>
              </div>
            )}

            <MiniCalendar
              value={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setSelectedTime(null);
              }}
            />

            {selectedDate && (
              <div className="mt-5">
                <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[2px] text-white/35">
                  <Clock size={14} className="text-[#FAD8F0]" />
                  Horarios disponibles
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => {
                    const active = selectedTime === slot;

                    return (
                      <button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        className={[
                          "rounded-[14px] border-2 py-3 text-[14px] font-bold transition",
                          active
                            ? "border-[#E535AA] bg-[#E535AA] text-white shadow-[0_4px_18px_rgba(229,53,170,0.45)]"
                            : "border-white/15 bg-white/10 text-white/80 hover:bg-white/15",
                        ].join(" ")}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              disabled={!selectedDate || !selectedTime}
              onClick={() => selectedDate && selectedTime && setStep(3)}
              className={[
                "mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-[15px] font-bold transition",
                selectedDate && selectedTime
                  ? "bg-[linear-gradient(135deg,#E535AA,#B8147E)] text-white shadow-[0_6px_24px_rgba(229,53,170,0.45)] hover:scale-[1.01]"
                  : "cursor-not-allowed bg-white/10 text-white/30",
              ].join(" ")}
            >
              Continuar
              <ChevronRight size={17} />
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <StepHeader step={3} title="Tus datos" onBack={goBack} />

            <div className="mb-4 rounded-[18px] border border-white/15 bg-white/10 p-4 backdrop-blur-md">
              <div className="text-xs font-bold uppercase tracking-[2px] text-white/35">
                Turno elegido
              </div>

              <div className="mt-2 text-[15px] font-bold text-white/90">
                {selectedService?.emoji || "💅"} {selectedService?.name}
              </div>

              <div className="mt-1 text-sm text-white/50">
                {selectedDate?.split("-").reverse().join("/")} · {selectedTime}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Field
                label="Nombre *"
                value={client.nombre}
                onChange={(value) => setClient({ ...client, nombre: value })}
                placeholder="Ej: Camila"
                icon={<User size={17} />}
              />

              <Field
                label="Apellido *"
                value={client.apellido}
                onChange={(value) => setClient({ ...client, apellido: value })}
                placeholder="Ej: Pérez"
                icon={<User size={17} />}
              />

              <Field
                label="WhatsApp *"
                value={client.whatsapp}
                onChange={(value) => setClient({ ...client, whatsapp: value })}
                placeholder="Ej: 2984 123456"
                type="tel"
                icon={<Phone size={17} />}
              />

              <Field
                label="Instagram"
                value={client.instagram}
                onChange={(value) => setClient({ ...client, instagram: value })}
                placeholder="Ej: @camiperez"
              />

              <Field
                label="Comentario"
                value={client.comentario}
                onChange={(value) =>
                  setClient({ ...client, comentario: value })
                }
                placeholder="Color, diseño, referencia o algo que quieras aclarar..."
                multiline
                icon={<MessageSquare size={17} />}
              />
            </div>

            <button
              disabled={!clientIsValid}
              onClick={() => clientIsValid && setStep(4)}
              className={[
                "mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-[15px] font-bold transition",
                clientIsValid
                  ? "bg-[linear-gradient(135deg,#E535AA,#B8147E)] text-white shadow-[0_6px_24px_rgba(229,53,170,0.45)] hover:scale-[1.01]"
                  : "cursor-not-allowed bg-white/10 text-white/30",
              ].join(" ")}
            >
              Ver resumen
              <ChevronRight size={17} />
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <StepHeader step={4} title="Resumen" onBack={goBack} />

            <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <div className="mb-4 text-xs font-bold uppercase tracking-[3px] text-[#FAD8F0]">
                Magnolia Beauty
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[2px] text-white/35">
                    Servicio
                  </div>
                  <div className="mt-1 font-serif text-2xl font-bold text-white">
                    {selectedService?.emoji || "💅"} {selectedService?.name}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[2px] text-white/35">
                      Fecha
                    </div>
                    <div className="mt-1 text-[15px] font-bold text-white/90">
                      {selectedDate?.split("-").reverse().join("/")}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[2px] text-white/35">
                      Horario
                    </div>
                    <div className="mt-1 text-[15px] font-bold text-white/90">
                      {selectedTime}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-[11px] font-bold uppercase tracking-[2px] text-white/35">
                    Clienta
                  </div>
                  <div className="mt-1 text-[15px] font-bold text-white/90">
                    {client.nombre} {client.apellido}
                  </div>
                  <div className="mt-1 text-sm text-white/50">
                    WhatsApp: {client.whatsapp}
                  </div>
                  {client.instagram && (
                    <div className="mt-1 text-sm text-white/50">
                      Instagram: {client.instagram}
                    </div>
                  )}
                </div>

                {selectedService && (
                  <div className="rounded-2xl border border-[#E535AA]/30 bg-[#E535AA]/15 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[2px] text-white/35">
                      Seña
                    </div>

                    <div className="mt-1 text-[18px] font-bold text-[#FAD8F0]">
                      {selectedService.deposit_amount > 0
                        ? money(selectedService.deposit_amount)
                        : "A confirmar"}
                    </div>

                    <div className="mt-1 text-xs text-white/45">
                      El saldo restante se abona el día del turno.
                    </div>
                  </div>
                )}

                {client.comentario && (
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[2px] text-white/35">
                      Comentario
                    </div>
                    <div className="mt-1 text-sm leading-6 text-white/65">
                      {client.comentario}
                    </div>
                  </div>
                )}

                {createdAppointmentId && (
                  <div className="rounded-2xl border border-emerald-300/30 bg-emerald-400/15 p-4">
                    <div className="text-sm font-bold text-emerald-100">
                      Turno creado en Supabase ✅
                    </div>
                    <div className="mt-1 break-all text-xs text-emerald-100/70">
                      ID: {createdAppointmentId}
                    </div>
                  </div>
                )}

                <button
                  disabled={creatingAppointment}
                  onClick={handleCreateAppointment}
                  className={[
                    "flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-[15px] font-bold text-white shadow-[0_6px_24px_rgba(0,158,227,0.35)] transition",
                    creatingAppointment
                      ? "cursor-wait bg-[#5C8FBF]"
                      : "bg-[#009EE3] hover:scale-[1.01]",
                  ].join(" ")}
                >
                  {creatingAppointment
                    ? "Creando turno..."
                    : "Continuar a Mercado Pago"}
                  <ChevronRight size={17} />
                </button>

                <p className="text-center text-xs leading-5 text-white/35">
                  Ahora crea el turno en Supabase. Después conectamos Mercado
                  Pago real para cobrar la seña.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}