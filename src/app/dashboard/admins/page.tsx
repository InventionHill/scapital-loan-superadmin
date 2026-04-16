'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Plus, User, Mail, Building, Shield, Edit2, Trash2, Key, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

interface Admin {
    id: string;
    name: string;
    email: string;
    branchName: string;
    role: 'ADMIN' | 'SUPER_ADMIN';
}

const mockAdmins: Admin[] = [
    { id: '1', name: 'Super Admin', email: 'superadmin@scapital.com', branchName: 'Main', role: 'SUPER_ADMIN' },
    { id: '2', name: 'Scapital Admin', email: 'admin@scapital.com', branchName: 'Scapital', role: 'ADMIN' },
    { id: '3', name: 'MoneyLoan Admin', email: 'admin@moneyloan.com', branchName: 'MoneyLoan', role: 'ADMIN' },
];

export default function AdminsPage() {
    const [admins, setAdmins] = useState<Admin[]>(mockAdmins);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        branchName: 'Scapital'
    });

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Mock API call
        setTimeout(() => {
            const newAdmin: Admin = {
                id: Math.random().toString(36).substr(2, 9),
                name: formData.name,
                email: formData.email,
                branchName: formData.branchName,
                role: 'ADMIN'
            };
            setAdmins([...admins, newAdmin]);
            setIsLoading(false);
            setIsAddModalOpen(false);
            setFormData({ name: '', email: '', password: '', branchName: 'Scapital' });
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admins Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage admin users and their branch assignments</p>
                </div>
                <Button 
                    className="flex items-center gap-2"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <Plus size={18} />
                    Add New Admin
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-gray-50/50">
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Admin User</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Branch Name</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {admin.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{admin.name}</div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Mail size={12} />
                                                        {admin.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <Building size={14} className="text-gray-400" />
                                                {admin.branchName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                admin.role === 'SUPER_ADMIN' 
                                                ? 'bg-purple-100 text-purple-800' 
                                                : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                <Shield size={12} />
                                                {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-md">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors hover:bg-red-50 rounded-md">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Admin"
            >
                <form onSubmit={handleAddAdmin} className="space-y-4 pt-4">
                    <Input
                        label="Full Name"
                        placeholder="e.g. John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        leftIcon={<User size={18} className="text-gray-400" />}
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="admin@scapital.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        leftIcon={<Mail size={18} className="text-gray-400" />}
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        leftIcon={<Key size={18} className="text-gray-400" />}
                    />
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Branch Assignment</label>
                        <div className="relative">
                            <select
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                                value={formData.branchName}
                                onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                            >
                                <option value="Scapital">Scapital</option>
                                <option value="MoneyLoan">MoneyLoan</option>
                            </select>
                            <Building size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => setIsAddModalOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            isLoading={isLoading}
                        >
                            Create Admin
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
