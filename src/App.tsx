import React, { useState, useCallback } from 'react';
import { CodeBracketIcon, AcademicCapIcon, ChatBubbleLeftRightIcon, ArrowPathIcon, SparklesIcon, HeartIcon, InformationCircleIcon, ClockIcon, StarIcon, BookmarkIcon, ShareIcon } from '@heroicons/react/24/outline';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from "tsparticles-engine";
import About from './About';
import Typewriter from './components/Typewriter';
import Sidebar from './components/Sidebar';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isFavorite?: boolean;
}

interface ModeConfig {
  model: string;
  prompt: string;
  temperature: number;
  description: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<string>('normal');
  const [showAbout, setShowAbout] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    console.log(container);
  }, []);

  const modeConfigs: Record<string, ModeConfig> = {
    normal: {
      model: 'meta-llama/llama-3.3-8b-instruct:free',
      prompt: 'Olá! Como você pode me ajudar hoje?',
      temperature: 0.1,
      description: 'Assistente geral para todas as suas necessidades'
    },
    programacao: {
      model: 'deepseek/deepseek-chat-v3-0324:free',
      prompt: 'Você é um assistente especializado em programação. Como você pode me ajudar?',
      temperature: 0.1,
      description: 'Especialista em desenvolvimento e debugging'
    },
    estudar: {
      model: 'microsoft/phi-4-reasoning-plus:free',
      prompt: 'Você é um tutor educacional. Em que você pode me ajudar com seus estudos?',
      temperature: 0.1,
      description: 'Tutor personalizado para seus estudos'
    },
    conversar: {
      model: 'meta-llama/llama-3.3-8b-instruct:free',
      prompt: 'Olá! Vamos conversar sobre qualquer assunto.',
      temperature: 0.1,
      description: 'Conversa casual e amigável'
    },
    responder: {
      model: 'deepseek/deepseek-chat-v3-0324:free',
      prompt: 'Quero que me responda algumas perguntas, lá vai.',
      temperature: 0.1,
      description: 'Respostas diretas e objetivas'
    }
  };
  const formatMessage = (content: string) => {
    // Substitui **texto** por texto em negrito
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Substitui *texto* por texto em itálico
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Substitui # Título por título formatado
    formatted = formatted.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4">$1</h1>');
    formatted = formatted.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mb-3">$1</h2>');
    formatted = formatted.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mb-2">$1</h3>');
    
    // Substitui quebras de linha por <br>
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Adiciona espaçamento entre parágrafos
    formatted = formatted.replace(/<br><br>/g, '</p><p>');
    
    return `<p>${formatted}</p>`;
  };

  const handleModeSelect = (mode: string) => {
    setSelectedMode(mode);
    setInput(modeConfigs[mode].prompt);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const timestamp = new Date().toLocaleTimeString();
    const userMessage: Message = { role: 'user', content: input, timestamp };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    setCurrentResponse('');

    try {
      const currentMode = modeConfigs[selectedMode];
      const requestBody = {
        model: currentMode.model,
        messages: [...messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: currentMode.temperature,
        max_tokens: 1000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
        top_p: 0.9,
        stream: true
      };

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'SEONN'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Erro na requisição à API');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Não foi possível ler a resposta');

      let accumulatedResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                accumulatedResponse += content;
                setCurrentResponse(accumulatedResponse);
              }
            } catch (e) {
              console.error('Erro ao processar chunk:', e);
            }
          }
        }
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: accumulatedResponse,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro detalhado:', error);
      setError(error instanceof Error ? error.message : 'Erro ao processar a resposta da IA');
    } finally {
      setIsLoading(false);
      setCurrentResponse('');
    }
  };

  const toggleFavorite = (index: number) => {
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, isFavorite: !msg.isFavorite } : msg
    ));
  };

  const handleDonate = () => {
    window.open('https://www.paypal.com/donate/?hosted_button_id=SEU_ID_DO_PAYPAL', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {showAbout ? (
        <About onBack={() => setShowAbout(false)} />
      ) : (
        <>
          <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          <div className="lg:ml-64">
            <div className="container mx-auto px-4 sm:px-6 py-8 relative min-h-screen">
              <Particles
                id="tsparticles"
                init={particlesInit}
                loaded={particlesLoaded}
                options={{
                  fullScreen: {
                    enable: true,
                    zIndex: -1
                  },
                  background: {
                    color: {
                      value: "transparent",
                    },
                  },
                  fpsLimit: 60,
                  interactivity: {
                    events: {
                      onClick: {
                        enable: true,
                        mode: "push",
                      },
                      onHover: {
                        enable: true,
                        mode: "repulse",
                      },
                      resize: true,
                    },
                    modes: {
                      push: {
                        quantity: 4,
                      },
                      repulse: {
                        distance: 200,
                        duration: 0.4,
                      },
                    },
                  },
                  particles: {
                    color: {
                      value: ["#6366f1", "#8b5cf6", "#ec4899"],
                    },
                    links: {
                      color: "#6366f1",
                      distance: 150,
                      enable: true,
                      opacity: 0.4,
                      width: 1,
                    },
                    collisions: {
                      enable: true,
                    },
                    move: {
                      direction: "none",
                      enable: true,
                      outModes: {
                        default: "bounce",
                      },
                      random: true,
                      speed: 2,
                      straight: false,
                    },
                    number: {
                      density: {
                        enable: true,
                        area: 800,
                      },
                      value: 100,
                    },
                    opacity: {
                      value: 0.5,
                    },
                    shape: {
                      type: ["circle", "triangle"],
                    },
                    size: {
                      value: { min: 2, max: 5 },
                    },
                  },
                  detectRetina: true,
                }}
              />
              
              <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col space-y-6 sm:space-y-8">
                {/* Aviso sobre conversas não salvas */}
                <div className="absolute top-4 right-4 flex items-center text-red-300 text-sm opacity-80 hover:opacity-100 transition-opacity duration-300 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
                  <InformationCircleIcon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Conversas não são salvas.</span>
                  <span className="sm:hidden">Não salvas</span>
                </div>

                {/* Card de Doação */}
                <div className="absolute top-4 left-4 lg:left-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-3 sm:p-5 rounded-2xl backdrop-blur-xl border border-white/10 max-w-[90%] sm:max-w-xs transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-indigo-500/20">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                      <HeartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">Apoie o SEONN</h3>
                      <p className="text-gray-400 text-xs sm:text-sm">Faça parte do projeto 💜</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDonate}
                    className="w-full group relative inline-flex items-center justify-center px-3 py-2 sm:px-4 sm:py-2.5 overflow-hidden font-medium text-white transition duration-300 ease-out rounded-xl shadow-lg hover:shadow-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                  >
                    <span className="absolute inset-0 flex items-center justify-center w-full h-full duration-300 -translate-x-full bg-white/20 group-hover:translate-x-0 ease">
                      <HeartIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Doar
                    </span>
                    <span className="absolute flex items-center justify-center w-full h-full transition-all duration-300 transform group-hover:translate-x-full ease">
                      <HeartIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Doar
                    </span>
                    <span className="relative invisible">Doar</span>
                  </button>
                </div>

                <div className="text-center mb-6 sm:mb-8">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl transform rotate-45 animate-pulse shadow-lg"></div>
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl transform -rotate-45 animate-pulse shadow-lg" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                  <h1 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text animate-gradient mb-4">
                    SEONN
                  </h1>
                  <p className="text-gray-400 text-base sm:text-lg mb-6">Sua IA simples e amigável!</p>
                  <button
                    onClick={() => setShowAbout(true)}
                    className="group relative inline-flex items-center justify-center px-6 py-2 sm:px-8 sm:py-3 overflow-hidden font-medium text-white transition duration-300 ease-out border-2 border-white/20 rounded-full shadow-lg hover:shadow-xl hover:border-white/40"
                  >
                    <span className="absolute inset-0 flex items-center justify-center w-full h-full duration-300 -translate-x-full bg-white/10 group-hover:translate-x-0 ease">
                      <InformationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                      Sobre
                    </span>
                    <span className="absolute flex items-center justify-center w-full h-full transition-all duration-300 transform group-hover:translate-x-full ease">
                      <InformationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                      Sobre
                    </span>
                    <span className="relative invisible">Sobre</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto mb-6 sm:mb-8 space-y-4 sm:space-y-6">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`p-4 sm:p-6 rounded-2xl shadow-lg transition-all duration-300 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white ml-auto'
                          : 'bg-white/10 backdrop-blur-md text-gray-100'
                      } max-w-[90%] sm:max-w-[85%] relative group border border-white/10`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                              message.role === 'user' 
                                ? 'bg-white/20' 
                                : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                            }`}>
                              {message.role === 'user' ? (
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              ) : (
                                <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-300">
                              {message.role === 'user' ? 'Você' : 'SEONN'}
                            </span>
                          </div>
                          {message.role === 'user' ? (
                            <div className="text-white">{message.content}</div>
                          ) : (
                            <div 
                              className="prose prose-invert prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                            />
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => toggleFavorite(index)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              message.isFavorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                            }`}
                          >
                            <StarIcon className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 transition-colors">
                            <BookmarkIcon className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-green-400 transition-colors">
                            <ShareIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-2 flex items-center">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {message.timestamp}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="bg-white/10 backdrop-blur-md text-gray-100 p-6 rounded-2xl max-w-[85%] md:max-w-[75%] shadow-lg">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 bg-gradient-to-r from-indigo-500 to-purple-500">
                          <div className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-300">SEONN</span>
                      </div>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <div className="flex flex-col space-y-2">
                          <div className="text-gray-400 text-sm italic thinking">
                            Estou pensando, isso pode levar um tempo...
                          </div>
                          <Typewriter text={currentResponse} speed={20} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {error && (
                    <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-200 px-6 py-4 rounded-2xl shadow-lg" role="alert">
                      <strong className="font-bold">Erro: </strong>
                      <span className="block sm:inline">{error}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-center space-x-3 sm:space-x-6 mb-6 sm:mb-8">
                  {Object.entries(modeConfigs).map(([mode, config]) => (
                    <button
                      key={mode}
                      onClick={() => handleModeSelect(mode)}
                      className={`p-3 sm:p-4 rounded-xl transition-all duration-200 group relative ${
                        selectedMode === mode
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                          : 'bg-white/10 backdrop-blur-md text-gray-100 hover:bg-white/20'
                      } shadow-md`}
                      title={config.description}
                    >
                      {mode === 'normal' && <SparklesIcon className="w-5 h-5 sm:w-7 sm:h-7" />}
                      {mode === 'programacao' && <CodeBracketIcon className="w-5 h-5 sm:w-7 sm:h-7" />}
                      {mode === 'estudar' && <AcademicCapIcon className="w-5 h-5 sm:w-7 sm:h-7" />}
                      {mode === 'conversar' && <ChatBubbleLeftRightIcon className="w-5 h-5 sm:w-7 sm:h-7" />}
                      {mode === 'responder' && <ArrowPathIcon className="w-5 h-5 sm:w-7 sm:h-7" />}
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {config.description}
                      </span>
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="flex gap-3 sm:gap-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Modo ${selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)} - Digite sua mensagem...`}
                    className="flex-1 p-3 sm:p-4 rounded-xl border border-gray-200 bg-white/10 backdrop-blur-md text-gray-100 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 text-sm sm:text-base"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    Enviar
                  </button>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App; 