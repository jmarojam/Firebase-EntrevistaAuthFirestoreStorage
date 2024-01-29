import { auth, firestore, getDocs, collection, onAuthStateChanged, signOut, getDoc, doc } from './firebaseconnect.js';

// Verificar Autenticación y Rol del Usuario
function verificarUsuario() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            verificarRolAdmin(user);
        } else {
            // No está autenticado, redirige a login
            redirigirALogin();
        }
    });
}

// Verificar si el Usuario es Administrador
function verificarRolAdmin(user) {
    getDoc(doc(firestore, "usuarios", user.uid)).then((doc) => {
        if (doc.exists() && doc.data().rol === 'administrador') {
            cargarVideos();
            cargarUsuarios();
            cargarPreguntas();
        } else {
            redirigirALogin(); // Redirige si no es administrador
        }
    }).catch(error => {
        console.error("Error al verificar el rol:", error);
        redirigirALogin();
    });
}


function cargarVideos() {
    const videosContainer = document.getElementById('videos-container');
    getDocs(collection(firestore, "videos")).then(querySnapshot => {
        querySnapshot.forEach(async (doc) => {
            const videoData = doc.data();
            const video = crearElementoVideo(videoData.url);
            const usuario = await obtenerNombreUsuario(videoData.userId);
            const videoElement = document.createElement('div');
            videoElement.appendChild(video);
            videoElement.innerHTML += `<p>Subido por: ${usuario}</p>`; 
            videosContainer.appendChild(videoElement);
        });
    }).catch(error => {
        console.error("Error al cargar videos: ", error);
    });
}

// Obtener nombre del usuario por su ID
async function obtenerNombreUsuario(userId) {
    try {
        const userDoc = await getDoc(doc(firestore, "usuarios", userId));
        if (userDoc.exists()) {
            return userDoc.data().nombreUsuario; 
        }
    } catch (error) {
        console.error("Error al obtener nombre de usuario:", error);
        return "Desconocido";
    }
}

// Crear Elemento de Video
function crearElementoVideo(url) {
    const video = document.createElement('video');
    video.src = url;
    video.controls = true;
    return video;
}

function cargarUsuarios() {
    const usuariosContainer = document.getElementById('users-container');

    getDocs(collection(firestore, "usuarios")).then(querySnapshot => {
        querySnapshot.forEach(doc => {
            const usuarioData = doc.data();
            const usuarioElement = document.createElement('div');
            usuarioElement.innerHTML = `<p>${usuarioData.nombreUsuario} - ${usuarioData.email}</p>`; 
            usuariosContainer.appendChild(usuarioElement); // Añadir el elemento al contenedor
        });
    }).catch(error => {
        console.error("Error al cargar usuarios: ", error);
    });
}


function cargarPreguntas() {
    const preguntasContainer = document.getElementById('questions-container');

    getDocs(collection(firestore, "preguntas")).then(querySnapshot => {
        querySnapshot.forEach(doc => {
            const preguntaData = doc.data();
            const preguntaElement = document.createElement('div');
            preguntaElement.innerHTML = `<p>${preguntaData.texto}</p>`; 
            preguntasContainer.appendChild(preguntaElement);
        });
    }).catch(error => {
        console.error("Error al cargar preguntas: ", error);
    });
}


// Redirigir a la Página de Login
function redirigirALogin() {
    window.location.href = 'login.html';
}

// Cerrar Sesión
document.getElementById('logout').addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Error al cerrar sesión:', error);
    });
});

// Iniciar Script
document.addEventListener('DOMContentLoaded', verificarUsuario);
