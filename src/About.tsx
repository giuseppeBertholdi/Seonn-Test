import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface AboutProps {
  onBack: () => void;
}

const About: React.FC<AboutProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      {/* Botão Voltar */}
      <button
        onClick={onBack}
        className="fixed top-4 left-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-lg animate-fade-in"
      >
        <ArrowLeftIcon className="w-6 h-6 text-indigo-600" />
      </button>

      {/* Conteúdo Principal */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12 animate-slide-down">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text mb-4">
            Sobre o SEONN
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Cards de Informação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-left">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg transform rotate-45 mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nossa Missão</h2>
            <p className="text-gray-600">
              [Seu texto sobre a missão aqui]
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-right">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg transform -rotate-45 mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nossa Visão</h2>
            <p className="text-gray-600">
              [Seu texto sobre a visão aqui]
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-left">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-lg transform rotate-45 mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nossos Valores</h2>
            <p className="text-gray-600">
              [Seu texto sobre os valores aqui]
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 animate-slide-right">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-lg transform -rotate-45 mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nossa História</h2>
            <p className="text-gray-600">
              [Seu texto sobre a história aqui]
            </p>
          </div>
        </div>

        {/* Seção de Contato */}
        <div className="mt-16 text-center animate-slide-up">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Entre em Contato</h2>
          <p className="text-gray-600 mb-8">
            [Seu texto de contato aqui]
          </p>
          <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-full hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 shadow-lg hover:shadow-xl">
            Fale Conosco
          </button>
        </div>
      </div>
    </div>
  );
};

export default About; 