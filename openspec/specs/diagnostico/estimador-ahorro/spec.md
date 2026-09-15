# diagnostico/estimador-ahorro Specification

## Purpose

Define las reglas de cálculo del estimador de ahorro del diagnóstico operativo: cuánto tiempo y dinero puede ahorrar una empresa al automatizar cada proceso repetitivo que describe, y cómo se consolidan y muestran esos totales en el sitio, el informe PDF y el correo al cliente.

Implementación: `components/diagnostico/ahorro.ts`. Tests: `components/diagnostico/ahorro.test.ts`. Origen: cambio `agregar-tests-vitest` (2026-09-15).

## Requirements

### Requirement: Ahorro por proceso
Para cada proceso descrito por el visitante (personas dedicadas, horas semanales por persona, sueldo mensual bruto por persona en CLP, porcentaje de trabajo repetitivo y nivel de errores), el sistema SHALL calcular:
- las **horas mensuales** dedicadas al proceso como `horas semanales por persona × personas × 4,33`;
- las **horas ahorrables al mes** como `horas mensuales × (porcentaje repetitivo / 100) × 0,8`, donde 0,8 es la fracción máxima automatizable;
- el **costo por hora** como `sueldo mensual / 180`;
- el **ahorro mensual en CLP** como `horas ahorrables × costo por hora × factor de errores`.

#### Scenario: Proceso con valores por defecto
- **WHEN** un proceso tiene 2 personas, 8 horas semanales por persona, sueldo 800.000, 60 % repetitivo y nivel de errores "medio"
- **THEN** las horas mensuales son 69,28, las horas ahorrables son 33,2544 y el ahorro mensual es aproximadamente 155.187 CLP (tolerancia de 1 CLP)

#### Scenario: Las horas son por persona
- **WHEN** dos procesos son idénticos salvo que uno tiene 1 persona y el otro 3
- **THEN** las horas mensuales y el ahorro del segundo son exactamente el triple del primero

### Requirement: Factor por nivel de errores
El sistema SHALL ponderar el ahorro mensual según el nivel de errores declarado: "bajo" ×1,00, "medio" ×1,05 y "alto" ×1,15. El factor MUST NOT afectar las horas.

#### Scenario: Mismo proceso con distintos niveles de errores
- **WHEN** se calcula el mismo proceso con nivel "bajo", "medio" y "alto"
- **THEN** los ahorros mensuales guardan la proporción 1,00 : 1,05 : 1,15 y las horas ahorrables son iguales en los tres casos

### Requirement: Normalización de entradas
El sistema SHALL tolerar entradas incompletas o inválidas del formulario: un número de personas menor que 1, vacío o no numérico se trata como 1; horas o sueldo vacíos o no numéricos se tratan como 0, y en esos casos el cálculo MUST NOT producir valores negativos ni `NaN`. El porcentaje repetitivo siempre llega como número entre 0 y 100 desde el control del formulario (no se normaliza).

#### Scenario: Personas en cero
- **WHEN** un proceso declara 0 personas y el resto de valores por defecto
- **THEN** el resultado es idéntico al de 1 persona

#### Scenario: Horas no numéricas
- **WHEN** un proceso tiene horas vacías o no numéricas
- **THEN** las horas mensuales, las horas ahorrables y el ahorro mensual son 0

### Requirement: Totales del diagnóstico
El sistema SHALL consolidar los procesos en totales enteros: **horas** = suma de horas ahorrables redondeada; **mes** = suma de ahorros mensuales redondeada; **semana** = suma mensual / 4,33 redondeada; **anual** = suma mensual × 12 redondeada. Sin procesos, todos los totales SHALL ser 0.

#### Scenario: Dos procesos
- **WHEN** se consolidan el proceso con valores por defecto (2 personas, nivel "medio") y un proceso igual pero con 1 persona y nivel "bajo"
- **THEN** los totales son mes 229.086, semana 52.907, anual 2.749.030 y horas 50 (sumas 229.085,87 CLP y 49,8816 h redondeadas)

#### Scenario: Sin procesos
- **WHEN** la lista de procesos está vacía
- **THEN** horas, semana, mes y anual son 0

### Requirement: Proceso nuevo por defecto
Al agregar un proceso al estimador, el sistema SHALL precargarlo con 2 personas, 8 horas semanales por persona, sueldo 800.000 CLP, 60 % repetitivo, nivel de errores "medio", nombre, descripción y herramientas vacíos, estado expandido, y un identificador único distinto del de cualquier proceso creado antes en la misma sesión.

#### Scenario: Dos procesos nuevos seguidos
- **WHEN** se agregan dos procesos nuevos
- **THEN** ambos traen los valores por defecto y sus identificadores son distintos

### Requirement: Formato de moneda
Los montos en CLP mostrados al visitante, en el informe y en el correo SHALL formatearse en pesos chilenos con separador de miles y sin decimales, según la convención `es-CL`.

#### Scenario: Monto de seis cifras
- **WHEN** se formatea 155.187
- **THEN** el texto contiene el símbolo `$` y `155.187`, y no contiene decimales
