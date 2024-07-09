const { readFileSync } = require('fs');

class Repositorio {
  constructor() {
    this.pecas = JSON.parse(readFileSync('./pecas.json'));
  }

  getPeca(apre) {
    return this.pecas[apre.id];
  }
}

class ServicoCalculoFatura {

  constructor(repo) {
    this.repo = repo;
  }
  
  calcularCredito(apre){
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    if (this.repo.getPeca(apre).tipo === "comedia") 
        creditos += Math.floor(apre.audiencia / 5);
    return creditos;
  }
  
  calcularTotalCreditos(apresentacoes){
    let totalCreditos = 0;
    for (let apresentacao of apresentacoes.apresentacoes) {
      totalCreditos += this.calcularCredito(apresentacao);
    }
    return totalCreditos;
  }
  
  calcularTotalApresentacao(apre){
    let total = 0;
  
    switch (this.repo.getPeca(apre).tipo) {
    case "tragedia":
      total = 40000;
      if (apre.audiencia > 30) {
        total += 1000 * (apre.audiencia - 30);
      }
      break;
    case "comedia":
      total = 30000;
      if (apre.audiencia > 20) {
         total += 10000 + 500 * (apre.audiencia - 20);
      }
      total += 300 * apre.audiencia;
      break;
    default:
        throw new Error(`Peça desconhecia: ${this.repo.getPeca(apre).tipo}`);
    }
    return total;
  }
  
  calcularTotalFatura(apresentacoes){
    let totalFatura = 0;
    for (let apre of apresentacoes.apresentacoes) {
      totalFatura += this.calcularTotalApresentacao(apre);
    }
    return totalFatura;
  }

}

function formatarMoeda(valor){
  return new Intl.NumberFormat("pt-BR",
  { style: "currency", currency: "BRL",
    minimumFractionDigits: 2 }).format(valor/100);
}

function gerarFaturaStr (fatura, calc) {

  let faturaStr = `Fatura ${fatura.cliente}\n`;
  for (let apre of fatura.apresentacoes) {
      faturaStr += `  ${calc.repo.getPeca(apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)\n`;
  }
    
  faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(fatura))}\n`;
  faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(fatura)} \n`;
  return faturaStr;
}

// function gerarFaturaHTML(fatura, pecas){
//   let faturaHTML = '<html>\n'
//   faturaHTML += `<p> Fatura ${fatura.cliente} </p>\n`
//   faturaHTML +=  '<ul>\n'
  
//   for (let apre of fatura.apresentacoes) {
//     faturaHTML += `<li> ${getPeca(pecas, apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos) </li>\n`;
//   }
//   faturaHTML += '</ul>\n'
//   faturaHTML +=  `<p> Valor total: ${formatarMoeda(ccalc.alcularTotalFatura(pecas, fatura))} </p>\n`
//   faturaHTML +=  `<p> Créditos acumulados: ${calc.calcularTotalCreditos(pecas, fatura)} </p>\n`
//   faturaHTML += '</html>\n'

//   return faturaHTML;
// }

const faturas = JSON.parse(readFileSync('./faturas.json'));
const calc = new ServicoCalculoFatura(new Repositorio());
const faturaStr = gerarFaturaStr(faturas, calc)
console.log(faturaStr);
// const faturaHTML = gerarFaturaHTML(faturas, pecas);
// console.log(faturaHTML);
