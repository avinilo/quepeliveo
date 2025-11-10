# Sección: **Buscar o hablar con la IA**

## 1) Estructura

* **Título breve:** “Encuentra algo para ver”
* **Tabs:**

  * **Chat con IA** (por defecto)
  * **Búsqueda por texto**
* **Descripción corta bajo las tabs:** una línea que explique “Haz una pregunta o busca por título, actor, directora…”.

---

## 2) Tab: **Chat con IA**

**Zona de entrada**

* **Caja de chat compacta** con placeholder: *“Pídeme algo nuevo: ‘thriller en Netflix de menos de 100 min’…”*
* **Botón enviar** + atajo *Enter*.
* **Lista de ejemplos clicables** (chips):

  * “Thriller nuevo en Netflix”
  * “Comedias añadidas esta semana”
  * “Series cortas recién llegadas”
  * “Documentales que acaban de llegar”
  * “Novedades para ver en familia”

  > Al pulsar un ejemplo, se auto-rellena y ejecuta.

**Respuesta**

* **Tarjetas (3–6)** con: póster, título, tipo (peli/serie/docu), plataforma, badge (*Nuevo hoy* / *Esta semana*), duración/temporadas, mini-sinopsis (1–2 líneas), y CTAs: **Ver en [plataforma]**, **Ver detalles**, **Agregar a lista**.
* **Botón principal:** **Ver todo** → abre **Explorar** con los **filtros/orden que la IA infiere** (plataforma, género, ventana temporal, duración, etc.).

**Ajustes rápidos (bajo la entrada)**

* Chips opcionales que condicionan la respuesta: **Hoy** / **Esta semana** / **30 días**, **Solo incluidas**, **Películas** / **Series**.
* Estos chips se reflejan en el preset cuando se pulse **Ver todo**.

**Estados**

* **Pensando:** skeleton de tarjetas (3–6).
* **Sin hallazgos:** mensaje “No encuentro novedades con esa petición. Prueba *Esta semana* o quita alguna condición.” + chips sugeridos.
* **Error de red:** “Se perdió la conexión. Reintentar”.

**Microcopy sugerido**

* Placeholder: *“Pídeme algo: ‘terror recién añadido en Filmin’, ‘comedia de 90 min en Disney+’…”*
* Sugerencia bajo la caja: *“Consejo: añade duración o plataforma para clavar la recomendación.”*

---

## 3) Tab: **Búsqueda por texto**

**Campo de búsqueda**

* Placeholder: *“Título, actor, directora, saga…”*
* **Enter** → abre **Explorar** con **búsqueda por texto** (sin aplicar ventana temporal ni filtros).

**Sugerencias opcionales**

* Autocompletar con 5–8 resultados rápidos (títulos + persona).
* **Ver todo** al final del desplegable → **Explorar** con la misma query.

**Estados**

* **Sin resultados inmediatos:** “No hemos encontrado coincidencias. Prueba otro nombre o ve a **Explorar**.”

---

## 4) Diseño y colocación

**Escritorio**

* Tabs alineadas a la izquierda; el **Chat con IA** ocupa una fila compacta; las **tarjetas** aparecen justo debajo.
* La **lista de ejemplos** va en una línea (wrap a 2 líneas si hace falta).

**Móvil**

* Tabs en ancho completo.
* **Chat** con botón grande “Pedir recomendación”.
* **Tarjetas** en 2 columnas; CTAs apilados.

---

## 5) Accesibilidad y UX

* Navegable con teclado: **Tab** entre caja, chips y botón; **Enter** para enviar.
* Contraste alto en tabs activos; foco visible.
* Lectores de pantalla: aria-labels en tabs (“Cambiar a Chat con IA / Búsqueda por texto”).

---

## 6) Comportamientos clave

* **Persistencia ligera:** recuerda la última tab usada y chips (Hoy/Semana, Solo incluidas…).
* **Consistencia:** el botón **Ver todo** siempre lleva a **Explorar** con **presets visibles** (chips activos arriba).
* **Claridad de novedades:** si la petición no menciona ventana temporal, utiliza **Esta semana** por defecto (editable con chips).

---

## 7) Ejemplos de prompts útiles (para mostrar como chips)

* “Terror nuevo en Netflix (≤100 min)”
* “Series españolas recién añadidas en Prime” *(si decides ofrecer filtros de país/idioma como opcionales)*
* “Comedias familiares de esta semana”
* “Estrenos de ciencia ficción en Disney+”
* “Dramas cortos añadidos hoy”

---

## 8) Mensajes de ayuda contextual

* Bajo la sección, una línea discreta: *“Todo lo que encuentres aquí se puede ver en plataformas de España.”*

Con esta definición, el bloque invita a **descubrir novedades** primero (Chat con IA) y deja **la búsqueda directa** como alternativa rápida, llevando siempre a **Explorar** con el contexto correcto.
