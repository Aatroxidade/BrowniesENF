import { app } from "./firebase.js";

import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth(app);

// LOGIN
document.getElementById("btnLogin").addEventListener("click", async () => {

  const email = document.getElementById("nomeUsuario").value.trim();

  const senha = document.getElementById("senhaLogin").value;

  const erro = document.getElementById("erroLogin");

  try {

    await signInWithEmailAndPassword(auth, email, senha);

    window.location.href = "inicial.html";

  } catch (e) {

    console.log(e.code);
    console.log(e.message);

    if (e.code === "auth/invalid-email") {

      erro.innerText = "Digite um email válido.";

    } else if (e.code === "auth/invalid-credential") {

      erro.innerText = "Email ou senha incorretos.";

    } else {

      erro.innerText = "Erro ao fazer login.";

    }

  }

});

// IR PARA CADASTRO
document.getElementById("btnCriarConta").addEventListener("click", () => {

  window.location.href = "cadastro.html";

});

document.querySelectorAll("input").forEach((input) => {

  input.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

      document.getElementById("btnLogin").click();

    }

  });

});

const inputSenha = document.getElementById("senhaLogin");

const btnMostrar = document.getElementById("mostrarSenha");

btnMostrar.addEventListener("click", () => {

  if (inputSenha.type === "password") {
    inputSenha.type = "text";
    btnMostrar.classList.remove("bi-eye", "bi-eye-fill");
    btnMostrar.classList.add("bi-eye-slash");
  } else {
    inputSenha.type = "password";
    btnMostrar.classList.remove("bi-eye-slash");
    btnMostrar.classList.add("bi-eye-fill");
  }

});