import { app } from "./firebase.js";

import {
  getAuth,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth(app);

// 🔥 CRIAR CONTA
document.getElementById("btnCadastrar").addEventListener("click", async () => {

  const email = document.getElementById("emailCadastro").value;
  const senha = document.getElementById("senhaCadastro").value;

  const erro = document.getElementById("erroCadastro");

  try {

    await createUserWithEmailAndPassword(auth, email, senha);

    erro.innerText = "Conta criada com sucesso!";

    window.location.href = "index.html";

  } catch (e) {
    if (e.code === "auth/email-already-in-use") {
       erro.innerText = "Esse email já está cadastrado.";
       } else if (e.code === "auth/invalid-email"){
            erro.innerHTML === "Digite um email válido."
       } else if (e.code === "auth/weak-password"){
            erro.innerText === "Digite no minímo 6 caracteres."
       } else {
        erro.innerText === "Erro ao criar conta."
       }
        

  }

});

// 🔥 VOLTAR LOGIN
document.getElementById("btnEntrar").addEventListener("click", () => {

  window.location.href = "index.html";

});

document.querySelectorAll("input").forEach((input) => {

  input.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

      document.getElementById("btnCadastrar").click();

    }

  });

});
