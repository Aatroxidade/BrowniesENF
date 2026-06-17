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
"SUA_VAPID_KEY"
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