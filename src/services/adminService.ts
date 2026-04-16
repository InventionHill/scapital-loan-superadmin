import axiosInstance from '@/utils/axios';

export interface Admin {
  id: string;
  name: string;
  email: string;
  branchName: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  createdAt?: string;
}

export interface CreateAdminDto {
  name: string;
  email: string;
  password?: string;
  branchName: string;
}

export const adminService = {
  getAllAdmins: async () => {
    const response = await axiosInstance.get('/auth/admins');
    return response.data;
  },

  createAdmin: async (data: CreateAdminDto) => {
    const response = await axiosInstance.post('/auth/admins', data);
    return response.data;
  },

  updateAdmin: async (id: string, data: Partial<CreateAdminDto>) => {
    const response = await axiosInstance.patch(`/auth/admins/${id}`, data);
    return response.data;
  },

  deleteAdmin: async (id: string) => {
    const response = await axiosInstance.delete(`/auth/admins/${id}`);
    return response.data;
  },
};
