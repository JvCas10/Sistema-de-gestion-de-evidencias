import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ListaExpedientes from './pages/Expedientes/ListaExpedientes';
import CrearExpediente from './pages/Expedientes/CrearExpediente';
import DetalleExpediente from './pages/Expedientes/DetalleExpediente';
import RevisionExpedientes from './pages/Revision/RevisionExpedientes';
import Reportes from './pages/Reportes/Reportes';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/expedientes"
            element={
              <PrivateRoute>
                <ListaExpedientes />
              </PrivateRoute>
            }
          />

          <Route
            path="/expedientes/crear"
            element={
              <PrivateRoute roles={['Tecnico', 'Administrador']}>
                <CrearExpediente />
              </PrivateRoute>
            }
          />

          <Route
            path="/expedientes/:id"
            element={
              <PrivateRoute>
                <DetalleExpediente />
              </PrivateRoute>
            }
          />

          <Route
            path="/revision"
            element={
              <PrivateRoute roles={['Coordinador', 'Administrador']}>
                <RevisionExpedientes />
              </PrivateRoute>
            }
          />

          <Route
            path="/reportes"
            element={
              <PrivateRoute>
                <Reportes />
              </PrivateRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;