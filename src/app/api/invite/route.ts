import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        // Verify the request has auth
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { email, displayName, role } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!serviceRoleKey) {
            return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 });
        }

        // Create admin client with service role key
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

        // Verify the calling user is an admin
        const token = authHeader.replace('Bearer ', '');
        const { data: { user: callingUser } } = await supabaseAdmin.auth.getUser(token);
        if (!callingUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: callerRole } = await supabaseAdmin
            .from('user_roles')
            .select('role')
            .eq('user_id', callingUser.id)
            .single();

        if (!callerRole || callerRole.role !== 'admin') {
            return NextResponse.json({ error: 'Only admins can invite users' }, { status: 403 });
        }

        // Check if user already exists in user_roles
        const { data: existingRole } = await supabaseAdmin
            .from('user_roles')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (existingRole) {
            return NextResponse.json({ error: 'Овој email е веќе регистриран.' }, { status: 400 });
        }

        // Create the user in Supabase Auth using admin API
        // This sends them a magic link / invite email automatically
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: { display_name: displayName || email.split('@')[0] },
            redirectTo: `${req.nextUrl.origin}/admin`,
        });

        if (inviteError) {
            // If user already exists in auth but not in roles, just add the role
            if (inviteError.message.includes('already been registered') || inviteError.message.includes('already exists')) {
                // Get the existing auth user
                const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
                const existingAuthUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

                if (existingAuthUser) {
                    const { error: roleError } = await supabaseAdmin
                        .from('user_roles')
                        .insert({
                            user_id: existingAuthUser.id,
                            email: email.toLowerCase(),
                            role: role || 'employee',
                            display_name: displayName || email.split('@')[0],
                        });

                    if (roleError) {
                        return NextResponse.json({ error: 'Грешка при додавање на улога: ' + roleError.message }, { status: 500 });
                    }

                    return NextResponse.json({
                        success: true,
                        message: `${email} е додаден како ${role || 'employee'}. Корисникот веќе има сметка.`,
                        alreadyExisted: true
                    });
                }
            }

            return NextResponse.json({ error: 'Грешка при покана: ' + inviteError.message }, { status: 500 });
        }

        // Add user_roles entry with the new user's ID
        if (inviteData.user) {
            const { error: roleError } = await supabaseAdmin
                .from('user_roles')
                .insert({
                    user_id: inviteData.user.id,
                    email: email.toLowerCase(),
                    role: role || 'employee',
                    display_name: displayName || email.split('@')[0],
                });

            if (roleError) {
                console.error('Role insert error:', roleError);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Покана е испратена на ${email}. Тие ќе добијат email за да ја постават својата лозинка.`
        });

    } catch (err) {
        console.error('Invite error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
