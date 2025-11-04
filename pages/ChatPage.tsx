
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import Card from '../components/common/Card';
import Spinner from '../components/common/Spinner';

interface Message {
    role: 'user' | 'model';
    text: string;
}

const ChatPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!process.env.API_KEY) {
            setError("A chave de API não foi configurada.");
            return;
        }
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            chatRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                 config: {
                    systemInstruction: 'You are a helpful assistant specialized in Minecraft and addon development. Be friendly and provide clear, concise answers.',
                },
            });
        } catch (e: any) {
            setError(e.message);
        }
    }, []);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chatRef.current) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const responseStream = await chatRef.current.sendMessageStream({ message: input });

            let modelMessage: Message = { role: 'model', text: '' };
            setMessages(prev => [...prev, modelMessage]);

            for await (const chunk of responseStream) {
                modelMessage.text += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { ...modelMessage };
                    return newMessages;
                });
            }

        } catch (err: any) {
            setError(err.message || "Ocorreu um erro ao se comunicar com a IA.");
             setMessages(prev => [...prev, {role: 'model', text: 'Desculpe, não consegui processar sua solicitação.'}]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <div className="flex flex-col h-[70vh]">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">Chat com IA</h2>
                <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4 mb-4">
                    {messages.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500 dark:text-gray-400">Faça uma pergunta para começar...</p>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-lg px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-minecraft-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Pergunte sobre Minecraft, add-ons..."
                        className="flex-grow p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-minecraft-green-500 dark:text-white transition"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-minecraft-green-600 text-white px-4 py-2.5 rounded-lg font-semibold disabled:bg-minecraft-green-500/50 disabled:cursor-not-allowed flex items-center justify-center transition-colors hover:bg-minecraft-green-700"
                    >
                        {isLoading ? <Spinner /> : 'Enviar'}
                    </button>
                </form>
            </div>
        </Card>
    );
};

export default ChatPage;
