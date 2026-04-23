'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { adminService } from '@/services/adminService';
import { Branch, branchService } from '@/services/branchService';
import { Lead, leadService } from '@/services/leadService';
import { LoanType, loanTypeService } from '@/services/loanTypeService';
import { formatPhoneNumber } from '@/utils/phoneFormat';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import {
    Building,
    Calendar, Check,
    Download, Edit2, Eye,
    FileText, Info, Phone,
    Search, Trash2, Clock, User, UserPlus, X, ChevronDown, Activity, Calendar as CalendarIcon,
    Plus, Briefcase, ShieldCheck
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

const STATUS_TABS = [
    { id: 'all', label: 'All Leads' },
    { id: 'NEW', label: 'New' },
    { id: 'FOLLOW_UP', label: 'Follow Up' },
    { id: 'COMPLETED', label: 'Call Connected' },
    { id: 'NOT_INTERESTED', label: 'Not Interested' },
    { id: 'NO_ANSWER', label: 'No Answer' },
    { id: 'CLOSED', label: 'Closed' },
    { id: 'INVALID_WRONG', label: 'Invalid/Wrong' },
    { id: 'INTERESTED', label: 'Interested' },
    { id: 'RECALL', label: 'Recall' },
    { id: 'LOGIN', label: 'Login' },
    { id: 'SANCTIONED', label: 'Sanctioned' },
    { id: 'DISBURSEMENT', label: 'Disbursement' },
    { id: 'REJECT', label: 'Reject' },
    { id: 'DORMANT', label: 'Dormant' },
];

export default function AllLeadsPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [leadsLoading, setLeadsLoading] = useState(false);
    const [activeStatusTab, setActiveStatusTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Modals
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [followUpDate, setFollowUpDate] = useState('');
    const [followUpPreset, setFollowUpPreset] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [openAssignmentId, setOpenAssignmentId] = useState<string | null>(null);
    const [agentSearchQuery, setAgentSearchQuery] = useState('');

    // Edit Modal State
    const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
    const [mobileUsers, setMobileUsers] = useState<any[]>([]);
    const [newStatus, setNewStatus] = useState('');
    const [notes, setNotes] = useState('');
    const [statusRemark, setStatusRemark] = useState('');
    const [reminderDate, setReminderDate] = useState('');
    const [reminderTime, setReminderTime] = useState('');
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editAssignedToId, setEditAssignedToId] = useState('');
    const [editLoanTypeId, setEditLoanTypeId] = useState('');
    const [editLoanType, setEditLoanType] = useState('Other');
    const [editCustomLoanType, setEditCustomLoanType] = useState('');
    const [editProfile, setEditProfile] = useState('');
    const [editCibilStatus, setEditCibilStatus] = useState('');
    const [editCibilRemark, setEditCibilRemark] = useState('');

    const [isSaving, setIsSaving] = useState(false);

    // Create Lead Modal State
    const [isCreateLeadModalOpen, setIsCreateLeadModalOpen] = useState(false);
    const [createLeadPhone, setCreateLeadPhone] = useState('');
    const [createLeadName, setCreateLeadName] = useState('');
    const [createLeadDate, setCreateLeadDate] = useState('');
    const [createLeadTime, setCreateLeadTime] = useState('');
    const [createLoanTypeId, setCreateLoanTypeId] = useState('');
    const [createLoanType, setCreateLoanType] = useState('Other');
    const [createCustomLoanType, setCreateCustomLoanType] = useState('');
    const [createAssignedToId, setCreateAssignedToId] = useState('');
    const [isCreatingLead, setIsCreatingLead] = useState(false);

    const [applicationFormData, setApplicationFormData] = useState<any>(null);
    const [isSavingForm, setIsSavingForm] = useState(false);
    const [isLoadingForm, setIsLoadingForm] = useState(false);
    const [isViewLoading, setIsViewLoading] = useState(false);

    const fetchBranches = async () => {
        try {
            const data = await branchService.getAllBranches();
            setBranches(data);
            if (data.length > 0 && !selectedBranchId) {
                setSelectedBranchId(data[0].id);
            }
        } catch (error) {
            toast.error('Failed to load branches');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLeads = useCallback(async () => {
        if (!selectedBranchId) return;
        setLeadsLoading(true);
        try {
            const data = await leadService.getLeads({
                branchId: selectedBranchId,
                status: activeStatusTab === 'all' ? undefined : activeStatusTab,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            });
            setLeads(data);
        } catch (error) {
            toast.error('Failed to load leads');
        } finally {
            setLeadsLoading(false);
        }
    }, [selectedBranchId, activeStatusTab, startDate, endDate]);

    const fetchDropdownData = async () => {
        try {
            const types = await loanTypeService.getLoanTypes();
            setLoanTypes(types);
        } catch (error) {
            console.error('Failed to fetch loan types');
        }
    };

    const fetchBranchMobileUsers = async () => {
        if (!selectedBranchId) return;
        try {
            const admins = await adminService.getAllAdmins();
            const branchAdmin = admins.find((a: any) => a.branchId === selectedBranchId);
            if (branchAdmin) {
                const response = await adminService.getAdminMobileUsers(branchAdmin.id);
                // Extract mobileUsers array from the response object
                setMobileUsers(response.mobileUsers || []);
            } else {
                setMobileUsers([]);
            }
        } catch (error) {
            console.error('Failed to fetch mobile users');
        }
    };

    useEffect(() => {
        fetchBranches();
        fetchDropdownData();
    }, []);

    useEffect(() => {
        fetchLeads();
        fetchBranchMobileUsers();
    }, [fetchLeads, selectedBranchId]);

    const handleViewLead = async (lead: Lead) => {
        setSelectedLead(lead);
        setIsViewModalOpen(true);
        setIsViewLoading(true);
        try {
            const data = await leadService.getLead(lead.id);
            setSelectedLead({ ...data.lead, callLogs: data.calllogs });
        } catch (error) {
            console.error('Failed to fetch lead details:', error);
            toast.error('Failed to load lead history');
        } finally {
            setIsViewLoading(false);
        }
    };

    const handleOpenForm = async (lead: Lead) => {
        setSelectedLead(lead);
        setIsFormModalOpen(true);
        setIsLoadingForm(true);
        try {
            const data = await leadService.getApplicationForm(lead.id);
            setApplicationFormData(data);
        } catch (error) {
            toast.error('Failed to load application form');
            setIsFormModalOpen(false);
        } finally {
            setIsLoadingForm(false);
        }
    };

    const handleSaveForm = async () => {
        if (!selectedLead || !applicationFormData) return;
        setIsSavingForm(true);
        try {
            await leadService.saveApplicationForm(selectedLead.id, applicationFormData);
            toast.success('Application form saved successfully');
            setIsFormModalOpen(false);
        } catch (error) {
            toast.error('Failed to save application form');
        } finally {
            setIsSavingForm(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (!selectedLead) return;
        try {
            const blob = await leadService.downloadApplicationPdf(selectedLead.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `application_form_${selectedLead.leadId || (selectedLead.branchSerialId ? `LD-${String(selectedLead.branchSerialId).padStart(5, '0')}` : `LD-${String(selectedLead.serialId).padStart(5, '0')}`)}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Failed to download PDF');
        }
    };

    const filteredLeads = leads.filter(l =>
        l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phoneNumber.includes(searchTerm) ||
        l.leadId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openStatusModal = (lead: Lead) => {
        setSelectedLead(lead);
        setNewStatus(lead.status);
        setEditName(lead.name || '');
        setEditPhone(formatPhoneNumber(lead.phoneNumber));
        setEditAssignedToId(lead.assignedToId || '');
        setEditLoanTypeId(lead.loanTypeId || '');
        setEditLoanType(lead.loanType || 'Other');
        setEditProfile(lead.profile || '');
        setEditCibilStatus(lead.cibilStatus || '');
        setEditCibilRemark(lead.cibilRemark || '');
        setStatusRemark(lead.statusRemark || '');
        setEditCustomLoanType(lead.customLoanType || '');

        if (lead.nextFollowUpAt) {
            setFollowUpDate(format(new Date(lead.nextFollowUpAt), "yyyy-MM-dd'T'HH:mm"));
        } else {
            setFollowUpDate('');
        }
        setIsStatusModalOpen(true);
    };

    const handleUpdateStatus = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLead) return;

        setIsSaving(true);
        try {
            let nextFollowUpAt = null;
            if (newStatus === 'FOLLOW_UP' && followUpDate) {
                nextFollowUpAt = new Date(followUpDate).toISOString();
            }

            const updateData = {
                status: newStatus,
                notes: notes,
                nextFollowUpAt,
                statusRemark,
                name: editName,
                assignedToId: editAssignedToId,
                loanTypeId: editLoanTypeId,
                loanType: editLoanType,
                customLoanType: editLoanType === 'Other' ? editCustomLoanType : null,
                profile: editProfile,
                cibilStatus: editCibilStatus,
                cibilRemark: editCibilRemark
            };

            await leadService.updateStatus(selectedLead.id, updateData);
            toast.success('Lead updated successfully');
            setIsStatusModalOpen(false);
            setNotes('');
            fetchLeads();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update lead');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAssignLead = async (leadId: string, userId: string) => {
        try {
            // Use the userId directly; the backend handles 'unassigned' as null
            await leadService.assignLead(leadId, userId);
            toast.success('Lead reassigned successfully');
            fetchLeads();
        } catch (error) {
            toast.error('Failed to reassign lead');
        }
    };

    const handleDeleteLead = async () => {
        if (!selectedLead) return;
        setIsSaving(true);
        try {
            await leadService.deleteLead(selectedLead.id);
            toast.success('Lead deleted successfully');
            setIsDeleteModalOpen(false);
            fetchLeads();
        } catch (error) {
            toast.error('Failed to delete lead');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownloadExcel = () => {
        if (filteredLeads.length === 0) {
            toast.error('No leads to export');
            return;
        }

        const dataToExport = filteredLeads.map(lead => {
            const branchName = branches.find(b => b.id === lead.branchId)?.name || 'N/A';
            return {
                'Lead Identifier': lead.leadId || (lead.branchSerialId ? `LD-${String(lead.branchSerialId).padStart(5, '0')}` : `LD-${String(lead.serialId).padStart(5, '0')}`),
                'Customer Name': lead.name || 'Anonymous Lead',
                'Phone Number': lead.phoneNumber,
                'Current Status': lead.status === 'COMPLETED' ? 'Call Connected' : lead.status.replace(/_/g, ' '),
                'Form Status': lead.applicationForm ? 'Submitted' : 'Pending',
                'Assigned Agent': lead.assignedTo?.name || 'Unassigned',
                'Loan Type': lead.loanType === 'Other' ? (lead.customLoanType || 'Other') : (lead.loanType || 'Personal Loan'),
                'Branch Name': branchName,
                'Created Date': format(new Date(lead.createdAt), 'MMM d, yyyy'),
                'Created Time': format(new Date(lead.createdAt), 'hh:mm a'),
                'Last Activity': lead.lastCallAt ? format(new Date(lead.lastCallAt), 'MMM d, yyyy HH:mm') : 'N/A'
            };
        });

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Leads Export');
        XLSX.writeFile(wb, `leads_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    };

    const openCreateLeadModal = () => {
        const now = new Date();
        setCreateLeadPhone('');
        setCreateLeadName('');
        setCreateLeadDate(now.toISOString().split('T')[0]);
        setCreateLeadTime(now.toTimeString().slice(0, 5));
        setCreateLoanTypeId('');
        setCreateLoanType('Other');
        setCreateCustomLoanType('');
        setCreateAssignedToId('');
        setIsCreateLeadModalOpen(true);
    };

    const handleCreateLead = async () => {
        if (!selectedBranchId) return;
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(createLeadPhone)) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }
        try {
            setIsCreatingLead(true);
            await leadService.createManual({
                phoneNumber: createLeadPhone,
                name: createLeadName || undefined,
                date: createLeadDate || undefined,
                time: createLeadTime || undefined,
                loanType: createLoanType,
                customLoanType: createLoanType === 'Other' ? createCustomLoanType : undefined,
                loanTypeId: createLoanTypeId === 'unassigned' || createLoanTypeId === '' ? undefined : createLoanTypeId,
                assignedToId: createAssignedToId === 'unassigned' || createAssignedToId === '' ? undefined : createAssignedToId,
                branchId: selectedBranchId
            } as any);
            toast.success('Lead created successfully!');
            setIsCreateLeadModalOpen(false);
            fetchLeads();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to create lead';
            toast.error(typeof msg === 'string' ? msg : 'Failed to create lead');
        } finally {
            setIsCreatingLead(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="mb-2">
                        <Breadcrumbs />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-[#111827]">All Leads Management</h1>
                    <p className="text-sm font-semibold text-slate-400">Centrally monitor and manage leads across all branches and agents.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={openCreateLeadModal}
                        className="flex items-center gap-2.5 px-6 py-3.5 bg-[#00a878] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#00a878] transition-all shadow-xl shadow-[#00a878]/10 active:scale-95 group"
                    >
                        <Plus size={16} className="text-white group-hover:text-white transition-colors" />
                        <span>Create Lead</span>
                    </button>
                    <button
                        onClick={handleDownloadExcel}
                        className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-100 shadow-xl shadow-slate-200/50 group"
                    >
                        <Download size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
                        <span>Export Data</span>
                    </button>
                </div>
            </div>

            {/* Branch Selection Dropdown */}
            <div className="w-full md:w-80">
                <Select
                    label="Active Branch"
                    value={selectedBranchId}
                    onChange={setSelectedBranchId}
                    options={branches.map(b => ({ id: b.id, label: b.name.toUpperCase(), value: b.id }))}
                    placeholder="Select Branch"
                />
            </div>

            {/* Content Card */}
            <Card className="rounded-[1rem] border border-slate-100 bg-white overflow-hidden shadow-2xl shadow-slate-200/50">
                <CardContent className="p-0">
                    {/* Status Tabs & Filters */}
                    <div className="border-b border-slate-50 bg-white">
                        <div className="p-8 space-y-6">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                {/* Status Filter Dropdown */}
                                <div className="w-full md:w-72">
                                    <Select
                                        label="Filter by Status"
                                        value={activeStatusTab}
                                        onChange={setActiveStatusTab}
                                        options={STATUS_TABS.map(t => ({ id: t.id, label: t.label.toUpperCase(), value: t.id }))}
                                    />
                                </div>

                                {/* Filters */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="relative group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search Leads..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-11 pr-6 py-3.5 rounded-2xl bg-white border border-slate-100 text-sm font-bold text-slate-600 placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 w-full md:w-72 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 bg-white px-4 py-3.5 rounded-2xl border border-slate-100 shadow-sm">
                                        <Calendar size={16} className="text-slate-400" />
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="bg-transparent border-none p-0 text-[11px] font-black uppercase text-slate-600 focus:ring-0 cursor-pointer"
                                        />
                                        <span className="text-slate-300 px-1">—</span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="bg-transparent border-none p-0 text-[11px] font-black uppercase text-slate-600 focus:ring-0 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Area */}
                    <div className="overflow-x-auto min-h-[500px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Lead Identifier</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Details</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Current Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned To</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Branch</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Loan Type</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {leadsLoading ? (
                                    <tr>
                                        <td colSpan={7} className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent shadow-lg shadow-primary/20" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Leads...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4 opacity-40">
                                                <div className="h-20 w-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
                                                    <FileText size={40} strokeWidth={1.5} />
                                                </div>
                                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">No leads match your criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLeads.map(lead => (
                                        <tr key={lead.id} className="hover:bg-[#fafcfc] transition-all group">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-primary uppercase tracking-widest">
                                                        {lead.leadId || (lead.branchSerialId ? `LD-${String(lead.branchSerialId).padStart(5, '0')}` : `LD-${String(lead.serialId).padStart(5, '0')}`)}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 mt-1">
                                                        {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-extrabold text-slate-700">{lead.name || 'Anonymous Lead'}</span>
                                                    <span className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1.5">
                                                        <Phone size={10} className="text-slate-300" />
                                                        {formatPhoneNumber(lead.phoneNumber)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={clsx(
                                                    "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap inline-flex items-center gap-1.5",
                                                    lead.status === 'NEW' ? 'bg-emerald-50 text-emerald-600' :
                                                        lead.status === 'COMPLETED' ? 'bg-indigo-50 text-indigo-600' :
                                                            lead.status === 'FOLLOW_UP' ? 'bg-blue-50 text-blue-600' :
                                                                lead.status === 'CLOSED' ? 'bg-slate-900 text-white' :
                                                                    'bg-slate-100 text-slate-500'
                                                )}>
                                                    <div className={clsx("h-1.5 w-1.5 rounded-full animate-pulse",
                                                        lead.status === 'NEW' ? 'bg-emerald-600' :
                                                            lead.status === 'COMPLETED' ? 'bg-indigo-600' :
                                                                'bg-current'
                                                    )} />
                                                    {lead.status === 'COMPLETED' ? 'Call Connected' : lead.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 relative">
                                                <div className="relative">
                                                    <button
                                                        onClick={() => {
                                                            setOpenAssignmentId(openAssignmentId === lead.id ? null : lead.id);
                                                            setAgentSearchQuery('');
                                                        }}
                                                        className={clsx(
                                                            "w-48 flex items-center justify-between px-4 py-2.5 rounded-[1.1rem] border transition-all duration-200",
                                                            openAssignmentId === lead.id
                                                                ? "bg-white border-primary shadow-lg shadow-primary/5 ring-4 ring-primary/5"
                                                                : "bg-slate-50 border-slate-100 hover:border-slate-200"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                                            <div className={clsx(
                                                                "h-2 w-2 rounded-full shrink-0",
                                                                lead.assignedTo ? "bg-primary" : "bg-slate-300"
                                                            )} />
                                                            <span className={clsx(
                                                                "text-[11px] font-bold truncate",
                                                                lead.assignedTo ? "text-slate-700" : "text-slate-400"
                                                            )}>
                                                                {lead.assignedTo?.name || 'Unassigned'}
                                                            </span>
                                                        </div>
                                                        <ChevronDown size={14} className={clsx("text-slate-400 transition-transform duration-200", openAssignmentId === lead.id && "rotate-180")} />
                                                    </button>

                                                    {openAssignmentId === lead.id && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-20"
                                                                onClick={() => setOpenAssignmentId(null)}
                                                            />
                                                            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 z-30 p-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
                                                                {/* Header */}
                                                                <div className="px-4 py-3 border-b border-slate-50 flex items-center gap-2.5">
                                                                    <UserPlus size={14} className="text-primary" />
                                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Agent</span>
                                                                </div>

                                                                {/* Search */}
                                                                <div className="p-2">
                                                                    <div className="relative group">
                                                                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={14} />
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Search agents..."
                                                                            value={agentSearchQuery}
                                                                            onChange={(e) => setAgentSearchQuery(e.target.value)}
                                                                            className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-100 rounded-[1.2rem] text-xs font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-300"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Options List */}
                                                                <div className="max-h-64 overflow-y-auto custom-scrollbar px-1 py-1 space-y-1">
                                                                    {/* Unassigned Option */}
                                                                    <button
                                                                        onClick={() => {
                                                                            handleAssignLead(lead.id, 'unassigned');
                                                                            setOpenAssignmentId(null);
                                                                        }}
                                                                        className={clsx(
                                                                            "w-full flex items-center justify-between px-4 py-3.5 rounded-[1.2rem] transition-all group",
                                                                            !lead.assignedToId
                                                                                ? "bg-primary/5 text-primary"
                                                                                : "hover:bg-slate-50 text-slate-500"
                                                                        )}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={clsx(
                                                                                "h-2 w-2 rounded-full ring-2 ring-offset-2",
                                                                                !lead.assignedToId ? "bg-primary ring-primary/20" : "bg-slate-200 ring-transparent"
                                                                            )} />
                                                                            <span className="text-xs font-black uppercase tracking-wider">Unassigned</span>
                                                                        </div>
                                                                        {!lead.assignedToId && (
                                                                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                                                                <Check size={12} className="text-white" strokeWidth={3} />
                                                                            </div>
                                                                        )}
                                                                    </button>

                                                                    {/* Agents */}
                                                                    {(Array.isArray(mobileUsers) ? mobileUsers : [])
                                                                        .filter(u =>
                                                                            (u.name || u.username || '').toLowerCase().includes(agentSearchQuery.toLowerCase())
                                                                        )
                                                                        .map(user => {
                                                                            const isSelected = lead.assignedToId === user.id;
                                                                            return (
                                                                                <button
                                                                                    key={user.id}
                                                                                    onClick={() => {
                                                                                        handleAssignLead(lead.id, user.id);
                                                                                        setOpenAssignmentId(null);
                                                                                    }}
                                                                                    className={clsx(
                                                                                        "w-full flex items-center justify-between px-4 py-3.5 rounded-[1.2rem] transition-all group",
                                                                                        isSelected
                                                                                            ? "bg-primary/5 text-primary"
                                                                                            : "hover:bg-slate-50 text-slate-500"
                                                                                    )}
                                                                                >
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className={clsx(
                                                                                            "h-2 w-2 rounded-full ring-2 ring-offset-2 transition-all",
                                                                                            isSelected ? "bg-primary ring-primary/20" : "bg-slate-200 ring-transparent group-hover:ring-slate-100"
                                                                                        )} />
                                                                                        <span className="text-xs font-bold truncate">{(user.name || user.username)}</span>
                                                                                    </div>
                                                                                    {isSelected && (
                                                                                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                                                                                            <Check size={12} className="text-white" strokeWidth={3} />
                                                                                        </div>
                                                                                    )}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                                    {branches.find(b => b.id === lead.branchId)?.name || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 rounded-md bg-slate-50 text-slate-400">
                                                        <Info size={12} />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-500">{lead.loanType}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-2 transition-all duration-300">
                                                    <button
                                                        onClick={() => handleViewLead(lead)}
                                                        className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors shadow-sm border border-blue-100/50"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} strokeWidth={2.5} />
                                                    </button>
                                                    <button
                                                        onClick={() => openStatusModal(lead)}
                                                        className="p-2.5 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shadow-sm border border-indigo-100/50"
                                                        title="Edit Status/Details"
                                                    >
                                                        <Edit2 size={16} strokeWidth={2.5} />
                                                    </button>
                                                    {lead.applicationForm && (
                                                        <button
                                                            onClick={() => handleOpenForm(lead)}
                                                            className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors shadow-sm border border-emerald-100/50"
                                                            title="Application Form"
                                                        >
                                                            <FileText size={16} strokeWidth={2.5} />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => {
                                                            setSelectedLead(lead);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        className="p-2.5 text-red-600 hover:bg-red-50/100 rounded-xl transition-colors shadow-sm border border-red-100/50"
                                                        title="Delete Lead"
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
                </CardContent>
            </Card>

            {/* Status & Edit Modal */}
            <Modal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                size="2xl"
                title={
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50">
                            <Edit2 size={22} strokeWidth={2.5} />
                        </div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Edit Lead:</h3>
                            <span className="text-xl font-black text-emerald-600 uppercase tracking-tight">{selectedLead?.leadId}</span>
                        </div>
                    </div>
                }
                footer={
                    <div className="flex items-center justify-end gap-8 w-full py-2">
                        <button
                            type="button"
                            onClick={() => setIsStatusModalOpen(false)}
                            className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                        >
                            Discard
                        </button>
                        <button
                            type="button"
                            onClick={handleUpdateStatus}
                            disabled={isSaving}
                            className="px-12 py-4 rounded-full bg-[#00a878] text-white font-black uppercase tracking-widest text-xs hover:bg-[#008f66] transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                }
            >
                <div className="space-y-8 py-4 px-1">
                    {/* Grid for main fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Lead Name */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Lead Name</label>
                            <input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                                placeholder="Enter lead name"
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Phone Number</label>
                            <input
                                value={editPhone}
                                disabled
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 opacity-70 cursor-not-allowed"
                            />
                        </div>

                        {/* Outcome Status */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Outcome Status</label>
                            <Select
                                value={newStatus}
                                onChange={setNewStatus}
                                options={STATUS_TABS.filter(t => t.id !== 'all').map(t => ({ id: t.id, label: t.label.toUpperCase(), value: t.id }))}
                                className="w-full"
                            />
                        </div>

                        {/* Assigned Agent */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Assigned Agent</label>
                            <Select
                                value={editAssignedToId}
                                onChange={setEditAssignedToId}
                                options={[
                                    { id: 'unassigned', label: 'UNASSIGNED', value: '' },
                                    ...(Array.isArray(mobileUsers) ? mobileUsers : []).map(u => ({ id: u.id, label: (u.name || u.username).toUpperCase(), value: u.id }))
                                ]}
                                className="w-full"
                            />
                        </div>

                        {/* Loan Type */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Loan Type</label>
                            <Select
                                value={editLoanTypeId}
                                onChange={setEditLoanTypeId}
                                options={[
                                    { id: 'none', label: 'SELECT LOAN TYPE', value: '' },
                                    ...(Array.isArray(loanTypes) ? loanTypes : []).map(t => ({ id: t.id, label: t.name.toUpperCase(), value: t.id }))
                                ]}
                                className="w-full"
                            />
                        </div>

                        {/* Profile */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Profile</label>
                            <Select
                                value={editProfile}
                                onChange={setEditProfile}
                                options={[
                                    { id: 'none', label: 'SELECT OPTION', value: '' },
                                    { id: 'SALARIED', label: 'SALARIED', value: 'SALARIED' },
                                    { id: 'SELF_EMPLOYED', label: 'SELF EMPLOYED', value: 'SELF_EMPLOYED' }
                                ]}
                                className="w-full"
                            />
                        </div>

                        {/* CIBIL Status */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">CIBIL Status</label>
                            <Select
                                value={editCibilStatus}
                                onChange={setEditCibilStatus}
                                options={[
                                    { id: 'none', label: 'SELECT STATUS', value: '' },
                                    { id: 'ISSUED', label: 'ISSUED', value: 'ISSUED' },
                                    { id: 'NOT_ISSUED', label: 'NOT ISSUED', value: 'NOT_ISSUED' }
                                ]}
                                className="w-full"
                            />
                        </div>

                        {/* CIBIL Issue Remark */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Cibil Issue Remark</label>
                            <input
                                value={editCibilRemark}
                                onChange={(e) => setEditCibilRemark(e.target.value)}
                                className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                                placeholder="Explain the status..."
                            />
                        </div>
                    </div>

                    {/* Conditional Status Details Sections */}
                    <div className="space-y-6">
                        {/* Follow-up Section */}
                        {newStatus === 'FOLLOW_UP' && (
                            <div className="p-6 bg-emerald-50/50 rounded-[2rem] border border-emerald-100/50 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="h-6 w-1 bg-emerald-500 rounded-full" />
                                    <h4 className="text-[11px] font-black text-emerald-700 uppercase tracking-widest">Follow-up Details</h4>
                                </div>

                                <div className="flex flex-wrap gap-2.5 mb-6">
                                    {[
                                        { label: '+1 HOUR', value: '1hour' },
                                        { label: 'TOMORROW 10AM', value: 'tomorrow' },
                                        { label: 'LATER TODAY', value: 'latertoday' }
                                    ].map((preset) => (
                                        <button
                                            key={preset.value}
                                            type="button"
                                            onClick={() => {
                                                const now = new Date();
                                                let d = new Date();
                                                if (preset.value === '1hour') d.setHours(d.getHours() + 1);
                                                else if (preset.value === 'tomorrow') { d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0); }
                                                else if (preset.value === 'latertoday') {
                                                    if (now.getHours() >= 16) d.setHours(now.getHours() + 2);
                                                    else d.setHours(18, 0, 0, 0);
                                                }
                                                setFollowUpDate(format(d, "yyyy-MM-dd'T'HH:mm"));
                                            }}
                                            className="px-4 py-2 bg-white border border-emerald-200 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="relative group">
                                    <input
                                        type="datetime-local"
                                        value={followUpDate}
                                        onChange={(e) => setFollowUpDate(e.target.value)}
                                        className="w-full h-14 px-5 bg-white border border-emerald-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all cursor-pointer"
                                    />
                                    <CalendarIcon className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-600 pointer-events-none group-focus-within:scale-110 transition-transform" />
                                </div>
                            </div>
                        )}

                        {/* Reject Section */}
                        {newStatus === 'REJECT' && (
                            <div className="p-6 bg-rose-50/50 rounded-[2rem] border border-rose-100/50 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="h-6 w-1 bg-rose-500 rounded-full" />
                                    <h4 className="text-[11px] font-black text-rose-700 uppercase tracking-widest">Reject Details</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Reminder Date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={followUpDate ? followUpDate.split('T')[0] : ''}
                                                onChange={(e) => {
                                                    const time = followUpDate?.includes('T') ? followUpDate.split('T')[1] : '10:00';
                                                    setFollowUpDate(`${e.target.value}T${time}`);
                                                }}
                                                className="w-full h-14 px-5 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all"
                                            />
                                            <CalendarIcon className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Reminder Time</label>
                                        <div className="relative">
                                            <input
                                                type="time"
                                                value={followUpDate?.includes('T') ? followUpDate.split('T')[1] : ''}
                                                onChange={(e) => {
                                                    const date = followUpDate?.includes('T') ? followUpDate.split('T')[0] : format(new Date(), 'yyyy-MM-dd');
                                                    setFollowUpDate(`${date}T${e.target.value}`);
                                                }}
                                                className="w-full h-14 px-5 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all"
                                            />
                                            <Clock className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Reject Remarks</label>
                                    <textarea
                                        value={statusRemark}
                                        onChange={(e) => setStatusRemark(e.target.value)}
                                        className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all min-h-[100px] resize-none"
                                        placeholder="Enter rejection reason..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Dormant Section */}
                        {newStatus === 'DORMANT' && (
                            <div className="p-6 bg-amber-50/50 rounded-[2rem] border border-amber-100/50 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="h-6 w-1 bg-amber-500 rounded-full" />
                                    <h4 className="text-[11px] font-black text-amber-700 uppercase tracking-widest">Dormant Details</h4>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Dormant Reason</label>
                                    <textarea
                                        value={statusRemark}
                                        onChange={(e) => setStatusRemark(e.target.value)}
                                        className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all min-h-[100px] resize-none"
                                        placeholder="Enter dormant reason..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Interaction Notes */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Interaction Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full px-5 py-4 bg-white border border-slate-100 rounded-[1.5rem] text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all min-h-[120px] resize-none"
                            placeholder="Add details about the conversation..."
                        />
                    </div>

                    {/* Hidden Technical Remark if needed, otherwise omit as per image */}
                    {statusRemark && (
                        <div className="space-y-2 opacity-50 grayscale scale-95 origin-left">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Existing Remark (Internal)</label>
                            <p className="px-5 py-3 bg-slate-50 rounded-xl text-xs font-medium text-slate-600">{statusRemark}</p>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteLead}
                title="Delete Lead Permanently?"
                message={`Are you sure you want to delete lead ${selectedLead?.leadId}? This action cannot be undone and will remove all associated call history.`}
                confirmLabel="Confirm Deletion"
                variant="danger"
                isLoading={isSaving}
            />

            {/* View Modal (History & Activity) */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Lead History & Activity"
                size="3xl"
            >
                {selectedLead && (
                    <div className="space-y-8 py-4">
                        {/* Lead Quick Summary Card */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 gap-x-8 relative z-10">
                                {/* Customer Name */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <User size={14} className="text-slate-300" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Customer Name</span>
                                    </div>
                                    <p className="text-xl font-black text-slate-900 pl-6 tracking-tight">{selectedLead.name || '---'}</p>
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Phone size={14} className="text-slate-300" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Phone Number</span>
                                    </div>
                                    <p className="text-xl font-black text-slate-900 pl-6 tracking-tight">{selectedLead.phoneNumber || '---'}</p>
                                </div>

                                {/* Lead Identity */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Info size={14} className="text-slate-300" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Lead Identity</span>
                                    </div>
                                    <div className="pl-6 space-y-1">
                                        <p className="text-xl font-black text-primary tracking-tight">
                                            {selectedLead.leadId || (selectedLead.branchSerialId ? `LD-${String(selectedLead.branchSerialId).padStart(5, '0')}` : `LD-${String(selectedLead.serialId).padStart(5, '0')}`)}
                                        </p>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Serial #{selectedLead.serialId || '---'}</p>
                                    </div>
                                </div>

                                {/* Current Status */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Activity size={14} className="text-slate-300" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Current Status</span>
                                    </div>
                                    <div className="pl-6">
                                        <span className={clsx(
                                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-block shadow-sm",
                                            selectedLead.status === 'NEW' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                selectedLead.status === 'FOLLOW_UP' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                    selectedLead.status === 'CLOSED' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                        'bg-slate-50 text-slate-500 border border-slate-200'
                                        )}>
                                            {selectedLead.status?.replace(/_/g, ' ') || '---'}
                                        </span>
                                    </div>
                                </div>

                                {/* Loan Product */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Briefcase size={14} className="text-slate-300" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Loan Product</span>
                                    </div>
                                    <p className="text-xl font-black text-slate-700 pl-6 tracking-tight">{selectedLead.loanType || '---'}</p>
                                </div>

                                {/* Agent & Profile */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <ShieldCheck size={14} className="text-slate-300" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Agent & Profile</span>
                                    </div>
                                    <div className="pl-6 space-y-1.5">
                                        <p className="text-xl font-black text-slate-900 tracking-tight leading-none">{selectedLead.assignedTo?.name || 'Unassigned'}</p>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedLead.profile || 'No Profile'}</p>
                                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">CIBIL: {selectedLead.cibilStatus || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interaction Timeline */}
                        <div className="space-y-8 pt-4">
                            <div className="flex items-center gap-4 px-2">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-[#00a878] flex items-center justify-center shadow-sm border border-emerald-100/50">
                                    <Activity size={22} strokeWidth={2.5} />
                                </div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Interaction Timeline</h4>
                            </div>

                            {isViewLoading ? (
                                <div className="py-24 text-center">
                                    <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-primary border-t-transparent mx-auto mb-6" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Decoding History Logs...</span>
                                </div>
                            ) : !selectedLead.callLogs || selectedLead.callLogs.length === 0 ? (
                                <div className="py-24 text-center text-slate-300 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                                    <Clock size={56} className="mx-auto mb-6 opacity-10" />
                                    <p className="text-[11px] font-black uppercase tracking-[0.3em]">No interaction frequency detected</p>
                                </div>
                            ) : (
                                <div className="space-y-8 relative before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 px-2">
                                    {selectedLead.callLogs.map((log) => (
                                        <div key={log.id} className="relative pl-14">
                                            <div className="absolute left-0 top-1 h-11 w-11 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 shadow-sm z-10 transition-transform group-hover:scale-110">
                                                {log.callType === 'INCOMING' ? <Phone size={16} strokeWidth={3} /> : <Activity size={16} strokeWidth={3} />}
                                            </div>
                                            <div className="bg-white p-7 rounded-[2rem] border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
                                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{log.callType} CALL</span>
                                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                                                        <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-100">
                                                            {log.outcome || 'PENDING'}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2.5 text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                                                        <Calendar size={13} className="text-slate-300" />
                                                        <span className="text-[10px] font-bold text-slate-500 tracking-tight">{format(new Date(log.createdAt), 'MMM d, yyyy • hh:mm a')}</span>
                                                    </div>
                                                </div>

                                                {/* Conditional Rendering for Notes/Remarks/Reminders */}
                                                <div className="space-y-3">
                                                    {log.notes && (
                                                        <div className="relative p-5 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                                                            <span className="block text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">Interaction Notes:</span>
                                                            <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                                                                "{log.notes}"
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Displaying additional metadata only if they exist */}
                                                    {log.duration && (
                                                        <div className="flex justify-end mt-4 pt-4 border-t border-slate-50">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                <Clock size={10} />
                                                                Session: {Math.floor(log.duration / 60)}m {log.duration % 60}s
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>


                    </div>
                )}
            </Modal>

            {/* Application Form Modal */}
            <Modal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                size="5xl"
                title={
                    <div className="flex items-center justify-between w-full pr-8">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Complete Application Form</h3>
                                <span className="text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-widest leading-none">Lead ID: {selectedLead?.leadId || (selectedLead?.branchSerialId ? `LD-${String(selectedLead.branchSerialId).padStart(5, '0')}` : `LD-${String(selectedLead?.serialId).padStart(5, '0')}`)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleDownloadPdf}
                                className="hidden md:flex items-center gap-2.5 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 active:scale-95"
                            >
                                <Download className="h-3.5 w-3.5" />
                                <span>Download PDF</span>
                            </button>
                        </div>
                    </div>
                }
                footer={
                    <div className="flex items-center justify-end gap-4 w-full">
                        <button
                            onClick={() => setIsFormModalOpen(false)}
                            className="px-8 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveForm}
                            disabled={isSavingForm}
                            className="flex items-center justify-center gap-2.5 px-10 py-3.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 hover:shadow-emerald-600/20 active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/10 font-black text-[11px] uppercase tracking-widest leading-none disabled:opacity-50"
                        >
                            {isSavingForm ? (
                                <>
                                    <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Check className="h-3.5 w-3.5" />
                                    <span>Save Application</span>
                                </>
                            )}
                        </button>
                    </div>
                }
            >
                {isLoadingForm ? (
                    <div className="py-20 text-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent mx-auto" />
                    </div>
                ) : applicationFormData && (
                    <div className="space-y-12 pb-6 px-4">
                        {/* Section 1: Header & Tracking */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-1.5 bg-emerald-500 rounded-full" />
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Header & Tracking</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50/50 rounded-[1.5rem] border border-slate-100">
                                <div className="space-y-2.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">File Number</label>
                                    <input
                                        type="text"
                                        placeholder="Enter file number..."
                                        value={applicationFormData.fileNumber || ''}
                                        onChange={(e) => setApplicationFormData({ ...applicationFormData, fileNumber: e.target.value })}
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 transition-all"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Company Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter company name..."
                                        value={applicationFormData.companyName || ''}
                                        onChange={(e) => setApplicationFormData({ ...applicationFormData, companyName: e.target.value })}
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 transition-all"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 2: Applicant Details */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-1.5 bg-blue-500 rounded-full" />
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Applicant Details</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={applicationFormData.name || ''}
                                        onChange={(e) => setApplicationFormData({ ...applicationFormData, name: e.target.value })}
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 transition-all"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                                    <input
                                        type="text"
                                        value={applicationFormData.phoneNumber || ''}
                                        onChange={(e) => setApplicationFormData({ ...applicationFormData, phoneNumber: e.target.value })}
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 transition-all"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={applicationFormData.email || ''}
                                        onChange={(e) => setApplicationFormData({ ...applicationFormData, email: e.target.value })}
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 transition-all"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mother's Name</label>
                                    <input
                                        type="text"
                                        value={applicationFormData.motherName || ''}
                                        onChange={(e) => setApplicationFormData({ ...applicationFormData, motherName: e.target.value })}
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 transition-all"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={applicationFormData.dob || ''}
                                        onChange={(e) => setApplicationFormData({ ...applicationFormData, dob: e.target.value })}
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 transition-all"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Addresses */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-1.5 bg-indigo-500 rounded-full" />
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Addresses</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Current Address</label>
                                    <textarea
                                        rows={3}
                                        value={applicationFormData.addresses?.current || ''}
                                        onChange={(e) => setApplicationFormData({
                                            ...applicationFormData,
                                            addresses: { ...applicationFormData.addresses, current: e.target.value }
                                        })}
                                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all resize-none"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Permanent Address</label>
                                    <textarea
                                        rows={3}
                                        value={applicationFormData.addresses?.permanent || ''}
                                        onChange={(e) => setApplicationFormData({
                                            ...applicationFormData,
                                            addresses: { ...applicationFormData.addresses, permanent: e.target.value }
                                        })}
                                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all resize-none"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Office Address</label>
                                    <textarea
                                        rows={3}
                                        value={applicationFormData.addresses?.office || ''}
                                        onChange={(e) => setApplicationFormData({
                                            ...applicationFormData,
                                            addresses: { ...applicationFormData.addresses, office: e.target.value }
                                        })}
                                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all resize-none"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Property Address</label>
                                    <textarea
                                        rows={3}
                                        value={applicationFormData.addresses?.property || ''}
                                        onChange={(e) => setApplicationFormData({
                                            ...applicationFormData,
                                            addresses: { ...applicationFormData.addresses, property: e.target.value }
                                        })}
                                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 4: Financials & Product */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-1.5 bg-amber-500 rounded-full" />
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Financials & Product Info</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-amber-50/10 rounded-[1.5rem] border border-amber-100/50">
                                <div className="space-y-2.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Net Salary (INR)</label>
                                    <input
                                        type="number"
                                        value={applicationFormData.financials?.netSalaryInr || ''}
                                        onChange={(e) => setApplicationFormData({
                                            ...applicationFormData,
                                            financials: { ...applicationFormData.financials, netSalaryInr: Number(e.target.value) }
                                        })}
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Loan Amount (INR)</label>
                                    <input
                                        type="number"
                                        value={applicationFormData.financials?.loanAmountInr || ''}
                                        onChange={(e) => setApplicationFormData({
                                            ...applicationFormData,
                                            financials: { ...applicationFormData.financials, loanAmountInr: Number(e.target.value) }
                                        })}
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Monthly Obligation (INR)</label>
                                    <input
                                        type="number"
                                        value={applicationFormData.financials?.obligationInr || ''}
                                        onChange={(e) => setApplicationFormData({
                                            ...applicationFormData,
                                            financials: { ...applicationFormData.financials, obligationInr: Number(e.target.value) }
                                        })}
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Product</label>
                                    <input
                                        type="text"
                                        value={applicationFormData.product || ''}
                                        onChange={(e) => setApplicationFormData({ ...applicationFormData, product: e.target.value })}
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Resident Type</label>
                                    <input
                                        type="text"
                                        value={applicationFormData.residentType || ''}
                                        onChange={(e) => setApplicationFormData({ ...applicationFormData, residentType: e.target.value })}
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Lead By</label>
                                    <input
                                        type="text"
                                        value={applicationFormData.leadBy || ''}
                                        onChange={(e) => setApplicationFormData({ ...applicationFormData, leadBy: e.target.value })}
                                        className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 5: References */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-1.5 bg-rose-500 rounded-full" />
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">References</h4>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setApplicationFormData({
                                        ...applicationFormData,
                                        references: [...(applicationFormData.references || []), { name: '', phoneNumber: '' }]
                                    })}
                                    className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
                                >
                                    <UserPlus className="h-3 w-3" />
                                    <span>Add Reference</span>
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(applicationFormData.references || []).map((ref: any, idx: number) => (
                                    <div key={idx} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-end gap-4 shadow-sm">
                                        <div className="flex-1 space-y-2">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Name</label>
                                            <input
                                                type="text"
                                                value={ref.name}
                                                onChange={(e) => {
                                                    const newRefs = [...applicationFormData.references];
                                                    newRefs[idx].name = e.target.value;
                                                    setApplicationFormData({ ...applicationFormData, references: newRefs });
                                                }}
                                                className="w-full h-10 px-3 bg-slate-50 rounded-lg text-sm font-bold border-none"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Phone</label>
                                            <input
                                                type="text"
                                                value={ref.phoneNumber}
                                                onChange={(e) => {
                                                    const newRefs = [...applicationFormData.references];
                                                    newRefs[idx].phoneNumber = e.target.value;
                                                    setApplicationFormData({ ...applicationFormData, references: newRefs });
                                                }}
                                                className="w-full h-10 px-3 bg-slate-50 rounded-lg text-sm font-bold border-none"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newRefs = applicationFormData.references.filter((_: any, i: number) => i !== idx);
                                                setApplicationFormData({ ...applicationFormData, references: newRefs });
                                            }}
                                            className="p-2.5 text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section 6: Co-Applicants */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-1.5 bg-violet-500 rounded-full" />
                                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Co-Applicants</h4>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setApplicationFormData({
                                        ...applicationFormData,
                                        coApplicants: [...(applicationFormData.coApplicants || []), { name: '', phoneNumber: '', email: '', motherName: '' }]
                                    })}
                                    className="flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-violet-100 transition-all"
                                >
                                    <UserPlus className="h-3 w-3" />
                                    <span>Add Co-Applicant</span>
                                </button>
                            </div>
                            <div className="space-y-4">
                                {(applicationFormData.coApplicants || []).map((co: any, idx: number) => (
                                    <div key={idx} className="p-6 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm relative group">
                                        <button
                                            onClick={() => {
                                                const newCos = applicationFormData.coApplicants.filter((_: any, i: number) => i !== idx);
                                                setApplicationFormData({ ...applicationFormData, coApplicants: newCos });
                                            }}
                                            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={co.name}
                                                    onChange={(e) => {
                                                        const newCos = [...applicationFormData.coApplicants];
                                                        newCos[idx].name = e.target.value;
                                                        setApplicationFormData({ ...applicationFormData, coApplicants: newCos });
                                                    }}
                                                    className="w-full h-11 px-4 bg-slate-50 rounded-xl text-sm font-bold border-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Phone</label>
                                                <input
                                                    type="text"
                                                    value={co.phoneNumber}
                                                    onChange={(e) => {
                                                        const newCos = [...applicationFormData.coApplicants];
                                                        newCos[idx].phoneNumber = e.target.value;
                                                        setApplicationFormData({ ...applicationFormData, coApplicants: newCos });
                                                    }}
                                                    className="w-full h-11 px-4 bg-slate-50 rounded-xl text-sm font-bold border-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                                                <input
                                                    type="email"
                                                    value={co.email}
                                                    onChange={(e) => {
                                                        const newCos = [...applicationFormData.coApplicants];
                                                        newCos[idx].email = e.target.value;
                                                        setApplicationFormData({ ...applicationFormData, coApplicants: newCos });
                                                    }}
                                                    className="w-full h-11 px-4 bg-slate-50 rounded-xl text-sm font-bold border-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mother's Name</label>
                                                <input
                                                    type="text"
                                                    value={co.motherName}
                                                    onChange={(e) => {
                                                        const newCos = [...applicationFormData.coApplicants];
                                                        newCos[idx].motherName = e.target.value;
                                                        setApplicationFormData({ ...applicationFormData, coApplicants: newCos });
                                                    }}
                                                    className="w-full h-11 px-4 bg-slate-50 rounded-xl text-sm font-bold border-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </Modal>

            {/* Create Lead Modal */}
            <Modal
                isOpen={isCreateLeadModalOpen}
                onClose={() => setIsCreateLeadModalOpen(false)}
                size="lg"
                title={
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-[1.2rem] bg-[#eefcf4] flex items-center justify-center text-[#00a878] shadow-sm">
                            <Plus size={24} strokeWidth={3} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <h3 className="text-[22px] font-black text-[#1a2b3b] tracking-tight leading-none">Create New Lead</h3>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none opacity-60">ADD A LEAD MANUALLY</span>
                        </div>
                    </div>
                }
                footer={
                    <div className="flex items-center justify-between gap-4 w-full px-2 pt-2">
                        <button
                            onClick={() => setIsCreateLeadModalOpen(false)}
                            className="flex-1 py-3 rounded-[1.2rem] text-[13px] font-black uppercase tracking-widest text-[#1a2b3b] border border-slate-100 hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateLead}
                            disabled={isCreatingLead || !createLeadPhone}
                            className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-[#00a878] text-white rounded-[1.2rem] hover:bg-[#008f66] active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/20 font-black text-[13px] uppercase tracking-widest leading-none disabled:opacity-50"
                        >
                            {isCreatingLead ? (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span>Create Lead</span>
                            )}
                        </button>
                    </div>
                }
            >
                <div className="space-y-2 px-1">
                    {/* Phone Number */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Phone Number *</label>
                        <div className="relative group">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#00a878] transition-colors" />
                            <input
                                type="tel"
                                maxLength={10}
                                placeholder="Enter 10-digit phone number"
                                value={createLeadPhone}
                                onChange={(e) => setCreateLeadPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                className="w-full h-12 pl-14 pr-6 bg-white border border-slate-100 rounded-[1.2rem] text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-[#00a878] transition-all"
                            />
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Name</label>
                        <div className="relative group">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#00a878] transition-colors" />
                            <input
                                type="text"
                                placeholder="Contact name (optional)"
                                value={createLeadName}
                                onChange={(e) => setCreateLeadName(e.target.value)}
                                className="w-full h-12 pl-14 pr-6 bg-white border border-slate-100 rounded-[1.2rem] text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-[#00a878] transition-all"
                            />
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Date</label>
                            <div className="relative group">
                                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#00a878] transition-colors" />
                                <input
                                    type="date"
                                    value={createLeadDate}
                                    onChange={(e) => setCreateLeadDate(e.target.value)}
                                    className="w-full h-12 pl-14 pr-12 bg-white border border-slate-100 rounded-[1.2rem] text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-[#00a878] transition-all cursor-pointer"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">Time</label>
                            <div className="relative group">
                                <input
                                    type="time"
                                    value={createLeadTime}
                                    onChange={(e) => setCreateLeadTime(e.target.value)}
                                    className="w-full h-12 px-6 bg-white border border-slate-100 rounded-[1.2rem] text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-[#00a878] transition-all cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>


                </div>
            </Modal>
        </div>
    );
}
