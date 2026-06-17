import { app, db } from "./firebase.js";

import {

  getAuth,
  onAuthStateChanged,
  signOut

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {

  doc,
  getDoc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const auth = getAuth(app);


// BOTÃO AGENDAR
document.getElementById("btnAgendar").addEventListener("click", () => {

  window.location.href = "agendar.html";

});


// VERIFICAR LOGIN
onAuthStateChanged(auth, async (user) => {

  // NÃO LOGADO
  if (!user) {

    window.location.href = "index.html";

    return;
  }

  const docRef = doc(db, "usuarios", user.uid);

const docSnap = await getDoc(docRef);

if (docSnap.exists()) {

  const dados = docSnap.data();

  document.getElementById("nomeUsuario").innerText =
    `Olá, ${dados.nome}`;

}




  // ADMIN
  if (user.email === "eliasgabaldioliveira@gmail.com") {

    document
      .getElementById("itemAdmin")
      .classList.remove("d-none");

  }

    document.body.style.display = "block";

    document.getElementById("btnSair").addEventListener("click", async () => {

  await signOut(auth);

  window.location.href = "index.html";

});

  

});

const btnNotif =
document.getElementById("ativarNotificacao");

btnNotif.addEventListener("click", async () => {

const permissao =
await Notification.requestPermission();

if (permissao === "granted") {

alert("Notificações ativadas!");

} else {

alert("Você negou as notificações.");

}

});

import "./notificacao.js";

setTimeout(async () => {

if (
Notification.permission === "default"
) {

const ativar =
confirm(
"Deseja receber notificações quando houver brownies disponíveis?"
);

if (ativar) {

window.ativarNotificacao();

}

}

}, 1500);

