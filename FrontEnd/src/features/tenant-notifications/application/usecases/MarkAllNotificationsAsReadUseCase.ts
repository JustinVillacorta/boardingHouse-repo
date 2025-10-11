import type { NotificationsRepository } from '../../domain/repositories/NotificationsRepository';

export class MarkAllNotificationsAsReadUseCase {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute(): Promise<void> {
    return await this.notificationsRepository.markAllAsRead();
  }
}
