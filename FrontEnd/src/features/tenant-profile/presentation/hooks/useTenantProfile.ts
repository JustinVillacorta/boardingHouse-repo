import { useState, useEffect, useCallback } from 'react';
import { TenantProfileService } from '../../application/services/TenantProfileService';
import { TenantProfileRepositoryImpl } from '../../infrastructure/repositories/TenantProfileRepositoryImpl';
import type { TenantProfile, UpdateContactInfoRequest, UpdatePasswordRequest } from '../../domain/entities/TenantProfile';

// Create service instance
const tenantProfileRepository = new TenantProfileRepositoryImpl();
const tenantProfileService = new TenantProfileService(tenantProfileRepository);

interface UseTenantProfileState {
  profile: TenantProfile | null;
  loading: boolean;
  error: string | null;
}

export const useTenantProfile = () => {
  const [state, setState] = useState<UseTenantProfileState>({
    profile: null,
    loading: false,
    error: null,
  });

  const [isUpdatingContact, setIsUpdatingContact] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profile = await tenantProfileService.getTenantProfile();
      
      setState(prev => ({
        ...prev,
        profile,
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load profile';
      setError(errorMessage);
      setLoading(false);
    }
  }, []);

  const updateContactInfo = useCallback(async (contactInfo: UpdateContactInfoRequest) => {
    try {
      setIsUpdatingContact(true);
      setError(null);
      
      const updatedProfile = await tenantProfileService.updateContactInfo(contactInfo);
      
      setState(prev => ({
        ...prev,
        profile: updatedProfile,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update contact info';
      setError(errorMessage);
      throw error; // Re-throw to let the component handle it
    } finally {
      setIsUpdatingContact(false);
    }
  }, []);

  const updatePassword = useCallback(async (passwordData: UpdatePasswordRequest) => {
    try {
      setIsUpdatingPassword(true);
      setError(null);
      
      await tenantProfileService.updatePassword(passwordData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
      setError(errorMessage);
      throw error; // Re-throw to let the component handle it
    } finally {
      setIsUpdatingPassword(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    // State
    profile: state.profile,
    loading: state.loading,
    error: state.error,
    isUpdatingContact,
    isUpdatingPassword,
    
    // Actions
    updateContactInfo,
    updatePassword,
    refresh: loadProfile,
    clearError: () => setError(null),
  };
};
