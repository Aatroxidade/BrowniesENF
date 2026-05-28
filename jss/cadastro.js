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


// CRIAR CONTA
document.getElementById("btnCadastrar").addEventListener("click", async () => {

  const nome = document.getElementById("nomeCadastro").value.trim();

  const email = document.getElementById("emailCadastro").value.trim();

  const senha = document.getElementById("senhaCadastro").value;

  const erro = document.getElementById("erroCadastro");


  // LIMPAR ERRO
  erro.innerText = "";


  // CAMPOS OBRIGATÓRIOS
  if (!nome || !email || !senha) {
    erro.style.color = "red";

    erro.innerText = "Preencha todos os campos.";

    erro.classList.add("erro-animacao");

    return;

  }


  // VALIDAR NOME
  const regexNome = /^[A-Za-zÀ-ÿ\s]+$/;

  if (!regexNome.test(nome)) {

    erro.innerText = "Digite apenas letras no nome.";

    erro.classList.add("erro-animacao");

    return;

  }


  try {

    const userCredential = await createUserWithEmailAndPassword(
  auth,
  email,
  senha
);

const user = userCredential.user;

await setDoc(doc(db, "usuarios", user.uid), {

nome: nome,

email: email

  });

    erro.style.color = "#7dff7d";

    erro.innerText = "Conta criada com sucesso!";


    // ENTRAR DIRETO
    window.location.href = "inicial.html";

  } catch (e) {

    erro.style.color = "red";


    if (e.code === "auth/email-already-in-use") {

      erro.innerText = "Esse email já está cadastrado.";

      erro.classList.add("erro-animacao");

    } else if (e.code === "auth/invalid-email") {

      erro.innerText = "Digite um email válido.";

      erro.classList.add("erro-animacao");

    } else if (e.code === "auth/weak-password") {

      erro.innerText = "A senha deve ter no mínimo 6 caracteres.";

      erro.classList.add("erro-animacao");

    } else {

      erro.innerText = "Erro ao criar conta.";

      erro.classList.add("erro-animacao");

    }

  }

});


// VOLTAR LOGIN
document.getElementById("btnEntrar").addEventListener("click", () => {

  window.location.href = "login.html";

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

    mostrarSenha.innerText = "🙈";

  } else {

    inputSenha.type = "password";

    mostrarSenha.innerText = "👁";

  }

});