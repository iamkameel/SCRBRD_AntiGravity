/* Scoring hub design tokens, shared types and static option lists. */

export type ExtraType = 'wide' | 'noball' | 'bye' | 'legbye' | null;
export type WicketMode = 'bowled' | 'caught' | 'lbw' | 'stumped' | 'run_out' | 'hit_wicket' | null;
export type ShotTypeChoice = string | null;
export type ScorerMode = 'quick' | 'standard' | 'full';
export type ContactQuality = 'middled' | 'edged' | 'missed' | 'lofted' | 'defended' | null;
export type ActiveTab = 'score' | 'cards' | 'analysis' | 'history';
export type AnalysisSubTab = 'charts' | 'players' | 'signals' | 'intel';

export const D = {
  base:'#05080f', surf0:'#080c16', surf1:'#0c1220', surf2:'#101829', surf3:'#141e32',
  glass:'rgba(10,14,28,0.75)',
  grad:'linear-gradient(135deg,#4f46e5,#0ea5e9)',
  gradLive:'linear-gradient(135deg,#10b981,#06b6d4)',
  indigo:'#4f46e5', sky:'#0ea5e9', emerald:'#10b981', amber:'#f59e0b',
  rose:'#f43f5e', orange:'#f97316', violet:'#7c3aed', cyan:'#06b6d4',
  textPrimary:'#f0f4ff', textSecondary:'#8892aa', textMuted:'#3d4d66',
  border:'rgba(255,255,255,0.07)', borderMed:'rgba(255,255,255,0.12)',
  sm:'8px', md:'12px', lg:'16px', xl:'20px', xxl:'24px', pill:'9999px',
  mono:"'DM Mono',monospace", head:"'Syne',sans-serif", body:"'DM Sans',sans-serif",
};

export const SHOT_CATEGORIES=[
  {cat:'Attacking',color:D.amber,shots:[
    {id:'drive',label:'Drive'},{id:'pull',label:'Pull'},{id:'hook',label:'Hook'},
    {id:'cut',label:'Cut'},{id:'sweep',label:'Sweep'},{id:'ramp',label:'Ramp/Scoop'},
    {id:'flick',label:'Flick'},{id:'glance',label:'Glance'},{id:'loft',label:'Lofted Drive'},
    {id:'slog',label:'Slog'},
  ]},
  {cat:'Defensive',color:D.sky,shots:[
    {id:'fwd_def',label:'Forward Def'},{id:'back_def',label:'Back Def'},{id:'padded',label:'Padded Away'},
  ]},
  {cat:'Edge / Contact',color:D.violet,shots:[
    {id:'inside_edge',label:'Inside Edge'},{id:'outside_edge',label:'Outside Edge'},
    {id:'top_edge',label:'Top Edge'},{id:'leading_edge',label:'Leading Edge'},
    {id:'missed',label:'Missed / Beat'},{id:'leave',label:'Leave (deliberate)'},
    {id:'hit_body',label:'Hit Body'},{id:'hit_glove',label:'Hit Glove'},
  ]},
  {cat:'Unusual',color:D.orange,shots:[
    {id:'reverse_sweep',label:'Reverse Sweep'},{id:'switch_hit',label:'Switch Hit'},
    {id:'paddle',label:'Paddle'},{id:'lap',label:'Lap'},
  ]},
];
