
import React from 'react';
import Card from '../components/common/Card';

interface CommunityPageProps {
  onSelectPrompt: (prompt: string) => void;
}

// Pixel Art SVG Components
const EmeraldSwordIcon = () => (
  <svg width="64" height="64" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style={{imageRendering: 'pixelated'}}>
    <path fill="#5A5A5A" d="M6 10h1v3H6z"/>
    <path fill="#787878" d="M7 10h1v3H7z"/>
    <path fill="#A0A0A0" d="M8 11h1v1H8z"/>
    <path fill="#525252" d="M4 8h2v1H4z"/>
    <path fill="#3E3E3E" d="M4 9h2v1H4z"/>
    <path fill="#9C9C9C" d="M5 10h1v1H5z"/>
    <path fill="#737373" d="M6 8h3v1H6z"/>
    <path fill="#525252" d="M6 9h3v1H6z"/>
    <path fill="#369F00" d="M7 1h1v1H7z"/>
    <path fill="#46CF00" d="M7 2h1v1H7z"/>
    <path fill="#5AD500" d="M7 3h1v1H7z"/>
    <path fill="#73E534" d="M7 4h1v2H7z"/>
    <path fill="#84F252" d="M7 6h1v1H7z"/>
    <path fill="#95FF6A" d="M7 7h1v1H7z"/>
    <path fill="#000000" d="M6 1h1v1H6zm2 0h1v1H8zm-2 1h1v1H6zm2 0h1v1H8zm-2 1h1v1H6zm2 0h1v1H8zm-2 1h1v1H6zm2 0h1v1H8zm-3 1h1v1H5zm4 0h1v1H9zm-4 1h1v1H5zm4 0h1v1H9zm-4 1h1v1H5zm4 0h1v1H9zm-4 1h1v1H5zm4 0h1v1H9zm-2 1h1v1H7zm-3 1h1v1H4zm4 0h1v1H8zm-5 1h1v1H3zm6 0h1v1H9zm-5 1h1v1H4zm4 0h1v1H8zm-3 1h1v1H5zm2 0h1v1H7z"/>
  </svg>
);

const ObsidianAppleIcon = () => (
    <svg width="64" height="64" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style={{imageRendering: 'pixelated'}}>
    <path fill="#2E1A47" d="M6 2h4v1H6z"/>
    <path fill="#2E1A47" d="M4 3h2v1H4zm6 0h2v1h-2z"/>
    <path fill="#2E1A47" d="M3 4h2v1H3zm8 0h2v1h-2z"/>
    <path fill="#2E1A47" d="M3 5h1v2H3z"/>
    <path fill="#2E1A47" d="M12 5h1v2h-1z"/>
    <path fill="#2E1A47" d="M3 7h1v2H3z"/>
    <path fill="#2E1A47" d="M12 7h1v2h-1z"/>
    <path fill="#2E1A47" d="M4 9h2v1H4zm6 0h2v1h-2z"/>
    <path fill="#2E1A47" d="M6 10h4v1H6z"/>
    <path fill="#4C2A76" d="M6 3h4v1H6z"/>
    <path fill="#4C2A76" d="M5 4h6v1H5z"/>
    <path fill="#4C2A76" d="M4 5h8v1H4z"/>
    <path fill="#4C2A76" d="M4 6h8v1H4z"/>
    <path fill="#4C2A76" d="M4 7h8v1H4z"/>
    <path fill="#4C2A76" d="M4 8h8v1H4z"/>
    <path fill="#4C2A76" d="M5 9h6v1H5z"/>
    <path fill="#000000" d="M7 1h1v1H7z"/>
    <path fill="#65B400" d="M7 2h1v1H7z"/>
    <path fill="#000000" d="M5 2h1v1H5zm4 0h1v1H9z"/>
    <path fill="#000000" d="M3 3h1v1H3zm8 0h1v1h-1z"/>
    <path fill="#000000" d="M2 4h1v1H2zm10 0h1v1h-1z"/>
    <path fill="#000000" d="M2 5h1v1H2zm10 0h1v1h-1z"/>
    <path fill="#000000" d="M2 6h1v1H2zm10 0h1v1h-1z"/>
    <path fill="#000000" d="M2 7h1v1H2zm10 0h1v1h-1z"/>
    <path fill="#000000" d="M2 8h1v1H2zm10 0h1v1h-1z"/>
    <path fill="#000000" d="M3 9h1v1H3zm8 0h1v1h-1z"/>
    <path fill="#000000" d="M5 10h1v1H5zm4 0h1v1H9z"/>
    <path fill="#000000" d="M7 11h2v1H7z"/>
  </svg>
);

const LeatherBootsIcon = () => (
    <svg width="64" height="64" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style={{imageRendering: 'pixelated'}}>
    <path fill="#3D200C" d="M3 10h3v1H3zm7 0h3v1h-3z"/>
    <path fill="#542D11" d="M3 9h3v1H3zm7 0h3v1h-3z"/>
    <path fill="#6E3A16" d="M3 8h3v1H3zm7 0h3v1h-3z"/>
    <path fill="#85451A" d="M4 7h2v1H4zm7 0h2v1h-2z"/>
    <path fill="#A05220" d="M3 6h1v2H3zm7 0h1v2h-1z"/>
    <path fill="#000000" d="M2 6h1v1H2zm7 0h1v1H9z"/>
    <path fill="#000000" d="M2 7h1v1H2zm7 0h1v1H9z"/>
    <path fill="#000000" d="M2 8h1v1H2zm7 0h1v1H9z"/>
    <path fill="#000000" d="M2 9h1v1H2zm7 0h1v1H9z"/>
    <path fill="#000000" d="M2 10h1v1H2zm7 0h1v1H9z"/>
    <path fill="#000000" d="M3 11h1v1H3zm7 0h1v1h-1z"/>
    <path fill="#000000" d="M4 11h1v1H4zm5 0h1v1H9z"/>
    <path fill="#000000" d="M6 10h1v1H6zm3 0h1v1H9z"/>
  </svg>
);

const LapisPickaxeIcon = () => (
    <svg width="64" height="64" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style={{imageRendering: 'pixelated'}}>
    <path fill="#193B96" d="M2 3h1v1H2zm1 1h1v1H3zm7 0h1v1h-1zm1 1h1v1h-1z"/>
    <path fill="#2556D8" d="M3 3h1v1H3zm7 0h1v1h-1zm-6 1h1v1H4zm7 0h1v1h-1z"/>
    <path fill="#85451A" d="M4 5h1v1H4zm1 1h1v1H5zm1 1h1v1H6zm1 1h1v1H7zm1 1h1v1H8zm1 1h1v1H9z"/>
    <path fill="#A05220" d="M5 5h1v1H5zm1 1h1v1H6zm1 1h1v1H7zm1 1h1v1H8zm1 1h1v1H9z"/>
    <path fill="#000000" d="M1 3h1v1H1zm2 0h1v1H3zm7 0h1v1h-1zm2 0h1v1h-1zm-10 1h1v1H2zm2 0h1v1H4zm7 0h1v1h-1zm2 0h1v1h-1zm-8 1h1v1H3zm2 0h1v1H5zm-1 1h1v1H4zm2 0h1v1H6zm-1 1h1v1H5zm2 0h1v1H7zm-1 1h1v1H6zm2 0h1v1H8zm-1 1h1v1H7zm2 0h1v1H9zm-1 1h1v1H8zm2 0h1v1h-1z"/>
  </svg>
);

const communityAddons = [
  { name: 'Espada de Esmeralda', prompt: 'Uma espada de esmeralda que dá 8 de dano e tem durabilidade de 2000.', icon: <EmeraldSwordIcon /> },
  { name: 'Maçã de Obsidiana', prompt: 'Uma maçã feita de obsidiana que dá ao jogador resistência ao fogo e lentidão por 2 minutos.', icon: <ObsidianAppleIcon /> },
  { name: 'Botas Velozes', prompt: 'Botas de couro que aumentam a velocidade do jogador em 20% quando equipadas.', icon: <LeatherBootsIcon /> },
  { name: 'Picareta de Lápis-lazúli', prompt: 'Uma picareta de lápis-lazúli que tem a mesma velocidade do ferro, mas encanta com mais facilidade.', icon: <LapisPickaxeIcon /> },
];


const CommunityPage: React.FC<CommunityPageProps> = ({ onSelectPrompt }) => {
  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Comunidade</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Inspire-se com add-ons criados pela comunidade. Clique em "Experimentar" para usar um prompt como ponto de partida!</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {communityAddons.map((addon) => (
          <div key={addon.name} className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-200 dark:border-gray-700">
            <div className="p-4 bg-gray-100 dark:bg-gray-900/50 flex justify-center items-center h-40">
                 {addon.icon}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{addon.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 h-16">{addon.prompt}</p>
              <button
                onClick={() => onSelectPrompt(addon.prompt)}
                className="w-full mt-4 bg-minecraft-blue-600 text-white px-3 py-1.5 text-sm font-semibold rounded-md hover:bg-minecraft-blue-700 transition-colors"
              >
                Experimentar
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CommunityPage;
