import type { TenantProfileRepository } from '../../domain/repositories/TenantProfileRepository';
import type { UpdatePasswordRequest } from '../../domain/entities/TenantProfile';

export class UpdatePasswordUseCase {
  constructor(private tenantProfileRepository: TenantProfileRepository) {}

  async execute(passwordData: UpdatePasswordRequest): Promise<void> {
    return await this.tenantProfileRepository.updatePassword(passwordData);
  }
}
