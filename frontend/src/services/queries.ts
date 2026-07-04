import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  contactApi, 
  vehicleApi, 
  policyApi, 
  claimApi, 
  premiumApi, 
  reportingApi, 
  searchApi,
  Contact,
  Vehicle,
  Policy,
  Claim
} from './apiClient';

// --- Contact Hooks ---

export const useContacts = () => {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: contactApi.list,
  });
};

export const useContact = (id: string) => {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => contactApi.get(id),
    enabled: !!id,
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: contactApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['reportingSummary'] });
    },
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Contact }) => contactApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      if (data.id) {
        queryClient.invalidateQueries({ queryKey: ['contacts', data.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['reportingSummary'] });
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: contactApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['reportingSummary'] });
    },
  });
};

// --- Vehicle Hooks ---

export const useVehicles = () => {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: vehicleApi.list,
  });
};

export const useVehicle = (id: string) => {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: () => vehicleApi.get(id),
    enabled: !!id,
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vehicleApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['reportingSummary'] });
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Vehicle }) => vehicleApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      if (data.id) {
        queryClient.invalidateQueries({ queryKey: ['vehicles', data.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['reportingSummary'] });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vehicleApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['reportingSummary'] });
    },
  });
};

// --- Policy Hooks ---

export const usePolicies = () => {
  return useQuery({
    queryKey: ['policies'],
    queryFn: policyApi.list,
  });
};

export const usePolicy = (id: string) => {
  return useQuery({
    queryKey: ['policies', id],
    queryFn: () => policyApi.get(id),
    enabled: !!id,
  });
};

export const useCreatePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: policyApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['reportingSummary'] });
    },
  });
};

export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Policy }) => policyApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      if (data.id) {
        queryClient.invalidateQueries({ queryKey: ['policies', data.id] });
        queryClient.invalidateQueries({ queryKey: ['policyHistory', data.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['reportingSummary'] });
    },
  });
};

export const useCancelPolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason, date }: { id: string; reason: string; date?: string }) => 
      policyApi.cancel(id, reason, date),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['policies', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['policyHistory', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['reportingSummary'] });
    },
  });
};

export const useRenewPolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: policyApi.renew,
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['policies', id] });
      queryClient.invalidateQueries({ queryKey: ['policyHistory', id] });
      queryClient.invalidateQueries({ queryKey: ['reportingSummary'] });
    },
  });
};

export const useReinstatePolicy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => policyApi.reinstate(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['policies'] });
      queryClient.invalidateQueries({ queryKey: ['policies', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['policyHistory', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['reportingSummary'] });
    },
  });
};

export const usePolicyHistory = (id: string) => {
  return useQuery({
    queryKey: ['policyHistory', id],
    queryFn: () => policyApi.history(id),
    enabled: !!id,
  });
};

// --- Claim Hooks ---

export const useClaims = () => {
  return useQuery({
    queryKey: ['claims'],
    queryFn: claimApi.list,
  });
};

export const useClaim = (id: string) => {
  return useQuery({
    queryKey: ['claims', id],
    queryFn: () => claimApi.get(id),
    enabled: !!id,
  });
};

export const useCreateClaim = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: claimApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['reportingSummary'] });
    },
  });
};

export const useUpdateClaim = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Claim }) => claimApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      if (data.id) {
        queryClient.invalidateQueries({ queryKey: ['claims', data.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['reportingSummary'] });
    },
  });
};

export const useCloseClaim = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => claimApi.close(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['claims', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['reportingSummary'] });
    },
  });
};

// --- Premium Calculation Hooks ---

export const useCalculatePremium = () => {
  return useMutation({
    mutationFn: premiumApi.calculate,
  });
};

// --- Reporting Hooks ---

export const useReportingSummary = () => {
  return useQuery({
    queryKey: ['reportingSummary'],
    queryFn: reportingApi.summary,
  });
};

// --- Search Hooks ---

export const useSearchContacts = (params: Record<string, string>, enabled = false) => {
  return useQuery({
    queryKey: ['searchContacts', params],
    queryFn: () => searchApi.contacts(params),
    enabled,
  });
};

export const useSearchPolicies = (params: Record<string, string>, enabled = false) => {
  return useQuery({
    queryKey: ['searchPolicies', params],
    queryFn: () => searchApi.policies(params),
    enabled,
  });
};

export const useSearchClaims = (params: Record<string, string>, enabled = false) => {
  return useQuery({
    queryKey: ['searchClaims', params],
    queryFn: () => searchApi.claims(params),
    enabled,
  });
};
