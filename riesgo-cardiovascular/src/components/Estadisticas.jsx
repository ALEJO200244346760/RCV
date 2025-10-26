import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import EstadisticasGraficos from './EstadisticasGraficos'; 

// --- AXIOS INSTANCE ---
const axiosInstance = axios.create({
    baseURL: 'https://rcv-production.up.railway.app', 
});

const apiBaseURL = '/api/pacientes'; 

// --- FUNCIÓN HELPER PARA COLOR DE RIESGO ---
const obtenerColorRiesgo = (nivelRiesgo) => {
    if (!nivelRiesgo) return 'bg-gray-200 text-gray-800';
    const riesgoNormalizado = nivelRiesgo.toLowerCase();
    if (riesgoNormalizado.includes('bajo')) return 'bg-green-500 text-white';
    if (riesgoNormalizado.includes('moderado')) return 'bg-yellow-500 text-white';
    if (riesgoNormalizado.includes('alto')) return 'bg-orange-500 text-white';
    if (riesgoNormalizado.includes('muy alto')) return 'bg-red-500 text-white';
    return 'bg-gray-200 text-gray-800';
};

// --- COMPONENTES DE ICONOS ---
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7v4a2 2 0 002 2h4a2 2 0 002-2V7m-4 6v-4m0 0V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v14a2 2 0 002 2h4a2 2 0 002-2v-2" /></svg>;

// --- COMPONENTE PacienteCard (VERSIÓN COMPLETA) ---
const PacienteCard = React.memo(({ paciente: p, onDelete, onEdit, onCopy }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">Paciente ID: {p.id}</h3>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${obtenerColorRiesgo(p.nivelRiesgo)}`}>
                    {p.nivelRiesgo || 'Sin Calcular'}
                </span>
            </div>

            <p className="text-sm text-gray-500 mb-4">
                <span className="font-medium text-gray-700">DNI:</span> {p.dni} |
                <span className="font-medium text-gray-700"> Edad:</span> {p.edad} |
                <span className="font-medium text-gray-700"> Tel:</span> {p.telefono || 'N/A'}
            </p>

            <div className="text-sm text-gray-700 space-y-1">
                <p className="font-semibold text-gray-600">Mediciones y Hábitos:</p>
                <p><strong>PA:</strong> {p.tensionSistolica}/{p.tensionDiastolica} mmHg | <strong>Cintura:</strong> {p.cintura || 'N/A'} cm</p>
                <p><strong>IMC:</strong> {p.imc}</p>
                <p><strong>Fuma:</strong> {p.fumaDiario || 'No'} | <strong>Alcohol (Riesgo):</strong> {p.consumoAlcoholRiesgo || 'No'}</p>
                <p><strong>Actividad Física:</strong> {p.actividadFisica || 'No'} | <strong>Estrés Crónico:</strong> {p.estresAngustiaCronica || 'No'}</p>
                <p><strong>Medicación Diaria:</strong> {p.tomaMedicacionDiario ? `Sí (${p.medicacionCondiciones || 'N/A'})` : 'No'}</p>
                
                <hr className="my-2"/>
                <p className="font-semibold text-gray-600">Antecedentes Críticos:</p>
                <p><strong>Infarto/ACV/Trombosis:</strong> {p.infartoAcvTrombosis || 'No'}</p>
                <p><strong>Enf. Renal / Insuf. Cardíaca:</strong> {p.enfermedadRenalInsuficiencia || 'No'}</p>
                
                {p.genero === 'femenino' && (
                    <>
                        <hr className="my-2"/>
                        <p className="font-semibold text-gray-600">Historial de Salud Femenina:</p>
                        <p><strong>Enf. Autoinmunes:</strong> {p.enfermedadesAutoinmunes || 'No'} {p.autoinmunesTipo ? `(${p.autoinmunesTipo})` : ''}</p>
                        <p><strong>Familiar Cáncer Mama:</strong> {p.familiarCancerMama || 'No'} | <strong>Mama Densa:</strong> {p.mamaDensa || 'No'}</p>
                        <p><strong>Tuvo Hijos:</strong> {p.tuvoHijos || 'No'} | <strong>Rep. Asistida:</strong> {p.reproduccionAsistida || 'No'}</p>
                        <p><strong>Menopausia (+1 año):</strong> {p.menstruacionUltima || 'No'} | <strong>HIV/Hepatitis:</strong> {p.hivHepatitis || 'No'}</p>
                    </>
                )}
            </div>
            
            <div className="mt-6 flex gap-3">
                <button onClick={() => onEdit(p.id)} className="flex-1 flex items-center justify-center gap-1 px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"><EditIcon /> Editar</button>
                <button onClick={() => onCopy(p)} className="flex-1 flex items-center justify-center gap-1 px-4 py-2 text-sm font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"><CopyIcon /> Copiar</button>
                <button onClick={() => onDelete(p.id)} className="flex-1 flex items-center justify-center gap-1 px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition"><TrashIcon /> Eliminar</button>
            </div>
        </div>
    );
});


function Estadisticas() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarGraficos, setMostrarGraficos] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false); 
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
  const [pacienteAEliminar, setPacienteAEliminar] = useState(null); 
  const [mensajeNotificacion, setMensajeNotificacion] = useState(null); 

  // --- ESTADO DE FILTROS (VERSIÓN COMPLETA) ---
  const [filtros, setFiltros] = useState({
    dni: '',
    edad: '',
    nivelRiesgo: '',
    imc: '',
    fumaDiario: '',
    consumoAlcoholRiesgo: '', // AÑADIDO
    actividadFisica: '', // AÑADIDO
    estresAngustiaCronica: '', // AÑADIDO
    diabetes: '', 
    hipertension: '', 
    infartoAcvTrombosis: '',
    enfermedadRenalInsuficiencia: '',
    enfermedadesAutoinmunes: '',
    hivHepatitis: '',
    reproduccionAsistida: '',
    tuvoHijos: '',
    familiarCancerMama: '', // AÑADIDO
    mamaDensa: '', // AÑADIDO
  });

  const handleDelete = (id) => {
    setPacienteAEliminar(id);
    setMostrarModalConfirmacion(true);
  };
  
  const handleEdit = (id) => {
    if (id) {
        navigate(`/formulario/${id}`); 
    } else {
        setMensajeNotificacion({ tipo: 'error', texto: 'Error: ID de paciente no definido.' });
        setTimeout(() => setMensajeNotificacion(null), 4000);
    }
  };
  
  // --- FUNCIÓN DE COPIADO (VERSIÓN COMPLETA) ---
  const handleCopy = (paciente) => {
    const labelMap = {
      id: 'ID Paciente', dni: 'DNI', fechaNacimiento: 'Fecha de Nacimiento', telefono: 'Teléfono', edad: 'Edad', mail: 'Mail', genero: 'Género',
      infartoAcvTrombosis: 'Antecedente Infarto/ACV/Trombosis', infartoAcvTrombosisTipo: 'Tipo de Evento',
      enfermedadRenalInsuficiencia: 'Enf. Renal / Insuf. Cardíaca', enfermedadRenalInsuficienciaTipo: 'Tipo de Condición Renal/Cardíaca',
      tomaMedicacionDiario: 'Toma Medicación Diaria', medicacionCondiciones: 'Medicación para',
      fumaDiario: 'Fuma Diario', fumaTipo: 'Qué fuma', consumoAlcoholRiesgo: 'Consumo de Alcohol de Riesgo',
      actividadFisica: 'Realiza Actividad Física', horasSueno: 'Duerme 6-8hs', horasSuenoProblema: 'Problema de Sueño',
      estresAngustiaCronica: 'Estrés/Angustia Crónica', estresTipo: 'Tipo de Estrés',
      enfermedadesAutoinmunes: 'Enfermedades Autoinmunes', autoinmunesTipo: 'Tipo de Enf. Autoinmune',
      hivHepatitis: 'Presenta HIV o Hepatitis B/C',
      tumoresMama: 'Antecedente Tumor de Mama', tumoresMamaTratamiento: 'Tratamiento Tumor', familiarCancerMama: 'Familiar con Cáncer de Mama',
      puncionMama: 'Punción de Mama', puncionMamaMotivo: 'Motivo Punción', mamaDensa: 'Mama Densa',
      tuvoHijos: 'Tuvo Hijos', complicacionesEmbarazo: 'Complicaciones en Embarazo',
      reproduccionAsistida: 'Usó Reproducción Asistida', abortosSindromeAntifosfolipidico: 'Abortos o SAF',
      menstruacionEdadRiesgo: 'Menstruación en Edad de Riesgo', menstruacionUltima: 'Última menstruación hace +1 año', menopausiaTipo: 'Estado/Causa Menopausia',
      peso: 'Peso (kg)', talla: 'Talla (cm)', cintura: 'Cintura (cm)',
      tensionSistolica: 'Tensión Sistólica', tensionDiastolica: 'Tensión Diastólica',
      imc: 'IMC (Valor y Clasificación)', nivelRiesgo: 'Nivel de Riesgo Cardiovascular', fechaRegistro: 'Fecha de Registro'
    };

    const dataToCopy = Object.entries(paciente)
        .map(([key, value]) => {
            const label = labelMap[key] || key;
            const finalValue = (value === null || value === '' || value === undefined || (Array.isArray(value) && value.length === 0)) 
                                ? 'No especificado' 
                                : Array.isArray(value) ? value.join(', ') : String(value);
            return `${label}: ${finalValue}`;
        })
        .join('\n');

    navigator.clipboard.writeText(dataToCopy)
        .then(() => setMensajeNotificacion({ tipo: 'success', texto: `Datos del paciente ID ${paciente.id} copiados.` }))
        .catch(() => setMensajeNotificacion({ tipo: 'error', texto: 'Error al copiar datos.' }))
        .finally(() => setTimeout(() => setMensajeNotificacion(null), 4000));
  };

  const confirmarEliminacion = async () => {
    if (!pacienteAEliminar) return;
    setMostrarModalConfirmacion(false);
    try {
        await axiosInstance.delete(`${apiBaseURL}/${pacienteAEliminar}`);
        setPacientes(prev => prev.filter(p => p.id !== pacienteAEliminar));
        setMensajeNotificacion({ tipo: 'success', texto: `Paciente ${pacienteAEliminar} eliminado.` });
    } catch (err) {
        setMensajeNotificacion({ tipo: 'error', texto: 'Error al eliminar paciente.' });
    } finally {
        setPacienteAEliminar(null);
        setTimeout(() => setMensajeNotificacion(null), 4000); 
    }
  };

  const cancelarEliminacion = () => {
    setMostrarModalConfirmacion(false);
    setPacienteAEliminar(null);
  };

  useEffect(() => {
    axiosInstance.get(apiBaseURL)
      .then(resp => setPacientes(resp.data))
      .catch(err => console.error("Error al cargar pacientes:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleFiltroChange = (e) => {
    setFiltros(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  const limpiarFiltros = () => {
    setFiltros(Object.fromEntries(Object.keys(filtros).map(key => [key, ''])));
  };

  const pacientesFiltrados = useMemo(() => {
    let filtrados = pacientes.filter(p => {
      // Filtros directos
      const directFilterKeys = [
          'dni', 'edad', 'nivelRiesgo', 'imc', 'fumaDiario', 'consumoAlcoholRiesgo',
          'actividadFisica', 'estresAngustiaCronica', 'infartoAcvTrombosis',
          'enfermedadRenalInsuficiencia', 'enfermedadesAutoinmunes', 'hivHepatitis',
          'reproduccionAsistida', 'tuvoHijos', 'familiarCancerMama', 'mamaDensa'
      ];

      for (const key of directFilterKeys) {
        if (filtros[key]) {
          const filtroValor = String(filtros[key]).toLowerCase();
          const pacienteValor = String(p[key] || '').toLowerCase();
          if (filtroValor && !pacienteValor.includes(filtroValor)) return false;
        }
      }
      
      // Filtros especiales (sobre campos array/string)
      if (filtros.diabetes && !String(p.medicacionCondiciones || '').toLowerCase().includes('diabetes')) return false;
      if (filtros.hipertension && !String(p.medicacionCondiciones || '').toLowerCase().includes('hipertensión')) return false;
      
      return true;
    });

    return filtrados.sort((a, b) => b.id - a.id);
  }, [pacientes, filtros]);

  if (loading) return <div className="p-8 text-center text-xl">Cargando...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Gestión de Pacientes</h1>

      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Resultados ({pacientesFiltrados.length} pacientes)</h2>
          <div className="flex gap-4">
            <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className={`px-4 py-2 text-sm font-medium rounded-lg shadow-md transition ${mostrarFiltros ? 'bg-gray-500 text-white hover:bg-gray-600' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}>{mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}</button>
            <button onClick={() => setMostrarGraficos(!mostrarGraficos)} className={`px-4 py-2 text-sm font-medium rounded-lg shadow-md transition ${mostrarGraficos ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}`}>{mostrarGraficos ? 'Ocultar Gráficos' : 'Mostrar Gráficos'}</button>
          </div>
      </div>
      
      {/* --- PANEL DE FILTROS (VERSIÓN COMPLETA) --- */}
      {mostrarFiltros && (
        <div className="p-6 bg-white rounded-xl shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Filtros</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <input type="text" name="dni" placeholder="Buscar por DNI" value={filtros.dni} onChange={handleFiltroChange} className="p-2 border rounded-lg"/>
            <input type="number" name="edad" placeholder="Edad Mín." value={filtros.edad} onChange={handleFiltroChange} className="p-2 border rounded-lg"/>
            <select name="nivelRiesgo" value={filtros.nivelRiesgo} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">Riesgo (Todos)</option><option value="Bajo">Bajo</option><option value="Moderado">Moderado</option><option value="Alto">Alto</option><option value="Muy Alto">Muy Alto</option></select>
            <select name="fumaDiario" value={filtros.fumaDiario} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">Fuma (Todos)</option><option value="Sí">Sí</option><option value="No">No</option></select>
            {/* Filtros añadidos */}
            <select name="consumoAlcoholRiesgo" value={filtros.consumoAlcoholRiesgo} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">Alcohol (Todos)</option><option value="Sí">Sí</option><option value="No">No</option></select>
            <select name="actividadFisica" value={filtros.actividadFisica} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">Act. Física (Todos)</option><option value="Sí">Sí</option><option value="No">No</option></select>
            <select name="estresAngustiaCronica" value={filtros.estresAngustiaCronica} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">Estrés (Todos)</option><option value="Sí">Sí</option><option value="No">No</option></select>
            <select name="diabetes" value={filtros.diabetes} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">Diabetes (Todos)</option><option value="Sí">Sí</option></select>
            <select name="hipertension" value={filtros.hipertension} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">Hipertensión (Todos)</option><option value="Sí">Sí</option></select>
            <select name="infartoAcvTrombosis" value={filtros.infartoAcvTrombosis} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">Infarto/ACV</option><option value="Sí">Sí</option><option value="No">No</option></select>
            <select name="enfermedadRenalInsuficiencia" value={filtros.enfermedadRenalInsuficiencia} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">Enf. Renal/Cardíaca</option><option value="Sí">Sí</option><option value="No">No</option></select>
            <select name="enfermedadesAutoinmunes" value={filtros.enfermedadesAutoinmunes} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">Enf. Autoinmune</option><option value="Sí">Sí</option><option value="No">No</option></select>
            <select name="hivHepatitis" value={filtros.hivHepatitis} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">HIV/Hepatitis</option><option value="Sí">Sí</option><option value="No">No</option></select>
            <select name="familiarCancerMama" value={filtros.familiarCancerMama} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">Fam. Cáncer Mama</option><option value="Sí">Sí</option><option value="No">No</option></select>
            <select name="mamaDensa" value={filtros.mamaDensa} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">Mama Densa</option><option value="Sí">Sí</option><option value="No">No</option></select>
            <select name="reproduccionAsistida" value={filtros.reproduccionAsistida} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">Rep. Asistida</option><option value="Sí">Sí</option><option value="No">No</option></select>
            <select name="tuvoHijos" value={filtros.tuvoHijos} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">Tuvo Hijos</option><option value="Sí">Sí</option><option value="No">No</option></select>
          </div>
          <div className="mt-4 flex justify-end"><button onClick={limpiarFiltros} className="px-4 py-2 text-sm font-medium bg-gray-500 text-white rounded-lg hover:bg-gray-600">Limpiar Filtros</button></div>
        </div>
      )}

      {mostrarGraficos && <div className="mb-8 p-6 bg-white rounded-xl shadow-lg"><EstadisticasGraficos pacientes={pacientesFiltrados} /></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {pacientesFiltrados.length > 0 ? (
          pacientesFiltrados.map(p => <PacienteCard key={p.id} paciente={p} onEdit={handleEdit} onCopy={handleCopy} onDelete={handleDelete} />)
        ) : (
          <p className="col-span-full text-center text-gray-500 p-4 bg-white rounded-lg">No se encontraron pacientes que coincidan con los filtros.</p>
        )}
      </div>

      {mostrarModalConfirmacion && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-red-600 mb-4">Confirmar Eliminación</h3>
                <p className="text-gray-700 mb-6">¿Seguro que deseas eliminar al paciente ID <span className="font-semibold">{pacienteAEliminar}</span>?</p>
                <div className="flex justify-end gap-3">
                    <button onClick={cancelarEliminacion} className="px-4 py-2 text-sm font-medium bg-gray-300 rounded-lg hover:bg-gray-400">Cancelar</button>
                    <button onClick={confirmarEliminacion} className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700">Confirmar</button>
                </div>
            </div>
        </div>
      )}

      {mensajeNotificacion && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-xl z-50 ${mensajeNotificacion.tipo === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {mensajeNotificacion.texto}
        </div>
      )}
    </div>
  );
}

export default Estadisticas;