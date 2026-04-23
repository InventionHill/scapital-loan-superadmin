import axios from '@/utils/axios';
import { LoanType } from './loanTypeService';

export interface Lead {
    id: string;
    serialId: number;
    leadId: string;
    name: string | null;
    phoneNumber: string;
    email: string | null;
    status: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    source: string | null;
    notes: string | null;
    statusRemark: string | null;
    nextFollowUpAt: string | null;
    lastCallAt: string | null;
    profile: string | null;
    cibilStatus: string | null;
    cibilRemark: string | null;
    createdAt: string;
    updatedAt: string;
    assignedToId: string | null;
    loanType?: string;
    customLoanType?: string | null;
    loanTypeId?: string | null;
    assignedLoanType?: LoanType;
    assignedTo?: { id: string; name: string; email: string };
    applicationForm?: { id: string } | null;
    branchId?: string;
    branchSerialId?: number;
    callLogs?: CallLog[];
    _count?: { callLogs: number };
}

export interface ApplicationForm {
    id: string;
    leadId: string;
    name: string;
    phoneNumber: string;
    email?: string | null;
    motherName?: string | null;
    dob?: string | null;
    companyName?: string | null;
    fileNumber?: string | null;
    addresses?: {
        current: string;
        permanent: string;
        office: string;
        property: string;
    } | null;
    financials?: {
        netSalaryInr: number;
        loanAmountInr: number;
        obligationInr: number;
    } | null;
    product?: string | null;
    residentType?: string | null;
    leadBy?: string | null;
    references?: Array<{ name: string; phoneNumber: string }> | null;
    coApplicants?: Array<{ name: string; phoneNumber: string; email?: string; motherName?: string }> | null;
    createdAt: string;
    updatedAt: string;
}

export interface CallLog {
    id: string;
    type?: 'CALL' | 'ACTION';
    serialId: number;
    phoneNumber: string;
    callType: string;
    duration: number | null;
    outcome: string | null;
    notes: string | null;
    leadId: string | null;
    createdAt: string;
    caller?: { id: string; name: string };
    admin?: { id: string; name: string };
    lead?: { status: string; name?: string | null; serialId?: number; branchSerialId?: number; leadId?: string };
}

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
    totalAdmins?: number;
    last7DaysCalls: { name: string; leads: number }[];
}

export const leadService = {
    getLeads: async (params?: { 
        status?: string; 
        startDate?: string; 
        endDate?: string; 
        assignedToId?: string;
        branchId?: string;
    }) => {
        const response = await axios.get<Lead[]>('v1/leads', { params });
        return response.data;
    },

    getLead: async (id: string) => {
        const response = await axios.get<{ lead: Lead; calllogs: CallLog[] }>(`v1/leads/${id}`);
        return response.data;
    },

    updateStatus: async (id: string, data: any) => {
        const response = await axios.post(`v1/leads/${id}/call-result`, data);
        return response.data;
    },

    assignLead: async (id: string, userId: string) => {
        const response = await axios.patch(`v1/leads/${id}/assign`, { userId });
        return response.data;
    },

    deleteLead: async (id: string) => {
        const response = await axios.delete(`v1/leads/${id}`);
        return response.data;
    },

    createManual: async (data: {
        phoneNumber: string;
        name?: string;
        date?: string;
        time?: string;
        loanType?: string;
        customLoanType?: string;
    }) => {
        const response = await axios.post<Lead>('v1/leads/manual', data);
        return response.data;
    },

    importLeads: async (data: { leads: { phoneNumber: string; name?: string; branchId?: string }[] }) => {
        const response = await axios.post<{ imported: number; newLeads: number; updatedLeads: number; skipped: number; errors: any[] }>('v1/leads/import', data);
        return response.data;
    },

    getStats: async () => {
        const response = await axios.get<LeadStats>('v1/leads/stats');
        return response.data;
    },

    getApplicationForm: async (leadId: string) => {
        const response = await axios.get<ApplicationForm>(`v1/leads/${leadId}/application-form`);
        return response.data;
    },

    saveApplicationForm: async (leadId: string, data: Partial<ApplicationForm>) => {
        const response = await axios.post<ApplicationForm>(`v1/leads/${leadId}/application-form`, data);
        return response.data;
    },

    downloadApplicationPdf: async (leadId: string) => {
        const response = await axios.get(`v1/leads/${leadId}/application-form/pdf`, {
            responseType: 'blob',
        });
        return response.data;
    },
};
