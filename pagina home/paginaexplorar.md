# Página reutilizable: **Explorar**

## Propósito

Una **única página de listado** que concentra **todo**. Cualquier “Ver todo” de la Home aterriza aquí con **filtros y orden preaplicados** según la sección de origen (novedades hoy, semana, próximos 30 días, top, por plataforma, por género, etc.).

---

## Estructura (de arriba a abajo)

### 1) Cabecera contextual

* **Título dinámico** (según preset):

  * “Novedades de hoy” · “Novedades de la semana en Netflix” · “Próximamente (30 días)” · “Top novedades de la semana”…
* **Subtítulo**: resumen corto (p. ej., “Mostrando 128 títulos · Semana · Netflix, Disney+ · Películas y Series”).
* **Breadcrumb**: Inicio → Explorar.

### 2) Barra de controles (filtros esenciales)

* **Ventana temporal**: *Hoy* · *Esta semana* · *Últimos 30 días* · *Próximos 30 días* · *Cualquiera*.
* **Plataformas** (multi): Netflix · Prime Video · Disney+ · Max · Filmin · Movistar Plus+ · Apple TV+.
* **Tipo**: *Películas* · *Series*.
* **Modalidad**: *Incluida* · *Alquiler* · *Compra*.
* **Ordenar por**: *Más recientes* · *Mejor valoradas* · *Más populares* · *Más nuevas* · *Más antiguas* · *Duración*.

> **Chips activos**: se muestran debajo; cada chip se puede cerrar (“×”) para quitar el filtro rápidamente. Botón **“Restablecer”** al final.

### 3) Panel de filtros ampliados (colapsable)

* **Géneros** (multi).
* **Duración** (≤90 · 90–120 · ≥120) / **Temporadas/Episodios** (series).
* **Año** o **rango de años**.
* **Clasificación por edades** (+7, +12, +16, +18).
* **País/Idioma** (opcionales y secundarios).

### 4) Listado de resultados (rejilla)

* **Tarjeta** con:

  * Póster.
  * Título.
  * **Tipo** (Peli/Serie) y **plataforma principal** (logo).
  * **Badges**: *Nuevo hoy* / *Nuevo esta semana* / *Próximamente* (con fecha) + *Incluida / Alquiler / Compra*.
  * Metadatos cortos: género principal, duración o temporadas.
  * **CTAs**: *Ver en [plataforma]* · *Ver detalles* · *Agregar a lista*.
* **Carga**: paginación o “Cargar más”.

### 5) Estado vacío

* Mensaje según contexto: “No hay resultados con estos filtros para *Esta semana*.”
* Sugerencias: cambiar a *Hoy/30 días/Cualquiera* o quitar algún filtro.
* Atajos: “Ver todas las novedades de la semana” · “Quitar filtros”.

---

## Presets automáticos (desde la Home)

* **Novedades de hoy** → Ventana: *Hoy* · Orden: *Más recientes*.
* **Novedades de la semana (plataforma X)** → Ventana: *Esta semana* · Plataforma: *X* · Orden: *Más recientes*.
* **Novedades últimos 30 días** → Ventana: *Últimos 30 días* · Orden: *Más recientes*.
* **Próximamente** → Ventana: *Próximos 30 días* · Orden: *Fecha de llegada* (equivalente a *Más recientes* en futuro).
* **Top 10 de la semana** → Ventana: *Esta semana* · Orden: *Mejor valoradas* (mostrar Top 10 arriba; el resto debajo al quitar límite).
* **Novedades por género (p. ej., Terror)** → Ventana: *Esta semana* · Género: *Terror* · Orden: *Más recientes*.
* **Modalidad (Incluidas/Alquiler/Compra)** → Ventana: *Esta semana* · Modalidad elegida · Orden: *Más recientes*.

> En todo momento el usuario puede **cambiar cualquiera** de estos ajustes sin salir de la página.

---

## Enfoque a novedades (por defecto)

* Si entras desde la Home, **Explorar** se abre **con ventana temporal activa** (Hoy/Semana/30 días/Próximos 30 días).
* El conmutador **“Cualquiera”** permite pasar a **catálogo completo** (secundario).

---

## Interacciones clave

* Cambiar **ventana temporal** en un clic (actualiza el listado al instante).
* Alternar **Plataformas** y **Tipo** sin perder el resto de filtros.
* Quitar filtros desde **chips**.
* Guardar en **Mi lista** desde la tarjeta (estado “Añadida”).
* **Deep link** directo: *Ver en [plataforma]* abre la plataforma.

---

## Móvil (prioridades)

* **Chips** de filtros esenciales en horizontal (Ventana · Plataformas · Tipo · Modalidad).
* Botón **“Más filtros”** abre panel con el resto.
* Rejilla 2 columnas; CTAs apilados.

---

## Microcopy sugerido

* Título: “Explorar — Novedades de hoy” / “Explorar — Semana en Netflix”.
* Subtítulo: “Mostrando **{n} títulos** · {ventana} · {plataformas}”.
* Vacío: “Sin resultados para esta ventana. Prueba **30 días** o **quita algún filtro**.”

---

### Resumen

**Explorar** es la **página única y central** del sitio: todo conduce aquí. La misma interfaz sirve para **novedades** (prioridad) y, si el usuario quiere, para **catálogo completo**, simplemente cambiando la ventana temporal o los filtros.
