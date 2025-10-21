import type { NotificationsRepository } from '../../domain/repositories/NotificationsRepository';

export class GetUnreadCountUseCase {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute(): Promise<number> {
    return await this.notificationsRepository.getUnreadCount();
  }
}
