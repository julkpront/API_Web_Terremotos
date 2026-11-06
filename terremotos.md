

## EJERCICIO: Web de Terremotos

**Requisitos para este proyecto**
- Manipulación dinámica del **DOM**
- Manejo de **ES6**
- **Asincronía**
- Sin frameworks ni librerias externas en la medida de lo posible
- Gestión del proyecto en **Github** desde el principio. Uso de ramas.
- Código limpio, **buenas prácticas**
- Diseño responsive, mobile first, semántica HTML5

**Opcional**
- Otras APIs, Local Storage, Firebase, PWA...
- En general, cualquier extra será bien recibido para que investiguéis por vuestra cuenta, siempre y cuando tenga sentido

#### 1. Dibujar en un mapa utilizando Leaflet las coordenadas de posiciones donde hay terremotos :tada: :volcano: :earth_africa: :boom:

![Leaflet](../../assets/js_avanzado/terremotos/leaflet.png)


- [Endpoint API Earthquake](https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson)
- [API Eathquake Documentation](https://earthquake.usgs.gov/fdsnws/event/1/)
- [Documentación API Earthquake](https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson)
- [Mapa interactivo de terremotos representados de la API](https://earthquake.usgs.gov/earthquakes/map/?extent=11.0059,-145.89844&extent=58.35563,-44.12109)

Tareas:
- Petición HTTP para obtener los terremotos disponibles en la API
- Dibujar los marcadores de cada terremoto en el mapa
- Añadir popup en cada marcador con los siguientes datos:
  - Título
  - Fecha del evento
  - Ubicación
  - Código
  - Magnitud con el tipo de medida
- Personalizar iconos por color para los marcadores según la magnitud del terremoto (colores entre 0-7)

![Eartquake](../../assets/js_avanzado/terremotos/eathquake.png)

#### 2. Dibuja un segundo mapa en la misma pantalla con las coordenadas de posiciones donde hay terremotos filtrando por magnitud y por fecha de inicio/fin
Revisar el funcionamiento de los endpoints dados para:
- Añadir filtro por magnitud en el HTML
  - Input magnitud
- Añadir filtro por fechas en el HTML
  - Input start date
  - Input end date
- [Ejemplo endpoint por magnitud y fecha](https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=2014-01-02&minmagnitude=5)
- [API earthquakes. Revisar sección query](https://earthquake.usgs.gov/fdsnws/event/1/#parameters)

<!-- 
#### 3. Firebase Firestore. Modificar mapa 1. Añadir un botón al popup para guardar favorito
- Añadir un botón de "añadir a favorito" en cada popup
- Los terremotos favoritos se guardarán en Firebase Firestore
- Tendrá que haber 2 botones encima del mapa a modo filtro. Según el botón que pulses, se mostrarán unos datos u otros
    1. Botón 1: Mostrar terremotos de la API
    2. Botón 2: Mostrar terremotos favoritos
- En la vista "favoritos", debe aparecer botón "eliminar de favoritos", que eliminará el terremoto de la BBDD
- No se deben guardar terremotos repetidos en la base de datos

#### 4. Firebase Auth. Autenticación en el sistema.
- Autenticación con Firebase auth: Sólo los usuarios que se autentiquen podrán guardar sus favoritos
- Cada usuario tendrá guardado en su cuenta los favoritos
- Cada usuario podrá ver únicamente sus propios favoritos -->

#### Tareas generales
- Incluir una animación mientras esperamos la carga del contenido.
- Al cargar la web deben de aparecer ambos mapas

### A por ello!!!
![Logo](../../assets/js_avanzado/terremotos/jabbascript.jpg)








