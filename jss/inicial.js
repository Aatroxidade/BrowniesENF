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

    window.location.href = "login.html";

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
      .getElementById("btnAdmin")
      .classList.remove("d-none");

  }

    document.body.style.display = "block";

    document.getElementById("btnSair").addEventListener("click", async () => {

  await signOut(auth);

  window.location.href = "login.html";

});

  

});

fetch("http://localhost:3000")

  .then(res => res.text())

  .then(data => {

    console.log(data);

  })

  .catch(error => {

    console.error(error);

  });

  fetch("http://localhost:3000/pedido", {

  method: "POST",

  headers: {

    "Content-Type": "application/json"

  },

  body: JSON.stringify({

    nome: "Rodrigo",
    servico: "Corte"

  })

})

.then(res => res.json())

.then(data => {

  console.log(data);

});