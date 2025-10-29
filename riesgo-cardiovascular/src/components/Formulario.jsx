import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calcularRiesgoCardiovascular } from './Calculadora';
import { obtenerColorRiesgo, obtenerTextoRiesgo } from './ConstFormulario';
import axiosInstance from '../axiosConfig';

// *************************************************************************
// ** MAPA DE DEVOLUCIONES (Sin cambios) **
// *************************************************************************

const feedbackMessages = {
    infartoAcvTrombosis: {
        pregunta: '¿Alguna vez ha tenido un infarto un ACV o Trombosis arterial?',
        si: 'Tener un infarto un ACV o una trombosis arterial es una condición de alto riesgo por lo que se debe ser muy cuidadoso con la salud integral, el control de la Hipertensión arterial, el colesterol, los tóxicos, su peso, además de priorizar una alimentación, medicación y ejercicios prescriptos por profesionales de la salud.',
        no: null,
    },
    enfermedadRenalInsuficiencia: {
        pregunta: '¿Tiene enfermedad Renal Crónica o Insuficiencia Cardíaca?',
        si: 'Tener enfermedad renal crónica o insuficiencia cardíaca es una condición de alto riesgo por lo que se debe ser muy cuidadoso con la salud integral, el control de la Hipertensión arterial, el colesterol, los toxicos, su peso, además de priorizar una alimentación, medicación y ejercicios prescriptos por profesionales de la salud.',
        no: null,
    },
    tomaMedicacionDiario: {
        pregunta: '¿Toma medicación a diario?',
        si: 'Tener hipertensión hace que el corazón trabaje más y con el tiempo genera daño en todos sus órganos. No tiene cura, pero sí tratamiento. No tiene síntomas, pero con un buen control puede hacer vida normal siguiendo la medicación, los alimentos y ejercicios adecuados prescriptos por profesionales de la salud.',
        no: null,
    },
    fumaDiario: {
        pregunta: '¿Fuma a diario?',
        si: 'Fumar aumenta la formación de trombosis o coágulos que tapan las arterias. Considera usar parches, geles o chicles de nicotina más un plan de apoyo conductual para la ansiedad. Busca ayuda grupal y profesional hasta que lo consigas!',
        no: null,
    },
    actividadFisica: {
        pregunta: '¿Realiza actividad física 150 minutos semanales?',
        si: null,
        no: 'El sedentarismo debilita todo el sistema muscular y promueve múltiples enfermedades crónicas. Intenta moverte como puedas, con una actividad que disfrutes genuinamente como bailar, caminar, subir escaleras. Puedes iniciar con sesiones cortas para construir un habito todos los días y si puedes incorpora fuerza, elongación y equilibrio.',
    },
    horasSueno: {
        pregunta: '¿Duerme entre 6 y 8 horas diarias?',
        si: null, 
        no: 'Dormir mal aumenta el riesgo de hipertensión estrés y deterioro progresivo de la salud. Incorpora rutinas libres de pantallas, ruidos, cafeína, tóxicos y alimentos. Si el problema persiste busca ayuda profesional.',
    },
    estresAngustiaCronica: {
        pregunta: '¿Siente que presenta estrés, angustia, ansiedad o depresión en forma permanente o Crónica?',
        si: 'Presentar emociones negativas en forma constante aumentan el nivel de sustancias perjudiciales que afectan el equilibrio del cuerpo, aumentando el riesgo de enfermedades del corazón. Utiliza herramientas compensadoras y si persisten busca ayuda profesional.',
        no: null,
    },
    enfermedadesAutoinmunes: {
        pregunta: '¿Le dijeron alguna vez que tiene alguna enfermedad autoinmune?',
        si: 'Tener enfermedades inflamatorias crónicas que además requieren tratamientos agresivos para el cuerpo, genera daño en los vasos sanguíneos y aumenta el riesgo de enfermedad cardiovascular. Tener un buen control de la enfermedad y de la salud integral, reducen la carga inflamatoria mejorando el perfil de riesgo global.',
        no: null,
    },
    hivHepatitis: {
        pregunta: '¿Presenta HIV o Hepatitis B/C?',
        si: 'Tener VIH o Hepatitis B/C causan inflamación crónica que daña rápidamente los vasos sanguíneos, acelerando la aterosclerosis. El VIH se agrava por efectos de medicación en aumentar los lípidos. Ambas condiciones elevan el riesgo de infarto y ACV, requiriendo un control riguroso de la presión y el colesterol.',
        no: null,
    },
    // Ginecológico
    tumoresMama: {
        pregunta: '¿Presenta antecedentes de tumores de mama?',
        si: 'Haber recibido radioterapia o quimioterapia produce un daño directo sobre el endotelio de los vasos sanguíneos y el corazón por lo que aumenta el riesgo de enfermedad coronaria. Es de vital importancia realizar medidas preventivas de factores de riesgo y control regular del sistema cardiovascular, aunque hayan pasado varios años.',
        no: null,
    },
    familiarCancerMama: {
        pregunta: '¿Tiene algún familiar con cáncer de mama?',
        si: 'El cáncer de mama puede afectar el sistema cardiovascular debido a la cardiotoxicidad de tratamientos como quimioterapia y radioterapia. Estos tratamientos pueden causar daños en el corazón y los vasos sanguíneos, aumentando el riesgo de problemas cardíacos a largo plazo. Es crucial un seguimiento cardiológico para las sobrevivientes.',
        no: null,
    },
    puncionMama: {
        pregunta: '¿Alguna vez le hicieron alguna punción de mama?',
    },
    mamaDensa: {
        pregunta: '¿Le dijeron si tenía mama densa al ver su mamografía?',
    },
    tuvoHijos: {
        pregunta: '¿Tuvo hijos?',
        si: 'Los trastornos hipertensivos y diabetes gestacional inducen una *memoria inflamatoria* y daño endotelial persistente en la madre. Esto programa una mayor susceptibilidad a la hipertensión y aterosclerosis, elevando significativamente su riesgo cardiovascular futuro.',
        no: null,
    },
    reproduccionAsistida: {
        pregunta: '¿Utilizó reproducción asistida?',
        si: 'La reproducción asistida se asocia a un riesgo ligeramente mayor de eventos cardiovasculares durante el embarazo, posiblemente por el estrés del tratamiento o el riesgo de embarazos múltiples.',
        no: null,
    },
    menstruacionUltima: {
        pregunta: '¿Su última menstruación fue hace más de un año?',
        si: 'La menopausia y la histerectomía, incrementan el riesgo cardiovascular al reducir los estrógenos. Esto provoca un aumento del colesterol malo, disfunción endotelial y cambios metabólicos, como la acumulación de grasa abdominal, aumentando la probabilidad de hipertensión y de diabetes.',
        no: null, 
    },
    // Antropométricos
    cintura: {
        pregunta: 'Cintura (cm)',
        mensajeMayor: 'Tener más de 88 cm de cintura se asocia al aumento de probabilidades de diabetes por lo que se sugiere comer saludable y hacer actividad física regular.',
        mensajeMenor: 'Tener una cintura menor de 88 cm es importante porque indica que tienes poca grasa almacenada alrededor de tus órganos internos. Esta grasa interna, llamada visceral, es peligrosa porque libera sustancias que causan inflamación y aumentan tu riesgo de problemas graves como diabetes, colesterol, hipertensión y enfermedades cardiovasculares.',
    },
};

// *************************************************************************
// ** COMPONENTE DE DEVOLUCIÓN (MODIFICADO CON BOTONES DE ACCIÓN) **
// *************************************************************************
const ReporteDevolucion = ({ datos }) => {
    
    // Helper (Sin cambios)
    const ReporteItem = ({ pregunta, respuesta, subOpciones, mensaje }) => {
        // La lógica de .join() aquí AHORA ES SEGURA porque le pasaremos un array
        const colorRespuesta = respuesta === 'Sí' ? 'text-red-600' : 'text-green-700';
        return (
            <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                <h4 className="font-semibold text-gray-800">{pregunta}</h4>
                <p className="mt-1">
                    <span className={`font-bold ${colorRespuesta}`}>{respuesta || 'No aplica'}</span>
                    {subOpciones && subOpciones.length > 0 && (
                        <span className="text-sm text-gray-600 italic ml-2">({subOpciones.join(', ')})</span>
                    )}
                </p>
                {mensaje && (
                    <p className="mt-2 text-sm text-gray-700 bg-yellow-50 border border-yellow-200 p-2 rounded-md">
                        {mensaje}
                    </p>
                )}
            </div>
        );
    };

    // Función para obtener el mensaje (MODIFICADA PARA ARREGLAR EL BUG)
    const obtenerFeedback = (key) => {
        const respuesta = datos[key]; // 'Sí' o 'No'
        const data = feedbackMessages[key];
        
        if (!data) return null;
        
        let mensaje = null;
        if (respuesta === 'Sí' && data.si) {
            mensaje = data.si;
        } else if (respuesta === 'No' && data.no) {
            mensaje = data.no;
        }

        // --- INICIO DE CORRECCIÓN DE BUG ---
        // 'datos' es el payload final, donde las sub-opciones son strings (ej: "Insomnio")
        // Necesitamos convertirlos de nuevo a arrays (ej: ["Insomnio"]) para que .join() funcione.
        
        let subOpcionesRaw = null; 
        const tipoKey = `${key}Tipo`; // ej: infartoAcvTrombosisTipo

        if (key === 'tomaMedicacionDiario') subOpcionesRaw = datos.medicacionCondiciones;
        else if (key === 'horasSueno') subOpcionesRaw = datos.horasSuenoProblema;
        else if (key === 'tuvoHijos') subOpcionesRaw = datos.complicacionesEmbarazo;
        else if (key === 'menstruacionUltima') subOpcionesRaw = datos.menopausiaTipo;
        else if (key === 'estresAngustiaCronica') subOpcionesRaw = datos.estresTipo;
        else if (key === 'enfermedadesAutoinmunes') subOpcionesRaw = datos.autoinmunesTipo;
        else if (key === 'tumoresMama') subOpcionesRaw = datos.tumoresMamaTratamiento;
        else if (key === 'puncionMama') subOpcionesRaw = datos.puncionMamaMotivo;
        else if (key === 'fumaDiario') subOpcionesRaw = datos.fumaTipo;
        else if (key === 'infartoAcvTrombosis') subOpcionesRaw = datos.infartoAcvTrombosisTipo;
        else if (key === 'enfermedadRenalInsuficiencia') subOpcionesRaw = datos.enfermedadRenalInsuficienciaTipo;
        
        // Convertir el string (ej: "Insomnio, otros") en un array (ej: ["Insomnio", "otros"])
        let subOpcionesArray = [];
        if (typeof subOpcionesRaw === 'string' && subOpcionesRaw.length > 0) {
            subOpcionesArray = subOpcionesRaw.split(', ');
        } else if (Array.isArray(subOpcionesRaw)) {
            // Fallback por si acaso, aunque 'datos' debería tener strings
            subOpcionesArray = subOpcionesRaw;
        }
        // --- FIN DE CORRECCIÓN DE BUG ---

        return (
            <ReporteItem 
                pregunta={data.pregunta}
                respuesta={respuesta}
                subOpciones={subOpcionesArray} // Pasamos el array corregido
                mensaje={mensaje}
            />
        );
    };
    
    // Feedback especial para Cintura (Sin cambios)
    const feedbackCintura = () => {
    const valorCintura = parseFloat(datos.cintura);
    let mensaje = null;

    if (isNaN(valorCintura)) {
        mensaje = 'Por favor ingrese un valor válido de cintura.';
    } else if (valorCintura > 88) {
        mensaje = feedbackMessages.cintura.mensajeMayor;
    } else {
        mensaje = feedbackMessages.cintura.mensajeMenor;
    }

    return mensaje;
    };

    // --- INICIO DE CÓDIGO AÑADIDO: MANEJADORES DE ACCIÓN ---
    const handlePrint = () => {
        window.print(); // Dispara la impresión del navegador (permite "Guardar como PDF")
    };

    const handleEmail = () => {
        if (datos.mail) {
            // Abre el cliente de email del usuario
            window.location.href = `mailto:${datos.mail}?subject=Resultados de su Informe de Salud Cardiovascular`;
        } else {
            alert('El paciente no tiene un email cargado.');
        }
    };
    
    const handleWhatsApp = () => {
         if (datos.telefono) {
            // Elimina espacios o símbolos comunes y asume un prefijo de país si no está
            // NOTA: Esto es básico. Un número de teléfono internacional real (ej: +549...) 
            // es necesario para que wa.me funcione de forma fiable.
            const telefonoLimpio = datos.telefono.replace(/[\s-()]/g, '');
            window.open(`https://wa.me/${telefonoLimpio}`, '_blank');
        } else {
            alert('El paciente no tiene un teléfono cargado.');
        }
    };
    // --- FIN DE CÓDIGO AÑADIDO ---


    // Render del Reporte
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-2xl w-full">
            <h1 className="text-3xl font-extrabold text-indigo-700 mb-4 border-b pb-2">
                Devolución de Informe
            </h1>
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <h2 className="text-xl font-bold text-gray-800">Paciente</h2>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <p><strong>DNI:</strong> {datos.dni}</p>
                    <p><strong>Edad:</strong> {datos.edad} años</p>
                    <p><strong>Riesgo:</strong> <span className={`font-bold ${obtenerColorRiesgo(datos.nivelRiesgo)} p-1 rounded`}>{datos.nivelRiesgo}</span></p>
                    <p><strong>IMC:</strong> {datos.imc}</p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-indigo-800">Resumen de Respuestas y Recomendaciones</h3>
                
                {/* Historial y Hábitos */}
                {obtenerFeedback('infartoAcvTrombosis')}
                {obtenerFeedback('enfermedadRenalInsuficiencia')}
                {obtenerFeedback('tomaMedicacionDiario')}
                {obtenerFeedback('fumaDiario')}
                {obtenerFeedback('actividadFisica')}
                {obtenerFeedback('horasSueno')}
                {obtenerFeedback('estresAngustiaCronica')}
                {obtenerFeedback('enfermedadesAutoinmunes')}
                {obtenerFeedback('hivHepatitis')}

                {/* Historial Ginecológico */}
                <h3 className="text-lg font-semibold text-pink-800 pt-4">Historial Ginecológico</h3>
                {obtenerFeedback('tumoresMama')}
                {obtenerFeedback('familiarCancerMama')}
                {obtenerFeedback('puncionMama')}
                {obtenerFeedback('mamaDensa')}
                {obtenerFeedback('tuvoHijos')}
                {obtenerFeedback('reproduccionAsistida')}
                {obtenerFeedback('menstruacionUltima')}
                
                {/* Datos Antropométricos */}
                <h3 className="text-lg font-semibold text-green-800 pt-4">Datos Antropométricos</h3>
                {feedbackCintura()}
            </div>

            {/* --- SECCIÓN DE BOTONES MODIFICADA --- */}
            <div className="mt-8 flex flex-wrap justify-end gap-3 print:hidden"> {/* Clase print:hidden para ocultar al imprimir */}
                
                {/* Botones Añadidos */}
                <button
                    onClick={handlePrint}
                    className="px-6 py-3 rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700"
                >
                    Imprimir / Guardar PDF
                </button>
                
                {/* Botón original */}
                <button
                    onClick={() => navigate('/final')}
                    className="px-6 py-3 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                    Terminar revisión
                </button>
            </div>
            {/* --- FIN DE SECCIÓN DE BOTONES --- */}
        </div>
    );
};


// *************************************************************************
// ** ESTADO INICIAL (MODIFICADO CON "aceptaCondiciones") **
// *************************************************************************

const datosInicialesMujer = {
    // --- Datos de Entrega de Informe ---
    dni: '',
    fechaNacimiento: '',
    telefono: '',
    edad: '',
    mail: '',
    genero: 'femenino',
    aceptaCondiciones: false, // <-- AÑADIDO

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

    // --- Datos Antropométricos y Clínicos ---
    peso: '',
    talla: '',
    cintura: '',
    tensionSistolica: '',
    tensionDiastolica: '',
    colesterol: 'No', 
};


// *************************************************************************
// ** COMPONENTES REUTILIZABLES (Sin cambios) **
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
        <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
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
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modalAdvertencia, setModalAdvertencia] = useState(null);
    const [reporteGenerado, setReporteGenerado] = useState(null); 

    // --- Lógica de Cálculo de Estado Derivado (Sin cambios) ---
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

    // --- Manejadores de Estado (MODIFICADO CON "handleSimpleCheckbox") ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'fechaNacimiento') {
            const edadCalculada = calcularEdad(value);
            setDatosMujer(prev => ({ ...prev, [name]: value, edad: edadCalculada }));
        } else {
            setDatosMujer(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleRadioToggle = (name, value) => {
        setDatosMujer(prev => {
            let newState = { ...prev, [name]: value };
            // Limpiar sub-opciones si se marca "No"
            if (value === 'No' || (value === 'Sí' && (name === 'horasSueno' || name === 'menstruacionUltima'))) {
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
                    case 'menstruacionUltima': newState.menopausiaTipo = []; break;
                    case 'horasSueno': newState.horasSuenoProblema = []; break;
                    default: break;
                }
            }
            return newState;
        });
    };

    const handleCheckboxChange = (field, value) => {
        setDatosMujer(prev => {
            const list = prev[field];
            const newList = list.includes(value) ? list.filter(item => item !== value) : [...list, value];
            return { ...prev, [field]: newList };
        });
    };

    // --- INICIO DE CÓDIGO AÑADIDO: Manejador para el checkbox simple ---
    const handleSimpleCheckbox = (e) => {
        const { name, checked } = e.target;
        setDatosMujer(prev => ({ ...prev, [name]: checked }));
    };
    // --- FIN DE CÓDIGO AÑADIDO ---


    // --- Lógica de Envío (MODIFICADA CON VALIDACIÓN DE "aceptaCondiciones") ---
    const validarCampos = () => {
        if (!datosMujer.dni || !datosMujer.fechaNacimiento || !datosMujer.tensionSistolica || !datosMujer.peso || !datosMujer.talla) {
            setNivelRiesgo(null); // Limpiar riesgo si la validación falla
            setModalAdvertencia('Por favor, complete DNI, Fecha de Nacimiento, Peso, Talla y Tensión Sistólica para calcular el riesgo.');
            setMostrarModal(true);
            return false;
        }

        // --- INICIO DE CÓDIGO AÑADIDO: Validación de condiciones ---
        if (!datosMujer.aceptaCondiciones) {
            setNivelRiesgo(null);
            setModalAdvertencia('Debe aceptar las condiciones de uso de datos para poder continuar.');
            setMostrarModal(true);
            return false;
        }
        // --- FIN DE CÓDIGO AÑADIDO ---

        const edadNum = parseInt(datosMujer.edad, 10);
        if (isNaN(edadNum) || edadNum < 1) {
            setNivelRiesgo(null);
            setModalAdvertencia('La edad no es válida. Verifique la fecha de nacimiento.');
            setMostrarModal(true);
            return false;
        }
        return true;
    };
    
    // Funciones de ajuste (Sin cambios)
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

    // --- calcularRiesgo (MODIFICADO POR REGLA DE DIABETES) ---
    const calcularRiesgo = () => {
        if (!validarCampos()) return;
        
        const tieneRiesgoCritico = datosMujer.infartoAcvTrombosis === 'Sí' || datosMujer.enfermedadRenalInsuficiencia === 'Sí';
        if (tieneRiesgoCritico) {
            setNivelRiesgo('>30% <40% Muy Alto');
            setModalAdvertencia('Paciente con historial de infarto/ACV o enfermedad renal. Riesgo Cardiovascular es considerado <strong>Muy Alto</strong>.');
            setMostrarModal(true);
            return;
        }
        
        const edadAjustada = ajustarEdad(parseInt(datosMujer.edad, 10));
        const presionArterial = ajustarPresionArterial(parseInt(datosMujer.tensionSistolica, 10));
        const diabetes = datosMujer.medicacionCondiciones.includes('Diabetes') ? 'si' : 'no';
        const fuma = datosMujer.fumaDiario === 'Sí' ? 'si' : 'no';
        const colesterolParaCalculo = "No"; // Asumido de tu lógica anterior

        // Se usa 'let' para poder modificarlo
        let riesgoCalculado = calcularRiesgoCardiovascular(
            edadAjustada, 'femenino', diabetes, fuma, presionArterial, colesterolParaCalculo
        );

        // --- INICIO DE REGLA DE DIABETES ---
        // Si tiene diabetes, el riesgo NUNCA puede ser 'Bajo'.
        // Asumo que los strings de riesgo son '<10% Bajo' y '10-20% Moderado'
        if (diabetes === 'si' && riesgoCalculado === '<10% Bajo') {
            riesgoCalculado = '>10% <20% Moderado'; // Forzar a Moderado
        }
        // --- FIN DE REGLA DE DIABETES ---

        setNivelRiesgo(riesgoCalculado);
        setModalAdvertencia(null);
        setMostrarModal(true);
    };
    
    // --- guardarPaciente (Sin cambios) ---
    const guardarPaciente = async () => {
        if (!validarCampos()) return;
        try {
            let datosParaEnviar = { ...datosMujer };
            datosParaEnviar.fechaRegistro = new Date().toISOString().split('T')[0];

            // Lista de campos que son arrays y necesitan unirse
            const camposArray = [
                'infartoAcvTrombosisTipo', 'enfermedadRenalInsuficienciaTipo', 'medicacionCondiciones', 
                'fumaTipo', 'horasSuenoProblema', 'estresTipo', 'autoinmunesTipo', 
                'tumoresMamaTratamiento', 'puncionMamaMotivo', 'complicacionesEmbarazo', 
                'menopausiaTipo' 
            ];
            camposArray.forEach(campo => {
                if (Array.isArray(datosParaEnviar[campo])) {
                    datosParaEnviar[campo] = datosParaEnviar[campo].join(', ');
                }
            });
            // Limpiar valores nulos
            Object.keys(datosParaEnviar).forEach(key => {
                if (datosParaEnviar[key] === null) datosParaEnviar[key] = '';
            });

            // Payload final para la API
            const payload = {
                ...datosParaEnviar,
                imc: `${imc.valor} (${imc.clasificacion})`,
                nivelRiesgo: nivelRiesgo,
            };
            delete payload.colesterol; // No se envía 'colesterol'
            delete payload.aceptaCondiciones; // No es necesario guardar esto en la BD (o sí, según tu lógica de negocio)
            
            await axiosInstance.post('/api/pacientes', payload);

            // Mostrar el reporte
            setMostrarModal(false);
            setReporteGenerado(payload); // 'payload' tiene los datos para el reporte
            
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

    // --- RENDER PRINCIPAL (MODIFICADO TEXTO DE ACTIVIDAD FÍSICA) ---
    return (
        <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen font-sans">
            
            {reporteGenerado ? (
                // --- VISTA DE REPORTE ---
                <ReporteDevolucion datos={reporteGenerado} />
            ) : (
                // --- VISTA DE FORMULARIO ---
                <>
                    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-2xl w-full">
                        <h1 className="text-3xl font-extrabold text-indigo-700 mb-6 border-b pb-2">
                            Formulario de Salud Femenina y Riesgo Cardiovascular
                        </h1>
                        
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

                                    <RadioGroup label="¿Toma más de 5 vasos de cerveza, o más de 3 copas de vino semanales?" name="consumoAlcoholRiesgo" value={datosMujer.consumoAlcoholRiesgo} onChange={handleRadioToggle}/>
                                    
                                    {/* --- TEXTO CORREGIDO --- */}
                                    <RadioGroup label="¿Realiza actividad física 150 minutos semanales?" name="actividadFisica" value={datosMujer.actividadFisica} onChange={handleRadioToggle}/>
                                    
                                    <RadioGroup 
                                        label="¿Duerme entre 6 y 8 horas diarias?" 
                                        name="horasSueno" 
                                        value={datosMujer.horasSueno}
                                        onChange={handleRadioToggle}
                                        conditionalContent={(respuesta) => respuesta === 'No' && (
                                            <CheckboxGroup 
                                                label="¿Qué problema presenta?" 
                                                fieldName="horasSuenoProblema" 
                                                options={['Insomnio', 'otros']}
                                                values={datosMujer.horasSuenoProblema}
                                                onChange={handleCheckboxChange}
                                            />
                                        )}
                                    />
                                    
                                    <RadioGroup 
                                        label="¿Siente que presenta estrés, angustia, ansiedad o depresión en forma permanente o Crónica?" 
                                        name="estresAngustiaCronica" 
                                        value={datosMujer.estresAngustiaCronica}
                                        onChange={handleRadioToggle}
                                        conditionalContent={(respuesta) => respuesta === 'Sí' && (
                                            <CheckboxGroup 
                                                label="Seleccione el problema:" 
                                                fieldName="estresTipo" 
                                                options={['estrés', 'angustia', 'ansiedad', 'depresión']} 
                                                values={datosMujer.estresTipo}
                                                onChange={handleCheckboxChange}
                                            />
                                        )}
                                    />
                                    
                                    <RadioGroup 
                                        label="¿Le dijeron alguna vez que tiene alguna enfermedad autoinmune?" 
                                        name="enfermedadesAutoinmunes" 
                                        value={datosMujer.enfermedadesAutoinmunes}
                                        onChange={handleRadioToggle}
                                        conditionalContent={(respuesta) => respuesta === 'Sí' && (
                                            <CheckboxGroup 
                                                label="Seleccione la enfermedad:" 
                                                fieldName="autoinmunesTipo" 
                                                options={['lupus', 'artritis reumatoidea', 'psoriasis', 'otra']} 
                                                values={datosMujer.autoinmunesTipo}
                                                onChange={handleCheckboxChange}
                                            />
                                        )}
                                    />
                                    
                                    <RadioGroup label="¿Presenta HIV o Hepatitis B/C?" name="hivHepatitis" value={datosMujer.hivHepatitis} onChange={handleRadioToggle}/>
                                </div>
                            </div>

                            {/* --- SECCIÓN 2: HISTORIAL GINECOLÓGICO --- */}
                            <div className="space-y-6 p-4 border border-pink-300 rounded-lg bg-pink-100">
                                <h2 className="text-xl font-bold text-pink-800 border-b pb-1">2. Historial Ginecológico</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <RadioGroup 
                                        label="¿Antecedentes de cancer de mama?" 
                                        name="tumoresMama" 
                                        value={datosMujer.tumoresMama}
                                        onChange={handleRadioToggle}
                                        conditionalContent={(respuesta) => respuesta === 'Sí' && (
                                            <CheckboxGroup 
                                                label="¿Qué tratamiento recibió?" 
                                                fieldName="tumoresMamaTratamiento" 
                                                options={['recibió radioterapia', 'recibió quimioterapia', 'recibió cirugía']} 
                                                values={datosMujer.tumoresMamaTratamiento}
                                                onChange={handleCheckboxChange}
                                            />
                                        )}
                                    />

                                    <RadioGroup label="¿Tiene algún familiar con cáncer de mama?" name="familiarCancerMama" value={datosMujer.familiarCancerMama} onChange={handleRadioToggle} />

                                    <RadioGroup 
                                        label="¿Alguna vez le hicieron alguna punción de mama?" 
                                        name="puncionMama" 
                                        value={datosMujer.puncionMama}
                                        onChange={handleRadioToggle}
                                        conditionalContent={(respuesta) => respuesta === 'Sí' && (
                                            <CheckboxGroup 
                                                label="¿Cuál fue el resultado?" 
                                                fieldName="puncionMamaMotivo" 
                                                options={['Benigno', 'Maligno']} 
                                                values={datosMujer.puncionMamaMotivo}
                                                onChange={handleCheckboxChange}
                                            />
                                        )}
                                    />

                                    <RadioGroup 
                                        label="¿Le dijeron si tenía mama densa al ver su mamografía?" 
                                        name="mamaDensa" 
                                        value={datosMujer.mamaDensa}
                                        onChange={handleRadioToggle}
                                        options={['Sí', 'No', 'No recuerdo', 'No sé lo que es']}
                                    />

                                    <RadioGroup 
                                        label="¿Tuvo hijos?" 
                                        name="tuvoHijos" 
                                        value={datosMujer.tuvoHijos}
                                        onChange={handleRadioToggle}
                                        conditionalContent={(respuesta) => respuesta === 'Sí' && (
                                            <CheckboxGroup 
                                                label="Complicaciones en algún embarazo:" 
                                                fieldName="complicacionesEmbarazo" 
                                                options={['hipertensión arterial gestacional', 'preeclampsia', 'eclampsia', 'diabetes gestacional', 'parto prematuro antes de las 37 semanas de gestación', 'ninguno']} 
                                                values={datosMujer.complicacionesEmbarazo}
                                                onChange={handleCheckboxChange}
                                            />
                                        )}
                                    />

                                    <RadioGroup label="¿Utilizó reproducción asistida?" name="reproduccionAsistida" value={datosMujer.reproduccionAsistida} onChange={handleRadioToggle} />
                                    
                                    <RadioGroup 
                                        label="¿Presentó abortos espontáneos (más de 2) o le dijeron que tenía síndrome antifosfolipídico?" 
                                        name="abortosSindromeAntifosfolipidico" 
                                        value={datosMujer.abortosSindromeAntifosfolipidico}
                                        onChange={handleRadioToggle}
                                    />
                                    
                                    <RadioGroup 
                                        label="¿Su primera menstruación fue antes de los 10 años o después de los 17?" 
                                        name="menstruacionEdadRiesgo" 
                                        value={datosMujer.menstruacionEdadRiesgo}
                                        onChange={handleRadioToggle}
                                    />

                                    <RadioGroup 
                                        label="¿Su última menstruación fue hace más de un año?" 
                                        name="menstruacionUltima" 
                                        value={datosMujer.menstruacionUltima}
                                        onChange={handleRadioToggle}
                                        conditionalContent={(respuesta) => (
                                            <>
                                                {respuesta === 'Sí' && (
                                                    <CheckboxGroup 
                                                        label="Causas (si 'Sí'):" 
                                                        fieldName="menopausiaTipo" 
                                                        options={['presenta histerectomía', 'menopausia', 'otra']}
                                                        values={datosMujer.menopausiaTipo}
                                                        onChange={handleCheckboxChange}
                                                    />
                                                )}
                                                {respuesta === 'No' && (
                                                    <CheckboxGroup 
                                                        label="Estado (si 'No'):" 
                                                        fieldName="menopausiaTipo" 
                                                        options={['perimenopausia', 'ciclos normales', 'anticonceptivos']}
                                                        values={datosMujer.menopausiaTipo}
                                                        onChange={handleCheckboxChange}
                                                    />
                                                )}
                                            </>
                                        )}
                                    />
                                    
                                </div>
                            </div>

                            {/* --- SECCIÓN 3: DATOS ANTROPOMÉTRICOS Y CLÍNICOS --- */}
                            <div className="space-y-6 p-4 border border-green-200 rounded-lg bg-green-50">
                                <h2 className="text-xl font-bold text-green-800 border-b pb-1">3. Datos Antropométricos y Clínicos</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <InputField label="Peso (kg)" name="peso" type="number" min="1" placeholder="Ej: 75.5" isRequired={true} value={datosMujer.peso} onChange={handleChange} />
                                    <InputField label="Talla (cm)" name="talla" type="number" min="1" placeholder="Ej: 170" isRequired={true} value={datosMujer.talla} onChange={handleChange}/>
                                    <div><InputField
                                        label="Cintura (cm)"
                                        name="cintura"
                                        type="number"
                                        min="1"
                                        placeholder="Ej: 90"
                                        value={datosMujer.cintura}
                                        onChange={handleChange}
                                    />

                                    <div style={{ marginTop: '10px' }}>
                                        <button
                                        type="button"
                                        onClick={() => handleChange({ target: { name: 'cintura', value: 89 } })}
                                        style={{ marginRight: '10px' }}
                                        >
                                        Mayor que 88
                                        </button>

                                        <button
                                        type="button"
                                        onClick={() => handleChange({ target: { name: 'cintura', value: 88 } })}
                                        >
                                        Menor o igual que 88
                                        </button>
                                    </div>
                                    </div>
                                    <InputField label="Tensión Máxima (mm Hg)" name="tensionSistolica" type="number" min="60" max="300" placeholder="Ej: 120" isRequired={true} value={datosMujer.tensionSistolica} onChange={handleChange}/>
                                    <InputField label="Tensión Mínima (mm Hg)" name="tensionDiastolica" type="number" min="40" max="200" placeholder="Ej: 80" value={datosMujer.tensionDiastolica} onChange={handleChange}/>
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

                            {/* --- SECCIÓN 4: ENTREGA DE INFORME (MODIFICADA CON CHECKBOX DE CONDICIONES) --- */}
                            <div className="space-y-6 p-4 border border-gray-300 rounded-lg bg-gray-100">
                                <h2 className="text-xl font-bold text-gray-800 border-b pb-1">4. Datos de Entrega de Informe</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="DNI" name="dni" type="text" placeholder="Número de DNI" isRequired={true} value={datosMujer.dni} onChange={handleChange}/>
                                    <InputField label="Fecha de Nacimiento" name="fechaNacimiento" type="date" isRequired={true} value={datosMujer.fechaNacimiento} onChange={handleChange}/>
                                    <InputField label="Edad (Automática)" name="edad" type="text" isRequired={true} placeholder="Calculada automáticamente" value={datosMujer.edad} readOnly disabled />
                                    <InputField label="TELÉFONO" name="telefono" type="tel" placeholder="Nro. de contacto" value={datosMujer.telefono} onChange={handleChange}/>
                                    <InputField label="MAIL" name="mail" type="email" placeholder="Correo electrónico" value={datosMujer.mail} onChange={handleChange}/>
                                </div>

                                {/* --- INICIO DE CÓDIGO AÑADIDO: Checkbox de Condiciones --- */}
                                <div className="mt-4 p-3 border border-gray-300 bg-white rounded-md">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="aceptaCondiciones"
                                            checked={datosMujer.aceptaCondiciones}
                                            onChange={handleSimpleCheckbox}
                                            className="form-checkbox h-5 w-5 text-indigo-600 rounded"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">
                                            Acepto las condiciones: que mis datos personales serán resguardados y sólo se utilizará la información con fines de estadística poblacional.
                                        </span>
                                    </label>
                                </div>
                                {/* --- FIN DE CÓDIGO AÑADIDO --- */}

                            </div>

                            {/* --- BOTONES DE ACCIÓN --- */}
                            <div className="mt-8 flex justify-end space-x-4">
                                <button type="submit" className="px-6 py-3 border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">
                                    Calcular Riesgo
                                </button>
                            </div>
                        </form>
                    </div>
                    
                    {/* --- MODAL UNIFICADO (Sin cambios) --- */}
                    {mostrarModal && (
                        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
                            <div className="bg-white p-6 rounded-md shadow-2xl w-full max-w-lg">
                                <h2 className="text-2xl font-bold mb-4 text-indigo-700">Resultado del Cálculo</h2>

                                {/* Bloque de Advertencia */}
                                {modalAdvertencia && (
                                    <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-md mb-4">
                                        <h3 className="font-bold">Aviso Importante</h3>
                                        <p dangerouslySetInnerHTML={{ __html: modalAdvertencia }}></p>
                                    </div>
                                )}

                                {/* Bloque de Riesgo */}
                                {nivelRiesgo && (
                                    <div className={`p-4 rounded-lg text-center mb-4 ${obtenerColorRiesgo(nivelRiesgo)}`}>
                                        <h3 className="text-xl font-bold">Riesgo Calculado: {nivelRiesgo}</h3>
                                        <p className="text-sm mt-1">{obtenerTextoRiesgo(nivelRiesgo)}</p>
                                    </div>
                                )}

                                {/* Resumen del Paciente */}
                                {nivelRiesgo && (
                                    <div className="my-4 border-t pt-4 text-sm text-gray-800">
                                        <h3 className="font-semibold text-gray-900 mb-2 text-base">Resumen del Paciente</h3>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                            <p><strong>DNI:</strong> {datosMujer.dni}</p>
                                            <p><strong>Edad:</strong> {datosMujer.edad} años</p>
                                            <p><strong>IMC:</strong> {imc.valor ? `${imc.valor} (${imc.clasificacion})` : 'No calculado'}</p>
                                            <p><strong>Presión Arterial:</strong> {datosMujer.tensionSistolica}/{datosMujer.tensionDiastolica} mmHg</p>
                                            {datosMujer.infartoAcvTrombosis === 'Sí' && <p className="col-span-2 text-red-600"><strong>Antecedente Crítico:</strong> Infarto/ACV/Trombosis</p>}
                                            {datosMujer.enfermedadRenalInsuficiencia === 'Sí' && <p className="col-span-2 text-red-600"><strong>Antecedente Crítico:</strong> Enf. Renal / Insuf. Cardíaca</p>}
                                            <p><strong>Diabetes:</strong> {datosMujer.medicacionCondiciones.includes('Diabetes') ? 'Sí' : 'No'}</p>
                                            <p><strong>Hipertensión:</strong> {datosMujer.medicacionCondiciones.includes('Hipertensión arterial') ? 'Sí' : 'No'}</p>

                                            <p><strong>Fuma:</strong> {datosMujer.fumaDiario || 'No'}</p>
                                            <p><strong>Alcohol (Riesgo):</strong> {datosMujer.consumoAlcoholRiesgo || 'No'}</p>
                                            {datosMujer.enfermedadesAutoinmunes === 'Sí' && <p><strong>Enf. Autoinmune:</strong> {datosMujer.autoinmunesTipo.join(', ') || 'Sí'}</p>}
                                            {datosMujer.complicacionesEmbarazo.length > 0 && <p className="col-span-2"><strong>Compl. Embarazo:</strong> {datosMujer.complicacionesEmbarazo.join(', ')}</p>}
                                        </div>
                                    </div>
                                )}

                                {/* Botones de Acción */}
                                <div className="mt-6 flex flex-col md:flex-row gap-3">
                                    {nivelRiesgo && (
                                        <button onClick={guardarPaciente} className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700">
                                            Entrega de informe
                                        </button>
                                    )}
                                    <button onClick={cerrarModal} className="w-full py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                                        {nivelRiesgo ? 'Cerrar' : 'Entendido'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Formulario;