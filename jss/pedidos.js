import { db, app } from "./firebase.js";

import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth(app);


// ======================================================
// LOGIN
// ======================================================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href = "index.html";
    return;

  }

  document.body.style.display = "block";

  await carregarUsuario(user);

  carregarPedidos(user);

  // ======================================================
  // SAIR
  // ======================================================

  const btnSair =
    document.getElementById("btnSair");

  if (btnSair) {

    btnSair.addEventListener("click", async (e) => {

      e.preventDefault();

      await signOut(auth);

      window.location.href = "index.html";

    });

  }

});


// ======================================================
// USUÁRIO
// ======================================================

async function carregarUsuario(user) {

  const docRef =
    doc(db, "usuarios", user.uid);

  const docSnap =
    await getDoc(docRef);

  if (!docSnap.exists()) return;

  const dados =
    docSnap.data();

  document.getElementById("nomeUsuario").innerText =
    `Olá, ${dados.nome}`;

}


// ======================================================
// PEDIDOS
// ======================================================

function carregarPedidos(user) {

  const lista =
    document.getElementById("listaPedidos");

  const q = query(

    collection(db, "pedidos"),

    where("usuario", "==", user.email)

  );

  onSnapshot(q, (snapshot) => {

    lista.innerHTML = "";

    // SEM PEDIDOS
    if (snapshot.empty) {

      lista.innerHTML = `

        <p class="text-white text-center">
          Você ainda não fez pedidos.
        </p>

      `;

      return;

    }

    // LISTAR
    snapshot.forEach((pedidoDoc) => {

      const pedido =
        pedidoDoc.data();

      lista.innerHTML += criarCardPedido(

        pedido,

        pedidoDoc.id

      );

    });

  });

}


// ======================================================
// CARD
// ======================================================

function criarCardPedido(pedido, pedidoId) {

  return `

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
        ${pedido.data}
      </p>

      <p>
        <strong>Horário:</strong>
        ${pedido.horario}
      </p>

      <p>

        <strong>Status:</strong>

        <span class="
          ${pedido.status === "Aprovado" ? "status_aprovado" : ""}
          ${pedido.status === "Cancelado" ? "status_cancelado" : ""}
          ${pedido.status === "Pendente" ? "status_pendente" : ""}
        ">

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

}


// ======================================================
// CANCELAR
// ======================================================

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

  if (!resultado.isConfirmed) return;

  try {

    await deleteDoc(
      doc(db, "pedidos", pedidoId)
    );

    Swal.fire({

      icon: "success",

      title: "Pedido cancelado!",

      confirmButtonColor: "#d48a27"

    });

  }

  catch (e) {

    console.error(e);

    Swal.fire({

      icon: "error",

      title: "Erro",

      text: "Não foi possível cancelar.",

      confirmButtonColor: "#d33"

    });

  }

};


// ======================================================
// EDITAR
// ======================================================

window.editarPedido = (pedidoId) => {

  window.location.href =
    `agendar.html?id=${pedidoId}`;

};