"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
    user: User | null;
    role: 'admin' | 'employee' | null;
    status: 'active' | 'inactive' | null;
    displayName: string | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signUp: (email: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
    user: null,
    role: null,
    status: null,
    displayName: null,
    loading: true,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'admin' | 'employee' | null>(null);
    const [status, setStatus] = useState<'active' | 'inactive' | null>(null);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    // Fetch the user's role from the user_roles table
    const fetchRole = async (userId: string, userEmail: string) => {
        const { data } = await supabase
            .from('user_roles')
            .select('role, display_name, status')
            .eq('user_id', userId)
            .single();

        if (data) {
            // **New:** Check if the user is explicitly inactivated.
            if (data.status === 'inactive') {
                console.warn('User account is inactive. Logging out.');
                await supabase.auth.signOut();
                setUser(null);
                setRole(null);
                setStatus('inactive');
                setDisplayName(null);
                setLoading(false);
                return;
            }

            setRole(data.role as 'admin' | 'employee');
            setStatus(data.status as 'active' | 'inactive');
            setDisplayName(data.display_name || userEmail);
        } else {
            // First user becomes admin, others default to employee
            const { count } = await supabase
                .from('user_roles')
                .select('*', { count: 'exact', head: true });

            const assignedRole = (count === 0 || count === null) ? 'admin' : 'employee';

            await supabase.from('user_roles').insert({
                user_id: userId,
                email: userEmail,
                role: assignedRole,
                status: 'active',
                display_name: userEmail.split('@')[0],
            });

            setRole(assignedRole);
            setStatus('active');
            setDisplayName(userEmail.split('@')[0]);
        }
    };

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
                fetchRole(session.user.id, session.user.email || '');
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser(session.user);
                fetchRole(session.user.id, session.user.email || '');
            } else {
                setUser(null);
                setRole(null);
                setStatus(null);
                setDisplayName(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message || null };
    };

    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password });
        return { error: error?.message || null };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);
        setStatus(null);
        setDisplayName(null);
    };

    return (
        <AuthContext.Provider value={{ user, role, status, displayName, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
