// Devuelve "AAAA-MM-DD" en hora local (no UTC)
export function toAMD(date) {
  const a = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${a}-${m}-${d}`;
}

// Parsea "AAAA-MM-DD" a Date en horario local
export function parseAMD(amd) {
  const [a, m, d] = amd.split('-').map(Number);
  return new Date(a, m - 1, d);
}

// Formatea "AAAA-MM-DD" legible en español (local)
export function formatDate(amd) {
  const date = parseAMD(amd);
  return date.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Crea Date local desde "AAAA-MM-DD" + "HH:mm"
export function parseDateTimeLocal(amd, time) {
  const [a, m, d] = amd.split('-').map(Number);
  const [hh, mm = '00'] = time.split(':').map(Number);
  return new Date(a, m - 1, d, hh, mm);
}