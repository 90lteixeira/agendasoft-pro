'use client';

import { useState } from 'react';
import { X, Plus, Trash2, Check, Image as ImageIcon, Upload } from 'lucide-react';
import { Language, getTranslations } from '@/lib/i18n';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface AppointmentDetailModalProps {
  appointment: {
    id: string;
    client_name: string;
    date: string;
    time: string;
    service: string;
    status: string;
    notes?: string;
    tasks?: Task[];
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
  const [tasks, setTasks] = useState<Task[]>(appointment.tasks || []);
  const [photos, setPhotos] = useState<string[]>(appointment.photos || []);
  const [newTaskText, setNewTaskText] = useState('');
  const [notes, setNotes] = useState(appointment.notes || '');

  const addTask = () => {
    if (!newTaskText.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false
    };
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    setNewTaskText('');
    onUpdate(appointment.id, { tasks: updatedTasks });
  };

  const toggleTask = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    onUpdate(appointment.id, { tasks: updatedTasks });
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    onUpdate(appointment.id, { tasks: updatedTasks });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Simular upload - em produção, fazer upload real para Supabase Storage
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedPhotos = [...photos, reader.result as string];
        setPhotos(updatedPhotos);
        onUpdate(appointment.id, { photos: updatedPhotos });
      };
      reader.readAsDataURL(file);
    });
  };

  const deletePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    onUpdate(appointment.id, { photos: updatedPhotos });
  };

  const saveNotes = () => {
    onUpdate(appointment.id, { notes });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 p-6 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{appointment.client_name}</h2>
            <p className="text-white/80 text-sm">
              {new Date(appointment.date).toLocaleDateString()} às {appointment.time}
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

          {/* Notas */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              {t.notes}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900/50 transition-all"
              placeholder="Adicione observações sobre este agendamento..."
            />
          </div>

          {/* Lista de Tarefas */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg">
                <Check className="w-5 h-5 text-white" />
              </div>
              {t.tasks}
            </h3>

            <div className="space-y-2 mb-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border-2 border-blue-200 dark:border-blue-800 group hover:border-blue-400 transition-colors"
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      task.completed
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-blue-300 hover:border-blue-500'
                    }`}
                  >
                    {task.completed && <Check className="w-4 h-4 text-white" />}
                  </button>
                  <span
                    className={`flex-1 ${
                      task.completed
                        ? 'line-through text-gray-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {task.text}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                placeholder="Nova tarefa..."
                className="flex-1 px-4 py-3 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900/50 transition-all"
              />
              <button
                onClick={addTask}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Fotos */}
          <div>
            <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              {t.photos}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-32 object-cover rounded-xl border-2 border-purple-200 dark:border-purple-800"
                  />
                  <button
                    onClick={() => deletePhoto(index)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <label className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all cursor-pointer">
              <Upload className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="font-bold text-purple-600 dark:text-purple-400">
                Adicionar Fotos
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
