import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Footer from './Footer';

interface PublicPageLayoutProps {
  children: React.ReactNode;
}

const PublicPageLayout: React.FC<PublicPageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <header className="py-4 px-4 sm:px-6 lg:px-8 pt-14 lg:pt-6">
        <Link to="/" className="inline-flex items-center text-text-primary dark:text-white hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al inicio
        </Link>
      </header>
      <main className="flex-grow container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Footer />
      </div>
    </div>
  );
};

export default PublicPageLayout; 