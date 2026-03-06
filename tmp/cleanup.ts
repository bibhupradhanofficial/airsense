import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanup() {
    console.log('--- Cleaning Up and Refreshing Invitations ---');

    // Get all auth users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error('Error listing users:', listError.message);
        return;
    }

    // Deleting users
    for (const user of users) {
        if (user.email === 'bibhasindhup2@gmail.com' || user.email === 'bibhasindhup@gmail.com') {
            const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
            if (delError) console.error(`Error deleting user ${user.email}:`, delError.message);
            else console.log(`Deleted user ${user.email}`);
        }
    }

    // Reset Invitations
    const { error: resetError } = await supabase
        .from('admin_invitations')
        .update({
            used_by: null,
            used_at: null
        })
        .in('invite_code', ['CENTRAL_ADMIN', 'DELHI_ADMIN_2024', 'MUMBAI_ADMIN_2024']);

    if (resetError) console.error('Error resetting invitations:', resetError.message);
    else console.log('Invitations reset successfully');
}

cleanup();
