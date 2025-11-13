import { supabase } from '@/lib/supabase';

export interface NotificationSchedule {
  appointment_id: string;
  client_name: string;
  client_phone?: string;
  client_email?: string;
  appointment_date: string;
  appointment_time: string;
  service: string;
}

/**
 * Sistema de notificações automáticas
 * - 10 minutos antes do compromisso
 * - 1 dia antes (se cliente tiver telefone/email)
 */
export class NotificationService {
  /**
   * Agenda notificações para um novo agendamento
   */
  async scheduleNotifications(schedule: NotificationSchedule) {
    const { appointment_date, appointment_time } = schedule;
    
    // Calcular timestamps
    const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`);
    const tenMinutesBefore = new Date(appointmentDateTime.getTime() - 10 * 60 * 1000);
    const oneDayBefore = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);

    // Criar notificações no banco
    const notifications = [];

    // Notificação 10 minutos antes (sempre)
    notifications.push({
      appointment_id: schedule.appointment_id,
      type: 'reminder_10min',
      title: 'Lembrete de Agendamento',
      scheduled_for: tenMinutesBefore.toISOString(),
      message: `Lembrete: ${schedule.service} com ${schedule.client_name} em 10 minutos`,
      read: false
    });

    // Notificação 1 dia antes (se tiver contato)
    if (schedule.client_phone || schedule.client_email) {
      notifications.push({
        appointment_id: schedule.appointment_id,
        type: 'reminder_1day',
        title: 'Lembrete de Agendamento',
        scheduled_for: oneDayBefore.toISOString(),
        message: `Lembrete: Você tem ${schedule.service} agendado para amanhã às ${appointment_time}`,
        read: false
      });
    }

    // Salvar no banco
    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) {
      console.error('Erro ao agendar notificações:', error);
      throw error;
    }

    return notifications;
  }

  /**
   * Busca notificações pendentes que devem ser enviadas
   */
  async getPendingNotifications() {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('read', false)
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true });

    if (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Marca notificação como lida/enviada
   */
  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }

  /**
   * Envia notificação (implementação básica - expandir com Twilio/SendGrid)
   */
  async sendNotification(notification: any) {
    console.log('📧 Enviando notificação:', notification);

    // TODO: Integrar com serviços reais
    // - SMS: Twilio, AWS SNS
    // - Email: SendGrid, Resend
    // - Push: Firebase Cloud Messaging
    // - WhatsApp: Twilio WhatsApp API

    // Por enquanto, apenas log
    console.log(`📱 Notificação: ${notification.message}`);

    // Marcar como lida
    await this.markAsRead(notification.id);
  }

  /**
   * Processa todas as notificações pendentes
   * Executar periodicamente (cron job, edge function, etc)
   */
  async processNotifications() {
    const pending = await this.getPendingNotifications();
    
    for (const notification of pending) {
      try {
        await this.sendNotification(notification);
      } catch (error) {
        console.error('Erro ao enviar notificação:', error);
      }
    }

    return pending.length;
  }

  /**
   * Cancela notificações de um agendamento
   */
  async cancelNotifications(appointmentId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('appointment_id', appointmentId)
      .eq('read', false);

    if (error) {
      console.error('Erro ao cancelar notificações:', error);
    }
  }
}

// Instância singleton
export const notificationService = new NotificationService();
