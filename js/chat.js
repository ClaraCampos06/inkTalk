/* =========================================================
   CC inkTalk() - guia do ecossistema CC
   ========================================================= */


/* ---------- 1) LINKS DO ECOSSISTEMA ---------- */

const LINKS = {
    inkBase: "https://claracampos06.github.io/inkBase/",
    inkBudget: "https://inkbudget.onrender.com/"
}

// Endereço da lista de tatuadores (fonte única: inkBudget)
const API_TATUADORES = LINKS.inkBudget + "api/tatuadores"

function link(url, texto) {
    return `<a class="linkCC" href="${url}" target="_blank" rel="noopener">${texto}</a>`
}


/* ---------- 2) DADOS ---------- */

// Lista reserva: só é usada se o inkBudget estiver fora do ar
// ou ainda acordando (o Render gratuito demora para responder).
let tatuadores = [
    { nome: "Maria", estilo: "Realismo" },
    { nome: "Paulo", estilo: "Blackwork" },
    { nome: "Andre", estilo: "Oriental" }
]

// Busca a lista oficial no inkBudget e troca a reserva por ela.
async function carregarTatuadores() {

    let controle = new AbortController()
    let limite = setTimeout(function () { controle.abort() }, 5000)

    try {
        let resposta = await fetch(API_TATUADORES, { signal: controle.signal })

        if (!resposta.ok) return

        let dados = await resposta.json()

        // confere o formato antes de aceitar
        let valido = Array.isArray(dados) && dados.length > 0 &&
            dados.every(function (t) {
                return typeof t.nome === "string" && typeof t.estilo === "string"
            })

        if (valido) {
            tatuadores = dados
        }

    } catch (erro) {
        // sem internet, CORS ou timeout: segue com a lista reserva
    } finally {
        clearTimeout(limite)
    }
}

// já começa a buscar ao abrir a página (acorda o servidor do Render)
carregarTatuadores()

/*
  Cada tópico: palavras (sem acento, minúsculas) + resposta.
  A ORDEM IMPORTA: o primeiro tópico que combinar vence.
*/
let topicos = [
    {
        id: "orcamento",
        palavras: ["orcamento", "preco", "valor", "quanto", "agendar",
                   "agendamento", "marcar", "reservar", "sinal"],
        resposta: function () {
            return `
                <strong>Orçamento e agendamento</strong> são feitos no
                <strong>inkBudget()</strong>.<br><br>
                ◦ Calcule o valor da sua tattoo<br>
                ◦ Escolha um horário livre<br>
                ◦ Receba a confirmação pelo WhatsApp<br><br>
                ${link(LINKS.inkBudget, "Abrir o inkBudget →")}
            `
        }
    },
    {
        id: "funcionamento",
        palavras: ["funcionamento", "horario", "horas", "dias", "abre", "fecha", "aberto"],
        resposta: function () {
            return `
                <strong>◦Funcionamento</strong><br><br>
                Segunda a sexta, das <strong>07h às 22h</strong>.<br><br>
                Para reservar um horário, use o
                ${link(LINKS.inkBudget, "inkBudget →")}
            `
        }
    },
    {
        id: "tatuadores",
        palavras: ["tatuador", "tatuadores", "estilo", "realismo", "blackwork", "oriental"],
        resposta: function () {
            let html = "<strong>Nossos tatuadores:</strong><br><br>"

            // os dados vêm da rede, então passam pelo escapar()
            for (let t of tatuadores) {
                html += `<strong>◦${escapar(t.nome)}</strong><br>${escapar(t.estilo)}<br><br>`
            }

            html += `Escolha o seu e agende no ${link(LINKS.inkBudget, "inkBudget →")}`
            return html
        }
    },
    {
        id: "arte",
        palavras: ["arte", "colecao", "drop", "autoral", "portfolio", "desenho", "ilustracao"],
        resposta: function () {
            return `
                <strong>inkDrop()</strong><br><br>
                A coleção de arte autoral do CC: ilustrações e projetos
                que depois se ramificam em portfólio.<br><br>
                Conheça tudo pelo ${link(LINKS.inkBase, "inkBase →")}
            `
        }
    },
    {
        id: "cursos",
        palavras: ["curso", "aprender", "aula", "inspiracao", "lab", "artista"],
        resposta: function () {
            return `
                <strong>inkLab()</strong><br><br>
                Espaço de cursos e inspiração para artistas.<br>
                <strong>Em breve</strong>, acompanhe pelo
                ${link(LINKS.inkBase, "inkBase →")}
            `
        }
    },
    {
        id: "simulador",
        palavras: ["simulador", "simular", "inkskin", "testar tattoo", "ver na pele"],
        resposta: function () {
            return `
                <strong>inkSkin()</strong><br><br>
                Um simulador de tatuagem na pele com IA, para você ver a
                arte antes de fechar. <strong>Em desenvolvimento.</strong>
            `
        }
    },
    {
        id: "cc",
        palavras: ["conhecer", "cc", "projeto", "sobre", "site", "inkbase", "explorar", "quem"],
        resposta: function () {
            return `
                <strong>CC</strong> é um ecossistema de arte e expressão:<br><br>
                ◦ <strong>inkBase</strong> — a porta de entrada<br>
                ◦ <strong>inkDrop</strong> — arte autoral<br>
                ◦ <strong>inkTalk</strong> — você está aqui<br>
                ◦ <strong>inkBudget</strong> — orçamento e agendamento<br>
                ◦ <strong>inkLab</strong> — cursos<br>
                ◦ <strong>inkSkin</strong> — simulador (em breve)<br><br>
                ${link(LINKS.inkBase, "Explorar o inkBase →")}
            `
        }
    }
]

const RESPOSTA_PADRAO = `
    Não entendi, mas posso te ajudar com:<br><br>
    ◦ ORÇAMENTO E AGENDAMENTO<br>
    ◦ TATUADORES<br>
    ◦ FUNCIONAMENTO<br>
    ◦ ARTE, CURSOS ou CONHECER O CC
`


/* ---------- 3) ELEMENTOS ---------- */

let chat = document.querySelector("#chat")
let input = document.querySelector("#mensagem")


/* ---------- 4) FUNÇÕES AUXILIARES ---------- */

// Impede que texto vire HTML (segurança)
function escapar(texto) {
    let div = document.createElement("div")
    div.textContent = texto
    return div.innerHTML
}

// minúsculas, sem acento e sem espaços nas pontas
function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
}

function identificarTopico(mensagem) {
    return topicos.find(function (t) {
        return t.palavras.some(function (p) {
            return mensagem.includes(p)
        })
    })
}


/* ---------- 5) BOTÕES DE RESPOSTA RÁPIDA (chips) ---------- */

function mostrarChips(opcoes) {
    let div = document.createElement("div")
    div.className = "chips"

    opcoes.forEach(function (texto) {
        let b = document.createElement("button")
        b.textContent = texto

        b.addEventListener("click", function () {
            input.value = texto
            enviarMensagem()
        })

        div.appendChild(b)
    })

    chat.appendChild(div)
    chat.scrollTop = chat.scrollHeight
}

function mostrarMenuPrincipal() {
    mostrarChips([
        "Orçamento e agendamento",
        "Tatuadores",
        "Funcionamento",
        "Arte",
        "Cursos",
        "Conhecer o CC"
    ])
}


/* ---------- 6) TELA INICIAL ---------- */

function mostrarInicio() {
    chat.innerHTML = `
        <div class="inicioText">
            <h1>CC</h1>
            <p class="paragrafo">inkTalk()</p> <br>
            <p class="paragrafo">Espaço onde ideias encontram pessoas, projetos saem do papel e a expressão vira conversa.</p>
            <ul id="listaPrincipal">
                <li>Comunidade</li>
                <li>Conexão</li>
                <li>Troca</li>
            </ul>
            <p class="paragrafo">Tire suas dúvidas sobre o CC conversando com o inkTalk</p>
        </div>
    `
    mostrarMenuPrincipal()
}

mostrarInicio()

document.querySelector("#house").addEventListener("click", mostrarInicio)


/* ---------- 7) FUNÇÃO PRINCIPAL ---------- */

function enviarMensagem() {

    if (input.value.trim() === "") return

    // apaga os botões da pergunta anterior
    document.querySelector(".chips")?.remove()

    let textoDigitado = input.value.trim()
    let mensagem = normalizar(textoDigitado)

    let topico = identificarTopico(mensagem)
    let resposta = topico ? topico.resposta() : RESPOSTA_PADRAO

    // 1) bolha do usuário
    chat.innerHTML += `
        <div class="usuario">
            <strong>Você:</strong> ${escapar(textoDigitado)}
        </div>
    `
    input.value = ""

    // 2) "digitando..."
    let bolha = document.createElement("div")
    bolha.className = "assistente digitando"
    bolha.innerHTML = "<span></span><span></span><span></span>"
    chat.appendChild(bolha)
    chat.scrollTop = chat.scrollHeight

    // 3) depois de 0,7s mostra a resposta e o menu
    setTimeout(function () {
        bolha.classList.remove("digitando")
        bolha.innerHTML = `<strong>CC:</strong> ${resposta}`
        mostrarMenuPrincipal()
        chat.scrollTop = chat.scrollHeight
    }, 700)
}


/* ---------- 8) TECLA ENTER ---------- */

input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") enviarMensagem()
})


/* ---------- 9) ÍCONES DO MENU LATERAL ---------- */

function mensagemDoIcone(texto) {
    input.value = texto
    enviarMensagem()
}

document.querySelector("#calendario").addEventListener("click", function () {
    mensagemDoIcone("funcionamento")
})

document.querySelector("#tatuadores").addEventListener("click", function () {
    mensagemDoIcone("tatuadores")
})

document.querySelector("#agendamento").addEventListener("click", function () {
    mensagemDoIcone("orçamento e agendamento")
})