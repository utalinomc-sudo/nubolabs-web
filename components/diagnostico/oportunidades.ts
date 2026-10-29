// Mapa de oportunidades del diagnóstico (cambio diagnostico-mapa-oportunidades, design.md decisiones 1 a 3).
// Puro, sin "use client" ni "server-only": lo usan /diagnostico, POST /api/leads, el informe PDF, la ficha interna y el
// panel. Agrupa las 6 áreas del cuestionario en 4 dimensiones de negocio; las preguntas y la escala no cambian.
import { ABIERTAS, AREAS, nivelFriccion } from "./cuestionario";

export type AreaId = "carga" | "plazos" | "info" | "procesos" | "conocimiento" | "clientes";
export type DimensionId = "ventas" | "control" | "orden" | "equipo";
export type OpportunityLevel = "alta" | "media" | "baja";

export interface Dimension {
  id: DimensionId;
  nombre: string;
  areas: AreaId[];
  logro: string; // "lo que puedes lograr"
  proximoPaso: string;
}

// Orden de la tabla de la spec: también desempata las oportunidades principales.
export const DIMENSIONS: readonly Dimension[] = [
  {
    id: "ventas",
    nombre: "Ventas y clientes",
    areas: ["clientes"],
    logro: "Vendes más: respondes antes y ningún cliente queda sin seguimiento.",
    proximoPaso: "Responder consultas y cotizaciones el mismo día, con seguimiento automático.",
  },
  {
    id: "control",
    nombre: "Control y números",
    areas: ["info"],
    // Cambio enfoque-soluciones-a-medida: la dimensión habla de decidir con datos y de un reporte claro.
    logro: "Decides con datos: ventas, costos y pendientes al día, sin pedir informes.",
    proximoPaso: "Tener ventas, costos y cobranzas al día en un reporte claro.",
  },
  {
    id: "orden",
    nombre: "Orden y seguimiento",
    areas: ["plazos", "procesos"],
    logro: "Nada se olvida: cobros, plazos y tareas avanzan a tiempo.",
    proximoPaso: "Que cobros, plazos y tareas recurrentes avancen solos, con avisos a tiempo.",
  },
  {
    id: "equipo",
    nombre: "Equipo y crecimiento",
    areas: ["carga", "conocimiento"],
    logro: "Creces sin desordenarte: más clientes sin que el equipo colapse.",
    proximoPaso: "Liberar al equipo de la pega repetitiva y dejar escrito cómo se hacen las cosas.",
  },
];

export const OPPORTUNITY_LABELS: Record<OpportunityLevel, string> = {
  alta: "Oportunidad alta",
  media: "Oportunidad media",
  baja: "Oportunidad baja",
};

export interface OpportunityMap {
  dimensiones: { id: DimensionId; nombre: string; puntaje: number | null; nivel: OpportunityLevel | null }[];
  principales: DimensionId[]; // hasta 3
  proximoPaso: string; // "" si no hay ninguna respuesta
}

type AreaScores = Partial<Record<AreaId, number>>;

const AREA_IDS = new Set<string>(AREAS.map((a) => a.id));
const isAreaId = (v: unknown): v is AreaId => typeof v === "string" && AREA_IDS.has(v);

// Puntaje de un área: round(((promedio − 1) / 4) × 100). Sin respuestas → null.
export function areaScore(respuestas: (number | null)[]): number | null {
  const vals = respuestas.filter((v): v is number => typeof v === "number");
  if (!vals.length) return null;
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
  return Math.round(((avg - 1) / 4) * 100);
}

export function opportunityLevel(score: number): OpportunityLevel {
  return score >= 60 ? "alta" : score >= 35 ? "media" : "baja";
}

// Área de una entrada de `meta.areas`: por `id`, después por nombre y después por nombre corto (en ese orden).
function findAreaId(a: Record<string, unknown>): AreaId | undefined {
  if (isAreaId(a.id)) return a.id;
  const porNombre = AREAS.find((x) => x.nombre === a.area)?.id;
  if (isAreaId(porNombre)) return porNombre;
  const porCorto = AREAS.find((x) => x.corto === a.corto)?.id;
  return isAreaId(porCorto) ? porCorto : undefined;
}

// Puntajes por área desde el `meta` guardado: formato nuevo (`areas[].id`) o antiguo (nombre o nombre corto del área).
// Ignora entradas sin un puntaje válido (número de 0 a 100); la primera de cada área gana.
export function areaScoresFromMeta(meta: unknown): AreaScores {
  const out: AreaScores = {};
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return out;
  const areas = (meta as Record<string, unknown>).areas;
  if (!Array.isArray(areas)) return out;
  for (const raw of areas) {
    if (!raw || typeof raw !== "object") continue;
    const a = raw as Record<string, unknown>;
    const id = findAreaId(a);
    const score = a.friccion;
    if (!isAreaId(id) || typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 100) continue;
    if (out[id] === undefined) out[id] = score;
  }
  return out;
}

export function buildOpportunityMap(scores: AreaScores): OpportunityMap {
  const dimensiones = DIMENSIONS.map((d) => {
    const vals = d.areas.map((a) => scores[a]).filter((v): v is number => typeof v === "number");
    const puntaje = vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null;
    return { id: d.id, nombre: d.nombre, puntaje, nivel: puntaje === null ? null : opportunityLevel(puntaje) };
  });
  // Orden estable: a igual puntaje queda primero la que va antes en la tabla.
  const conDatos = dimensiones.filter((d) => d.puntaje !== null).sort((x, y) => (y.puntaje ?? 0) - (x.puntaje ?? 0));
  const relevantes = conDatos.filter((d) => d.nivel === "alta" || d.nivel === "media").slice(0, 3);
  const principales = (relevantes.length ? relevantes : conDatos.slice(0, 1)).map((d) => d.id);
  const proximoPaso = principales.length ? (DIMENSIONS.find((d) => d.id === principales[0])?.proximoPaso ?? "") : "";
  return { dimensiones, principales, proximoPaso };
}

// Primera pregunta abierta antes de este cambio: un visitante con la página vieja abierta todavía puede enviarla.
const LEGACY_ABIERTAS = ["De todo lo anterior, ¿cuál es el problema que más tiempo le quita al equipo hoy?"];
const KNOWN_ABIERTAS = new Set<string>([...ABIERTAS.map((a) => a.label), ...LEGACY_ABIERTAS]);
const MAX_RESPUESTA = 1000;
const MAX_RUBRO = 120;

const isRecordLike = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const validScore = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100 ? Math.round(v) : null;
const validAnswer = (v: unknown): number | null => (typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 5 ? v : null);

// Lo que se guarda en el lead (y lo que dibuja el PDF): el meta rearmado en el servidor con una lista blanca de campos
// (cambio diagnostico-mapa-oportunidades, design.md decisión 3 y revisión adversarial):
// - las 6 áreas del cuestionario con su nombre y las respuestas válidas (1 a 5); el puntaje sale de las respuestas y,
//   solo si un área no trae ninguna, del `friccion` recibido (formato antiguo o mínimo);
// - índice de fricción recalculado, solo preguntas abiertas conocidas, el mapa calculado y sin `ahorro`.
// No muta la entrada.
export function normalizeDiagnosticMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const recibidas = new Map<AreaId, Record<string, unknown>>();
  for (const raw of Array.isArray(meta.areas) ? meta.areas : []) {
    if (!isRecordLike(raw)) continue;
    const id = findAreaId(raw);
    if (id && !recibidas.has(id)) recibidas.set(id, raw);
  }

  const todas: number[] = [];
  const areas = AREAS.map((a) => {
    const raw = recibidas.get(a.id as AreaId);
    const rawResp = raw && Array.isArray(raw.respuestas) ? raw.respuestas : [];
    const respuestas = a.preguntas.map((pregunta, qi) => {
      const r = rawResp[qi];
      return { pregunta, valor: validAnswer(isRecordLike(r) ? r.valor : null) };
    });
    const valores = respuestas.map((r) => r.valor).filter((v): v is number => v !== null);
    todas.push(...valores);
    const promedio = valores.length ? Math.round((valores.reduce((x, v) => x + v, 0) / valores.length) * 100) / 100 : null;
    const friccion = valores.length ? areaScore(valores) : validScore(raw?.friccion);
    return { id: a.id, area: a.nombre, corto: a.corto, promedio, friccion, respuestas };
  });

  const out: Record<string, unknown> = {};
  if (typeof meta.rubro === "string" && meta.rubro.trim()) out.rubro = meta.rubro.trim().slice(0, MAX_RUBRO);
  const indice = todas.length ? areaScore(todas) : validScore(meta.indiceFriccion);
  if (indice !== null) {
    out.indiceFriccion = indice;
    out.nivelFriccion = nivelFriccion(indice).txt;
  }
  out.areas = areas;

  const vistas = new Set<string>();
  out.abiertas = (Array.isArray(meta.abiertas) ? meta.abiertas : [])
    .filter(isRecordLike)
    .filter((x) => typeof x.pregunta === "string" && KNOWN_ABIERTAS.has(x.pregunta) && !vistas.has(x.pregunta) && !!vistas.add(x.pregunta))
    .map((x) => ({ pregunta: x.pregunta as string, respuesta: typeof x.respuesta === "string" ? x.respuesta.trim().slice(0, MAX_RESPUESTA) : "" }));

  out.oportunidades = { version: 1, ...buildOpportunityMap(areaScoresFromMeta({ areas })) };
  return out;
}

// Resumen interno del lead (panel y aviso por correo), armado en el servidor desde el meta ya normalizado.
export function diagnosticSummary(meta: Record<string, unknown>): string {
  const mapa = meta.oportunidades as OpportunityMap | undefined;
  const mayor = dimensionName(mapa?.principales?.[0]);
  const indice = typeof meta.indiceFriccion === "number" ? meta.indiceFriccion : null;
  const nivel = typeof meta.nivelFriccion === "string" ? meta.nivelFriccion.toLowerCase() : "";
  return `Autodiagnóstico — Mayor oportunidad: ${mayor ?? "sin datos"}.` + (indice !== null ? ` Índice de fricción ${indice} (${nivel}).` : "");
}

// Áreas guardadas en un lead, leídas sin confiar en su forma (detalle y ficha interna): nombre por `id` si falta,
// respuestas solo si son una lista y puntaje válido o null. Así un lead mínimo o antiguo nunca rompe esas vistas.
export interface StoredArea {
  area: string;
  corto: string;
  friccion: number | null;
  respuestas: { pregunta: string; valor: number | null }[];
}
export function storedAreas(meta: unknown): StoredArea[] {
  if (!isRecordLike(meta) || !Array.isArray(meta.areas)) return [];
  return meta.areas.filter(isRecordLike).map((a) => {
    const def = AREAS.find((x) => x.id === findAreaId(a));
    const area = typeof a.area === "string" && a.area.trim() ? a.area : (def?.nombre ?? "Área sin nombre");
    const corto = typeof a.corto === "string" && a.corto.trim() ? a.corto : (def?.corto ?? area);
    const respuestas = (Array.isArray(a.respuestas) ? a.respuestas : [])
      .filter(isRecordLike)
      .map((r) => ({ pregunta: typeof r.pregunta === "string" ? r.pregunta : "", valor: validAnswer(r.valor) }));
    return { area, corto, friccion: validScore(a.friccion), respuestas };
  });
}

// Mapa de un lead guardado para el panel, el detalle y la ficha interna. Se recalcula siempre desde `meta.areas`
// (es lo mismo que guardó el servidor y sirve igual para los leads antiguos, que no tienen `oportunidades`).
// Sin áreas con puntaje → null (formulario o diagnóstico incompleto).
export function mapFromMeta(meta: unknown): OpportunityMap | null {
  const scores = areaScoresFromMeta(meta);
  return Object.keys(scores).length ? buildOpportunityMap(scores) : null;
}

export function dimensionName(id: unknown): string | null {
  return DIMENSIONS.find((d) => d.id === id)?.nombre ?? null;
}
