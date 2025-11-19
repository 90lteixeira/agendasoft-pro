'use client';

import { useState, useEffect } from 'react';
import { Language, getTranslations } from '@/lib/i18n';
import { Camera, ListChecks, Plus, Trash2, CheckCircle2, Circle, X, Save, Edit3 } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Appointment {
  id: string;
  client_id?: string;
  client_name: string;
  appointment_date: string;
  appointment_time: string;
  service: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  checklist?: ChecklistItem[];
  photos?: string[];
}

interface AppointmentDetailModalProps {
  appointment: Appointment;
  language: Language;
  onClose: () => void;
  onUpdate: (id: string, updateData: any) => void;
}

export function AppointmentDetailModal({
  appointment,
  language,
  onClose,
  onUpdate
}: AppointmentDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(appointment.notes || '');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(appointment.checklist || []);
  const [photos, setPhotos] = useState<string[]>(appointment.photos || []);
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const t = getTranslations(language);

  useEffect(() => {
    // Carregar dados do localStorage quando o modal abre
    try {
      const savedChecklist = localStorage.getItem(`checklist_${appointment.id}`);
      if (savedChecklist) {
        setChecklist(JSON.parse(savedChecklist));
      }
    } catch (e) {
      setChecklist([]);
    }

    try {
      const savedPhotos = localStorage.getItem(`photos_${appointment.id}`);
      if (savedPhotos) {
        setPhotos(JSON.parse(savedPhotos));
      }
    } catch (e) {
      setPhotos([]);
    }
  }, [appointment.id]);

  const handleSave = () => {
    // Salvar checklist no localStorage
    localStorage.setItem(`checklist_${appointment.id}`, JSON.stringify(checklist));

    // Salvar photos no localStorage
    localStorage.setItem(`photos_${appointment.id}`, JSON.stringify(photos));

    // Atualizar apenas notes no banco
    onUpdate(appointment.id, { notes });

    setIsEditing(false);
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        text: newChecklistItem.trim(),
        completed: false
      };
      setChecklist([...checklist, newItem]);
      setNewChecklistItem('');
    }
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const removeChecklistItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  const addPhoto = () => {
    // Simular upload de foto (em produção, seria um file input)
    const mockPhotoUrl = `https://picsum.photos/400/300?random=${Date.now()}`;
    setPhotos([...photos, mockPhotoUrl]);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const checklistCompleted = checklist.filter(item => item.completed).length;
  const checklistTotal = checklist.length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{appointment.client_name}</h2>
              <p className="text-white/80 text-sm">
                {new Date(appointment.appointment_date + 'T00:00:00').toLocaleDateString()} às {appointment.appointment_time}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <ListChecks className="w-5 h-5 text-orange-600" />
                <span className="font-bold text-orange-700 dark:text-orange-300">Serviço</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{appointment.service}</p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-pink-600" />
                <span className="font-bold text-pink-700 dark:text-pink-300">Status</span>
              </div>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
                appointment.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-300' :
                appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                appointment.status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                'bg-red-100 text-red-700 border-red-300'
              } border-2`}>
                {appointment.status === 'pending' ? 'Pendente' :
                 appointment.status === 'confirmed' ? 'Confirmado' :
                 appointment.status === 'completed' ? 'Concluído' : 'Cancelado'}
              </span>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-orange-50 dark:from-purple-900/20 dark:to-orange-900/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-purple-700 dark:text-purple-300">Progresso</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Ficha:</span>
                  <span className="font-bold">{checklistCompleted}/{checklistTotal}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Fotos:</span>
                  <span className="font-bold">{photos.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Observações</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30 hover:scale-110 transition-transform"
              >
                <Edit3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </button>
            </div>

            {isEditing ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-800 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900/50 transition-all"
                rows={4}
                placeholder="Adicione observações sobre o agendamento..."
              />
            ) : (
              <p className="text-gray-700 dark:text-gray-300">
                {notes || 'Nenhuma observação registrada.'}
              </p>
            )}
          </div>

          {/* Checklist */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Ficha de Serviço</h3>
              {isEditing && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                    placeholder="Novo item..."
                    className="px-3 py-2 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-800 focus:border-purple-500 transition-all text-sm"
                  />
                  <button
                    onClick={addChecklistItem}
                    className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 hover:scale-110 transition-transform"
                  >
                    <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </button>
                </div>
              )}
            </div>

            {checklist.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                {isEditing ? 'Adicione itens à ficha de serviço' : 'Nenhum item na ficha de serviço'}
              </p>
            ) : (
              <div className="space-y-2">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl">
                    <button
                      onClick={() => isEditing && toggleChecklistItem(item.id)}
                      className={`flex-shrink-0 ${isEditing ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                      {item.text}
                    </span>
                    {isEditing && (
                      <button
                        onClick={() => removeChecklistItem(item.id)}
                        className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fotos */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Fotos</h3>
              {isEditing && (
                <button
                  onClick={addPhoto}
                  className="flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-xl font-bold hover:scale-105 transition-transform"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Foto
                </button>
              )}
            </div>

            {photos.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Nenhuma foto registrada
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-32 object-cover rounded-xl"
                    />
                    {isEditing && (
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              Fechar
            </button>

            {isEditing ? (
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
              >
                <Save className="w-5 h-5 inline mr-2" />
                Salvar Alterações
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
              >
                <Edit3 className="w-5 h-5 inline mr-2" />
                Editar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}