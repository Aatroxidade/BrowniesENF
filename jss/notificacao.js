import { app } from "./firebase.js";

import {
getMessaging,
getToken
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";

const messaging =
getMessaging(app);

async function ativarNotificacao() {

try {

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

// depois salvaremos no firestore

}
catch(err){

console.log(err);

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