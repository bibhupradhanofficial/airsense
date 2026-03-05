import { UserProfile } from "./index";

export type AdminContext =
    | { type: 'super_admin'; cityFilter: null }
    | { type: 'city_admin'; cityFilter: { id: string; name: string } };

export function getAdminContext(profile: UserProfile): AdminContext | null {
    if (profile.admin_type === 'super_admin') {
        return { type: 'super_admin', cityFilter: null };
    }
    if (profile.admin_type === 'city_admin' && profile.assigned_city_id) {
        return {
            type: 'city_admin',
            cityFilter: {
                id: profile.assigned_city_id,
                name: profile.assigned_city_name!
            }
        };
    }
    return null; // not an admin
}
