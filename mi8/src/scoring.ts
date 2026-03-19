type ScoreDelta = {
  safety: number
  economy: number
  qualityOfLife: number
  culture: number
}

const TAG_IMPACTS: Record<string, Partial<ScoreDelta>> = {
  innovation:    { safety: 20,   economy: 60,   qualityOfLife: 30,  culture: 5   },
  culture:       {               economy: 15,   qualityOfLife: 40,  culture: 75  },
  healthcare:    { safety: 30,   economy: 20,   qualityOfLife: 30                },
  entertainment: {               economy: 20,   qualityOfLife: 25,  culture: 35  },
  crisis:        { safety: -80,  economy: -100, qualityOfLife: -60, culture: -30 },
  crime:         { safety: -120, economy: -50,  qualityOfLife: -80, culture: -40 },
  disaster:      { safety: -100, economy: -70,  qualityOfLife: -90, culture: -30 },
}

export function computeScoreDelta(tags: string[]): ScoreDelta {
  const delta: ScoreDelta = { safety: 0, economy: 0, qualityOfLife: 0, culture: 0 }

  for (const tag of tags) {
    const impact = TAG_IMPACTS[tag]
    if (!impact) continue
    delta.safety += impact.safety ?? 0
    delta.economy += impact.economy ?? 0
    delta.qualityOfLife += impact.qualityOfLife ?? 0
    delta.culture += impact.culture ?? 0
  }

  return delta
}
