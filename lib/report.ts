import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

// ── Marca ────────────────────────────────────────────────────────────────
const C = {
  navy: rgb(11 / 255, 29 / 255, 58 / 255),
  blue: rgb(21 / 255, 101 / 255, 255 / 255),
  cyan: rgb(0, 194 / 255, 255 / 255),
  orange: rgb(255 / 255, 107 / 255, 94 / 255),
  green: rgb(34 / 255, 197 / 255, 94 / 255),
  ink: rgb(11 / 255, 29 / 255, 58 / 255),
  muted: rgb(90 / 255, 107 / 255, 133 / 255),
  faint: rgb(147 / 255, 165 / 255, 196 / 255),
  border: rgb(227 / 255, 234 / 255, 245 / 255),
  soft: rgb(235 / 255, 241 / 255, 255 / 255),
  bg: rgb(246 / 255, 249 / 255, 254 / 255),
  white: rgb(1, 1, 1),
  navySoft: rgb(90 / 255, 118 / 255, 153 / 255),
};

const fmtCLP = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

// ── Tipos ────────────────────────────────────────────────────────────────
export interface ReportData {
  name: string;
  company?: string;
  rubro?: string;
  fecha: string;
  indice: number;
  nivel: string;
  areas: { corto: string; friccion: number }[];
  abiertas: { pregunta: string; respuesta: string }[];
  ahorro:
    | { horas: number; semana: number; mes: number; anual: number; procesos: { nombre: string; ahorroCLPMes: number }[] }
    | null;
  scheduleUrl: string;
}

function nivelColor(nivel: string) {
  const n = nivel.toLowerCase();
  if (n.includes("alta")) return C.orange;
  if (n.includes("media")) return C.cyan;
  return C.green;
}

/** Extrae los datos del informe desde el `meta` guardado por el diagnóstico. */
export function reportDataFromLead(lead: {
  name?: string;
  company?: string;
  meta?: Record<string, unknown> | null;
}): ReportData | null {
  const meta = (lead.meta ?? {}) as Record<string, unknown>;
  const indice = meta.indiceFriccion;
  if (typeof indice !== "number") return null;

  const areasRaw = Array.isArray(meta.areas) ? (meta.areas as Record<string, unknown>[]) : [];
  const areas = areasRaw
    .map((a) => ({ corto: String(a.corto ?? a.area ?? ""), friccion: typeof a.friccion === "number" ? a.friccion : -1 }))
    .filter((a) => a.corto && a.friccion >= 0)
    .sort((x, y) => y.friccion - x.friccion);

  const abiertasRaw = Array.isArray(meta.abiertas) ? (meta.abiertas as Record<string, unknown>[]) : [];
  const abiertas = abiertasRaw
    .map((a) => ({ pregunta: String(a.pregunta ?? ""), respuesta: String(a.respuesta ?? "").trim() }))
    .filter((a) => a.pregunta && a.respuesta);

  let ahorro: ReportData["ahorro"] = null;
  const a = meta.ahorro as Record<string, unknown> | null | undefined;
  if (a && typeof a === "object" && a.totales) {
    const t = a.totales as Record<string, number>;
    const procesos = Array.isArray(a.procesos) ? (a.procesos as Record<string, unknown>[]) : [];
    ahorro = {
      horas: Number(t.horas) || 0,
      semana: Number(t.semana) || 0,
      mes: Number(t.mes) || 0,
      anual: Number(t.anual) || 0,
      procesos: procesos.map((p) => ({
        nombre: String(p.nombre || "Proceso"),
        ahorroCLPMes: Number(p.ahorroCLPMes) || 0,
      })),
    };
  }

  const fecha = new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Santiago",
  }).format(new Date());

  return {
    name: lead.name || "",
    company: lead.company || (typeof meta.empresa === "string" ? meta.empresa : undefined),
    rubro: typeof meta.rubro === "string" ? meta.rubro : undefined,
    fecha,
    indice,
    nivel: typeof meta.nivelFriccion === "string" ? meta.nivelFriccion : "",
    areas,
    abiertas,
    ahorro,
    scheduleUrl: process.env.SCHEDULE_URL || "https://www.nubolabs.cl",
  };
}

// ── Helpers de dibujo ──────────────────────────────────────────────────────
// Isotipo Nubolabs (nube + "N" de nodos). Paths del componente Logo.tsx.
const LOGO_CLOUD =
  "M32 70 C20 70 11 61 11 50 C11 41 17 34 26 32 C28 20 38 11 50 11 C60 11 69 17 73 26 C76 24 79 23 83 23 C93 23 101 31 101 41 C107 44 111 50 111 57 C111 64.5 105 70 97 70 Z";
const LOGO_N = "M42 78 L42 44 L70 68 L70 40";

function drawLogo(page: PDFPage, x: number, topY: number, scale: number) {
  // topY = coordenada Y (sistema PDF, hacia arriba) del borde SUPERIOR del logo.
  const map = (sx: number, sy: number) => ({ x: x + sx * scale, y: topY - sy * scale });
  page.drawSvgPath(LOGO_CLOUD, { x, y: topY, scale, borderColor: C.white, borderWidth: 9 * scale });
  page.drawSvgPath(LOGO_N, { x, y: topY, scale, borderColor: C.white, borderWidth: 9 * scale });
  const bottom = map(42, 87);
  const top = map(70, 30);
  page.drawCircle({ x: bottom.x, y: bottom.y, size: 8 * scale, color: C.orange });
  page.drawCircle({ x: top.x, y: top.y, size: 8 * scale, color: C.cyan });
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// ── Generación del PDF ─────────────────────────────────────────────────────
export async function buildReportPdf(data: ReportData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle("Informe de diagnóstico operativo — Nubolabs");
  doc.setAuthor("Nubolabs");
  doc.setSubject(`Índice de fricción ${data.indice} · ${data.nivel}`);

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const W = 595.28;
  const H = 841.89;
  const M = 46;
  const CW = W - M * 2; // ancho de contenido

  let page = doc.addPage([W, H]);
  let y = 0;

  const text = (
    p: PDFPage,
    s: string,
    x: number,
    yy: number,
    size: number,
    f: PDFFont,
    color = C.ink,
  ) => p.drawText(s, { x, y: yy, size, font: f, color });

  // Cabecera navy con logo
  const drawHeader = (p: PDFPage) => {
    const hb = 120;
    p.drawRectangle({ x: 0, y: H - hb, width: W, height: hb, color: C.navy });
    drawLogo(p, M, H - 34, 0.3);
    text(p, "Nubolabs", M + 46, H - 52, 20, bold, C.white);
    text(p, "INFORME DE DIAGNÓSTICO OPERATIVO", M, H - 84, 10, bold, C.cyan);
    text(p, "Tu operación, en piloto automático.", M, H - 100, 9.5, font, C.navySoft);
    const dw = bold.widthOfTextAtSize(data.fecha, 9.5);
    text(p, data.fecha, W - M - dw, H - 100, 9.5, font, C.navySoft);
  };
  drawHeader(page);
  y = H - 120 - 34;

  const ensure = (need: number) => {
    if (y - need < M + 26) {
      // pie de página en la actual, luego nueva página
      drawFooter(page);
      page = doc.addPage([W, H]);
      drawHeader(page);
      y = H - 120 - 34;
    }
  };

  const drawFooter = (p: PDFPage) => {
    p.drawLine({ start: { x: M, y: M + 18 }, end: { x: W - M, y: M + 18 }, thickness: 0.75, color: C.border });
    text(p, "nubolabs.cl", M, M + 4, 9, bold, C.blue);
    const disc = "Resultado referencial. En la sesión lo revisamos contigo y lo traducimos a oportunidades concretas.";
    const dw = font.widthOfTextAtSize(disc, 8);
    text(p, disc, W - M - dw, M + 4, 8, font, C.faint);
  };

  // Saludo
  const saludo = data.name ? `Hola ${data.name.split(" ")[0]},` : "Hola,";
  text(page, saludo, M, y, 20, bold, C.ink);
  y -= 24;
  const introLines = wrapText(
    `Este es el resultado de tu diagnóstico operativo${
      data.company ? ` para ${data.company}` : ""
    }. Refleja dónde se está trabando la operación hoy y dónde la automatización tendría más impacto.`,
    font,
    11,
    CW,
  );
  introLines.forEach((l) => {
    text(page, l, M, y, 11, font, C.muted);
    y -= 15;
  });
  y -= 14;

  // Bloque índice de fricción (tarjeta navy)
  const idxH = 100;
  ensure(idxH + 12);
  page.drawRectangle({ x: M, y: y - idxH, width: CW, height: idxH, color: C.navy });
  text(page, "TU ÍNDICE DE FRICCIÓN", M + 24, y - 28, 10, bold, C.cyan);
  text(page, String(data.indice), M + 24, y - 74, 44, bold, C.white);
  const idxW = bold.widthOfTextAtSize(String(data.indice), 44);
  text(page, "/ 100", M + 24 + idxW + 10, y - 68, 13, font, C.navySoft);
  if (data.nivel) {
    // Badge a la derecha, centrado verticalmente con el número (evita tapar el label).
    const nc = nivelColor(data.nivel);
    const up = data.nivel.toUpperCase();
    const bw = bold.widthOfTextAtSize(up, 11) + 24;
    const bx = M + CW - 24 - bw;
    page.drawRectangle({ x: bx, y: y - 71, width: bw, height: 26, color: nc });
    text(page, up, bx + 12, y - 62.5, 11, bold, C.navy);
  }
  text(
    page,
    "0 = sin fricción   ·   100 = la operación se traba a diario",
    M + 24,
    y - 90,
    9,
    font,
    C.navySoft,
  );
  y -= idxH + 26;

  // Fricción por área (barras)
  ensure(30 + data.areas.length * 22);
  text(page, "FRICCIÓN POR ÁREA", M, y, 11, bold, C.ink);
  y -= 20;
  const labelW = 150;
  const barX = M + labelW;
  const barMax = CW - labelW - 44;
  data.areas.forEach((a) => {
    ensure(22);
    text(page, a.corto, M, y - 9, 10.5, font, C.ink);
    page.drawRectangle({ x: barX, y: y - 12, width: barMax, height: 8, color: C.soft });
    const w = Math.max(2, (a.friccion / 100) * barMax);
    page.drawRectangle({ x: barX, y: y - 12, width: w, height: 8, color: a.friccion >= 60 ? C.orange : C.cyan });
    const vs = String(a.friccion);
    text(page, vs, barX + barMax + 12, y - 9, 10.5, bold, a.friccion >= 60 ? C.orange : C.ink);
    y -= 22;
  });
  y -= 10;

  // Áreas críticas (callout)
  const criticas = data.areas.filter((a) => a.friccion >= 60).slice(0, 3);
  const focos = (criticas.length ? criticas : data.areas.slice(0, 2)).map((a) => a.corto);
  if (focos.length) {
    const lines = wrapText(focos.join("  ·  "), bold, 11, CW - 32);
    const boxH = 30 + lines.length * 15;
    ensure(boxH + 12);
    page.drawRectangle({ x: M, y: y - boxH, width: CW, height: boxH, color: C.soft });
    page.drawRectangle({ x: M, y: y - boxH, width: 4, height: boxH, color: C.orange });
    text(page, criticas.length ? "ÁREAS MÁS CRÍTICAS" : "ÁREAS A OBSERVAR", M + 18, y - 20, 9.5, bold, C.blue);
    let ly = y - 36;
    lines.forEach((l) => {
      text(page, l, M + 18, ly, 11, bold, C.navy);
      ly -= 15;
    });
    y -= boxH + 24;
  }

  // En tus palabras (opcional)
  if (data.abiertas.length) {
    ensure(40);
    text(page, "EN TUS PALABRAS", M, y, 11, bold, C.ink);
    y -= 18;
    data.abiertas.forEach((qa) => {
      const qLines = wrapText(qa.pregunta, bold, 9.5, CW);
      const aLines = wrapText(`“${qa.respuesta}”`, font, 10.5, CW);
      ensure(qLines.length * 13 + aLines.length * 14 + 12);
      qLines.forEach((l) => {
        text(page, l, M, y, 9.5, bold, C.muted);
        y -= 13;
      });
      aLines.forEach((l) => {
        text(page, l, M, y, 10.5, font, C.ink);
        y -= 14;
      });
      y -= 10;
    });
    y -= 4;
  }

  // Ahorro estimado (opcional)
  if (data.ahorro && data.ahorro.mes > 0) {
    const ah = data.ahorro;
    const boxH = 118;
    ensure(boxH + 12);
    page.drawRectangle({ x: M, y: y - boxH, width: CW, height: boxH, color: C.navy });
    text(page, "AHORRO ESTIMADO AUTOMATIZANDO", M + 24, y - 26, 10, bold, C.cyan);
    text(page, fmtCLP.format(ah.mes), M + 24, y - 60, 30, bold, C.cyan);
    text(page, "estimado al mes", M + 24, y - 76, 9.5, font, C.navySoft);

    const col2 = M + CW / 2 + 10;
    text(page, fmtCLP.format(ah.anual), col2, y - 54, 17, bold, C.orange);
    text(page, "proyección anual", col2, y - 68, 9, font, C.navySoft);
    text(page, `${ah.horas} h/mes automatizables`, col2, y - 88, 9.5, font, C.white);
    text(
      page,
      `${ah.procesos.length} ${ah.procesos.length === 1 ? "proceso analizado" : "procesos analizados"}`,
      M + 24,
      y - 96,
      9,
      font,
      C.navySoft,
    );
    y -= boxH + 24;
  }

  // CTA agendar
  const ctaH = 74;
  ensure(ctaH + 12);
  page.drawRectangle({ x: M, y: y - ctaH, width: CW, height: ctaH, color: C.blue });
  text(page, "El siguiente paso: tu sesión de diagnóstico", M + 24, y - 28, 14, bold, C.white);
  const ctaSub = wrapText(
    "Agendemos 30 minutos para revisar juntos estos resultados y priorizar qué automatizar primero. Responde el correo con este informe o escríbenos.",
    font,
    9.5,
    CW - 48,
  );
  let cy = y - 44;
  ctaSub.forEach((l) => {
    text(page, l, M + 24, cy, 9.5, font, rgb(0.85, 0.9, 1));
    cy -= 12;
  });
  y -= ctaH + 20;

  drawFooter(page);

  return doc.save();
}
