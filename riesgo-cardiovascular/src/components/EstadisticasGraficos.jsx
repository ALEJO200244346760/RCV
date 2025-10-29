// EstadisticasGraficos.jsx

import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// 1. Registro del BarElement para el gráfico de barras
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Colores base para gráficos (adaptados a la paleta de Tailwind/Moderno)
// Paleta Femenina de Colores para Gráficos
const BASE_COLORS = [
    '#F9A8D4', // Rosa claro
    '#D8B4FE', // Lavanda
    '#F472B6', // Rosa intenso
    '#C084FC', // Violeta suave
    '#E879F9', // Magenta
    '#F0ABFC', // Rosa púrpura
    '#FBCFE8', // Rosa pastel
    '#E0E7FF', // Azul-violeta muy claro
    '#D946EF', // Fucsia
    '#A78BFA', // Violeta medio
    '#6EE7B7', // Menta
    '#93C5FD', // Azul suave
];

// Función para obtener la configuración de datos del gráfico de torta
const pieOptions = (aggregation) => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
        legend: { position: 'right' },
        tooltip: { callbacks: { label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = aggregation.reduce((sum, item) => sum + item.count, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
            return `${label}: ${value} (${percentage})`;
        }}},
        title: { display: false }
    }
});

// Opciones para el nuevo gráfico de barras (comparativo)
const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: { stacked: false }, 
        y: { stacked: false, beginAtZero: true }
    },
    plugins: {
        legend: { position: 'top' },
        title: { display: false }
    }
};


// Componente de envoltura para cada gráfico
const ChartWrapper = ({ title, chartType, data, options }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <h3 className="text-center text-lg font-semibold text-gray-800 mb-4">{title}</h3>
            <div className="flex justify-center h-64 w-full">
                {chartType === 'Pie' && <Pie data={data} options={options} />}
                {chartType === 'Bar' && <Bar data={data} options={options} />} {/* <-- SOPORTE PARA BAR CHART */}
            </div>
        </div>
    );
};


// --- FUNCIÓN DE AGREGACIÓN DE DATOS ACTUALIZADA ---
const aggregateData = (pacientes) => {
    // Array de campos booleanos/categóricos a agregar
    const fieldsToAggregate = [
        // Hábitos y Riesgo General
        'nivelRiesgo', 'fumaDiario', 'actividadFisica', 'consumoAlcoholRiesgo', 'horasSueno', 'estresAngustiaCronica', 
        
        // Condiciones Crónicas (Consolidadas)
        'infartoAcvTrombosis', 'enfermedadRenalInsuficiencia', 'hivHepatitis', 'enfermedadesAutoinmunes', 'tomaMedicacionDiario',
        
        // Salud Femenina / Mamaria (Nuevos)
        'tumoresMama', 'familiarCancerMama', 'puncionMama', 'mamaDensa', 'tuvoHijos', 
        'reproduccionAsistida', 'abortosSindromeAntifosfolipidico', 'menstruacionUltima',
    ];

    const aggregated = {};
    fieldsToAggregate.forEach(field => {
        aggregated[field] = {};
    });

    pacientes.forEach(p => {
        fieldsToAggregate.forEach(field => {
            const value = p[field] || 'N/D'; // Usa 'N/D' si el campo es nulo
            aggregated[field][value] = (aggregated[field][value] || 0) + 1;
        });
    });

    // --- AGREGACIÓN ESPECIAL: RIESGO vs CINTURA (NUEVA LÓGICA) ---
    const riesgoVsCintura = {
        'Mayor 88': { 'Bajo': 0, 'Moderado': 0, 'Alto': 0, 'Muy Alto': 0 },
        'Menor o Igual 88': { 'Bajo': 0, 'Moderado': 0, 'Alto': 0, 'Muy Alto': 0 },
    };

    pacientes.forEach(p => {
        const valorCintura = parseFloat(p.cintura);
        const grupoCintura = (isNaN(valorCintura) || valorCintura === 0) 
            ? null 
            : (valorCintura > 88 ? 'Mayor 88' : 'Menor o Igual 88');
        
        // Extrae el nivel de riesgo (Bajo, Moderado, Alto, Muy Alto) del string
        const riesgo = p.nivelRiesgo ? p.nivelRiesgo.split(' ').pop() : 'N/D'; 

        if (grupoCintura && riesgo !== 'N/D' && riesgoVsCintura[grupoCintura] && riesgoVsCintura[grupoCintura][riesgo] !== undefined) {
            riesgoVsCintura[grupoCintura][riesgo]++;
        }
    });
    // ------------------------------------------------------------------

    // Convertir la agregación a formato Chart.js Data
    const chartsData = {};

    Object.keys(aggregated).forEach(field => {
        const aggregation = Object.keys(aggregated[field]).map(label => ({
            label,
            count: aggregated[field][label]
        }));
        
        chartsData[`data${field.charAt(0).toUpperCase() + field.slice(1)}`] = {
            aggregation: aggregation,
            labels: aggregation.map(item => item.label),
            datasets: [{
                data: aggregation.map(item => item.count),
                backgroundColor: BASE_COLORS.slice(0, aggregation.length),
                hoverOffset: 4
            }]
        };
    });
    
    // Configurar el nuevo dataset de Riesgo vs Cintura
    const riesgoLabels = ['Bajo', 'Moderado', 'Alto', 'Muy Alto'];
    
    chartsData.dataRiesgoVsCintura = {
        labels: riesgoLabels,
        datasets: [
            {
                label: 'Cintura > 88 cm',
                data: riesgoLabels.map(risk => riesgoVsCintura['Mayor 88'][risk]),
                backgroundColor: '#F472B6', // Rosa intenso
            },
            {
                label: 'Cintura ≤ 88 cm',
                data: riesgoLabels.map(risk => riesgoVsCintura['Menor o Igual 88'][risk]),
                backgroundColor: '#93C5FD', // Azul suave
            },
        ]
    };
    // -------------------------------------------------

    return chartsData;
};


// --- COMPONENTE PRINCIPAL ---
function EstadisticasGraficos({ pacientes: pacientesFiltrados = [] }) {
  
    if (pacientesFiltrados.length === 0) {
        return (
            <div className="p-4 text-center bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                ⚠️ No hay datos de pacientes para generar gráficos con los filtros actuales.
            </div>
        );
    }
    
    const chartsData = aggregateData(pacientesFiltrados);

    // Desestructurar los datos generados para facilitar el renderizado
    const { 
        dataNivelRiesgo, dataFumaDiario, dataActividadFisica, dataConsumoAlcoholRiesgo, dataHorasSueno, dataEstresAngustiaCronica,
        dataInfartoAcvTrombosis, dataEnfermedadRenalInsuficiencia, dataHivHepatitis, dataEnfermedadesAutoinmunes, dataTomaMedicacionDiario,
        dataTumoresMama, dataFamiliarCancerMama, dataPuncionMama, dataMamaDensa, dataTuvoHijos, dataReproduccionAsistida,
        dataAbortosSindromeAntifosfolipidico, dataMenstruacionUltima,
        dataRiesgoVsCintura // <-- NUEVO DATASET
    } = chartsData;


    return (
        <div className="p-4 bg-gray-50">
            <h2 className="text-3xl font-extrabold text-indigo-700 mb-6 border-b pb-2">
                Análisis Gráfico de Pacientes ({pacientesFiltrados.length})
            </h2>
            
            {/* --- 1. RIESGO CARDIOVASCULAR Y MEDIDAS GENERALES (ACTUALIZADO CON GRÁFICO DE BARRAS) --- */}
            <h3 className="text-xl font-bold text-indigo-600 mb-4 mt-6">Riesgo y Hábitos de Vida</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* NUEVO GRÁFICO DE BARRAS */}
                <ChartWrapper 
                    title="Riesgo Cardiovascular por Circunferencia de Cintura" 
                    chartType="Bar" 
                    data={dataRiesgoVsCintura} 
                    options={barOptions} 
                /> 
                
                <ChartWrapper title="Nivel de Riesgo Cardiovascular" chartType="Pie" data={dataNivelRiesgo} options={pieOptions(dataNivelRiesgo.aggregation)} />
                <ChartWrapper title="Fuma a Diario" chartType="Pie" data={dataFumaDiario} options={pieOptions(dataFumaDiario.aggregation)} />
                <ChartWrapper title="Actividad Física (≥ 150 min/sem)" chartType="Pie" data={dataActividadFisica} options={pieOptions(dataActividadFisica.aggregation)} />
                <ChartWrapper title="Consumo de Alcohol de Riesgo" chartType="Pie" data={dataConsumoAlcoholRiesgo} options={pieOptions(dataConsumoAlcoholRiesgo.aggregation)} />
                <ChartWrapper title="Horas de Sueño" chartType="Pie" data={dataHorasSueno} options={pieOptions(dataHorasSueno.aggregation)} />
                <ChartWrapper title="Estrés/Angustia Crónica" chartType="Pie" data={dataEstresAngustiaCronica} options={pieOptions(dataEstresAngustiaCronica.aggregation)} />
            </div>

            {/* --- 2. ANTECEDENTES Y CONDICIONES CRÓNICAS --- */}
            <h3 className="text-xl font-bold text-indigo-600 mb-4 mt-8">Antecedentes y Condiciones Crónicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ChartWrapper title="Infarto/ACV/Trombosis Previa" chartType="Pie" data={dataInfartoAcvTrombosis} options={pieOptions(dataInfartoAcvTrombosis.aggregation)} />
                <ChartWrapper title="Enfermedad Renal/Insuficiencia Cardíaca" chartType="Pie" data={dataEnfermedadRenalInsuficiencia} options={pieOptions(dataEnfermedadRenalInsuficiencia.aggregation)} />
                <ChartWrapper title="Toma Medicación Diaria" chartType="Pie" data={dataTomaMedicacionDiario} options={pieOptions(dataTomaMedicacionDiario.aggregation)} />
                <ChartWrapper title="Enfermedades Autoinmunes" chartType="Pie" data={dataEnfermedadesAutoinmunes} options={pieOptions(dataEnfermedadesAutoinmunes.aggregation)} />
                <ChartWrapper title="HIV o Hepatitis B/C" chartType="Pie" data={dataHivHepatitis} options={pieOptions(dataHivHepatitis.aggregation)} />
            </div>

            {/* --- 3. SALUD GINECOLÓGICA Y MAMARIA --- */}
            <h3 className="text-xl font-bold text-pink-700 mb-4 mt-8">Salud Ginecológica y Mamaria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ChartWrapper title="Antecedente de Tumores de Mama" chartType="Pie" data={dataTumoresMama} options={pieOptions(dataTumoresMama.aggregation)} />
                <ChartWrapper title="Familiar Cáncer de Mama" chartType="Pie" data={dataFamiliarCancerMama} options={pieOptions(dataFamiliarCancerMama.aggregation)} />
                <ChartWrapper title="Punción Mamaria Previa" chartType="Pie" data={dataPuncionMama} options={pieOptions(dataPuncionMama.aggregation)} />
                <ChartWrapper title="Mama Densa (Reportada)" chartType="Pie" data={dataMamaDensa} options={pieOptions(dataMamaDensa.aggregation)} />
                <ChartWrapper title="Tuvo Hijos" chartType="Pie" data={dataTuvoHijos} options={pieOptions(dataTuvoHijos.aggregation)} />
                <ChartWrapper title="Reproducción Asistida" chartType="Pie" data={dataReproduccionAsistida} options={pieOptions(dataReproduccionAsistida.aggregation)} />
                <ChartWrapper title="Abortos / SAF" chartType="Pie" data={dataAbortosSindromeAntifosfolipidico} options={pieOptions(dataAbortosSindromeAntifosfolipidico.aggregation)} />
                <ChartWrapper title="Última Menstruación (> 1 Año)" chartType="Pie" data={dataMenstruacionUltima} options={pieOptions(dataMenstruacionUltima.aggregation)} />
            </div>
            
        </div>
    );
}

export default EstadisticasGraficos;