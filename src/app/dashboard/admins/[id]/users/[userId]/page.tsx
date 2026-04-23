'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    ArrowLeft, Calendar, Check, ChevronDown, Download, Edit2, Eye,
    FileSpreadsheet, FileText, Info, Phone, Plus, Search, Trash2,
    User, UserPlus, X, Activity, LayoutDashboard, Clock, ShieldCheck, Briefcase
} from 'lucide-react';
import { leadService, Lead, CallLog } from '@/services/leadService';
import { callService } from '@/services/callService';
import { loanTypeService, LoanType } from '@/services/loanTypeService';
import { adminService } from '@/services/adminService';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import * as XLSX from 'xlsx';
import { formatPhoneNumber } from '@/utils/phoneFormat';

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

export default function MobileUserProfilePage({ params }: { params: Promise<{ id: string, userId: string }> }) {
    const { id: adminId, userId } = React.use(params);
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'leads' | 'logs'>('leads');
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Leads State
    const [leads, setLeads] = useState<Lead[]>([]);
    const [mobileUsers, setMobileUsers] = useState<any[]>([]);
    const [leadsLoading, setLeadsLoading] = useState(true);
    const [leadsActiveTab, setLeadsActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    // Logs State
    const [logs, setLogs] = useState<any[]>([]);
    const [logsLoading, setLogsLoading] = useState(true);

    // Modal Visibility State
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [openAssignmentId, setOpenAssignmentId] = useState<string | null>(null);
    const [agentSearchQuery, setAgentSearchQuery] = useState('');

    // Modal Form State
    const [newStatus, setNewStatus] = useState('');
    const [notes, setNotes] = useState('');
    const [followUpDate, setFollowUpDate] = useState('');
    const [statusRemark, setStatusRemark] = useState('');
    const [reminderDate, setReminderDate] = useState('');
    const [reminderTime, setReminderTime] = useState('');
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editAssignedToId, setEditAssignedToId] = useState('');
    const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
    const [editLoanTypeId, setEditLoanTypeId] = useState('');
    const [editLoanType, setEditLoanType] = useState('Other');
    const [editCustomLoanType, setEditCustomLoanType] = useState('');
    const [editProfile, setEditProfile] = useState('');
    const [editCibilStatus, setEditCibilStatus] = useState('');
    const [editCibilRemark, setEditCibilRemark] = useState('');

    // Application Form State
    const [applicationFormData, setApplicationFormData] = useState<any>(null);
    const [isSavingForm, setIsSavingForm] = useState(false);
    const [isLoadingForm, setIsLoadingForm] = useState(false);
    const [selectedLeadForForm, setSelectedLeadForForm] = useState<Lead | null>(null);

    const fetchInitialData = async () => {
        try {
            const [loanTypesRes] = await Promise.all([
                loanTypeService.getLoanTypes()
            ]);
            setLoanTypes(loanTypesRes);
        } catch (e) { console.error('Failed to load initial data', e); }
    };

    const fetchUserData = async () => {
        try {
            const data = await adminService.getAdminMobileUsers(adminId);
            setMobileUsers(data.mobileUsers || []);
            const foundUser = data.mobileUsers.find((u: any) => u.id === userId);
            if (foundUser) {
                setUser({ ...foundUser, admin: data.admin });
            } else {
                toast.error('User not found');
                router.push(`/dashboard/admins/${adminId}`);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLeads = useCallback(async () => {
        try {
            setLeadsLoading(true);
            const params: any = {
                assignedToId: userId,
                status: leadsActiveTab === 'all' ? undefined : leadsActiveTab,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            };
            const data = await leadService.getLeads(params);
            setLeads(data);
        } catch (error) {
            console.error('Failed to fetch leads:', error);
        } finally {
            setLeadsLoading(false);
        }
    }, [userId, leadsActiveTab, startDate, endDate]);

    const fetchLogs = useCallback(async () => {
        try {
            setLogsLoading(true);
            const params: any = {
                assignedToId: userId,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            };
            const data = await callService.getCallLogs(params);
            setLogs(data.data);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLogsLoading(false);
        }
    }, [userId, startDate, endDate]);

    useEffect(() => {
        fetchUserData();
        fetchInitialData();
    }, [adminId, userId]);

    const filteredLeads = React.useMemo(() => {
        return leads.filter(l =>
            l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.phoneNumber.includes(searchTerm)
        );
    }, [leads, searchTerm]);

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
            const dt = new Date(lead.nextFollowUpAt);
            setReminderDate(dt.toISOString().split('T')[0]);
            setReminderTime(dt.toTimeString().slice(0, 5));
        } else {
            setReminderDate('');
            setReminderTime('');
        }
        setIsStatusModalOpen(true);
    };

    const handleDownloadExcel = () => {
        if (leads.length === 0) {
            toast.error('No leads found to export');
            return;
        }

        const dataToExport = filteredLeads.map(lead => ({
            'Lead ID': lead.leadId || (lead.branchSerialId ? `LD-${String(lead.branchSerialId).padStart(5, '0')}` : `LD-${String(lead.serialId).padStart(5, '0')}`),
            'Name': lead.name || 'N/A',
            'Phone': lead.phoneNumber,
            'Status': lead.status,
            'Loan Type': lead.loanType || 'N/A',
            'Profile': lead.profile || 'N/A',
            'CIBIL Status': lead.cibilStatus || 'N/A',
            'Interaction Notes': lead.notes || 'N/A',
            'Next Follow Up': lead.nextFollowUpAt ? format(new Date(lead.nextFollowUpAt), 'yyyy-MM-dd HH:mm') : 'N/A',
            'Created At': format(new Date(lead.createdAt), 'yyyy-MM-dd HH:mm'),
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
        XLSX.writeFile(workbook, `Leads_${user?.name || 'User'}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
        toast.success('Excel file downloaded successfully');
    };

    const setFollowUpPreset = (preset: '1hour' | 'tomorrow10am' | 'latertoday') => {
        const now = new Date();
        let followUp = new Date();

        if (preset === '1hour') {
            followUp.setHours(now.getHours() + 1);
        } else if (preset === 'tomorrow10am') {
            followUp.setDate(now.getDate() + 1);
            followUp.setHours(10, 0, 0, 0);
        } else if (preset === 'latertoday') {
            if (now.getHours() >= 16) {
                followUp.setHours(now.getHours() + 2);
            } else {
                followUp.setHours(18, 0, 0, 0);
            }
        }

        const tzOffset = followUp.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(followUp.getTime() - tzOffset)).toISOString().slice(0, 16);
        setFollowUpDate(localISOTime);
    };

    const handleUpdateStatus = async () => {
        if (!selectedLead) return;
        try {
            const updateData: any = {
                status: newStatus,
                name: editName,
                phoneNumber: editPhone,
                assignedToId: editAssignedToId === 'unassigned' ? null : editAssignedToId,
                loanTypeId: editLoanTypeId === 'unassigned' ? null : editLoanTypeId,
                notes: notes,
                statusRemark: statusRemark,
                profile: editProfile,
                cibilStatus: editCibilStatus,
                cibilRemark: editCibilRemark,
                loanType: editLoanType,
                customLoanType: editCustomLoanType
            };

            if (newStatus === 'REJECT' && reminderDate) {
                const dateTime = reminderTime ? `${reminderDate}T${reminderTime}:00` : `${reminderDate}T00:00:00`;
                updateData.nextFollowUpAt = new Date(dateTime).toISOString();
            } else if (newStatus === 'FOLLOW_UP') {
                updateData.nextFollowUpAt = followUpDate ? new Date(followUpDate).toISOString() : null;
            }

            await leadService.updateStatus(selectedLead.id, updateData);
            toast.success('Lead updated successfully');
            setIsStatusModalOpen(false);
            fetchLeads();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update lead');
        }
    };

    const openViewModal = async (lead: Lead) => {
        try {
            setSelectedLead(lead);
            setIsViewModalOpen(true);
            const fullLead = await leadService.getLead(lead.id);
            setSelectedLead({
                ...fullLead.lead,
                callLogs: fullLead.calllogs
            });
        } catch (error) {
            toast.error('Failed to load lead history');
        }
    };

    const openDeleteModal = (lead: Lead) => {
        setSelectedLead(lead);
        setIsDeleteModalOpen(true);
    };

    const handleAssignLead = async (leadId: string, userId: string) => {
        try {
            await leadService.assignLead(leadId, userId === 'unassigned' ? '' : userId);
            toast.success('Lead reassigned successfully');
            fetchLeads();
        } catch (error) {
            toast.error('Failed to reassign lead');
        }
    };

    const handleDeleteLead = async () => {
        if (!selectedLead) return;
        try {
            await leadService.deleteLead(selectedLead.id);
            toast.success('Lead deleted successfully');
            setIsDeleteModalOpen(false);
            fetchLeads();
        } catch (error) {
            toast.error('Failed to delete lead');
        }
    };

    const handleOpenForm = async (lead: Lead) => {
        try {
            setSelectedLeadForForm(lead);
            setIsFormModalOpen(true);
            setIsLoadingForm(true);
            const data = await leadService.getApplicationForm(lead.id);
            setApplicationFormData(data);
        } catch (err: any) {
            if (err.response?.status === 404) {
                setApplicationFormData({
                    name: lead.name || '',
                    phoneNumber: lead.phoneNumber,
                    email: lead.email || '',
                    motherName: '',
                    dob: '',
                    fileNumber: '',
                    companyName: '',
                    addresses: { current: '', permanent: '', office: '' },
                    financials: { netSalaryInr: 0, loanAmountInr: 0, obligationInr: 0 },
                    references: [{ name: '', phoneNumber: '' }, { name: '', phoneNumber: '' }],
                    coApplicants: []
                });
            } else {
                toast.error('Failed to load form sheet');
            }
        } finally {
            setIsLoadingForm(false);
        }
    };

    const handleSaveForm = async () => {
        if (!selectedLeadForForm || !applicationFormData) return;
        try {
            setIsSavingForm(true);
            await leadService.saveApplicationForm(selectedLeadForForm.id, applicationFormData);
            toast.success('Form saved successfully');
            setIsFormModalOpen(false);
        } catch (error) {
            toast.error('Failed to save form');
        } finally {
            setIsSavingForm(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (!selectedLeadForForm) return;
        try {
            const data = await leadService.downloadApplicationPdf(selectedLeadForForm.id);
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `application-form-${selectedLeadForForm.leadId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('PDF downloaded successfully');
        } catch (error) {
            toast.error('Failed to download PDF');
        }
    };

    useEffect(() => {
        if (activeTab === 'leads') fetchLeads();
        if (activeTab === 'logs') fetchLogs();
    }, [activeTab, fetchLeads, fetchLogs]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Profile...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push(`/dashboard/admins/${adminId}`)}
                        className="group flex items-center justify-center p-3.5 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 shadow-sm"
                        title="Back to Mobile Users"
                    >
                        <ArrowLeft size={20} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex flex-col gap-2">
                        <Breadcrumbs />
                        <div className="flex items-center gap-5">
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                                    {user?.name || user?.username}
                                </h1>
                                <div className="flex items-center gap-3 mt-3">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        <User size={12} /> {user?.username}
                                    </div>

                                    <div className={clsx(
                                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                        (user?.isEnabled ?? true) ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                                    )}>
                                        <div className={clsx("h-1.5 w-1.5 rounded-full", (user?.isEnabled ?? true) ? "bg-emerald-500" : "bg-rose-500")} />
                                        {user?.isEnabled ?? true ? 'Active' : 'Disabled'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
            <div>
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <Card className="rounded-[1.5rem] border-slate-100 shadow-sm overflow-hidden bg-white group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500/20 transition-all duration-300">
                                    <LayoutDashboard size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Assigned</p>
                                    <h3 className="text-2xl font-black text-slate-900 mt-1">{user?.totalLeads || 0}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-[1.5rem] border-slate-100 shadow-sm overflow-hidden bg-white group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-500/20 transition-all duration-300">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Follow-ups</p>
                                    <h3 className="text-2xl font-black text-slate-900 mt-1">{user?.totalFollowUps || 0}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-[1.5rem] border-slate-100 shadow-sm overflow-hidden bg-white group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500/20 transition-all duration-300">
                                    <Check size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">New Leads</p>
                                    <h3 className="text-2xl font-black text-slate-900 mt-1">{user?.totalNewLeads || 0}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-[1.5rem] border-slate-100 shadow-sm overflow-hidden bg-white group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 group-hover:bg-rose-500/15 transition-all duration-300">
                                    <Activity size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Closed Leads</p>
                                    <h3 className="text-2xl font-black text-slate-900 mt-1">{user?.totalClosedLeads || 0}</h3>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
            <div>
                {/* Tab Navigation */}
                <div className="flex gap-4 p-1.5 bg-slate-100/50 rounded-[2rem] w-fit border border-slate-200/50">
                    <button
                        onClick={() => setActiveTab('leads')}
                        className={clsx(
                            "flex items-center gap-2.5 px-8 py-3 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all duration-300",
                            activeTab === 'leads' ? "bg-white text-primary shadow-xl" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <LayoutDashboard size={18} strokeWidth={2.5} className={activeTab === 'leads' ? "text-primary" : "text-slate-400"} />
                        Assigned Leads
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={clsx(
                            "flex items-center gap-2.5 px-8 py-3 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all duration-300",
                            activeTab === 'logs' ? "bg-white text-primary shadow-xl" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <Activity size={18} strokeWidth={2.5} className={activeTab === 'logs' ? "text-primary" : "text-slate-400"} />
                        Mobile User Activity Logs
                    </button>
                </div>
            </div>
            <div>

                <div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-[1rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden min-h-[600px]">
                        {activeTab === 'leads' ? (
                            <div className="p-0">
                                <div className="flex flex-col md:flex-row h-full min-h-[600px] md:h-[calc(100vh-280px)] overflow-hidden">
                                    {/* Sidebar Status Filter */}
                                    <div className="hidden md:flex w-72 shrink-0 border-r border-slate-50 bg-slate-50/20 flex-col h-full">
                                        <div className="p-8 border-b border-slate-50 bg-white/50 shrink-0">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-1 bg-primary rounded-full" />
                                                <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em]">Filter Results</h4>
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto no-scrollbar py-6 px-4 space-y-1.5 custom-scrollbar">
                                            {STATUS_TABS.map(tab => (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => setLeadsActiveTab(tab.id)}
                                                    className={clsx(
                                                        "w-full flex items-center justify-between px-6 py-4.5 text-[12px] font-black uppercase tracking-wider rounded-2xl transition-all duration-300",
                                                        leadsActiveTab === tab.id
                                                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                                                            : "text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-md hover:shadow-slate-200/50"
                                                    )}
                                                >
                                                    <span>{tab.label}</span>
                                                    {leadsActiveTab === tab.id && (
                                                        <div className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,1)]" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Main Content Area */}
                                    <div className="flex-1 flex flex-col min-w-0 bg-white h-full">
                                        {/* Mobile Status Dropdown */}
                                        <div className="md:hidden p-6 border-b border-slate-100 bg-slate-50/30">
                                            <Select
                                                label="FILTER BY STATUS"
                                                value={leadsActiveTab}
                                                onChange={setLeadsActiveTab}
                                                options={STATUS_TABS.map(t => ({ id: t.id, label: t.label.toUpperCase(), value: t.id }))}
                                            />
                                        </div>

                                        {/* Search & Export */}
                                        <div className="p-8 space-y-6 border-b border-slate-50 bg-white/50 sticky top-0 z-10 backdrop-blur-md shrink-0">
                                            <div className="flex flex-wrap items-center justify-between gap-6">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search by name or phone..."
                                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm text-slate-900 placeholder:text-slate-400"
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    />
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
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
                                                        onClick={handleDownloadExcel}
                                                        className="flex items-center gap-2.5 px-6 py-3.5 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100 shadow-lg shadow-emerald-500/5"
                                                    >
                                                        <FileSpreadsheet size={16} strokeWidth={2.5} />
                                                        Download Excel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Leads Table */}
                                        <div className="flex-1 overflow-auto custom-scrollbar">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-50 bg-[#fafcfc]/50">
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Lead Identifier</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Details</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Current Status</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned To</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Loan Type</th>
                                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {leadsLoading ? (
                                                        <tr>
                                                            <td colSpan={6} className="px-8 py-32 text-center">
                                                                <div className="flex flex-col items-center gap-4">
                                                                    <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent shadow-lg shadow-primary/20" />
                                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Leads...</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : leads.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={6} className="px-8 py-32 text-center">
                                                                <div className="flex flex-col items-center gap-4 opacity-40">
                                                                    <div className="h-20 w-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
                                                                        <FileText size={40} strokeWidth={1.5} />
                                                                    </div>
                                                                    <p className="text-xs font-black uppercase tracking-widest">No leads found</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : filteredLeads.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={6} className="px-8 py-32 text-center">
                                                                <div className="flex flex-col items-center gap-4 opacity-40">
                                                                    <Search size={48} strokeWidth={1.5} />
                                                                    <p className="text-xs font-black uppercase tracking-widest">No matching results</p>
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
                                                                        "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1.5",
                                                                        lead.status === 'NEW' ? 'bg-emerald-50 text-emerald-600' :
                                                                            lead.status === 'FOLLOW_UP' ? 'bg-blue-50 text-blue-600' :
                                                                                lead.status === 'CLOSED' ? 'bg-slate-900 text-white' :
                                                                                    'bg-slate-100 text-slate-500'
                                                                    )}>
                                                                        <div className={clsx(
                                                                            "h-1.5 w-1.5 rounded-full",
                                                                            lead.status === 'NEW' ? 'bg-emerald-500' :
                                                                                lead.status === 'FOLLOW_UP' ? 'bg-blue-500' :
                                                                                    lead.status === 'CLOSED' ? 'bg-white' : 'bg-slate-400'
                                                                        )} />
                                                                        {STATUS_TABS.find(t => t.id === lead.status)?.label || lead.status.replace(/_/g, ' ')}
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
                                                                                    <div className="px-4 py-3 border-b border-slate-50 flex items-center gap-2.5">
                                                                                        <UserPlus size={14} className="text-primary" />
                                                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select Agent</span>
                                                                                    </div>

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

                                                                                    <div className="max-h-64 overflow-y-auto custom-scrollbar px-1 py-1 space-y-1">
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
                                                                    <span className="inline-block px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-black text-indigo-600 uppercase tracking-tighter">
                                                                        {lead.loanType === 'Other' ? (lead.customLoanType || 'Other') : (lead.loanType || 'Personal Loan')}
                                                                    </span>
                                                                </td>
                                                                <td className="px-8 py-6 text-right">
                                                                    <div className="flex justify-end gap-2">
                                                                        <button
                                                                            onClick={() => openViewModal(lead)}
                                                                            className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/10 shadow-sm shadow-primary/5"
                                                                            title="View History"
                                                                        >
                                                                            <Eye size={16} strokeWidth={2.5} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => openStatusModal(lead)}
                                                                            className="p-2.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-500/20 transition-all border border-amber-100 shadow-sm shadow-amber-500/5"
                                                                            title="Update Status"
                                                                        >
                                                                            <Edit2 size={16} strokeWidth={2.5} />
                                                                        </button>
                                                                        {lead.applicationForm && (
                                                                            <button
                                                                                onClick={() => handleOpenForm(lead)}
                                                                                className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500/20 transition-all border border-emerald-100 shadow-sm shadow-emerald-500/5"
                                                                                title="Application Form"
                                                                            >
                                                                                <FileText size={16} strokeWidth={2.5} />
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={() => openDeleteModal(lead)}
                                                                            className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500/20 transition-all border border-rose-100 shadow-sm shadow-rose-500/5"
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
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-0">
                                {/* Logs Content */}
                                <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Call Interaction History</h3>

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
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm border-b border-slate-100">
                                            <tr className="bg-[#fafcfc]/50">
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Target User</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Final Outcome</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Note</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {logsLoading ? (
                                                <tr>
                                                    <td colSpan={6} className="px-8 py-32 text-center">
                                                        <div className="flex flex-col items-center gap-4">
                                                            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Activity...</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : logs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-8 py-32 text-center text-slate-400">
                                                        <div className="flex flex-col items-center gap-4 opacity-40">
                                                            <Activity size={48} strokeWidth={1.5} />
                                                            <p className="text-xs font-black uppercase tracking-widest">No activity logs found</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                logs.map(log => {
                                                    const isAction = log.type === 'ACTION';
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
                                                        else if (action.includes('LOGIN')) actionLabel = 'Login';
                                                        else actionLabel = action.split('_')[0].charAt(0).toUpperCase() + action.split('_')[0].slice(1).toLowerCase() || 'Update';
                                                    }

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
                                                                                    actionLabel === 'Assign' || actionLabel === 'Login' ? 'bg-amber-50 text-amber-600' :
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
                    </div>

                    {/* Status Modal */}
                    <Modal
                        isOpen={isStatusModalOpen}
                        onClose={() => setIsStatusModalOpen(false)}
                        title={
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <Edit2 size={20} strokeWidth={2.5} />
                                </div>
                                <span className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                    Edit Lead: <span className="text-emerald-600">{selectedLead?.leadId}</span>
                                </span>
                            </div>
                        }
                        size="xl"
                        footer={
                            <div className="flex items-center justify-end gap-6 w-full">
                                <button
                                    onClick={() => setIsStatusModalOpen(false)}
                                    className="text-slate-500 font-black uppercase tracking-widest text-xs hover:text-slate-700 transition-all"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={handleUpdateStatus}
                                    className="px-10 py-4 rounded-[1.2rem] bg-emerald-600 text-white font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all"
                                >
                                    Save Changes
                                </button>
                            </div>
                        }
                    >
                        <div className="space-y-6 w-full">
                            {/* Basic Info Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="LEAD NAME"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    placeholder="Enter lead name"
                                    className="bg-white"
                                />
                                <Input
                                    label="PHONE NUMBER"
                                    value={editPhone}
                                    onChange={e => setEditPhone(e.target.value)}
                                    placeholder="Enter phone number"
                                    className="bg-white"
                                />
                            </div>

                            {/* Status & Agent Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select
                                    label="OUTCOME STATUS"
                                    value={newStatus}
                                    onChange={setNewStatus}
                                    options={STATUS_TABS.filter(t => t.id !== 'all').map(t => ({ id: t.id, label: t.label.toUpperCase(), value: t.id }))}
                                />
                                <Select
                                    label="ASSIGNED AGENT"
                                    value={editAssignedToId}
                                    onChange={setEditAssignedToId}
                                    options={[
                                        { id: 'unassigned', label: 'UNASSIGNED', value: 'unassigned' },
                                        ...mobileUsers.map(u => ({ id: u.id, label: (u.name || u.username).toUpperCase(), value: u.id }))
                                    ]}
                                />
                            </div>

                            {/* Follow-up Section (Conditional) */}
                            {(newStatus === 'FOLLOW_UP') && (
                                <div className="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">Follow-up Date & Time</label>

                                    <div className="flex flex-wrap gap-3 mb-5">
                                        <button
                                            onClick={() => setFollowUpPreset('1hour')}
                                            className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100"
                                        >
                                            +1 Hour
                                        </button>
                                        <button
                                            onClick={() => setFollowUpPreset('tomorrow10am')}
                                            className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100"
                                        >
                                            Tomorrow 10AM
                                        </button>
                                        <button
                                            onClick={() => setFollowUpPreset('latertoday')}
                                            className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100"
                                        >
                                            Later Today
                                        </button>
                                    </div>

                                    <div className="relative group">
                                        <input
                                            type="datetime-local"
                                            className="w-full h-14 px-5 bg-white border border-slate-200 rounded-2xl font-bold text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all cursor-pointer"
                                            value={followUpDate}
                                            onChange={e => setFollowUpDate(e.target.value)}
                                        />
                                        <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none group-focus-within:text-emerald-500 transition-colors" />
                                    </div>
                                </div>
                            )}

                            {/* Product Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select
                                    label="LOAN TYPE"
                                    value={editLoanType}
                                    onChange={setEditLoanType}
                                    options={[
                                        { id: 'other', label: 'OTHER', value: 'Other' },
                                        ...loanTypes.map(lt => ({ id: lt.id, label: lt.name.toUpperCase(), value: lt.name }))
                                    ]}
                                />
                                <Select
                                    label="PROFILE"
                                    value={editProfile}
                                    onChange={setEditProfile}
                                    options={[
                                        { id: 'job', label: 'JOB', value: 'Job' },
                                        { id: 'business', label: 'BUSINESS', value: 'Business' },
                                        { id: 'other', label: 'OTHER', value: 'Other' }
                                    ]}
                                />
                            </div>

                            {/* CIBIL Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select
                                    label="CIBIL STATUS"
                                    value={editCibilStatus}
                                    onChange={setEditCibilStatus}
                                    valueClassName={(v) => v === 'ISSUED' ? 'text-rose-600 font-black' : ''}
                                    options={[
                                        { id: 'none', label: 'SELECT STATUS', value: '' },
                                        { id: 'issued', label: 'ISSUED', value: 'ISSUED' },
                                        { id: 'not_issued', label: 'NOT ISSUED', value: 'NOT_ISSUED' }
                                    ]}
                                />
                                <Input
                                    label="CIBIL ISSUE REMARK"
                                    value={editCibilRemark}
                                    onChange={e => setEditCibilRemark(e.target.value)}
                                    placeholder="Explain the status..."
                                    className="bg-white"
                                />
                            </div>

                            {/* Notes Row */}
                            <div className="space-y-2.5">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Interaction Notes</label>
                                <textarea
                                    className="w-full p-5 bg-white border border-slate-200 rounded-[1.5rem] font-bold text-sm text-slate-900 placeholder:text-slate-300 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all min-h-[120px] resize-none shadow-sm"
                                    placeholder="Add details about the conversation..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    </Modal>

                    {/* View Modal */}
                    <Modal
                        isOpen={isViewModalOpen}
                        onClose={() => setIsViewModalOpen(false)}
                        title="Lead History & Activity"
                        size="3xl"
                    >
                        <div className="space-y-8">
                            {/* Lead Quick Summary Header */}
                            <div className="bg-slate-50/50 rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <User size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Customer Name</span>
                                        </div>
                                        <p className="text-base font-black text-slate-900 pl-6">{selectedLead?.name || '---'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Phone size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Phone Number</span>
                                        </div>
                                        <p className="text-base font-black text-slate-900 pl-6">{selectedLead?.phoneNumber || '---'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Info size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Lead Identity</span>
                                        </div>
                                        <div className="pl-6 space-y-0.5">
                                            <p className="text-base font-black text-primary">{selectedLead?.leadId || '---'}</p>
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Serial #{selectedLead?.serialId || '---'}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Activity size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Current Status</span>
                                        </div>
                                        <div className="pl-6">
                                            <span className={clsx(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider inline-block",
                                                selectedLead?.status === 'NEW' ? 'bg-blue-50 text-blue-600' :
                                                    selectedLead?.status === 'FOLLOW_UP' ? 'bg-amber-50 text-amber-600' :
                                                        selectedLead?.status === 'CLOSED' ? 'bg-rose-50 text-rose-600' :
                                                            'bg-slate-100 text-slate-500'
                                            )}>
                                                {selectedLead?.status?.replace('_', ' ') || '---'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Briefcase size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Loan Product</span>
                                        </div>
                                        <p className="text-base font-black text-slate-700 pl-6">{selectedLead?.loanType || '---'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <ShieldCheck size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Agent & Profile</span>
                                        </div>
                                        <div className="pl-6 space-y-1">
                                            <p className="text-sm font-black text-slate-900">{selectedLead?.assignedTo?.name || 'Unassigned'}</p>
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{selectedLead?.profile || 'No Profile'}</p>
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">CIBIL: {selectedLead?.cibilStatus || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-50 pb-3 px-2">
                                    <div className="p-2 bg-primary/10 text-primary rounded-xl">
                                        <Activity size={18} strokeWidth={2.5} />
                                    </div>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Interaction Timeline</h4>
                                </div>

                                {selectedLead?.callLogs?.length === 0 ? (
                                    <div className="py-20 text-center text-slate-300">
                                        <Clock size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="text-xs font-black uppercase tracking-widest">No interaction history recorded yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 mx-2">
                                        {selectedLead?.callLogs?.map((log, i) => (
                                            <div key={log.id} className="relative pl-12">
                                                <div className="absolute left-0 top-1 h-9 w-9 rounded-xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 shadow-sm z-10">
                                                    {log.callType === 'INCOMING' ? <Phone size={14} strokeWidth={3} /> : <Activity size={14} strokeWidth={3} />}
                                                </div>
                                                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 group hover:border-primary/20 hover:bg-white transition-all">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{log.callType} CALL</span>
                                                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                            <div className="inline-block px-2 py-0.5 bg-slate-200 rounded text-[9px] font-black text-slate-600 uppercase tracking-wider">
                                                                {log.outcome || 'N/A'}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-slate-400">
                                                            <Calendar size={12} />
                                                            <span className="text-[10px] font-bold">{format(new Date(log.createdAt), 'MMM d, yyyy • hh:mm a')}</span>
                                                        </div>
                                                    </div>
                                                    {log.notes ? (
                                                        <div className="relative">
                                                            <Info size={14} className="absolute -left-0.5 top-0.5 text-slate-300" />
                                                            <p className="pl-5 text-xs font-medium text-slate-600 leading-relaxed">
                                                                {log.notes}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-[10px] font-bold text-slate-300 italic uppercase tracking-widest">No notes provided for this interaction</p>
                                                    )}
                                                    {log.duration && (
                                                        <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                                                                Duration: {Math.floor(log.duration / 60)}m {log.duration % 60}s
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Modal >

                    {/* Delete Modal */}
                    < ConfirmationModal
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)
                        }
                        onConfirm={handleDeleteLead}
                        title="Permanently Delete Lead?"
                        message="This action cannot be undone. All records, call history, and associated application forms for this lead will be permanently removed from the system."
                        confirmLabel="Yes, Delete Lead"
                        variant="danger"
                    />

                    {/* Application Form Modal */}
                    < Modal
                        isOpen={isFormModalOpen}
                        onClose={() => setIsFormModalOpen(false)}
                        size="4xl"
                        title={
                            < div className="flex items-center justify-between w-full pr-8" >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Form Sheet</h3>
                                        <span className="text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-widest leading-none">Lead ID: {selectedLeadForForm?.leadId}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDownloadPdf}
                                    className="hidden md:flex items-center gap-2.5 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/10 active:scale-95"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Download PDF</span>
                                </button>
                            </div >
                        }
                        footer={
                            < div className="flex items-center justify-end gap-4 w-full" >
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
                            </div >
                        }
                    >
                        {
                            isLoadingForm ? (
                                <div className="py-20 text-center" >
                                    <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent mx-auto" />
                                </div>
                            ) : applicationFormData && (
                                <div className="space-y-12 pb-6">
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
                                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 focus:bg-white transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                                                <input
                                                    type="text"
                                                    value={applicationFormData.phoneNumber || ''}
                                                    onChange={(e) => setApplicationFormData({ ...applicationFormData, phoneNumber: e.target.value })}
                                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 focus:bg-white transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={applicationFormData.email || ''}
                                                    onChange={(e) => setApplicationFormData({ ...applicationFormData, email: e.target.value })}
                                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 focus:bg-white transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mother's Name</label>
                                                <input
                                                    type="text"
                                                    value={applicationFormData.motherName || ''}
                                                    onChange={(e) => setApplicationFormData({ ...applicationFormData, motherName: e.target.value })}
                                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 focus:bg-white transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Date of Birth</label>
                                                <input
                                                    type="date"
                                                    value={applicationFormData.dob || ''}
                                                    onChange={(e) => setApplicationFormData({ ...applicationFormData, dob: e.target.value })}
                                                    className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 focus:bg-white transition-all"
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
                                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 focus:bg-white transition-all resize-none"
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
                                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 focus:bg-white transition-all resize-none"
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2.5">
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Office Address</label>
                                                <textarea
                                                    rows={2}
                                                    value={applicationFormData.addresses?.office || ''}
                                                    onChange={(e) => setApplicationFormData({
                                                        ...applicationFormData,
                                                        addresses: { ...applicationFormData.addresses, office: e.target.value }
                                                    })}
                                                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-300 focus:bg-white transition-all resize-none"
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Section 4: Financials */}
                                    <section className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-1.5 bg-amber-500 rounded-full" />
                                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Financial Information</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-amber-50/20 rounded-[1.5rem] border border-amber-100/50">
                                            <div className="space-y-2.5">
                                                <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest px-1">Net Salary (INR)</label>
                                                <input
                                                    type="number"
                                                    value={applicationFormData.financials?.netSalaryInr || 0}
                                                    onChange={(e) => setApplicationFormData({
                                                        ...applicationFormData,
                                                        financials: { ...applicationFormData.financials, netSalaryInr: Number(e.target.value) }
                                                    })}
                                                    className="w-full h-12 px-4 bg-white border border-amber-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest px-1">Loan Amount (INR)</label>
                                                <input
                                                    type="number"
                                                    value={applicationFormData.financials?.loanAmountInr || 0}
                                                    onChange={(e) => setApplicationFormData({
                                                        ...applicationFormData,
                                                        financials: { ...applicationFormData.financials, loanAmountInr: Number(e.target.value) }
                                                    })}
                                                    className="w-full h-12 px-4 bg-white border border-amber-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="block text-[10px] font-black text-amber-600 uppercase tracking-widest px-1">Current Obligation (INR)</label>
                                                <input
                                                    type="number"
                                                    value={applicationFormData.financials?.obligationInr || 0}
                                                    onChange={(e) => setApplicationFormData({
                                                        ...applicationFormData,
                                                        financials: { ...applicationFormData.financials, obligationInr: Number(e.target.value) }
                                                    })}
                                                    className="w-full h-12 px-4 bg-white border border-amber-200 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all"
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
                                                onClick={() => setApplicationFormData({
                                                    ...applicationFormData,
                                                    references: [...(applicationFormData.references || []), { name: '', phoneNumber: '' }]
                                                })}
                                                className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all"
                                            >
                                                <Plus className="h-3 w-3" />
                                                <span>Add Reference</span>
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {(applicationFormData.references || []).map((ref: any, idx: number) => (
                                                <div key={idx} className="group relative flex gap-4 items-end bg-slate-50/50 p-5 rounded-2xl border border-slate-100 hover:border-rose-100 hover:bg-rose-50/10 transition-all">
                                                    <div className="flex-1 space-y-2">
                                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none px-1">Name</label>
                                                        <input
                                                            type="text"
                                                            value={ref.name || ''}
                                                            onChange={(e) => {
                                                                const newRefs = [...(applicationFormData.references || [])];
                                                                newRefs[idx] = { ...newRefs[idx], name: e.target.value };
                                                                setApplicationFormData({ ...applicationFormData, references: newRefs });
                                                            }}
                                                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-200 transition-all"
                                                        />
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none px-1">Phone</label>
                                                        <input
                                                            type="text"
                                                            value={ref.phoneNumber || ''}
                                                            onChange={(e) => {
                                                                const newRefs = [...(applicationFormData.references || [])];
                                                                newRefs[idx] = { ...newRefs[idx], phoneNumber: e.target.value };
                                                                setApplicationFormData({ ...applicationFormData, references: newRefs });
                                                            }}
                                                            className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-200 transition-all"
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const newRefs = applicationFormData.references.filter((_: any, i: number) => i !== idx);
                                                            setApplicationFormData({ ...applicationFormData, references: newRefs });
                                                        }}
                                                        className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-white rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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
                                                onClick={() => setApplicationFormData({
                                                    ...applicationFormData,
                                                    coApplicants: [...(applicationFormData.coApplicants || []), { name: '', phoneNumber: '', email: '', motherName: '' }]
                                                })}
                                                className="flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-600 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-violet-100 transition-all"
                                            >
                                                <Plus className="h-3 w-3" />
                                                <span>Add Co-Applicant</span>
                                            </button>
                                        </div>
                                        <div className="space-y-6">
                                            {(applicationFormData.coApplicants || []).map((co: any, idx: number) => (
                                                <div key={idx} className="relative bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 hover:border-violet-100 transition-all">
                                                    <button
                                                        onClick={() => {
                                                            const newCos = applicationFormData.coApplicants.filter((_: any, i: number) => i !== idx);
                                                            setApplicationFormData({ ...applicationFormData, coApplicants: newCos });
                                                        }}
                                                        className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-white rounded-xl transition-all"
                                                    >
                                                        <X className="h-5 w-5" />
                                                    </button>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-2.5">
                                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Name</label>
                                                            <input
                                                                type="text"
                                                                value={co.name || ''}
                                                                onChange={(e) => {
                                                                    const newCos = [...(applicationFormData.coApplicants || [])];
                                                                    newCos[idx] = { ...newCos[idx], name: e.target.value };
                                                                    setApplicationFormData({ ...applicationFormData, coApplicants: newCos });
                                                                }}
                                                                className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-300 transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-2.5">
                                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone</label>
                                                            <input
                                                                type="text"
                                                                value={co.phoneNumber || ''}
                                                                onChange={(e) => {
                                                                    const newCos = [...(applicationFormData.coApplicants || [])];
                                                                    newCos[idx] = { ...newCos[idx], phoneNumber: e.target.value };
                                                                    setApplicationFormData({ ...applicationFormData, coApplicants: newCos });
                                                                }}
                                                                className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-300 transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-2.5">
                                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                                                            <input
                                                                type="email"
                                                                value={co.email || ''}
                                                                onChange={(e) => {
                                                                    const newCos = [...(applicationFormData.coApplicants || [])];
                                                                    newCos[idx] = { ...newCos[idx], email: e.target.value };
                                                                    setApplicationFormData({ ...applicationFormData, coApplicants: newCos });
                                                                }}
                                                                className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-300 transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-2.5">
                                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mother's Name</label>
                                                            <input
                                                                type="text"
                                                                value={co.motherName || ''}
                                                                onChange={(e) => {
                                                                    const newCos = [...(applicationFormData.coApplicants || [])];
                                                                    newCos[idx] = { ...newCos[idx], motherName: e.target.value };
                                                                    setApplicationFormData({ ...applicationFormData, coApplicants: newCos });
                                                                }}
                                                                className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-300 transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            )}
                    </Modal >
                </div>
            </div>
        </div>
    );
}
