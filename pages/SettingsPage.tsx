
import React from 'react';
import Card from '../components/common/Card';
import { LogoutIcon } from '../components/common/Icons';

interface SettingsPageProps {
  onLogout: () => void;
  isDebugMode: boolean;
  onToggleDebugMode: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout, isDebugMode, onToggleDebugMode }) => {
  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Configurações</h2>
      <div className="space-y-6">
        <div className="border-t dark:border-gray-700 pt-6">
          <label htmlFor="debug-toggle" className="flex items-center justify-between cursor-pointer">
            <span className="flex flex-col">
              <span className="font-medium text-gray-700 dark:text-gray-300">Modo de Depuração</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Exibe logs detalhados na página de criação.</span>
            </span>
            <div className="relative">
              <input id="debug-toggle" type="checkbox" className="sr-only peer" checked={isDebugMode} onChange={onToggleDebugMode} />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-minecraft-green-600"></div>
            </div>
          </label>
        </div>

        <div className="border-t dark:border-gray-700 pt-6">
            <button
            onClick={onLogout}
            className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center space-x-2 transition-colors"
            >
            <LogoutIcon className="h-5 w-5" />
            <span>Sair (Logout)</span>
            </button>
        </div>
      </div>
    </Card>
  );
};

export default SettingsPage;
