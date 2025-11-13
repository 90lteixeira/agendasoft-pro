// Sistema de internacionalização (i18n)
export type Language = 'pt' | 'en' | 'es' | 'fr';

export interface Translations {
  // Welcome Screen
  welcome: string;
  selectLanguage: string;
  continue: string;
  
  // Navigation
  dashboard: string;
  appointments: string;
  clients: string;
  calendar: string;
  settings: string;
  
  // Appointments
  newAppointment: string;
  editAppointment: string;
  deleteAppointment: string;
  appointmentDetails: string;
  date: string;
  time: string;
  client: string;
  service: string;
  status: string;
  notes: string;
  tasks: string;
  photos: string;
  
  // Clients
  newClient: string;
  clientName: string;
  phone: string;
  email: string;
  quickClient: string;
  quickClientDesc: string;
  
  // Calendar Views
  daily: string;
  weekly: string;
  monthly: string;
  today: string;
  
  // Notifications
  notifications: string;
  reminderBefore: string;
  clientReminder: string;
  
  // Actions
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  search: string;
  filter: string;
  
  // Status
  confirmed: string;
  pending: string;
  completed: string;
  cancelled: string;
  
  // Messages
  noAppointments: string;
  noClients: string;
  appointmentCreated: string;
  appointmentUpdated: string;
  appointmentDeleted: string;
}

export const translations: Record<Language, Translations> = {
  pt: {
    // Welcome Screen
    welcome: 'Bem-vindo ao Agendasoft Pro',
    selectLanguage: 'Selecione seu idioma',
    continue: 'Continuar',
    
    // Navigation
    dashboard: 'Painel',
    appointments: 'Agendamentos',
    clients: 'Clientes',
    calendar: 'Calendário',
    settings: 'Configurações',
    
    // Appointments
    newAppointment: 'Novo Agendamento',
    editAppointment: 'Editar Agendamento',
    deleteAppointment: 'Excluir Agendamento',
    appointmentDetails: 'Detalhes do Agendamento',
    date: 'Data',
    time: 'Hora',
    client: 'Cliente',
    service: 'Serviço',
    status: 'Status',
    notes: 'Observações',
    tasks: 'Lista de Tarefas',
    photos: 'Fotos Anexadas',
    
    // Clients
    newClient: 'Novo Cliente',
    clientName: 'Nome do Cliente',
    phone: 'Telefone',
    email: 'E-mail',
    quickClient: 'Cliente Avulso',
    quickClientDesc: 'Cadastro rápido sem registro completo',
    
    // Calendar Views
    daily: 'Diário',
    weekly: 'Semanal',
    monthly: 'Mensal',
    today: 'Hoje',
    
    // Notifications
    notifications: 'Notificações',
    reminderBefore: '10 minutos antes',
    clientReminder: 'Lembrete 1 dia antes',
    
    // Actions
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    add: 'Adicionar',
    search: 'Buscar agendamentos...',
    filter: 'Filtrar',
    
    // Status
    confirmed: 'Confirmado',
    pending: 'Pendente',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    
    // Messages
    noAppointments: 'Nenhum agendamento encontrado',
    noClients: 'Nenhum cliente cadastrado',
    appointmentCreated: 'Agendamento criado com sucesso',
    appointmentUpdated: 'Agendamento atualizado com sucesso',
    appointmentDeleted: 'Agendamento excluído com sucesso',
  },
  
  en: {
    // Welcome Screen
    welcome: 'Welcome to Agendasoft Pro',
    selectLanguage: 'Select your language',
    continue: 'Continue',
    
    // Navigation
    dashboard: 'Dashboard',
    appointments: 'Appointments',
    clients: 'Clients',
    calendar: 'Calendar',
    settings: 'Settings',
    
    // Appointments
    newAppointment: 'New Appointment',
    editAppointment: 'Edit Appointment',
    deleteAppointment: 'Delete Appointment',
    appointmentDetails: 'Appointment Details',
    date: 'Date',
    time: 'Time',
    client: 'Client',
    service: 'Service',
    status: 'Status',
    notes: 'Notes',
    tasks: 'Task List',
    photos: 'Attached Photos',
    
    // Clients
    newClient: 'New Client',
    clientName: 'Client Name',
    phone: 'Phone',
    email: 'Email',
    quickClient: 'Quick Client',
    quickClientDesc: 'Quick registration without full signup',
    
    // Calendar Views
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    today: 'Today',
    
    // Notifications
    notifications: 'Notifications',
    reminderBefore: '10 minutes before',
    clientReminder: 'Reminder 1 day before',
    
    // Actions
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search appointments...',
    filter: 'Filter',
    
    // Status
    confirmed: 'Confirmed',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    
    // Messages
    noAppointments: 'No appointments found',
    noClients: 'No clients registered',
    appointmentCreated: 'Appointment created successfully',
    appointmentUpdated: 'Appointment updated successfully',
    appointmentDeleted: 'Appointment deleted successfully',
  },
  
  es: {
    // Welcome Screen
    welcome: 'Bienvenido a Agendasoft Pro',
    selectLanguage: 'Selecciona tu idioma',
    continue: 'Continuar',
    
    // Navigation
    dashboard: 'Panel',
    appointments: 'Citas',
    clients: 'Clientes',
    calendar: 'Calendario',
    settings: 'Configuración',
    
    // Appointments
    newAppointment: 'Nueva Cita',
    editAppointment: 'Editar Cita',
    deleteAppointment: 'Eliminar Cita',
    appointmentDetails: 'Detalles de la Cita',
    date: 'Fecha',
    time: 'Hora',
    client: 'Cliente',
    service: 'Servicio',
    status: 'Estado',
    notes: 'Notas',
    tasks: 'Lista de Tareas',
    photos: 'Fotos Adjuntas',
    
    // Clients
    newClient: 'Nuevo Cliente',
    clientName: 'Nombre del Cliente',
    phone: 'Teléfono',
    email: 'Correo',
    quickClient: 'Cliente Rápido',
    quickClientDesc: 'Registro rápido sin inscripción completa',
    
    // Calendar Views
    daily: 'Diario',
    weekly: 'Semanal',
    monthly: 'Mensual',
    today: 'Hoy',
    
    // Notifications
    notifications: 'Notificaciones',
    reminderBefore: '10 minutos antes',
    clientReminder: 'Recordatorio 1 día antes',
    
    // Actions
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Añadir',
    search: 'Buscar citas...',
    filter: 'Filtrar',
    
    // Status
    confirmed: 'Confirmado',
    pending: 'Pendiente',
    completed: 'Completado',
    cancelled: 'Cancelado',
    
    // Messages
    noAppointments: 'No se encontraron citas',
    noClients: 'No hay clientes registrados',
    appointmentCreated: 'Cita creada con éxito',
    appointmentUpdated: 'Cita actualizada con éxito',
    appointmentDeleted: 'Cita eliminada con éxito',
  },
  
  fr: {
    // Welcome Screen
    welcome: 'Bienvenue à Agendasoft Pro',
    selectLanguage: 'Sélectionnez votre langue',
    continue: 'Continuer',
    
    // Navigation
    dashboard: 'Tableau de bord',
    appointments: 'Rendez-vous',
    clients: 'Clients',
    calendar: 'Calendrier',
    settings: 'Paramètres',
    
    // Appointments
    newAppointment: 'Nouveau Rendez-vous',
    editAppointment: 'Modifier Rendez-vous',
    deleteAppointment: 'Supprimer Rendez-vous',
    appointmentDetails: 'Détails du Rendez-vous',
    date: 'Date',
    time: 'Heure',
    client: 'Client',
    service: 'Service',
    status: 'Statut',
    notes: 'Notes',
    tasks: 'Liste de Tâches',
    photos: 'Photos Jointes',
    
    // Clients
    newClient: 'Nouveau Client',
    clientName: 'Nom du Client',
    phone: 'Téléphone',
    email: 'Email',
    quickClient: 'Client Rapide',
    quickClientDesc: 'Inscription rapide sans enregistrement complet',
    
    // Calendar Views
    daily: 'Quotidien',
    weekly: 'Hebdomadaire',
    monthly: 'Mensuel',
    today: "Aujourd'hui",
    
    // Notifications
    notifications: 'Notifications',
    reminderBefore: '10 minutes avant',
    clientReminder: 'Rappel 1 jour avant',
    
    // Actions
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    search: 'Rechercher rendez-vous...',
    filter: 'Filtrer',
    
    // Status
    confirmed: 'Confirmé',
    pending: 'En attente',
    completed: 'Terminé',
    cancelled: 'Annulé',
    
    // Messages
    noAppointments: 'Aucun rendez-vous trouvé',
    noClients: 'Aucun client enregistré',
    appointmentCreated: 'Rendez-vous créé avec succès',
    appointmentUpdated: 'Rendez-vous mis à jour avec succès',
    appointmentDeleted: 'Rendez-vous supprimé avec succès',
  },
};

export function getTranslations(lang: Language): Translations {
  return translations[lang] || translations.pt;
}
