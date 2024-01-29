
import { ManageAccount } from './firebaseconnect.js'; // Importa la clase o función ManageAccount desde el archivo 'firebaseconnect.js'

function validarSenha(password) {
  const comprimentoMinimo = 8;
  const letraMayuscula = /[A-Z]/;
  const numeros = /\d/;
  const caracteresProibidos = /[&ñ@;_]/;

  return password.length >= comprimentoMinimo &&
         letraMayuscula.test(password) &&
         numeros.test(password) &&
         !caracteresProibidos.test(password);
}

function generarNombreUsuario() {
 
  const numeroAleatorio = Math.floor(1000 + Math.random() * 9000); // Genera un número de 4 dígitos
  return `ASPIRANTE${numeroAleatorio}`;
    
  
}

document.getElementById("formulario-crear").addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!validarSenha(password)) {
      alert('La contraseña no cumple con los requisitos.');
      return;
  }

  const nombreUsuario = generarNombreUsuario();
  const account = new ManageAccount();

  try {
      await account.register(email, password, nombreUsuario);
      alert('Tu nombre de usuario es: ' + nombreUsuario);
      
  } catch (error) {
      console.error('Error en el registro:', error.message);
      if (error.code === 'auth/email-already-in-use') {
          alert('Error en el registro: Este correo electrónico ya está en uso.');
      } else {
          alert('Error en el registro: ' + error.message);
      }
  }
});


console.log('Formulario de Registro');
