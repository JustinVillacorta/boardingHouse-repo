import type { TenantProfileRepository } from '../../domain/repositories/TenantProfileRepository';
import type { TenantProfile } from '../../domain/entities/TenantProfile';

export class GetTenantProfileUseCase {
  constructor(private tenantProfileRepository: TenantProfileRepository) {}

  async execute(): Promise<TenantProfile> {
    return await this.tenantProfileRepository.getTenantProfile();
  }
}
