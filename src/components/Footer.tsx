import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="mt-12 pt-8 pb-8 border-t border-gray-200 dark:border-gray-700 text-sm">
      <ul className="flex flex-col items-center text-center sm:flex-row sm:justify-center sm:space-x-6 space-y-4 sm:space-y-0">
        <li>
          <Link to="/aviso-legal" className="text-text-secondary hover:text-primary transition-colors">
            Aviso Legal y Términos
          </Link>
        </li>
        <li>
          <Link to="/politica-de-privacidad" className="text-text-secondary hover:text-primary transition-colors">
            Política de privacidad
          </Link>
        </li>
        <li>
          <Link to="/politica-de-cookies" className="text-text-secondary hover:text-primary transition-colors">
            Política de cookies
          </Link>
        </li>
        <li>
          <Link to="/condiciones-generales-de-compra" className="text-text-secondary hover:text-primary transition-colors">
            Términos y condiciones generales de compra
          </Link>
        </li>
      </ul>
      <div className="text-center mt-8 text-xs text-text-secondary dark:text-gray-500">
        © {new Date().getFullYear()} Desafío Azul. Todos los derechos reservados.
      </div>
    </footer>
  );
};

export default Footer; 