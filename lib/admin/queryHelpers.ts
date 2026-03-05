import { AdminContext } from '@/types/admin';

/**
 * Applies city-level filtering to Supabase queries.
 * For city admins, always filters by their assigned city.
 * For super admins, filters by the selected city if one is chosen.
 */
export function applyCityFilter(
    query: any,
    adminContext: AdminContext,
    selectedCityId?: string | null
) {
    if (adminContext.type === 'city_admin') {
        // City admins are locked to their assigned city name
        // We join with locations to filter by the city field
        return query
            .select('*, locations!inner(city, id)')
            .eq('locations.city', adminContext.cityFilter.name);
    }

    if (adminContext.type === 'super_admin' && selectedCityId) {
        // For super admins, we filter by the selected city name (e.g., 'New Delhi', 'Mumbai')
        // The selectedCityId here should correspond to the city name in the locations table
        return query
            .select('*, locations!inner(city, id)')
            .eq('locations.city', selectedCityId);
    }

    // Super admin with "All Cities" selected - return as is (no filter)
    return query;
}
