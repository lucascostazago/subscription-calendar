const BACKEND_URL = "http://localhost:3001";

export type Recorrencia = "mensal" | "trimestral" | "semestral" | "anual";

export interface Assinatura {
  _id: string;
  userId: string;
  nome: string;
  diaRenovacao: string;
  preco: string;
  recorrencia: Recorrencia;
  logoUrl: string;
  mesInicio?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CriarAssinaturaPayload {
  nome: string;
  diaRenovacao: string;
  preco: string;
  recorrencia: Recorrencia;
  logoUrl?: string;
  mesInicio?: number;
}

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchAssinaturas(): Promise<Assinatura[]> {
  const res = await fetch(`${BACKEND_URL}/subscriptions`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Erro ao buscar assinaturas: ${res.status}`);
  }
  const data = await res.json();
  return data.subscriptions ?? [];
}

/** Converte preço em formato BRL (ex: "1.234,56") para número */
export function parsePrecoBRL(preco: string): number {
  if (!preco || typeof preco !== "string") return 0;
  const normalized = preco.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

/** Retorna true se a assinatura renova em algum dia do mês (month 0-11, year) */
export function assinaturaRenovaNoMes(a: Assinatura, month: number, year: number): boolean {
  const dia = parseInt(a.diaRenovacao, 10);
  if (isNaN(dia)) return false;
  return assinaturaApareceNoDia(a, month, year, dia);
}

/** Soma dos preços das assinaturas que renovam no mês (month 0-11, year) */
export function getMonthlyTotal(assinaturas: Assinatura[], month: number, year: number): number {
  return assinaturas
    .filter((a) => assinaturaRenovaNoMes(a, month, year))
    .reduce((sum, a) => sum + parsePrecoBRL(a.preco), 0);
}

/** Formata número para exibição em Real (ex: 1234.56 -> "1.234,56") */
export function formatPrecoBRL(value: number): string {
  const [inteiro = "0", dec = "00"] = value.toFixed(2).split(".");
  const inteiroFormatado = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${inteiroFormatado},${dec}`;
}

/** Retorna true se a assinatura deve aparecer no dia (day) do mês (month 0-11) e ano (year) */
export function assinaturaApareceNoDia(
  a: Assinatura,
  month: number,
  year: number,
  day: number
): boolean {
  const dia = parseInt(a.diaRenovacao, 10);
  if (isNaN(dia) || day !== dia) return false;

  const mes = month; // 0-11
  const mesInicio = (a.mesInicio ?? 1) - 1; // 0-11

  switch (a.recorrencia) {
    case "mensal":
      return true;
    case "trimestral":
      return (mes - mesInicio + 12) % 3 === 0;
    case "semestral":
      return (mes - mesInicio + 12) % 6 === 0;
    case "anual":
      return mes === mesInicio;
    default:
      return true;
  }
}

export async function criarAssinatura(payload: CriarAssinaturaPayload): Promise<Assinatura> {
  const res = await fetch(`${BACKEND_URL}/subscriptions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Erro ao criar assinatura: ${res.status}`);
  }
  const data = await res.json();
  return data.subscription;
}
