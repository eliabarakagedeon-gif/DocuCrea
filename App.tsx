import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateProject from './pages/CreateProject';
import Editor from './pages/Editor';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';
import { ProjectProvider } from './context/ProjectContext';
import { LanguageProvider } from './context/LanguageContext';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ProjectProvider>
        <HashRouter>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<CreateProject />} />
                <Route path="/editor/:projectId" element={<Editor />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </HashRouter>
      </ProjectProvider>
    </LanguageProvider>
  );
};

export default App;