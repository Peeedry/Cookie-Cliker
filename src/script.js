// Importa funções principais do Firebase (app)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
// Importa banco de dados (Firestore)
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
// Importa sistema de autenticação (login)
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
// Dados do seu projeto no Firebase
const firebaseConfig = {
    apiKey: "Sua Api",
    authDomain: "clickergame-eb818.firebaseapp.com",
    projectId: "clickergame-eb818",
    storageBucket: "clickergame-eb818.firebasestorage.app",
    messagingSenderId: "229749387778",
    appId: "1:229749387778:web:e2b6a853829f9ac841ad1b"
};
// Inicializa o Firebase no seu site
const app = initializeApp(firebaseConfig);
// Cria conexão com o banco de dados
const db = getFirestore(app);
// Inicializa sistema de login
const auth = getAuth(app);
// Define que o login será com Google
const provider = new GoogleAuthProvider();
// Guarda o ID do usuário logado
let userId = null;
// Pegando elementos da tela
const display = document.getElementById("contador-cookie");
const cpsDisplay = document.getElementById("cps");
const btnClique = document.getElementById("btn-clique-cookie");

const btnUpgradeClique = document.getElementById("upgradeClique");
const btnUpgradeAuto = document.getElementById("upgradeAuto");

const btnLogin = document.getElementById("login");
const statusLogin = document.getElementById("status-login");
// Pontos totais do jogador
let pontos = 0;
// Quanto ganha por clique
let valorClique = 1;
// Pontos por segundo (auto click)
let cps = 0;
// Custos dos upgrades
let custoClique = 50;
let custoAuto = 100;

function atualizarTela() {
    // Mostra pontos atuais
    display.innerText = pontos;
    // Mostra clicks automática
    cpsDisplay.innerText = cps + " clicks por segundo";
    // Atualiza preço dos upgrades na tela
    btnUpgradeClique.innerText = `+Clique (${custoClique})`;
    btnUpgradeAuto.innerText = `Auto Click (${custoAuto})`;
}

btnLogin.onclick = async () => {
    // Abre popup de login com Google
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    // Salva ID único do usuário
    userId = user.uid;
    // Mostra nome e email na tela
    statusLogin.innerHTML = ` 
    ${user.displayName} <br>
    ${user.email} 
    `;
    // Carrega progresso do usuário
    carregar();
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        // Usuário já está logado
        userId = user.uid;
        statusLogin.innerText = "Logado como: " + user.displayName;
         // Carrega dados salvos
        carregar();
    } else {
        // Usuário não logado
        statusLogin.innerText = "Não logado";
    }
});

async function salvar() {
    // Só salva se tiver usuário logado
    if (!userId) return;
     // Salva dados no Firestore
    await setDoc(doc(db, "usuarios", userId), {
        pontos,
        valorClique,
        cps,
        custoClique,
        custoAuto
    });
}

async function carregar() {
    // Só carrega se tiver usuário
    if (!userId) return;

    const docRef = doc(db, "usuarios", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        // Se já existe save
        pontos = data.pontos || 0;
        valorClique = data.valorClique || 1;
        cps = data.cps || 0;
        custoClique = data.custoClique || 50;
        custoAuto = data.custoAuto || 100;
    } else {
        // Se for novo jogador
        pontos = 0;
        valorClique = 1;
        cps = 0;
        custoClique = 50;
        custoAuto = 100;
    }

    atualizarTela();
}

btnClique.onclick = () => {
    // Ganha pontos ao clicar
    pontos += valorClique;
    atualizarTela();
    salvar();
};

// upgrade clique
btnUpgradeClique.onclick = () => {
    if (pontos >= custoClique) {
        pontos -= custoClique;
        // Aumenta a quantidade do clique
        valorClique = Math.floor(valorClique * 1.5);
        // Aumenta custo
        custoClique = Math.floor(custoClique * 1.7);

        atualizarTela();
        salvar();
    }
};

btnUpgradeAuto.onclick = () => {
    if (pontos >= custoAuto) {
        pontos -= custoAuto;
        // Aumenta ganho automático
        cps += 1;

        custoAuto = Math.floor(custoAuto * 1.8);

        atualizarTela();
        salvar();
    }
};


setInterval(() => {
    // Ganha pontos automaticamente
    pontos += cps;
    atualizarTela();
    salvar();
}, 1000);

// Atualiza tela ao abrir
atualizarTela()
