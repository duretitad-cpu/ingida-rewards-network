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
    prompt: "Where Would You Like To Earn INGIDA Points?",
    parts: ["Where Would You Like To ", "Earn", " INGIDA Points?"],
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
    labels: ["Yes, Please", "No, Thank You", "Yes, Please", "No, Thank You"],
    inside: ["SPEND", "EARN", "REDEEM"],
    reveal: () => ({ title: "", body: "" }),
  },
];

export const AM_INSIDE = ["ይግዙ", "ነጥብ ያግኙ", "ይሸለሙ"];
export const AM_ROUNDS: Round[] = [
  {
    key: "lifestyle", eyebrow: "እንኳን ደህና መጡ · 1 ከ 5", prompt: "ገንዘብዎን በብዛት በምን ላይ ያወጣሉ?",
    labels: ["ምግብ እና መጠጥ", "ማረፊያ እና ሆቴሎች", "ጉዞ", "ልዩ መግቢያ"], inside: AM_INSIDE,
    reveal: (i) => ({ title: ["የምግብ አፍቃሪ", "ከቤት ውጭ እንደ ቤት", "ሁሌም በጉዞ", "ቀድመው የሚገቡ"][i] ?? "እንኳን ደህና መጡ", body: "በፋይዳ መታወቂያዎ ይመዝገቡ፤ በዋሌትዎ ውስጥ በቴሌብር ይክፈሉ።" }),
  },
  {
    key: "monthly", eyebrow: "2 ከ 5", prompt: "በየወሩ ለ{cat} ምን ያህል ገንዘብ ያወጣሉ?",
    parts: ["በየወሩ ለ{cat} ምን ያህል ገንዘብ ", "ያወጣሉ", "?"],
    labels: ["ከ5,000 ብር በታች", "ከ5,000–15,000 ብር", "ከ15,000–30,000 ብር", "30,000 ብር እና ከዚያ በላይ"], inside: AM_INSIDE,
    reveal: () => ({ title: "በእያንዳንዱ ክፍያ 2% ይመለሳል", body: "ብቁ በሆነ እያንዳንዱ ወጪ 2% ተመላሽ ያግኙ።" }),
  },
  {
    key: "earn", eyebrow: "3 ከ 5", prompt: "በምን ላይ ሲያወጡ ነጥብ ማግኘት ይፈልጋሉ?",
    labels: ["የሳምንት መጨረሻ ጉዞ", "የሥራ ጉዞ ማረፊያ", "የቤት አስቤዛ", "የቤት ኪራይ"], inside: AM_INSIDE,
    labelsByCategory: [
      ["የዕለት ተዕለት ቡና", "ከቤት ውጭ መመገብ", "የቤት አስቤዛ", "የምግብ ትዕዛዝ"],
      ["የሳምንት መጨረሻ ቆይታ", "የሥራ ጉዞ ማረፊያ", "ወርሃዊ የቤት ኪራይ", "የስፓ ቀን"],
      ["የዕለት ተዕለት ጉዞ", "የከተማ ጉዞ", "የመንገድ ጉዞ", "የአውሮፕላን ጉዞ"],
      ["ኮንሰርቶች", "የምሽት መዝናኛ", "ጤና እና ደህንነት", "የግል ዝግጅቶች"],
    ],
    reveal: () => ({ title: "በፈለጉት መንገድ ያግኙ", body: "እያንዳንዱ ወጪ እርስዎ ወደሚመርጡት ሽልማት ይደመራል።" }),
  },
  {
    key: "redeem", eyebrow: "4 ከ 5", prompt: "የሽልማት ነጥቦችዎን በማንኛውም ቦታ መጠቀም ቢችሉ የት መሄድ ይመርጣሉ?",
    labels: ["የምሽት መዝናኛ", "የሳምንት መጨረሻ ጉዞ", "የስፓ ቀን", "የቤት ኪራይ"], inside: AM_INSIDE,
    labelsByCategory: [
      ["ነፃ ቡና", "ለሁለት ሰዎች እራት", "የቤት አስቤዛ", "የጣፋጭ ምግብ ምሽት"],
      ["የምሽት መዝናኛ", "የሳምንት መጨረሻ ጉዞ", "የቤት ኪራይ ድጋፍ", "የስፓ ቀን"],
      ["ነፃ ጉዞ", "የአየር ማረፊያ ትራንስፖርት", "የጉዞ ነዳጅ", "የበረራ ክሬዲት"],
      ["የኮንሰርት ትኬቶች", "የላውንጅ መግቢያ", "የዝግጅት ግብዣዎች", "የጤና አገልግሎት መግቢያ"],
    ],
    reveal: () => ({ title: "አንድ ኔትወርክ፣ በሁሉም ቦታ", body: "በአንድ አጋር ነጥብ ያግኙ፤ በሌላ የእንግዳ አጋር ይሸለሙ።" }),
  },
  {
    key: "alerts", eyebrow: "የመጨረሻው እጥፋት · 5 ከ 5", prompt: "ከእንግዳ ማሳወቂያዎችን መቀበል ይፈልጋሉ?",
    labels: ["እሺ፣ እባክዎ", "አይ፣ አመሰግናለሁ", "እሺ፣ እባክዎ", "አይ፣ አመሰግናለሁ"], inside: AM_INSIDE,
    reveal: () => ({ title: "", body: "" }),
  },
];
