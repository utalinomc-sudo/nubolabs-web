import "server-only";
import { siteSlogan } from "@/lib/content";
import { winAnsiDeep } from "@/lib/pdfText";
import {
  DIMENSIONS,
  OPPORTUNITY_LABELS,
  areaScoresFromMeta,
  buildOpportunityMap,
  type OpportunityMap,
} from "@/components/diagnostico/oportunidades";
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

// ── Tipos ────────────────────────────────────────────────────────────────
// Informe al cliente con su mapa de oportunidades (cambio diagnostico-mapa-oportunidades, design.md decisión 4):
// sin índice de fricción ni montos, aunque el `meta` traiga un `ahorro` antiguo.
export interface ReportData {
  name: string;
  company?: string;
  rubro?: string;
  fecha: string;
  mapa: OpportunityMap;
  abiertas: { pregunta: string; respuesta: string }[];
  scheduleUrl: string;
}

/** Extrae los datos del informe desde el `meta` del diagnóstico (formato nuevo o antiguo). Sin áreas con puntaje → null. */
export function reportDataFromLead(lead: {
  name?: string;
  company?: string;
  meta?: Record<string, unknown> | null;
}): ReportData | null {
  const meta = (lead.meta ?? {}) as Record<string, unknown>;
  const scores = areaScoresFromMeta(meta);
  if (Object.keys(scores).length === 0) return null;

  const abiertasRaw = Array.isArray(meta.abiertas) ? (meta.abiertas as Record<string, unknown>[]) : [];
  const abiertas = abiertasRaw
    .filter((a) => a && typeof a === "object")
    .map((a) => ({ pregunta: String(a.pregunta ?? ""), respuesta: String(a.respuesta ?? "").trim() }))
    .filter((a) => a.pregunta && a.respuesta);

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
    mapa: buildOpportunityMap(scores),
    abiertas,
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
export async function buildReportPdf(rawData: ReportData): Promise<Uint8Array> {
  // Helvetica solo dibuja WinAnsi: emojis o flechas en nombre o respuestas harían fallar el informe completo.
  const data = winAnsiDeep(rawData);
  const doc = await PDFDocument.create();
  doc.setTitle("Tu mapa de oportunidades — Nubolabs");
  doc.setAuthor("Nubolabs");
  doc.setSubject("Mapa de oportunidades");

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
    text(p, "TU MAPA DE OPORTUNIDADES", M, H - 84, 10, bold, C.cyan);
    text(p, siteSlogan, M, H - 100, 9.5, font, C.navySoft); // lema del sitio (cambio enfoque-soluciones-a-medida)
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
    `Este es el resultado de tu autodiagnóstico${
      data.company ? ` para ${data.company}` : ""
    }. Muestra dónde tu negocio tiene más oportunidades de mejorar y por dónde te conviene partir.`,
    font,
    11,
    CW,
  );
  introLines.forEach((l) => {
    text(page, l, M, y, 11, font, C.muted);
    y -= 15;
  });
  y -= 14;

  // Mapa de oportunidades (tarjeta navy): 4 dimensiones con barra y nivel en texto, sin puntajes.
  const mapH = 46 + data.mapa.dimensiones.length * 26;
  ensure(mapH + 12);
  page.drawRectangle({ x: M, y: y - mapH, width: CW, height: mapH, color: C.navy });
  text(page, "TU MAPA DE OPORTUNIDADES", M + 24, y - 28, 10, bold, C.cyan);
  const labelW = 150;
  const lvlW = 120;
  const barX = M + 24 + labelW;
  const barMax = CW - 48 - labelW - lvlW;
  let my = y - 52;
  data.mapa.dimensiones.forEach((d) => {
    text(page, d.nombre, M + 24, my - 8, 10.5, bold, C.white);
    page.drawRectangle({ x: barX, y: my - 11, width: barMax, height: 8, color: C.navySoft });
    if (d.puntaje !== null) {
      const w = Math.max(3, (d.puntaje / 100) * barMax);
      page.drawRectangle({ x: barX, y: my - 11, width: w, height: 8, color: d.nivel === "alta" ? C.orange : C.cyan });
    }
    const lvl = d.nivel ? OPPORTUNITY_LABELS[d.nivel] : "Sin datos";
    text(page, lvl, barX + barMax + 14, my - 8, 10, bold, d.nivel === "alta" ? C.orange : d.nivel ? C.cyan : C.navySoft);
    my -= 26;
  });
  y -= mapH + 26;

  // Oportunidades principales con lo que puedes lograr
  const principales = data.mapa.principales
    .map((id) => DIMENSIONS.find((d) => d.id === id))
    .filter((d): d is (typeof DIMENSIONS)[number] => !!d);
  if (principales.length) {
    ensure(40);
    text(page, "TUS OPORTUNIDADES PRINCIPALES", M, y, 11, bold, C.ink);
    y -= 20;
    principales.forEach((d, i) => {
      const lines = wrapText(d.logro, font, 10.5, CW - 32);
      const boxH = 34 + lines.length * 14;
      ensure(boxH + 10);
      page.drawRectangle({ x: M, y: y - boxH, width: CW, height: boxH, color: C.soft });
      page.drawRectangle({ x: M, y: y - boxH, width: 4, height: boxH, color: i === 0 ? C.orange : C.blue });
      text(page, `${i + 1}. ${d.nombre}`, M + 18, y - 20, 11.5, bold, C.navy);
      let ly = y - 36;
      lines.forEach((l) => {
        text(page, l, M + 18, ly, 10.5, font, C.ink);
        ly -= 14;
      });
      y -= boxH + 10;
    });
    y -= 10;
  }

  // Próximo paso sugerido
  if (data.mapa.proximoPaso) {
    const lines = wrapText(data.mapa.proximoPaso, bold, 11.5, CW - 32);
    const boxH = 34 + lines.length * 15;
    ensure(boxH + 12);
    page.drawRectangle({ x: M, y: y - boxH, width: CW, height: boxH, color: C.bg });
    page.drawRectangle({ x: M, y: y - boxH, width: 4, height: boxH, color: C.cyan });
    text(page, "PRÓXIMO PASO SUGERIDO", M + 18, y - 20, 9.5, bold, C.blue);
    let ly = y - 37;
    lines.forEach((l) => {
      text(page, l, M + 18, ly, 11.5, bold, C.navy);
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

  // CTA agendar
  const ctaH = 74;
  ensure(ctaH + 12);
  page.drawRectangle({ x: M, y: y - ctaH, width: CW, height: ctaH, color: C.blue });
  text(page, "El siguiente paso: tu sesión gratuita", M + 24, y - 28, 14, bold, C.white);
  const ctaSub = wrapText(
    "Agendemos 30 minutos para revisar juntos tu mapa y definir por dónde partir. Responde el correo con este informe o escríbenos.",
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
