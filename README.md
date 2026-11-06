# 🌋 Terremotos en el mundo

Aplicación web que muestra terremotos de todo el mundo sobre mapas interactivos, usando los datos del [USGS](https://earthquake.usgs.gov/) (Servicio Geológico de EE. UU.). Cada usuario puede guardar sus terremotos favoritos.

## Qué hace

- **Intro animada:** al cargar la página se reproduce un vídeo (un globo terráqueo que gira y tiembla con un terremoto) que da paso a la web. Se puede saltar con el botón "Saltar intro".
- **Mapa 1:** terremotos de las últimas 24 horas. Cada terremoto es un círculo cuyo color depende de su magnitud (leyenda en la cabecera). Al pulsarlo se abre un popup con el título, la ubicación, la fecha, la magnitud y el código.
- **Mapa 2:** terremotos filtrados por magnitud mínima y rango de fechas.
- **Usuarios y favoritos:** escribes tu nombre de usuario en la cabecera y puedes guardar terremotos como favoritos desde el popup. Con los botones sobre el mapa 1 cambias entre "Terremotos de la API" y "Mis favoritos", y desde ahí puedes eliminarlos. Cada usuario ve solo sus favoritos y no se guardan terremotos repetidos.
- **Diseño:** tema oscuro "sismógrafo" con una línea animada en la cabecera, adaptado a móvil y ordenador.

## Cómo usarlo

No necesita instalación ni servidor: abre `index.html` en el navegador. Hace falta conexión a internet para cargar Leaflet, los datos del USGS y las teselas del mapa.

> El vídeo `intro.mp4` debe estar en la misma carpeta que `index.html`.

## Estructura

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Estructura de la página: cabecera, barra de usuario, los dos mapas y el formulario de filtros |
| `style.css` | Estilos y tema oscuro (los colores están en variables al principio del archivo) |
| `Scriptleaflet.js` | Lógica principal: crea los mapas, pide los datos a la API, pinta los terremotos, popups, vistas y sesión |
| `favoritos.js` | Usuario actual y favoritos de cada usuario en `localStorage` |
| `intro.js` | Control de la intro: reproduce el vídeo, el fundido y el botón de saltar |
| `intro.mp4` | Vídeo de la intro |
| `terremotos.md` | Enunciado del ejercicio |

## Cómo funciona

1. `Scriptleaflet.js` pide los datos al USGS con `fetch` y los pinta con Leaflet.
2. Cuando alguien entra con un nombre de usuario, `favoritos.js` guarda ese nombre como usuario actual.
3. Los favoritos se guardan en `localStorage`, en una lista distinta para cada usuario (`favoritos_<usuario>`). Para evitar duplicados se usa el `id` único que da el USGS a cada terremoto.
4. `Scriptleaflet.js` usa las funciones de `favoritos.js` (se cargan en ese orden desde `index.html`) para decidir qué botón enseñar en cada popup y qué terremotos pintar.

## Tecnologías

- HTML, CSS y JavaScript sin frameworks
- [Leaflet](https://leafletjs.com/) 1.9.4 para los mapas
- API del USGS:
  - Terremotos de las últimas 24 h: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`
  - Búsqueda por magnitud y fechas: `https://earthquake.usgs.gov/fdsnws/event/1/query`
- `localStorage` del navegador para usuarios y favoritos

## Limitaciones

- El inicio de sesión es **simulado**: solo sirve para separar los favoritos de cada persona. No hay contraseña ni seguridad real.
- Los favoritos se guardan en el navegador donde se usan: no se comparten entre dispositivos ni entre navegadores.
