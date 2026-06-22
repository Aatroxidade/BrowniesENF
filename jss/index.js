import { app } from "./firebase.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth(app);

function showToast(msg, tipo = "erro") {
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.classList.remove("visivel", "toast-sucesso");
  if (tipo === "sucesso") toast.classList.add("toast-sucesso");
  void toast.offsetWidth;
  toast.classList.add("visivel");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("visivel"), 4000);
}

// LOGIN
document.getElementById("btnLogin").addEventListener("click", async () => {

  const email = document.getElementById("nomeUsuario").value.trim();

  const senha = document.getElementById("senhaLogin").value;

  try {

    await signInWithEmailAndPassword(auth, email, senha);

    window.location.href = "inicial.html";

  } catch (e) {

    console.log(e.code);
    console.log(e.message);

    if (e.code === "auth/invalid-email") {

      showToast("Digite um email válido.");

    } else if (e.code === "auth/invalid-credential") {

      showToast("Email ou senha incorretos.");

    } else {

      showToast("Erro ao fazer login.");

    }

  }

});

// ESQUECI A SENHA
document.getElementById("linkEsqueciSenha").addEventListener("click", async () => {

  const email = document.getElementById("nomeUsuario").value.trim();

  if (!email) {

    showToast("Digite seu email acima antes de redefinir a senha.");

    return;

  }

  try {

    await sendPasswordResetEmail(auth, email);

    showToast("Email de redefinição enviado! Verifique sua caixa de entrada.", "sucesso");

  } catch (e) {

    if (e.code === "auth/invalid-email") {

      showToast("Digite um email válido.");

    } else if (e.code === "auth/user-not-found") {

      showToast("Nenhuma conta encontrada com esse email.");

    } else {

      showToast("Erro ao enviar email. Tente novamente.");

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