import { app, db } from "./firebase.js";

import {

  doc,
  setDoc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {

  getAuth,
  createUserWithEmailAndPassword

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


// CRIAR CONTA
document.getElementById("btnCadastrar").addEventListener("click", async () => {

  const nome = document.getElementById("nomeCadastro").value.trim();

  const email = document.getElementById("emailCadastro").value.trim();

  const senha = document.getElementById("senhaCadastro").value;

  // CAMPOS OBRIGATÓRIOS
  if (!nome || !email || !senha) {

    showToast("Preencha todos os campos.");

    return;

  }


  // VALIDAR NOME
  const regexNome = /^[A-Za-zÀ-ÿ\s]+$/;

  if (!regexNome.test(nome)) {

    showToast("Digite apenas letras no nome.");

    return;

  }


  try {

    const userCredential = await createUserWithEmailAndPassword(auth, email, senha);

    const user = userCredential.user;

    await setDoc(doc(db, "usuarios", user.uid), {
      nome: nome,
      email: email
    });

    window.location.href = "inicial.html";

  } catch (e) {

    if (e.code === "auth/email-already-in-use") {

      showToast("Esse email já está cadastrado.");

    } else if (e.code === "auth/invalid-email") {

      showToast("Digite um email válido.");

    } else if (e.code === "auth/weak-password") {

      showToast("A senha deve ter no mínimo 6 caracteres.");

    } else {

      showToast("Erro ao criar conta.");

    }

  }

});


// VOLTAR LOGIN
document.getElementById("btnEntrar").addEventListener("click", () => {

  window.location.href = "index.html";

});


// ENTER
document.querySelectorAll("input").forEach((input) => {

  input.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

      document.getElementById("btnCadastrar").click();

    }

  });

});

const inputSenha = document.getElementById("senhaCadastro");

const mostrarSenha = document.getElementById("mostrarSenha");

mostrarSenha.addEventListener("click", () => {

  if (inputSenha.type === "password") {
    inputSenha.type = "text";
    mostrarSenha.classList.remove("bi-eye", "bi-eye-fill");
    mostrarSenha.classList.add("bi-eye-slash");
  } else {
    inputSenha.type = "password";
    mostrarSenha.classList.remove("bi-eye-slash");
    mostrarSenha.classList.add("bi-eye-fill");
  }

});