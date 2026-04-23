'use client';

import { useState, useEffect } from 'react';
import {
    CheckCircle2,
    Phone,
    XCircle,
    Users,
    Loader2
} from 'lucide-react';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { leadService, LeadStats } from '@/services/leadService';

export default function OverviewDashboard() {
    const [stats, setStats] = useState<LeadStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await leadService.getStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            </div>
        );
    }

    const activityData = stats?.last7DaysCalls || [];

    const funnelItems = [
        {
            label: 'Not Answered',
            count: stats?.notAnsweredLeads || 0,
            percentage: stats?.totalCalls ? Math.round(((stats.notAnsweredLeads || 0) / stats.totalCalls) * 100) : 0,
            color: 'bg-slate-200'
        },
        {
            label: 'Scheduled Follow-ups',
            count: stats?.followUpLeads || 0,
            percentage: stats?.totalCalls ? Math.round(((stats.followUpLeads || 0) / stats.totalCalls) * 100) : 0,
            color: 'bg-amber-400'
        },
        {
            label: 'Successfully Completed',
            count: stats?.completedLeads || 0,
            percentage: stats?.totalCalls ? Math.round(((stats.completedLeads || 0) / stats.totalCalls) * 100) : 0,
            color: 'bg-emerald-500'
        },
    ];

    return (
        <div className="space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">System Overview</h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Real-time performance analytics & system health</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard
                    title="TOTAL ADMINS"
                    value={stats?.totalAdmins || 0}
                    icon={Users}
                    iconColor="text-indigo-500"
                    bgColor="bg-indigo-50/50"
                    trend="Active branches"
                    trendColor="text-indigo-500"
                />
                <StatCard
                    title="TOTAL CALLS"
                    value={stats?.totalCalls || 0}
                    icon={Phone}
                    iconColor="text-blue-500"
                    bgColor="bg-blue-50/50"
                    trend="System wide"
                    trendColor="text-blue-500"
                />

                <StatCard
                    title="CALL CONNECTED"
                    value={stats?.completedLeads || 0}
                    icon={CheckCircle2}
                    iconColor="text-emerald-500"
                    bgColor="bg-emerald-50/50"
                    trend="Successful conversion"
                    trendColor="text-emerald-500"
                />
                <StatCard
                    title="CLOSED LEADS"
                    value={stats?.closedLeads || 0}
                    icon={XCircle}
                    iconColor="text-slate-400"
                    bgColor="bg-slate-50/50"
                    trend="Inactive status"
                    trendColor="text-slate-400"
                />
            </div>

            {/* Main Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Lead Activity Chart */}
                <div className="lg:col-span-8 bg-white rounded-[1.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">


                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Lead Activity</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Operational flux (Last 7 Days)</p>
                        </div>

                    </div>

                    <div className="h-[380px] w-[100%] relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={activityData}>
                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#008080" />
                                        <stop offset="100%" stopColor="#0ea5e9" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f8fafc" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white/90 backdrop-blur-xl p-5 border border-white shadow-2xl rounded-3xl animate-in zoom-in-95 duration-200">
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-3 w-3 rounded-full bg-primary" />
                                                        <p className="text-lg font-black text-slate-800">{payload[0].value} <span className="text-xs text-slate-400 ml-1">leads</span></p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="leads"
                                    stroke="url(#lineGradient)"
                                    strokeWidth={4}
                                    dot={{ r: 6, fill: '#fff', strokeWidth: 3, stroke: '#008080' }}
                                    activeDot={{ r: 8, strokeWidth: 4, stroke: '#fff', fill: '#008080' }}
                                    animationDuration={2000}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Conversion Funnel */}
                <div className="lg:col-span-4 bg-[#111827] rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
                    <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700" />

                    <div className="relative z-10">
                        <h3 className="text-xl font-black tracking-tight mb-2">Lead Funnel</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10">Conversion conversion cycles</p>

                        <div className="space-y-12">
                            {funnelItems.map((item, index) => (
                                <div key={item.label} className="space-y-4 relative">
                                    <div className="flex items-end justify-between">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{item.label}</span>
                                            <div className="text-2xl font-black">{item.count}</div>
                                        </div>
                                        <div className="text-xs font-black text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                                            {item.percentage}%
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-[1500ms] delay-[${index * 200}ms] ${item.color.replace('bg-', 'bg-gradient-to-r from-')}`}
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    iconColor: string;
    bgColor: string;
    trend: string;
    trendColor: string;
}

function StatCard({ title, value, icon: Icon, iconColor, bgColor, trend, trendColor }: StatCardProps) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group flex flex-col justify-between min-h-[160px]">
            <div className="flex items-start justify-between">
                <div className={`p-4 rounded-2xl ${bgColor} group-hover:scale-110 transition-transform duration-500`}>
                    <Icon className={`h-7 w-7 ${iconColor}`} strokeWidth={2.5} />
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] mb-1">{title}</p>
                    <h4 className="text-4xl font-black text-slate-800 tracking-tight group-hover:text-primary transition-colors">{value}</h4>
                </div>
            </div>

            <div className="mt-6 flex items-center gap-2">
                <div className={`text-[10px] font-black uppercase tracking-wider ${trendColor} bg-slate-50 px-3 py-1 rounded-full group-hover:bg-white transition-colors`}>
                    {trend}
                </div>
            </div>
        </div>
    );
}



