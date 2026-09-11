import { D } from '@/lib/design-system';

export const SHOT_CATEGORIES = [
    {
        cat: 'Attacking', color: D.amber, shots: [
            { id: 'drive', label: 'Drive' }, { id: 'pull', label: 'Pull' }, { id: 'hook', label: 'Hook' },
            { id: 'cut', label: 'Cut' }, { id: 'sweep', label: 'Sweep' }, { id: 'ramp', label: 'Ramp/Scoop' },
            { id: 'flick', label: 'Flick' }, { id: 'glance', label: 'Glance' }, { id: 'loft', label: 'Lofted Drive' },
            { id: 'slog', label: 'Slog' },
        ]
    },
    {
        cat: 'Defensive', color: D.sky, shots: [
            { id: 'fwd_def', label: 'Forward Def' }, { id: 'back_def', label: 'Back Def' }, { id: 'padded', label: 'Padded Away' },
        ]
    },
    {
        cat: 'Edge / Contact', color: D.violet, shots: [
            { id: 'inside_edge', label: 'Inside Edge' }, { id: 'outside_edge', label: 'Outside Edge' },
            { id: 'top_edge', label: 'Top Edge' }, { id: 'leading_edge', label: 'Leading Edge' },
            { id: 'missed', label: 'Missed / Beat' }, { id: 'leave', label: 'Leave (deliberate)' },
            { id: 'hit_body', label: 'Hit Body' }, { id: 'hit_glove', label: 'Hit Glove' },
        ]
    },
    {
        cat: 'Unusual', color: D.orange, shots: [
            { id: 'reverse_sweep', label: 'Reverse Sweep' }, { id: 'switch_hit', label: 'Switch Hit' },
            { id: 'paddle', label: 'Paddle' }, { id: 'lap', label: 'Lap' },
        ]
    },
];
