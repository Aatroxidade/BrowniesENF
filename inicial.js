import { app } from "firebase.js";

import {

  getAuth,
  onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const auth = getAuth(app);


// BOTÃO AGENDAR
document.getElementById("btnAgendar").addEventListener("click", () => {

  window.location.href = "agendar.html";

});


// VERIFICAR LOGIN
onAuthStateChanged(auth, (user) => {

  // NÃO LOGADO
  if (!user) {

    window.location.href = "index.html";

    return;
  }


  // ADMIN
  if (user.email === "eliasgabaldioliveira@gmail.com") {

    document
      .getElementById("btnAdmin")
      .classList.remove("d-none");

  }

});
