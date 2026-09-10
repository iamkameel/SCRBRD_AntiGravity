import { fetchPersonById, fetchSchools } from "@/lib/firestore";
import { PlayerForm } from "@/components/players/PlayerForm";
import { updatePlayerAction } from "@/app/actions/playerActions";
import { updateCoachAction, CoachActionState } from "@/app/actions/coachActions";
import { updateUmpireAction } from "@/app/actions/umpireActions";
import { updateScorerAction } from "@/app/actions/scorerActions";
import { updateMedicalPersonAction } from "@/app/actions/medicalActions";
import { updateGroundskeeperAction } from "@/app/actions/groundskeeperActions";
import { notFound } from "next/navigation";
import { PlayerActionState } from "@/app/actions/playerActions";
import { CoachForm } from "@/components/coaches/CoachForm";
import { UmpireForm } from "@/components/umpires/UmpireForm";
import { ScorerForm } from "@/components/scorers/ScorerForm";
import { MedicalForm } from "@/components/medical/MedicalForm";
import { GroundskeeperForm } from "@/components/groundskeepers/GroundskeeperForm";
import { USER_ROLES } from "@/lib/roles";

export default async function EditPersonPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const [person, schools] = await Promise.all([
    fetchPersonById(id),
    fetchSchools()
  ]);

  if (!person) {
    notFound();
  }

  // Create a wrapper action that matches the expected signature
  async function handleUpdate(prevState: PlayerActionState, formData: FormData): Promise<PlayerActionState> {
    'use server';
    return updatePlayerAction(id, prevState, formData);
  }

  // Initial state for the form
  const initialState: PlayerActionState = {
    success: false,
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Person</h1>
        <p className="text-muted-foreground">
          Update information for {person.firstName} {person.lastName}
        </p>
      </div>
      
      
      {(person.role === USER_ROLES.COACH || person.role === USER_ROLES.ASSISTANT_COACH) ? (
        <CoachForm 
          mode="edit" 
          coachAction={async (prevState, formData) => {
            'use server';
            return updateCoachAction(id, prevState, formData);
          }} 
          initialState={{ success: false }}
          initialData={person as any}
          schools={schools}
        />
      ) : person.role === USER_ROLES.UMPIRE ? (
        <UmpireForm
          mode="edit"
          umpireAction={async (prevState, formData) => {
            'use server';
            return updateUmpireAction(id, prevState, formData);
          }}
          initialState={{ success: false }}
          initialData={person as any}
        />
      ) : person.role === USER_ROLES.SCORER ? (
        <ScorerForm
          mode="edit"
          scorerAction={async (prevState, formData) => {
            'use server';
            return updateScorerAction(id, prevState, formData);
          }}
          initialState={{ success: false }}
          initialData={person as any}
        />
      ) : (person.role === USER_ROLES.DOCTOR || 
           person.role === USER_ROLES.PHYSIOTHERAPIST || 
           person.role === USER_ROLES.TRAINER || 
           person.role === USER_ROLES.FIRST_AID) ? (
        <MedicalForm
          mode="edit"
          medicalAction={async (prevState, formData) => {
            'use server';
            return updateMedicalPersonAction(id, prevState, formData);
          }}
          initialState={{ success: false }}
          initialData={person as any}
        />
      ) : person.role === USER_ROLES.GROUNDS_KEEPER ? (
        <GroundskeeperForm
          mode="edit"
          groundskeeperAction={async (prevState, formData) => {
            'use server';
            return updateGroundskeeperAction(id, prevState, formData);
          }}
          initialState={{ success: false }}
          initialData={person as any}
        />
      ) : (
        <PlayerForm 
          mode="edit" 
          playerAction={handleUpdate} 
          initialState={initialState}
          initialData={person as any}
          schools={schools}
        />
      )}
    </div>
  );
}
