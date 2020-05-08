interface Phase {
  stages: ReadonlyArray<{
    isComplete: boolean
  }>
}

const getMeetingPhase = <T extends Phase>(phases: readonly T[]) => {
  return (phases.find((phase) => {
    return !phase.stages.every((stage) => stage.isComplete)
  }) as unknown) as T
}

export default getMeetingPhase
