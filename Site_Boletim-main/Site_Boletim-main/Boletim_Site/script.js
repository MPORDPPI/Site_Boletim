const toggleButton = document.getElementById("menu-toggle");
const navbar = document.getElementById("navbar");
const menuIcon = document.getElementById("menu-icon");
const closeIcon = document.getElementById("close-icon");

toggleButton.addEventListener("click", () => {
  navbar.classList.toggle("active");

  const isOpen = navbar.classList.contains("active");
  menuIcon.style.display = isOpen ? "none" : "inline";
  closeIcon.style.display = isOpen ? "inline" : "none";
});

// Gráfico IPCA
// script.js

// Configurações
const CORES = {
  azul_escuro: '#022873',
  azul_claro: '#173FE5'
};

const URLS = {
  ipca: 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=json',
  igpm: 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.189/dados?formato=json'
};

// Função para calcular o acumulado em 12 meses
function calcularAcumulado12Meses(valores) {
  const acumulado = [];
  for (let i = 11; i < valores.length; i++) {
      let produto = 1;
      for (let j = i - 11; j <= i; j++) {
          produto *= (1 + (valores[j] / 100));
      }
      acumulado.push((produto - 1) * 100);
  }
  return acumulado;
}

// Buscar dados da API
async function fetchData(url) {
  try {
      const response = await fetch(url);
      return await response.json();
  } catch (error) {
      console.error('Erro ao buscar dados:', error);
      return null;
  }
}

// Processar dados
async function processarDados() {
  try {
      const [ipcaData, igpmData] = await Promise.all([
          fetchData(URLS.ipca),
          fetchData(URLS.igpm)
      ]);

      // Processar IPCA
      const ipcaProcessado = ipcaData
          .map(item => ({
              data: new Date(item.data.split('/').reverse().join('-')),
              valor: parseFloat(item.valor)
          }))
          .sort((a, b) => a.data - b.data);

      const acumuladoIPCA = calcularAcumulado12Meses(ipcaProcessado.map(item => item.valor));

      // Processar IGP-M
      const igpmProcessado = igpmData
          .map(item => ({
              data: new Date(item.data.split('/').reverse().join('-')),
              valor: parseFloat(item.valor)
          }))
          .sort((a, b) => a.data - b.data);

      const acumuladoIGPM = calcularAcumulado12Meses(igpmProcessado.map(item => item.valor));

      // Criar gráfico
      criarGrafico(
          ipcaProcessado.slice(11), // Remover primeiros 11 meses sem acumulado
          acumuladoIPCA,
          igpmProcessado.slice(11),
          acumuladoIGPM
      );
      
  } catch (error) {
      console.error('Erro no processamento:', error);
  }
}

// Função para criar o gráfico com Plotly
function criarGrafico(ipca, acumuladoIPCA, igpm, acumuladoIGPM) {
  const traces = [
      {
          x: ipca.map(item => item.data),
          y: acumuladoIPCA,
          name: 'IPCA',
          mode: 'lines',
          line: { color: CORES.azul_escuro, width: 3 }
      },
      {
          x: igpm.map(item => item.data),
          y: acumuladoIGPM,
          name: 'IGP-M',
          mode: 'lines',
          line: { color: CORES.azul_claro, width: 3 }
      }
  ];

  const layout = {
      title: 'Inflação Acumulada em 12 Meses (%)\nIPCA & IGP-M',
      xaxis: { title: 'Data' },
      yaxis: { title: 'Percentual (%)' },
      hovermode: 'closest',
      showlegend: true,
      template: 'plotly_white',
      margin: { t: 40, b: 40 },
      height: 600
  };

  Plotly.newPlot('grafico-ipca', traces, layout);
}

// Inicializar
document.addEventListener('DOMContentLoaded', processarDados);