import { db, app } from "./firebase.js";

import {

  collection,

  addDoc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {

  getAuth,

  onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const auth = getAuth(app);


// ESPERA O FIREBASE CONFIRMAR LOGIN
onAuthStateChanged(auth, (user) => {

  // NÃO LOGADO
  if (!user) {

   Swal.fire({
  icon: "warning",
  title: "Login necessário",
  text: "Você precisa estar logado.",
  confirmButtonColor: "#d48a27"
});

    window.location.href = "login.html";

    return;
  }

  // BOTÃO
  document.getElementById("btnAgendamento").addEventListener("click", async () => {

    const nome = document.getElementById("nome").value;

    const quantidade = document.getElementById("quantidade").value;

    const data = document.getElementById("data").value;

    const horario = document.getElementById("horario").value;

    const observacao = document.getElementById("observacao").value;

    if (!quantidade || !data || !horario || !nome) {
        Swal.fire({
  icon: "warning",
  title: "Campos obrigatórios",
  text: "Preencha todos os campos obrigatórios.",
  confirmButtonColor: "#d48a27"
});
        return;
    }

    const regexNome = /^[A-Za-zÀ-ÿ\s]+$/;

if (!regexNome.test(nome)) {

  Swal.fire({
    icon: "warning",
    title: "Nome inválido",
    text: "Digite apenas letras no nome.",
    confirmButtonColor: "#d48a27"
  });

  return;
}

if (quantidade > 12) {
    Swal.fire({
        icon: "warning",
        title: "Limite de brownies excedido",
        text: "O máximo de brownies permitido é 12.",
        confirmButtonColor: "#d48a27"
    })

    return;
}

    try {

      await addDoc(collection(db, "pedidos"), {

        usuario: user.email,

        produto: "Brownie de Oreo",

        nome: nome,

        quantidade: quantidade,

        data: data,

        horario: horario,

        observacao: observacao,

        status: "Pendente",

        criadoEm: new Date()

      });

      Swal.fire({

  icon: "success",

  title: "Pedido agendado!",

  text: "Seu brownie foi reservado com sucesso 🍪",

  confirmButtonColor: "#d48a27",

  timer: 2500,

  timerProgressBar: true,

  showConfirmButton: false

});


setTimeout(() => {

  window.location.href = "inicial.html";

}, 2500);

    } catch (e) {

      Swal.fire({
       icon: "error",
       title: "Erro",
       text: "Não foi possível salvar o pedido.",
       confirmButtonColor: "#d33"
});

    }

  });

});

  // VERIFICA ADMIN
  if (user.email !== "eliasgabaldioliveira@gmail.com") {
    document.getElementById("btnAdmin").style.display = "none";
 
  }