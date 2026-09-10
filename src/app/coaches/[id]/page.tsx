import { redirect } from 'next/navigation';
import { fetchPersonById } from "@/lib/firestore";

export default async function CoachProfilePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  if (!id) {
    redirect('/people');
  }

  const person = await fetchPersonById(id);
  
  if (!person) {
    redirect('/people');
  }
  
  // Verify this person is actually a coach
  const isCoach = person.role?.toLowerCase().includes('coach');
  
  if (!isCoach) {
    // Not a coach, redirect to generic people page
    redirect(`/people/${id}`);
  }
  
  // Redirect to the person profile page with coach context
  redirect(`/people/${id}`);
}
