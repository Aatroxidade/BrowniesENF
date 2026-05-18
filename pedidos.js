import { db, app } from "./firebase.js";

import {

  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {

  getAuth,
  onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const auth = getAuth(app);


// VERIFICA LOGIN
onAuthStateChanged(auth, async (user) => {

  // NÃO LOGADO
  if (!user) {

    window.location.href = "login.html";

    return;
  }

  const lista = document.getElementById("listaPedidos");


  // BUSCAR PEDIDOS DO USUÁRIO
  const q = query(

    collection(db, "pedidos"),

    where("usuario", "==", user.email)

  );

  const querySnapshot = await getDocs(q);


  // SEM PEDIDOS
  if (querySnapshot.empty) {

    lista.innerHTML = `

      <p class="text-white text-center">

        Você ainda não fez pedidos.

      </p>

    `;

    return;
  }


  // MOSTRAR PEDIDOS
  querySnapshot.forEach((pedidoDoc) => {

    const pedido = pedidoDoc.data();

    const pedidoId = pedidoDoc.id;


    lista.innerHTML += `

      <div class="card_pedido">

        <h3>${pedido.produto}</h3>

        <p>
          <strong>Nome:</strong>
          ${pedido.nome}
        </p>

        <p>
          <strong>Quantidade:</strong>
          ${pedido.quantidade}
        </p>

        <p>
  <strong>Data:</strong>

  ${pedido.data.split("-").reverse().join("/")}
</p>

        <p>
          <strong>Horário:</strong>
          ${pedido.horario}
        </p>

        <p>
          <strong>Status:</strong>

          <span class="status_pendente">
            ${pedido.status}
          </span>
        </p>

        <div class="mt-3 d-flex gap-2">

          <button
            class="btn btn-danger btn-sm"
            onclick="cancelarPedido('${pedidoId}')"
          >
            Cancelar
          </button>

          <button
            class="btn btn-warning btn-sm"
            onclick="editarPedido('${pedidoId}')"
          >
            Editar
          </button>

        </div>

      </div>

    `;

  });

});


// CANCELAR PEDIDO
window.cancelarPedido = async (pedidoId) => {

  const resultado = await Swal.fire({

    title: "Cancelar pedido?",

    text: "Essa ação não poderá ser desfeita.",

    icon: "warning",

    showCancelButton: true,

    confirmButtonColor: "#d33",

    cancelButtonColor: "#6c757d",

    confirmButtonText: "Sim, cancelar",

    cancelButtonText: "Voltar"

  });


  // CLICOU EM VOLTAR
  if (!resultado.isConfirmed) return;


  try {

    await deleteDoc(doc(db, "pedidos", pedidoId));


    await Swal.fire({

      icon: "success",

      title: "Pedido cancelado!",

      text: "Seu pedido foi removido com sucesso.",

      confirmButtonColor: "#d48a27"

    });


    location.reload();

  } catch (e) {

    Swal.fire({

      icon: "error",

      title: "Erro",

      text: "Não foi possível cancelar o pedido.",

      confirmButtonColor: "#d33"

    });

    console.error(e);

  }

};

// EDITAR PEDIDO
window.editarPedido = (pedidoId) => {

  alert("Sistema de edição em desenvolvimento.");

};

  // VERIFICA ADMIN
  if (user.email !== "eliasgabaldioliveira@gmail.com") {
    document.getElementById("btnAdmin").style.display = "none";
 
  }