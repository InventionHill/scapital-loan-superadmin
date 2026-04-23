'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import {
  ArrowLeft, User, Phone, Calendar, Briefcase, Activity,
  Edit2, Trash2, Eye, Key, EyeOff, Plus, ShieldCheck, Clock,
  Building, LayoutDashboard, Search, FileSpreadsheet, UserPlus, Users, ChevronDown, Shield
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { callService } from '@/services/callService';
import { CallLog } from '@/services/leadService';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { Input } from '@/components/ui/Input';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { formatPhoneNumber } from '@/utils/phoneFormat';

interface MobileUser {
  id: string;
  name: string;
  username: string;
  mobileNumber: string;
  createdAt: string;
  totalLeads: number;
  totalFollowUps: number;
  totalNewLeads: number;
  totalClosedLeads: number;
  isEnabled?: boolean;
  role?: string;
}

interface AdminData {
  id: string;
  name: string;
  branchId: string;
  branchName: string;
}

export default function AdminMobileUsersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: adminId } = React.use(params);
  const router = useRouter();

  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [mobileUsers, setMobileUsers] = useState<MobileUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');

  // Logs State
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MobileUser | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    mobileNumber: '',
    password: '',
    role: 'USER'
  });
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAdminMobileUsers(adminId);
      setAdmin(data.admin);
      setMobileUsers(data.mobileUsers);
    } catch (error) {
      console.error('Failed to fetch mobile users:', error);
      toast.error('Failed to load mobile users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await callService.getCallLogs({
        adminId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: searchTerm || undefined
      });
      setLogs(res.data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleExportLogs = async () => {
    try {
      toast.loading('Exporting logs...', { id: 'export' });
      const blob = await callService.exportCallLogs({
        adminId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        search: searchTerm || undefined
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `admin_logs_${admin?.name || 'export'}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Logs exported successfully', { id: 'export' });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export logs', { id: 'export' });
    }
  };

  useEffect(() => {
    fetchData();
  }, [adminId]);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [adminId, activeTab, startDate, endDate, searchTerm]);

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsActionLoading(true);
    try {
      const updateData: any = { ...formData };
      if (!updateData.password) delete updateData.password;

      await adminService.updateMobileUser(selectedUser.id, updateData);
      toast.success('User updated successfully');
      setIsEditModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsActionLoading(true);
    try {
      await adminService.deleteMobileUser(selectedUser.id);
      toast.success('User deleted successfully');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCreateMobileUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mobile Validation (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobileNumber)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    // Password Validation: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      toast.error('Password: 8+ chars, uppercase, lowercase, number, and special character');
      return;
    }

    if (!formData.username || !formData.name) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsActionLoading(true);
    try {
      await adminService.createMobileUser({
        ...formData,
        branchId: admin?.branchId
      });
      toast.success('Mobile user created successfully');
      setIsCreateModalOpen(false);
      setFormData({ name: '', username: '', mobileNumber: '', password: '', role: 'USER' });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create mobile user');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, isEnabled: boolean) => {
    try {
      await adminService.toggleMobileUserStatus(id, isEnabled);
      setMobileUsers(prev => prev.map(user => user.id === id ? { ...user, isEnabled } : user));
      toast.success(`User ${isEnabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Failed to update status');
    }
  };

  const openEditModal = (user: MobileUser) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      username: user.username,
      mobileNumber: user.mobileNumber || '',
      password: '',
      role: user.role || 'USER'
    });
    setShowPassword(false);
    setIsEditModalOpen(true);
  };

  const openCreateModal = () => {
    setFormData({
      name: '',
      username: '',
      mobileNumber: '',
      password: '',
      role: 'USER'
    });
    setShowPassword(false);
    setIsCreateModalOpen(true);
  };

  const openDeleteModal = (user: MobileUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 flex items-center gap-6">
          <button
            onClick={() => router.push('/dashboard/admins')}
            className="group flex items-center justify-center p-3.5 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 shadow-sm"
            title="Back to Admins"
          >
            <ArrowLeft size={20} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="mb-2">
              <Breadcrumbs />
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-[#111827]">
                {admin ? admin.name : 'Loading...'}
              </h1>
              <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10">
                Admin Profile
              </span>
            </div>
            <p className="text-sm font-bold text-slate-400 mt-1 flex items-center gap-2">
              <Building size={14} className="text-slate-300" />
              {admin ? `Branch: ${admin.branchName}` : 'Retrieving assignment data...'}
            </p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2.5 px-6 py-4 rounded-[1rem] text-[13px] font-black uppercase tracking-widest bg-primary text-white shadow-xl shadow-primary/20 hover:opacity-90 transition-all duration-300"
        >
          <UserPlus size={20} strokeWidth={2.5} />
          Create Mobile User
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 p-1.5 bg-slate-100/50 rounded-[2rem] w-fit border border-slate-200/50">
        <button
          onClick={() => setActiveTab('users')}
          className={clsx(
            "flex items-center gap-2.5 px-8 py-3 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all duration-300",
            activeTab === 'users' ? "bg-white text-primary shadow-xl" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <LayoutDashboard size={18} strokeWidth={2.5} className={activeTab === 'users' ? "text-primary" : "text-slate-400"} />
          Mobile Users
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={clsx(
            "flex items-center gap-2.5 px-8 py-3 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all duration-300",
            activeTab === 'logs' ? "bg-white text-primary shadow-xl" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <Activity size={18} strokeWidth={2.5} className={activeTab === 'logs' ? "text-primary" : "text-slate-400"} />
          Admin Activity Logs
        </button>
      </div>

      <Card className="rounded-[1.5rem] border border-slate-100 bg-white overflow-hidden shadow-2xl shadow-slate-200/40 min-h-[600px]">
        <CardContent className="p-0">
          {activeTab === 'users' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50 bg-[#fafcfc]/50">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User Profile</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Details</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Creation Date</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Performance Stats</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-32 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-primary border-t-transparent shadow-xl shadow-primary/10"></div>
                          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Users...</span>
                        </div>
                      </td>
                    </tr>
                  ) : mobileUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-32 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-4">
                          <div className="h-20 w-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
                            <User size={40} strokeWidth={1.5} />
                          </div>
                          <p className="font-extrabold text-slate-400 uppercase tracking-widest text-xs">No Mobile Users Found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    mobileUsers.map((user) => (
                      <tr 
                        key={user.id} 
                        onClick={() => router.push(`/dashboard/admins/${adminId}/users/${user.id}`)}
                        className="hover:bg-[#fafcfc]/80 transition-all group duration-300 cursor-pointer"
                      >
                        <td className="px-8 py-7">
                          <div className="flex items-center gap-5">
                            <div className="relative">
                              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-[#085a59] flex items-center justify-center text-white font-black text-xl shadow-xl shadow-primary/20 group-hover:scale-105 transition-all duration-500">
                                {(user.name || user.username).charAt(0).toUpperCase()}
                              </div>
                              <div className={clsx(
                                "absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white shadow-sm",
                                user.isEnabled ?? true ? "bg-emerald-500" : "bg-slate-300"
                              )} />
                            </div>
                            <div>
                              <div className="font-extrabold text-[#111827] text-lg group-hover:text-primary transition-colors leading-none">
                                {user.name || user.username}
                              </div>
                              <div className="text-xs font-bold text-slate-400 flex items-center gap-2 mt-2">
                                <div className="bg-slate-100 p-1 rounded-md">
                                  <User size={12} className="text-slate-500" />
                                </div>
                                {user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-7">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-slate-100 text-slate-500">
                              <Phone size={16} strokeWidth={2.5} />
                            </div>
                            <span className="text-sm font-bold text-slate-600">{user.mobileNumber || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-7">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-slate-100 text-slate-500">
                              <Calendar size={16} strokeWidth={2.5} />
                            </div>
                            <span className="text-sm font-bold text-slate-600">
                              {new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-7">
                          <div 
                            className="flex flex-col items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Switch
                              checked={user.isEnabled ?? true}
                              onChange={(checked) => handleToggleStatus(user.id, checked)}
                            />
                            <span className={clsx(
                              "text-[9px] font-black uppercase tracking-widest",
                              user.isEnabled ?? true ? "text-emerald-500" : "text-rose-500"
                            )}>
                              {user.isEnabled ?? true ? 'Active' : 'Disabled'}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-7">
                          <div className="flex flex-wrap justify-center gap-3 max-w-[450px] mx-auto">
                            <div className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl bg-indigo-50 border border-indigo-100 min-w-[90px] shadow-sm shadow-indigo-500/5">
                              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Assigned</span>
                              <span className="text-base font-black text-indigo-700">{user.totalLeads}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-100 min-w-[90px] shadow-sm shadow-amber-500/5">
                              <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Follow-up</span>
                              <span className="text-base font-black text-amber-700">{user.totalFollowUps}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 min-w-[90px] shadow-sm shadow-emerald-500/5">
                              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">New</span>
                              <span className="text-base font-black text-emerald-700">{user.totalNewLeads}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-100 min-w-[90px] shadow-sm shadow-rose-500/5">
                              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Closed</span>
                              <span className="text-base font-black text-rose-700">{user.totalClosedLeads}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-7 text-right">
                          <div 
                            className="flex justify-end gap-2.5 transition-all duration-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => router.push(`/dashboard/admins/${adminId}/users/${user.id}`)}
                              className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/10 shadow-sm shadow-primary/5"
                              title="View Profile"
                            >
                              <Eye size={16} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-500/20 transition-all border border-amber-100 shadow-sm shadow-amber-500/5"
                              title="Edit User"
                            >
                              <Edit2 size={16} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(user)}
                              className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500/20 transition-all border border-rose-100 shadow-sm shadow-rose-500/5"
                              title="Delete User"
                            >
                              <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-0">
              {/* Logs Content */}
              <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-6 flex-1 min-w-[300px]">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] shrink-0">Branch Interaction History</h3>
                  <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="Search logs by phone number..."
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm text-slate-900 placeholder:text-slate-400"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      <input
                        type="date"
                        className="bg-transparent border-none p-0 text-[11px] font-black uppercase text-slate-600 focus:ring-0 cursor-pointer"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        title="Start Date"
                      />
                    </div>
                    <div className="h-4 w-px bg-slate-200" />
                    <div className="flex items-center gap-2 px-3 py-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      <input
                        type="date"
                        className="bg-transparent border-none p-0 text-[11px] font-black uppercase text-slate-600 focus:ring-0 cursor-pointer"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        title="End Date"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleExportLogs}
                    className="flex items-center gap-2.5 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100 shadow-sm shadow-emerald-500/5"
                  >
                    <FileSpreadsheet size={16} strokeWidth={2.5} />
                    Export Excel
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-slate-100">
                    <tr className="bg-[#fafcfc]/50">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Performed By</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Target User</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Final Outcome</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {logsLoading ? (
                      <tr>
                        <td colSpan={7} className="px-8 py-32 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Activity...</span>
                          </div>
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-8 py-32 text-center text-slate-400">
                          <div className="flex flex-col items-center gap-4 opacity-40">
                            <Activity size={48} strokeWidth={1.5} />
                            <p className="text-xs font-black uppercase tracking-widest">No activity logs found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      logs.map(log => {
                        const isAction = log.type === 'ACTION';
                        const actorName = log.caller?.name || log.admin?.name || 'Unknown';
                        const targetInfo = log.target || log.lead;

                        // Extract Action Name
                        let actionLabel = 'Action';
                        if (!isAction) {
                          actionLabel = 'Call';
                        } else {
                          const action = (log.action || '').toUpperCase();
                          if (action.includes('CREATE')) actionLabel = 'Create';
                          else if (action.includes('UPDATE')) actionLabel = 'Update';
                          else if (action.includes('DELETE')) actionLabel = 'Deleted';
                          else if (action.includes('ASSIGN')) actionLabel = 'Assign';
                          else actionLabel = action.split('_')[0].charAt(0).toUpperCase() + action.split('_')[0].slice(1).toLowerCase() || 'Update';
                        }

                        // Description
                        const description = isAction ? (log.notes || 'No description') : `Call interaction with ${targetInfo?.name || 'Lead'}`;

                        return (
                          <tr key={log.id} className="hover:bg-[#fafcfc] transition-all group border-b border-slate-50/80">
                            {/* Action */}
                            <td className="px-6 py-4">
                              <span className={clsx(
                                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap",
                                actionLabel === 'Create' ? 'bg-emerald-50 text-emerald-600' :
                                  actionLabel === 'Update' ? 'bg-blue-50 text-blue-600' :
                                    actionLabel === 'Deleted' ? 'bg-rose-50 text-rose-600' :
                                      actionLabel === 'Call' ? 'bg-indigo-50 text-indigo-600' :
                                        actionLabel === 'Assign' ? 'bg-amber-50 text-amber-600' :
                                          'bg-slate-100 text-slate-600'
                              )}>
                                {actionLabel}
                              </span>
                            </td>

                            {/* Description */}
                            <td className="px-6 py-4">
                              <p className="text-[11px] font-medium text-slate-600 max-w-[200px] leading-relaxed">
                                {description}
                              </p>
                            </td>

                            {/* Performed By */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                                  {actorName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[11px] font-bold text-slate-700 truncate">{actorName}</span>
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                    {isAction ? 'Admin' : 'Agent'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Target User */}
                            <td className="px-6 py-4">
                              {targetInfo ? (
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-bold text-slate-700">
                                    {targetInfo.name || 'Unknown'}
                                  </span>
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                    {targetInfo.type === 'MOBILE' ? 'Mobile User' :
                                      (targetInfo.branchSerialId || targetInfo.serialId) ? `Lead (LD-${String(targetInfo.branchSerialId || targetInfo.serialId).padStart(5, '0')})` : 'Target'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-300 italic">—</span>
                              )}
                            </td>

                            {/* Date */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-slate-700">
                                  {format(new Date(log.createdAt), 'MMM d, yyyy')}
                                </span>
                                <span className="text-[9px] font-black text-slate-400 uppercase">
                                  {format(new Date(log.createdAt), 'hh:mm a')}
                                </span>
                              </div>
                            </td>

                            {/* Final Outcome */}
                            <td className="px-6 py-4">
                              <span className={clsx(
                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap",
                                log.outcome === 'COMPLETED' || log.outcome === 'CONNECTED' || log.outcome === 'INTERESTED' ? 'bg-emerald-50 text-emerald-600' :
                                  log.outcome === 'NO_ANSWER' ? 'bg-rose-50 text-rose-600' :
                                    log.outcome === 'BUSY' ? 'bg-amber-50 text-amber-600' :
                                      log.outcome === 'FOLLOW_UP' ? 'bg-blue-50 text-blue-600' :
                                        'bg-slate-100 text-slate-500'
                              )}>
                                {log.outcome === 'COMPLETED' ? 'Call Connected' :
                                  (log.outcome || 'N/A').replace(/_/g, ' ')}
                              </span>
                            </td>

                            {/* Note */}
                            <td className="px-6 py-4">
                              <div className="flex flex-col items-start gap-1">
                                {!isAction ? (
                                  <div className="flex flex-col gap-1">
                                    {log.duration ? (
                                      <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded w-fit">
                                        {Math.floor(log.duration / 60)}m {log.duration % 60}s
                                      </span>
                                    ) : null}
                                    {log.notes ? (
                                      <span className="text-[10px] font-medium text-slate-500 italic line-clamp-2 max-w-[150px]">
                                        &quot;{log.notes}&quot;
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-300 italic">—</span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    System Log
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update Mobile User"
      >
        <form onSubmit={handleEditUser} className="space-y-6 pt-6">
          <Input
            label="FULL NAME"
            leftIcon={<User size={18} />}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="rounded-2xl border-slate-100 py-6"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="USERNAME"
              leftIcon={<LayoutDashboard size={16} />}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9_.]/g, '') })}
              required
              className="rounded-2xl border-slate-100 py-6 font-mono"
            />
            <Input
              label="CONTACT NUMBER"
              leftIcon={<Phone size={16} />}
              value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, '') })}
              maxLength={10}
              className="rounded-2xl border-slate-100 py-6"
            />
          </div>
          <Input
            label="SECURITY KEY (PASSWORD)"
            leftIcon={<Key size={16} />}
            type={showPassword ? 'text' : 'password'}
            placeholder="Leave blank to keep current"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="rounded-2xl border-slate-100 py-6"
            rightIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            onRightIconClick={() => setShowPassword(!showPassword)}
            autoComplete="new-password"
          />

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 py-4 px-6 rounded-2xl bg-slate-50 text-slate-500 font-bold uppercase tracking-widest text-xs hover:bg-slate-100 transition-all border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isActionLoading}
              className="flex-[1.5] py-4 px-6 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isActionLoading ? 'Saving...' : 'Update Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Mobile User"
      >
        <form onSubmit={handleCreateMobileUser} className="space-y-6 pt-6">
          <Input
            label="FULL NAME"
            leftIcon={<User size={18} />}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onFocus={(e) => {
              if (!formData.username && formData.name) {
                setFormData(prev => ({
                  ...prev,
                  username: prev.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
                }));
              }
            }}
            required
            placeholder="e.g. John Doe"
            className="rounded-2xl border-slate-100 py-6"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="USERNAME"
              leftIcon={<LayoutDashboard size={16} />}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9_.]/g, '') })}
              onFocus={() => {
                if (!formData.username && formData.name) {
                  setFormData(prev => ({
                    ...prev,
                    username: prev.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')
                  }));
                }
              }}
              required
              placeholder="johndoe"
              className="rounded-2xl border-slate-100 py-6 font-mono"
            />
            <Input
              label="CONTACT NUMBER"
              leftIcon={<Phone size={16} />}
              value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, '') })}
              required
              maxLength={10}
              placeholder="10-digit number"
              className="rounded-2xl border-slate-100 py-6"
            />
          </div>
          <Input
            label="SECURITY KEY (PASSWORD)"
            leftIcon={<Key size={16} />}
            type={showPassword ? 'text' : 'password'}
            placeholder="Strong password required"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className="rounded-2xl border-slate-100 py-6"
            rightIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            onRightIconClick={() => setShowPassword(!showPassword)}
            autoComplete="new-password"
          />

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Access Level (Role)</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className={clsx(
                  "w-full flex items-center justify-between px-4 py-4 rounded-2xl border transition-all duration-300",
                  isRoleDropdownOpen
                    ? "bg-white border-primary shadow-lg shadow-primary/10 ring-4 ring-primary/5"
                    : "bg-slate-50/50 border-slate-100 text-slate-900 hover:bg-white hover:border-slate-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <Shield size={18} className={isRoleDropdownOpen ? "text-primary" : "text-slate-400"} />
                  <span className="text-sm font-bold">
                    {formData.role === 'MANAGER' ? 'Manager' : 'User'}
                  </span>
                </div>
                <ChevronDown size={16} className={clsx("transition-transform duration-300", isRoleDropdownOpen && "rotate-180 text-primary")} />
              </button>

              {isRoleDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsRoleDropdownOpen(false)} />
                  <div className="absolute top-full mt-2 left-0 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top">
                    {[
                      { id: 'USER', label: 'User', desc: 'Default mobile application access', icon: User, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                      { id: 'MANAGER', label: 'Manager', desc: 'Access to team & lead management', icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' }
                    ].map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, role: role.id });
                          setIsRoleDropdownOpen(false);
                        }}
                        className={clsx(
                          "w-full text-left px-4 py-3 flex items-center justify-between transition-all hover:bg-slate-50 group",
                          formData.role === role.id ? "bg-primary/5" : ""
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={clsx(
                            "h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                            formData.role === role.id ? "bg-primary/10" : role.bg
                          )}>
                            <role.icon size={18} className={formData.role === role.id ? "text-primary" : role.color} />
                          </div>
                          <div className="flex flex-col">
                            <span className={clsx("text-sm font-bold", formData.role === role.id ? "text-primary" : "text-slate-900")}>{role.label}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{role.desc}</span>
                          </div>
                        </div>
                        {formData.role === role.id && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1 py-4 px-6 rounded-2xl bg-slate-50 text-slate-500 font-bold uppercase tracking-widest text-xs hover:bg-slate-100 transition-all border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isActionLoading}
              className="flex-[1.5] py-4 px-6 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isActionLoading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteUser}
        title="Delete Mobile User?"
        message={`This will permanently remove ${selectedUser?.name || selectedUser?.username} from the system. All associated lead assignments will be unassigned.`}
        confirmLabel="Yes, Delete User"
        variant="danger"
        isLoading={isActionLoading}
      />
    </div>
  );
}
