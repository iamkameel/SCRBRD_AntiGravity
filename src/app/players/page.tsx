import { getPlayers } from '@/services/playerService';
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { PlayersClient } from "@/components/players/PlayersClient";
import { D } from "@/lib/design-system";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Players | SCRBRD",
  description: "Manage player profiles, track stats, and view performance",
};

export default async function PlayersPage() {
  const players = await getPlayers();

  return (
    <div
      className="min-h-screen pb-16"
      style={{ background: D.bg }}
    >
      <div className="max-w-7xl mx-auto px-4 pt-10 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: D.lg,
                background: `${D.emerald}18`,
                border: `1px solid ${D.emerald}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users className="h-6 w-6" style={{ color: D.emerald }} />
            </div>
            <div>
              <h1
                style={{
                  fontFamily: D.head,
                  fontWeight: 800,
                  fontSize: "clamp(20px, 3.5vw, 30px)",
                  textTransform: "uppercase",
                  letterSpacing: "-0.02em",
                  color: D.textPrimary,
                  lineHeight: 1,
                }}
              >
                Players
              </h1>
              <p
                style={{
                  fontFamily: D.body,
                  fontSize: 13,
                  color: D.textSecondary,
                  marginTop: 4,
                }}
              >
                {players.length} registered · profiles, stats &amp; development
                records
              </p>
            </div>
          </div>

          <Link href="/players/add">
            <button
              className="press-btn inline-flex items-center gap-2 px-5 py-2.5 font-bold text-white transition-all"
              style={{
                background: D.gradMain,
                fontFamily: D.head,
                fontSize: 12,
                fontWeight: 700,
                borderRadius: D.pill,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              <Plus className="h-4 w-4" />
              Add Player
            </button>
          </Link>
        </div>

        <PlayersClient players={players} />
      </div>
    </div>
  );
}
