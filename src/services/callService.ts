import axios from '@/utils/axios';
import { CallLog } from './leadService';

export const callService = {
  getCallLogs: async (params?: {
    startDate?: string;
    endDate?: string;
    phoneNumber?: string;
    assignedToId?: string;
    adminId?: string;
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await axios.get<{ data: CallLog[]; total: number; page: number; limit: number }>('v1/calls', { params });
    return response.data;
  },
  exportCallLogs: async (params?: {
    startDate?: string;
    endDate?: string;
    assignedToId?: string;
    adminId?: string;
    search?: string;
    status?: string;
  }) => {
    const response = await axios.get('v1/calls/export', { 
      params, 
      responseType: 'blob' 
    });
    return response.data;
  },
  updateCallLogAgent: async (id: string, callerId: string) => {
    const response = await axios.patch<CallLog>(`v1/calls/${id}`, { callerId });
    return response.data;
  },
};
