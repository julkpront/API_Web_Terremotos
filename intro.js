// INTRO: vídeo del globo + terremoto que da paso a la web

const intro = document.getElementById('intro');
const videoIntro = document.getElementById('introVideo');
const botonSaltar = document.getElementById('saltarIntro');

// Oculta la intro con un fundido y la elimina del DOM cuando termina la transición.
function cerrarIntro() {
    // Si ya se cerró (por ejemplo, el vídeo acaba justo después de pulsar el botón) no hacemos nada
    if (!intro.isConnected || intro.classList.contains('oculta')) {
        return;
    }

    videoIntro.pause();
    intro.classList.add('oculta');                    // El CSS hace el fundido (opacity)
    document.body.classList.remove('intro-activa');   // Devolvemos el scroll a la página

    // Quitamos la intro del DOM al acabar el fundido.
    // El setTimeout es una red de seguridad por si transitionend no llegara a dispararse.
    intro.addEventListener('transitionend', () => intro.remove(), { once: true });
    setTimeout(() => intro.remove(), 1500);
}

// Cuando el vídeo termina, o falla al cargar, pasamos a la web
videoIntro.addEventListener('ended', cerrarIntro);
videoIntro.addEventListener('error', cerrarIntro);
botonSaltar.addEventListener('click', cerrarIntro);

// Si la persona tiene activada la opción "reducir movimiento" en su sistema, nos saltamos la intro
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cerrarIntro();
} else {
    // play() devuelve una promesa: si el navegador bloquea el autoplay, la promesa se rechaza
    // y en ese caso entramos directamente a la web en vez de dejar la intro congelada.
    videoIntro.play().catch(cerrarIntro);
}
