// Tests del estimador de ahorro. Spec: openspec/specs/diagnostico/estimador-ahorro/spec.md
// Los cálculos producen decimales largos (× 4.33, / 180): se comparan con toBeCloseTo.
import { describe, expect, it } from "vitest";
import { CONFIG, blank, calc, calcTotals, fmtCLP, type Proceso } from "./ahorro";

/** Proceso con los valores por defecto del estimador, con overrides opcionales. */
function proceso(overrides: Partial<Proceso> = {}): Proceso {
  return { ...blank(), ...overrides };
}

describe("Ahorro por proceso (calc)", () => {
  it("calcula horas mensuales, horas ahorrables y ahorro mensual con los valores por defecto", () => {
    const r = calc(proceso());
    // 8 h × 2 personas × 4.33
    expect(r.horasMes).toBeCloseTo(69.28, 2);
    // 69.28 × 60 % × 0.8
    expect(r.ahorroHoras).toBeCloseTo(33.2544, 2);
    // 33.2544 × (800.000 / 180) × 1.05 (nivel "medio")
    expect(r.ahorroMes).toBeCloseTo(155187.2, 1);
  });

  it("las horas son por persona: 3 personas triplican a 1 persona", () => {
    const una = calc(proceso({ personas: 1 }));
    const tres = calc(proceso({ personas: 3 }));
    expect(tres.horasMes / una.horasMes).toBeCloseTo(3, 10);
    expect(tres.ahorroHoras / una.ahorroHoras).toBeCloseTo(3, 10);
    expect(tres.ahorroMes / una.ahorroMes).toBeCloseTo(3, 10);
  });
});

describe("Factor por nivel de errores", () => {
  it("pondera el ahorro mensual 1.00 / 1.05 / 1.15 sin tocar las horas", () => {
    const bajo = calc(proceso({ errores: "bajo" }));
    const medio = calc(proceso({ errores: "medio" }));
    const alto = calc(proceso({ errores: "alto" }));

    expect(medio.ahorroMes / bajo.ahorroMes).toBeCloseTo(1.05, 10);
    expect(alto.ahorroMes / bajo.ahorroMes).toBeCloseTo(1.15, 10);

    expect(medio.ahorroHoras).toBe(bajo.ahorroHoras);
    expect(alto.ahorroHoras).toBe(bajo.ahorroHoras);
    expect(medio.horasMes).toBe(bajo.horasMes);
  });
});

describe("Normalización de entradas", () => {
  it("trata 0 personas, personas negativas o no numéricas como 1 persona", () => {
    const base = calc(proceso({ personas: 1 }));
    expect(calc(proceso({ personas: 0 }))).toEqual(base);
    expect(calc(proceso({ personas: -2 }))).toEqual(base);
    expect(calc(proceso({ personas: Number.NaN }))).toEqual(base);
  });

  it("con horas no numéricas todo el resultado es 0", () => {
    const r = calc(proceso({ horas: Number.NaN }));
    expect(r.horasMes).toBe(0);
    expect(r.ahorroHoras).toBe(0);
    expect(r.ahorroMes).toBe(0);
  });

  it("con sueldo no numérico el ahorro mensual es 0 (las horas se mantienen) y nunca NaN", () => {
    const sinSueldo = calc(proceso({ sueldo: Number.NaN }));
    expect(sinSueldo.ahorroMes).toBe(0);
    expect(sinSueldo.ahorroHoras).toBeGreaterThan(0);
    expect(Number.isNaN(sinSueldo.ahorroMes)).toBe(false);
  });
});

describe("Totales del diagnóstico (calcTotals)", () => {
  it("consolida dos procesos y redondea horas, semana, mes y anual", () => {
    const a = proceso(); // 2 personas, nivel medio → 155.187,2 CLP · 33,2544 h
    const b = proceso({ personas: 1, errores: "bajo" }); // → 73.898,67 CLP · 16,6272 h
    const t = calcTotals([a, b]);

    expect(t.mes).toBe(229086);
    expect(t.semana).toBe(52907);
    expect(t.anual).toBe(2749030);
    expect(t.horas).toBe(50);

    // Coherencia con calc(): los totales son las sumas redondeadas.
    const sumaMes = calc(a).ahorroMes + calc(b).ahorroMes;
    const sumaHoras = calc(a).ahorroHoras + calc(b).ahorroHoras;
    expect(t.mes).toBe(Math.round(sumaMes));
    expect(t.semana).toBe(Math.round(sumaMes / 4.33));
    expect(t.anual).toBe(Math.round(sumaMes * 12));
    expect(t.horas).toBe(Math.round(sumaHoras));
  });

  it("sin procesos devuelve todos los totales en 0", () => {
    expect(calcTotals([])).toEqual({ horas: 0, semana: 0, mes: 0, anual: 0 });
  });
});

describe("Proceso nuevo por defecto (blank)", () => {
  it("precarga los valores por defecto de CONFIG y queda expandido", () => {
    const p = blank();
    expect(p).toMatchObject({
      nombre: "",
      descripcion: "",
      herramientas: "",
      personas: 2,
      horas: 8,
      sueldo: CONFIG.sueldoPromedioDefault,
      repetitivo: 60,
      errores: "medio",
      abierto: true,
    });
    expect(blank(false).abierto).toBe(false);
  });

  it("asigna identificadores distintos a procesos consecutivos", () => {
    const ids = [blank().id, blank().id, blank().id];
    expect(new Set(ids).size).toBe(3);
  });
});

describe("Formato de moneda (fmtCLP)", () => {
  it("formatea en pesos chilenos con separador de miles y sin decimales", () => {
    // Intl puede insertar un espacio duro entre el símbolo y el número: se normaliza.
    const texto = fmtCLP.format(155187).replace(/\s/g, "");
    expect(texto).toContain("$");
    expect(texto).toContain("155.187");
    expect(texto).not.toContain(",");
    expect(fmtCLP.format(1234.56).replace(/\s/g, "")).toBe("$1.235");
  });
});
