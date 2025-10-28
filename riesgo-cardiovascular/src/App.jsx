import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// Componentes
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
import Final from './components/Final'; // 👈 Importamos la página Final

// Contexto de autenticación
import { useAuth } from './context/AuthContext';

function App() {
  const { token, roles } = useAuth();

  const isCardiologo = Array.isArray(roles) && roles.includes('ROLE_CARDIOLOGO');
  const isCardiologia = Array.isArray(roles) && roles.includes('ROLE_CARDIOLOGIA');

  return (
    <Router>
      <Header />
      <Routes>

        {/* Página de inicio: Formulario (acceso libre) */}
        <Route path="/" element={<Formulario />} />

        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas (requieren autenticación) */}
        <Route 
          path="/rcv" 
          element={token ? <Rcv /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/tomarPresion" 
          element={token ? <TomarPresion /> : <Navigate to="/login" />} 
        />

        {/* Rutas protegidas por roles */}
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

        {/* 👇 Nueva ruta para la página Final */}
        <Route path="/final" element={<Final />} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;
