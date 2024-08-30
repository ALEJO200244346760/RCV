import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Asegúrate de que la ruta sea correcta
import Header from './components/Header';
import Estadisticas from './components/Estadisticas';
import Formulario from './components/Formulario';
import EditarPaciente from './components/EditarPaciente';
import TomarPresion from './components/tomarPresion';
import Login from './components/Login';
import Register from './components/Register'; // Importa el componente Register


function App() {
  return (
    <AuthProvider>
    <Router>
      <Header />  {/* Muestra el Header en todas las páginas */}
      <Routes>
        <Route path="/" element={<Formulario />} /> {/* Página principal */}
        <Route path="/tomarPresion" element={<TomarPresion />} />
        <Route path="/formulario" element={<Formulario />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/editar-paciente/:id" element={<EditarPaciente />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;

