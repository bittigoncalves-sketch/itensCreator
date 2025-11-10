
import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/common/Card';
import { SavedAddon } from '../types';
import { TrashIcon, PencilIcon } from '../components/common/Icons';
import { resizeImage } from '../utils';

interface MyAddonsPageProps {
  onLoadAddon: (addon: SavedAddon) => void;
}

const MyAddonsPage: React.FC<MyAddonsPageProps> = ({ onLoadAddon }) => {
  const [savedAddons, setSavedAddons] = useState<SavedAddon[]>([]);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [editingAddonId, setEditingAddonId] = useState<string | null>(null);

  useEffect(() => {
    const savedAddonsRaw = localStorage.getItem('savedAddons');
    if (savedAddonsRaw) {
      const addons: SavedAddon[] = JSON.parse(savedAddonsRaw);
      // Sort by most recent first
      addons.sort((a, b) => b.timestamp - a.timestamp);
      setSavedAddons(addons);
    }
  }, []);

  const handleDelete = (addonId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este add-on? Esta ação não pode ser desfeita.")) {
      const updatedAddons = savedAddons.filter(addon => addon.id !== addonId);
      setSavedAddons(updatedAddons);
      localStorage.setItem('savedAddons', JSON.stringify(updatedAddons));
    }
  };

  const handleEditIconClick = (addonId: string) => {
    setEditingAddonId(addonId);
    iconInputRef.current?.click();
  };

  const handleIconChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editingAddonId) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Str = e.target?.result as string;
        if (!base64Str) return;

        const resizedIcon = await resizeImage(base64Str, 64, 64);
        
        const updatedAddons = savedAddons.map(addon => {
          if (addon.id === editingAddonId) {
            return { ...addon, pixelArt: resizedIcon };
          }
          return addon;
        });

        setSavedAddons(updatedAddons);
        localStorage.setItem('savedAddons', JSON.stringify(updatedAddons));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing icon:", error);
      alert("Falha ao processar o ícone. Por favor, tente uma imagem diferente.");
    } finally {
      // Reset for next upload
      if(iconInputRef.current) iconInputRef.current.value = '';
      setEditingAddonId(null);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Meus Add-ons Salvos</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Aqui estão seus add-ons salvos. Carregue-os para continuar editando ou exportá-los.</p>
      
      <input 
        type="file" 
        ref={iconInputRef} 
        onChange={handleIconChange} 
        accept="image/png, image/jpeg" 
        style={{ display: 'none' }} 
      />

      {savedAddons.length === 0 ? (
        <div className="text-center py-10 px-6 bg-gray-50 dark:bg-gray-800/20 rounded-lg">
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Você ainda não salvou nenhum add-on.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Use o botão "Salvar Add-on" na página do Criador depois de gerar um para salvá-lo aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedAddons.map((addon) => (
            <div key={addon.id} className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md overflow-hidden flex flex-col justify-between border border-gray-200 dark:border-gray-700 transition-transform hover:scale-105 hover:shadow-lg">
              <div className="p-4 flex-grow">
                {addon.pixelArt ? (
                  <div className="mb-4 p-2 bg-checkerboard rounded-md flex justify-center aspect-square">
                    <img src={addon.pixelArt} alt={addon.name} className="w-full h-full" style={{ imageRendering: 'pixelated' }} />
                  </div>
                ) : (
                   <div className="mb-4 p-2 bg-gray-200 dark:bg-gray-700 rounded-md flex justify-center items-center aspect-square text-gray-400 dark:text-gray-500">
                      Sem Ícone
                   </div>
                )}
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 truncate" title={addon.name}>{addon.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 h-16 overflow-hidden text-ellipsis">{addon.prompt}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Salvo em: {new Date(addon.timestamp).toLocaleDateString()}</p>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-900/50 flex gap-2">
                <button
                  onClick={() => onLoadAddon(addon)}
                  className="w-full bg-minecraft-green-600 text-white px-3 py-1.5 text-sm font-semibold rounded-md hover:bg-minecraft-green-700 transition-colors"
                >
                  Carregar
                </button>
                <button
                  onClick={() => handleEditIconClick(addon.id)}
                  className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  aria-label="Alterar Ícone"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(addon.id)}
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  aria-label="Excluir"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default MyAddonsPage;