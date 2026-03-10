"use client";

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Person } from '@/types/firestore';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Plus, Loader2, Mail, Phone } from "lucide-react";
import { USER_ROLES } from "@/lib/roles";

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoaches = async () => {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, 'people'),
          where('role', 'in', [USER_ROLES.COACH, USER_ROLES.ASSISTANT_COACH])
        );
        const querySnapshot = await getDocs(q);
        const data: Person[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Person));
        setCoaches(data);
      } catch (error) {
        console.error('Error fetching coaches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoaches();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Coaches</h1>
          <p className="text-muted-foreground mt-2">Manage and view coaching staff</p>
        </div>
        <Link href="/coaches/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Coach
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No coaches found. Add your first coach!
          </div>
        ) : (
          coaches.map(coach => (
            <Link key={coach.id} href={`/coaches/${coach.id}`} className="block">
              <Card className="p-6 hover:border-primary transition-colors cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <Image
                      src={coach.profileImageUrl || `https://ui-avatars.com/api/?name=${coach.firstName}+${coach.lastName}&background=0ea5e9&color=fff`}
                      alt={`${coach.firstName} ${coach.lastName}`}
                      fill
                      className="rounded-full object-cover border-2 border-primary/20"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {coach.firstName} {coach.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {coach.title || 'Coach'}
                    </p>
                    {coach.specializations && coach.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {coach.specializations.slice(0, 2).map((spec, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t space-y-2">
                  {coach.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{coach.email}</span>
                    </div>
                  )}
                  {coach.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{coach.phone}</span>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
