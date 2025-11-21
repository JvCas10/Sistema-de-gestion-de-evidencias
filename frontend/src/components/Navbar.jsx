import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-400 text-white shadow-lg">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <img src="/MP_logo.png" alt="MP Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold">Sistema DICRI</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/dashboard" className="hover:text-blue-100 transition">
              Dashboard
            </Link>
            <Link to="/expedientes" className="hover:text-blue-100 transition">
              Expedientes
            </Link>
            {user?.rol === 'Coordinador' && (
              <Link to="/revision" className="hover:text-blue-100 transition">
                Revisión
              </Link>
            )}
            <Link to="/reportes" className="hover:text-blue-100 transition">
              Reportes
            </Link>
            
            <div className="flex items-center space-x-4 border-l border-blue-300 pl-6">
              <span className="text-sm">
                {user?.nombre} ({user?.rol})
              </span>
              <button
                onClick={handleLogout}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition"
              >
                Salir
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded hover:bg-blue-500 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link 
              to="/dashboard" 
              className="block py-2 px-4 hover:bg-blue-500 rounded transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/expedientes" 
              className="block py-2 px-4 hover:bg-blue-500 rounded transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Expedientes
            </Link>
            {user?.rol === 'Coordinador' && (
              <Link 
                to="/revision" 
                className="block py-2 px-4 hover:bg-blue-500 rounded transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Revisión
              </Link>
            )}
            <Link 
              to="/reportes" 
              className="block py-2 px-4 hover:bg-blue-500 rounded transition"
              onClick={() => setIsMenuOpen(false)}
            >
              Reportes
            </Link>
            <div className="border-t border-blue-300 pt-2 mt-2">
              <div className="py-2 px-4 text-sm">
                {user?.nombre} ({user?.rol})
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left py-2 px-4 bg-blue-500 hover:bg-blue-600 rounded transition"
              >
                Salir
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;