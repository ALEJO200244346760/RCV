import React, { useState } from 'react';
// ASUMO que estos archivos existen en tu proyecto y se mantienen igual.
import { calcularRiesgoCardiovascular } from './Calculadora';
import { obtenerColorRiesgo, obtenerTextoRiesgo } from './ConstFormulario';
import axiosInstance from '../axiosConfig';

// *************************************************************************
// ** ESTADO INICIAL COMPLETO Y ACTUALIZADO **
// *************************************************************************

const datosInicialesMujer = {
    // --- Datos de Entrega de Informe ---
    dni: '',
    fechaNacimiento: '',
    telefono: '',
    edad: '',
    mail: '',
    genero: 'femenino',

    // --- Historial y Hábitos ---
    infartoAcvTrombosis: null,
    infartoAcvTrombosisTipo: [],
    enfermedadRenalInsuficiencia: null,
    enfermedadRenalInsuficienciaTipo: [],
    tomaMedicacionDiario: null,
    medicacionCondiciones: [],
    fumaDiario: null,
    fumaTipo: [],
    consumoAlcoholRiesgo: null,
    actividadFisica: null,
    horasSueno: null,
    horasSuenoProblema: [],
    estresAngustiaCronica: null,
    estresTipo: [],
    enfermedadesAutoinmunes: null,
    autoinmunesTipo: [],
    hivHepatitis: null,

    // --- Historial Ginecológico ---
    tumoresMama: null,
    tumoresMamaTratamiento: [],
    familiarCancerMama: null,
    puncionMama: null,
    puncionMamaMotivo: [],
    mamaDensa: null,
    tuvoHijos: null,
    complicacionesEmbarazo: [],
    reproduccionAsistida: null,
    abortosSindromeAntifosfolipidico: null,
    menstruacionEdadRiesgo: null,
    menstruacionUltima: null,
    menopausiaTipo: [],
    incontinenciaOrgasmos: null,
    incontinenciaOrgasmosTipo: [],

    // --- Datos Antropométricos y Clínicos ---
    peso: '',
    talla: '',
    cintura: '',
    tensionSistolica: '',
    tensionDiastolica: '',
    colesterol: 'No', // Se mantiene por si se usa en la lógica de riesgo
};


// *************************************************************************
// ** COMPONENTES REUTILIZABLES (EXTERNALIZADOS) **
// *************************************************************************

const InputField = ({ label, name, type = 'text', placeholder, isRequired = false, min, max, value, onChange, readOnly = false, disabled = false }) => (
    <div>
        <label htmlFor={name} className={`block text-sm font-medium text-gray-700 ${isRequired ? 'after:content-[\'*\'] after:ml-0.5 after:text-red-500' : ''}`}>{label}</label>
        <input
            type={type}
            name={name}
            id={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            required={isRequired}
            min={min}
            max={max}
            readOnly={readOnly}
            disabled={disabled}
            className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
    </div>
);

const RadioGroup = ({ label, name, options = ['Sí', 'No'], conditionalContent, isRequired = false, value, onChange }) => (
    <div className="flex flex-col border p-3 rounded-lg bg-white shadow-sm">
        <label className={`block text-sm font-medium text-gray-700 ${isRequired ? 'after:content-[\'*\'] after:ml-0.5 after:text-red-500' : ''}`}>{label}</label>
        <div className="mt-1 flex flex-wrap gap-4">
            {options.map(opt => (
                <label key={opt} className="inline-flex items-center text-gray-700">
                    <input
                        type="radio"
                        name={name}
                        value={opt}
                        checked={value === opt}
                        onChange={() => onChange(name, opt)}
                        className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                    />
                    <span className="ml-2">{opt}</span>
                </label>
            ))}
        </div>
        {conditionalContent && value && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                {conditionalContent(value)}
            </div>
        )}
    </div>
);

const CheckboxGroup = ({ label, fieldName, options, isRequired = false, values, onChange }) => (
    <div className="flex flex-col">
        <label className={`block text-sm font-medium text-gray-700 ${isRequired ? 'after:content-[\'*\'] after:ml-0.5 after:text-red-500' : ''}`}>{label}</label>
        <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-2">
            {options.map(opt => (
                <label key={opt} className="inline-flex items-center text-gray-700">
                    <input
                        type="checkbox"
                        value={opt}
                        checked={Array.isArray(values) ? values.includes(opt) : false}
                        onChange={() => onChange(fieldName, opt)}
                        className="form-checkbox h-4 w-4 text-indigo-600 rounded"
                    />
                    <span className="ml-2 text-sm">{opt}</span>
                </label>
            ))}
        </div>
    </div>
);


// *************************************************************************
// ** COMPONENTE PRINCIPAL DEL FORMULARIO **
// *************************************************************************

const Formulario = () => {
    const [datosMujer, setDatosMujer] = useState(datosInicialesMujer);
    const [nivelRiesgo, setNivelRiesgo] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modalAdvertencia, setModalAdvertencia] = useState(null);

    // --- Lógica de Cálculo de Estado Derivado (SOLUCIÓN AL PROBLEMA) ---
    
    // 1. Cálculo de IMC (se ejecuta en cada render)
    const calcularIMC = (peso, tallaCm) => {
        const p = parseFloat(peso);
        const t = parseFloat(tallaCm);

        if (p > 0 && t > 0) {
            const tallaM = t / 100;
            const imcCalculado = p / (tallaM * tallaM);
            let clasificacion = '';
            if (imcCalculado < 18.5) clasificacion = 'Bajo peso';
            else if (imcCalculado < 25) clasificacion = 'Normopeso';
            else if (imcCalculado < 30) clasificacion = 'Sobrepeso';
            else if (imcCalculado < 35) clasificacion = 'Obesidad Grado I';
            else if (imcCalculado < 40) clasificacion = 'Obesidad Grado II';
            else clasificacion = 'Obesidad Grado III';
            return { valor: imcCalculado.toFixed(2), clasificacion };
        }
        return { valor: '', clasificacion: '' };
    };
    
    const imc = calcularIMC(datosMujer.peso, datosMujer.talla);

    // 2. Función para calcular la edad
    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return '';
        const dob = new Date(fechaNacimiento);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age >= 0 ? age.toString() : '';
    };

    // --- Manejadores de Estado Optimizados ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'fechaNacimiento') {
            const edadCalculada = calcularEdad(value);
            setDatosMujer(prev => ({ 
                ...prev, 
                [name]: value,
                edad: edadCalculada 
            }));
        } else {
            setDatosMujer(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleRadioToggle = (name, value) => {
        setDatosMujer(prev => {
            let newState = { ...prev, [name]: value };

            // Resetear campos condicionales si la respuesta es 'No' (o 'Sí' en el caso de sueño)
            // Se hace en UNA SOLA actualización de estado para mayor eficiencia.
            if (value === 'No') {
                switch (name) {
                    case 'infartoAcvTrombosis': newState.infartoAcvTrombosisTipo = []; break;
                    case 'enfermedadRenalInsuficiencia': newState.enfermedadRenalInsuficienciaTipo = []; break;
                    case 'tomaMedicacionDiario': newState.medicacionCondiciones = []; break;
                    case 'fumaDiario': newState.fumaTipo = []; break;
                    case 'estresAngustiaCronica': newState.estresTipo = []; break;
                    case 'enfermedadesAutoinmunes': newState.autoinmunesTipo = []; break;
                    case 'tumoresMama': newState.tumoresMamaTratamiento = []; break;
                    case 'puncionMama': newState.puncionMamaMotivo = []; break;
                    case 'tuvoHijos': newState.complicacionesEmbarazo = []; break;
                    case 'incontinenciaOrgasmos': newState.incontinenciaOrgasmosTipo = []; break;
                    case 'menstruacionUltima': newState.menopausiaTipo = []; break;
                    default: break;
                }
            } else if (value === 'Sí') {
                 switch (name) {
                    case 'horasSueno': newState.horasSuenoProblema = []; break;
                    case 'menstruacionUltima': newState.menopausiaTipo = []; break;
                    default: break;
                 }
            }
            return newState;
        });
    };

    const handleCheckboxChange = (field, value) => {
        setDatosMujer(prev => {
            const list = prev[field];
            const newList = list.includes(value)
                ? list.filter(item => item !== value)
                : [...list, value];
            return { ...prev, [field]: newList };
        });
    };

    // --- Lógica de Envío (sin cambios) ---
    const validarCampos = () => {
        if (!datosMujer.dni || !datosMujer.fechaNacimiento || !datosMujer.tensionSistolica || !datosMujer.peso || !datosMujer.talla) {
            setModalAdvertencia('Por favor, complete DNI, Fecha de Nacimiento, Peso, Talla y Tensión Sistólica (mínimo) para guardar y calcular el riesgo.');
            setMostrarModal(true);
            return false;
        }
        const edadNum = parseInt(datosMujer.edad, 10);
        if (isNaN(edadNum) || edadNum < 1) {
             setModalAdvertencia('La edad no es válida. Verifique la fecha de nacimiento.');
             setMostrarModal(true);
            return false;
        }
        return true;
    };
    
    const ajustarEdad = (edad) => {
        if (edad < 50) return 40;
        if (edad >= 50 && edad <= 59) return 50;
        if (edad >= 60 && edad <= 69) return 60;
        return 70;
    };

    const ajustarPresionArterial = (presion) => {
        if (presion < 140) return 120;
        if (presion >= 140 && presion <= 159) return 140;
        if (presion >= 160 && presion <= 179) return 160;
        return 180;
    };

    const calcularRiesgo = () => {
        if (!validarCampos()) {
            return;
        }

        const tieneRiesgoCritico = datosMujer.infartoAcvTrombosis === 'Sí' || datosMujer.enfermedadRenalInsuficiencia === 'Sí';
        if (tieneRiesgoCritico) {
            const riesgo = '>30% <40% Muy Alto';
            setNivelRiesgo(riesgo);
            setModalAdvertencia('Paciente con historial de infarto/ACV o enfermedad renal. Riesgo Cardiovascular es considerado **Muy Alto**.');
            setMostrarModal(true);
            return;
        }
        
        const edadAjustada = ajustarEdad(parseInt(datosMujer.edad, 10));
        const presionArterial = ajustarPresionArterial(parseInt(datosMujer.tensionSistolica, 10));
        const diabetes = datosMujer.medicacionCondiciones.includes('Diabetes') ? 'si' : 'no'; 
        const fuma = datosMujer.fumaDiario === 'Sí' ? 'si' : 'no';
        const colesterolParaCalculo = "No"; 

        const riesgoCalculado = calcularRiesgoCardiovascular(
            edadAjustada, 'femenino', diabetes, fuma, presionArterial, colesterolParaCalculo
        );
        setNivelRiesgo(riesgoCalculado);
        setModalAdvertencia(null);
        setMostrarModal(true);
    };
    
    const guardarPaciente = async () => {
        try {
            if (!validarCampos()) {
                 setMostrarModal(false); 
                 return;
            }
            
            let datosParaEnviar = { ...datosMujer };
            const hoy = new Date();
            datosParaEnviar.fechaRegistro = hoy.toISOString().split('T')[0];

            const camposArray = [
                'infartoAcvTrombosisTipo', 'enfermedadRenalInsuficienciaTipo', 'medicacionCondiciones', 
                'fumaTipo', 'horasSuenoProblema', 'estresTipo', 'autoinmunesTipo', 
                'tumoresMamaTratamiento', 'puncionMamaMotivo', 'complicacionesEmbarazo', 
                'menopausiaTipo', 'incontinenciaOrgasmosTipo'
            ];
            
            camposArray.forEach(campo => {
                if (Array.isArray(datosParaEnviar[campo])) {
                    datosParaEnviar[campo] = datosParaEnviar[campo].join(', ');
                }
            });

            Object.keys(datosParaEnviar).forEach(key => {
                if (datosParaEnviar[key] === null) {
                    datosParaEnviar[key] = '';
                }
            });

            const payload = {
                ...datosParaEnviar,
                imc: `${imc.valor} (${imc.clasificacion})`,
                nivelRiesgo: nivelRiesgo,
            };
            
            delete payload.colesterol;
            
            await axiosInstance.post('/api/pacientes', payload);
            setMensajeExito('Paciente guardado con éxito');
            setMostrarModal(false);
            setTimeout(() => setMensajeExito(''), 3000);
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error('Error al guardar los datos:', error);
            setModalAdvertencia('Ocurrió un error al guardar los datos. Revise la consola para más detalles.');
            setMostrarModal(true);
        }
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setModalAdvertencia(null);
    };

    return (
        <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-2xl w-full">
                <h1 className="text-3xl font-extrabold text-indigo-700 mb-6 border-b pb-2">
                    Formulario de Salud Femenina y Riesgo Cardiovascular
                </h1>

                {mensajeExito && <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-md shadow-lg z-50">{mensajeExito}</div>}
                
                <form className="w-full space-y-10" onSubmit={(e) => { e.preventDefault(); calcularRiesgo(); }}>

                    {/* --- SECCIÓN 1: HISTORIAL Y HÁBITOS --- */}
                    <div className="space-y-6 p-4 border border-indigo-200 rounded-lg bg-indigo-50">
                        <h2 className="text-xl font-bold text-indigo-800 border-b pb-1">1. Historial y Hábitos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <RadioGroup 
                                label="¿Alguna vez ha tenido un infarto, un ACV o Trombosis arterial?" 
                                name="infartoAcvTrombosis" 
                                value={datosMujer.infartoAcvTrombosis}
                                onChange={handleRadioToggle}
                                conditionalContent={(respuesta) => respuesta === 'Sí' && (
                                    <CheckboxGroup 
                                        label="Seleccione el antecedente:" 
                                        fieldName="infartoAcvTrombosisTipo" 
                                        options={['infarto', 'ACV', 'Trombosis arterial']} 
                                        values={datosMujer.infartoAcvTrombosisTipo}
                                        onChange={handleCheckboxChange}
                                    />
                                )}
                            />
                            
                            <RadioGroup 
                                label="¿Tiene enfermedad Renal Crónica o Insuficiencia Cardíaca?" 
                                name="enfermedadRenalInsuficiencia" 
                                value={datosMujer.enfermedadRenalInsuficiencia}
                                onChange={handleRadioToggle}
                                conditionalContent={(respuesta) => respuesta === 'Sí' && (
                                    <CheckboxGroup 
                                        label="Seleccione la condición:" 
                                        fieldName="enfermedadRenalInsuficienciaTipo" 
                                        options={['enfermedad renal', 'insuficiencia cardíaca']}
                                        values={datosMujer.enfermedadRenalInsuficienciaTipo}
                                        onChange={handleCheckboxChange}
                                    />
                                )}
                            />
                            
                            {/* ... Repetir el patrón para todos los RadioGroup y CheckboxGroup ... */}
                            
                            <RadioGroup 
                                label="¿Toma medicación a diario?" 
                                name="tomaMedicacionDiario" 
                                value={datosMujer.tomaMedicacionDiario}
                                onChange={handleRadioToggle}
                                conditionalContent={(respuesta) => respuesta === 'Sí' && (
                                    <CheckboxGroup 
                                        label="¿Para qué condición?" 
                                        fieldName="medicacionCondiciones" 
                                        options={['Hipertensión arterial', 'Diabetes', 'Colesterol', 'Otras']} 
                                        values={datosMujer.medicacionCondiciones}
                                        onChange={handleCheckboxChange}
                                    />
                                )}
                            />
                            
                            <RadioGroup 
                                label="¿Fuma a diario?" 
                                name="fumaDiario" 
                                value={datosMujer.fumaDiario}
                                onChange={handleRadioToggle}
                                conditionalContent={(respuesta) => respuesta === 'Sí' && (
                                    <CheckboxGroup 
                                        label="¿Qué fuma?" 
                                        fieldName="fumaTipo" 
                                        options={['tabaco', 'otros']}
                                        values={datosMujer.fumaTipo}
                                        onChange={handleCheckboxChange}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* ... Continúa el resto del JSX del formulario ... */}
                    {/* Asegúrate de pasar las props 'value', 'values' y 'onChange' a todos los componentes reutilizables */}
                    {/* Por brevedad, no repetiré todas las secciones, pero el patrón es el mismo */}


                    {/* --- SECCIÓN 3: DATOS ANTROPOMÉTRICOS Y CLÍNICOS --- */}
                    <div className="space-y-6 p-4 border border-green-200 rounded-lg bg-green-50">
                        <h2 className="text-xl font-bold text-green-800 border-b pb-1">3. Datos Antropométricos y Clínicos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputField label="Peso (kg)" name="peso" type="number" min="1" placeholder="Ej: 75.5" isRequired={true} value={datosMujer.peso} onChange={handleChange} />
                            <InputField label="Talla (cm)" name="talla" type="number" min="1" placeholder="Ej: 170" isRequired={true} value={datosMujer.talla} onChange={handleChange}/>
                            <InputField label="Cintura (cm)" name="cintura" type="number" min="1" placeholder="Ej: 90" value={datosMujer.cintura} onChange={handleChange} />
                            <InputField label="Tensión Sistólica (mm Hg)" name="tensionSistolica" type="number" min="60" max="300" placeholder="Ej: 120" isRequired={true} value={datosMujer.tensionSistolica} onChange={handleChange}/>
                            <InputField label="Tensión Diastólica (mm Hg)" name="tensionDiastolica" type="number" min="40" max="200" placeholder="Ej: 80" value={datosMujer.tensionDiastolica} onChange={handleChange}/>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-white shadow-sm mt-6">
                            <div>
                                <h3 className="text-md font-semibold text-gray-700">Índice de Masa Corporal (IMC)</h3>
                                <p className="text-lg font-bold text-indigo-600 mt-1">{imc.valor ? `${imc.valor} (${imc.clasificacion})` : 'Ingrese Peso y Talla...'}</p>
                            </div>
                            <div>
                                <h3 className="text-md font-semibold text-gray-700">Nivel de Riesgo Cardiovascular</h3>
                                <div className={`p-2 mt-1 font-bold text-sm rounded-lg ${obtenerColorRiesgo(nivelRiesgo)}`}>
                                    {nivelRiesgo || 'Presione "Calcular Riesgo"'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- SECCIÓN 4: ENTREGA DE INFORME --- */}
                    <div className="space-y-6 p-4 border border-gray-300 rounded-lg bg-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-1">4. Datos de Entrega de Informe</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label="DNI" name="dni" type="text" placeholder="Número de DNI" isRequired={true} value={datosMujer.dni} onChange={handleChange}/>
                            <InputField label="Fecha de Nacimiento" name="fechaNacimiento" type="date" isRequired={true} value={datosMujer.fechaNacimiento} onChange={handleChange}/>
                            <InputField label="Edad (Automática)" name="edad" type="text" isRequired={true} placeholder="Calculada automáticamente" value={datosMujer.edad} readOnly disabled />
                            <InputField label="TELÉFONO" name="telefono" type="tel" placeholder="Nro. de contacto" value={datosMujer.telefono} onChange={handleChange}/>
                            <InputField label="MAIL" name="mail" type="email" placeholder="Correo electrónico" value={datosMujer.mail} onChange={handleChange}/>
                        </div>
                    </div>
                    
                    {/* --- BOTONES DE ACCIÓN --- */}
                    <div className="mt-8 flex justify-end space-x-4">
                        <button 
                            type="submit"
                            className="px-6 py-3 border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                        >
                            Calcular Riesgo (Paso 1)
                        </button>
                    </div>
                </form>

            </div>
            
            {/* --- MODAL DE RIESGO Y GUARDADO --- */}
            {mostrarModal && nivelRiesgo && !modalAdvertencia && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-md shadow-2xl w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-4 text-indigo-700">Resultado del Cálculo de Riesgo</h2>
                        <div className={`p-4 rounded-lg text-center ${obtenerColorRiesgo(nivelRiesgo)}`}>
                            <h3 className="text-xl font-bold">Riesgo Calculado: {nivelRiesgo}</h3>
                            <p className="text-sm mt-1">{obtenerTextoRiesgo(nivelRiesgo)}</p>
                        </div>
                        
                        <div className="my-4 border-t pt-4">
                            <h3 className="font-semibold text-gray-700 mb-2">Resumen</h3>
                            <p><strong>IMC:</strong> {imc.valor} ({imc.clasificacion})</p>
                            <p><strong>Edad:</strong> {datosMujer.edad} años</p>
                        </div>

                        <div className="mt-6 flex flex-col md:flex-row gap-3">
                            <button onClick={guardarPaciente} className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700">
                                Guardar Paciente
                            </button>
                            <button onClick={cerrarModal} className="w-full py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal Advertencia */}
            {mostrarModal && modalAdvertencia && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-md shadow-lg w-11/12 max-w-lg">
                        <h2 className="text-lg font-semibold mb-4 text-red-600">Aviso</h2>
                        <p dangerouslySetInnerHTML={{ __html: modalAdvertencia }}></p>
                        <button onClick={cerrarModal} className="mt-4 py-2 px-4 bg-gray-500 text-white rounded-md w-full">Entendido</button>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default Formulario;