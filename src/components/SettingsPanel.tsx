"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { createClient } from '@/lib/supabase';
import { UserPlus, Trash2, ShieldCheck, UserCheck, Mail, AlertCircle, CheckCircle, Loader2, Send } from 'lucide-react';

interface UserRole {
    id: string;
    user_id: string;
    email: string;
    role: 'admin' | 'employee';
    display_name: string | null;
    created_at: string;
}

export default function SettingsPanel() {
    const { user, role } = useAuth();
    const [users, setUsers] = useState<UserRole[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [newDisplayName, setNewDisplayName] = useState('');
    const [loading, setLoading] = useState(true);
    const [inviting, setInviting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const supabase = createClient();

    useEffect(() => {
        if (role !== 'admin') return;

        const fetchUsers = async () => {
            const { data, error } = await supabase
                .from('user_roles')
                .select('*')
                .order('created_at', { ascending: true });

            if (data && !error) {
                setUsers(data as UserRole[]);
            }
            setLoading(false);
        };

        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [role]);

    // Only admins should access this — AFTER all hooks
    if (role !== 'admin') return null;

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('user_roles')
            .select('*')
            .order('created_at', { ascending: true });

        if (data && !error) {
            setUsers(data as UserRole[]);
        }
        setLoading(false);
    };

    const inviteEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (!newEmail.trim()) return;

        setInviting(true);

        try {
            // Get current session token
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setMessage({ type: 'error', text: 'Сесијата е истечена. Најавете се повторно.' });
                setInviting(false);
                return;
            }

            const res = await fetch('/api/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    email: newEmail.trim().toLowerCase(),
                    displayName: newDisplayName.trim() || undefined,
                    role: 'employee',
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || 'Грешка при покана.' });
            } else {
                setMessage({ type: 'success', text: data.message });
                setNewEmail('');
                setNewDisplayName('');
                fetchUsers();
            }
        } catch {
            setMessage({ type: 'error', text: 'Грешка при комуникација со серверот.' });
        }

        setInviting(false);
    };

    const removeUser = async (userId: string, email: string) => {
        if (email === user?.email) {
            setMessage({ type: 'error', text: 'Не можете да се избришете себеси!' });
            return;
        }

        if (!confirm(`Дали сте сигурни дека сакате да го отстраните ${email}?`)) return;

        const { error } = await supabase
            .from('user_roles')
            .delete()
            .eq('id', userId);

        if (!error) {
            setMessage({ type: 'success', text: `${email} е отстранет.` });
            fetchUsers();
        }
    };

    const toggleRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'employee' : 'admin';
        const { error } = await supabase
            .from('user_roles')
            .update({ role: newRole })
            .eq('id', userId);

        if (!error) {
            fetchUsers();
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Add Employee Form */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Покани вработен</h3>
                <p className="text-sm text-gray-500 mb-4">
                    Внесете го email-от на новиот вработен. Тие ќе добијат покана на email за да ја постават лозинката.
                </p>

                {message && (
                    <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {message.type === 'success' ? <CheckCircle size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
                        {message.text}
                    </div>
                )}

                <form onSubmit={inviteEmployee} className="space-y-3">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="vraboten@email.com"
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-jumbo-blue text-sm"
                            />
                        </div>
                        <input
                            type="text"
                            value={newDisplayName}
                            onChange={(e) => setNewDisplayName(e.target.value)}
                            placeholder="Име (опционо)"
                            className="w-36 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-jumbo-blue text-sm"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={inviting}
                        className="flex items-center gap-2 bg-jumbo-blue hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                        {inviting ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Send size={16} />
                        )}
                        {inviting ? 'Се испраќа...' : 'Испрати покана'}
                    </button>
                </form>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Корисници</h3>
                    <p className="text-sm text-gray-500 mt-1">Управувајте со пристапот на вашиот тим.</p>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-400">
                        <div className="w-8 h-8 border-2 border-jumbo-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        Се вчитува...
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        Нема регистрирани корисници.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {users.map(u => (
                            <div key={u.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${u.role === 'admin' ? 'bg-jumbo-blue-light text-jumbo-blue' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {(u.display_name || u.email).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm">{u.display_name || u.email}</div>
                                        <div className="text-xs text-gray-400">{u.email}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Role Badge */}
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === 'admin'
                                        ? 'bg-jumbo-blue-light text-jumbo-blue'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {u.role === 'admin' ? <ShieldCheck size={12} /> : <UserCheck size={12} />}
                                        {u.role === 'admin' ? 'Админ' : 'Вработен'}
                                    </span>

                                    {/* Actions (don't allow self-modification) */}
                                    {u.email !== user?.email && (
                                        <>
                                            <button
                                                onClick={() => toggleRole(u.id, u.role)}
                                                className="p-2 text-gray-400 hover:text-jumbo-blue hover:bg-jumbo-blue-light rounded-lg transition-colors"
                                                title={u.role === 'admin' ? 'Промени на Вработен' : 'Промени на Админ'}
                                            >
                                                <ShieldCheck size={14} />
                                            </button>
                                            <button
                                                onClick={() => removeUser(u.id, u.email)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Отстрани"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}

                                    {u.email === user?.email && (
                                        <span className="text-xs text-gray-400 italic">Вие</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="bg-jumbo-blue-light border border-blue-200 rounded-xl p-4 text-sm text-jumbo-blue">
                <p className="font-medium mb-1">💡 Како работи?</p>
                <ul className="text-blue-700 space-y-1 ml-5 list-disc">
                    <li><strong>Админ</strong> — Целосен пристап: залиха, продажба, аналитика, поставки.</li>
                    <li><strong>Вработен</strong> — Залиха, додавање артикли, продажба (POS), управување со нарачки.</li>
                    <li>Поканетиот вработен добива email за да ја постави лозинката.</li>
                </ul>
            </div>
        </div>
    );
}
