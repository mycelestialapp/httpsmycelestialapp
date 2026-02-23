// Five-element compatibility and MBTI matching engine

import type { ElementEnergy } from './fiveElements';

// Five-element generating cycle: Wood→Fire→Earth→Metal→Water→Wood
const generatingCycle: Record<string, string> = {
  wood: 'fire',
  fire: 'earth',
  earth: 'metal',
  metal: 'water',
  water: 'wood',
};

// Reverse: what generates me
const generatedBy: Record<string, string> = {
  fire: 'wood',
  earth: 'fire',
  metal: 'earth',
  water: 'metal',
  wood: 'water',
};

// MBTI compatibility groups (simplified)
const mbtiCompatibility: Record<string, string[]> = {
  INTJ: ['ENFP', 'ENTP', 'INFJ', 'INTJ'],
  INTP: ['ENTJ', 'ENFJ', 'INTP', 'INFP'],
  ENTJ: ['INTP', 'INFP', 'ENTJ', 'ENFJ'],
  ENTP: ['INFJ', 'INTJ', 'ENTP', 'ENFP'],
  INFJ: ['ENTP', 'ENFP', 'INFJ', 'INTJ'],
  INFP: ['ENTJ', 'ENFJ', 'INFP', 'INTP'],
  ENFJ: ['INTP', 'INFP', 'ENFJ', 'ENTJ'],
  ENFP: ['INTJ', 'INFJ', 'ENFP', 'ENTP'],
  ISTJ: ['ESFP', 'ESTP', 'ISTJ', 'ISFJ'],
  ISFJ: ['ESTP', 'ESFP', 'ISFJ', 'ISTJ'],
  ESTJ: ['ISFP', 'ISTP', 'ESTJ', 'ESFJ'],
  ESFJ: ['ISTP', 'ISFP', 'ESFJ', 'ESTJ'],
  ISTP: ['ESFJ', 'ESTJ', 'ISTP', 'ISFP'],
  ISFP: ['ESTJ', 'ESFJ', 'ISFP', 'ISTP'],
  ESTP: ['ISFJ', 'ISTJ', 'ESTP', 'ESFP'],
  ESFP: ['ISTJ', 'ISFJ', 'ESFP', 'ESTP'],
};

export interface MatchProfile {
  id: string;
  display_name: string;
  dominant_element: string;
  mbti: string;
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
  soul_id: string;
  bio: string;
}

export interface MatchResult {
  profile: MatchProfile;
  compatibility: number;
  reason: string;
}

function getDominant(energy: ElementEnergy): string {
  const entries = Object.entries(energy) as [string, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

export function calculateCompatibility(
  userEnergy: ElementEnergy,
  userMbti: string,
  otherEnergy: ElementEnergy,
  otherMbti: string,
): { score: number; reason: string } {
  const userDom = getDominant(userEnergy);
  const otherDom = getDominant(otherEnergy);

  let elementScore = 50; // base
  let reason = '';

  // Generating relationship (I generate them)
  if (generatingCycle[userDom] === otherDom) {
    elementScore += 30;
    const elementNames: Record<string, string> = { wood: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water' };
    reason = `Your ${elementNames[userDom]} nourishes their ${elementNames[otherDom]}`;
  }
  // They generate me
  else if (generatedBy[userDom] === otherDom) {
    elementScore += 25;
    const elementNames: Record<string, string> = { wood: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water' };
    reason = `Their ${elementNames[otherDom]} energizes your ${elementNames[userDom]}`;
  }
  // Same element
  else if (userDom === otherDom) {
    elementScore += 15;
    reason = `Kindred ${userDom.charAt(0).toUpperCase() + userDom.slice(1)} spirits in resonance`;
  } else {
    reason = `Complementary elemental forces at play`;
  }

  // MBTI compatibility
  let mbtiScore = 40; // base
  if (userMbti && otherMbti) {
    const compatible = mbtiCompatibility[userMbti.toUpperCase()] || [];
    if (compatible.includes(otherMbti.toUpperCase())) {
      mbtiScore += 35;
    } else {
      mbtiScore += 10;
    }
  }

  // Energy similarity bonus (cosine-like)
  const uVals = [userEnergy.wood, userEnergy.fire, userEnergy.earth, userEnergy.metal, userEnergy.water];
  const oVals = [otherEnergy.wood, otherEnergy.fire, otherEnergy.earth, otherEnergy.metal, otherEnergy.water];
  const dotProduct = uVals.reduce((s, v, i) => s + v * oVals[i], 0);
  const magU = Math.sqrt(uVals.reduce((s, v) => s + v * v, 0));
  const magO = Math.sqrt(oVals.reduce((s, v) => s + v * v, 0));
  const similarity = dotProduct / (magU * magO);
  const similarityBonus = Math.round(similarity * 10);

  const score = Math.min(99, Math.round(elementScore * 0.5 + mbtiScore * 0.35 + similarityBonus * 1.5));

  return { score, reason };
}

export function findTopMatches(
  userEnergy: ElementEnergy,
  userMbti: string,
  userId: string,
  candidates: MatchProfile[],
  count = 3,
): MatchResult[] {
  const results: MatchResult[] = candidates
    .filter((c) => c.id !== userId)
    .map((profile) => {
      const otherEnergy: ElementEnergy = {
        wood: profile.wood,
        fire: profile.fire,
        earth: profile.earth,
        metal: profile.metal,
        water: profile.water,
      };
      const { score, reason } = calculateCompatibility(userEnergy, userMbti, otherEnergy, profile.mbti || '');
      return { profile, compatibility: score, reason };
    });

  results.sort((a, b) => b.compatibility - a.compatibility);
  return results.slice(0, count);
}
