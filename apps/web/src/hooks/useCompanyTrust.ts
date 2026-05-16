import { useQuery } from '@tanstack/react-query';
import type { Company } from '@skillgap/types';
import { api } from '../lib/api';

export function useCompanyTrust() {
  return useQuery({
    queryKey: ['company', 'me'],
    queryFn: async (): Promise<Company> => {
      const res = await api.get<{ company: Company }>('/companies/me');
      return res.data.company;
    },
  });
}
