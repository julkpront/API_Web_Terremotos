// USUARIO Y FAVORITOS CON localStorage
//
// IMPORTANTE: este archivo es el ÚNICO que habla con localStorage.
// El resto de la web solo llama a estas funciones.

// 1. LEER Y ESCRIBIR EN localStorage

// localStorage SOLO guarda texto. Para guardar listas u objetos hay que convertirlos:
//   JSON.stringify(objeto) -> texto   (al guardar)
//   JSON.parse(texto)      -> objeto  (al leer)
// El try/catch es necesario porque el navegador puede bloquear el almacenamiento
// (modo privado, permisos...) o el texto guardado puede estar corrupto.

function leerStorage(clave, valorPorDefecto) {
    try {
        const texto = localStorage.getItem(clave);
        // getItem devuelve null si esa clave todavía no existe
        if (texto === null) {
            return valorPorDefecto;
        }
        return JSON.parse(texto);
    } catch (error) {
        console.error('No se pudo leer ' + clave + ' de localStorage:', error);
        return valorPorDefecto;
    }
}
 
// Devuelve true si se guardó bien y false si falló (por ejemplo, almacenamiento lleno)
function escribirStorage(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
        return true;
    } catch (error) {
        console.error('No se pudo guardar ' + clave + ' en localStorage:', error);
        return false;
    }
}
 
 
// 2. USUARIO (LOGIN SIMULADO)
 
const CLAVE_USUARIO_ACTUAL = 'usuarioActual';
 
// Quita espacios sobrantes y pasa a minúsculas para que "Ana", "ana " y "ANA" sean el mismo usuario.
// Devuelve null si el nombre no es válido (entre 2 y 20 caracteres).
function normalizarNombre(nombre) {
    const limpio = String(nombre).trim().toLowerCase();
    if (limpio.length < 2 || limpio.length > 20) {
        return null;
    }
    return limpio;
}
 
// Devuelve el nombre de quien tiene la sesión iniciada, o null si no hay nadie
function obtenerUsuarioActual() {
    return leerStorage(CLAVE_USUARIO_ACTUAL, null);
}
 
// Inicia sesión. Devuelve el nombre ya normalizado, o null si el nombre no era válido.
function iniciarSesion(nombre) {
    const usuario = normalizarNombre(nombre);
    if (usuario === null) {
        return null;
    }
    escribirStorage(CLAVE_USUARIO_ACTUAL, usuario);
    return usuario;
}
 
function cerrarSesion() {
    try {
        localStorage.removeItem(CLAVE_USUARIO_ACTUAL);
    } catch (error) {
        console.error('No se pudo cerrar la sesión:', error);
    }
}
 
 
// 3. FAVORITOS (UNA LISTA POR USUARIO)
 
// Cada usuario tiene su propia clave: "favoritos_ana", "favoritos_selene"...
// Esa es la forma de que cada persona vea SOLO sus favoritos.
function claveFavoritos(usuario) {
    return 'favoritos_' + usuario;
}
 
// Devuelve la lista de favoritos del usuario actual (o [] si no hay sesión o no tiene ninguno)
function obtenerFavoritos() {
    const usuario = obtenerUsuarioActual();
    if (usuario === null) {
        return [];
    }
    const lista = leerStorage(claveFavoritos(usuario), []);
    // Por si el dato guardado estuviera estropeado: nos aseguramos de que sea una lista
    if (Array.isArray(lista)) {
        return lista;
    }
    return [];
}
 
function esFavorito(id) {
    return obtenerFavoritos().some(favorito => favorito.id === id);
}
 
// Guarda un terremoto en los favoritos del usuario actual.
// Devuelve: 'agregado', 'repetido' (ya estaba), 'sin-sesion' o 'error'.
function agregarFavorito(terremoto) {
    const usuario = obtenerUsuarioActual();
    if (usuario === null) {
        return 'sin-sesion';
    }
 
    const lista = obtenerFavoritos();
 
    // SIN DUPLICADOS: cada terremoto tiene un id único dado por el USGS (por ejemplo "us7000abcd").
    // Si ya hay un favorito con ese id, no lo volvemos a guardar.
    if (lista.some(favorito => favorito.id === terremoto.id)) {
        return 'repetido';
    }
 
    lista.push({ ...terremoto, guardadoEn: Date.now() });
    const guardado = escribirStorage(claveFavoritos(usuario), lista);
    if (guardado) {
        return 'agregado';
    }
    return 'error';
}
 
// Elimina un terremoto de los favoritos del usuario actual. Devuelve true si se pudo.
function quitarFavorito(id) {
    const usuario = obtenerUsuarioActual();
    if (usuario === null) {
        return false;
    }
    // filter se queda con todos los favoritos MENOS el que tiene ese id
    const lista = obtenerFavoritos().filter(favorito => favorito.id !== id);
    return escribirStorage(claveFavoritos(usuario), lista);
}

