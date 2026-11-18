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

export const CATEGORIES = ["Dine", "Stay", "Travel", "Access"];

export const ROUNDS: Round[] = [
  {
    key: "lifestyle",
    eyebrow: "Welcome · Fold 1 of 4",
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
    eyebrow: "Inner Fold · 2 of 4",
    prompt: "How Much Do You Spend On {cat} Monthly?",
    parts: ["How Much Do You ", "Spend", " On {cat} Monthly?"],
    labels: ["Under 5K", "5K–15K", "15K–30K", "30K+"],
    inside: ["SPEND", "EARN", "REDEEM"],
    reveal: () => ({ title: "2% Back, Every Time", body: "Earn 2% Cashback On Every Eligible Spend." }),
  },
  {
    key: "earn",
    eyebrow: "Inner Fold · 3 of 4",
    prompt: "How Would You Like To Earn?",
    parts: ["How Would You Like To ", "Earn", "?"],
    labels: ["Daily Coffee", "Big Dinners", "Groceries", "Takeout"],
    labelsByCategory: [
      ["Daily Coffee", "Big Dinners", "Groceries", "Takeout"],
      ["Weekend Getaways", "Business Stays", "Monthly Rent", "Spa Days"],
      ["Daily Commute", "City Rides", "Road Trips", "Flights"],
      ["Concerts", "Nightlife", "Wellness", "Private Events"],
    ],
    inside: ["SPEND", "EARN", "REDEEM"],
    reveal: () => ({ title: "Earn Your Way", body: "Every Spend Adds Up To Rewards You Choose." }),
  },
  {
    key: "redeem",
    eyebrow: "Last Fold · 4 of 4",
    prompt: "If You Could, Where Would You Redeem?",
    parts: ["How Would You Like To ", "Redeem", "?"],
    labels: ["Coffee", "Restaurant", "Delivery", "Groceries"],
    labelsByCategory: [
      ["Coffee", "Restaurant", "Delivery", "Groceries"],
      ["Rent", "Hotel Room", "Resort", "Spa"],
      ["Taxi", "Bus", "Ride", "Flight"],
      ["Events", "Appointments", "Places", "Invitations"],
    ],
    inside: ["SPEND", "EARN", "REDEEM"],
    reveal: () => ({ title: "One Network, Everywhere", body: "Earn At One Partner, Redeem At Any Other Across INGIDA." }),
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
