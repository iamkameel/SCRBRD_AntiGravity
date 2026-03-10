import { personService } from "@/services/personService";
import PeopleClient from "@/components/people/PeopleClient";

export const dynamic = 'force-dynamic';

export default async function PeopleDirectoryPage() {
  // Fetch all people from Data Connect (V4)
  const people = await personService.getAll();

  // For now, hardcode as Admin for full access
  const userRole = 'Admin';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-6">
      <PeopleClient initialPeople={people as any[]} userRole={userRole} />
    </div>
  );
}
