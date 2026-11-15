export type Reveal = { title: string; body: string; correct?: boolean };
export type Round = {
  key: string;
  eyebrow: string;
  prompt: string;
  labels: string[];
  inside: string[];
  reveal: (i: number) => Reveal;
};

export const ROUNDS: Round[] = [
  {
    key: "lifestyle",
    eyebrow: "Welcome · Fold 1 of 3",
    prompt: "Tell Us About Your Lifestyle. Where Do You Spend The Most?",
    labels: ["Dine", "Stay", "Shop", "Travel"],
    inside: ["SPEND", "EARN", "REDEEM"],
    reveal: (i) => ({
      title: ["A True Foodie", "Home Away From Home", "Made For The Hunt", "Always On The Move"][i] ?? "Welcome",
      body: "Join with your Fayda ID and spend with telebirr, right in your wallet.",
    }),
  },
  {
    key: "monthly",
    eyebrow: "Inner Fold · 2 of 3",
    prompt: "How Much Do You Spend On It Monthly?",
    labels: ["Under 5K", "5K–15K", "15K–30K", "30K+"],
    inside: ["SPEND", "EARN", "REDEEM"],
    reveal: () => ({ title: "2% Back, Every Time", body: "Earn 2% cashback on every eligible spend." }),
  },
  {
    key: "favorite",
    eyebrow: "Last Fold · 3 of 3",
    prompt: "What's Your Favorite Place To Earn And Redeem At?",
    labels: ["Hotels", "Cafés", "Lounges", "Retail"],
    inside: ["SPEND", "EARN", "REDEEM"],
    reveal: () => ({ title: "One Network, Everywhere", body: "Earn at one partner, redeem at any other across INGIDA." }),
  },
];
