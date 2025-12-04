import React from 'react';
import { User, Settings, LogOut, CreditCard } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Profile: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="bg-slate-800 p-8 flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
            JD
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t.profile.title}</h1>
            <p className="text-slate-400">{t.profile.desc}</p>
          </div>
        </div>

        <div className="p-6 space-y-2">
          <ProfileLink icon={<User />} label={t.profile.edit} />
          <ProfileLink icon={<CreditCard />} label={t.profile.subscription} />
          <ProfileLink icon={<Settings />} label={t.profile.prefs} />
          <div className="h-px bg-slate-800 my-2" />
          <ProfileLink icon={<LogOut />} label={t.profile.logout} danger />
        </div>
      </div>
    </div>
  );
};

const ProfileLink: React.FC<{ icon: React.ReactNode, label: string, danger?: boolean }> = ({ icon, label, danger }) => (
  <button className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
    danger 
      ? 'text-red-400 hover:bg-red-900/20' 
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`}>
    {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
    <span className="font-medium">{label}</span>
  </button>
);

export default Profile;