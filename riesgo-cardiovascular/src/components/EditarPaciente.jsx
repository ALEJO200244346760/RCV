import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { calcularRiesgoCardiovascular } from './Calculadora'; // Asumo que existe y se usa
// import { obtenerColorRiesgo, obtenerTextoRiesgo } from './ConstFormulario'; // Asumo que existen

// --- AXIOS INSTANCE ---
const axiosInstance = axios.create({
    baseURL: 'https://rcv-production.up.railway.app', 
});
const apiBaseURL = '/api/pacientes'; 


// *************************************************************************
// ** ESTADO INICIAL COMPLETO (Sincronizado con Paciente.java y Estadisticas.jsx) **
// *************************************************************************
const initialData = {
    dni: '', fechaNacimiento: '', telefono: '', mail: '', edad: '', genero: 'femenino',
    colesterol: 'No', nivelRiesgo: '', imc: '', peso: '', talla: '', cintura: '',
    tensionSistolica: '', tensionDiastolica: '',
    
    // Hábitos y Riesgo General
    tomaMedicacionDiario: null, medicacionCondiciones: [], 
    fumaDiario: null, fumaTipo: '', consumoAlcoholRiesgo: null,
    actividadFisica: null, horasSueno: null, horasSuenoProblema: '',
    estresAngustiaCronica: null, estresTipo: '',
    enfermedadesAutoinmunes: null, autoinmunesTipo: [], 
    hivHepatitis: null,
    
    // Condiciones Crónicas
    infartoAcvTrombosis: null, infartoAcvTrombosisTipo: [],
    enfermedadRenalInsuficiencia: null, enfermedadRenalInsuficienciaTipo: [],
    
    // Salud Femenina / Mamaria
    tumoresMama: null, tumoresMamaTratamiento: [], 
    familiarCancerMama: null, puncionMama: null, puncionMamaMotivo: '',
    mamaDensa: null,
    
    // Salud Femenina / Reproductiva
    tuvoHijos: null, complicacionesEmbarazo: [], 
    reproduccionAsistida: null, abortosSindromeAntifosfolipidico: null,
    menstruacionEdadRiesgo: null, 
    menstruacionUltima: null, menopausiaTipo: [], 
    incontinenciaOrgasmos: null, incontinenciaOrgasmosTipo: [],
};


// *************************************************************************
// ** HELPER COMPONENTS (Para simplificar el formulario) **
// *************************************************************************

// Opciones de uso general
const opcionesSiNo = ['Sí', 'No'];
const opcionesMamaDensa = ['Sí', 'No', 'No recuerdo', 'No sé lo que es'];

// Input simple
const InputField = ({ label, name, type = 'text', value, onChange, placeholder, min, max }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input
            type={type}
            name={name}
            id={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            min={min}
            max={max}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
    </div>
);

// Radio Group
const RadioGroup = ({ label, name, options, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="flex flex-wrap gap-4">
            {options.map(option => (
                <label key={option} className="inline-flex items-center">
                    <input
                        type="radio"
                        name={name}
                        value={option}
                        checked={value === option}
                        onChange={onChange}
                        className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                    />
                    <span className="ml-2 text-sm text-gray-600">{option}</span>
                </label>
            ))}
        </div>
    </div>
);

// Checkbox Group (Para campos que guardan arrays como string)
const CheckboxGroup = ({ label, name, options, selectedValues, onChange }) => {
    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        let newValues;
        
        if (checked) {
            newValues = [...selectedValues, value];
        } else {
            newValues = selectedValues.filter(v => v !== value);
        }
        
        // Simula el evento para manejarCambio
        onChange({ 
            target: { 
                name: name, 
                value: newValues 
            } 
        });
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="flex flex-wrap gap-x-6 gap-y-2 p-2 border border-gray-200 rounded-md">
                {options.map(option => (
                    <label key={option} className="inline-flex items-center">
                        <input
                            type="checkbox"
                            value={option}
                            checked={selectedValues.includes(option)}
                            onChange={handleCheckboxChange}
                            className="form-checkbox h-4 w-4 text-pink-600 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-600">{option}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};


// *************************************************************************
// ** COMPONENTE PRINCIPAL: EditarPaciente **
// *************************************************************************
function EditarPaciente() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [datos, setDatos] = useState(initialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState(null);

    // Campos que se almacenan como String separado por coma en el backend
    const arrayFields = useMemo(() => [
        'medicacionCondiciones', 'fumaTipo', 'horasSuenoProblema', 'autoinmunesTipo', 
        'infartoAcvTrombosisTipo', 'enfermedadRenalInsuficienciaTipo', 'tumoresMamaTratamiento',
        'complicacionesEmbarazo', 'menopausiaTipo', 'incontinenciaOrgasmosTipo'
    ], []);


    // 1. Cargar datos del paciente
    useEffect(() => {
        setLoading(true);
        axiosInstance.get(`${apiBaseURL}/${id}`)
            .then(resp => {
                const pacienteData = resp.data;
                
                // Convertir strings separados por coma a arrays para el estado del formulario
                const processedData = { ...pacienteData };
                arrayFields.forEach(field => {
                    const value = pacienteData[field];
                    // Si el valor es una cadena no vacía, lo convierte en array. Si no, usa array vacío.
                    processedData[field] = value && typeof value === 'string' 
                        ? value.split(', ').filter(item => item.trim() !== "") 
                        : [];
                });
                
                setDatos(prev => ({ ...prev, ...processedData }));
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al cargar paciente:", err);
                setError("No se pudo cargar el paciente. Verifique la ID.");
                setLoading(false);
            });
    }, [id, arrayFields]);

    // 2. Manejar cambios de Inputs, Radio y Checkbox (convierte Checkbox a array)
    const manejarCambio = (e) => {
        const { name, value, type } = e.target;
        
        // Manejo especial para CheckboxGroup (ya maneja el array en su helper)
        if (arrayFields.includes(name) && Array.isArray(value)) {
             setDatos(prev => ({ ...prev, [name]: value }));
             return;
        }

        const newValue = type === 'number' ? parseFloat(value) : value;

        setDatos(prev => ({ 
            ...prev, 
            [name]: newValue 
        }));
    };
    
    // 3. Manejar el envío del formulario
    const manejarEnvio = (e) => {
        e.preventDefault();
        
        // Recalcular IMC y Riesgo (usando la función importada)
        const { imc: nuevoImc, nivelRiesgo: nuevoNivelRiesgo } = calcularRiesgoCardiovascular(datos);
        
        // Crear el objeto de datos a enviar al backend
        const datosAEnviar = { ...datos, imc: nuevoImc, nivelRiesgo: nuevoNivelRiesgo };
        
        // Convertir arrays de nuevo a strings separados por coma antes de enviar
        arrayFields.forEach(field => {
            if (Array.isArray(datosAEnviar[field])) {
                datosAEnviar[field] = datosAEnviar[field].join(', ');
            }
        });
        
        // Limpiar campos que no deben enviarse como undefined o null
        Object.keys(datosAEnviar).forEach(key => {
            if (datosAEnviar[key] === null || datosAEnviar[key] === undefined) {
                datosAEnviar[key] = '';
            }
        });


        // Petición PUT
        axiosInstance.put(`${apiBaseURL}/${id}`, datosAEnviar)
            .then(() => {
                setMensajeExito("¡Paciente actualizado con éxito!");
                setTimeout(() => setMensajeExito(null), 3000);
            })
            .catch(err => {
                console.error("Error al actualizar:", err);
                setError("Hubo un error al guardar los cambios.");
            });
    };


    if (loading) return <div className="text-center p-8 text-xl font-semibold text-indigo-600">Cargando paciente...</div>;
    if (error) return <div className="text-center p-8 text-xl font-semibold text-red-600">{error}</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
                <button 
                    onClick={() => navigate('/estadisticas')}
                    className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-6 transition"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Volver al listado
                </button>
                
                <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">
                    Editar Paciente DNI: {datos.dni}
                </h1>
                <p className="text-sm text-gray-500 mb-4">ID de Registro: {id}</p>

                <form onSubmit={manejarEnvio}>
                    
                    {/* --- SECCIÓN 1: DATOS BÁSICOS Y ANTROPOMÉTRICOS --- */}
                    <div className="space-y-6 mb-8 border p-4 rounded-lg bg-indigo-50/50 border-indigo-200">
                        <h2 className="text-xl font-bold text-indigo-700">Datos Básicos y Mediciones</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <InputField label="DNI" name="dni" value={datos.dni} onChange={manejarCambio} placeholder="DNI" />
                            <InputField label="Fecha de Nacimiento" name="fechaNacimiento" type="date" value={datos.fechaNacimiento} onChange={manejarCambio} />
                            <InputField label="Edad (Calculada)" name="edad" type="number" value={datos.edad} onChange={manejarCambio} min="18" max="120" placeholder="Edad" />
                            <InputField label="Teléfono" name="telefono" value={datos.telefono} onChange={manejarCambio} placeholder="Teléfono" />
                            <InputField label="Email" name="mail" value={datos.mail} onChange={manejarCambio} placeholder="Email" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <InputField label="Peso (kg)" name="peso" type="number" value={datos.peso} onChange={manejarCambio} min="30" max="300" placeholder="Ej: 75" />
                            <InputField label="Talla (cm)" name="talla" type="number" value={datos.talla} onChange={manejarCambio} min="100" max="250" placeholder="Ej: 165" />
                            <InputField label="Cintura (cm)" name="cintura" type="number" value={datos.cintura} onChange={manejarCambio} min="40" max="200" placeholder="Ej: 85" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <InputField label="Tensión Sistólica (mmhg)" name="tensionSistolica" type="number" value={datos.tensionSistolica} onChange={manejarCambio} min="60" max="250" placeholder="Ej: 120" />
                            <InputField label="Tensión Diastólica (mmhg)" name="tensionDiastolica" type="number" value={datos.tensionDiastolica} onChange={manejarCambio} min="40" max="150" placeholder="Ej: 80" />
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Riesgo Actual</label>
                                <p className="mt-1 text-lg font-bold text-gray-800">{datos.nivelRiesgo || 'N/D'}</p>
                            </div>
                        </div>
                    </div>


                    {/* --- SECCIÓN 2: RIESGO Y HÁBITOS --- */}
                    <div className="space-y-6 mb-8 border p-4 rounded-lg bg-red-50/50 border-red-200">
                        <h2 className="text-xl font-bold text-red-700">Riesgo y Hábitos de Vida</h2>
                        
                        <RadioGroup label="Infarto / ACV / Trombosis previa" name="infartoAcvTrombosis" options={opcionesSiNo} value={datos.infartoAcvTrombosis} onChange={manejarCambio} />
                        {datos.infartoAcvTrombosis === 'Sí' && (
                            <CheckboxGroup 
                                label="¿Qué tipo?" 
                                name="infartoAcvTrombosisTipo" 
                                options={['Infarto Agudo de Miocardio', 'Accidente Cerebrovascular (ACV)', 'Trombosis Venosa Profunda', 'Tromboembolismo Pulmonar']} 
                                selectedValues={datos.infartoAcvTrombosisTipo} 
                                onChange={manejarCambio} 
                            />
                        )}
                        
                        <RadioGroup label="Enfermedad Renal o Insuficiencia Cardíaca (IC)" name="enfermedadRenalInsuficiencia" options={opcionesSiNo} value={datos.enfermedadRenalInsuficiencia} onChange={manejarCambio} />
                        {datos.enfermedadRenalInsuficiencia === 'Sí' && (
                            <CheckboxGroup 
                                label="Detalles de la condición:" 
                                name="enfermedadRenalInsuficienciaTipo" 
                                options={['Enfermedad Renal Crónica', 'Insuficiencia Cardíaca', 'Trasplante Renal/Cardíaco']} 
                                selectedValues={datos.enfermedadRenalInsuficienciaTipo} 
                                onChange={manejarCambio} 
                            />
                        )}

                        <RadioGroup label="¿Toma medicación diaria para alguna condición crónica?" name="tomaMedicacionDiario" options={opcionesSiNo} value={datos.tomaMedicacionDiario} onChange={manejarCambio} />
                        {datos.tomaMedicacionDiario === 'Sí' && (
                            <CheckboxGroup 
                                label="Condiciones tratadas:" 
                                name="medicacionCondiciones" 
                                options={['Hipertensión Arterial', 'Diabetes', 'Colesterol Elevado', 'Otra']} 
                                selectedValues={datos.medicacionCondiciones} 
                                onChange={manejarCambio} 
                            />
                        )}
                        
                        <RadioGroup label="¿Fuma a diario?" name="fumaDiario" options={opcionesSiNo} value={datos.fumaDiario} onChange={manejarCambio} />
                        {datos.fumaDiario === 'Sí' && (
                            <InputField 
                                label="Tipo de producto (Cigarrillo, vapeador, etc.)" 
                                name="fumaTipo" 
                                value={datos.fumaTipo} 
                                onChange={manejarCambio} 
                                placeholder="Ej: Tabaco, Vapeador"
                            />
                        )}

                        <RadioGroup label="¿Consume alcohol de riesgo (≥ 14 Uds/sem)?" name="consumoAlcoholRiesgo" options={opcionesSiNo} value={datos.consumoAlcoholRiesgo} onChange={manejarCambio} />
                        <RadioGroup label="¿Realiza actividad física ≥ 150 min/sem?" name="actividadFisica" options={opcionesSiNo} value={datos.actividadFisica} onChange={manejarCambio} />
                        
                        <RadioGroup label="¿Padece de estrés o angustia crónica?" name="estresAngustiaCronica" options={opcionesSiNo} value={datos.estresAngustiaCronica} onChange={manejarCambio} />
                        {datos.estresAngustiaCronica === 'Sí' && (
                             <InputField 
                                label="Tipo de Estrés / Condición" 
                                name="estresTipo" 
                                value={datos.estresTipo} 
                                onChange={manejarCambio} 
                                placeholder="Ej: Ansiedad, Depresión, Laboral"
                            />
                        )}

                        <RadioGroup label="¿Tiene enfermedades autoinmunes?" name="enfermedadesAutoinmunes" options={opcionesSiNo} value={datos.enfermedadesAutoinmunes} onChange={manejarCambio} />
                        {datos.enfermedadesAutoinmunes === 'Sí' && (
                            <CheckboxGroup 
                                label="Tipo de enfermedad(es):" 
                                name="autoinmunesTipo" 
                                options={['Lupus', 'Artritis Reumatoide', 'Esclerosis Múltiple', 'Otro']} 
                                selectedValues={datos.autoinmunesTipo} 
                                onChange={manejarCambio} 
                            />
                        )}
                        <RadioGroup label="¿Tiene HIV o Hepatitis B/C?" name="hivHepatitis" options={opcionesSiNo} value={datos.hivHepatitis} onChange={manejarCambio} />
                    </div>


                    {/* --- SECCIÓN 3: SALUD FEMENINA Y MAMARIA --- */}
                    <div className="space-y-6 mb-8 border p-4 rounded-lg bg-pink-50/50 border-pink-200">
                        <h2 className="text-xl font-bold text-pink-700">Salud Femenina y Mamaria</h2>
                        
                        <RadioGroup label="Antecedente de tumores de mama" name="tumoresMama" options={opcionesSiNo} value={datos.tumoresMama} onChange={manejarCambio} />
                        {datos.tumoresMama === 'Sí' && (
                            <CheckboxGroup 
                                label="Tratamientos recibidos:" 
                                name="tumoresMamaTratamiento" 
                                options={['Cirugía', 'Quimioterapia', 'Radioterapia', 'Hormonoterapia']} 
                                selectedValues={datos.tumoresMamaTratamiento} 
                                onChange={manejarCambio} 
                            />
                        )}
                        
                        <RadioGroup label="Familiar directo con cáncer de mama" name="familiarCancerMama" options={opcionesSiNo} value={datos.familiarCancerMama} onChange={manejarCambio} />
                        <RadioGroup label="Punción mamaria previa" name="puncionMama" options={opcionesSiNo} value={datos.puncionMama} onChange={manejarCambio} />
                        {datos.puncionMama === 'Sí' && (
                            <InputField 
                                label="Motivo de la punción" 
                                name="puncionMamaMotivo" 
                                value={datos.puncionMamaMotivo} 
                                onChange={manejarCambio} 
                                placeholder="Ej: Sospecha maligna, Quiste"
                            />
                        )}
                        <RadioGroup label="¿Tiene mama densa?" name="mamaDensa" options={opcionesMamaDensa} value={datos.mamaDensa} onChange={manejarCambio} />

                        
                        {/* --- Historial Reproductivo --- */}
                        <RadioGroup label="¿Tuvo hijos?" name="tuvoHijos" options={opcionesSiNo} value={datos.tuvoHijos} onChange={manejarCambio} />
                        {datos.tuvoHijos === 'Sí' && (
                            <CheckboxGroup 
                                label="Complicaciones en el embarazo/parto:" 
                                name="complicacionesEmbarazo" 
                                options={['Hipertensión Arterial Gestacional', 'Diabetes Gestacional', 'Pre-eclampsia', 'Parto Prematuro', 'Otro']} 
                                selectedValues={datos.complicacionesEmbarazo} 
                                onChange={manejarCambio} 
                            />
                        )}
                        
                        <RadioGroup label="¿Reproducción asistida (FIV, ICSI, etc.)?" name="reproduccionAsistida" options={opcionesSiNo} value={datos.reproduccionAsistida} onChange={manejarCambio} />
                        <RadioGroup label="¿Abortos recurrentes o Síndrome Antifosfolipídico (SAF)?" name="abortosSindromeAntifosfolipidico" options={opcionesSiNo} value={datos.abortosSindromeAntifosfolipidico} onChange={manejarCambio} />
                        
                        <RadioGroup label="Menstruación: ¿Tuvo la última hace más de 1 año?" name="menstruacionUltima" options={opcionesSiNo} value={datos.menstruacionUltima} onChange={manejarCambio} />
                        {datos.menstruacionUltima !== null && (
                            <CheckboxGroup 
                                label="Estado Menstrual actual:" 
                                name="menopausiaTipo" 
                                options={['Histerectomía', 'Menopausia Natural', 'Perimenopausia', 'Ciclos Normales', 'Anticonceptivos']} 
                                selectedValues={datos.menopausiaTipo} 
                                onChange={manejarCambio} 
                            />
                        )}
                        
                        <RadioGroup label="¿Padece de incontinencia o falta de orgasmos?" name="incontinenciaOrgasmos" options={opcionesSiNo} value={datos.incontinenciaOrgasmos} onChange={manejarCambio} />
                        {datos.incontinenciaOrgasmos === 'Sí' && (
                            <CheckboxGroup 
                                label="Tipo de problema funcional:" 
                                name="incontinenciaOrgasmosTipo" 
                                options={['Incontinencia Urinaria', 'Falta o Ausencia de Orgasmos']} 
                                selectedValues={datos.incontinenciaOrgasmosTipo} 
                                onChange={manejarCambio} 
                            />
                        )}
                    </div>

                    
                    {/* --- BOTONES DE ACCIÓN --- */}
                    <div className="mt-8 flex justify-end space-x-4">
                        <button 
                            type="button"
                            onClick={() => navigate('/estadisticas')}
                            className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
                        >
                            Cancelar y Volver
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-3 border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
            
            {/* Mensaje de éxito */}
            {mensajeExito && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-md shadow-md z-50">
                    {mensajeExito}
                </div>
            )}
        </div>
    );
}

export default EditarPaciente;