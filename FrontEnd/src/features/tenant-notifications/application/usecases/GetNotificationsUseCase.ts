import type { NotificationsRepository } from '../../domain/repositories/NotificationsRepository';
import type { Notification } from '../../domain/entities/Notification';

export class GetNotificationsUseCase {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute(): Promise<Notification[]> {
    return await this.notificationsRepository.getNotifications();
  }
}
