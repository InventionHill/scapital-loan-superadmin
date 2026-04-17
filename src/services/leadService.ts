import axiosInstance from '@/utils/axios';

export interface LeadStats {
    totalCalls: number;
    completedLeads: number;
    followUpLeads: number;
    notAnsweredLeads: number;
    closedLeads: number;
    invalidLeads: number;
    newLeads: number;
    todayCalls: number;
    assignedCalls: number;
    totalAdmins: number;
    last7DaysCalls: { name: string; leads: number }[];
}

export const leadService = {
    getStats: async (): Promise<LeadStats> => {
        const response = await axiosInstance.get('v1/leads/stats');
        return response.data;
    }
};
