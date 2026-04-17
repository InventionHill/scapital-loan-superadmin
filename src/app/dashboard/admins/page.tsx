'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Plus, User, Mail, Building, Edit2, Trash2, Key, Eye, EyeOff } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { adminService, Admin, CreateAdminDto } from '@/services/adminService';
import { toast } from 'react-hot-toast';

export default function AdminsManagementPage() {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [resetPassword, setResetPassword] = useState('');
    const [showResetPassword, setShowResetPassword] = useState(false);

    // Form state
    const [formData, setFormData] = useState<CreateAdminDto>({
        name: '',
        email: '',
        password: '',
        branchName: '',
        mobileIds: [''] // Start with one empty slot
    });

    const resetForm = () => {
        setFormData({ name: '', email: '', password: '', branchName: '', mobileIds: [''] });
        setShowPassword(false);
    };

    const handleMobileIdChange = (index: number, value: string) => {
        const newIds = [...(formData.mobileIds || [''])];
        newIds[index] = value;
        setFormData({ ...formData, mobileIds: newIds });
    };

    const addMobileIdField = () => {
        setFormData({ ...formData, mobileIds: [...(formData.mobileIds || []), ''] });
    };

    const removeMobileIdField = (index: number) => {
        const newIds = [...(formData.mobileIds || [''])];
        if (newIds.length > 1) {
            newIds.splice(index, 1);
            setFormData({ ...formData, mobileIds: newIds });
        } else {
            setFormData({ ...formData, mobileIds: [''] });
        }
    };

    const fetchAdmins = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getAllAdmins();
            setAdmins(data);
        } catch (error) {
            console.error('Failed to fetch admins:', error);
            toast.error('Failed to load admins');
            setAdmins([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsActionLoading(true);
        try {
            // Filter out empty IDs before submission
            const submissionData = {
                ...formData,
                mobileIds: formData.mobileIds?.filter(id => id.trim() !== '') || []
            };
            await adminService.createAdmin(submissionData);
            toast.success('Admin created successfully');
            setIsAddModalOpen(false);
            resetForm();
            fetchAdmins();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to create admin');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleEditAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAdmin) return;
        setIsActionLoading(true);
        try {
            const { password: _, ...updateData } = formData;
            // Unused check for password which is already omitted in destructuring above
            const submissionData = {
                ...updateData,
                mobileIds: formData.mobileIds?.filter(id => id.trim() !== '') || []
            };
            await adminService.updateAdmin(selectedAdmin.id, submissionData);
            toast.success('Admin updated successfully');
            setIsEditModalOpen(false);
            fetchAdmins();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to update admin');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteAdmin = async () => {
        if (!selectedAdmin) return;
        setIsActionLoading(true);
        try {
            await adminService.deleteAdmin(selectedAdmin.id);
            toast.success('Admin deleted successfully');
            setIsDeleteModalOpen(false);
            fetchAdmins();
        } catch (error) {
            console.error('Failed to delete admin:', error);
            toast.error('Failed to delete admin');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAdmin) return;
        setIsActionLoading(true);
        try {
            await adminService.updateAdmin(selectedAdmin.id, { password: resetPassword });
            toast.success('Password reset successfully');
            setIsResetModalOpen(false);
            setResetPassword('');
        } catch (error) {
            console.error('Failed to reset password:', error);
            toast.error('Failed to reset password');
        } finally {
            setIsActionLoading(false);
        }
    };

    const openEditModal = (admin: Admin) => {
        setSelectedAdmin(admin);
        setFormData({
            name: admin.name,
            email: admin.email,
            branchName: admin.branchName,
            password: '', // Don't show password on edit
            mobileIds: admin.mobileIds?.length > 0 ? [...admin.mobileIds] : ['']
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (admin: Admin) => {
        setSelectedAdmin(admin);
        setIsDeleteModalOpen(true);
    };

    const openResetModal = (admin: Admin) => {
        setSelectedAdmin(admin);
        setResetPassword('');
        setIsResetModalOpen(false); // Reset eye icon state too
        setShowResetPassword(false);
        setIsResetModalOpen(true);
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-[#111827]">Admins Management</h1>
                    <p className="text-sm font-semibold text-slate-400">Manage centralized access and branch assignments across the entire platform.</p>
                </div>
                <div className="flex items-center gap-3">

                    <button
                        onClick={() => {
                            setFormData({ name: '', email: '', password: '', branchName: '' });
                            setIsAddModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus size={20} />
                        <span>Add New Admin</span>
                    </button>
                </div>
            </div>

            <Card className="rounded-[1rem] border border-slate-100 bg-white overflow-hidden shadow-xl shadow-slate-200/50">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-50 bg-[#fafcfc]/50">
                                    <th className="px-8 py-6 text-xs font-extrabold uppercase tracking-widest text-slate-400">Administrator</th>
                                    <th className="px-8 py-6 text-xs font-extrabold uppercase tracking-widest text-slate-400">Branch Name</th>
                                    <th className="px-8 py-6 text-xs font-extrabold uppercase tracking-widest text-slate-400">Mobile IDs</th>
                                    <th className="px-8 py-6 text-xs font-extrabold uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="px-8 py-6 text-xs font-extrabold uppercase tracking-widest text-slate-400 text-right">Settings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-primary border-t-transparent shadow-xl shadow-primary/10"></div>
                                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Compiling Database...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : admins.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-32 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="h-20 w-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
                                                    <User size={40} strokeWidth={1.5} />
                                                </div>
                                                <p className="font-extrabold text-slate-400 uppercase tracking-widest text-xs">No Administrators Detected</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    admins.map((admin) => (
                                        <tr key={admin.id} className="hover:bg-[#fafcfc]/80 transition-all group duration-300">
                                            <td className="px-8 py-7">
                                                <div className="flex items-center gap-5">
                                                    <div className="relative">
                                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-[#085a59] flex items-center justify-center text-white font-black text-xl shadow-xl shadow-primary/20 group-hover:scale-105 transition-all duration-500">
                                                            {admin.name.charAt(0)}
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-4 border-white shadow-sm" />
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-[#111827] text-lg group-hover:text-primary transition-colors leading-none">{admin.name}</div>
                                                        <div className="text-xs font-bold text-slate-400 flex items-center gap-2 mt-2">
                                                            <div className="bg-slate-100 p-1 rounded-md">
                                                                <Mail size={12} className="text-slate-500" />
                                                            </div>
                                                            {admin.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-7">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-2 rounded-xl bg-slate-100 text-slate-500">
                                                        <Building size={16} strokeWidth={2.5} />
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-600">{admin.branchName}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-7">
                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                    {admin.mobileIds?.length > 0 ? (
                                                        admin.mobileIds.map((id, idx) => (
                                                            <div key={idx} className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-md border border-primary/20 truncate max-w-full" title={id}>
                                                                {id.slice(-8)}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-slate-400 font-bold italic">No IDs</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-7">
                                                <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                                    <div className="flex h-2 w-12 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full w-full bg-emerald-500 rounded-full" />
                                                    </div>
                                                    <span className="text-emerald-500">Active</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-7 text-right">
                                                <div className="flex justify-end gap-3 transition-all duration-300">
                                                    <button
                                                        onClick={() => openEditModal(admin)}
                                                        className="h-11 w-11 flex items-center justify-center text-primary transition-all bg-primary/5 hover:bg-primary/10 rounded-2xl border border-primary/20"
                                                        title="Refine Settings"
                                                    >
                                                        <Edit2 size={18} strokeWidth={2.5} />
                                                    </button>
                                                    <button
                                                        onClick={() => openResetModal(admin)}
                                                        className="h-11 w-11 flex items-center justify-center text-amber-500 transition-all bg-amber-50 hover:bg-amber-100 rounded-2xl border border-amber-100"
                                                        title="Reset Security Key"
                                                    >
                                                        <Key size={18} strokeWidth={2.5} />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(admin)}
                                                        className="h-11 w-11 flex items-center justify-center text-rose-500 transition-all bg-rose-50 hover:bg-rose-100 rounded-2xl border border-rose-100 disabled:opacity-30 disabled:grayscale disabled:pointer-events-none"
                                                        disabled={admin.role === 'SUPER_ADMIN'}
                                                        title={admin.role === 'SUPER_ADMIN' ? "Owner Lock" : "Terminate Access"}
                                                    >
                                                        <Trash2 size={18} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Modals are styled within their components, but I'll ensure inputs match */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Create New Administrator"
            >
                <form onSubmit={handleAddAdmin} className="space-y-6 pt-6">
                    <Input
                        label="FULL NAME"
                        placeholder="e.g. Alexander Pierce"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="rounded-2xl border-slate-100 py-6"
                    />
                    <Input
                        label="SYSTEM EMAIL"
                        type="email"
                        placeholder="email@address.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="rounded-2xl border-slate-100 py-6"
                        autoComplete="off"
                    />
                    <Input
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="ayx@453"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="rounded-2xl border-slate-100 py-6"
                        rightIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        onRightIconClick={() => setShowPassword(!showPassword)}
                        autoComplete="new-password"
                    />
                    <Input
                        label="BRANCH ASSIGNMENT"
                        placeholder="e.g. Central Hub"
                        value={formData.branchName}
                        onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                        required
                        className="rounded-2xl border-slate-100 py-6"
                    />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">MOBILE IDs</label>
                            <button
                                type="button"
                                onClick={addMobileIdField}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/5 text-primary text-[10px] font-black uppercase tracking-wider hover:bg-primary/10 transition-all border border-primary/20"
                            >
                                <Plus size={12} strokeWidth={3} />
                                <span>Add New ID</span>
                            </button>
                        </div>
                        <div className="space-y-3">
                            {formData.mobileIds?.map((id, index) => (
                                <div key={index} className="flex gap-2 group">
                                    <Input
                                        placeholder="Enter Unique Mobile ID (UUID)"
                                        value={id}
                                        onChange={(e) => handleMobileIdChange(index, e.target.value)}
                                        className="rounded-2xl border-slate-100 py-6 flex-1"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeMobileIdField(index)}
                                        className="h-14 w-14 shrink-0 flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-2xl border border-rose-100 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                                        disabled={formData.mobileIds?.length === 1 && id === ''}
                                    >
                                        <Trash2 size={18} strokeWidth={2.5} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            className="flex-1 py-4 px-6 rounded-2xl bg-slate-50 text-slate-500 font-bold uppercase tracking-widest text-xs hover:bg-slate-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isActionLoading}
                            className="flex-[1.5] py-4 px-6 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {isActionLoading ? 'Loading...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Admin Credentials"
            >
                <form onSubmit={handleEditAdmin} className="space-y-6 pt-6">
                    <Input
                        label="FULL NAME"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="rounded-2xl border-slate-100 py-6"
                    />
                    <Input
                        label="SYSTEM EMAIL"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="rounded-2xl border-slate-100 py-6"
                    />
                    <Input
                        label="BRANCH ASSIGNMENT"
                        value={formData.branchName}
                        onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                        required
                        className="rounded-2xl border-slate-100 py-6"
                    />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">MOBILE IDs</label>
                            <button
                                type="button"
                                onClick={addMobileIdField}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/5 text-primary text-[10px] font-black uppercase tracking-wider hover:bg-primary/10 transition-all border border-primary/20"
                            >
                                <Plus size={12} strokeWidth={3} />
                                <span>Add New ID</span>
                            </button>
                        </div>
                        <div className="space-y-3">
                            {formData.mobileIds?.map((id, index) => (
                                <div key={index} className="flex gap-2 group">
                                    <Input
                                        placeholder="Enter Unique Mobile ID (UUID)"
                                        value={id}
                                        onChange={(e) => handleMobileIdChange(index, e.target.value)}
                                        className="rounded-2xl border-slate-100 py-6 flex-1"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeMobileIdField(index)}
                                        className="h-14 w-14 shrink-0 flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-2xl border border-rose-100 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                                        disabled={formData.mobileIds?.length === 1 && id === ''}
                                    >
                                        <Trash2 size={18} strokeWidth={2.5} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsEditModalOpen(false)}
                            className="flex-1 py-4 px-6 rounded-2xl bg-slate-50 text-slate-500 font-bold uppercase tracking-widest text-xs hover:bg-slate-100 transition-all"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={isActionLoading}
                            className="flex-[1.5] py-4 px-6 rounded-2xl bg-primary text-white font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {isActionLoading ? 'Updating...' : 'Submit Changes'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteAdmin}
                title="You Want to Delete this admin?"
                message={`Remove system access for ${selectedAdmin?.name}. This node will be disconnected from the central network indefinitely.`}
                confirmLabel="Delete Admin User"
                variant="danger"
                isLoading={isActionLoading}
            />

            <Modal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                title="Reset Administrator Password"
            >
                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                    <div className="flex items-center gap-3 text-amber-700">
                        <Key size={20} className="shrink-0" />
                        <p className="text-xs font-bold leading-relaxed">
                            Resetting access for <span className="font-black text-amber-900">{selectedAdmin?.name}</span>.
                            Users will be required to use the new key immediately.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-6">
                    <Input
                        label="New Security Access Key"
                        type={showResetPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        required
                        className="rounded-2xl border-slate-100 py-6"
                        rightIcon={showResetPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        onRightIconClick={() => setShowResetPassword(!showResetPassword)}
                        autoComplete="new-password"
                    />

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsResetModalOpen(false)}
                            className="flex-1 py-4 px-6 rounded-2xl bg-slate-50 text-slate-500 font-bold uppercase tracking-widest text-xs hover:bg-slate-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isActionLoading}
                            className="flex-[1.5] py-4 px-6 rounded-2xl bg-amber-500 text-white font-bold uppercase tracking-widest text-xs hover:bg-amber-600 transition-all shadow-lg shadow-amber-200 disabled:opacity-50"
                        >
                            {isActionLoading ? 'Resetting...' : 'Submit Reset'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
