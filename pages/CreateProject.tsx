import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TEMPLATES } from '../constants';
import { useProject } from '../context/ProjectContext';
import { Briefcase, Heart, Globe, User, Camera, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const iconMap: Record<string, React.ReactNode> = {
  Briefcase: <Briefcase />,
  Heart: <Heart />,
  Globe: <Globe />,
  User: <User />,
  Camera: <Camera />,
};

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { createProject } = useProject();
  const { t } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState('');

  const handleCreate = () => {
    if (selectedTemplate && projectTitle) {
      const id = createProject(selectedTemplate, projectTitle);
      navigate(`/editor/${id}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">{t.create.title}</h1>
      <p className="text-slate-400 mb-8">{t.create.subtitle}</p>

      {/* Title Input */}
      <div className="mb-10">
        <label className="block text-sm font-medium text-slate-300 mb-2">{t.create.projectTitle}</label>
        <input
          type="text"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          placeholder={t.create.placeholder}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {TEMPLATES.map((template) => {
          const translatedTpl = t.create.templates[template.id] || { name: template.name, description: template.description };
          
          return (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className={`cursor-pointer rounded-xl p-6 border-2 transition-all ${
                selectedTemplate === template.id
                  ? 'bg-blue-900/20 border-blue-500 shadow-lg shadow-blue-900/20'
                  : 'bg-slate-800 border-transparent hover:border-slate-600'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                selectedTemplate === template.id ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                {iconMap[template.icon]}
              </div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{translatedTpl.name}</h3>
                <span className="text-xs px-2 py-1 bg-slate-700 rounded-md text-slate-300">{template.category}</span>
              </div>
              <p className="text-sm text-slate-400 mb-4">{translatedTpl.description}</p>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span>{t.create.difficulty}: {template.difficulty}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end sticky bottom-6">
        <button
          disabled={!selectedTemplate || !projectTitle}
          onClick={handleCreate}
          className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-lg transition-all ${
            selectedTemplate && projectTitle
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {t.create.start} <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CreateProject;