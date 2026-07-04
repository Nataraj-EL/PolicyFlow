import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to customize and format error messages
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred.';
    if (error.response?.data) {
      const data = error.response.data;
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        message = data.errors.join('\n');
      } else if (data.message) {
        message = data.message;
      } else if (data.error) {
        message = data.error;
      }
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

// --- Domain Interfaces ---

export interface Contact {
  id?: string;
  contactType: 'PERSON' | 'COMPANY';
  firstName?: string;
  lastName?: string;
  companyName?: string;
  emailAddress?: string;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface Vehicle {
  id?: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  licensePlate?: string;
  vehicleType: string;
  fuelType: string;
}

export interface Policy {
  id?: string;
  policyNumber?: string;
  contactId: string;
  vehicleId: string;
  policyType: string;
  status?: string;
  effectiveDate: string;
  expirationDate: string;
  cancellationDate?: string;
  cancellationReason?: string;
  previousPolicyId?: string;
}

export interface Claim {
  id?: string;
  claimNumber?: string;
  policyId: string;
  lossDate: string;
  reportedDate: string;
  status?: string;
  claimType: string;
  description?: string;
}

export interface PolicyHistoryEntry {
  id: string;
  policyId: string;
  transactionType: string;
  oldStatus?: string;
  newStatus: string;
  timestamp: string;
  description: string;
  performedBy: string;
}

export interface PremiumBreakdown {
  basePremium: number;
  vehicleAgeFactor: number;
  vehicleTypeFactor: number;
  fuelTypeFactor: number;
  contactTypeFactor: number;
  tax: number;
  totalPremium: number;
}

export interface PortfolioSummary {
  activePoliciesCount: number;
  openClaimsCount: number;
  totalActivePremium: number;
  generatedAt: string;
  policiesByStatus: Record<string, number>;
  policiesByType: Record<string, number>;
  claimsByStatus: Record<string, number>;
  claimsByType: Record<string, number>;
}

// --- API Functions ---

export const contactApi = {
  list: () => apiClient.get<Contact[]>('/api/contacts').then(res => res.data),
  get: (id: string) => apiClient.get<Contact>(`/api/contacts/${id}`).then(res => res.data),
  create: (data: Contact) => apiClient.post<Contact>('/api/contacts', data).then(res => res.data),
  update: (id: string, data: Contact) => apiClient.put<Contact>(`/api/contacts/${id}`, data).then(res => res.data),
  delete: (id: string) => apiClient.delete(`/api/contacts/${id}`).then(res => res.data),
};

export const vehicleApi = {
  list: () => apiClient.get<Vehicle[]>('/api/vehicles').then(res => res.data),
  get: (id: string) => apiClient.get<Vehicle>(`/api/vehicles/${id}`).then(res => res.data),
  create: (data: Vehicle) => apiClient.post<Vehicle>('/api/vehicles', data).then(res => res.data),
  update: (id: string, data: Vehicle) => apiClient.put<Vehicle>(`/api/vehicles/${id}`, data).then(res => res.data),
  delete: (id: string) => apiClient.delete(`/api/vehicles/${id}`).then(res => res.data),
};

export const policyApi = {
  list: () => apiClient.get<Policy[]>('/api/policies').then(res => res.data),
  get: (id: string) => apiClient.get<Policy>(`/api/policies/${id}`).then(res => res.data),
  create: (data: Policy) => apiClient.post<Policy>('/api/policies', data).then(res => res.data),
  update: (id: string, data: Policy) => apiClient.put<Policy>(`/api/policies/${id}`, data).then(res => res.data),
  cancel: (id: string, reason: string, date?: string) => {
    const params = new URLSearchParams({ reason });
    if (date) params.append('cancellationDate', date);
    return apiClient.post(`/api/policies/${id}/cancel?${params.toString()}`).then(res => res.data);
  },
  renew: (id: string) => apiClient.post<Policy>(`/api/policies/${id}/renew`).then(res => res.data),
  reinstate: (id: string, reason: string) => {
    const params = new URLSearchParams({ reason });
    return apiClient.post(`/api/policies/${id}/reinstate?${params.toString()}`).then(res => res.data);
  },
  history: (id: string) => apiClient.get<PolicyHistoryEntry[]>(`/api/policies/${id}/history`).then(res => res.data),
};

export const claimApi = {
  list: () => apiClient.get<Claim[]>('/api/claims').then(res => res.data),
  get: (id: string) => apiClient.get<Claim>(`/api/claims/${id}`).then(res => res.data),
  create: (data: Claim) => apiClient.post<Claim>('/api/claims', data).then(res => res.data),
  update: (id: string, data: Claim) => apiClient.put<Claim>(`/api/claims/${id}`, data).then(res => res.data),
  close: (id: string, reason: string) => {
    const params = new URLSearchParams({ reason });
    return apiClient.post(`/api/claims/${id}/close?${params.toString()}`).then(res => res.data);
  },
};

export const premiumApi = {
  calculate: (data: { vehicle: Vehicle; contact: Contact }) =>
    apiClient.post<PremiumBreakdown>('/api/premium/calculate', data).then(res => res.data),
};

export const reportingApi = {
  summary: () => apiClient.get<PortfolioSummary>('/api/reporting/summary').then(res => res.data),
};

export const searchApi = {
  contacts: (params: Record<string, string>) =>
    apiClient.get<Contact[]>('/api/search/contacts', { params }).then(res => res.data),
  policies: (params: Record<string, string>) =>
    apiClient.get<Policy[]>('/api/search/policies', { params }).then(res => res.data),
  claims: (params: Record<string, string>) =>
    apiClient.get<Claim[]>('/api/search/claims', { params }).then(res => res.data),
};
