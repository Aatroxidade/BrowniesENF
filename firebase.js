import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {

  apiKey: "AIzaSyAUnUndHUcUsEeKT4ScS7vcroyFHJSBzFI",

  authDomain: "cookies-site.firebaseapp.com",

  projectId: "cookies-site",

  storageBucket: "cookies-site.firebasestorage.app",

  messagingSenderId: "736821689099",

  appId: "1:736821689099:web:2ea4cbe4287139b4f9400e",

  measurementId: "G-7EC2BG8QRR"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { app, db };