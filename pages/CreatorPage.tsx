import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { GoogleGenAI, Type, Modality } from "@google/genai";
import Card from '../components/common/Card';
import Spinner from '../components/common/Spinner';
import { DownloadIcon, UploadIcon, PhotoIcon, SparklesIcon, SaveIcon, SearchIcon, EyeIcon, FileCodeIcon } from '../components/common/Icons';
import { EvaluationResult, SavedAddon } from '../types';

// Componente CodeBlock
const CodeBlock: React.FC<{ path: string; content: string }> = ({ path, content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  let displayContent = content;
  try {
    const parsed = JSON.parse(content);
    displayContent = JSON.stringify(parsed, null, 2);
  } catch (e) { /* ignore if not JSON */ }

  return (
    <div className="bg-gray-100 dark:bg-gray-900/50 rounded-lg my-4 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-200/50 dark:bg-gray-800/50 rounded-t-lg">
        <p className="text-sm font-mono text-gray-600 dark:text-gray-400">{path}</p>
        <button onClick={handleCopy} className="text-xs font-semibold px-2 py-1 rounded-md bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors">
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm"><code>{displayContent}</code></pre>
    </div>
  );
};

interface CreatorPageProps {
  initialPrompt: string | null;
  clearInitialPrompt: () => void;
  initialAddon: SavedAddon | null;
  clearInitialAddon: () => void;
}

const parseJsonFromMarkdown = (markdown: string): any => {
    const match = markdown.match(/```(json)?\s*([\s\S]+?)\s*```/);
    if (match && match[2]) {
        try {
            return JSON.parse(match[2]);
        } catch (e) {
            console.error("Failed to parse JSON from markdown", e);
            throw new Error("A IA retornou um JSON inválido para os arquivos do add-on.");
        }
    }
    try {
        return JSON.parse(markdown);
    } catch(e) {
         throw new Error("Não foi possível extrair o JSON da resposta da IA. Verifique o console para mais detalhes.");
    }
};

const resizeImage = (base64Str: string, width: number, height: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }
      // Garante a renderização em estilo pixel art (sem anti-aliasing)
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (error) => {
      reject(error);
    };
  });
};

const availableVersions = ["1.21.120", "1.20.80", "1.20.70", "1.20.60", "1.20.50", "1.20.40", "1.20.30"];

const CreatorPage: React.FC<CreatorPageProps> = ({ initialPrompt, clearInitialPrompt, initialAddon, clearInitialAddon }) => {
  const [prompt, setPrompt] = useState("Uma espada de esmeralda que dá 8 de dano e tem durabilidade de 2000.");
  const [version, setVersion] = useState(availableVersions[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState<Record<string, string> | null>(null);
  const [pixelArt, setPixelArt] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [addonName, setAddonName] = useState<string | null>(null);
  const [addonDescription, setAddonDescription] = useState<string | null>(null);
  const [searchSources, setSearchSources] = useState<any[] | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<string | null>(null);

  const resetState = () => {
      setGeneratedFiles(null);
      setPixelArt(null);
      setEvaluation(null);
      setError(null);
      setAddonName(null);
      setAddonDescription(null);
      setSearchSources(null);
      setImageAnalysis(null);
  };

  useEffect(() => {
    if(initialPrompt) {
      setPrompt(initialPrompt);
      resetState();
      clearInitialPrompt();
    }
  }, [initialPrompt, clearInitialPrompt]);

  useEffect(() => {
    if (initialAddon) {
      setPrompt(initialAddon.prompt);
      setGeneratedFiles(initialAddon.generatedFiles);
      setPixelArt(initialAddon.pixelArt);
      setEvaluation(initialAddon.evaluation);
      setAddonName(initialAddon.name);
      setImageAnalysis(initialAddon.imageAnalysis);
      setSearchSources(initialAddon.searchSources);
      setVersion(initialAddon.version || availableVersions[0]);
      setError(null);
      clearInitialAddon();
    }
  }, [initialAddon, clearInitialAddon]);


  const handleGenerate = async () => {
    if (!prompt.trim() || !process.env.API_KEY) {
        setError("A chave de API não foi configurada ou o prompt está vazio.");
        return;
    }
    setIsLoading(true);
    resetState();
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // ETAPA 1: Pesquisa com Grounding
      setLoadingStep("Pesquisando referências na web...");
      const groundingResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `For a Minecraft addon idea: "${prompt}", gather key information and concepts. What are its essential characteristics, appearance, and typical abilities? Provide a concise summary.`,
        config: { tools: [{googleSearch: {}}] },
      });
      const groundingText = groundingResponse.text;
      setSearchSources(groundingResponse.candidates?.[0]?.groundingMetadata?.groundingChunks ?? null);

      // ETAPA 2: Geração consolidada de código, metadados e avaliação
      setLoadingStep("Gerando arquivos, nome e avaliação...");
      const versionArray = version.split('.').map(Number);
      
      const megaGenPrompt = `Você é um desenvolvedor especialista em Add-ons do Minecraft criando arquivos para o Minecraft Bedrock Edition. Sua tarefa é gerar um objeto JSON completo contendo todos os arquivos necessários para um item personalizado, juntamente com metadados e uma avaliação, com base na solicitação do usuário. Siga todos os requisitos técnicos rigorosamente.

      Solicitação do Usuário: "${prompt}"
      Resumo da Pesquisa na Web: "${groundingText}"
      Versão do Minecraft: "${version}"

      **Instruções Críticas para Geração de Arquivos (Siga-as EXATAMENTE):**

      1.  **Estrutura de Arquivos:** O JSON de saída deve ter uma chave "files" contendo um ARRAY de objetos. Cada objeto no array deve ter duas chaves: "path" (string, o caminho completo do arquivo, ex: "behavior_pack/items/emerald_sword.json") e "content" (string, o conteúdo do arquivo).

      2.  **Manifestos (\`manifest.json\`) - A PARTE MAIS IMPORTANTE:**
          - Crie dois manifestos: um em \`behavior_pack/manifest.json\` e outro em \`resource_pack/manifest.json\`.
          - **MANDATÓRIO:** Ambos os manifestos DEVEM usar \`"format_version": 2\`.
          - **UUIDs - CAUSA Nº 1 DE FALHAS:** Gere quatro (4) UUIDs v4 que sejam **completamente diferentes e únicos**. Um para cada \`header/uuid\` e \`modules/uuid\` nos dois pacotes. **NUNCA** reutilize um UUID.
          - **Nomes e Versões:** O nome do pacote deve ser baseado no nome do add-on gerado. A descrição deve usar a descrição gerada. \`header.version\`: \`[1, 0, 0]\`. \`header.min_engine_version\`: Use exatamente \`${JSON.stringify(versionArray)}\`.
          - **Dependências:** Cada manifesto DEVE ter uma seção de \`dependencies\` que aponte para o UUID do \`header\` do outro pacote.

      3.  **Definição do Item (Arquivo de Comportamento - .json):**
          - Salve em \`behavior_pack/items/\` com um nome lógico.
          - A \`"format_version"\` do arquivo do item DEVE corresponder à versão do jogo: \`"${version}"\`.
          - Use um identificador com namespace (ex: \`custom:emerald_sword\`) consistentemente.
          - O componente \`minecraft:icon\` deve usar um alias de textura simples (ex: \`"texture": "emerald_sword"\`).

      4.  **Arquivos de Textura (Pacote de Recursos):**
          - Crie \`resource_pack/textures/item_texture.json\`.
          - Mapeie o alias de textura para o caminho físico \`"textures/items/custom_item"\` (sem .png).
          - **NÃO** gere arquivos \`render_controllers\`.

      5.  **Nomes de Itens (Arquivos de Localização - .lang):**
          - Crie \`resource_pack/texts/en_US.lang\` e \`resource_pack/texts/pt_BR.lang\`.
          - A chave (ex: \`item.custom:emerald_sword.name\`) deve corresponder ao identificador do item.

      **Instruções para Metadados e Avaliação Adicionais:**

      Sua resposta JSON DEVE incluir, no nível superior, as seguintes chaves:
      - **\`name\`**: (string) Um nome curto e cativante para o add-on em português.
      - **\`description\`**: (string) Uma descrição de uma frase para o add-on em português.
      - **\`textureSize\`**: (number) O tamanho de textura quadrado mais apropriado (escolha entre 16, 32, 64 ou 128) com base na complexidade do item.
      - **\`files\`**: (array) O array de objetos de arquivo (\`{path, content}\`), como instruído acima.
      - **\`evaluation\`**: (object) Uma avaliação do add-on que você gerou usando o framework SAFE (Simplicity, Appropriateness, Functionality, Elegance), no formato de um objeto com as chaves "complexity", "quality", "innovation", "common", "summary".

      **Formato Final OBRIGATÓRIO:**
      Sua única resposta DEVE SER um único objeto JSON válido que corresponda ao schema fornecido. Não inclua nenhum texto, explicação ou anotação fora do objeto JSON.`;
      
      const megaSchema = {
          type: Type.OBJECT,
          properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              textureSize: { type: Type.NUMBER },
              files: {
                  type: Type.ARRAY,
                  items: {
                      type: Type.OBJECT,
                      properties: {
                          path: { type: Type.STRING },
                          content: { type: Type.STRING }
                      },
                      required: ["path", "content"]
                  }
              },
              evaluation: {
                  type: Type.OBJECT,
                  properties: {
                      complexity: { type: Type.STRING },
                      quality: { type: Type.STRING },
                      innovation: { type: Type.STRING },
                      common: { type: Type.STRING },
                      summary: { type: Type.STRING },
                  },
                  required: ["complexity", "quality", "innovation", "common", "summary"]
              }
          },
          required: ["name", "description", "textureSize", "files", "evaluation"]
      };

      const megaGenResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: megaGenPrompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: megaSchema,
        }
      });
      
      const result = JSON.parse(megaGenResponse.text);
      const { name, description, files: filesArray, evaluation } = result;

      const filesObject = filesArray.reduce((acc: Record<string, string>, file: {path: string, content: string}) => {
          acc[file.path] = file.content;
          return acc;
      }, {});
      
      let textureSize = result.textureSize || 32;

      setAddonName(name);
      setAddonDescription(description);
      setGeneratedFiles(filesObject);
      setEvaluation(evaluation);

      // Verificação de segurança para garantir que o tamanho não exceda 128 e seja uma potência de 2
      if (textureSize > 128) {
        textureSize = 128;
      }
      const validSizes = [16, 32, 64, 128];
      textureSize = validSizes.reduce((prev, curr) => 
        (Math.abs(curr - textureSize) < Math.abs(prev - textureSize) ? curr : prev)
      );

      // ETAPA 3: Gerar pixel art
      setLoadingStep(`Criando textura de ${textureSize}x${textureSize}px...`);
      const imageGenPrompt = `Create a single, square, ${textureSize}x${textureSize} pixel art texture for a Minecraft item based on this description: "${prompt}".
**Style Rules:**
- The artwork should look like it belongs in Minecraft.
- The item should be centered.
- The background MUST be transparent.`;
      
      const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: imageGenPrompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
      });

      let originalImageBase64 = '';
      const firstCandidate = imageResponse.candidates?.[0];
      if (firstCandidate) {
        for (const part of firstCandidate.content.parts) {
          if (part.inlineData) {
            originalImageBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!originalImageBase64) {
        throw new Error("A IA não conseguiu gerar uma imagem para a textura do item.");
      }
      
      const resizedImageBase64 = await resizeImage(originalImageBase64, textureSize, textureSize);
      setPixelArt(resizedImageBase64);

      // ETAPA 4: Analisar Imagem
      setLoadingStep("Analisando a qualidade da imagem...");
      const imageAnalysisBase64 = resizedImageBase64.split(',')[1];
      const imagePart = { inlineData: { mimeType: 'image/png', data: imageAnalysisBase64 }};
      const textPart = { text: `Please analyze this ${textureSize}x${textureSize} pixel art image intended for a Minecraft addon based on the description: "${prompt}". Evaluate its quality, clarity, and adherence to the Minecraft art style. Provide a short, constructive critique.` };
      const analysisResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts: [imagePart, textPart] },
      });
      setImageAnalysis(analysisResponse.text);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleExport = async () => {
    if (!generatedFiles) return;
    const zip = new JSZip();
    
    Object.entries(generatedFiles).forEach(([path, content]) => {
      zip.file(path, content);
    });
    
    if (pixelArt) {
        const base64Data = pixelArt.split(',')[1];
        zip.file("resource_pack/textures/items/custom_item.png", base64Data, {base64: true});
        zip.file("behavior_pack/pack_icon.png", base64Data, {base64: true});
        zip.file("resource_pack/pack_icon.png", base64Data, {base64: true});
    }

    const blob = await zip.generateAsync({ type: 'blob' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const downloadName = addonName ? `${addonName.replace(/\s+/g, '_').toLowerCase()}.mcaddon` : 'meu_addon.mcaddon';
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleSave = () => {
    if (!generatedFiles) return;

    const name = window.prompt("Digite um nome para salvar seu add-on:", addonName || "Meu Add-on");
    if (!name || !name.trim()) return;

    const newAddon: SavedAddon = {
      id: `addon-${Date.now()}`,
      name: name.trim(),
      prompt,
      version,
      generatedFiles,
      pixelArt,
      evaluation,
      timestamp: Date.now(),
      imageAnalysis,
      searchSources,
    };

    const savedAddonsRaw = localStorage.getItem('savedAddons');
    const savedAddons: SavedAddon[] = savedAddonsRaw ? JSON.parse(savedAddonsRaw) : [];
    
    savedAddons.push(newAddon);

    localStorage.setItem('savedAddons', JSON.stringify(savedAddons));
    setAddonName(name.trim());
    alert(`Add-on "${name.trim()}" salvo com sucesso!`);
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLoadingStep("Importando arquivo...");
    resetState();

    try {
        const zip = await JSZip.loadAsync(file);
        const files: Record<string, string> = {};
        const filePromises: Promise<void>[] = [];

        zip.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir) {
                const promise = zipEntry.async('string').then(content => {
                    files[relativePath] = content;
                });
                filePromises.push(promise);
            }
        });

        await Promise.all(filePromises);
        setGeneratedFiles(files);
        setPrompt("Add-on importado de um arquivo .mcaddon");
    } catch (err) {
        setError("Falha ao ler o arquivo .mcaddon. Verifique se o arquivo está no formato correto.");
    } finally {
        setIsLoading(false);
        setLoadingStep('');
    }
    event.target.value = '';
  };

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">1. Configurações do Add-on</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Add-on</label>
                <div className="space-y-2">
                    {['item', 'textura 3D', 'mob/entidade'].map(type => {
                    const isDisabled = type !== 'item';
                    const isChecked = type === 'item';
                    return (
                        <label key={type} className={`relative flex items-center p-3 rounded-lg transition-colors w-full ${isChecked ? 'bg-white dark:bg-gray-700 shadow-sm' : 'bg-gray-200/50 dark:bg-gray-800/50'} ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}>
                            <input type="radio" name="addonType" value={type} checked={isChecked} onChange={() => {}} disabled={isDisabled} className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-full border border-gray-400 dark:border-gray-500 text-minecraft-green-600 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-gray-500 before:opacity-0 before:transition-opacity checked:border-minecraft-green-600 checked:before:bg-minecraft-green-600 hover:before:opacity-10" />
                            <span className="ml-3 text-gray-700 dark:text-gray-300 capitalize font-medium">{type}</span>
                            {isDisabled && <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">Em breve</span>}
                        </label>
                    );
                    })}
                </div>
            </div>
            <div>
                <label htmlFor="mcVersion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Versão do Minecraft</label>
                <select
                    id="mcVersion"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-minecraft-green-500 dark:text-white transition"
                >
                    {availableVersions.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
            </div>
          </div>
        </div>

        <div>
           <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">2. Descreva sua ideia</h3>
           <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ex: Uma espada de esmeralda que dá 8 de dano..." className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-minecraft-green-500 dark:text-white transition" rows={4} />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="w-full bg-minecraft-green-600 text-white px-4 py-2.5 rounded-lg font-semibold disabled:bg-minecraft-green-500/50 disabled:cursor-not-allowed flex items-center justify-center h-11 transition-all hover:bg-minecraft-green-700 hover:scale-105 active:scale-100">
              {isLoading ? <><Spinner /> {loadingStep}</> : 'Gerar Add-on'}
            </button>
             <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".mcaddon" style={{ display: 'none' }} />
             <button onClick={handleImportClick} disabled={isLoading} className="w-full sm:w-auto bg-minecraft-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold disabled:bg-minecraft-blue-500/50 flex items-center justify-center h-11 transition-all hover:bg-minecraft-blue-700 space-x-2">
                <UploadIcon className="h-5 w-5" />
                <span>Importar</span>
            </button>
        </div>

        {error && <p className="text-red-500 text-center bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">{error}</p>}
        
        <div className="mt-6 space-y-8">
          {(generatedFiles || pixelArt || evaluation) && (
            <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white text-center mb-6">{addonName ? `Resultados para "${addonName}"` : "Resultados da Geração"}</h3>
                
                 {generatedFiles && (
                    <div className="flex flex-col sm:flex-row gap-4 my-4">
                        <button onClick={handleExport} className="w-full bg-minecraft-green-600 text-white px-4 py-2.5 rounded-lg font-semibold flex items-center justify-center space-x-2 h-11 transition-all hover:bg-minecraft-green-700 hover:scale-105 active:scale-100">
                            <DownloadIcon className="h-5 w-5" />
                            <span>Exportar .mcaddon</span>
                        </button>
                        <button onClick={handleSave} className="w-full sm:w-auto bg-minecraft-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold flex items-center justify-center h-11 transition-all hover:bg-minecraft-blue-700 space-x-2">
                            <SaveIcon className="h-5 w-5" />
                            <span>Salvar Add-on</span>
                        </button>
                    </div>
                 )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {pixelArt && (
                        <Card className="border-t-purple-500">
                             <h4 className="text-lg font-semibold flex items-center gap-2"><PhotoIcon className="h-5 w-5 text-purple-500" /> Textura Gerada</h4>
                             <div className="my-4 p-2 bg-checkerboard rounded-md flex justify-center aspect-square">
                                <img src={pixelArt} alt="Pixel art gerado" className="w-full h-full" style={{ imageRendering: 'pixelated' }} />
                             </div>
                             <a href={pixelArt} download="texture.png" className="text-sm text-center w-full block text-minecraft-blue-500 hover:underline">Baixar textura .png</a>
                        </Card>
                    )}
                    {imageAnalysis && (
                         <Card className="border-t-cyan-500">
                             <h4 className="text-lg font-semibold flex items-center gap-2"><EyeIcon className="h-5 w-5 text-cyan-500" /> Análise da Imagem</h4>
                             <div className="text-sm space-y-2 mt-4 text-gray-600 dark:text-gray-300">
                                <p>{imageAnalysis}</p>
                             </div>
                         </Card>
                    )}
                     {evaluation && (
                         <Card className="border-t-yellow-500">
                             <h4 className="text-lg font-semibold flex items-center gap-2"><SparklesIcon className="h-5 w-5 text-yellow-500" /> Avaliação SAFE</h4>
                             <div className="text-sm space-y-2 mt-4 text-gray-600 dark:text-gray-300">
                                <p><strong>Complexidade:</strong> {evaluation.complexity}</p>
                                <p><strong>Qualidade:</strong> {evaluation.quality}</p>
                                <p><strong>Inovação:</strong> {evaluation.innovation}</p>
                                <p><strong>Comum:</strong> {evaluation.common}</p>
                                <p className="pt-2 border-t border-gray-200 dark:border-gray-700"><strong>Resumo:</strong> {evaluation.summary}</p>
                             </div>
                         </Card>
                    )}
                     {searchSources && searchSources.length > 0 && (
                        <Card className="border-t-blue-500 lg:col-span-2">
                             <h4 className="text-lg font-semibold flex items-center gap-2"><SearchIcon className="h-5 w-5 text-blue-500" /> Fontes da Pesquisa</h4>
                             <ul className="text-sm space-y-2 mt-4 list-disc list-inside">
                                {searchSources.map((source, index) => (
                                    <li key={index}>
                                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-minecraft-blue-500 hover:underline">{source.web.title}</a>
                                    </li>
                                ))}
                             </ul>
                        </Card>
                    )}
                </div>

                {generatedFiles && (
                     <div className="mt-8">
                        <h4 className="text-lg font-semibold flex items-center gap-2 mb-2 justify-center"><FileCodeIcon className="h-5 w-5"/> Arquivos do Add-on</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-center">Abaixo estão os arquivos para sua referência. Use o botão de exportação para baixar o pacote completo.</p>
                        {Object.entries(generatedFiles).map(([path, content]) => (
                            <CodeBlock key={path} path={path} content={content} />
                        ))}
                    </div>
                )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CreatorPage;