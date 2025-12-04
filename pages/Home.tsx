import React from 'react';
import { Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { Play, Clock, Plus, ArrowRight, Video, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Home: React.FC = () => {
  const { projects } = useProject();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 py-20 px-4">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://picsum.photos/1920/1080?blur=10')] bg-cover bg-center" />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            {t.home.heroTitle}
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            {t.home.heroDesc}
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/create" className="bg-white text-indigo-900 px-8 py-3 rounded-full font-bold text-lg hover:bg-blue-50 transition-transform hover:scale-105 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {t.home.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">{t.home.recentProjects}</h2>
          {projects.length > 0 && (
             <Link to="/create" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
               {t.navbar.newProject} <ArrowRight className="w-4 h-4" />
             </Link>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="border-2 border-dashed border-slate-700 rounded-2xl p-12 text-center bg-slate-900/50 hover:bg-slate-900/80 transition-colors">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">{t.home.noProjects}</h3>
            <p className="text-slate-400 mb-6">{t.home.startTemplate}</p>
            <Link to="/create" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300">
              <Plus className="w-4 h-4" /> {t.home.createFirst}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <Link key={project.id} to={`/editor/${project.id}`} className="group block bg-slate-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all">
                <div className="aspect-video bg-slate-700 relative">
                  {project.media.length > 0 ? (
                     <img src={project.media[0].url} alt={project.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <Play className="w-12 h-12 opacity-50" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                     <Clock className="w-3 h-3" /> 00:45
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-white mb-1 truncate">{project.title}</h3>
                  <p className="text-sm text-slate-400">Modifié il y a 2h</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      
      {/* Features preview */}
      <section className="bg-slate-900 py-16 px-4 border-t border-slate-800">
         <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
               <div className="w-12 h-12 bg-blue-900/30 text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                 <Video className="w-6 h-6" />
               </div>
               <h3 className="text-lg font-semibold text-white mb-2">{t.home.features.editTitle}</h3>
               <p className="text-slate-400 text-sm">{t.home.features.editDesc}</p>
            </div>
             <div className="text-center p-6">
               <div className="w-12 h-12 bg-purple-900/30 text-purple-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                 <div className="font-bold text-xl">AI</div>
               </div>
               <h3 className="text-lg font-semibold text-white mb-2">{t.home.features.aiTitle}</h3>
               <p className="text-slate-400 text-sm">{t.home.features.aiDesc}</p>
            </div>
             <div className="text-center p-6">
               <div className="w-12 h-12 bg-emerald-900/30 text-emerald-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                 <Zap className="w-6 h-6" />
               </div>
               <h3 className="text-lg font-semibold text-white mb-2">{t.home.features.tplTitle}</h3>
               <p className="text-slate-400 text-sm">{t.home.features.tplDesc}</p>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Home;