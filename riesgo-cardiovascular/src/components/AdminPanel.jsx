import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers, updateUserRoleAndLocation } from '../services/userService';

const AdminPanel = () => {
  const { roles } = useAuth(); // Obtener roles desde el contexto
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Manejo de errores

  // Roles y ubicaciones disponibles
  const rolesDisponibles = ['CARDIOLOGO', 'ENFERMERO'];
  const ubicacionesDisponibles = ['DEM NORTE', 'DEM CENTRO', 'DEM OESTE', 'DAPS', 'HPA', 'HU'];

  useEffect(() => {
    if (roles.includes('ADMIN')) {
      cargarUsuarios();
    }
  }, [roles]);

  const cargarUsuarios = async () => {
    try {
      const data = await getUsers();
      setUsuarios(data);
    } catch (error) {
      setError('Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (usuarioId, nuevoRol) => {
    try {
      await updateUserRoleAndLocation(usuarioId, { rol: nuevoRol });
      cargarUsuarios(); // Volver a cargar la lista de usuarios
    } catch (error) {
      setError('Error actualizando rol');
    }
  };

  const handleLocationChange = async (usuarioId, nuevaUbicacion) => {
    try {
      await updateUserRoleAndLocation(usuarioId, { ubicacion: nuevaUbicacion });
      cargarUsuarios();
    } catch (error) {
      setError('Error actualizando ubicación');
    }
  };

  if (loading) {
    return <div>Cargando usuarios...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="admin-panel">
      <h1 className="text-2xl font-bold">Panel de Administración</h1>
      <table className="table-auto w-full mt-4">
        <thead>
          <tr>
            <th className="px-4 py-2">Nombre</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Rol</th>
            <th className="px-4 py-2">Ubicación</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td className="border px-4 py-2">{usuario.nombre} {usuario.apellido}</td>
              <td className="border px-4 py-2">{usuario.email}</td>
              <td className="border px-4 py-2">
                <select
                  value={usuario.rol?.nombre || ''}
                  onChange={(e) => handleRoleChange(usuario.id, e.target.value)}
                >
                  <option value="">Seleccionar Rol</option>
                  {rolesDisponibles.map((rol) => (
                    <option key={rol} value={rol}>
                      {rol}
                    </option>
                  ))}
                </select>
              </td>
              <td className="border px-4 py-2">
                <select
                  value={usuario.ubicacion?.nombre || ''}
                  onChange={(e) => handleLocationChange(usuario.id, e.target.value)}
                >
                  <option value="">Seleccionar Ubicación</option>
                  {ubicacionesDisponibles.map((ubicacion) => (
                    <option key={ubicacion} value={ubicacion}>
                      {ubicacion}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
