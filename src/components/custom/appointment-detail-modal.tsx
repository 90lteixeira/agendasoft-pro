'use client';

import { useState } from 'react';
import { X, Plus, Trash2, Check, Camera } from 'lucide-react';
import { Language, getTranslations } from '@/lib/i18n';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface AppointmentDetailModalProps {
  appointment: {
    id: string;
    client_name: string;
    appointment_date: string;
    appointment_time: string;
    service: string;
    status: string;
    notes?: string;
    checklist?: ChecklistItem[];
    photos?: string[];
  };
  language: Language;
  onClose: () => void;
  onUpdate: (id: string, data: any) => void;
}

export function AppointmentDetailModal({ 
  appointment, 
  language, 
  onClose, 
  onUpdate 
}: AppointmentDetailModalProps) {
  const t = getTranslations(language);
  const [notes, setNotes] = useState(appointment.notes || '');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(appointment.checklist || []);
  const [photos, setPhotos] = useState<string[]>(appointment.photos || []);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [activeTab, setActiveTab] = useState<'notes' | 'checklist' | 'photos'>('notes');

  const saveNotes = () => {
    onUpdate(appointment.id, { notes });
  };

  const saveChecklist = (updatedChecklist: ChecklistItem[]) => {
    onUpdate(appointment.id, { checklist: updatedChecklist });
  };

  const savePhotos = (updatedPhotos: string[]) => {
    onUpdate(appointment.id, { photos: updatedPhotos });
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newChecklistItem,
      completed: false
    };
    
    const updatedChecklist = [...checklist, newItem];
    setChecklist(updatedChecklist);
    setNewChecklistItem('');
    
    // Salvar automaticamente
    saveChecklist(updatedChecklist);
  };

  const toggleChecklistItem = (id: string) => {
    const updatedChecklist = checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updatedChecklist);
    saveChecklist(updatedChecklist);
  };

  const removeChecklistItem = (id: string) => {
    const updatedChecklist = checklist.filter(item => item.id !== id);
    setChecklist(updatedChecklist);
    saveChecklist(updatedChecklist);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Converter para base64 (para demonstração - em produção, usar storage)
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const updatedPhotos = [...photos, base64];
        setPhotos(updatedPhotos);
        savePhotos(updatedPhotos);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    savePhotos(updatedPhotos);
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const totalCount = checklist.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 p-6 rounded-t-2xl flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">{appointment.client_name}</h2>
            <p className="text-white/80 text-sm">
              {new Date(appointment.appointment_date).toLocaleDateString()} às {appointment.appointment_time}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 p-4 rounded-xl border-2 border-orange-200 dark:border-orange-800">
            <h3 className="font-bold text-lg mb-2 text-orange-700 dark:text-orange-300">
              {t.service}
            </h3>
            <p className="text-gray-700 dark:text-gray-300">{appointment.service}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b-2 border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-6 py-3 font-bold rounded-t-xl transition-all ${
                activeTab === 'notes'
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              📝 Notas
            </button>
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-6 py-3 font-bold rounded-t-xl transition-all relative ${
                activeTab === 'checklist'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              ✅ Ficha ({completedCount}/{totalCount})
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-6 py-3 font-bold rounded-t-xl transition-all relative ${
                activeTab === 'photos'
                  ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              📷 Fotos ({photos.length})
            </button>
          </div>

          {/* Conteúdo das Tabs */}
          {activeTab === 'notes' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={saveNotes}
                rows={8}
                className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900/50 transition-all"
                placeholder="Adicione observações sobre este agendamento..."
              />
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-4">
              {/* Barra de Progresso */}
              {totalCount > 0 && (
                <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4">
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-gray-700 dark:text-gray-300">Progresso</span>
                    <span className="text-purple-600 dark:text-purple-400">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Adicionar Item */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                  placeholder="Adicionar item à ficha..."
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-pink-200 dark:border-pink-800 bg-white dark:bg-gray-900 focus:border-pink-500 focus:ring-4 focus:ring-pink-200 dark:focus:ring-pink-900/50 transition-all"
                />
                <button
                  onClick={addChecklistItem}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Lista de Itens */}
              <div className="space-y-2">
                {checklist.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Nenhum item na ficha. Adicione itens acima!
                  </div>
                ) : (
                  checklist.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                        item.completed
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                          : 'bg-white dark:bg-gray-900 border-pink-200 dark:border-pink-800'
                      }`}
                    >
                      <button
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          item.completed
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 dark:border-gray-600 hover:border-pink-500'
                        }`}
                      >
                        {item.completed && <Check className="w-4 h-4 text-white" />}
                      </button>
                      <span
                        className={`flex-1 ${
                          item.completed
                            ? 'line-through text-gray-500 dark:text-gray-400'
                            : 'text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {item.text}
                      </span>
                      <button
                        onClick={() => removeChecklistItem(item.id)}
                        className="flex-shrink-0 p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-4">
              {/* Upload de Fotos */}
              <div className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-xl p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="p-4 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl">
                    <Camera className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-700 dark:text-gray-300">
                      Clique para adicionar fotos
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Ou arraste e solte aqui
                    </p>
                  </div>
                </label>
              </div>

              {/* Galeria de Fotos */}
              {photos.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Nenhuma foto adicionada ainda
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-xl overflow-hidden border-2 border-purple-200 dark:border-purple-800"
                    >
                      <img
                        src={photo}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
