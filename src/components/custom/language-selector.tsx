'use client';

import { Language } from '@/lib/i18n';
import { Check } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onSelect: (lang: Language) => void;
}

const languages = [
  { code: 'pt' as Language, name: 'Português', flag: '🇧🇷' },
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
  { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
];

export function LanguageSelector({ selectedLanguage, onSelect }: LanguageSelectorProps) {
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
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
            }
          `}
        >
          <span className="text-3xl">{lang.flag}</span>
          <span className="text-lg font-medium flex-1 text-left">{lang.name}</span>
          {selectedLanguage === lang.code && (
            <Check className="w-5 h-5 text-blue-500 absolute top-2 right-2" />
          )}
        </button>
      ))}
    </div>
  );
}
