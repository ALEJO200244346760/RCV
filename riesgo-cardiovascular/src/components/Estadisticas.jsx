import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
// Importa tu componente de gráficos si lo tienes
// import EstadisticasGraficos from './EstadisticasGraficos'; 
import { EyeIcon, PencilIcon, TrashIcon } from './Icons'; // Asumo que tienes un archivo para iconos
import { filter } from 'lodash';

// --- AXIOS INSTANCE ---
// Ajusta la URL base si es necesario
const axiosInstance = axios.create({
    baseURL: 'https://rcv-production.up.railway.app', 
});

const apiBaseURL = '/api/pacientes'; 

// --- FUNCIÓN HELPER PARA COLOR DE RIESGO (Reutilizada del archivo original) ---
const obtenerColorRiesgo = (nivelRiesgo) => {
    if (!nivelRiesgo) return 'bg-gray-200 text-gray-800';
    const riesgoNormalizado = nivelRiesgo.toLowerCase();
    if (riesgoNormalizado.includes('bajo')) return 'bg-green-500 text-white';
    if (riesgoNormalizado.includes('moderado')) return 'bg-yellow-500 text-white';
    if (riesgoNormalizado.includes('alto')) return 'bg-orange-500 text-white';
    if (riesgoNormalizado.includes('muy alto')) return 'bg-red-500 text-white';
    if (riesgoNormalizado.includes('crítico')) return 'bg-red-800 text-white';
    return 'bg-gray-200 text-gray-800';
};


// --- LISTA DE FILTROS ACTUALIZADA ---
const initialFiltros = {
    dni: '',
    edad: '',
    nivelRiesgo: '',
    fumaDiario: '',
    actividadFisica: '',
    consumoAlcoholRiesgo: '',
    tomaMedicacionDiario: '',
    infartoAcvTrombosis: '', // Nuevo
    enfermedadRenalInsuficiencia: '', // Nuevo
    enfermedadesAutoinmunes: '', // Nuevo
    hivHepatitis: '', // Nuevo
    
    // Ginecológicos
    tumoresMama: '', // Nuevo
    familiarCancerMama: '', // Nuevo
    puncionMama: '', // Nuevo
    mamaDensa: '', // Nuevo
    tuvoHijos: '', // Nuevo
    reproduccionAsistida: '', // Nuevo
    menstruacionUltima: '', // Nuevo
};


// --- COMPONENTE TARJETA DE PACIENTE ---
const PacienteCard = ({ paciente, onEdit, onDelete }) => {
    const { 
        dni, id, fechaRegistro, edad, imc, nivelRiesgo, peso, talla, cintura,
        tensionSistolica, tensionDiastolica, telefono, mail, fechaNacimiento,
        // Historial y Hábitos
        infartoAcvTrombosis, infartoAcvTrombosisTipo, enfermedadRenalInsuficiencia, enfermedadRenalInsuficienciaTipo,
        tomaMedicacionDiario, medicacionCondiciones, fumaDiario, fumaTipo, consumoAlcoholRiesgo, 
        actividadFisica, horasSueno, horasSuenoProblema, estresAngustiaCronica, estresTipo, 
        enfermedadesAutoinmunes, autoinmunesTipo, hivHepatitis,
        // Historial Ginecológico
        tumoresMama, tumoresMamaTratamiento, familiarCancerMama, puncionMama, puncionMamaMotivo,
        mamaDensa, tuvoHijos, complicacionesEmbarazo, reproduccionAsistida, abortosSindromeAntifosfolipidico,
        menstruacionEdadRiesgo, menstruacionUltima, menopausiaTipo, incontinenciaOrgasmos, incontinenciaOrgasmosTipo,
    } = paciente;

    const tieneComplicaciones = (complicaciones) => {
        return complicaciones ? complicaciones.split(', ').filter(c => c).join(', ') : 'Ninguna';
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 relative">
            <div className="flex justify-between items-start border-b pb-2 mb-3">
                <h3 className="text-xl font-bold text-gray-900">Paciente DNI: {dni}</h3>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${obtenerColorRiesgo(nivelRiesgo)}`}>
                    {nivelRiesgo || 'N/D'}
                </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">Registro: {fechaRegistro} | Edad: {edad} años</p>

            {/* Acciones */}
            <div className="absolute top-4 right-4 flex space-x-2">
                <button onClick={() => onEdit(id)} title="Editar" className="text-indigo-600 hover:text-indigo-800 p-1 rounded-full hover:bg-indigo-50 transition">
                    <PencilIcon className="h-5 w-5" />
                </button>
                <button onClick={() => onDelete(id)} title="Eliminar" className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition">
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-3 text-sm">
                
                <h4 className="font-bold text-indigo-700">Riesgo y Mediciones:</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div><strong>IMC:</strong> {imc}</div>
                    <div><strong>Peso/Talla/Cintura:</strong> {peso}kg / {talla}cm / {cintura}cm</div>
                    <div><strong>Tensión (S/D):</strong> {tensionSistolica}/{tensionDiastolica} mmHg</div>
                </div>
                
                <h4 className="font-bold text-indigo-700 mt-2">Historial y Hábitos:</h4>
                <div className="grid grid-cols-1 gap-y-1">
                    <div>
                        <strong>Infarto/ACV/Trombosis:</strong> {infartoAcvTrombosis} 
                        {infartoAcvTrombosis === 'Sí' && ` (${tieneComplicaciones(infartoAcvTrombosisTipo)})`}
                    </div>
                    <div>
                        <strong>Enfermedad Renal/IC:</strong> {enfermedadRenalInsuficiencia} 
                        {enfermedadRenalInsuficiencia === 'Sí' && ` (${tieneComplicaciones(enfermedadRenalInsuficienciaTipo)})`}
                    </div>
                    <div>
                        <strong>Medicación diaria:</strong> {tomaMedicacionDiario} 
                        {tomaMedicacionDiario === 'Sí' && ` (${tieneComplicaciones(medicacionCondiciones)})`}
                    </div>
                    <div>
                        <strong>Fuma:</strong> {fumaDiario} {fumaDiario === 'Sí' && ` (${tieneComplicaciones(fumaTipo)})`}
                    </div>
                    <div><strong>Alcohol riesgo:</strong> {consumoAlcoholRiesgo}</div>
                    <div><strong>Act. Física / Sueño:</strong> {actividadFisica} / {horasSueno}</div>
                    <div>
                        <strong>Estrés Crónico:</strong> {estresAngustiaCronica} 
                        {estresAngustiaCronica === 'Sí' && ` (${tieneComplicaciones(estresTipo)})`}
                    </div>
                    <div>
                        <strong>Autoinmunes:</strong> {enfermedadesAutoinmunes} 
                        {enfermedadesAutoinmunes === 'Sí' && ` (${tieneComplicaciones(autoinmunesTipo)})`}
                    </div>
                    <div><strong>HIV/Hepatitis B/C:</strong> {hivHepatitis}</div>
                </div>

                <h4 className="font-bold text-pink-700 mt-2">Salud Femenina:</h4>
                <div className="grid grid-cols-1 gap-y-1">
                    <div>
                        <strong>Tumores Mama:</strong> {tumoresMama} 
                        {tumoresMama === 'Sí' && ` (Tratamiento: ${tieneComplicaciones(tumoresMamaTratamiento)})`}
                    </div>
                    <div><strong>Familiar Cáncer Mama:</strong> {familiarCancerMama}</div>
                    <div><strong>Punción Mama:</strong> {puncionMama}</div>
                    <div><strong>Mama Densa:</strong> {mamaDensa}</div>
                    <div>
                        <strong>Tuvo Hijos:</strong> {tuvoHijos} 
                        {tuvoHijos === 'Sí' && ` (Complicaciones: ${tieneComplicaciones(complicacionesEmbarazo)})`}
                    </div>
                    <div><strong>Repr. Asistida:</strong> {reproduccionAsistida}</div>
                    <div><strong>Abortos/SAF:</strong> {abortosSindromeAntifosfolipidico}</div>
                    <div><strong>Menstruación Úlima:</strong> {menstruacionUltima} {menstruacionUltima && ` (${tieneComplicaciones(menopausiaTipo)})`}</div>
                    <div>
                        <strong>Incontinencia/Orgasmos:</strong> {incontinenciaOrgasmos} 
                        {incontinenciaOrgasmos === 'Sí' && ` (${tieneComplicaciones(incontinenciaOrgasmosTipo)})`}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL ---
function Estadisticas() {
    const navigate = useNavigate();
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtros, setFiltros] = useState(initialFiltros);
    const [pacienteAEliminar, setPacienteAEliminar] = useState(null);
    const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
    const [mensajeNotificacion, setMensajeNotificacion] = useState(null);

    // 1. Cargar datos
    useEffect(() => {
        setLoading(true);
        axiosInstance.get(apiBaseURL)
            .then(resp => {
                // Asegurar que los datos sean arrays si están almacenados como strings
                const data = resp.data.map(p => ({
                    ...p,
                    medicacionCondiciones: p.medicacionCondiciones ? String(p.medicacionCondiciones).split(', ') : [],
                    infartoAcvTrombosisTipo: p.infartoAcvTrombosisTipo ? String(p.infartoAcvTrombosisTipo).split(', ') : [],
                    // ... (hacer esto para todos los campos de tipo Array si el backend los devuelve como string)
                }));
                setPacientes(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error al cargar pacientes:", err);
                setLoading(false);
            });
    }, []);

    // 2. Lógica de Filtrado
    const filteredPacientes = useMemo(() => {
        return pacientes.filter(p => {
            const edadNum = parseInt(p.edad, 10);
            
            // Filtro por DNI
            if (filtros.dni && !p.dni.toLowerCase().includes(filtros.dni.toLowerCase())) return false;
            
            // Filtro por Edad (Rango o exacto)
            if (filtros.edad) {
                const filterEdadNum = parseInt(filtros.edad, 10);
                if (edadNum !== filterEdadNum) return false;
            }

            // Filtro por Nivel de Riesgo
            if (filtros.nivelRiesgo && !p.nivelRiesgo.toLowerCase().includes(filtros.nivelRiesgo.toLowerCase())) return false;

            // Filtros de RadioGroup (Sí/No/Opciones específicas)
            const radioFilters = [
                'fumaDiario', 'actividadFisica', 'consumoAlcoholRiesgo', 'tomaMedicacionDiario', 
                'infartoAcvTrombosis', 'enfermedadRenalInsuficiencia', 'enfermedadesAutoinmunes', 
                'hivHepatitis', 'tumoresMama', 'familiarCancerMama', 'puncionMama', 'mamaDensa',
                'tuvoHijos', 'reproduccionAsistida', 'menstruacionUltima'
            ];
            
            for (const key of radioFilters) {
                if (filtros[key] && p[key] !== filtros[key]) {
                    // Manejo especial para mamaDensa que tiene más opciones
                    if (key === 'mamaDensa' && !['Sí', 'No', 'No recuerdo', 'No sé lo que es'].includes(filtros[key])) continue;
                    if (p[key] !== filtros[key]) return false;
                }
            }

            return true;
        });
    }, [pacientes, filtros]);

    // 3. Manejadores de Interfaz
    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (id) => {
        navigate(`/editar-paciente/${id}`); // Asumo que tienes esta ruta
    };

    const handleDelete = (id) => {
        setPacienteAEliminar(id);
        setMostrarModalConfirmacion(true);
    };

    const cancelarEliminacion = () => {
        setPacienteAEliminar(null);
        setMostrarModalConfirmacion(false);
    };

    const confirmarEliminacion = () => {
        axiosInstance.delete(`${apiBaseURL}/${pacienteAEliminar}`)
            .then(() => {
                setPacientes(prev => prev.filter(p => p.id !== pacienteAEliminar));
                setMensajeNotificacion({ texto: `Paciente ID ${pacienteAEliminar} eliminado con éxito.`, tipo: 'success' });
                setTimeout(() => setMensajeNotificacion(null), 3000);
            })
            .catch(err => {
                console.error("Error al eliminar:", err);
                setMensajeNotificacion({ texto: 'Error al eliminar paciente.', tipo: 'error' });
                setTimeout(() => setMensajeNotificacion(null), 3000);
            })
            .finally(() => {
                setMostrarModalConfirmacion(false);
                setPacienteAEliminar(null);
            });
    };


    if (loading) {
        return <div className="text-center p-8 text-xl font-semibold text-indigo-600">Cargando datos de pacientes...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold text-indigo-700 mb-6 border-b pb-2">
                    Estadísticas y Listado de Pacientes Femeninas
                </h1> 

                {/* --- SECCIÓN DE FILTROS --- */}
                <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Filtros de Búsqueda</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        
                        {/* Datos Básicos */}
                        <input type="text" name="dni" placeholder="Filtrar por DNI" value={filtros.dni} onChange={handleFiltroChange} className="p-2 border rounded-md" />
                        <input type="number" name="edad" placeholder="Edad (ej. 45)" value={filtros.edad} onChange={handleFiltroChange} className="p-2 border rounded-md" />
                        <select name="nivelRiesgo" value={filtros.nivelRiesgo} onChange={handleFiltroChange} className="p-2 border rounded-md">
                            <option value="">Riesgo (Todos)</option>
                            <option value="Bajo">Bajo</option>
                            <option value="Moderado">Moderado</option>
                            <option value="Alto">Alto</option>
                            <option value="Muy Alto">Muy Alto</option>
                            <option value="Crítico">Crítico</option>
                        </select>
                        
                        {/* Hábitos */}
                        <select name="fumaDiario" value={filtros.fumaDiario} onChange={handleFiltroChange} className="p-2 border rounded-md">
                            <option value="">Fuma (Todos)</option>
                            <option value="Sí">Sí</option>
                            <option value="No">No</option>
                        </select>
                        <select name="actividadFisica" value={filtros.actividadFisica} onChange={handleFiltroChange} className="p-2 border rounded-md">
                            <option value="">Act. Física (Todos)</option>
                            <option value="Sí">Sí</option>
                            <option value="No">No</option>
                        </select>
                        <select name="consumoAlcoholRiesgo" value={filtros.consumoAlcoholRiesgo} onChange={handleFiltroChange} className="p-2 border rounded-md">
                            <option value="">Alcohol Riesgo</option>
                            <option value="Sí">Sí</option>
                            <option value="No">No</option>
                        </select>
                        
                        {/* Condiciones Crónicas y Antecedentes */}
                        <select name="tomaMedicacionDiario" value={filtros.tomaMedicacionDiario} onChange={handleFiltroChange} className="p-2 border rounded-md">
                            <option value="">Medicación (Todos)</option>
                            <option value="Sí">Sí</option>
                            <option value="No">No</option>
                        </select>
                        <select name="infartoAcvTrombosis" value={filtros.infartoAcvTrombosis} onChange={handleFiltroChange} className="p-2 border rounded-md">
                            <option value="">Infarto/ACV/Tromb.</option>
                            <option value="Sí">Sí</option>
                            <option value="No">No</option>
                        </select>
                        <select name="enfermedadRenalInsuficiencia" value={filtros.enfermedadRenalInsuficiencia} onChange={handleFiltroChange} className="p-2 border rounded-md">
                            <option value="">Enf. Renal/IC</option>
                            <option value="Sí">Sí</option>
                            <option value="No">No</option>
                        </select>
                        
                        {/* Salud Femenina y Mamaria */}
                        <select name="tumoresMama" value={filtros.tumoresMama} onChange={handleFiltroChange} className="p-2 border rounded-md">
                            <option value="">Tumores Mama</option>
                            <option value="Sí">Sí</option>
                            <option value="No">No</option>
                        </select>
                        <select name="mamaDensa" value={filtros.mamaDensa} onChange={handleFiltroChange} className="p-2 border rounded-md">
                            <option value="">Mama Densa</option>
                            <option value="Sí">Sí</option>
                            <option value="No">No</option>
                            <option value="No recuerdo">No recuerdo</option>
                        </select>
                        <select name="tuvoHijos" value={filtros.tuvoHijos} onChange={handleFiltroChange} className="p-2 border rounded-md">
                            <option value="">Tuvo Hijos</option>
                            <option value="Sí">Sí</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                </div>

                {/* --- LISTADO DE PACIENTES --- */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Listado ({filteredPacientes.length} pacientes)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPacientes.length > 0 ? (
                        filteredPacientes.map(p => (
                            <PacienteCard 
                                key={p.id} 
                                paciente={p} 
                                onEdit={handleEdit} 
                                onDelete={handleDelete} 
                            />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-500 p-4 bg-white rounded-lg">No se encontraron pacientes que cumplan los criterios de filtrado.</p>
                    )}
                </div>
            </div>
            
            {/* --- MODAL DE CONFIRMACIÓN DE ELIMINACIÓN --- */}
            {mostrarModalConfirmacion && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-red-600 mb-4">Confirmar Eliminación</h3>
                        <p className="text-gray-700 mb-6">¿Estás seguro de que deseas eliminar al paciente ID <span className="font-semibold">{pacienteAEliminar}</span>? Esta acción es irreversible.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={cancelarEliminacion}
                                className="px-4 py-2 text-sm font-medium bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarEliminacion}
                                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MENSAJE DE NOTIFICACIÓN --- */}
            {mensajeNotificacion && (
                <div 
                    className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-xl z-50 transition-opacity duration-300 \n                ${mensajeNotificacion.tipo === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}
                >
                    {mensajeNotificacion.texto}
                </div>
            )}
        </div>
    );
}

export default Estadisticas;