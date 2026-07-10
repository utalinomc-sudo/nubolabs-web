import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

// Informe interno (admin): ficha completa de un lead de diagnóstico.
// Incluye contacto, índice de fricción, TODAS las preguntas con su respuesta,
// preguntas abiertas y el detalle completo de la estimación de ahorro.

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
  hot: rgb(255 / 255, 239 / 255, 237 / 255),
  muteBg: rgb(238 / 255, 242 / 255, 248 / 255),
  white: rgb(1, 1, 1),
  navySoft: rgb(90 / 255, 118 / 255, 153 / 255),
};

const fmtCLP = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
const ESCALA_LBL = ["", "Nunca", "Rara vez", "A veces", "Seguido", "Siempre"];
const ERRORES_LBL: Record<string, string> = { bajo: "Pocas veces", medio: "A veces", alto: "Con frecuencia" };

interface AreaMeta {
  area: string;
  corto?: string;
  friccion: number | null;
  respuestas: { pregunta: string; valor: number | null }[];
}
interface AhorroProceso {
  nombre: string;
  descripcion?: string;
  herramientas?: string;
  personas?: number;
  horasSemanaPorPersona?: number;
  horasSemana?: number;
  sueldo?: number;
  repetitivo?: number;
  errores?: string;
  horasMes?: number;
  ahorroHorasMes?: number;
  ahorroCLPMes?: number;
}
interface AhorroMeta {
  totales?: { horas?: number; semana?: number; mes?: number; anual?: number };
  procesos?: AhorroProceso[];
}

export interface LeadRecord {
  id?: string;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  company?: unknown;
  source?: unknown;
  message?: unknown;
  createdAt?: unknown;
  meta?: Record<string, unknown> | null;
}

const s = (v: unknown) => (v == null ? "" : String(v));

export async function buildLeadDetailPdf(lead: LeadRecord): Promise<Uint8Array> {
  const meta = (lead.meta ?? {}) as Record<string, unknown>;
  const areas = (meta.areas as AreaMeta[] | undefined) ?? [];
  const abiertas = ((meta.abiertas as { pregunta: string; respuesta: string }[] | undefined) ?? []).filter(
    (a) => a && a.respuesta && a.respuesta.trim(),
  );
  const ahorro = meta.ahorro as AhorroMeta | null | undefined;
  const indice = typeof meta.indiceFriccion === "number" ? meta.indiceFriccion : null;
  const nivel = s(meta.nivelFriccion);

  const createdAt = lead.createdAt
    ? new Date(s(lead.createdAt)).toLocaleString("es-CL", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/Santiago",
      })
    : "—";
  const generado = new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Santiago",
  }).format(new Date());

  const doc = await PDFDocument.create();
  doc.setTitle(`Ficha de lead — ${s(lead.name) || "diagnóstico"}`);
  doc.setAuthor("Nubolabs");

  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const W = 595.28;
  const H = 841.89;
  const M = 46;
  const CW = W - M * 2;

  let page = doc.addPage([W, H]);
  let y = 0;
  let pageNo = 0;

  const text = (p: PDFPage, str: string, x: number, yy: number, size: number, f: PDFFont, color = C.ink) =>
    p.drawText(str, { x, y: yy, size, font: f, color });

  const wrap = (str: string, f: PDFFont, size: number, maxW: number): string[] => {
    const out: string[] = [];
    for (const para of str.split("\n")) {
      const words = para.split(/\s+/).filter(Boolean);
      let line = "";
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (f.widthOfTextAtSize(test, size) > maxW && line) {
          out.push(line);
          line = w;
        } else {
          line = test;
        }
      }
      out.push(line);
    }
    return out.length ? out : [""];
  };

  const drawHeader = (p: PDFPage) => {
    const hb = 96;
    p.drawRectangle({ x: 0, y: H - hb, width: W, height: hb, color: C.navy });
    text(p, "Nubolabs", M, H - 42, 19, bold, C.white);
    text(p, "FICHA DE LEAD · DIAGNOSTICO", M, H - 62, 10, bold, C.cyan);
    text(p, "Documento interno", M, H - 78, 9, font, C.navySoft);
    const dw = font.widthOfTextAtSize(generado, 9);
    text(p, generado, W - M - dw, H - 78, 9, font, C.navySoft);
  };

  const drawFooter = (p: PDFPage) => {
    p.drawLine({ start: { x: M, y: M + 18 }, end: { x: W - M, y: M + 18 }, thickness: 0.75, color: C.border });
    text(p, "nubolabs.cl · Ficha de lead", M, M + 5, 8.5, bold, C.blue);
    const lbl = `Página ${pageNo}`;
    const lw = font.widthOfTextAtSize(lbl, 8.5);
    text(p, lbl, W - M - lw, M + 5, 8.5, font, C.faint);
  };

  const newPage = () => {
    if (pageNo > 0) drawFooter(page);
    page = pageNo === 0 ? page : doc.addPage([W, H]);
    pageNo += 1;
    drawHeader(page);
    y = H - 96 - 30;
  };

  const ensure = (need: number) => {
    if (y - need < M + 28) newPage();
  };

  newPage(); // primera página

  // ── Contacto ──────────────────────────────────────────────────────────
  const nombre = s(lead.name) || "—";
  text(page, nombre, M, y, 22, bold, C.ink);
  // Etiqueta de origen a la derecha
  const src = s(lead.source) || "landing";
  const isDiag = src === "diagnostico";
  const tagW = bold.widthOfTextAtSize(src.toUpperCase(), 9) + 18;
  page.drawRectangle({ x: M + CW - tagW, y: y - 3, width: tagW, height: 20, color: isDiag ? C.hot : C.soft });
  text(page, src.toUpperCase(), M + CW - tagW + 9, y + 2, 9, bold, isDiag ? C.orange : C.blue);
  y -= 30;

  const fields: [string, string][] = [
    ["Email", s(lead.email) || "—"],
    ["Teléfono", s(lead.phone) || "—"],
    ["Empresa", s(lead.company) || "—"],
    ["Rubro", s(meta.rubro) || "—"],
    ["Recibido", createdAt],
    ["ID", s(lead.id) || "—"],
  ];
  const colW = CW / 3;
  for (let i = 0; i < fields.length; i += 3) {
    ensure(34);
    for (let c = 0; c < 3 && i + c < fields.length; c++) {
      const [k, v] = fields[i + c];
      const x = M + c * colW;
      text(page, k.toUpperCase(), x, y, 8, bold, C.faint);
      const vLine = wrap(v, font, 10.5, colW - 12)[0];
      text(page, vLine, x, y - 14, 10.5, font, C.ink);
    }
    y -= 38;
  }
  y -= 4;

  const sectionTitle = (title: string) => {
    ensure(30);
    text(page, title, M, y, 12, bold, C.ink);
    page.drawLine({ start: { x: M, y: y - 7 }, end: { x: W - M, y: y - 7 }, thickness: 1, color: C.border });
    y -= 24;
  };

  // ── Índice de fricción ────────────────────────────────────────────────
  if (indice !== null) {
    const boxH = 62;
    ensure(boxH + 10);
    page.drawRectangle({ x: M, y: y - boxH, width: CW, height: boxH, color: C.navy });
    text(page, String(indice), M + 20, y - 44, 34, bold, C.white);
    const iw = bold.widthOfTextAtSize(String(indice), 34);
    if (nivel) {
      const nc = indice >= 60 ? C.orange : indice >= 35 ? C.cyan : C.green;
      text(page, nivel, M + 20 + iw + 12, y - 30, 12, bold, nc);
    }
    text(page, "Índice de fricción (0–100)", M + 20 + iw + 12, y - 46, 9, font, C.navySoft);
    y -= boxH + 22;

    // Barras por área (ordenadas desc)
    if (areas.length) {
      const sorted = [...areas].sort((a, b) => (b.friccion ?? -1) - (a.friccion ?? -1));
      const labelW = 150;
      const barX = M + labelW;
      const barMax = CW - labelW - 40;
      sorted.forEach((a) => {
        ensure(20);
        const fr = a.friccion ?? 0;
        text(page, a.corto ?? a.area, M, y - 8, 10, font, C.ink);
        page.drawRectangle({ x: barX, y: y - 11, width: barMax, height: 7, color: C.muteBg });
        page.drawRectangle({ x: barX, y: y - 11, width: Math.max(2, (fr / 100) * barMax), height: 7, color: fr >= 60 ? C.orange : C.cyan });
        text(page, a.friccion == null ? "—" : String(fr), barX + barMax + 10, y - 8, 10, bold, fr >= 60 ? C.orange : C.ink);
        y -= 20;
      });
      y -= 12;
    }
  }

  // ── Respuestas del cuestionario ───────────────────────────────────────
  if (areas.length) {
    sectionTitle("RESPUESTAS DEL CUESTIONARIO");
    areas.forEach((a) => {
      ensure(26);
      text(page, a.area, M, y, 11.5, bold, C.ink);
      const frTxt = `fricción ${a.friccion ?? "—"}`;
      const fw = font.widthOfTextAtSize(frTxt, 9.5);
      text(page, frTxt, M + CW - fw, y, 9.5, font, C.muted);
      y -= 18;

      a.respuestas.forEach((r) => {
        const val = r.valor ?? 0;
        const tagTxt = `${r.valor ?? "—"} · ${ESCALA_LBL[val] ?? ""}`.trim();
        const tagW2 = bold.widthOfTextAtSize(tagTxt, 9) + 16;
        const qLines = wrap(r.pregunta, font, 10, CW - tagW2 - 16);
        const rowH = Math.max(qLines.length * 13, 18) + 6;
        ensure(rowH);
        qLines.forEach((l, li) => text(page, l, M + 4, y - 9 - li * 13, 10, font, C.muted));
        const hot = val >= 4;
        page.drawRectangle({ x: M + CW - tagW2, y: y - 12, width: tagW2, height: 16, color: hot ? C.hot : C.muteBg });
        text(page, tagTxt, M + CW - tagW2 + 8, y - 8, 9, bold, hot ? C.orange : C.muted);
        y -= rowH;
      });
      y -= 12;
    });
  }

  // ── Preguntas abiertas ────────────────────────────────────────────────
  if (abiertas.length) {
    sectionTitle("EN SUS PALABRAS");
    abiertas.forEach((a) => {
      const qLines = wrap(a.pregunta, bold, 10, CW);
      const aLines = wrap(a.respuesta, font, 10.5, CW);
      ensure(qLines.length * 13 + aLines.length * 14 + 12);
      qLines.forEach((l) => {
        text(page, l, M, y, 10, bold, C.muted);
        y -= 13;
      });
      aLines.forEach((l) => {
        text(page, l, M, y, 10.5, font, C.ink);
        y -= 14;
      });
      y -= 10;
    });
  }

  // ── Estimación de ahorro ──────────────────────────────────────────────
  if (ahorro?.totales) {
    sectionTitle("ESTIMACIÓN DE AHORRO");
    const t = ahorro.totales;
    const totales: [string, string][] = [];
    if (t.semana != null) totales.push([fmtCLP.format(t.semana), "a la semana"]);
    if (t.mes != null) totales.push([fmtCLP.format(t.mes), "al mes"]);
    if (t.anual != null) totales.push([fmtCLP.format(t.anual), "al año"]);
    if (t.horas != null) totales.push([`${t.horas} h`, "automatizables/mes"]);
    ensure(40);
    let tx = M;
    const tCol = CW / Math.max(1, totales.length);
    totales.forEach(([big, small], i) => {
      const color = i === 1 ? C.blue : i === 2 ? C.orange : C.ink;
      text(page, big, tx, y - 4, 17, bold, color);
      text(page, small, tx, y - 18, 8.5, font, C.muted);
      tx += tCol;
    });
    y -= 34;

    const procesos = ahorro.procesos ?? [];
    ensure(16);
    text(page, `${procesos.length} proceso(s) analizado(s)`, M, y, 9.5, font, C.muted);
    y -= 18;

    procesos.forEach((p, idx) => {
      ensure(30);
      // Cabecera del proceso
      page.drawRectangle({ x: M, y: y - 22, width: CW, height: 22, color: C.soft });
      text(page, `${idx + 1}. ${p.nombre || "Proceso"}`, M + 10, y - 15, 10.5, bold, C.navy);
      const cost = `${fmtCLP.format(p.ahorroCLPMes ?? 0)}/mes`;
      const cw2 = bold.widthOfTextAtSize(cost, 10.5);
      text(page, cost, M + CW - cw2 - 10, y - 15, 10.5, bold, C.blue);
      y -= 30;

      if (p.descripcion) {
        const dl = wrap(p.descripcion, font, 9.5, CW - 10);
        ensure(dl.length * 12 + 4);
        dl.forEach((l) => {
          text(page, l, M + 6, y, 9.5, font, C.muted);
          y -= 12;
        });
        y -= 4;
      }

      const hsem = p.horasSemanaPorPersona ?? p.horasSemana;
      const cells: [string, string][] = [
        ["Herramientas", p.herramientas || "—"],
        ["Personas", p.personas != null ? String(p.personas) : "—"],
        ["Horas/sem por persona", hsem != null ? `${hsem} h` : "—"],
        ["Sueldo prom. mensual", p.sueldo != null ? fmtCLP.format(p.sueldo) : "—"],
        ["% repetitivo / manual", p.repetitivo != null ? `${p.repetitivo}%` : "—"],
        ["Errores / retrabajo", p.errores ? ERRORES_LBL[p.errores] ?? p.errores : "—"],
        ["Horas totales / mes", p.horasMes != null ? `${p.horasMes} h` : "—"],
        ["Horas automatizables / mes", p.ahorroHorasMes != null ? `${p.ahorroHorasMes} h` : "—"],
        ["Ahorro estimado / mes", fmtCLP.format(p.ahorroCLPMes ?? 0)],
      ];
      const cellW = CW / 3;
      for (let i = 0; i < cells.length; i += 3) {
        ensure(30);
        for (let c = 0; c < 3 && i + c < cells.length; c++) {
          const [k, v] = cells[i + c];
          const x = M + 6 + c * cellW;
          text(page, k.toUpperCase(), x, y, 7.5, bold, C.faint);
          const vLine = wrap(v, font, 10, cellW - 14)[0];
          const vColor = k.startsWith("Ahorro") ? C.orange : k.startsWith("Horas automat") ? C.blue : C.ink;
          text(page, vLine, x, y - 13, 10, font, vColor);
        }
        y -= 32;
      }
      y -= 10;
    });
  } else if (isDiag) {
    sectionTitle("ESTIMACIÓN DE AHORRO");
    ensure(16);
    text(page, "El cliente no agregó el paso opcional de estimación de ahorro.", M, y, 10, font, C.muted);
    y -= 18;
  }

  // ── Mensaje crudo (leads de landing) ──────────────────────────────────
  const message = s(lead.message);
  if (message && areas.length === 0) {
    sectionTitle("MENSAJE");
    const ml = wrap(message, font, 10.5, CW);
    ml.forEach((l) => {
      ensure(14);
      text(page, l, M, y, 10.5, font, C.ink);
      y -= 14;
    });
  }

  drawFooter(page);
  return doc.save();
}
