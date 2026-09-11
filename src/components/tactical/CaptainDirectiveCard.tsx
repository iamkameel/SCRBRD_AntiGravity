'use client';

/**
 * The captain-facing directive card — spec §8/§9: glance, understand,
 * respond, return to match. Deliberately not a shrunk-down Coach Cockpit.
 *
 * Feedback here uses Sonner's `toast` directly rather than the shadcn
 * useToast()/<Toaster/> pair — that pair's <Toaster/> isn't mounted anywhere
 * in this app today (see the scoreboard audit), so anything built against it
 * would silently fail exactly like scoring-dialog.tsx and undo-dialog.tsx do.
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DirectiveStatusBadge } from './DirectiveStatusBadge';
import { respondToDirectiveAction } from '@/app/actions/tacticalDirectiveActions';
import type { TacticalDirective, ResponseType } from '@/types/tacticalDirectives';
import { DISMISS_REASONS, MODIFY_REASONS } from '@/types/tacticalDirectives';
import { Zap, Target, Users2 } from 'lucide-react';

interface CaptainDirectiveCardProps {
  directive: TacticalDirective;
  matchId: string;
  personId: string;
}

type Mode = 'idle' | 'modify' | 'dismiss';

export function CaptainDirectiveCard({ directive, matchId, personId }: CaptainDirectiveCardProps) {
  const [mode, setMode] = useState<Mode>('idle');
  const [reason, setReason] = useState<string>('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const alreadyResponded = ['ACCEPTED', 'MODIFIED', 'DISMISSED'].includes(directive.status);

  async function submit(responseType: ResponseType, submittedReason?: string) {
    setSubmitting(true);
    const clientEventId = `${directive.id}-${responseType}-${Date.now()}`;
    const result = await respondToDirectiveAction({
      matchId,
      directiveId: directive.id,
      directiveVersion: directive.version,
      responseType,
      reason: submittedReason,
      modification: responseType === 'MODIFIED' && note ? { note } : undefined,
      respondedByPersonId: personId,
      clientEventId,
    });
    setSubmitting(false);
    setMode('idle');
    setReason('');
    setNote('');

    if (!result.success) {
      if (result.error === 'STALE_VERSION') {
        toast.error('Directive updated', {
          description: 'The coach changed this instruction before your response went through — check the latest version.',
        });
      } else {
        toast.error('Response not sent', { description: result.error });
      }
      return;
    }

    toast.success(
      responseType === 'ACCEPTED' ? 'Accepted' : responseType === 'MODIFIED' ? 'Modification sent' : 'Dismissed',
      { description: directive.title }
    );
  }

  return (
    <Card className="border-2 border-indigo-500/30 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-indigo-500" aria-hidden="true" />
            Coach Directive
          </CardTitle>
          <DirectiveStatusBadge status={directive.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-lg font-semibold leading-snug">{directive.title}</p>
          {directive.instruction && <p className="mt-1 text-sm text-muted-foreground">{directive.instruction}</p>}
        </div>

        {directive.target?.batterName && (
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <span className="text-muted-foreground">Target:</span>
            <span className="font-medium">{directive.target.batterName}</span>
          </div>
        )}

        {directive.bowlingPlan && (
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bowling</p>
            <p className="mt-0.5 font-mono">
              {directive.bowlingPlan.line.replace(/_/g, ' ')} · {directive.bowlingPlan.length.replace(/_/g, ' ')}
            </p>
          </div>
        )}

        {directive.fieldPlan && directive.fieldPlan.fieldChanges.length > 0 && (
          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Users2 className="h-3 w-3" aria-hidden="true" /> Field changes
            </p>
            <ul className="mt-1 space-y-0.5">
              {directive.fieldPlan.fieldChanges.map((c, i) => (
                <li key={i}>
                  {c.playerName ?? 'Player'}: <span className="text-muted-foreground">{c.fromPosition}</span> → {c.toPosition}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Scope: {directive.scope.replace(/_/g, ' ').toLowerCase()}
          {directive.expiresAt ? ` · expires ${new Date(directive.expiresAt).toLocaleTimeString()}` : ''}
        </p>

        {alreadyResponded ? (
          <p className="text-sm text-muted-foreground">
            You already responded to this directive
            {directive.latestResponse ? ` (${directive.latestResponse.type.toLowerCase()})` : ''}.
          </p>
        ) : mode === 'idle' ? (
          <div className="flex gap-2">
            <Button className="flex-1" disabled={submitting} onClick={() => submit('ACCEPTED')}>
              Accept
            </Button>
            <Button variant="outline" disabled={submitting} onClick={() => setMode('modify')}>
              Modify
            </Button>
            <Button variant="destructive" disabled={submitting} onClick={() => setMode('dismiss')}>
              Dismiss
            </Button>
          </div>
        ) : mode === 'modify' ? (
          <div className="space-y-3 rounded-lg border p-3">
            <p className="text-sm font-medium">What changed, and why?</p>
            <div className="flex flex-wrap gap-1.5">
              {MODIFY_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    reason === r ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600' : 'border-border text-muted-foreground'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <Textarea
              placeholder="e.g. Keeping fine leg in, bowling normal length instead of short"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setMode('idle')} disabled={submitting}>
                Back
              </Button>
              <Button className="flex-1" disabled={submitting || !note.trim()} onClick={() => submit('MODIFIED', reason || undefined)}>
                Send Modification
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 rounded-lg border p-3">
            <p className="text-sm font-medium">Reason for dismissing</p>
            <div className="flex flex-wrap gap-1.5">
              {DISMISS_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    reason === r ? 'border-rose-500 bg-rose-500/10 text-rose-600' : 'border-border text-muted-foreground'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setMode('idle')} disabled={submitting}>
                Back
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={submitting || !reason}
                onClick={() => submit('DISMISSED', reason)}
              >
                Confirm Dismiss
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
