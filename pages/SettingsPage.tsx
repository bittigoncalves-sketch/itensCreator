
import React from 'react';
import Card from '../components/common/Card';
import { LogoutIcon } from '../components/common/Icons';

interface SettingsPageProps {
  onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout }) => {
  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Configurações</h2>
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          Esta é a página de configurações. Mais opções serão adicionadas no futuro.
        </p>
        <button
          onClick={onLogout}
          className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center space-x-2"
        >
          <LogoutIcon className="h-5 w-5" />
          <span>Sair (Logout)</span>
        </button>
      </div>
    </Card>
  );
};

export default SettingsPage;
