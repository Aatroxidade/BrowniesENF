import { app, db } from "firebase.js";

import {

  getAuth,
  onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {

  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const auth = getAuth(app);


// VERIFICA LOGIN
onAuthStateChanged(auth, async (user) => {

  // NÃO LOGADO
  if (!user) {

    window.location.href = "index.html";

    return;
  }


  // NÃO É ADMIN
  if (user.email !== "eliasgabaldioliveira@gmail.com") {

    Swal.fire({

      icon: "error",

      title: "Acesso negado",

      text: "Você não possui permissão.",

      confirmButtonColor: "#d33"

    }).then(() => {

      window.location.href = "inicial.html";

    });

    return;
  }


  // LISTA
  const lista = document.getElementById("listaAdmin");


  // BUSCAR PEDIDOS
  const querySnapshot = await getDocs(

    collection(db, "pedidos")

  );


  // SEM PEDIDOS
  if (querySnapshot.empty) {

    lista.innerHTML = `

      <p class="text-white text-center">

        Nenhum pedido encontrado.

      </p>

    `;

    return;
  }


  // MOSTRAR PEDIDOS
  querySnapshot.forEach((pedidoDoc) => {

    const pedido = pedidoDoc.data();

    const pedidoId = pedidoDoc.id;


    lista.innerHTML += `

      <div class="card_admin">

        <h3>
          🍪 ${pedido.produto}
        </h3>

        <hr>

        <p>
          <strong>Cliente:</strong>
          ${pedido.nome}
        </p>

        <p>
          <strong>Email:</strong>
          ${pedido.usuario}
        </p>

        <p>
          <strong>Quantidade:</strong>
          ${pedido.quantidade}
        </p>

        <p>
          <strong>Data:</strong>
          ${pedido.data}
        </p>

        <p>
          <strong>Horário:</strong>
          ${pedido.horario}
        </p>

        <p>
          <strong>Observações:</strong>
          ${pedido.observacao || "Nenhuma"}
        </p>

        <p>
          <strong>Status:</strong>

          <span class="
            ${pedido.status === "Aprovado" ? "status_aprovado" : ""}
            ${pedido.status === "Cancelado" ? "status_cancelado" : ""}
            ${!pedido.status || pedido.status === "Pendente" ? "status_pendente" : ""}
          ">

            ${pedido.status || "Pendente"}

          </span>
        </p>


        <div class="d-flex gap-2 mt-3 flex-wrap">

          <button
            class="btn btn-success btn-sm"
            onclick="aprovarPedido('${pedidoId}')"
          >
            Aprovar
          </button>

          <button
            class="btn btn-warning btn-sm"
            onclick="pendentePedido('${pedidoId}')"
          >
            Pendente
          </button>

          <button
            class="btn btn-danger btn-sm"
            onclick="cancelarPedido('${pedidoId}')"
          >
            Cancelar
          </button>

          <button
            class="btn btn-dark btn-sm"
            onclick="excluirPedido('${pedidoId}')"
          >
            Excluir
          </button>

        </div>

      </div>

    `;

  });

});


// APROVAR
window.aprovarPedido = async (pedidoId) => {

  await updateDoc(doc(db, "pedidos", pedidoId), {

    status: "Aprovado"

  });

  location.reload();

};


// PENDENTE
window.pendentePedido = async (pedidoId) => {

  await updateDoc(doc(db, "pedidos", pedidoId), {

    status: "Pendente"

  });

  location.reload();

};


// CANCELAR
window.cancelarPedido = async (pedidoId) => {

  await updateDoc(doc(db, "pedidos", pedidoId), {

    status: "Cancelado"

  });

  location.reload();

};


// EXCLUIR
window.excluirPedido = async (pedidoId) => {

  const confirmar = await Swal.fire({

    icon: "warning",

    title: "Excluir pedido?",

    text: "Essa ação não poderá ser desfeita.",

    showCancelButton: true,

    confirmButtonColor: "#d33",

    cancelButtonColor: "#6c757d",

    confirmButtonText: "Excluir",

    cancelButtonText: "Voltar"

  });


  if (!confirmar.isConfirmed) return;


  await deleteDoc(doc(db, "pedidos", pedidoId));


  Swal.fire({

    icon: "success",

    title: "Pedido excluído!",

    timer: 1800,

    showConfirmButton: false

  });


  setTimeout(() => {

    location.reload();

  }, 1800);

};
