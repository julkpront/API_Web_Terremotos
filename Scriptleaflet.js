// CREAR LOS DOS MAPAS

// Esta función crea un mapa dentro del <div> cuyo id le pasemos.
// Así no repetimos el mismo código para el mapa 1 y el mapa 2.
function crearMapa(idDelDiv) {
    // setView([latitud, longitud], zoom): empezamos viendo todo el mundo (zoom 2)
    const mapa = L.map(idDelDiv).setView([20, 0], 2);

    // Si cambiamos lyrs=y a lyrs=s haces que la interfaz esté limpia.
    L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], // Esto es obligatorio para que Google no bloquee la petición
        attribution: '&copy; Google Maps'
    }).addTo(mapa);

    return mapa; // Devolvemos el mapa para poder guardarlo en una variable
}

const map = crearMapa('map');    // Mapa 1: terremotos del último día
const map2 = crearMapa('map2');  // Mapa 2: terremotos filtrados

// Una "capa" es como una caja donde guardamos los marcadores de cada mapa.
// Con capa.clearLayers() vaciamos la caja y así borramos los marcadores antiguos
// antes de pintar los nuevos (muy útil en el mapa 2 cada vez que filtramos).
const capa1 = L.layerGroup().addTo(map);
const capa2 = L.layerGroup().addTo(map2);



// COLORES SEGÚN LA MAGNITUD (de 0 a 7)


// Una lista de 8 colores: de verde (terremoto suave) a rojo oscuro (terremoto fuerte).
// La posición 0 es para magnitud 0-1, la 1 para 1-2, ... y la 7 para 7 o más.
const colores = [
    '#4caf50', // 0 - 1  verde
    '#8bc34a', // 1 - 2  verde claro
    '#cddc39', // 2 - 3  lima
    '#ffeb3b', // 3 - 4  amarillo
    '#ffc107', // 4 - 5  ámbar
    '#ff9800', // 5 - 6  naranja
    '#f44336', // 6 - 7  rojo
    '#b71c1c'  // 7+     rojo oscuro
];

// Recibe la magnitud y devuelve el color que le toca
function colorPorMagnitud(mag) {
    // Math.floor quita los decimales hacia abajo: 4.8 -> 4
    // Math.min(7, ...) evita pasarnos de 7 y Math.max(0, ...) evita números negativos
    // (existen terremotos con magnitud negativa). Así la posición siempre está entre 0 y 7.
    const posicion = Math.max(0, Math.min(7, Math.floor(mag)));
    return colores[posicion];
}

// Dibuja en la cabecera la leyenda con cada color y su rango de magnitud
function crearLeyenda() {
    const leyenda = document.getElementById('leyenda');

    for (let i = 0; i < colores.length; i++) {
        const color = colores[i]; 
        let texto = '';
        
        if (i === 7) {
            texto = '7+'; 
        } else {
            texto = i + '-' + (i + 1); 
        }

        // Fabricamos la etiqueta visual y la sumamos a la leyenda
        leyenda.innerHTML += '<span class="leyenda-item">' +
                                '<i style="background:' + color + '"></i>' + 
                                texto + 
                             '</span>';
    }
}

crearLeyenda();


// MOSTRAR / OCULTAR LA ANIMACIÓN DE CARGA Y LOS MENSAJES

// Muestra u oculta el círculo que gira utilizando la propiedad de estilo CSS display.
// Si "mostrar" es true, se muestra el elemento. Si es false, se oculta ('none').
function mostrarCargando(id, mostrar) {
    const elemento = document.getElementById(id);
    if (mostrar) {
        //dejamos vacio el elemento para aplicar las reglas en el archivo CSS
        elemento.style.display = ''; 
    } else {
        elemento.style.display = 'none';
    }
}

// Escribe un mensaje debajo del título del mapa. Si es un error lo ponemos en rojo.
function mostrarMensaje(id, texto, esError) {
    const mensaje = document.getElementById(id);
    mensaje.textContent = texto;
    
    // Aquí puedes usar toogle o si no un (if/else clásico)
    if (esError) {
        mensaje.classList.add('error');
    } else {
        mensaje.classList.remove('error');
    }
}

// PINTAR LOS TERREMOTOS EN UN MAPA


// Función para mostrar los datos que queramos que aparezcan de la API.
// "capa" es la caja de marcadores del mapa donde queremos pintar (capa1 o capa2).
// El 3er parámetro "modo" decide si el popup lleva botón de favoritos y de qué tipo:
//   'api'       -> botón "Añadir a favoritos" (mapa 1, vista de la API)
//   'favoritos' -> botón "Eliminar de favoritos" (mapa 1, vista de favoritos)
//   null        -> sin botón (mapa 2). Por defecto vale null, así el mapa 2 sigue funcionando igual.
function painData(data, capa, modo = null) {
    capa.clearLayers(); // Borramos los marcadores que hubiera antes
    if (modo) {
        terremotosMapa1.clear(); 
    }

    data.features.forEach(pin => {
        // Coordenadas corregidas [Latitud, Longitud]
        // La API las da al revés ([longitud, latitud]) y Leaflet las quiere como [latitud, longitud]
        const coordinates = [
            pin.geometry.coordinates[1],
            pin.geometry.coordinates[0]
        ];

        // Extracción de propiedades desde el JSON de la API
        const title = pin.properties.title;
        const place = pin.properties.place;
        const code = pin.properties.code;
        const mag = pin.properties.mag;
        const magType = pin.properties.magType;

        // Conversión de la marca de tiempo a fecha local legible
        // (la API da la fecha como un número de milisegundos; new Date lo convierte en fecha)
        const fechaLegible = new Date(pin.properties.time).toLocaleString('es-ES');

        // Color de este terremoto según su magnitud
        const color = colorPorMagnitud(mag);

        // Solo en el mapa 1: guardamos los datos de este terremoto en un Map (clave = id del USGS)
        // para encontrarlo luego cuando se pulse el botón del popup, y preparamos ese botón.
        let botonFavorito = '';
        if (modo) {
            terremotosMapa1.set(pin.id, featureAFavorito(pin));
            botonFavorito = htmlBotonFavorito(pin.id, modo);
        }

        // Estructura HTML limpia vinculada a las clases del style.css
        L.circleMarker(coordinates, {
            radius: 8,            // Tamaño fijo del punto en la pantalla
            color: '#ffffff',     // Borde blanco (se ve bien sobre el mapa de satélite)
            fillColor: color,     // Relleno: el color que toca según la magnitud
            fillOpacity: 0.8,
            weight: 1
          })
          .addTo(capa)            // Lo metemos en la caja del mapa correspondiente
          .bindPopup(`
            <div class="popup-terremoto">
                <h4>${title}</h4>
                <hr>
                <p><b>📍 Ubicación:</b> ${place}</p>
                <p><b>📅 Fecha:</b> ${fechaLegible}</p>
                <p><b>📊 Magnitud:</b> ${mag} (${magType})</p>
                <p class="codigo-id"><b>🆔 Código:</b> ${code}</p>
                ${botonFavorito}
            </div>
         `);
      });
    }


// TERREMOTOS DEL ÚLTIMO DÍA (MAPA 1)

// Función asíncrona con TU fetch exacto
async function callTerr() {
  mostrarCargando('cargando1', true); // Encendemos la animación de carga

  // try intenta ejecutar el código; si algo falla, salta al catch en vez de romper la página
  try {
    const respuesta = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson");
    const datos = await respuesta.json();

    console.log(datos);

    // Guardamos los datos para poder volver a pintarlos al cambiar de vista SIN pedirlos otra vez a la API
    datosApi1 = datos;

    // Solo pintamos si el usuario sigue en la vista de la API. Si pulsó "Mis favoritos" mientras
    // cargaba, no debemos pisar los favoritos con los datos de la API.
    if (vistaActual === 'api') {
        pintarVistaApi();
    }

    return datos;
  } catch (error) {
    console.error("Hubo un error al obtener los datos:", error);
    if (vistaActual === 'api') {
      mostrarMensaje('mensaje1', 'No se pudieron cargar los terremotos. Inténtalo de nuevo más tarde.', true);
    }
  } finally {
    // finally se ejecuta SIEMPRE, haya ido bien o mal: apagamos la animación de carga
    mostrarCargando('cargando1', false);
  }
}

// TERREMOTOS FILTRADOS (MAPA 2)

const formFiltros = document.getElementById('filtros');
const inputMagnitud = document.getElementById('magnitud');
const inputFechaInicio = document.getElementById('fechaInicio');
const inputFechaFin = document.getElementById('fechaFin');
const botonFiltrar = document.getElementById('botonFiltrar');

// Valores por defecto: desde el 1 de enero del año actual hasta hoy
const hoy = new Date(); // Fecha y hora de ahora mismo

// hoy.getFullYear() da el año actual (por ejemplo 2026).
// Lo unimos con '-01-01' para formar el texto "2026-01-01".
inputFechaInicio.value = hoy.getFullYear() + '-01-01';

// Aquí queremos la fecha de hoy como texto "AAAA-MM-DD". Se hace en dos pasos encadenados:
//   1) hoy.toISOString()  -> convierte la fecha en un texto con este formato: "2026-10-19T15:30:00.000Z"
//   2) .slice(0, 10)      -> recorta ese texto y se queda con los caracteres de la posición 0 a la 9
//                            (los 10 primeros), o sea: "2026-10-19"
// Se necesita ese formato porque es el que entienden los inputs de tipo date y la API.
inputFechaFin.value = hoy.toISOString().slice(0, 10);

// Esta función supergrande e IMPORTANTE --> lee los filtros, comprueba que estén bien y pide los datos a la API
async function callTerrFiltrados() {
  const magnitud = inputMagnitud.value;
  const fechaInicio = inputFechaInicio.value;
  const fechaFin = inputFechaFin.value;

  // Validaciones: si algo está mal, avisamos y paramos con return
  if (magnitud === '' || Number(magnitud) < 0 || Number(magnitud) > 10) {
    mostrarMensaje('mensaje2', 'La magnitud debe ser un número entre 0 y 10.', true);
    return;
  }
  if (fechaInicio === '' || fechaFin === '') {
    mostrarMensaje('mensaje2', 'Elige la fecha de inicio y la fecha de fin.', true);
    return;
  }
  if (fechaInicio > fechaFin) {
    // Las fechas con formato "2026-10-19" se pueden comparar directamente con > y <
    mostrarMensaje('mensaje2', 'La fecha de inicio no puede ser posterior a la de fin.', true);
    return;
  }

  // La API NO incluye el día final (endtime es "hasta las 00:00 de ese día").
  // Para que el último día elegido sí salga, le sumamos un día a la fecha de fin.
  const fin = new Date(fechaFin);              // Convertimos el texto "2026-10-19" en una fecha
  fin.setUTCDate(fin.getUTCDate() + 1);        // Sumamos 1 día
  const fechaFinApi = fin.toISOString().slice(0, 10); // Lo volvemos a pasar a texto "AAAA-MM-DD" (igual que arriba)

  // OJO: minmagnitude es una magnitud MÍNIMA. Si pones 6, la API devuelve los terremotos de magnitud 6 en adelante.
  // Montamos la dirección de la API con los filtros del usuario.
  const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${fechaInicio}&endtime=${fechaFinApi}&minmagnitude=${magnitud}`;

  mostrarCargando('cargando2', true);
  botonFiltrar.disabled = true;          // Desactivamos el botón para que no pulsen varias veces
  mostrarMensaje('mensaje2', '', false); // Limpiamos mensajes anteriores

  try {
    const respuesta = await fetch(url);

    // respuesta.ok es false si la API contesta con un error (por ejemplo, demasiados resultados)
    if (!respuesta.ok) {
      throw new Error('La API respondió con el código ' + respuesta.status);
    }

    const datos = await respuesta.json();
    painData(datos, capa2);
    mostrarMensaje('mensaje2', 'Terremotos encontrados: ' + datos.features.length, false);
  } catch (error) {
    console.error("Hubo un error al obtener los datos filtrados:", error);
    capa2.clearLayers(); // Quitamos los puntos antiguos para no confundir
    mostrarMensaje('mensaje2', 'No se pudieron cargar los datos. Prueba con menos días o una magnitud mayor.', true);
  } finally {
    mostrarCargando('cargando2', false);
    botonFiltrar.disabled = false; // Volvemos a activar el botón
  }
}

// Cuando se envía el formulario (botón Filtrar)...
formFiltros.addEventListener('submit', function (evento) { //submit para enviar el form del filtro 
  evento.preventDefault(); // Evita que la página se recargue debido al submit, por eso preventDefault
  callTerrFiltrados();
});

//(LOGIN SIMULADO)
// Las funciones obtenerUsuarioActual, iniciarSesion y cerrarSesion están en favoritos.js

const formLogin = document.getElementById('formLogin');
const inputUsuario = document.getElementById('nombreUsuario');
const sesionActiva = document.getElementById('sesionActiva');
const textoUsuario = document.getElementById('usuarioNombre');
const botonSalir = document.getElementById('botonSalir');

// Según haya sesión o no, enseña el formulario de entrada o el nombre del usuario.
// "hidden" es un atributo HTML: true oculta el elemento, false lo muestra.
function actualizarBarraUsuario() {
    const usuario = obtenerUsuarioActual();

    formLogin.hidden = Boolean(usuario);   // Boolean(...) convierte el nombre (o null) en true/false
    sesionActiva.hidden = !usuario;
    textoUsuario.textContent = usuario || '';

    // Sin sesión no hay favoritos que ver, así que desactivamos ese botón
    botonVistaFavoritos.disabled = !usuario;
}

formLogin.addEventListener('submit', function (evento) {
    evento.preventDefault(); // Evita que el formulario recargue la página

    const usuario = iniciarSesion(inputUsuario.value); // Devuelve el nombre limpio, o null si no es válido
    if (usuario === null) {
        mostrarMensaje('mensajeUsuario', 'Escribe un nombre de entre 2 y 20 caracteres.', true);
        return;
    }

    inputUsuario.value = '';
    mostrarMensaje('mensajeUsuario', '', false);
    alCambiarSesion();
});

botonSalir.addEventListener('click', function () {
    cerrarSesion();
    alCambiarSesion();
});

// Se ejecuta cada vez que alguien entra o sale: actualiza la barra y repinta el mapa 1,
// porque los popups cambian (con sesión llevan botón, sin sesión llevan un aviso).
function alCambiarSesion() {
    actualizarBarraUsuario();

    // Si estabas viendo tus favoritos y sales, esa vista ya no tiene sentido: volvemos a la API
    if (!obtenerUsuarioActual() && vistaActual === 'favoritos') {
        cambiarVista('api');
    } else {
        refrescarVista();
    }
}


// FAVORITOS Y VISTAS DEL MAPA 1

// Estado de la vista del mapa 1
let vistaActual = 'api';   // 'api' (terremotos de la API) o 'favoritos' (los del usuario)
let datosApi1 = null;      // Último resultado de la API (null hasta que llegue)

// Terremotos que hay ahora mismo en el mapa 1: clave = id del USGS, valor = datos resumidos.
// Cuando se pulsa el botón de un popup, aquí encontramos el terremoto completo por su id.
const terremotosMapa1 = new Map();

const botonVistaApi = document.getElementById('botonVistaApi');
const botonVistaFavoritos = document.getElementById('botonVistaFavoritos');

// Convierte un terremoto de la API en un objeto pequeño con solo lo que necesitamos guardar
function featureAFavorito(pin) {
    return {
        id: pin.id,
        title: pin.properties.title,
        place: pin.properties.place,
        mag: pin.properties.mag,
        magType: pin.properties.magType,
        time: pin.properties.time,
        code: pin.properties.code,
        lat: pin.geometry.coordinates[1],   // La API da [longitud, latitud]
        lon: pin.geometry.coordinates[0]
    };
}

// Camino inverso: reconstruye la forma que espera painData a partir de un favorito guardado.
// Así painData sirve igual para datos de la API que para favoritos, sin duplicar código.
function favoritoAFeature(favorito) {
    return {
        id: favorito.id,
        properties: {
            title: favorito.title,
            place: favorito.place,
            mag: favorito.mag,
            magType: favorito.magType,
            time: favorito.time,
            code: favorito.code
        },
        geometry: { coordinates: [favorito.lon, favorito.lat] }
    };
}

// Devuelve el HTML del botón (o aviso) que va al final del popup
function htmlBotonFavorito(id, modo) {
    if (!obtenerUsuarioActual()) {
        return '<p class="aviso-favorito">🔒 Entra con tu usuario para guardar favoritos</p>';
    }
    if (modo === 'favoritos') {
        // data-id guarda el id dentro del botón, para saber qué terremoto es al pulsarlo
        return `<button type="button" class="btn-favorito btn-eliminar" data-id="${id}">🗑 Eliminar de favoritos</button>`;
    }
    if (esFavorito(id)) {
        return '<button type="button" class="btn-favorito" disabled>★ Ya está en favoritos</button>';
    }
    return `<button type="button" class="btn-favorito" data-id="${id}">☆ Añadir a favoritos</button>`;
}

// El popup NO existe en el HTML hasta que se abre: Leaflet lo crea en ese momento.
// Por eso no podemos poner el addEventListener al botón al pintar el mapa (el botón aún no existe).
// Solución: escuchamos el evento "popupopen" de Leaflet y, cuando el popup ya está abierto, buscamos el botón.
map.on('popupopen', function (evento) {
    const boton = evento.popup.getElement().querySelector('.btn-favorito[data-id]');
    if (boton) {
        boton.addEventListener('click', () => alPulsarBotonFavorito(boton), { once: true });
    }
});

function alPulsarBotonFavorito(boton) {
    const id = boton.dataset.id;               // Leemos el data-id que pusimos en el HTML
    const terremoto = terremotosMapa1.get(id); // Y buscamos el terremoto con ese id
    if (!terremoto) {
        return;
    }

    if (vistaActual === 'api') {
        const resultado = agregarFavorito(terremoto);
        if (resultado === 'agregado' || resultado === 'repetido') {
            boton.textContent = '★ Guardado en favoritos';
            boton.disabled = true;
        } else {
            mostrarMensaje('mensaje1', 'No se pudo guardar el favorito.', true);
        }
    } else {
        quitarFavorito(id);
        map.closePopup();
        pintarVistaFavoritos(); // Repintamos para que desaparezca el marcador eliminado
    }
}

// Pinta en el mapa 1 los terremotos de la API (los últimos guardados en datosApi1)
function pintarVistaApi() {
    painData(datosApi1, capa1, 'api');
    mostrarMensaje('mensaje1', 'Terremotos encontrados: ' + datosApi1.features.length, false);
}

// Pinta en el mapa 1 solo los favoritos del usuario actual
function pintarVistaFavoritos() {
    if (!obtenerUsuarioActual()) {
        capa1.clearLayers();
        mostrarMensaje('mensaje1', 'Entra con tu usuario para ver tus favoritos.', false);
        return;
    }

    const favoritos = obtenerFavoritos();
    painData({ features: favoritos.map(favoritoAFeature) }, capa1, 'favoritos');

    if (favoritos.length === 0) {
        mostrarMensaje('mensaje1', 'Todavía no tienes favoritos. Añade alguno desde la vista de la API.', false);
    } else {
        mostrarMensaje('mensaje1', 'Tus favoritos: ' + favoritos.length, false);
    }
}

// Repinta la vista en la que estemos ahora mismo
function refrescarVista() {
    if (vistaActual === 'favoritos') {
        pintarVistaFavoritos();
    } else if (datosApi1) {
        pintarVistaApi();
    } else {
        callTerr(); // Aún no hay datos de la API (por ejemplo, falló la primera carga): lo intentamos de nuevo
    }
}

// Cambia entre las dos vistas y marca como activo el botón correspondiente
function cambiarVista(vista) {
    vistaActual = vista;

    botonVistaApi.classList.toggle('activo', vista === 'api');
    botonVistaFavoritos.classList.toggle('activo', vista === 'favoritos');
    botonVistaApi.setAttribute('aria-pressed', String(vista === 'api'));
    botonVistaFavoritos.setAttribute('aria-pressed', String(vista === 'favoritos'));

    map.closePopup();
    refrescarVista();
}

botonVistaApi.addEventListener('click', () => cambiarVista('api'));
botonVistaFavoritos.addEventListener('click', () => cambiarVista('favoritos'));


//AL ABRIR LA PÁGINA: CARGAMOS LOS DOS MAPAS

// Si ya había una sesión guardada (de una visita anterior), la barra de usuario lo refleja
actualizarBarraUsuario();

// Ejecutamos tu función para que cargue todo al iniciar la página
callTerr();
callTerrFiltrados(); // El mapa 2 también aparece con datos (con los filtros por defecto)
