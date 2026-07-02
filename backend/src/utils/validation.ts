const REGEX_SOMENTE_DIGITOS = /^\d+$/;
const REGEX_NOME_APENAS_LETRAS_ESPACOS = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

export function telefoneSomenteNumeros(telefone?: string): boolean {
  const valor = String(telefone || "").trim();
  return valor.length > 0 && REGEX_SOMENTE_DIGITOS.test(valor);
}

export function nomeSemNumerosESimbolos(nome?: string): boolean {
  const valor = String(nome || "").trim();
  return valor.length >= 2 && REGEX_NOME_APENAS_LETRAS_ESPACOS.test(valor);
}
