import { UserProfile } from "./index";

export type AdminContext =
    | { type: 'central_admin'; cityFilter: null }
    | { type: 'city_admin'; cityFilter: { id: string; name: string } };

export function getAdminContext(profile: UserProfile): AdminContext | null {
    if (profile.admin_type === 'central_admin') {
        return { type: 'central_admin', cityFilter: null };
    }
    if (profile.admin_type === 'city_admin' && (profile.assigned_city_id || profile.assigned_city_name)) {
        return {
            type: 'city_admin',
            cityFilter: {
                id: profile.assigned_city_id || 'manual',
                name: profile.assigned_city_name || 'Unknown City'
            }
        };
    }

    return null; // not an admin
}
