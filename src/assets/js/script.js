let previsaoAtual = null
//ELEMENTOS DO HTML
const mensagemErro = document.getElementById("erro")
const carregando = document.getElementById("carregando")
const campo = document.getElementById("cidade")
const botao = document.getElementById("btn-buscar")
const listaDias = document.getElementById("proximos-dias")
const containerbuscas = document.getElementById("container-buscas")

function mostrarClima(dadosclima, nomeEncontrado) {
    const cidadeEscolhida = document.getElementById("cidade-escolhida")
    cidadeEscolhida.textContent = nomeEncontrado

    const temperatura = document.getElementById("temperatura")
    temperatura.textContent = `${Math.round(dadosclima.current.temperature_2m)}°C`

    const sensacao = document.getElementById("valor-sensacao")
    sensacao.textContent = `${Math.round(dadosclima.current.apparent_temperature)}°C`

    const umidade = document.getElementById("valor-umidade")
    umidade.textContent = `${dadosclima.current.relative_humidity_2m}%`

    const velocidade = document.getElementById("velocidade-valor")
    velocidade.textContent = `${Math.round(dadosclima.current.wind_speed_10m)}km/h`

    const clima = interpretarCodigo(dadosclima.current.weather_code)

    const icone = document.getElementById("icone-clima")
    icone.src = clima.icone

    const descricao = document.getElementById("descricao")
    descricao.textContent = clima.descricao

    mostrarPrevisao(dadosclima.daily)
}
async function buscarClima(latitude, longitude, nomeEncontrado) {
    try {
        const respostasclima = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`)
        const dadosclima = await respostasclima.json()
        mostrarClima(dadosclima, nomeEncontrado)
    } catch (erro) {
        console.log("Deu erro", erro)
    }

}

async function buscarCidade(nome) {
    try {
        const respostas = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${nome}&count=1&language=pt`)
        const dados = await respostas.json()

        mensagemErro.classList.add("oculto")
        carregando.classList.remove("oculto")

        if (!dados.results) {
            mensagemErro.classList.remove("oculto")
            return
        }

        const latitude = dados.results[0].latitude
        const longitude = dados.results[0].longitude
        const nomeEncontrado = dados.results[0].name

        salvarBuscas(nomeEncontrado)
        mostrarBuscas()
        await buscarClima(latitude, longitude, nomeEncontrado)

    } catch (erro) {
        console.log("Deu erro", erro)
    } finally {
        carregando.classList.add("oculto")
    }

}

function pesquisar() {
    const nome = campo.value.trim()

    if (nome === "") {
        return
    }
    buscarCidade(nome)
    campo.value = ""
    campo.focus()
}

botao.addEventListener("click", pesquisar)

campo.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
        pesquisar()
    }
})

function interpretarCodigo(codigo) {
    if (codigo === 0 || codigo === 1) {
        return { icone: "src/assets/img/icons8-sol-24.png", descricao: "Céu limpo" }
    }
    if (codigo === 2 || codigo === 3 || codigo === 45 || codigo === 48) {
        return { icone: "src/assets/img/icons8-nuvem-50.png", descricao: "Nublado" }
    }
    if ((codigo >= 51 && codigo <= 67) || (codigo >= 80 && codigo <= 82) || (codigo >= 95 && codigo <= 99)) {
        return { icone: "src/assets/img/icons8-chuva-50.png", descricao: "Chuva" }
    }

    return { icone: "src/assets/img/icons8-nuvem-50.png", descricao: "Nublado" }
}

function mostrarPrevisao(daily) {
    const lista = document.getElementById("proximos-dias")
    lista.innerHTML = ""
    document.getElementById("detalhe-dia").classList.add("oculto")
    previsaoAtual = daily

    for (let i = 1; i <= 5; i++) {
        const data = daily.time[i]
        const clima = interpretarCodigo(daily.weather_code[i])
        const max = Math.round(daily.temperature_2m_max[i])

        const diaSemana = new Date(data + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short" })

        lista.innerHTML += `<p data-indice="${i}">${diaSemana} <img src="${clima.icone}" alt="${clima.descricao}"> ${max}°</p>`

    }
}

listaDias.addEventListener("click", function (evento) {
    const card = evento.target.closest("p")
    if (!card) {
        return
    }

    const i = card.dataset.indice
    mostrarDetalhe(i)
})

function mostrarDetalhe(i) {
    const detalhes = document.getElementById("detalhe-dia")

    const data = previsaoAtual.time[i]
    const clima = interpretarCodigo(previsaoAtual.weather_code[i])
    const max = Math.round(previsaoAtual.temperature_2m_max[i])
    const min = Math.round(previsaoAtual.temperature_2m_min[i])

    const proximos = new Date(data + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })

    detalhes.innerHTML = `<p>${proximos}</p> <p>${clima.descricao}</p> <p>Máx ${max}° / Mín ${min}°</p>`

    detalhes.classList.remove("oculto")

}

function salvarBuscas(nome) {
    const lista = JSON.parse(localStorage.getItem("buscas")) || []

    const semRepetidos = lista.filter(function (cidade) {
        return cidade !== nome
    })

    semRepetidos.unshift(nome)

    const ultimas = semRepetidos.slice(0, 5)

    localStorage.setItem("buscas", JSON.stringify(ultimas))
}

function mostrarBuscas() {
    const lista = JSON.parse(localStorage.getItem("buscas")) || []
    containerbuscas.innerHTML = ""

    lista.forEach(function (cidade) {
        containerbuscas.innerHTML += `<p class="busca-recente">${cidade}</p>`
    })
}


containerbuscas.addEventListener("click", function (evento) {
    const info = evento.target.closest(".busca-recente")
    if (!info) {
        return
    }

    buscarCidade(info.textContent)
})


mostrarBuscas()



