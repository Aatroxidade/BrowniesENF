import { app, db } from "./firebase.js";

import {

  getAuth,
  onAuthStateChanged,
  signOut

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {

  doc,
  getDoc,
  onSnapshot

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

// ESTADO DA LOJA
onSnapshot(doc(db, "config", "loja"), (snap) => {

  const btnAgendar = document.getElementById("btnAgendar");
  const agendarQtd = document.getElementById("agendarQtd");

  const dados = snap.exists() ? snap.data() : { aberta: false, browniesDisponiveis: 0 };
  const aberta = dados.aberta ?? false;
  const qtd = dados.browniesDisponiveis ?? 0;

  if (aberta && qtd > 0) {
    btnAgendar.disabled = false;
    btnAgendar.classList.remove("btn-secondary");
    btnAgendar.classList.add("btn-warning");
    agendarQtd.textContent = `${qtd} disponível(is)`;
    agendarQtd.className = "agendar-qtd disponivel";
  } else {
    btnAgendar.disabled = true;
    btnAgendar.classList.remove("btn-warning");
    btnAgendar.classList.add("btn-secondary");
    agendarQtd.textContent = aberta ? "Esgotado" : "Loja fechada";
    agendarQtd.className = "agendar-qtd indisponivel";
  }

});

setTimeout(async () => {

  if (Notification.permission === "default") {

    const resultado = await Swal.fire({
      title: "Ativar notificações?",
      text: "Receba um aviso quando houver brownies disponíveis!",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Sim, ativar",
      cancelButtonText: "Agora não",
      confirmButtonColor: "#ffb347",
      cancelButtonColor: "#6c757d",
      background: "#1a1a1a",
      color: "#ffffff"
    });

    if (resultado.isConfirmed) {
      const permissao = await Notification.requestPermission();
      if (permissao === "granted") {
        Swal.fire({
          icon: "success",
          title: "Notificações ativadas!",
          timer: 1800,
          showConfirmButton: false,
          background: "#1a1a1a",
          color: "#ffffff"
        });
      }
    }

  }

}, 1500);

