'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, clearError } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useAppDispatch();
    const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    const isFormValid = email.includes('@') && password.length >= 6;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid) {
            dispatch(clearError());
            await dispatch(login({ email, password }));
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold text-primary">Super Admin Login</CardTitle>
                    <p className="text-sm text-gray-500">
                        Enter your credentials to access the dashboard
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                label="Email"
                                type="email"
                                placeholder="email@address.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                rightIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                onRightIconClick={() => setShowPassword(!showPassword)}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md border border-red-200">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                                Remember me
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={loading}
                            disabled={!isFormValid || loading}
                        >
                            Login
                        </Button>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
