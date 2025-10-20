import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import EstadisticasGraficos from './EstadisticasGraficos'; 
// Importar funciones de ConstFormulario si existieran,
// de lo contrario, uso la definición local para evitar errores.
// import { obtenerColorRiesgo } from './ConstFormulario'; 

// --- AXIOS INSTANCE ---
const axiosInstance = axios.create({
    baseURL: 'https://rcv-production.up.railway.app', 
});

const apiBaseURL = '/api/pacientes'; 

// --- FUNCIÓN HELPER PARA COLOR DE RIESGO (más robusta que el stub) ---
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

// --- COMPONENTES DE ICONOS ---
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
</svg>;

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
</svg>;

const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v4a2 2 0 002 2h4a2 2 0 002-2V7m-4 6v-4m0 0V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v14a2 2 0 002 2h4a2 2 0 002-2v-2" />
</svg>;


// Componente PacienteCard
const PacienteCard = React.memo(({ paciente: p, onDelete, onEdit, onCopy }) => {
    const formatTypes = (data) => {
        if (!data) return '';
        if (Array.isArray(data)) return data.join(', ');
        try {
            // Manejar si viene como string JSON
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) return parsed.join(', ');
            return data;
        } catch {
            return data;
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition duration-300">
            {/* Encabezado y Riesgo */}
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">Paciente ID: {p.id}</h3>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${obtenerColorRiesgo(p.nivelRiesgo)}`}>
                    Riesgo: {p.nivelRiesgo}
                </span>
            </div>

            <p className="text-sm text-gray-500 mb-4">
                <span className="font-medium text-gray-700">DNI:</span> {p.dni} |
                <span className="font-medium text-gray-700"> Edad:</span> {p.edad} |
                <span className="font-medium text-gray-700"> Tel:</span> {p.telefono}
            </p>

            <div className="text-sm text-gray-700 space-y-1">
                <p><strong>Género:</strong> {p.genero}</p>
                <p><strong>Ubicación:</strong> {p.ubicacion}</p>
                <hr className="my-2"/>
                
                {/* Nuevos campos de eventos previos */}
                <p className="font-semibold text-sm text-gray-600">Eventos Previos:</p>
                <p><strong>Infarto:</strong> {p.infarto || 'No especificado'}</p>
                <p><strong>ACV:</strong> {p.acv || 'No especificado'}</p>
                <p><strong>Enf. Renal Crónica:</strong> {p.enfermedadRenal || 'No especificado'}</p>
                
                <hr className="my-2"/>
                <p className="font-semibold text-sm text-gray-600">Mediciones y Riesgo:</p>
                <p><strong>Tensión Arterial:</strong> {p.tensionSistolica}/{p.tensionDiastolica}</p>
                <p><strong>Colesterol:</strong> {p.colesterol}</p>
                <p><strong>IMC:</strong> {p.imc}</p>
                <p><strong>Cintura:</strong> {p.cintura} cm</p>
                
                {/* --- Datos Femeninos (solo si es femenino) --- */}
                {p.genero === 'femenino' && (
                    <>
                        <hr className="my-2"/>
                        <p className="font-semibold text-sm text-gray-600">Salud Femenina y Mamaria:</p>
                        
                        <p><strong>Familiar Cáncer Mama:</strong> {p.familiarCancerMama}</p>
                        <p><strong>Punción de Mama:</strong> {p.puncionMama}</p>
                        <p><strong>Mama Densa:</strong> {p.mamaDensa}</p>
                        <p><strong>HIV o Hepatitis B/C:</strong> {p.hivHepatitis || 'No especificado'}</p>
                        <p><strong>Rep. Asistida:</strong> {p.reproduccionAsistida || 'No especificado'}</p>

                        <div>
                            <strong>Tumores ginecológicos:</strong> {p.tumoresGinecologicos}{' '}
                            {(p.tumoresTipo && p.tumoresTipo.length > 0)
                                ? `(${formatTypes(p.tumoresTipo)})`
                                : ''}
                        </div>

                        <div>
                            <strong>Enf. autoinmunes:</strong> {p.enfermedadesAutoinmunes}{' '}
                            {(p.autoinmunesTipo && p.autoinmunesTipo.length > 0)
                                ? `(${formatTypes(p.autoinmunesTipo)})`
                                : ''}
                        </div>

                        <div><strong>Tuvo hijos:</strong> {p.tuvoHijos}
                            {p.tuvoHijos === 'Sí' ? ` (${p.cantidadHijos} hijos, Complicaciones: ${p.complicacionesEmbarazo || 'No especificado'})` : ` (${p.motivoNoHijos || 'No especificado'})`}
                        </div>
                        <div><strong>Ciclos menstruales:</strong> {p.ciclosMenstruales}</div>
                        <div><strong>Histerectomía:</strong> {p.histerectomia}</div>
                        <div><strong>Menopausia:</strong> {p.menopausia}
                            {p.menopausia === 'Sí' ? ` (Edad: ${p.edadMenopausia})` : ''}
                        </div>
                    </>
                )}
            </div>
            
            {/* Botones de Acción */}
            <div className="mt-6 flex gap-3">
                <button 
                    onClick={() => onEdit(p.id)} // CORRECCIÓN 1: Pasa el ID al handler
                    className="flex-1 flex items-center justify-center gap-1 px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                    <EditIcon /> Editar
                </button>
                <button 
                    onClick={() => onCopy(p)} 
                    className="flex-1 flex items-center justify-center gap-1 px-4 py-2 text-sm font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                >
                    <CopyIcon /> Copiar Data
                </button>
                <button 
                    onClick={() => onDelete(p.id)} 
                    className="flex-1 flex items-center justify-center gap-1 px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                    <TrashIcon /> Eliminar
                </button>
            </div>
        </div>
    );
});


function Estadisticas() {
  // CORRECCIÓN 1: useNavigate DEBE estar dentro del componente funcional
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarGraficos, setMostrarGraficos] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false); 
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
  const [pacienteAEliminar, setPacienteAEliminar] = useState(null); 
  const [mensajeNotificacion, setMensajeNotificacion] = useState(null); 

  const [filtros, setFiltros] = useState({
    // Nuevos y existentes para un filtro completo
    edad: '',
    imc: '',
    nivelColesterol: '',
    tensionSistolica: '',
    fumador: '',
    tomaMedicacion: '',
    nivelRiesgo: '',
    // Eventos Previos
    infarto: '',
    acv: '',
    enfermedadRenal: '',
    // Hábitos
    actividadFisica: '',
    horasSueno: '',
    estresCronico: '',
    // Salud Femenina / Mamaria
    tumoresGinecologicos: '',
    enfermedadesAutoinmunes: '',
    hivHepatitis: '', // CAMPO SOLICITADO
    tuvoHijos: '',
    reproduccionAsistida: '', // CAMPO AGREGADO
    familiarCancerMama: '', 
    puncionMama: '',
    mamaDensa: '',
  });

  const handleDelete = (id) => {
    setPacienteAEliminar(id);
    setMostrarModalConfirmacion(true);
  };
  
  const handleEdit = (id) => {
    if (id) {
        // CORRECCIÓN 1: Se asegura que el ID se pasa y navega correctamente
        navigate(`/editar-paciente/${id}`); 
    } else {
        setMensajeNotificacion({ tipo: 'error', texto: 'Error: ID de paciente no definido.' });
        setTimeout(() => setMensajeNotificacion(null), 4000);
    }
  };
  
  // CORRECCIÓN 3: Formato de "Copiar" mejorado con etiquetas legibles.
  const handleCopy = (paciente) => {
    const labelMap = {
      id: 'ID Paciente', dni: 'DNI', fechaNacimiento: 'Fecha de Nacimiento', telefono: 'Teléfono', edad: 'Edad', genero: 'Género', ubicacion: 'Ubicación',
      // Riesgo y Mediciones
      tensionSistolica: 'Tensión Sistólica', tensionDiastolica: 'Tensión Diastólica', colesterol: 'Colesterol Total', nivelRiesgo: 'Nivel de Riesgo', imc: 'IMC',
      peso: 'Peso (kg)', talla: 'Talla (cm)', cintura: 'Cintura (cm)',
      // Hábitos y Condiciones
      tomaMedicacionDiario: 'Toma Medicación Diaria', medicacionCondiciones: 'Condiciones Médicas', fumaDiario: 'Fuma Diario',
      infarto: 'Infarto Previo', acv: 'ACV Previo', enfermedadRenal: 'Enfermedad Renal Crónica',
      actividadFisica: 'Actividad Física', horasSueno: 'Horas de Sueño', estresCronico: 'Estrés Crónico', estresTipo: 'Tipo de Estrés',
      // Salud Femenina
      familiarCancerMama: 'Familiar con Cáncer de Mama', puncionMama: 'Punción de Mama', mamaDensa: 'Mama Densa',
      tumoresGinecologicos: 'Tumores Ginecológicos', tumoresTipo: 'Tipos de Tumores', 
      enfermedadesAutoinmunes: 'Enfermedades Autoinmunes', autoinmunesTipo: 'Tipos de Enf. Autoinmunes', 
      hivHepatitis: 'Presenta HIV o Hepatitis B/C',
      tuvoHijos: 'Tuvo Hijos', reproduccionAsistida: 'Usó Reproducción Asistida', cantidadHijos: 'Cantidad de Hijos',
      complicacionesEmbarazo: 'Complicaciones en Embarazo', motivoNoHijos: 'Motivo No Hijos',
      ciclosMenstruales: 'Ciclos Menstruales', metodoAnticonceptivo: 'Método Anticonceptivo', histerectomia: 'Histerectomía',
      menopausia: 'Menopausia', edadMenopausia: 'Edad de Menopausia', fechaRegistro: 'Fecha de Registro'
    };

    const dataToCopy = Object.entries(paciente)
        .map(([key, value]) => {
            const label = labelMap[key] || key;
            const finalValue = (value === null || value === '' || value === undefined) 
                                ? 'No especificado' 
                                : Array.isArray(value) ? value.join(', ') : value;
            return `${label}: ${finalValue}`;
        })
        .join(' ');

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
      for (const key in filtros) {
        if (filtros[key]) {
          const filtroValor = String(filtros[key]).toLowerCase();
          const pacienteValor = String(p[key] || '').toLowerCase();
          if (!pacienteValor.includes(filtroValor)) {
            return false;
          }
        }
      }
      return true;
    });

    // CORRECCIÓN 2: Ordenar por ID descendente para mostrar los más nuevos primero.
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

      {mostrarFiltros && (
        <div className="p-6 bg-white rounded-xl shadow-lg mb-8">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Filtros</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <input type="number" name="edad" placeholder="Edad Mín." value={filtros.edad} onChange={handleFiltroChange} className="p-2 border rounded-lg"/>
            <input type="text" name="imc" placeholder="Clasif. IMC" value={filtros.imc} onChange={handleFiltroChange} className="p-2 border rounded-lg"/>
            <select name="nivelRiesgo" value={filtros.nivelRiesgo} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">Riesgo (Todos)</option><option value="Bajo">Bajo</option><option value="Moderado">Moderado</option><option value="Alto">Alto</option><option value="Muy Alto">Muy Alto</option><option value="Crítico">Crítico</option></select>
            <select name="fumador" value={filtros.fumador} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">Fuma (Todos)</option><option value="Sí">Sí</option><option value="No">No</option><option value="Ex">Ex-Fumador</option></select>
            <select name="infarto" value={filtros.infarto} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">Infarto</option><option value="Sí">Sí</option><option value="No">No</option></select>
            <select name="acv" value={filtros.acv} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">ACV</option><option value="Sí">Sí</option><option value="No">No</option></select>
            <select name="enfermedadRenal" value={filtros.enfermedadRenal} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">Enf. Renal</option><option value="Sí">Sí</option><option value="No">No</option></select>
            <select name="hivHepatitis" value={filtros.hivHepatitis} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">HIV/Hepatitis</option><option value="Sí">Sí</option><option value="No">No</option></select>
            <select name="reproduccionAsistida" value={filtros.reproduccionAsistida} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">Rep. Asistida</option><option value="Sí">Sí</option><option value="No">No</option></select>
            <select name="familiarCancerMama" value={filtros.familiarCancerMama} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">Fam. Cáncer Mama</option><option value="Sí">Sí</option><option value="No">No</option></select>
            <select name="mamaDensa" value={filtros.mamaDensa} onChange={handleFiltroChange} className="p-2 border rounded-lg"><option value="">Mama Densa</option><option value="Sí">Sí</option><option value="No">No</option></select>
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
          <p className="col-span-full text-center text-gray-500 p-4 bg-white rounded-lg">No se encontraron pacientes.</p>
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
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-xl z-50 ${mensajeNotificacion.tipo === 'success' ? 'bg-green-500' : mensajeNotificacion.tipo === 'error' ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
            {mensajeNotificacion.texto}
        </div>
      )}
    </div>
  );
}

export default Estadisticas;