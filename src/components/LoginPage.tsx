"use client";

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Lock, Mail, Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
    const { signIn, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        const result = await signIn(email, password);
        if (result.error) {
            setError(translateError(result.error));
        }

        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="w-10 h-10 border-4 border-jumbo-blue border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-jumbo-blue via-blue-800 to-indigo-900 flex items-center justify-center p-4">
            {/* Decorative blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 -left-20 w-72 h-72 bg-jumbo-red/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 -right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
            </div>

            <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                {/* Logo Header */}
                <div className="text-center mb-8">
                    <div className="inline-block bg-jumbo-blue text-white px-4 py-2 rounded-xl font-black text-xl tracking-tight mb-3">
                        ИНТЕР СТАР <span className="text-jumbo-red">ЏАМБО</span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Админ Панел</h1>
                    <p className="text-gray-500 text-sm mt-1">Најавете се за да продолжите</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="vashiot@email.com"
                                required
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-jumbo-blue text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Лозинка</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-jumbo-blue text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-jumbo-blue hover:bg-blue-800 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <LogIn size={18} />
                                Најави се
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-6 text-center text-xs text-gray-400">
                    Пристапот е ограничен. Контактирајте го администраторот за да добиете сметка.
                </p>
            </div>
        </div>
    );
}

function translateError(error: string): string {
    if (error.includes('Invalid login')) return 'Погрешен email или лозинка.';
    if (error.includes('Email not confirmed')) return 'Мора прво да го потврдите вашиот email.';
    if (error.includes('already registered')) return 'Овој email е веќе регистриран.';
    if (error.includes('Password')) return 'Лозинката мора да има најмалку 6 карактери.';
    return error;
}
