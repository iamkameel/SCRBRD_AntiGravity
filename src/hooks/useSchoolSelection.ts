'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { queryDocsLenient } from '@/lib/services/firestoreQuery';
import type { School } from '@/types/firestore';

export const DEMO_SCHOOL_ID = 'demo-school';
export type SchoolOption = Pick<School, 'id' | 'name' | 'contactEmail'>;

/**
 * Resolves which school a dashboard should show:
 *   dashboard filter → user's email domain vs school contactEmail → first school → demo.
 * Selecting a school writes it back to the dashboard filter so other pages follow.
 */
export function useSchoolSelection() {
    const { user } = useAuth();
    const { filters, setFilters } = useDashboard();
    const [schools, setSchools] = useState<SchoolOption[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [schoolId, setSchoolIdState] = useState<string | null>(null);

    useEffect(() => {
        let off = false;
        queryDocsLenient<School>('schools')
            .then(list => { if (!off) setSchools(list.map(s => ({ id: s.id, name: s.name, contactEmail: s.contactEmail })).sort((a, b) => (a.name || '').localeCompare(b.name || ''))); })
            .finally(() => { if (!off) setLoaded(true); });
        return () => { off = true; };
    }, []);

    useEffect(() => {
        if (!loaded || schoolId) return;
        if (filters.schoolId && filters.schoolId !== 'all' && schools.some(s => s.id === filters.schoolId)) { setSchoolIdState(filters.schoolId); return; }
        const domain = user?.email?.split('@')[1]?.toLowerCase();
        const byDomain = domain ? schools.find(s => s.contactEmail?.split('@')[1]?.toLowerCase() === domain) : undefined;
        setSchoolIdState(byDomain?.id ?? schools[0]?.id ?? DEMO_SCHOOL_ID);
    }, [loaded, schools, filters.schoolId, user?.email, schoolId]);

    const setSchoolId = (id: string) => {
        setSchoolIdState(id);
        if (id !== DEMO_SCHOOL_ID) setFilters({ schoolId: id });
    };

    const school = schools.find(s => s.id === schoolId) ?? null;
    return { schools, schoolId, school, setSchoolId, isDemo: schoolId === DEMO_SCHOOL_ID, loaded };
}
