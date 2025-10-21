import type { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import type { RoomOccupancy } from '../../domain/entities/RoomOccupancy';

export class GetOccupancyDataUseCase {
  constructor(private dashboardRepository: DashboardRepository) {}

  async execute(): Promise<RoomOccupancy> {
    return await this.dashboardRepository.getRoomOccupancyData();
  }
}