export type Reveal = { title: string; body: string; correct?: boolean };
export type Round = {
  key: string;
  eyebrow: string;
  prompt: string;
  labels: string[];
  inside: string[];
  reveal: (i: number) => Reveal;
  /** Prompt split around a highlighted word; "{cat}" becomes the chosen category. */
  parts?: [string, string, string];
  /** Options that depend on the category picked in the first fold. */
  labelsByCategory?: string[][];
};

export const CATEGORIES = ["Dine", "Stay", "Access", "Travel"];

export const ROUNDS: Round[] = [
  {
    key: "lifestyle",
    eyebrow: "Welcome · Fold 1 of 5",
    prompt: "Tell Us About Your Lifestyle. Where Do You Spend The Most?",
    labels: CATEGORIES,
    inside: ["SPEND", "EARN", "REDEEM"],
    reveal: (i) => ({
      title: ["A True Foodie", "Home Away From Home", "Always On The Move", "First In Line"][i] ?? "Welcome",
      body: "Join With Your Fayda ID And Spend With Telebirr, Right In Your Wallet.",
    }),
  },
  {
    key: "monthly",
    eyebrow: "Inner Fold · 2 of 5",
    prompt: "How Much Do You Spend On {cat} Monthly?",
    parts: ["How Much Do You ", "Spend", " On {cat} Monthly?"],
    labels: ["Under 5K", "5K–15K", "15K–30K", "30K+"],
    inside: ["SPEND", "EARN", "REDEEM"],
    reveal: () => ({ title: "2% Back, Every Time", body: "Earn 2% Cashback On Every Eligible Spend." }),
  },
  {
    key: "earn",
    eyebrow: "Inner Fold · 3 of 5",
    prompt: "How Would You Like To Earn?",
    parts: ["How Would You Like To ", "Earn", "?"],
    labels: ["Daily Coffee", "Dining Out", "Groceries", "Takeout"],
    labelsByCategory: [
      ["Daily Coffee", "Dining Out", "Groceries", "Takeout"],
      ["Weekend Getaways", "Business Stays", "Monthly Rent", "Spa Days"],
      ["Daily Commute", "City Rides", "Road Trips", "Flights"],
      ["Concerts", "Nightlife", "Wellness", "Private Events"],
    ],
    inside: ["SPEND", "EARN", "REDEEM"],
    reveal: () => ({ title: "Earn Your Way", body: "Every Spend Adds Up To Rewards You Choose." }),
  },
  {
    key: "redeem",
    eyebrow: "Inner Fold · 4 of 5",
    prompt: "If You Could Redeem Anywhere, Where Would You Go?",
    parts: ["If You Could ", "Redeem", " Anywhere, Where Would You Go?"],
    labels: ["Coffee On Us", "Dinner For Two", "Grocery Run", "Dessert Night"],
    labelsByCategory: [
      ["Coffee On Us", "Dinner For Two", "Grocery Run", "Dessert Night"],
      ["A Night Out", "Weekend Escape", "Rent Support", "Spa Day"],
      ["Free Rides", "Airport Transfer", "Road Trip Fuel", "Flight Credit"],
      ["Concert Tickets", "Lounge Access", "Event Invites", "Wellness Pass"],
    ],
    inside: ["SPEND", "EARN", "REDEEM"],
    reveal: () => ({ title: "One Network, Every Partner", body: "Spend With One Partner, Redeem With Another." }),
  },
  {
    key: "alerts",
    eyebrow: "Last Fold · 5 of 5",
    prompt: "Would You Like To Receive Alerts For INGIDA?",
    parts: ["Would You Like To Receive ", "Alerts", " For INGIDA?"],
    labels: ["Yes Please", "No Thanks", "እሺ", "አይ፣ አመሰግናለሁ"],
    inside: ["SPEND", "EARN", "REDEEM"],
    reveal: () => ({ title: "", body: "" }),
  },
];

export const AM_ROUNDS: Round[] = [
  {
    key: "lifestyle", eyebrow: "እንኳን ደህና መጡ", prompt: "ብዙ ጊዜ ወጪዎን የት ያደርጋሉ?",
    labels: ["ምግብ", "ማረፊያ", "ግዢ", "ጉዞ"], inside: ["ይግዙ፣ ነጥብ ያግኙ፣ ይሸለሙ"],
    reveal: (i) => ({ title: ["የምግብ አፍቃሪ", "ከቤት ውጭ እንደ ቤት", "ለግዢ የተዘጋጁ", "ሁሌም በጉዞ"][i] ?? "እንኳን ደህና መጡ", body: "በፋይዳ መታወቂያዎ ይመዝገቡ፤ በዋሌትዎ ውስጥ በቴሌብር ይክፈሉ።" }),
  },
  {
    key: "monthly", eyebrow: "ሁለተኛው እጥፋት", prompt: "በወር ምን ያህል ወጪ ያደርጋሉ?",
    labels: ["ከ5 ሺህ በታች", "5–15 ሺህ", "15–30 ሺህ", "ከ30 ሺህ በላይ"], inside: ["ይግዙ፣ ነጥብ ያግኙ፣ ይሸለሙ"],
    reveal: () => ({ title: "በእያንዳንዱ ክፍያ 2% ይመለሳል", body: "ብቁ በሆነ እያንዳንዱ ወጪ 2% ተመላሽ ያግኙ።" }),
  },
  {
    key: "favorite", eyebrow: "የመጨረሻው እጥፋት", prompt: "ነጥብ ለማግኘትና ለመሸለም የሚወዱት ቦታ የት ነው?",
    labels: ["ሆቴሎች", "ካፌዎች", "ላውንጆች", "ሱቆች"], inside: ["ይግዙ፣ ነጥብ ያግኙ፣ ይሸለሙ"],
    reveal: () => ({ title: "አንድ ኔትወርክ፣ በሁሉም ቦታ", body: "በአንድ አጋር ነጥብ ያግኙ፤ በሌላ የእንግዳ አጋር ይሸለሙ።" }),
  },
];
