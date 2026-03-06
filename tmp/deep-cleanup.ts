import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deepCleanup() {
    console.log('--- Deep Cleanup ---');

    // Deleting all profiles
    const { error: profDelError } = await supabase.from('user_profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (profDelError) console.error('Error deleting profiles:', profDelError.message);
    else console.log('All profiles deleted');

    // Deleting invitations and re-seeding
    await supabase.from('admin_invitations').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const invites = [
        {
            invite_code: 'CENTRAL_ADMIN',
            admin_type: 'central_admin',
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        }
    ];
    await supabase.from('admin_invitations').insert(invites);
    console.log('CENTRAL_ADMIN invitation re-seeded');

    // Try deleting auth user again
    const { data: { users } } = await supabase.auth.admin.listUsers();
    for (const user of users) {
        if (user.email === 'bibhasindhup2@gmail.com' || user.email === 'bibhasindhup@gmail.com') {
            await supabase.auth.admin.deleteUser(user.id);
            console.log(`Deleted auth user ${user.email}`);
        }
    }
}

deepCleanup();
