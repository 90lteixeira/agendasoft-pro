'use client';

import { Language } from '@/lib/i18n';
import { Check, Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onSelect: (lang: Language) => void;
  compact?: boolean;
}

const languages = [
  { code: 'pt' as Language, name: 'Português', flag: '🇧🇷' },
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
  { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
];

export function LanguageSelector({ selectedLanguage, onSelect, compact = false }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage);

  // Versão compacta (ícone no header)
  if (compact) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 hover:scale-110 transition-transform shadow-lg flex items-center gap-2"
          title="Alterar idioma"
        >
          <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
            {currentLanguage?.flag}
          </span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-purple-200 dark:border-purple-800 overflow-hidden z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onSelect(lang.code);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 p-3 transition-colors
                  ${
                    selectedLanguage === lang.code
                      ? 'bg-purple-100 dark:bg-purple-900/30'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-sm font-medium flex-1 text-left">{lang.name}</span>
                {selectedLanguage === lang.code && (
                  <Check className="w-4 h-4 text-purple-500" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Versão completa (tela de boas-vindas)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onSelect(lang.code)}
          className={`
            relative flex items-center gap-3 p-4 rounded-xl border-2 
            transition-all duration-300 hover:scale-105
            ${
              selectedLanguage === lang.code
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
            }
          `}
        >
          <span className="text-3xl">{lang.flag}</span>
          <span className="text-lg font-medium flex-1 text-left">{lang.name}</span>
          {selectedLanguage === lang.code && (
            <Check className="w-5 h-5 text-purple-500 absolute top-2 right-2" />
          )}
        </button>
      ))}
    </div>
  );
}
