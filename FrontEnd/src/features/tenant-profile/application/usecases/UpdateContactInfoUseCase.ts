import type { TenantProfileRepository } from '../../domain/repositories/TenantProfileRepository';
import type { TenantProfile, UpdateContactInfoRequest } from '../../domain/entities/TenantProfile';

export class UpdateContactInfoUseCase {
  constructor(private tenantProfileRepository: TenantProfileRepository) {}

  async execute(contactInfo: UpdateContactInfoRequest): Promise<TenantProfile> {
    return await this.tenantProfileRepository.updateContactInfo(contactInfo);
  }
}
