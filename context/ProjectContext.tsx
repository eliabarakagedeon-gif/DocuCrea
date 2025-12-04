import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Project, ProjectStatus } from '../types';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  createProject: (templateId: string, title: string) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  getProject: (id: string) => Project | undefined;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const createProject = (templateId: string, title: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      title,
      templateId,
      status: ProjectStatus.DRAFT,
      media: [],
      script: '',
      createdAt: new Date()
    };
    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
    return newProject.id;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates };
        if (currentProject?.id === id) {
          setCurrentProject(updated);
        }
        return updated;
      }
      return p;
    }));
  };

  const getProject = (id: string) => projects.find(p => p.id === id);

  return (
    <ProjectContext.Provider value={{ projects, currentProject, createProject, updateProject, getProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("useProject must be used within a ProjectProvider");
  return context;
};