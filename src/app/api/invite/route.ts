import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        // Verify the request has auth
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { email, displayName, role, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email и лозинка се задолжителни.' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Лозинката мора да има најмалку 6 карактери.' }, { status: 400 });
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

        // Create the user in Supabase Auth with password set by admin
        const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email.toLowerCase(),
            password,
            email_confirm: true,
            user_metadata: { display_name: displayName || email.split('@')[0] },
        });

        if (createError) {
            if (createError.message.includes('already been registered') || createError.message.includes('already exists')) {
                return NextResponse.json({ error: 'Овој email е веќе регистриран во системот.' }, { status: 400 });
            }
            return NextResponse.json({ error: 'Грешка при креирање: ' + createError.message }, { status: 500 });
        }

        // Add user_roles entry
        if (createData.user) {
            const { error: roleError } = await supabaseAdmin
                .from('user_roles')
                .insert({
                    user_id: createData.user.id,
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
            message: `Вработениот ${displayName || email} е успешно креиран. Дајте му ја лозинката за да се најави.`
        });

    } catch (err) {
        console.error('Invite error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
