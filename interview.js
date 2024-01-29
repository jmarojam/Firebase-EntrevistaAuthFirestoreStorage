import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";



const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

  const app = initializeApp(firebaseConfig);

  // Servicios de Firebase
  const firestore = getFirestore(app);
  const storage = getStorage(app);
  const auth = getAuth(app);


  const preguntaInput = document.getElementById('preguntaInput');
  const agregarPreguntaBtn = document.getElementById('agregarPreguntaBtn');
  const iniciarEntrevistaBtn = document.getElementById('iniciarEntrevistaBtn');
  const areaPreguntas = document.getElementById('areaPreguntas');
  const webcamVideo = document.getElementById('webcamVideo');
  const grabarBtn = document.getElementById('grabarBtn');
  const detenerGrabacionBtn = document.getElementById('detenerGrabacionBtn');
  
  let mediaRecorder;
  let recorderfrag = [];
  let currentUserId = null; // ID del usuario actual

  // Observador de autenticación para establecer el ID del usuario actual
onAuthStateChanged(auth, (user) => {
  if (user) {
  currentUserId = user.uid;
  } else {
  // Si no hay usuario, redirigir al login o mostrar un mensaje
  alert("Por favor, inicia sesión para continuar.");
  // Redirigir a login
  window.location.href = 'login.html';
  }
  });


  // Agregar pregunta a Firestore asociada con el usuario
  agregarPreguntaBtn.addEventListener('click', async () => {
  const pregunta = preguntaInput.value;
  if (pregunta && currentUserId) { // Verifica que haya una pregunta y un usuario
  try {
  await addDoc(collection(firestore, "preguntas"), {
  texto: pregunta,
  userId: currentUserId, // Asocia la pregunta con el ID del usuario
  });
  alert("Pregunta agregada");
  preguntaInput.value = ''; // Limpia el campo de entrada
  } catch (error) {
  console.error("Error al agregar pregunta:", error);
  }
  } else {
  alert("Por favor, introduce una pregunta y asegúrate de haber iniciado sesión.");
  }


  });



  iniciarEntrevistaBtn.addEventListener('click', async () => {
    if (!currentUserId) {
      alert("Por favor, inicia sesión para continuar.");
      return;
    }
  
    try {
      // Obtener todas las preguntas del usuario autenticado
      const preguntasRef = collection(firestore, "preguntas");
      const q = query(preguntasRef, where("userId", "==", currentUserId));
      const querySnapshot = await getDocs(q);
  
      const preguntas = [];
      querySnapshot.forEach((doc) => {
        preguntas.push(doc.data().texto);
      });
      if (preguntas.length > 0) {
        // Seleccionar una pregunta al azar
        const preguntaAleatoria = preguntas[Math.floor(Math.random() * preguntas.length)];
        areaPreguntas.textContent = preguntaAleatoria; // Mostrar la pregunta
      } else {
        alert("No hay preguntas disponibles para mostrar. Asegúrate de haber agregado preguntas.");
      }
    } catch (error) {
      console.error("Error al obtener preguntas:", error);
      alert("Error al obtener preguntas. Por favor, intenta de nuevo.");
      }
      
    grabarBtn.disabled = false;  // Habilitar botón "Grabar respuesta"
    agregarPreguntaBtn.disabled = true;  // Deshabilitar botón "Agregar Pregunta"
    iniciarEntrevistaBtn.disabled = true;  // Deshabilitar "Iniciar Entrevista" durante la grabación
    iniciarGrabacionWebcam();
      });

// Iniciar grabación de la webcam
function iniciarGrabacionWebcam() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      console.log("Pistas de audio:", stream.getAudioTracks());
      stream.getAudioTracks().forEach(track => console.log(`Track status: ${track.label}, enabled: ${track.enabled}`));
      
      webcamVideo.srcObject = stream;
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp8,opus' });
      mediaRecorder.onerror = (event) => {
        console.error("Error del MediaRecorder:", event.error);
      };
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recorderfrag.push(event.data);
        }
      };
      grabarBtn.onclick = () => { 
        mediaRecorder.start();
      detenerGrabacionBtn.disabled= false; // Habilitar el botón "Detener grabación"
      grabarBtn.disabled = true; // Desabilitar el botón "Grabar respuesta"
      };
      detenerGrabacionBtn.onclick = () => {
        mediaRecorder.stop();
      detenerGrabacionBtn.disabled = true; // Deshabilitar el botón "Detener grabación"
      };

      // Cuando se detiene la grabación, procesar el video
mediaRecorder.onstop = () => {
    const blob = new Blob(recorderfrag, {
      type: "video/webm"
    });
    subirVideo(blob, `entrevista-${currentUserId}-${Date.now()}.webm`); //el documento: entrevista-identifUsuarioAuth-datasibida.webm
    recorderfrag = [];


    // Restablecer los botones para una nueva entrevista, si es necesario
    grabarBtn.disabled = false;
    agregarPreguntaBtn.disabled = false;
    iniciarEntrevistaBtn.disabled = false;
  };

    })
    .catch(error => {
      console.error("Error al acceder a la webcam", error);
    });
}

// Subir video a Firebase Storage
function subirVideo(blob, nombreArchivo) {
  if (!currentUserId) {
    console.log('Usuario no autenticado.');
    alert('Debes estar autenticado para subir videos.');
    return;
  }
  
  console.log('Iniciando la subida del video.');
  const storageRef = ref(storage, `videos/${currentUserId}/${nombreArchivo}`);
  
  uploadBytes(storageRef, blob)
    .then(snapshot => {
      console.log('Video subido a Storage, obteniendo URL...');
      return getDownloadURL(snapshot.ref);
    })
    .then(downloadURL => {
      console.log("Video subido, URL:", downloadURL);
      console.log('Guardando URL en Firestore...');
      const videoDocRef = collection(firestore, "videos");
      return addDoc(videoDocRef, {
        url: downloadURL,
        userId: currentUserId,
        createdAt: new Date()
      });
    })
    .then(() => {
      console.log('El video ha sido guardado en Firestore correctamente.');
      alert('Video subido correctamente.');
    })
    .catch(error => {
      console.log('Error en el proceso de subida:', error);
      alert('Error al subir el video. Por favor, intenta de nuevo.');
    });
}
