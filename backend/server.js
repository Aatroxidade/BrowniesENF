console.log("Iniciando servidor...");


const db = require("./firebase");

const express = require("express");
const cors = require("cors");
const mercadopago = require("mercadopago");

const { MercadoPagoConfig, Payment } = require("mercadopago");

const app = express();

const TOKEN = process.env.TELEGRAM_TOKEN;

async function enviarTelegram(mensagem) {

  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: "8870188343",
        text: mensagem
      })
    }
  );

}
app.use(cors());
app.use(express.json());


// ======================================================
// MERCADO PAGO
// ======================================================

const client = new MercadoPagoConfig({

  accessToken:
    "APP_USR-6553547033685054-052616-7811426dbf183495f7bbf3dbfde57f27-1758992087"

});

const payment = new Payment(client);


// ======================================================
// TESTE
// ======================================================

app.get("/", (req, res) => {

  res.send("Backend funcionando!");

});


// ======================================================
// CRIAR PEDIDO
// ======================================================

app.post("/pedido", async (req, res) => {

  console.log("REQ BODY:", req.body);
  console.log("WEBHOOK RECEBIDO");
  console.log(req.query);

  try {

    const dados = req.body;

    const total =
      dados.quantidade * 10;


    // =========================
    // CRIAR PIX
    // =========================

    const pagamento = await payment.create({

      body: {

        transaction_amount: total,

        description: dados.produto,

        payment_method_id: "pix",

           notification_url:
      "https://browniesenf.onrender.com/webhook",

        payer: {

          email: dados.usuario

        }

      }

    });


    // =========================
    // SALVAR FIREBASE
    // =========================

    const pedidoRef =
      await db.collection("pedidos").add({

        ...dados,

        status: "Pendente",

        pagamento: "Pendente",

        pagamentoId: pagamento.id,

        criadoEm: new Date()

      });

      await enviarTelegram(

`🍪 NOVO PEDIDO

👤 Cliente: ${dados.nome}

📦 Produto: ${dados.produto}

🔢 Quantidade: ${dados.quantidade}

📅 Data: ${dados.data}

⏰ Horário: ${dados.horario}

📍 Endereço: ${dados.endereco || "Não informado"}

📝 Observação: ${dados.observacao || "Nenhuma"}`

);



    // =========================
    // RESPOSTA
    // =========================

    res.json({

      sucesso: true,

      pedidoId: pedidoRef.id,

      qrCode:

        pagamento.point_of_interaction
        .transaction_data.qr_code,

      qrCodeBase64:

        pagamento.point_of_interaction
        .transaction_data.qr_code_base64

    });

  }

  catch (erro) {

    console.error("ERRO:", erro);

    res.status(500).json({

      sucesso: false,

      erro: erro.message

    });

  }

});

app.post("/webhook", async (req, res) => {

  try {

    const paymentId =
      req.query["data.id"];

    if (!paymentId) {

      return res.sendStatus(200);

    }

    // BUSCAR PAGAMENTO
    const resposta = await fetch(

      `https://api.mercadopago.com/v1/payments/${paymentId}`,

      {

        headers: {

          Authorization:
            "Bearer APP_USR-6553547033685054-052616-7811426dbf183495f7bbf3dbfde57f27-1758992087"

        }

      }

    );

    const pagamento =
      await resposta.json();

    console.log("STATUS PIX:", pagamento.status);

    // PAGAMENTO APROVADO
    if (pagamento.status === "approved") {

      const snapshot = await db

        .collection("pedidos")

        .where("pagamentoId", "==", pagamento.id)

        .get();

      snapshot.forEach(async (docItem) => {

        await docItem.ref.update({

          status: "Aprovado",

          pagamento: "Pagamento via PIX"

        });

      });

      console.log("Pedido aprovado!");

    }

    await enviarTelegram(

`✅ PIX APROVADO

Pedido: ${docItem.id}

Valor: R$ ${pagamento.transaction_amount}`

);

    res.sendStatus(200);

  }

  catch (erro) {

    console.error("ERRO WEBHOOK:", erro);

    res.sendStatus(500);

  }

});

app.get("/teste-telegram", async (req, res) => {

  await enviarTelegram(

    "🍪 Teste de notificação Brownies ENF"

  );

  res.send("Mensagem enviada!");

});



// ======================================================
// SERVIDOR
// ======================================================

app.listen(3000, () => {

  console.log("Servidor rodando na porta 3000");

});

console.log("Fim do arquivo");