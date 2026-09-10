/**
 * Calculates age from date of birth.
 * Handles string, Date, or Firestore Timestamp.
 */
export function calculateAge(dob: string | Date | any | null | undefined): number {
    if (!dob) return 0;

    let birthDate: Date;

    if (dob instanceof Date) {
        birthDate = dob;
    } else if (typeof dob === 'string') {
        birthDate = new Date(dob);
    } else if (dob && typeof dob.toDate === 'function') {
        // Firestore Timestamp
        birthDate = dob.toDate();
    } else if (dob && dob.seconds) {
        // Plain object timestamp
        birthDate = new Date(dob.seconds * 1000);
    } else {
        return 0;
    }

    if (isNaN(birthDate.getTime())) return 0;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}
