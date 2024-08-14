import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function EstadisticasGraficos({ pacientesFiltrados }) {
  // Función para calcular porcentajes
  const calcularPorcentajes = (data) => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = ((data[key] / total) * 100).toFixed(2);
      return acc;
    }, {});
  };

  // Datos para Edad
  const edades = pacientesFiltrados.reduce((acc, paciente) => {
    acc[paciente.edad] = (acc[paciente.edad] || 0) + 1;
    return acc;
  }, {});
  const dataEdad = {
    labels: Object.keys(edades),
    datasets: [{
      label: 'Cantidad',
      data: Object.values(edades),
      backgroundColor: [
        'rgba(75, 192, 192, 0.5)', 
        'rgba(153, 102, 255, 0.5)', 
        'rgba(255, 159, 64, 0.5)', 
        'rgba(255, 99, 132, 0.5)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)', 
        'rgba(153, 102, 255, 1)', 
        'rgba(255, 159, 64, 1)', 
        'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
    }]
  };

  // Datos para Género
  const generos = pacientesFiltrados.reduce((acc, paciente) => {
    acc[paciente.genero] = (acc[paciente.genero] || 0) + 1;
    return acc;
  }, {});
  const dataGenero = {
    labels: Object.keys(generos),
    datasets: [{
      label: 'Cantidad',
      data: Object.values(generos),
      backgroundColor: [
        'rgba(75, 192, 192, 0.5)', 
        'rgba(255, 205, 86, 0.5)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)', 
        'rgba(255, 205, 86, 1)'
      ],
      borderWidth: 1
    }]
  };

  // Datos para Diabetes
  const diabetes = pacientesFiltrados.reduce((acc, paciente) => {
    acc[paciente.diabetes] = (acc[paciente.diabetes] || 0) + 1;
    return acc;
  }, {});
  const dataDiabetes = {
    labels: Object.keys(diabetes),
    datasets: [{
      label: 'Cantidad',
      data: Object.values(diabetes),
      backgroundColor: [
        'rgba(75, 192, 192, 0.5)', 
        'rgba(255, 99, 132, 0.5)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)', 
        'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
    }]
  };

  // Datos para Fumador
  const fumadores = pacientesFiltrados.reduce((acc, paciente) => {
    acc[paciente.fumador] = (acc[paciente.fumador] || 0) + 1;
    return acc;
  }, {});
  const dataFumador = {
    labels: Object.keys(fumadores),
    datasets: [{
      label: 'Cantidad',
      data: Object.values(fumadores),
      backgroundColor: [
        'rgba(75, 192, 192, 0.5)', 
        'rgba(255, 159, 64, 0.5)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)', 
        'rgba(255, 159, 64, 1)'
      ],
      borderWidth: 1
    }]
  };

  // Datos para Presión Arterial
  const presiones = pacientesFiltrados.reduce((acc, paciente) => {
    acc[paciente.presionArterial] = (acc[paciente.presionArterial] || 0) + 1;
    return acc;
  }, {});
  const dataPresion = {
    labels: Object.keys(presiones),
    datasets: [{
      label: 'Cantidad',
      data: Object.values(presiones),
      backgroundColor: [
        'rgba(75, 192, 192, 0.5)', 
        'rgba(153, 102, 255, 0.5)', 
        'rgba(255, 159, 64, 0.5)', 
        'rgba(255, 99, 132, 0.5)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)', 
        'rgba(153, 102, 255, 1)', 
        'rgba(255, 159, 64, 1)', 
        'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
    }]
  };

  // Datos para Colesterol
  const calcularRangoColesterol = (colesterol) => {
    if (colesterol === undefined) return 'No';
    if (colesterol < 154) return 'Bajo';
    if (colesterol >= 155 && colesterol <= 192) return 'Normal';
    if (colesterol >= 193 && colesterol <= 231) return 'Alto';
    if (colesterol >= 232 && colesterol <= 269) return 'Muy Alto';
    if (colesterol >= 270) return 'Crítico';
  };

  const colesterol = pacientesFiltrados.reduce((acc, paciente) => {
    const rango = calcularRangoColesterol(paciente.colesterol);
    acc[rango] = (acc[rango] || 0) + 1;
    return acc;
  }, { 'No': 0 });
  const dataColesterol = {
    labels: Object.keys(colesterol),
    datasets: [{
      label: 'Cantidad',
      data: Object.values(colesterol),
      backgroundColor: [
        'rgba(75, 192, 192, 0.5)', 
        'rgba(153, 102, 255, 0.5)', 
        'rgba(255, 159, 64, 0.5)', 
        'rgba(255, 99, 132, 0.5)', 
        'rgba(255, 205, 86, 0.5)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)', 
        'rgba(153, 102, 255, 1)', 
        'rgba(255, 159, 64, 1)', 
        'rgba(255, 99, 132, 1)', 
        'rgba(255, 205, 86, 1)'
      ],
      borderWidth: 1
    }]
  };

  // Datos para Nivel de Riesgo
  const riesgos = pacientesFiltrados.reduce((acc, paciente) => {
    acc[paciente.nivelRiesgo] = (acc[paciente.nivelRiesgo] || 0) + 1;
    return acc;
  }, {});
  const dataRiesgo = {
    labels: Object.keys(riesgos).sort((a, b) => {
      const niveles = {
        '<10% Poco': 1,
        '>10% <20% Moderado': 2,
        '>20% <30% Alto': 3,
        '>30% <40% Muy Alto': 4,
        '>40% Crítico': 5
      };
      return niveles[a] - niveles[b];
    }),
    datasets: [{
      label: 'Cantidad',
      data: Object.values(riesgos),
      backgroundColor: [
        'rgba(75, 192, 192, 0.5)', 
        'rgba(153, 102, 255, 0.5)', 
        'rgba(255, 159, 64, 0.5)', 
        'rgba(255, 99, 132, 0.5)', 
        'rgba(255, 205, 86, 0.5)'
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)', 
        'rgba(153, 102, 255, 1)', 
        'rgba(255, 159, 64, 1)', 
        'rgba(255, 99, 132, 1)', 
        'rgba(255, 205, 86, 1)'
      ],
      borderWidth: 1
    }]
  };

  return (
    <div>
      <div style={{ width: '30%', display: 'inline-block' }}>
        <h3>Edad</h3>
        <Bar data={dataEdad} options={{ 
          responsive: true,
          plugins: { 
            legend: { display: true }, 
            tooltip: { callbacks: { label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw} (${calcularPorcentajes(edades)[tooltipItem.label]}%)` } }
          },
          scales: {
            y: { ticks: { stepSize: 1 } }
          }
        }} />
      </div>
      <div style={{ width: '30%', display: 'inline-block', marginLeft: '5%' }}>
        <h3>Presión Arterial</h3>
        <Bar data={dataPresion} options={{ 
          responsive: true,
          plugins: { 
            legend: { display: true }, 
            tooltip: { callbacks: { label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw} (${calcularPorcentajes(presiones)[tooltipItem.label]}%)` } }
          },
          scales: {
            y: { 
              ticks: { stepSize: 1 },
              suggestedMax: 100
            }
          }
        }} />
      </div>
      <div style={{ width: '30%', display: 'inline-block' }}>
        <h3>Colesterol</h3>
        <Bar data={dataColesterol} options={{ 
          responsive: true,
          plugins: { 
            legend: { display: true }, 
            tooltip: { callbacks: { label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw} (${calcularPorcentajes(colesterol)[tooltipItem.label]}%)` } }
          },
          scales: {
            y: { 
              ticks: { stepSize: 1 },
              suggestedMax: 100
            }
          }
        }} />
      </div>
      <div style={{ width: '30%', display: 'inline-block', marginLeft: '5%' }}>
        <h3>Nivel de Riesgo</h3>
        <Bar data={dataRiesgo} options={{ 
          responsive: true,
          plugins: { 
            legend: { display: true }, 
            tooltip: { callbacks: { label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw} (${calcularPorcentajes(riesgos)[tooltipItem.label]}%)` } }
          },
          scales: {
            y: { 
              ticks: { stepSize: 1 },
              suggestedMax: 100
            }
          }
        }} />
      </div>
      <div style={{ width: '30%', display: 'inline-block' }}>
        <h3>Género</h3>
        <Pie data={dataGenero} options={{ 
          responsive: true,
          plugins: { 
            legend: { display: true }, 
            tooltip: { callbacks: { label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw} (${calcularPorcentajes(generos)[tooltipItem.label]}%)` } }
          }
        }} />
      </div>
      <div style={{ width: '30%', display: 'inline-block', marginLeft: '5%' }}>
        <h3>Diabetes</h3>
        <Pie data={dataDiabetes} options={{ 
          responsive: true,
          plugins: { 
            legend: { display: true }, 
            tooltip: { callbacks: { label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw} (${calcularPorcentajes(diabetes)[tooltipItem.label]}%)` } }
          }
        }} />
      </div>
      <div style={{ width: '30%', display: 'inline-block' }}>
        <h3>Fumador</h3>
        <Pie data={dataFumador} options={{ 
          responsive: true,
          plugins: { 
            legend: { display: true }, 
            tooltip: { callbacks: { label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw} (${calcularPorcentajes(fumadores)[tooltipItem.label]}%)` } }
          }
        }} />
      </div>
    </div>
  );
}

export default EstadisticasGraficos;
