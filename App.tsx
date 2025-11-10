
import React, { useState } from 'react';
import { Page, SavedAddon } from './types';
import LoginPage from './pages/LoginPage';
import CreatorPage from './pages/CreatorPage';
import SettingsPage from './pages/SettingsPage';
import CommunityPage from './pages/CommunityPage';
import MyAddonsPage from './pages/MyAddonsPage';
import ChatPage from './pages/ChatPage';
import { SettingsIcon, UsersIcon, PickaxeIcon, ArchiveIcon, ChatBubbleIcon } from './components/common/Icons';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>(Page.CREATOR);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const [initialAddon, setInitialAddon] = useState<SavedAddon | null>(null);
  const [isDebugMode, setIsDebugMode] = useState(() => localStorage.getItem('isDebugMode') === 'true');

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage(Page.CREATOR);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };
  
  const handleSelectPrompt = (prompt: string) => {
    setInitialPrompt(prompt);
    setInitialAddon(null);
    setCurrentPage(Page.CREATOR);
  };

  const handleLoadAddon = (addon: SavedAddon) => {
    setInitialAddon(addon);
    setInitialPrompt(null);
    setCurrentPage(Page.CREATOR);
  };

  const toggleDebugMode = () => {
    const newMode = !isDebugMode;
    setIsDebugMode(newMode);
    localStorage.setItem('isDebugMode', String(newMode));
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const NavButton: React.FC<{page: Page, label: string, icon?: React.ReactNode}> = ({page, label, icon}) => (
    <button
      onClick={() => setCurrentPage(page)}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${currentPage === page ? 'bg-minecraft-green-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-transparent text-gray-900 dark:text-gray-100 font-sans">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <PickaxeIcon className="h-7 w-7 text-minecraft-green-500" />
            <h1 className="text-xl font-bold tracking-tight text-gray-800 dark:text-gray-200">
              Criador de Add-ons
            </h1>
            {isDebugMode && (
              <span className="text-xs font-mono bg-orange-200 text-orange-800 dark:bg-orange-800 dark:text-orange-200 px-2 py-0.5 rounded-md">
                DEBUG
              </span>
            )}
          </div>
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-gray-200/50 dark:bg-gray-800/50 p-1 rounded-lg">
             <NavButton page={Page.CREATOR} label="Criador" />
             <NavButton page={Page.MY_ADDONS} label="Meus Add-ons" icon={<ArchiveIcon className="h-4 w-4" />} />
             <NavButton page={Page.COMMUNITY} label="Comunidade" icon={<UsersIcon className="h-4 w-4" />} />
             <NavButton page={Page.CHAT} label="Chat" icon={<ChatBubbleIcon className="h-4 w-4" />} />
            <button
              onClick={() => setCurrentPage(Page.SETTINGS)}
              className={`p-2 rounded-lg transition-colors ${currentPage === Page.SETTINGS ? 'bg-minecraft-green-600 text-white' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              aria-label="Configurações"
            >
              <SettingsIcon className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-4xl mx-auto">
          {currentPage === Page.CREATOR && <CreatorPage 
              initialPrompt={initialPrompt} 
              clearInitialPrompt={() => setInitialPrompt(null)} 
              initialAddon={initialAddon}
              clearInitialAddon={() => setInitialAddon(null)}
              isDebugMode={isDebugMode}
            />}
          {currentPage === Page.MY_ADDONS && <MyAddonsPage onLoadAddon={handleLoadAddon} />}
          {currentPage === Page.COMMUNITY && <CommunityPage onSelectPrompt={handleSelectPrompt} />}
          {currentPage === Page.CHAT && <ChatPage />}
          {currentPage === Page.SETTINGS && <SettingsPage onLogout={handleLogout} isDebugMode={isDebugMode} onToggleDebugMode={toggleDebugMode} />}
        </div>
      </main>
    </div>
  );
};

export default App;
