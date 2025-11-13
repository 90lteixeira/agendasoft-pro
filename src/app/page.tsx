'use client';

import { useState, useEffect } from 'react';
import { Language, getTranslations } from '@/lib/i18n';
import { LanguageSelector } from '@/components/custom/language-selector';
import { AppointmentDetailModal } from '@/components/custom/appointment-detail-modal';
import { Calendar, Users, Clock, ArrowRight, Sparkles, Plus, Search, Filter, Bell, CheckCircle2, XCircle, AlertCircle, MoreVertical, ChevronLeft, ChevronRight, Camera, ListChecks } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { notificationService } from '@/lib/notifications';

// Tipos
interface Client {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  country_code?: string;
}

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

interface UserSettings {
  id: string;
  user_id: string;
  language: Language;
  created_at?: string;
  updated_at?: string;
}

type ViewMode = 'daily' | 'weekly' | 'monthly';

// Lista de códigos de país (DDI)
const countryCodes = [
  { code: '+55', country: 'Brasil', flag: '🇧🇷' },
  { code: '+1', country: 'EUA/Canadá', flag: '🇺🇸' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+34', country: 'Espanha', flag: '🇪🇸' },
  { code: '+44', country: 'Reino Unido', flag: '🇬🇧' },
  { code: '+33', country: 'França', flag: '🇫🇷' },
  { code: '+49', country: 'Alemanha', flag: '🇩🇪' },
  { code: '+39', country: 'Itália', flag: '🇮🇹' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+52', country: 'México', flag: '🇲🇽' },
];

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('pt');
  const [showWelcome, setShowWelcome] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingNotifications, setPendingNotifications] = useState(0);
  const [userId, setUserId] = useState<string>('default-user');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  
  const t = getTranslations(selectedLanguage);

  useEffect(() => {
    loadUserLanguagePreference();
  }, []);

  const loadUserLanguagePreference = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('language')
        .eq('user_id', userId)
        .single();

      if (data && data.language) {
        setSelectedLanguage(data.language as Language);
        setShowWelcome(false);
        loadData();
        loadNotifications();
      } else {
        const savedLang = localStorage.getItem('appLanguage') as Language;
        if (savedLang) {
          setSelectedLanguage(savedLang);
          setShowWelcome(false);
          loadData();
          loadNotifications();
          await saveLanguagePreference(savedLang);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar preferência de idioma:', error);
      const savedLang = localStorage.getItem('appLanguage') as Language;
      if (savedLang) {
        setSelectedLanguage(savedLang);
        setShowWelcome(false);
        loadData();
        loadNotifications();
      }
    }
  };

  const saveLanguagePreference = async (language: Language) => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          language: language,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      localStorage.setItem('appLanguage', language);
    } catch (error) {
      console.error('Erro ao salvar preferência de idioma:', error);
      localStorage.setItem('appLanguage', language);
    }
  };

  const handleLanguageChange = async (language: Language) => {
    setSelectedLanguage(language);
    await saveLanguagePreference(language);
  };

  const loadData = async () => {
    try {
      const { data: clientsData } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (clientsData) setClients(clientsData);

      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });
      
      if (appointmentsData) {
        // Parse JSON fields corretamente
        const parsedAppointments = appointmentsData.map(apt => {
          let checklist: ChecklistItem[] = [];
          let photos: string[] = [];
          
          // Tentar parsear checklist se existir
          if (apt.checklist) {
            try {
              checklist = typeof apt.checklist === 'string' 
                ? JSON.parse(apt.checklist) 
                : apt.checklist;
            } catch (e) {
              checklist = [];
            }
          }
          
          // Tentar parsear photos se existir
          if (apt.photos) {
            try {
              photos = typeof apt.photos === 'string' 
                ? JSON.parse(apt.photos) 
                : apt.photos;
            } catch (e) {
              photos = [];
            }
          }
          
          return {
            ...apt,
            checklist,
            photos
          };
        });
        setAppointments(parsedAppointments);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const pending = await notificationService.getPendingNotifications();
      setPendingNotifications(pending.length);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const handleContinue = async () => {
    await saveLanguagePreference(selectedLanguage);
    setShowWelcome(false);
    loadData();
    loadNotifications();
  };

  const formatPhoneNumber = (value: string, countryCode: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica máscara baseada no código do país
    if (countryCode === '+55') {
      // Brasil: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
      if (numbers.length <= 10) {
        return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      }
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    } else if (countryCode === '+1') {
      // EUA/Canadá: (XXX) XXX-XXXX
      return numbers.replace(/(\d{3})(\d{3})(\d{0,4})/, '($1) $2-$3');
    } else {
      // Outros países: formato genérico
      return numbers.replace(/(\d{2,3})(\d{3,4})(\d{0,4})/, '$1 $2-$3');
    }
  };

  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Email é opcional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const createAppointment = async (appointmentData: Partial<Appointment>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        await loadData(); // Recarregar dados após criar
        setShowNewAppointment(false);
        setSelectedClientId('');
        loadNotifications();
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
    }
  };

  const createNewClient = async (clientData: Partial<Client>) => {
    try {
      // Validar email se fornecido
      if (clientData.email && !validateEmail(clientData.email)) {
        alert('Por favor, insira um email válido.');
        return;
      }

      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setClients([...clients, data]);
        setShowNewClient(false);
      }
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
    }
  };

  const updateAppointment = async (id: string, updateData: any) => {
    try {
      // Preparar dados para salvar no banco
      const dataToSave: any = {};
      
      if (updateData.notes !== undefined) {
        dataToSave.notes = updateData.notes;
      }
      
      if (updateData.checklist !== undefined) {
        dataToSave.checklist = JSON.stringify(updateData.checklist);
      }
      
      if (updateData.photos !== undefined) {
        dataToSave.photos = JSON.stringify(updateData.photos);
      }
      
      if (updateData.status !== undefined) {
        dataToSave.status = updateData.status;
      }

      const { error } = await supabase
        .from('appointments')
        .update(dataToSave)
        .eq('id', id);

      if (error) throw error;
      
      // Recarregar dados após atualizar
      await loadData();
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    const appointment = appointments.find(apt => apt.id === id);
    
    // Confirmação antes de concluir ou cancelar
    if (status === 'completed') {
      if (!confirm('Tem certeza que deseja CONCLUIR este agendamento? Esta ação não poderá ser desfeita.')) {
        return;
      }
    } else if (status === 'cancelled') {
      // Não permitir cancelar se já foi concluído
      if (appointment?.status === 'completed') {
        alert('Não é possível cancelar um agendamento já concluído.');
        return;
      }
      if (!confirm('Tem certeza que deseja CANCELAR este agendamento?')) {
        return;
      }
    }
    
    await updateAppointment(id, { status });
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed': return <CheckCircle2 className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    
    if (viewMode === 'daily') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'weekly') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getDateRangeText = () => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    
    if (viewMode === 'daily') {
      return selectedDate.toLocaleDateString('pt-BR', options);
    } else if (viewMode === 'weekly') {
      const weekStart = new Date(selectedDate);
      weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${weekStart.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('pt-BR', options)}`;
    } else {
      return selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const aptDate = new Date(apt.appointment_date);
    const today = new Date(selectedDate);
    
    if (viewMode === 'daily') {
      return matchesSearch && 
             aptDate.toDateString() === today.toDateString();
    } else if (viewMode === 'weekly') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return matchesSearch && aptDate >= weekStart && aptDate <= weekEnd;
    } else {
      return matchesSearch && 
             aptDate.getMonth() === today.getMonth() &&
             aptDate.getFullYear() === today.getFullYear();
    }
  });

  if (showWelcome) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-orange-900/20">
        <div className="w-full max-w-2xl mx-auto text-center space-y-8">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 rounded-full blur-3xl opacity-40 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 p-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <Calendar className="w-20 h-20 text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-orange-500 animate-pulse" />
              <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                {t.welcome}
              </h1>
              <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
            </div>
            <p className="text-xl text-gray-700 dark:text-gray-200 font-medium">
              {t.selectLanguage}
            </p>
          </div>

          <div className="flex justify-center">
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onSelect={setSelectedLanguage}
            />
          </div>

          <button
            onClick={handleContinue}
            className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-110 transform"
          >
            <span className="relative z-10">{t.continue}</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
            <div className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 backdrop-blur-sm border-2 border-orange-200 dark:border-orange-700 hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-orange-300/50">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
                {t.appointments}
              </span>
            </div>
            <div className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/30 dark:to-pink-800/20 backdrop-blur-sm border-2 border-pink-200 dark:border-pink-700 hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-pink-300/50">
              <div className="p-3 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm font-bold text-pink-700 dark:text-pink-300">
                {t.clients}
              </span>
            </div>
            <div className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-700 hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-purple-300/50">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                {t.notifications}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-orange-900/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b-2 border-orange-200 dark:border-orange-800 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-xl shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Agendasoft Pro
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.dashboard}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={loadNotifications}
                className="relative p-3 rounded-xl bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 hover:scale-110 transition-transform shadow-lg"
              >
                <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                {pendingNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {pendingNotifications}
                  </span>
                )}
              </button>
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onSelect={handleLanguageChange}
                compact={true}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Navegação de Data */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border-2 border-orange-200 dark:border-orange-800">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {getDateRangeText()}
            </h2>
            <button
              onClick={goToToday}
              className="text-sm text-orange-600 dark:text-orange-400 hover:underline font-medium"
            >
              {t.today}
            </button>
          </div>
          
          <button
            onClick={() => navigateDate('next')}
            className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-xl transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </button>
        </div>

        {/* Barra de Ações */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
                viewMode === 'daily'
                  ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:scale-105'
              }`}
            >
              {t.daily}
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
                viewMode === 'weekly'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:scale-105'
              }`}
            >
              {t.weekly}
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
                viewMode === 'monthly'
                  ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:scale-105'
              }`}
            >
              {t.monthly}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowNewClient(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              <Users className="w-5 h-5" />
              <span className="hidden sm:inline">{t.newClient}</span>
            </button>
            <button
              onClick={() => setShowNewAppointment(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">{t.newAppointment}</span>
            </button>
          </div>
        </div>

        {/* Barra de Busca */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t.search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-800 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900/50 transition-all shadow-lg"
            />
          </div>
          <button className="px-6 py-3 bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 rounded-xl hover:scale-105 transition-transform shadow-lg">
            <Filter className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </button>
        </div>

        {/* Lista de Agendamentos */}
        <div className="grid gap-4">
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-dashed border-orange-300 dark:border-orange-700">
              <Calendar className="w-20 h-20 mx-auto text-gray-400 mb-4" />
              <p className="text-xl font-bold text-gray-600 dark:text-gray-400">{t.noAppointments}</p>
            </div>
          ) : (
            filteredAppointments.map((apt) => {
              const checklistCompleted = apt.checklist?.filter(item => item.completed).length || 0;
              const checklistTotal = apt.checklist?.length || 0;
              const hasPhotos = (apt.photos?.length || 0) > 0;
              const hasChecklist = checklistTotal > 0;
              
              return (
                <div
                  key={apt.id}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 border-orange-100 dark:border-orange-900 hover:border-orange-300 dark:hover:border-orange-700 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {apt.client_name}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border-2 ${getStatusColor(apt.status)}`}>
                          {getStatusIcon(apt.status)}
                          {t[apt.status]}
                        </span>
                        
                        {/* Indicadores de Ficha e Fotos */}
                        {hasChecklist && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border-2 border-purple-300">
                            <ListChecks className="w-3 h-3" />
                            {checklistCompleted}/{checklistTotal}
                          </span>
                        )}
                        {hasPhotos && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-700 border-2 border-pink-300">
                            <Camera className="w-3 h-3" />
                            {apt.photos?.length}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-500" />
                          <span className="font-medium">{new Date(apt.appointment_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-pink-500" />
                          <span className="font-medium">{apt.appointment_time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">{apt.service}</span>
                        </div>
                      </div>

                      {apt.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
                          {apt.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedAppointment(apt)}
                        className="p-2 rounded-xl bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 hover:scale-110 transition-transform"
                      >
                        <MoreVertical className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </button>
                    </div>
                  </div>

                  {/* Ações Rápidas */}
                  <div className="flex gap-2 mt-4 pt-4 border-t-2 border-gray-100 dark:border-gray-700">
                    {apt.status === 'pending' && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                        className="flex-1 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl font-bold hover:scale-105 transition-transform text-sm"
                      >
                        Confirmar
                      </button>
                    )}
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                        className="flex-1 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl font-bold hover:scale-105 transition-transform text-sm"
                      >
                        Concluir
                      </button>
                    )}
                    {apt.status !== 'completed' && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'cancelled')}
                        className="flex-1 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl font-bold hover:scale-105 transition-transform text-sm"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Detalhes do Agendamento */}
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          language={selectedLanguage}
          onClose={() => {
            setSelectedAppointment(null);
            loadData(); // Recarregar dados ao fechar modal
          }}
          onUpdate={updateAppointment}
        />
      )}

      {/* Modal Novo Agendamento */}
      {showNewAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">{t.newAppointment}</h2>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const clientId = formData.get('client_id') as string;
                const selectedClient = clients.find(c => c.id === clientId);
                
                createAppointment({
                  client_id: clientId || undefined,
                  client_name: selectedClient?.name || (formData.get('client_name') as string),
                  appointment_date: formData.get('date') as string,
                  appointment_time: formData.get('time') as string,
                  service: formData.get('service') as string,
                  status: 'pending',
                  notes: formData.get('notes') as string,
                });
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {t.client}
                </label>
                <select
                  name="client_id"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900/50 transition-all"
                >
                  <option value="">Cliente avulso (digite o nome abaixo)</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.phone ? `- ${client.phone}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {!selectedClientId && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t.clientName}
                  </label>
                  <input
                    type="text"
                    name="client_name"
                    required={!selectedClientId}
                    className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900/50 transition-all"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t.date}
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {t.time}
                  </label>
                  <input
                    type="time"
                    name="time"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {t.service}
                </label>
                <input
                  type="text"
                  name="service"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {t.notes}
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-900/50 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewAppointment(false);
                    setSelectedClientId('');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:scale-105 transition-transform"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Cliente */}
      {showNewClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">{t.newClient}</h2>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createNewClient({
                  name: formData.get('name') as string,
                  phone: formData.get('phone') as string,
                  email: formData.get('email') as string,
                  country_code: formData.get('country_code') as string,
                });
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {t.clientName}
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 dark:border-pink-800 bg-white dark:bg-gray-900 focus:border-pink-500 focus:ring-4 focus:ring-pink-200 dark:focus:ring-pink-900/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {t.phone}
                </label>
                <div className="flex gap-2">
                  <select
                    name="country_code"
                    defaultValue="+55"
                    className="w-32 px-3 py-3 rounded-xl border-2 border-pink-200 dark:border-pink-800 bg-white dark:bg-gray-900 focus:border-pink-500 focus:ring-4 focus:ring-pink-200 dark:focus:ring-pink-900/50 transition-all text-sm"
                  >
                    {countryCodes.map(({ code, country, flag }) => (
                      <option key={code} value={code}>
                        {flag} {code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="(00) 00000-0000"
                    onChange={(e) => {
                      const countryCode = (e.target.form?.country_code as any)?.value || '+55';
                      e.target.value = formatPhoneNumber(e.target.value, countryCode);
                    }}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-pink-200 dark:border-pink-800 bg-white dark:bg-gray-900 focus:border-pink-500 focus:ring-4 focus:ring-pink-200 dark:focus:ring-pink-900/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {t.email} <span className="text-gray-500 font-normal">(opcional)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="exemplo@email.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-pink-200 dark:border-pink-800 bg-white dark:bg-gray-900 focus:border-pink-500 focus:ring-4 focus:ring-pink-200 dark:focus:ring-pink-900/50 transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">Será validado automaticamente se fornecido</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewClient(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:scale-105 transition-transform"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
