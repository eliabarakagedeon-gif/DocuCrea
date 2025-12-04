import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Video, PlusCircle, User, Zap, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();

  const isActive = (path: string) => location.pathname === path;

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Video className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">DocCrea</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`${isActive('/') ? 'text-blue-400' : 'text-slate-400 hover:text-white'} transition-colors`}>
              {t.navbar.home}
            </Link>
            <Link to="/pricing" className={`${isActive('/pricing') ? 'text-blue-400' : 'text-slate-400 hover:text-white'} transition-colors`}>
              {t.navbar.pricing}
            </Link>
          </div>

          <div className="flex items-center gap-4">
             {/* Language Toggle */}
             <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-slate-800"
             >
               <Globe className="w-4 h-4" />
               <span className="uppercase text-xs font-bold">{language}</span>
             </button>

             <Link to="/create">
              <button className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition-all transform hover:scale-105">
                <PlusCircle className="w-4 h-4" />
                <span>{t.navbar.newProject}</span>
              </button>
              {/* Mobile Icon Only */}
               <button className="sm:hidden flex items-center justify-center bg-blue-600 text-white p-2 rounded-full">
                <PlusCircle className="w-5 h-5" />
              </button>
            </Link>
            
            <Link to="/profile" className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;