type StopWhenContext = {
  steps: unknown[];
};

export function stepCountIs(target: number) {
  return ({ steps }: StopWhenContext) => steps.length >= target;
}
