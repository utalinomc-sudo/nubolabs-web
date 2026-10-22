## Purpose

Define cómo la portada de nubolabs.cl muestra cifras de resultados: solo datos reales con su fuente, ocultos por defecto y publicables desde el CMS sin despliegue, para que ningún número sin respaldo llegue al visitante.

## ADDED Requirements

### Requirement: Sin cifras de ejemplo
La portada MUST NOT mostrar cifras de ejemplo ni la nota "cifras referenciales de ejemplo". Los textos "+120 h", "−90%" y "minutos donde antes había días" MUST NOT aparecer en ninguna sección de la portada con la configuración por defecto.

#### Scenario: Portada por defecto
- **WHEN** un visitante abre `/` sin overrides en el CMS
- **THEN** ninguno de esos textos aparece en el HTML de la página

### Requirement: Sección oculta por defecto
La sección de cifras SHALL estar oculta por defecto. Cuando está oculta MUST NOT renderizarse ni dejar espacio vacío entre las secciones vecinas. Cuando el admin la activa, SHALL mostrarse después de los casos de uso.

#### Scenario: Configuración sin la clave
- **WHEN** `config/site.visible` no trae la clave `cifras`
- **THEN** la sección no se muestra

#### Scenario: Activada
- **WHEN** `visible.cifras` es `true` y hay al menos una cifra válida
- **THEN** la sección aparece inmediatamente después de los casos de uso

### Requirement: Solo cifras con respaldo
Una cifra es válida solo si `valor`, `texto` y `fuente` tienen contenido: al menos una letra o un dígito (un espacio, un carácter invisible o un signo suelto como "." o "-" no cuentan); las inválidas MUST NOT mostrarse. Cada cifra visible SHALL mostrar su valor destacado, su texto y su fuente en letra más pequeña. Se muestran como máximo las 4 primeras cifras válidas, en el orden del CMS.

#### Scenario: Cifra completa
- **WHEN** la sección está visible y el CMS trae `{ valor: "Mismo día", texto: "en responder cotizaciones", fuente: "Piloto con cliente de O&A, 2026" }`
- **THEN** la portada muestra "Mismo día", el texto y "Piloto con cliente de O&A, 2026"

#### Scenario: Sin fuente
- **WHEN** una cifra tiene `fuente` vacía o solo espacios
- **THEN** esa cifra no se muestra

#### Scenario: Fuente con un carácter invisible o un signo
- **WHEN** una cifra tiene como `fuente` solo un espacio invisible (por ejemplo U+200B, pegado desde otro programa) o "-"
- **THEN** esa cifra no se muestra y el editor avisa "No se mostrará: falta la fuente."

#### Scenario: Más de cuatro
- **WHEN** el CMS trae 6 cifras válidas
- **THEN** se muestran las 4 primeras

### Requirement: Frase cualitativa
Si la sección está visible pero no hay cifras válidas, SHALL mostrarse solo la frase del CMS (una frase guardada vacía se respeta y no vuelve a la de por defecto, para poder apagarla; si no hay frase guardada, va la de por defecto) (por defecto "Medimos cada proyecto con los indicadores que tú elijas, y en el diagnóstico te mostramos los números de tu caso."). Si además la frase está vacía, la sección MUST NOT renderizarse. La frase por defecto MUST NOT mencionar horas.

#### Scenario: Visible sin cifras
- **WHEN** `visible.cifras` es `true` y no hay cifras válidas
- **THEN** se muestra solo la frase

#### Scenario: Frase guardada vacía
- **WHEN** el admin vacía la frase y guarda
- **THEN** la frase no vuelve a la de por defecto y, sin cifras válidas, la sección no aparece

#### Scenario: Visible sin cifras ni frase
- **WHEN** `visible.cifras` es `true`, no hay cifras válidas y la frase está vacía
- **THEN** la sección no aparece

### Requirement: Edición desde el admin
En `/admin/config`, el editor de la sección Cifras SHALL permitir agregar, editar y quitar cifras (valor, texto, fuente) y editar la frase, y SHALL mostrar la ayuda "Usa solo datos reales con su fuente; prefiere resultados del negocio (por ejemplo, cotizaciones respondidas el mismo día) antes que horas." El botón "Usar los textos recomendados" SHALL cargar la frase por defecto en el formulario sin modificar las cifras ni guardar. La visibilidad se controla con el interruptor de secciones. Los cambios guardados SHALL verse en la siguiente carga, sin despliegue.

#### Scenario: Editor con ayuda
- **WHEN** el admin abre el editor de Cifras
- **THEN** ve la ayuda sobre datos reales con fuente y el campo de fuente en cada cifra

#### Scenario: Textos recomendados
- **WHEN** el admin tiene 2 cifras cargadas y pulsa "Usar los textos recomendados"
- **THEN** la frase vuelve a la de por defecto y las 2 cifras siguen en el formulario

### Requirement: Cifras legibles en móvil
A 375 px las cifras SHALL apilarse sin scroll horizontal, y valor, texto y fuente SHALL cumplir contraste WCAG AA sobre su fondo.

#### Scenario: Móvil
- **WHEN** se abre `/` a 375 px con 3 cifras válidas visibles
- **THEN** el ancho del documento no supera el de la pantalla
