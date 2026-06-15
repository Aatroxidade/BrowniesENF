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

let todosPedidos = [];

function carregarPedidos() {

  const pedidosQuery = query(
    collection(db, "pedidos"),
    orderBy("criadoEm", "desc")
  );

  onSnapshot(pedidosQuery, (querySnapshot) => {

    todosPedidos = [];

    querySnapshot.forEach((docItem) => {

      todosPedidos.push({
        id: docItem.id,
        ...docItem.data()
      });

    });

    renderizarPedidos();

  });

}

function renderizarPedidos() {

  const lista = document.getElementById("listaAdmin");
  lista.innerHTML = "";

  let totalPedidos = 0;
  let totalAprovados = 0;
  let totalPendentes = 0;
  let faturamento = 0;
  let browniesVendidos = 0;

  const busca = document.getElementById("buscarPedido")?.value?.toLowerCase() || "";
  const filtro = document.getElementById("filtroStatus")?.value || "Todos";
  const periodo = document.querySelector(".btn_periodo.ativo")?.dataset?.periodo || "todos";

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  todosPedidos.forEach((pedido) => {

    totalPedidos++;

    // Converter data do pedido (dd/mm/aaaa) para objeto Date
    let dataPedido = null;
    if (pedido.data) {
      const partes = pedido.data.split("/");
      if (partes.length === 3) {
        dataPedido = new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
        dataPedido.setHours(0, 0, 0, 0);
      }
    }

    if (pedido.status === "Aprovado") {
      totalAprovados++;
      faturamento += (pedido.quantidade || 0) * 10;
      browniesVendidos += pedido.quantidade || 0;
    }

    if (!pedido.status || pedido.status === "Pendente") {
      totalPendentes++;
    }

    // Filtro por nome
    if (busca && !pedido.nome?.toLowerCase().includes(busca)) return;

    // Filtro por status
    if (filtro !== "Todos" && pedido.status !== filtro) return;

    // Filtro por período
    if (periodo !== "todos" && dataPedido) {

      if (periodo === "hoje") {
        if (dataPedido.getTime() !== hoje.getTime()) return;
      }

      if (periodo === "semana") {
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        if (dataPedido < inicioSemana) return;
      }

      if (periodo === "mes") {
        if (
          dataPedido.getMonth() !== hoje.getMonth() ||
          dataPedido.getFullYear() !== hoje.getFullYear()
        ) return;
      }

    }

    lista.innerHTML += criarCardPedido(pedido, pedido.id);

  });

  document.getElementById("totalPedidos").innerText = totalPedidos;
  document.getElementById("totalAprovados").innerText = totalAprovados;
  document.getElementById("totalPendentes").innerText = totalPendentes;
  document.getElementById("faturamentoTotal").innerText = `R$ ${faturamento}`;

  const browniesElement = document.getElementById("browniesVendidos");
  if (browniesElement) {
    browniesElement.innerText = browniesVendidos;
  }

}


    

  





// ======================================================
// CARD
// ======================================================

function criarCardPedido(pedido, pedidoId) {

  const statusClass =
    pedido.status === "Aprovado" ? "status_aprovado" :
    pedido.status === "Cancelado" ? "status_cancelado" :
    "status_pendente";

  const statusTexto = pedido.status || "Pendente";

  const valor = (pedido.quantidade || 0) * 10;

  return `

    <div class="card_admin">

      <!-- CABEÇALHO -->
      <div class="card_admin_header">

        <h3>${pedido.produto}</h3>

        <span class="${statusClass}">${statusTexto}</span>

      </div>

      <hr>

      <!-- INFOS PRINCIPAIS -->
      <div class="card_admin_grid">

        <div class="card_info">
          <span class="card_label">👤 Cliente</span>
          <span class="card_valor">${pedido.nome}</span>
        </div>

        <div class="card_info">
          <span class="card_label">💰 Valor</span>
          <span class="card_valor card_destaque">R$ ${valor},00</span>
        </div>

        <div class="card_info">
          <span class="card_label">🍫 Quantidade</span>
          <span class="card_valor">${pedido.quantidade} un.</span>
        </div>

        <div class="card_info">
          <span class="card_label">📅 Data</span>
          <span class="card_valor">${pedido.data} às ${pedido.horario}</span>
        </div>

      </div>

      <!-- DETALHES (recolhido por padrão) -->
      <div class="card_detalhes" id="detalhes_${pedidoId}" style="display:none">

        <hr>

        <div class="card_info">
          <span class="card_label">📧 Email</span>
          <span class="card_valor">${pedido.usuario}</span>
        </div>

        <div class="card_info" style="margin-top:8px">
          <span class="card_label">📍 Endereço</span>
          <span class="card_valor">${pedido.endereco || "Não informado"}</span>
        </div>

        <div class="card_info" style="margin-top:8px">
          <span class="card_label">💳 Pagamento</span>
          <span class="card_valor">${pedido.formaPagamento || "Não informado"}</span>
        </div>

        <div class="card_info" style="margin-top:8px">
          <span class="card_label">📝 Observações</span>
          <span class="card_valor">${pedido.observacao || "Nenhuma"}</span>
        </div>

      </div>

      <!-- BOTÃO VER MAIS -->
      <button
        class="btn_ver_mais"
        onclick="toggleDetalhes('${pedidoId}')"
        id="btnver_${pedidoId}"
      >
        Ver detalhes ▾
      </button>

      <hr>

      <!-- AÇÕES -->
      <div class="card_admin_acoes">

        <button
          class="btn_acao btn_aprovar"
          onclick="alterarStatus('${pedidoId}', 'Aprovado')"
        >
          ✓ Aprovar
        </button>

        <button
          class="btn_acao btn_pendente"
          onclick="alterarStatus('${pedidoId}', 'Pendente')"
        >
          ⏳ Pendente
        </button>

        <button
          class="btn_acao btn_cancelar"
          onclick="alterarStatus('${pedidoId}', 'Cancelado')"
        >
          ✕ Cancelar
        </button>

        <button
          class="btn_acao btn_excluir"
          onclick="excluirPedido('${pedidoId}')"
        >
          🗑
        </button>

      </div>

    </div>

  `;

}


// ======================================================
// VER MAIS / RECOLHER
// ======================================================

window.toggleDetalhes = (pedidoId) => {

  const detalhes = document.getElementById(`detalhes_${pedidoId}`);
  const btn = document.getElementById(`btnver_${pedidoId}`);

  if (detalhes.style.display === "none") {
    detalhes.style.display = "block";
    btn.textContent = "Recolher ▴";
  } else {
    detalhes.style.display = "none";
    btn.textContent = "Ver detalhes ▾";
  }

};


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
  .addEventListener("input", renderizarPedidos);

document
  .getElementById("filtroStatus")
  .addEventListener("change", renderizarPedidos);

// Botões de período
document.querySelectorAll(".btn_periodo").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".btn_periodo").forEach(b => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    renderizarPedidos();
  });
});