// Devuelve "AAAA-MM-DD" en hora local (no UTC)
export function toAMD(date) {
  if (!(date instanceof Date) || isNaN(date)) return "";
  const a = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${a}-${m}-${d}`;
}

// Parsea "AAAA-MM-DD" a Date en horario local (si falla, devuelve Invalid Date)
export function parseAMD(amd) {
  if (!amd || typeof amd !== "string" || !amd.includes("-")) {
    return new Date("Invalid Date");
  }
  const [a, m, d] = amd.split("-").map(Number);
  return new Date(a, m - 1, d);
}

// Formatea "AAAA-MM-DD" legible en español (local)
export function formatDate(amd) {
  const date = parseAMD(amd);
  if (isNaN(date)) return "Fecha inválida";
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Crea Date local desde "AAAA-MM-DD" + "HH:mm"
// Si falta fecha u hora, devuelve Invalid Date
export function parseDateTimeLocal(amd, time) {
  if (!amd || !time) {
    return new Date("Invalid Date");
  }

  if (typeof amd !== "string" || !amd.includes("-")) {
    return new Date("Invalid Date");
  }

  const [a, m, d] = amd.split("-").map(Number);

  // Hora puede venir "hh:mm" o "hh"
  const [hh, mm = "00"] = time.split(":").map(Number);

  return new Date(a, m - 1, d, hh, mm);
}