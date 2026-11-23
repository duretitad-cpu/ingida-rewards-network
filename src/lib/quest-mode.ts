export function questCompletion(rewardsEnabled: boolean): "reward" | "thanks" {
  return rewardsEnabled ? "reward" : "thanks";
}