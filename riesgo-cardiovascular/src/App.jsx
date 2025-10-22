import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Estadisticas from './components/Estadisticas';
import Formulario from './components/Formulario';
import EditarPaciente from './components/EditarPaciente';
import TomarPresion from './components/tomarPresion';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import Rcv from './components/Rcv';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import { useAuth } from './context/AuthContext';

function App() {
  const { token, roles } = useAuth();

  const isCardiologo = Array.isArray(roles) && roles.includes('ROLE_CARDIOLOGO');
  const isCardiologia = Array.isArray(roles) && roles.includes('ROLE_CARDIOLOGIA');

  return (
    <Router>
      <Header />
      <Routes>
        {/* Página de inicio: Formulario (requiere solo estar autenticado) */}
        <Route 
          path="/" 
          element={
            token 
              ? <Formulario /> 
              : <Navigate to="/login" />
          } 
        />

        {/* Acceso libre */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Acceso autenticado (sin requerir rol) */}
        <Route 
          path="/rcv" 
          element={token ? <Rcv /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/tomarPresion" 
          element={token ? <TomarPresion /> : <Navigate to="/login" />} 
        />

        {/* Acceso restringido por rol */}
        <Route 
          path="/estadisticas" 
          element={
            <RoleProtectedRoute 
              element={<Estadisticas />} 
              allowedRoles={['ROLE_CARDIOLOGO']} 
            />
          } 
        />
        <Route
          path="/editar-paciente/:id"
          element={
            <RoleProtectedRoute
              element={<EditarPaciente />}
              allowedRoles={['ROLE_CARDIOLOGO']}
            />
          }
        />
        <Route
          path="/admin-panel"
          element={
            <RoleProtectedRoute
              element={<AdminPanel />}
              allowedRoles={['ROLE_CARDIOLOGO']}
            />
          }
        />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
