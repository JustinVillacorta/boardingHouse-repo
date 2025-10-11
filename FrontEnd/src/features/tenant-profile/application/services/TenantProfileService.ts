import type { TenantProfileRepository } from '../../domain/repositories/TenantProfileRepository';
import type { TenantProfile, UpdateContactInfoRequest, UpdatePasswordRequest } from '../../domain/entities/TenantProfile';
import { GetTenantProfileUseCase } from '../usecases/GetTenantProfileUseCase';
import { UpdateContactInfoUseCase } from '../usecases/UpdateContactInfoUseCase';
import { UpdatePasswordUseCase } from '../usecases/UpdatePasswordUseCase';

export class TenantProfileService {
  private getTenantProfileUseCase: GetTenantProfileUseCase;
  private updateContactInfoUseCase: UpdateContactInfoUseCase;
  private updatePasswordUseCase: UpdatePasswordUseCase;

  constructor(tenantProfileRepository: TenantProfileRepository) {
    this.getTenantProfileUseCase = new GetTenantProfileUseCase(tenantProfileRepository);
    this.updateContactInfoUseCase = new UpdateContactInfoUseCase(tenantProfileRepository);
    this.updatePasswordUseCase = new UpdatePasswordUseCase(tenantProfileRepository);
  }

  async getTenantProfile(): Promise<TenantProfile> {
    return await this.getTenantProfileUseCase.execute();
  }

  async updateContactInfo(contactInfo: UpdateContactInfoRequest): Promise<TenantProfile> {
    return await this.updateContactInfoUseCase.execute(contactInfo);
  }

  async updatePassword(passwordData: UpdatePasswordRequest): Promise<void> {
    return await this.updatePasswordUseCase.execute(passwordData);
  }
}
