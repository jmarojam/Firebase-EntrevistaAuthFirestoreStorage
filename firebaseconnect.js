
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDoc, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBm100OKEsIg3EuwOmsOWfF3i16j6tQ-KU",
    authDomain: "proyectofirebasestorage.firebaseapp.com",
    projectId: "proyectofirebasestorage",
    storageBucket: "proyectofirebasestorage.appspot.com",
    messagingSenderId: "756317223862",
    appId: "1:756317223862:web:802d3f5f53ccb17bc59f17",
    measurementId: "G-6KZYVSYRGL"
  };

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const firestore = getFirestore(app); // Obtén la instancia de Firestore
export { auth, firestore, getDocs, collection, onAuthStateChanged, signOut, getDoc, doc };

console.log("Conexión a Firebase establecida correctamente.");

export class ManageAccount {

   async register(email, password, nombreUsuario) {
    try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid; // Obtiene el UID del usuario
    
    // Guarda el nombre de usuario en Firestore
    await setDoc(doc(firestore, "usuarios", uid), {
      nombreUsuario: nombreUsuario,
      email: email
    });
    
        window.location.href = "login.html";
        // Mostrar alerta de registro exitoso
        alert("Registro exitoso. Serás redirigido a la página de inicio de sesión.");
      
  } catch(error) {
        console.error(error.message);
            // Mostrar alerta de error de registro
            alert("Error al registrar: " + error.message);
      };
  }

  async authenticate(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
  
      // Consulta el rol del usuario en Firestore
      const docRef = doc(firestore, "usuarios", uid);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.rol === 'administrador') {
          // Redirige al administrador a su página de administrador
          window.location.href = "admin.html";
        } else {
          // Redirige a los usuarios normales a la página principal
          window.location.href = "interview.html";
        }
      } else {
        console.log("No se encontró el documento del usuario.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error al iniciar sesión: " + error.message);
      throw error; 
    }
  }
  

  signOut() {
    signOut(auth)
      .then((_) => {
        window.location.href = "index.html";
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}