// Lógica compartida del estimador de ahorro (paso opcional del diagnóstico).

export const CONFIG = {
  sueldoPromedioDefault: 800000, // CLP mensual por persona
  horasMesJornada: 180, // horas de jornada mensual para costo/hora
  factorAutomatizacion: 0.8, // fracción máxima automatizable de lo repetitivo
};

export const fmtCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export type Errores = "bajo" | "medio" | "alto";

export interface Proceso {
  id: number;
  nombre: string;
  descripcion: string;
  herramientas: string;
  personas: number;
  horas: number;
  sueldo: number;
  repetitivo: number;
  errores: Errores;
  abierto: boolean;
}

let uid = 0;
export function blank(abierto = true): Proceso {
  return {
    id: ++uid,
    nombre: "",
    descripcion: "",
    herramientas: "",
    personas: 2,
    horas: 8,
    sueldo: CONFIG.sueldoPromedioDefault,
    repetitivo: 60,
    errores: "medio",
    abierto,
  };
}

export function calc(p: Proceso) {
  const errBump = p.errores === "alto" ? 1.15 : p.errores === "medio" ? 1.05 : 1;
  const horasMes = (Number(p.horas) || 0) * 4.33;
  const ahorroHoras = horasMes * (Number(p.repetitivo) / 100) * CONFIG.factorAutomatizacion;
  const costoHora = (Number(p.sueldo) || 0) / CONFIG.horasMesJornada;
  const ahorroMes = ahorroHoras * costoHora * errBump;
  return { horasMes, ahorroHoras, ahorroMes };
}

export function calcTotals(procesos: Proceso[]) {
  let horas = 0;
  let mes = 0;
  procesos.forEach((p) => {
    const c = calc(p);
    horas += c.ahorroHoras;
    mes += c.ahorroMes;
  });
  return { horas: Math.round(horas), mes: Math.round(mes), anual: Math.round(mes * 12) };
}
