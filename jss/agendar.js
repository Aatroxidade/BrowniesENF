import { db, app } from "./firebase.js";

import {

  doc,
  getDoc,
  updateDoc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {

  getAuth,
  onAuthStateChanged,
  signOut

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ======================================================
// CONFIG
// ======================================================

const auth = getAuth(app);

const precoUnitario = 10;


// ======================================================
// URL
// ======================================================

const params = new URLSearchParams(window.location.search);

const pedidoId = params.get("id");


// ======================================================
// INPUTS
// ======================================================

const nomeInput =
  document.getElementById("nome");

const quantidadeInput =
  document.getElementById("quantidade");

const dataInput =
  document.getElementById("data");

const horarioInput =
  document.getElementById("horario");

const observacaoInput =
  document.getElementById("observacao");

const btnAgendamento =
  document.getElementById("btnAgendamento");

const precoTotal =
  document.getElementById("precoTotal");


// ======================================================
// LOGIN
// ======================================================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    Swal.fire({

      icon: "warning",

      title: "Login necessário",

      text: "Você precisa estar logado.",

      confirmButtonColor: "#d48a27"

    });

    window.location.href = "index.html";

    return;

  }

  document.body.style.display = "block";


  // ======================================================
  // NOME USUÁRIO
  // ======================================================

  const docRef =
    doc(db, "usuarios", user.uid);

  const docSnap =
    await getDoc(docRef);

  if (docSnap.exists()) {

    const dados = docSnap.data();

    const nomeUsuario =
      document.getElementById("nomeUsuario");

    if (nomeUsuario) {

      nomeUsuario.innerText =
        `Olá, ${dados.nome}`;

    }

  }


  // ======================================================
  // EDITAR PEDIDO
  // ======================================================

  if (pedidoId) {

    const pedidoRef =
      doc(db, "pedidos", pedidoId);

    const pedidoSnap =
      await getDoc(pedidoRef);

    if (pedidoSnap.exists()) {

      const pedido =
        pedidoSnap.data();

      nomeInput.value =
        pedido.nome;

      quantidadeInput.value =
        pedido.quantidade;

      dataInput.value =
        pedido.data;

      horarioInput.value =
        pedido.horario;

      observacaoInput.value =
        pedido.observacao || "";

      atualizarPreco();

    }

  }


  // ======================================================
  // BOTÃO AGENDAR
  // ======================================================

  btnAgendamento.addEventListener("click", async () => {

    const nome =
      nomeInput.value.trim();

    let quantidade =
      Number(quantidadeInput.value);

    const data =
      dataInput.value;

    const horario =
      horarioInput.value;

    const observacao =
      observacaoInput.value;


    // ======================================================
    // CAMPOS
    // ======================================================

    if (!nome || !quantidade || !data || !horario) {

      Swal.fire({

        icon: "warning",

        title: "Campos obrigatórios",

        text: "Preencha todos os campos.",

        confirmButtonColor: "#d48a27"

      });

      return;

    }


    // ======================================================
    // VALIDAR NOME
    // ======================================================

    const regexNome =
      /^[A-Za-zÀ-ÿ\s]+$/;

    if (!regexNome.test(nome)) {

      Swal.fire({

        icon: "warning",

        title: "Nome inválido",

        text: "Digite apenas letras.",

        confirmButtonColor: "#d48a27"

      });

      return;

    }


    // ======================================================
    // LIMITE
    // ======================================================

    if (quantidade > 12) {

      quantidadeInput.value = 12;

      Swal.fire({

        icon: "warning",

        title: "Limite excedido",

        text: "Máximo de 12 brownies.",

        confirmButtonColor: "#d48a27"

      });

      return;

    }


    // ======================================================
    // LOADING
    // ======================================================

    btnAgendamento.disabled = true;

    btnAgendamento.innerHTML = `

      <span class="spinner-border spinner-border-sm"></span>

      Processando...

    `;


    try {

      // ======================================================
      // EDITAR
      // ======================================================

      if (pedidoId) {

        await updateDoc(

          doc(db, "pedidos", pedidoId),

          {

            nome,
            quantidade,
            data,
            horario,
            observacao

          }

        );

      }


      // ======================================================
      // CRIAR PEDIDO + PIX
      // ======================================================

      else {

        const resposta = await fetch(

          "https://browniesenf.onrender.com/pedido",

          {

            method: "POST",

            headers: {

              "Content-Type": "application/json"

            },

            body: JSON.stringify({

              usuario: user.email,

              produto: "Brownie de Oreo",

              nome,

              quantidade,

              data,

              horario,

              observacao

            })

          }

        );

        console.log("STATUS:", resposta.status);

        if (!resposta.ok) {

          throw new Error(
            "Erro no backend"
          );

        }

        const dados =
          await resposta.json();

        console.log(dados);


        // ======================================================
        // QR CODE
        // ======================================================

        const qrCodePix =
          document.getElementById("qrCodePix");

        if (qrCodePix) {

          qrCodePix.src =
            `data:image/png;base64,${dados.qrCodeBase64}`;

        }


        // ======================================================
        // PIX COPIA E COLA
        // ======================================================

        const chavePix =
          document.getElementById("chavePix");

        if (chavePix) {

          chavePix.value =
            dados.qrCode;

        }


        // ======================================================
        // ABRIR MODAL
        // ======================================================

        const modalPix =
          document.getElementById("modalPix");

        if (modalPix) {

          modalPix.classList.remove("d-none");

        }

      }


      // ======================================================
      // RESET BOTÃO
      // ======================================================

      btnAgendamento.disabled = false;

      btnAgendamento.innerHTML =
        "Confirmar Agendamento";

    }

    catch (e) {

      console.error(
        "ERRO COMPLETO:",
        e
      );

      btnAgendamento.disabled = false;

      btnAgendamento.innerHTML =
        "Confirmar Agendamento";

      Swal.fire({

        icon: "error",

        title: "Erro",

        text: "Não foi possível gerar o PIX.",

        confirmButtonColor: "#d33"

      });

    }

  });


  // ======================================================
  // SAIR
  // ======================================================

  const btnSair =
    document.getElementById("btnSair");

  if (btnSair) {

    btnSair.addEventListener("click", async () => {

      await signOut(auth);

      window.location.href =
        "index.html";

    });

  }

});


// ======================================================
// FORMATAR HORÁRIO
// ======================================================

if (horarioInput) {

  horarioInput.addEventListener("input", () => {

    let valor =
      horarioInput.value.replace(/\D/g, "");

    if (valor.length >= 3) {

      valor =

        valor.slice(0, 2) +

        ":" +

        valor.slice(2, 4);

    }

    horarioInput.value = valor;

  });

}


// ======================================================
// FORMATAR DATA
// ======================================================

if (dataInput) {

  dataInput.addEventListener("input", () => {

    let valor =
      dataInput.value.replace(/\D/g, "");

    if (valor.length >= 2) {

      let dia =
        parseInt(valor.slice(0, 2));

      if (dia > 31) dia = 31;

      valor =

        dia.toString().padStart(2, "0") +

        valor.slice(2);

    }

    if (valor.length >= 4) {

      let mes =
        parseInt(valor.slice(2, 4));

      if (mes > 12) mes = 12;

      valor =

        valor.slice(0, 2) +

        mes.toString().padStart(2, "0") +

        valor.slice(4);

    }

    if (valor.length > 2) {

      valor =

        valor.slice(0, 2) +

        "/" +

        valor.slice(2);

    }

    if (valor.length > 5) {

      valor =

        valor.slice(0, 5) +

        "/" +

        valor.slice(5, 9);

    }

    dataInput.value = valor;

  });

}


// ======================================================
// QUANTIDADE
// ======================================================

if (quantidadeInput) {

  quantidadeInput.addEventListener("input", () => {

    quantidadeInput.value =

      quantidadeInput.value.replace(/\D/g, "");

    let quantidade =
      Number(quantidadeInput.value);

    if (quantidade > 12) {

      quantidadeInput.value = 12;

    }

    atualizarPreco();

  });

}


// ======================================================
// PREÇO
// ======================================================

function atualizarPreco() {

  if (!precoTotal) return;

  let quantidade =
    Number(quantidadeInput.value);

  if (

    quantidade < 1 ||

    isNaN(quantidade)

  ) {

    quantidade = 1;

  }

  const total =
    quantidade * precoUnitario;

  precoTotal.innerText =
    `R$ ${total},00`;

}

atualizarPreco();


// ======================================================
// COPIAR PIX
// ======================================================

const copiarPixBtn =
  document.getElementById("copiarPix");

if (copiarPixBtn) {

  copiarPixBtn.addEventListener("click", () => {

    const chave =
      document.getElementById("chavePix");

    navigator.clipboard.writeText(
      chave.value
    );

    const aviso =
      document.createElement("div");

    aviso.innerText =
      "PIX copiado";

    aviso.classList.add("aviso_pix");

    document.body.appendChild(aviso);

    setTimeout(() => {

      aviso.remove();

    }, 1500);

  });

}


// ======================================================
// PAGAMENTO
// ======================================================

const btnPago =
  document.getElementById("btnPago");

if (btnPago) {

  btnPago.addEventListener("click", () => {

    const modalPix =
      document.getElementById("modalPix");

    if (modalPix) {

      modalPix.classList.add("d-none");

    }

    Swal.fire({

      icon: "success",

      title: "Pagamento enviado!",

      text: "Seu pagamento será analisado.",

      confirmButtonColor: "#d48a27"

    });

    setTimeout(() => {

      window.location.href =
        "pedidos.html";

    }, 1800);

  });

}


// ======================================================
// FECHAR PIX
// ======================================================

const fecharPix =
  document.getElementById("fecharPix");

if (fecharPix) {

  fecharPix.addEventListener("click", () => {

    const modalPix =
      document.getElementById("modalPix");

    if (modalPix) {

      modalPix.classList.add("d-none");

    }

  });

}