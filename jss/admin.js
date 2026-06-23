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
  setDoc,
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
  carregarLoja();

});


// ======================================================
// CONTROLE DA LOJA
// ======================================================

const lojaRef = doc(db, "config", "loja");

let lojaAberta = false;

function carregarLoja() {

  onSnapshot(lojaRef, (snap) => {

    const dados = snap.exists() ? snap.data() : { aberta: false, browniesDisponiveis: 0 };

    lojaAberta = dados.aberta ?? false;

    const btnToggle = document.getElementById("btnToggleLoja");
    const statusTexto = document.getElementById("lojaStatusTexto");
    const inputBrownies = document.getElementById("inputBrownies");

    if (lojaAberta) {
      btnToggle.textContent = "Fechar loja";
      btnToggle.className = "btn-loja aberta";
      statusTexto.textContent = `Loja aberta · ${dados.browniesDisponiveis ?? 0} brownie(s) disponível(is)`;
    } else {
      btnToggle.textContent = "Abrir loja";
      btnToggle.className = "btn-loja fechada";
      statusTexto.textContent = "Loja fechada · pedidos desativados";
    }

    inputBrownies.value = dados.browniesDisponiveis ?? 0;

  });

}

document.getElementById("btnToggleLoja").addEventListener("click", async () => {

  await setDoc(lojaRef, { aberta: !lojaAberta }, { merge: true });

});

document.getElementById("btnSalvarBrownies").addEventListener("click", async () => {

  const qtd = parseInt(document.getElementById("inputBrownies").value) || 0;

  await setDoc(lojaRef, { browniesDisponiveis: qtd }, { merge: true });

  Swal.fire({
    icon: "success",
    title: `${qtd} brownie(s) disponível(is)`,
    timer: 1500,
    showConfirmButton: false
  });

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
    preencherFiltroMesAno();

  });

}

function preencherFiltroMesAno() {

  const select = document.getElementById("filtroMesAno");
  const valorAtual = select.value;

  const mesesVistos = new Set();

  todosPedidos.forEach((pedido) => {
    if (!pedido.criadoEm) return;
    const d = pedido.criadoEm.toDate ? pedido.criadoEm.toDate() : new Date(pedido.criadoEm);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    mesesVistos.add(chave);
  });

  const mesesOrdenados = [...mesesVistos].sort((a, b) => b.localeCompare(a));

  const nomesMeses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                      "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  select.innerHTML = `<option value="">Mês específico</option>`;

  mesesOrdenados.forEach((chave) => {
    const [ano, mes] = chave.split("-");
    const label = `${nomesMeses[parseInt(mes) - 1]} de ${ano}`;
    const opt = document.createElement("option");
    opt.value = chave;
    opt.textContent = label;
    if (chave === valorAtual) opt.selected = true;
    select.appendChild(opt);
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
  const filtroMesAno = document.getElementById("filtroMesAno")?.value || "";

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  todosPedidos.forEach((pedido) => {

    totalPedidos++;

    // Converter data do pedido (dd/mm/aaaa) para objeto Date em horário local
    let dataPedido = null;
    if (pedido.data) {
      const partes = pedido.data.split("/");
      if (partes.length === 3) {
        dataPedido = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
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

    // Filtro por mês específico
    if (filtroMesAno && pedido.criadoEm) {
      const d = pedido.criadoEm.toDate ? pedido.criadoEm.toDate() : new Date(pedido.criadoEm);
      const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (chave !== filtroMesAno) return;
    }

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

  let criadoEmTexto = "";
  if (pedido.criadoEm) {
    const d = pedido.criadoEm.toDate ? pedido.criadoEm.toDate() : new Date(pedido.criadoEm);
    criadoEmTexto = d.toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  }

  return `

    <div class="card_admin">

      <!-- CABEÇALHO -->
      <div class="card_admin_header">

        <div class="card_titulo_grupo">
          <h3>${pedido.produto}</h3>
          ${criadoEmTexto ? `<span class="card_criado_em">${criadoEmTexto}</span>` : ""}
        </div>

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

document
  .getElementById("filtroMesAno")
  .addEventListener("change", renderizarPedidos);

// Botões de período
document.querySelectorAll(".btn_periodo").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".btn_periodo").forEach(b => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    renderizarPedidos();
  });
});

document
.getElementById(
"btnNotificar"
)
?.addEventListener(
"click",

async ()=>{

try{

const resposta =
await fetch(

"https://browniesenf.onrender.com/enviar-notificacao",

{

method:
"POST"

}

);

const dados =
await resposta.json();

if(
dados.sucesso
){

Swal.fire({

icon:
"success",

title:
"Notificação enviada!"

});

}

}

catch{

Swal.fire({

icon:
"error",

title:
"Erro ao enviar"

});

}

}
);