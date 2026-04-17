import axiosInstance from '@/utils/axios';

export interface Admin {
  id: string;
  name: string;
  email: string;
  branchName: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  createdAt?: string;
  mobileIds: string[];
}

export interface CreateAdminDto {
  name: string;
  email: string;
  password?: string;
  branchName: string;
  mobileIds?: string[];
}

export const adminService = {
  getAllAdmins: async () => {
    const response = await axiosInstance.get('v1/auth/admins');
    return response.data;
  },

  createAdmin: async (data: CreateAdminDto) => {
    const response = await axiosInstance.post('v1/auth/admins', data);
    return response.data;
  },

  updateAdmin: async (id: string, data: Partial<CreateAdminDto>) => {
    const response = await axiosInstance.patch(`v1/auth/admins/${id}`, data);
    return response.data;
  },

  deleteAdmin: async (id: string) => {
    const response = await axiosInstance.delete(`v1/auth/admins/${id}`);
    return response.data;
  },
};
