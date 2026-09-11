// Live Commentary Generator Utility

export interface CommentaryContext {
  runs: number;
  isWide?: boolean;
  isNoBall?: boolean;
  isDismissal?: boolean;
  dismissalType?: string;
  batsmanName?: string;
  bowlerName?: string;
  fielderName?: string;
  batsmanRuns?: number;
  bowlerWickets?: number;
  over?: number;
  ball?: number;
  shotZone?: string;
  shotRing?: string;
  shotType?: string;
  contactQuality?: string;
  phase?: 'POWERPLAY' | 'MIDDLE' | 'DEATH' | string;
  isPowerplay?: boolean;
  isDeathOver?: boolean;
}

const SHOT_ZONE_DESCRIPTIONS: Record<string, { phrase: string; boundaryPhrase: string }> = {
  COVER: { phrase: "through cover", boundaryPhrase: "races through cover to the fence" },
  POINT: { phrase: "past point", boundaryPhrase: "pierces the offside gap past point" },
  MID_OFF: { phrase: "over mid-off", boundaryPhrase: "drills it cleanly over mid-off" },
  MID_ON: { phrase: "towards mid-on", boundaryPhrase: "drives straight past mid-on" },
  LONG_OFF: { phrase: "down to long-off", boundaryPhrase: "lofts it high and deep over long-off" },
  LONG_ON: { phrase: "down to long-on", boundaryPhrase: "smashes it down to long-on" },
  MID_WICKET: { phrase: "towards mid-wicket", boundaryPhrase: "pulls powerfully through mid-wicket" },
  SQUARE_LEG: { phrase: "through square leg", boundaryPhrase: "whips it away through square leg to the boundary" },
  FINE_LEG: { phrase: "down to fine leg", boundaryPhrase: "glances fine, speeding to fine leg" },
  THIRD_MAN: { phrase: "steered to third man", boundaryPhrase: "cuts late and guides it past slip to third man" },
  STRAIGHT: { phrase: "straight down the ground", boundaryPhrase: "hammered straight back past the bowler" },
};

const boundaryTemplates = [
  "Magnificent shot! {batsman} {boundaryPhrase} for FOUR!",
  "FOUR! {batsman} leans into the {shotType} and {boundaryPhrase}!",
  "Beautifully timed by {batsman}! Finds the gap {phrase} for four runs!",
  "Brilliant stroke off {bowler}! {batsman} sends it {phrase} for a boundary!",
  "Cracking shot! {batsman} dispatches {bowler} {boundaryPhrase}!",
];

const sixTemplates = [
  "SIX! {batsman} launches {bowler} {phrase} -- all the way over the ropes!",
  "MAXIMUM! What a stroke by {batsman}! Clears the fence {phrase}!",
  "Out of the ground! {batsman} monstered that {phrase} for SIX!",
  "Clean strike! {batsman} handles {bowler} with authority, sailing over {phrase}!",
  "Massive hit! {batsman} hits it out of the park {phrase}!",
];

const dotBallTemplates = [
  "{bowler} to {batsman}, dot ball. {contactQuality} defensive play.",
  "{bowler} pitches it up, {batsman} defends carefully {phrase}.",
  "Solid defense from {batsman} off {bowler}.",
  "No run. {bowler} maintains line and length, {batsman} plays it back.",
  "Watchful leave by {batsman} off {bowler}.",
];

const singleTemplates = [
  "{batsman} plays {bowler} {phrase} for a quick single.",
  "Good running between the wickets. {batsman} works it {phrase} for one.",
  "{batsman} nudges {bowler} {phrase} and takes a comfortable single.",
  "Sharp single stolen by {batsman} {phrase}.",
];

const wicketTemplates = [
  "OUT! {bowler} strikes! {batsman} has to go ({dismissalType})!",
  "What a delivery from {bowler}! {batsman} is dismissed ({dismissalType})!",
  "Breakthrough! {bowler} gets the wicket of {batsman} ({dismissalType})!",
  "GONE! {batsman} falls to {bowler}! ({dismissalType}).",
];

const milestoneTemplates = {
  fifty: [
    "FIFTY! Well played, {player}! Reaches a brilliant half-century!",
    "Half-century for {player}! Superb innings under pressure!",
    "50 runs up for {player}! What a knock for the team!",
  ],
  hundred: [
    "CENTURY! What a magnificent innings by {player}!",
    "100 runs! {player} reaches a glorious century!",
    "HUNDRED for {player}! Standing ovation around the ground!",
  ],
  fiveWickets: [
    "FIVE WICKETS! {player} has a 5-wicket haul!",
    "5-FOR! Outstanding bowling spell by {player}!",
  ],
};

function getRandomTemplate(templates: string[]): string {
  return templates[Math.floor(Math.random() * templates.length)];
}

export function generateCommentary(context: CommentaryContext): string {
  const batsman = context.batsmanName || "The batter";
  const bowler = context.bowlerName || "The bowler";
  const zoneInfo = context.shotZone ? SHOT_ZONE_DESCRIPTIONS[context.shotZone.toUpperCase()] : null;
  const phrase = zoneInfo ? zoneInfo.phrase : "into the outfield";
  const boundaryPhrase = zoneInfo ? zoneInfo.boundaryPhrase : "races away to the fence";
  const shotType = context.shotType ? context.shotType.replace(/_/g, ' ') : "shot";
  const contactQuality = context.contactQuality ? context.contactQuality : "solid";
  const dismissalType = context.dismissalType || "dismissed";

  // Check for milestones
  if (context.batsmanRuns === 50 && context.batsmanName) {
    return getRandomTemplate(milestoneTemplates.fifty).replace('{player}', context.batsmanName);
  }
  if (context.batsmanRuns === 100 && context.batsmanName) {
    return getRandomTemplate(milestoneTemplates.hundred).replace('{player}', context.batsmanName);
  }
  if (context.bowlerWickets === 5 && context.bowlerName) {
    return getRandomTemplate(milestoneTemplates.fiveWickets).replace('{player}', context.bowlerName);
  }

  // Wickets
  if (context.isDismissal) {
    let tpl = getRandomTemplate(wicketTemplates);
    if (context.fielderName && (dismissalType.includes('caught') || dismissalType.includes('run_out'))) {
      tpl = `OUT! ${batsman} is out (${dismissalType} by ${context.fielderName}) off ${bowler}!`;
    }
    return tpl
      .replace('{batsman}', batsman)
      .replace('{bowler}', bowler)
      .replace('{dismissalType}', dismissalType);
  }

  // Extras
  if (context.isWide) {
    return `Wide! ${bowler} strays down the leg side. Extra run added.`;
  }
  if (context.isNoBall) {
    return `No ball! ${bowler} oversteps. Free hit coming up!`;
  }

  // Boundaries & Sixes
  if (context.runs === 6) {
    let text = getRandomTemplate(sixTemplates)
      .replace('{batsman}', batsman)
      .replace('{bowler}', bowler)
      .replace('{phrase}', phrase)
      .replace('{shotType}', shotType);
    if (context.isDeathOver) text += " (Death-overs maximum!)";
    return text;
  }

  if (context.runs === 4) {
    let text = getRandomTemplate(boundaryTemplates)
      .replace('{batsman}', batsman)
      .replace('{bowler}', bowler)
      .replace('{phrase}', phrase)
      .replace('{boundaryPhrase}', boundaryPhrase)
      .replace('{shotType}', shotType);
    if (context.isPowerplay) text += " (Capitalising on the Powerplay field restrictions.)";
    return text;
  }

  // Dot balls
  if (context.runs === 0) {
    return getRandomTemplate(dotBallTemplates)
      .replace('{batsman}', batsman)
      .replace('{bowler}', bowler)
      .replace('{phrase}', phrase)
      .replace('{contactQuality}', contactQuality);
  }

  // Singles & Multi-runs
  if (context.runs === 1) {
    return getRandomTemplate(singleTemplates)
      .replace('{batsman}', batsman)
      .replace('{bowler}', bowler)
      .replace('{phrase}', phrase);
  }

  return `${bowler} to ${batsman}, ${context.runs} runs worked ${phrase}.`;
}

export function generateOverSummary(balls: number, runs: number, wickets: number): string {
  if (wickets > 0) {
    return `End of over: ${runs} run${runs !== 1 ? 's' : ''} and ${wickets} wicket${wickets !== 1 ? 's' : ''}.`;
  }
  return `End of over: ${runs} run${runs !== 1 ? 's' : ''}.`;
}

