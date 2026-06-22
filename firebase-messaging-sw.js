importScripts(
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
);

importScripts(
"https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js"
);

firebase.initializeApp({

apiKey:
"AIzaSyAUnUndHUcUsEeKT4ScS7vcroyFHJSBzFI",

authDomain:
"cookies-site.firebaseapp.com",

projectId:
"cookies-site",

storageBucket:
"cookies-site.firebasestorage.app",

messagingSenderId:
"736821689099",

appId:
"1:736821689099:web:2ea4cbe4287139b4f9400e"

});

const messaging =
firebase.messaging();

messaging.onBackgroundMessage(

(payload)=>{

self.registration.showNotification(

payload.notification.title,

{

body:
payload.notification.body,

icon:
"/imgs/logo.png",

badge:
"/imgs/logo.png"

}

);

}

);