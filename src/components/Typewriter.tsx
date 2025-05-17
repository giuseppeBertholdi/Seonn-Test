import React, { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

const formatText = (text: string) => {
  // Substitui **texto** por texto em negrito
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
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

const Typewriter: React.FC<TypewriterProps> = ({ text, speed = 30, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <div 
        className={`typewriter-text ${isTyping ? 'typing' : ''}`}
        dangerouslySetInnerHTML={{ __html: formatText(displayedText) }}
      />
      {isTyping && <span className="typing-cursor">|</span>}
    </div>
  );
};

export default Typewriter; 