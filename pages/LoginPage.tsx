
import React, { useState } from 'react';
import Card from '../components/common/Card';
import { PickaxeIcon } from '../components/common/Icons';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de login, sem validação real
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center items-center gap-4 mb-6">
           <PickaxeIcon className="h-10 w-10 text-minecraft-green-500" />
           <h1 className="text-3xl font-bold tracking-tight text-center text-gray-900 dark:text-gray-100">
             Criador de Add-ons
           </h1>
        </div>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-white">Acessar a Plataforma</h2>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                Usuário
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-minecraft-green-500 dark:text-white transition"
                placeholder="usuário (simulado)"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-minecraft-green-500 dark:text-white transition"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-minecraft-green-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-minecraft-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-minecraft-green-500 dark:focus:ring-offset-gray-900 transition-transform hover:scale-105"
            >
              Entrar
            </button>
          </form>
        </Card>
         <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-8">
          Powered by Google Gemini API
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
