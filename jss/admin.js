import { app, db } from "./firebase.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy


} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const auth = getAuth(app);


// ======================================================
// LOGIN
// ======================================================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href = "index.html";
    return;

  }

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

  document.body.style.display = "block";

  carregarPedidos();

});


// ======================================================
// CARREGAR PEDIDOS
// ======================================================

function carregarPedidos() {

  const lista =
    document.getElementById("listaAdmin");

const pedidosQuery = query(

  collection(db, "pedidos"),

  orderBy("criadoEm", "desc")

);

onSnapshot(

  pedidosQuery,

    (querySnapshot) => {

      lista.innerHTML = "";

      if (querySnapshot.empty) {

        lista.innerHTML = `

          <p class="text-white text-center">
            Nenhum pedido encontrado.
          </p>

        `;

        return;

      }

      let totalPedidos = 0;
      let totalAprovados = 0;
      let totalPendentes = 0;
      let faturamento = 0;

      const busca =

        document
          .getElementById("buscarPedido")
          ?.value
          ?.toLowerCase() || "";

      const filtro =

        document
          .getElementById("filtroStatus")
          ?.value || "Todos";

      querySnapshot.forEach((pedidoDoc) => {

        const pedido =
          pedidoDoc.data();

        totalPedidos++;

        if (pedido.status === "Aprovado") {

          totalAprovados++;

          faturamento +=
            (pedido.quantidade || 0) * 10;

        }

        if (

          !pedido.status ||

          pedido.status === "Pendente"

        ) {

          totalPendentes++;

        }

        if (

          busca &&

          !pedido.nome
            .toLowerCase()
            .includes(busca)

        ) {

          return;

        }

        if (

          filtro !== "Todos" &&

          pedido.status !== filtro

        ) {

          return;

        }

        lista.innerHTML += criarCardPedido(

          pedido,

          pedidoDoc.id

        );

      });

      document.getElementById("totalPedidos").innerText =
        totalPedidos;

      document.getElementById("totalAprovados").innerText =
        totalAprovados;

      document.getElementById("totalPendentes").innerText =
        totalPendentes;

      document.getElementById("faturamentoTotal").innerText =
        `R$ ${faturamento}`;

    }

  );

}


// ======================================================
// CARD
// ======================================================

function criarCardPedido(pedido, pedidoId) {

  return `

    <div class="card_admin">

      <h3>
         ${pedido.produto}
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
  <strong>Valor:</strong>
  R$ ${(pedido.quantidade || 0) * 10}
</p>

<p>
  <strong>Forma de pagamento:</strong>
  ${pedido.formaPagamento || "Não informado"}
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
        <strong>Endereço:</strong>
        ${pedido.endereco || "Não informado"}
      </p>

      <p>
        <strong>Observações:</strong>
        ${pedido.observacao || "Nenhuma"}
      </p>

      <p>

 

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

      <p>

  <strong>Pagamento:</strong>

  <span class="
    ${pedido.pagamento === "Pagamento via PIX" ? "status_aprovado" : ""}
  ">

    ${pedido.pagamento || "Pendente"}

  </span>

</p>

      <div class="d-flex gap-2 mt-3 flex-wrap">

        <button
          class="btn btn-success btn-sm"
          onclick="alterarStatus('${pedidoId}', 'Aprovado')"
        >
          Aprovar
        </button>

        <button
          class="btn btn-warning btn-sm"
          onclick="alterarStatus('${pedidoId}', 'Pendente')"
        >
          Pendente
        </button>

        <button
          class="btn btn-danger btn-sm"
          onclick="alterarStatus('${pedidoId}', 'Cancelado')"
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

}


// ======================================================
// ALTERAR STATUS
// ======================================================

window.alterarStatus = async (
  pedidoId,
  status
) => {

  await updateDoc(

    doc(db, "pedidos", pedidoId),

    { status }

  );

};


// ======================================================
// EXCLUIR
// ======================================================

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

  await deleteDoc(
    doc(db, "pedidos", pedidoId)
  );

  Swal.fire({

    icon: "success",

    title: "Pedido excluído!",

    timer: 1500,

    showConfirmButton: false

  });

};


// ======================================================
// SAIR
// ======================================================

document.addEventListener("click", async (e) => {

  if (e.target.id === "btnSair") {

    e.preventDefault();

    await signOut(auth);

    window.location.href = "index.html";

  }

});

document
  .getElementById("buscarPedido")
  .addEventListener("input", carregarPedidos);

document
  .getElementById("filtroStatus")
  .addEventListener("change", carregarPedidos);

  <p>
  <strong>Valor:</strong>
  R$ ${(pedido.quantidade || 0) * 10}
</p>
