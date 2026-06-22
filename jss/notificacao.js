import {
app,
db,
messaging
}
from "./firebase.js";

import {
getToken
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

import {
doc,
setDoc
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const botao =
document.getElementById(
"ativarNotificacao"
);

function atualizarBotao() {

if (
localStorage.getItem(
"notificacoesAtivas"
) === "true"
) {

botao.innerText =
"✅ Notificações ativadas";

botao.disabled =
true;

}

}

atualizarBotao();


async function ativarNotificacao() {

try {

// usuário já bloqueou anteriormente
if (
Notification.permission ===
"denied"
) {

alert(
"Você bloqueou as notificações. Clique no cadeado ao lado do site → Notificações → Permitir."
);

return;

}

// pedir permissão
const permissao =
await Notification.requestPermission();

if (
permissao !== "granted"
) {

console.log(
"Permissão negada"
);

return;

}

// gerar token
const token =
await getToken(
messaging,
{
vapidKey:
"BPXMZabBY88GvdNP-GmBB74bkuc90Qg_7Gzs0UwZ-n2IXseWImNq6F5QTBICyd8utmr96Ww_OQM92deO_Qr14NI"
}
);

console.log(
"TOKEN:",
token
);

// salvar firestore
await setDoc(
doc(db,"notificacoes",token),
{
token,
ativo:true,
criadoEm:new Date(),
navegador:navigator.userAgent
});

console.log(
"TOKEN SALVO"


);
localStorage.setItem(
"notificacoesAtivas",
"true"
);

botao.innerText =
"✅ Notificações ativadas";

botao.disabled =
true;

alert(
"Notificações ativadas com sucesso!"
);

}

catch(err){

console.log(
"ERRO:",
err
);

}

}

document
.getElementById(
"ativarNotificacao"
)
?.addEventListener(
"click",
ativarNotificacao
);