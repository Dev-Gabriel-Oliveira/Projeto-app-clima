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
}
 async function buscarClima(latitude,longitude, nomeEncontrado){
    try{
        const respostasclima = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`)
        const dadosclima = await respostasclima.json()
        mostrarClima(dadosclima, nomeEncontrado)
    } catch(erro){
        console.log("Deu erro", erro)
    }
 
 }
    
async function buscarCidade(nome){
     try{
        const respostas = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${nome}&count=1&language=pt`)
        const dados = await respostas.json()
        
        
        erro.classList.add("oculto")
        carregando.classList.remove("oculto")

        if(!dados.results){
            erro.classList.remove("oculto")
            return
        }else{
            carregando.classList.remove("oculto")
        }
        
        const latitude = dados.results[0].latitude
        const longitude = dados.results[0].longitude
        const nomeEncontrado = dados.results[0].name
    
        await  buscarClima(latitude,longitude, nomeEncontrado)
     
    
    } catch(erro){
      console.log("Deu erro", erro)
    } finally{
        carregando.classList.add("oculto")
    }
}


const erro = document.getElementById("erro")
const carregando = document.getElementById("carregando")

const campo = document.getElementById("cidade")
const botao = document.getElementById("btn-buscar")

function pesquisar(){
    const nome = campo.value.trim()
    
    if(nome === ""){
        return
    }
    buscarCidade(nome)
    campo.value =""
    campo.focus()
}

botao.addEventListener("click", pesquisar)

campo.addEventListener("keydown", function(evento) {
  if(evento.key === "Enter"){
    pesquisar()
  }
})

function interpretarCodigo(codigo){
    if(codigo === 0  || codigo === 1){
        return{icone:"src/assets/img/icons8-sol-24.png", descricao:"Céu limpo"}
    }
    if(codigo === 2 || codigo === 3 || codigo === 45 || codigo === 48 ){
        return{icone: "src/assets/img/icons8-nuvem-50.png", descricao:"Nublado"}
    }
    if((codigo >= 51 && codigo <=67 ) || (codigo >= 80 && codigo <= 82) || (codigo >= 95 && codigo <= 99)){
        return{icone:"src/assets/img/icons8-chuva-50.png", descrica:"Chuva" }
    }
    
    return {icone: "src/assets/img/icons8-nuvem-50.png", descrica:"Nublado"}
}









    



