import React, { useEffect, useState } from 'react';
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
    mail: '', // Nuevo campo
    genero: 'femenino',
    
    // --- Historial y Hábitos ---
    infartoAcvTrombosis: null, // Pregunta principal SI/NO
    infartoAcvTrombosisTipo: [], // Sub-opciones: 'infarto', 'ACV', 'Trombosis'
    enfermedadRenalInsuficiencia: null, // Pregunta principal SI/NO
    enfermedadRenalInsuficienciaTipo: [], // Sub-opciones: 'enfermedad renal', 'insuficiencia cardíaca'
    tomaMedicacionDiario: null,
    medicacionCondiciones: [], // Sub-opciones: 'Hipertensión arterial', 'Diabetes', 'Colesterol', 'Otras'
    fumaDiario: null,
    fumaTipo: [], // Sub-opciones: 'tabaco', 'otros'
    consumoAlcoholRiesgo: null, // Pregunta nueva de alcohol
    actividadFisica: null, // SI/NO
    horasSueno: null, // SI/NO
    horasSuenoProblema: [], // Sub-opciones (si NO): 'Insomnio', 'otros'
    estresAngustiaCronica: null, // Pregunta principal SI/NO
    estresTipo: [], // Sub-opciones: 'estrés', 'angustia', 'ansiedad', 'depresión'
    enfermedadesAutoinmunes: null,
    autoinmunesTipo: [], // Sub-opciones: 'lupus', 'artritis reumatoidea', 'psoriasis', 'otra'
    hivHepatitis: null,
    
    // --- Historial Ginecológico ---
    tumoresMama: null, // Pregunta principal SI/NO
    tumoresMamaTratamiento: [], // Sub-opciones: 'recibió radioterapia', 'recibió quimioterapia', 'recibió cirugía'
    familiarCancerMama: null, // SI/NO
    puncionMama: null, // Pregunta principal SI/NO
    puncionMamaMotivo: [], // Sub-opciones: 'sospecha maligna', 'quiste de leche', 'otro'
    mamaDensa: null, // 'Sí', 'No', 'No recuerdo', 'No sé lo que es'
    tuvoHijos: null, // Pregunta principal SI/NO
    complicacionesEmbarazo: [], // Sub-opciones (si SÍ): 'hipertensión arterial gestacional', etc.
    reproduccionAsistida: null,
    abortosSindromeAntifosfolipidico: null, // SI/NO
    menstruacionEdadRiesgo: null, // SI/NO
    menstruacionUltima: null, // Pregunta principal SI/NO
    menopausiaTipo: [], // Sub-opciones (depende de SI/NO de 'menstruacionUltima')
    incontinenciaOrgasmos: null, // Pregunta principal SI/NO
    incontinenciaOrgasmosTipo: [], // Sub-opciones: 'incontinencia', 'falta de orgasmos'

    // --- Datos Antropométricos y Clínicos ---
    peso: '',
    talla: '',
    cintura: '',
    tensionSistolica: '',
    tensionDiastolica: '',
    colesterol: 'No', // Se mantiene por si se usa en la lógica de riesgo
};

const Formulario = () => {
    const [datosMujer, setDatosMujer] = useState(datosInicialesMujer);
    const [imc, setImc] = useState({ valor: '', clasificacion: '' });
    const [nivelRiesgo, setNivelRiesgo] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modalAdvertencia, setModalAdvertencia] = useState(null);

    // --- Lógica de Cálculo Automático (IMC y Edad) ---
    useEffect(() => {
        const peso = parseFloat(datosMujer.peso);
        const tallaCm = parseFloat(datosMujer.talla);

        // 1. Cálculo de IMC
        if (peso > 0 && tallaCm > 0) {
            const tallaM = tallaCm / 100;
            const imcCalculado = peso / (tallaM * tallaM);
            let clasificacion = '';
            if (imcCalculado < 18.5) clasificacion = 'Bajo peso';
            else if (imcCalculado < 25) clasificacion = 'Normopeso';
            else if (imcCalculado < 30) clasificacion = 'Sobrepeso';
            else if (imcCalculado < 35) clasificacion = 'Obesidad Grado I';
            else if (imcCalculado < 40) clasificacion = 'Obesidad Grado II';
            else clasificacion = 'Obesidad Grado III';
            
            setImc({ valor: imcCalculado.toFixed(2), clasificacion });
        } else {
            setImc({ valor: '', clasificacion: '' });
        }
        
        // 2. Cálculo de Edad
        if (datosMujer.fechaNacimiento) {
            const dob = new Date(datosMujer.fechaNacimiento);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                age--;
            }
            setDatosMujer(prev => ({ ...prev, edad: age >= 0 ? age.toString() : '' }));
        }
    }, [datosMujer.peso, datosMujer.talla, datosMujer.fechaNacimiento]);

    // --- Manejadores de Estado ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setDatosMujer(prev => ({ ...prev, [name]: value }));
    };

    const handleRadioToggle = (name, value) => {
        setDatosMujer(prev => ({ ...prev, [name]: value }));
        // Resetear campos condicionales si la respuesta es 'No'
        if (value === 'No') {
            switch(name) {
                case 'infartoAcvTrombosis': setDatosMujer(prev => ({ ...prev, infartoAcvTrombosisTipo: [] })); break;
                case 'enfermedadRenalInsuficiencia': setDatosMujer(prev => ({ ...prev, enfermedadRenalInsuficienciaTipo: [] })); break;
                case 'tomaMedicacionDiario': setDatosMujer(prev => ({ ...prev, medicacionCondiciones: [] })); break;
                case 'fumaDiario': setDatosMujer(prev => ({ ...prev, fumaTipo: [] })); break;
                case 'horasSueno': setDatosMujer(prev => ({ ...prev, horasSuenoProblema: [] })); break; // Reset si la respuesta es 'Sí'
                case 'estresAngustiaCronica': setDatosMujer(prev => ({ ...prev, estresTipo: [] })); break;
                case 'enfermedadesAutoinmunes': setDatosMujer(prev => ({ ...prev, autoinmunesTipo: [] })); break;
                case 'tumoresMama': setDatosMujer(prev => ({ ...prev, tumoresMamaTratamiento: [] })); break;
                case 'puncionMama': setDatosMujer(prev => ({ ...prev, puncionMamaMotivo: [] })); break;
                case 'tuvoHijos': setDatosMujer(prev => ({ ...prev, complicacionesEmbarazo: [] })); break;
                case 'menstruacionUltima': setDatosMujer(prev => ({ ...prev, menopausiaTipo: [] })); break;
                case 'incontinenciaOrgasmos': setDatosMujer(prev => ({ ...prev, incontinenciaOrgasmosTipo: [] })); break;
                default: break;
            }
        }
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
    
    // --- Lógica de Envío (manteniendo la estructura original) ---
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

        // Lógica de Riesgo Crítico (Simplificada para el ejemplo)
        const tieneRiesgoCritico = datosMujer.infartoAcvTrombosis === 'Sí' || datosMujer.enfermedadRenalInsuficiencia === 'Sí';
        if (tieneRiesgoCritico) {
            setNivelRiesgo('>30% <40% Muy Alto');
            setModalAdvertencia('Paciente con historial de infarto/ACV o enfermedad renal. Riesgo Cardiovascular es considerado **Muy Alto**.');
            setMostrarModal(true);
            return;
        }
        
        // Uso de la función stub calcularRiesgoCardiovascular
        const edadAjustada = ajustarEdad(parseInt(datosMujer.edad, 10));
        const presionArterial = ajustarPresionArterial(parseInt(datosMujer.tensionSistolica, 10));
        const diabetes = datosMujer.medicacionCondiciones.includes('Diabetes') ? 'si' : 'no'; 
        const fuma = datosMujer.fumaDiario === 'Sí' ? 'si' : 'no';
        
        // Colesterol no se pide en el nuevo formulario, se pasa "No" o se elimina, 
        // mantendremos "No" para que el stub funcione.
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
                 setMostrarModal(false); // No guardar si falló la validación
                 return;
            }
            
            let datosParaEnviar = { ...datosMujer };
            const hoy = new Date();
            datosParaEnviar.fechaRegistro = hoy.toISOString().split('T')[0]; // Formato YYYY-MM-DD

            // Convertir arrays de checkboxes a string para el backend (ej: 'opcion1, opcion2')
            const camposArray = [
                'infartoAcvTrombosisTipo', 
                'enfermedadRenalInsuficienciaTipo', 
                'medicacionCondiciones', 
                'fumaTipo', 
                'horasSuenoProblema', 
                'estresTipo', 
                'autoinmunesTipo', 
                'tumoresMamaTratamiento', 
                'puncionMamaMotivo', 
                'complicacionesEmbarazo', 
                'menopausiaTipo', 
                'incontinenciaOrgasmosTipo'
            ];
            
            camposArray.forEach(campo => {
                if (Array.isArray(datosParaEnviar[campo])) {
                    datosParaEnviar[campo] = datosParaEnviar[campo].join(', ');
                }
            });

            // Limpiar valores 'null' o no utilizados
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
            
            // Eliminar campos temporales que no van al modelo de datos final si es necesario
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
    
    // --- Componentes Reutilizables ---
    
    const RadioGroup = ({ label, name, options = ['Sí', 'No'], conditionalContent, isRequired=false }) => (
        <div className="flex flex-col border p-3 rounded-lg bg-white shadow-sm">
            <label className={`block text-sm font-medium text-gray-700 ${isRequired ? 'after:content-[\'*\'] after:ml-0.5 after:text-red-500' : ''}`}>{label}</label>
            <div className="mt-1 flex flex-wrap gap-4">
                {options.map(opt => (
                    <label key={opt} className="inline-flex items-center text-gray-700">
                        <input
                            type="radio"
                            name={name}
                            value={opt}
                            checked={datosMujer[name] === opt}
                            onChange={() => handleRadioToggle(name, opt)}
                            className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                        />
                        <span className="ml-2">{opt}</span>
                    </label>
                ))}
            </div>
            {/* Contenido Condicional (puede ser Input o CheckboxGroup) */}
            {conditionalContent && datosMujer[name] && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                    {conditionalContent(datosMujer[name])}
                </div>
            )}
        </div>
    );
    
    const CheckboxGroup = ({ label, fieldName, options, isRequired=false }) => (
        <div className="flex flex-col">
            <label className={`block text-sm font-medium text-gray-700 ${isRequired ? 'after:content-[\'*\'] after:ml-0.5 after:text-red-500' : ''}`}>{label}</label>
            <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-2">
                {options.map(opt => (
                    <label key={opt} className="inline-flex items-center text-gray-700">
                        <input
                            type="checkbox"
                            value={opt}
                            checked={Array.isArray(datosMujer[fieldName]) ? datosMujer[fieldName].includes(opt) : false}
                            onChange={() => handleCheckboxChange(fieldName, opt)}
                            className="form-checkbox h-4 w-4 text-indigo-600 rounded"
                        />
                        <span className="ml-2 text-sm">{opt}</span>
                    </label>
                ))}
            </div>
        </div>
    );
    
    const InputField = ({ label, name, type = 'text', placeholder, isRequired = false, min, max }) => (
        <div>
            <label htmlFor={name} className={`block text-sm font-medium text-gray-700 ${isRequired ? 'after:content-[\'*\'] after:ml-0.5 after:text-red-500' : ''}`}>{label}</label>
            <input 
                type={type} 
                name={name} 
                id={name} 
                value={datosMujer[name] || ''} 
                onChange={handleChange} 
                placeholder={placeholder} 
                required={isRequired}
                min={min}
                max={max}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
        </div>
    );
    // --- Fin Componentes Reutilizables ---

    return (
        <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-2xl w-full">
                <h1 className="text-3xl font-extrabold text-indigo-700 mb-6 border-b pb-2">
                    Formulario de Salud Femenina y Riesgo Cardiovascular
                </h1> 

                {/* Mensaje de éxito */}
                {mensajeExito && <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-md shadow-lg z-50">{mensajeExito}</div>}
                
                <form className="w-full space-y-10" onSubmit={(e) => { e.preventDefault(); calcularRiesgo(); }}>

                    {/* --- SECCIÓN 1: HISTORIAL Y HÁBITOS --- */}
                    <div className="space-y-6 p-4 border border-indigo-200 rounded-lg bg-indigo-50">
                        <h2 className="text-xl font-bold text-indigo-800 border-b pb-1">1. Historial y Hábitos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <RadioGroup 
                                label="¿Alguna vez ha tenido un infarto, un ACV o Trombosis arterial?" 
                                name="infartoAcvTrombosis" 
                                conditionalContent={(respuesta) => respuesta === 'Sí' && (
                                    <CheckboxGroup 
                                        label="Seleccione el antecedente:" 
                                        fieldName="infartoAcvTrombosisTipo" 
                                        options={['infarto', 'ACV', 'Trombosis arterial']} 
                                    />
                                )}
                            />
                            
                            <RadioGroup 
                                label="¿Tiene enfermedad Renal Crónica o Insuficiencia Cardíaca?" 
                                name="enfermedadRenalInsuficiencia" 
                                conditionalContent={(respuesta) => respuesta === 'Sí' && (
                                    <CheckboxGroup 
                                        label="Seleccione la condición:" 
                                        fieldName="enfermedadRenalInsuficienciaTipo" 
                                        options={['enfermedad renal', 'insuficiencia cardíaca']} 
                                    />
                                )}
                            />
                            
                            <RadioGroup 
                                label="¿Toma medicación a diario?" 
                                name="tomaMedicacionDiario" 
                                conditionalContent={(respuesta) => respuesta === 'Sí' && (
                                    <CheckboxGroup 
                                        label="¿Para qué condición?" 
                                        fieldName="medicacionCondiciones" 
                                        options={['Hipertensión arterial', 'Diabetes', 'Colesterol', 'Otras']} 
                                    />
                                )}
                            />
                            
                            <RadioGroup 
                                label="¿Fuma a diario?" 
                                name="fumaDiario" 
                                conditionalContent={(respuesta) => respuesta === 'Sí' && (
                                    <CheckboxGroup 
                                        label="¿Qué fuma?" 
                                        fieldName="fumaTipo" 
                                        options={['tabaco', 'otros']} 
                                    />
                                )}
                            />

                            <RadioGroup label="¿Toma más de 5 vasos de cerveza, o más de 3 copas de vino semanales?" name="consumoAlcoholRiesgo" />
                            <RadioGroup label="¿Realiza actividad física 150 minutos semanales?" name="actividadFisica" />
                            
                            <RadioGroup 
                                label="¿Duerme entre 6 y 8 horas diarias?" 
                                name="horasSueno" 
                                conditionalContent={(respuesta) => respuesta === 'No' && (
                                    <CheckboxGroup 
                                        label="¿Qué problema presenta?" 
                                        fieldName="horasSuenoProblema" 
                                        options={['Insomnio', 'otros']} 
                                    />
                                )}
                            />
                            
                            <RadioGroup 
                                label="¿Siente que presenta estrés, angustia, ansiedad o depresión en forma permanente o Crónica?" 
                                name="estresAngustiaCronica" 
                                conditionalContent={(respuesta) => respuesta === 'Sí' && (
                                    <CheckboxGroup 
                                        label="Seleccione el problema:" 
                                        fieldName="estresTipo" 
                                        options={['estrés', 'angustia', 'ansiedad', 'depresión']} 
                                    />
                                )}
                            />
                            
                            <RadioGroup 
                                label="¿Le dijeron alguna vez que tiene alguna enfermedad autoinmune?" 
                                name="enfermedadesAutoinmunes" 
                                conditionalContent={(respuesta) => respuesta === 'Sí' && (
                                    <CheckboxGroup 
                                        label="Seleccione la enfermedad:" 
                                        fieldName="autoinmunesTipo" 
                                        options={['lupus', 'artritis reumatoidea', 'psoriasis', 'otra']} 
                                    />
                                )}
                            />
                            
                            <RadioGroup label="¿Presenta HIV o Hepatitis B/C?" name="hivHepatitis" />
                        </div>
                    </div>

                    {/* --- SECCIÓN 2: HISTORIAL GINECOLÓGICO --- */}
                    <div className="space-y-6 p-4 border border-pink-300 rounded-lg bg-pink-100">
                        <h2 className="text-xl font-bold text-pink-800 border-b pb-1">2. Historial Ginecológico</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <RadioGroup 
                                label="¿Antecedentes de tumores de mama?" 
                                name="tumoresMama" 
                                conditionalContent={(respuesta) => respuesta === 'Sí' && (
                                    <CheckboxGroup 
                                        label="¿Qué tratamiento recibió?" 
                                        fieldName="tumoresMamaTratamiento" 
                                        options={['recibió radioterapia', 'recibió quimioterapia', 'recibió cirugía']} 
                                    />
                                )}
                            />

                            <RadioGroup label="¿Tiene algún familiar con cáncer de mama?" name="familiarCancerMama" />

                            <RadioGroup 
                                label="¿Alguna vez le hicieron alguna punción de mama?" 
                                name="puncionMama" 
                                conditionalContent={(respuesta) => respuesta === 'Sí' && (
                                    <CheckboxGroup 
                                        label="¿Cuál fue el motivo?" 
                                        fieldName="puncionMamaMotivo" 
                                        options={['sospecha maligna', 'quiste de leche', 'otro']} 
                                    />
                                )}
                            />

                            <RadioGroup 
                                label="¿Le dijeron si tenía mama densa al ver su mamografía?" 
                                name="mamaDensa" 
                                options={['Sí', 'No', 'No recuerdo', 'No sé lo que es']}
                            />

                            <RadioGroup 
                                label="¿Tuvo hijos?" 
                                name="tuvoHijos" 
                                conditionalContent={(respuesta) => respuesta === 'Sí' && (
                                    <CheckboxGroup 
                                        label="Complicaciones en algún embarazo:" 
                                        fieldName="complicacionesEmbarazo" 
                                        options={['hipertensión arterial gestacional', 'preeclampsia', 'eclampsia', 'diabetes gestacional', 'parto prematuro antes de las 37 semanas de gestación']} 
                                    />
                                )}
                            />

                            <RadioGroup label="¿Utilizó reproducción asistida?" name="reproduccionAsistida" />
                            
                            <RadioGroup 
                                label="¿Presentó abortos espontáneos (más de 2) o le dijeron que tenía síndrome antifosfolipídico?" 
                                name="abortosSindromeAntifosfolipidico" 
                            />
                            
                            <RadioGroup 
                                label="¿Su primera menstruación fue antes de los 10 años o después de los 17?" 
                                name="menstruacionEdadRiesgo" 
                            />

                            <RadioGroup 
                                label="¿Su última menstruación fue hace más de un año?" 
                                name="menstruacionUltima" 
                                conditionalContent={(respuesta) => (
                                    <>
                                        {respuesta === 'Sí' && (
                                            <CheckboxGroup 
                                                label="Causas (si 'Sí'):" 
                                                fieldName="menopausiaTipo" 
                                                options={['presenta histerectomía', 'menopausia', 'otra']} 
                                            />
                                        )}
                                        {respuesta === 'No' && (
                                            <CheckboxGroup 
                                                label="Estado (si 'No'):" 
                                                fieldName="menopausiaTipo" 
                                                options={['perimenopausia', 'ciclos normales', 'anticonceptivos']} 
                                            />
                                        )}
                                    </>
                                )}
                            />

                            <RadioGroup 
                                label="¿Tiene problemas de incontinencia urinaria o falta de orgasmos habitualmente?" 
                                name="incontinenciaOrgasmos" 
                                conditionalContent={(respuesta) => respuesta === 'Sí' && (
                                    <CheckboxGroup 
                                        label="Seleccione el problema:" 
                                        fieldName="incontinenciaOrgasmosTipo" 
                                        options={['incontinencia', 'falta de orgasmos']} 
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* --- SECCIÓN 3: DATOS ANTROPOMÉTRICOS Y CLÍNICOS --- */}
                    <div className="space-y-6 p-4 border border-green-200 rounded-lg bg-green-50">
                        <h2 className="text-xl font-bold text-green-800 border-b pb-1">3. Datos Antropométricos y Clínicos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputField label="Peso (kg)" name="peso" type="number" min="1" placeholder="Ej: 75.5" isRequired={true} />
                            <InputField label="Talla (cm)" name="talla" type="number" min="1" placeholder="Ej: 170" isRequired={true} />
                            <InputField label="Cintura (cm)" name="cintura" type="number" min="1" placeholder="Ej: 90" />
                            <InputField label="Tensión Sistólica (mm Hg)" name="tensionSistolica" type="number" min="60" max="300" placeholder="Ej: 120" isRequired={true} />
                            <InputField label="Tensión Diastólica (mm Hg)" name="tensionDiastolica" type="number" min="40" max="200" placeholder="Ej: 80" />
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
                            <InputField label="DNI" name="dni" type="text" placeholder="Número de DNI" isRequired={true} />
                            <InputField label="Fecha de Nacimiento" name="fechaNacimiento" type="date" isRequired={true} />
                            <InputField label="Edad (Automática)" name="edad" type="text" isRequired={true} placeholder="Calculada automáticamente" readOnly disabled />
                            <InputField label="TELÉFONO" name="telefono" type="tel" placeholder="Nro. de contacto" />
                            <InputField label="MAIL" name="mail" type="email" placeholder="Correo electrónico" />
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
            
            {/* --- MODAL DE RIESGO Y GUARDADO (Mantiene lógica del archivo anterior) --- */}
            {mostrarModal && nivelRiesgo && (
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
                        <p>{modalAdvertencia}</p>
                        <button onClick={cerrarModal} className="mt-4 py-2 px-4 bg-gray-500 text-white rounded-md w-full">Entendido</button>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default Formulario;