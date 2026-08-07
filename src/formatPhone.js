// Formata o telefone enquanto a pessoa digita. Não valida país, só
// deixa mais legível — funciona bem tanto pro formato canadense
// (10 dígitos: DDD de 3 + 7) quanto pro brasileiro (11 dígitos:
// DDD de 2 + 9, celular com o 9 na frente).
export function formatPhone(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  const len = digits.length;

  if (len === 0) return "";
  if (len <= 3) return `(${digits}`;
  if (len <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (len <= 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
