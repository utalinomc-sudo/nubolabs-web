// Definición del cuestionario operativo (genérico, cualquier industria).

export const ESCALA = [
  { v: 1, l: "Nunca" },
  { v: 2, l: "Rara vez" },
  { v: 3, l: "A veces" },
  { v: 4, l: "Seguido" },
  { v: 5, l: "Siempre" },
] as const;

export interface Area {
  id: string;
  nombre: string;
  corto: string;
  sub: string;
  preguntas: string[];
}

export const AREAS: Area[] = [
  {
    id: "carga",
    nombre: "Carga de trabajo y capacidad",
    corto: "Carga y capacidad",
    sub: "Cómo se reparte el tiempo del equipo hoy",
    preguntas: [
      "El equipo posterga trabajo nuevo o importante porque está saturado con el día a día.",
      "Una parte relevante de la jornada se va en tareas administrativas o repetitivas, no en el trabajo que genera valor.",
      "Cuesta estimar cuánto tiempo o costo tomará un trabajo nuevo antes de comprometerse con él.",
    ],
  },
  {
    id: "plazos",
    nombre: "Seguimiento y plazos",
    corto: "Seguimiento y plazos",
    sub: "Visibilidad de pendientes, compromisos y vencimientos",
    preguntas: [
      "Cuesta ver en un solo lugar todos los pendientes, plazos y compromisos vigentes del equipo.",
      "Un plazo o entrega ha estado cerca de vencerse — o se venció — sin que nadie lo detectara a tiempo.",
      "El seguimiento de tareas recurrentes depende de la memoria o de recordatorios manuales de alguien.",
    ],
  },
  {
    id: "info",
    nombre: "Información y documentos",
    corto: "Información y documentos",
    sub: "Cómo entra, se busca y se comparte la información",
    preguntas: [
      "Un documento o solicitud que llega tarda en ser revisado, clasificado y asignado a un responsable.",
      "Se pierde tiempo buscando información que ya existe, repartida entre correos, carpetas, chats y planillas.",
      "Se vuelve a pedir a clientes o proveedores información que ya habían enviado antes.",
    ],
  },
  {
    id: "procesos",
    nombre: "Procesos y escalabilidad",
    corto: "Procesos y escala",
    sub: "Qué tan estandarizado y escalable es el trabajo",
    preguntas: [
      "Los mismos datos se copian y pegan a mano entre planillas, correos y sistemas.",
      "Trabajos similares se arman desde cero cada vez, sin plantillas ni procesos estandarizados.",
      "Atender más clientes o más volumen implica, casi inevitablemente, contratar más personas.",
    ],
  },
  {
    id: "conocimiento",
    nombre: "Conocimiento y dependencias",
    corto: "Conocimiento",
    sub: "Qué pasa cuando falta una persona clave",
    preguntas: [
      "Si una persona clave se ausenta, a otros les cuesta retomar sus pendientes o saber en qué estaba.",
      "El conocimiento de cómo se hacen las cosas vive en la cabeza de pocas personas, no en procesos documentados.",
      "Cuando aparece un problema parecido a uno ya resuelto, cuesta encontrar cómo se resolvió la vez anterior.",
    ],
  },
  {
    id: "clientes",
    nombre: "Clientes y reportes",
    corto: "Clientes y reportes",
    sub: "La cara visible de la operación",
    preguntas: [
      "Preparar reportes de estado o de avance toma más tiempo del que debería.",
      "Un cliente ha preguntado por el estado de algo y costó responderle con la rapidez esperada.",
      "Errores o retrabajos internos alcanzan a ser visibles para los clientes.",
    ],
  },
];

export const ABIERTAS = [
  { id: "mayorProblema", label: "De todo lo anterior, ¿cuál es el problema que más tiempo le quita al equipo hoy?" },
  { id: "solucionMagica", label: "Si pudieras resolver un solo problema del día a día con una solución mágica, ¿cuál sería?" },
] as const;

export const TOTAL_Q = AREAS.reduce((n, a) => n + a.preguntas.length, 0);

export function nivelFriccion(indice: number): { txt: string; color: string } {
  return indice >= 60
    ? { txt: "Fricción alta", color: "#FF6B5E" }
    : indice >= 35
      ? { txt: "Fricción media", color: "#00C2FF" }
      : { txt: "Fricción baja", color: "#22C55E" };
}
