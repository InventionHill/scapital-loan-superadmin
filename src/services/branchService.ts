import axiosInstance from '@/utils/axios';

export interface Branch {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export const branchService = {
  getAllBranches: async () => {
    const response = await axiosInstance.get<Branch[]>('v1/branches');
    return response.data;
  },
};
