import { fetchCollection } from '@/lib/firestore';
import { School } from '@/types/firestore';

export interface SchoolDomainResolution {
    schoolId: string;
    schoolName: string;
    matchedBy: 'domain_map' | 'contact_email' | 'name_match';
}

/**
 * Pre-configured institutional domain mapping table
 * Maps email domain suffixes to canonical school IDs / names in SCRBRD OS
 */
export const DOMAIN_SCHOOL_MAP: Record<string, { schoolId: string; schoolName: string }> = {
    'wbhs.co.za': { schoolId: 'school_wbhs', schoolName: "Westville Boys' High School" },
    'westvilleboys.co.za': { schoolId: 'school_wbhs', schoolName: "Westville Boys' High School" },
    'kearsney.com': { schoolId: 'school_kearsney', schoolName: 'Kearsney College' },
    'dchs.co.za': { schoolId: 'school_dhs', schoolName: 'Durban High School' },
    'durbanhighschool.co.za': { schoolId: 'school_dhs', schoolName: 'Durban High School' },
    'stithian.com': { schoolId: 'school_st_stithians', schoolName: 'St Stithians College' },
    'hiltoncollege.com': { schoolId: 'school_hilton', schoolName: 'Hilton College' },
    'maritzburgcollege.co.za': { schoolId: 'school_maritzburg', schoolName: 'Maritzburg College' },
    'bishops.org.za': { schoolId: 'school_bishops', schoolName: 'Bishops Diocesan College' },
    'sacs.org.za': { schoolId: 'school_sacs', schoolName: 'SACS' },
    'michaelhouse.org': { schoolId: 'school_michaelhouse', schoolName: 'Michaelhouse' },
    'jeppeboys.co.za': { schoolId: 'school_jeppe', schoolName: "Jeppe High School for Boys" },
    'kes.co.za': { schoolId: 'school_kes', schoolName: 'King Edward VII School' },
    'stjohnscollege.co.za': { schoolId: 'school_st_johns', schoolName: "St John's College" },
    'affies.co.za': { schoolId: 'school_affies', schoolName: 'Afrikaanse Hoër Seunskool' },
    'paarlgim.co.za': { schoolId: 'school_paarl_gim', schoolName: 'Paarl Gimnasium' },
    'paarlboyshigh.org.za': { schoolId: 'school_paarl_boys', schoolName: 'Paarl Boys High' },
    'paulroos.co.za': { schoolId: 'school_paul_roos', schoolName: 'Paul Roos Gimnasium' },
    'greyhighschool.com': { schoolId: 'school_grey_pe', schoolName: 'Grey High School' },
    'greycollege.com': { schoolId: 'school_grey_bloem', schoolName: 'Grey College' },
};

/**
 * Automatically resolves institutional affiliation from a user's email address
 */
export async function resolveSchoolByEmail(email: string): Promise<SchoolDomainResolution | null> {
    if (!email || !email.includes('@')) return null;

    const domain = email.split('@')[1].toLowerCase().trim();

    // 1. Direct lookup in pre-configured domain dictionary
    if (DOMAIN_SCHOOL_MAP[domain]) {
        return {
            schoolId: DOMAIN_SCHOOL_MAP[domain].schoolId,
            schoolName: DOMAIN_SCHOOL_MAP[domain].schoolName,
            matchedBy: 'domain_map',
        };
    }

    // 2. Dynamic lookup via Firestore schools collection
    try {
        const admin = (await import('@/lib/firebase-admin')).default;
        const db = admin.firestore();

        // Query by contactEmail domain
        const schoolsSnapshot = await db.collection('schools').get();
        if (!schoolsSnapshot.empty) {
            for (const doc of schoolsSnapshot.docs) {
                const data = doc.data() as School;
                if (data.contactEmail && data.contactEmail.toLowerCase().endsWith(`@${domain}`)) {
                    return {
                        schoolId: doc.id,
                        schoolName: data.name,
                        matchedBy: 'contact_email',
                    };
                }
            }

            // Check domain prefix matching school name/abbreviation
            const domainPrefix = domain.split('.')[0]; // e.g. "wbhs" from "wbhs.co.za"
            if (domainPrefix.length > 2) {
                for (const doc of schoolsSnapshot.docs) {
                    const data = doc.data() as School;
                    const nameLower = (data.name || '').toLowerCase();
                    const abbrevLower = (data.abbreviation || '').toLowerCase();
                    if (abbrevLower === domainPrefix || nameLower.replace(/[^a-z]/g, '').includes(domainPrefix)) {
                        return {
                            schoolId: doc.id,
                            schoolName: data.name,
                            matchedBy: 'name_match',
                        };
                    }
                }
            }
        }
    } catch (error) {
        console.error('[SchoolDomainService] Error in dynamic school resolution:', error);
    }

    return null;
}
