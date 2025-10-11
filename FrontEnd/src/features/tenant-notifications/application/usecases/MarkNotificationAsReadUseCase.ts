import type { NotificationsRepository } from '../../domain/repositories/NotificationsRepository';

export class MarkNotificationAsReadUseCase {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute(notificationId: string): Promise<void> {
    return await this.notificationsRepository.markAsRead(notificationId);
  }
}
