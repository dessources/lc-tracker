export type Pattern =
  | "Dynamic Programming"
  | "Greedy"
  | "Graphs"
  | "Trees"
  | "Backtracking"
  | "Binary Search"
  | "Two Pointers"
  | "Sliding Window"
  | "Heaps"
  | "Stacks & Monotonic"
  | "Intervals"
  | "Linked Lists"
  | "Arrays & Hashing"
  | "Math & Number Theory"
  | "Probability & Combinatorics"
  | "Brain Teasers"
  | "Other";

export const ALL_PATTERNS: Pattern[] = [
  "Dynamic Programming",
  "Greedy",
  "Graphs",
  "Trees",
  "Backtracking",
  "Binary Search",
  "Two Pointers",
  "Sliding Window",
  "Heaps",
  "Stacks & Monotonic",
  "Intervals",
  "Linked Lists",
  "Arrays & Hashing",
  "Math & Number Theory",
  "Probability & Combinatorics",
  "Brain Teasers",
  "Other",
];

export interface Review {
  date: string;
  comfort: 1 | 2 | 3 | 4 | 5;
  time_spent_minutes?: number;
  notes?: string;
  // True when this review resolved a Comeback Challenge. Used to keep the
  // "done today" state consistent across devices and to exclude comebacks
  // from the normal per-difficulty leaderboard points.
  is_comeback?: boolean;
}

export interface Problem {
  id: string;
  name: string;
  leetcode_number?: number;
  url?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  pattern: Pattern;
  subpattern?: string;
  source: "LeetCode" | "Codeforces" | "Other";
  date_added: string;
  notes?: string;
  reviews: Review[];
  next_review: string;
  interval: number;
  ease_factor: number;
  comfort_history: number[];
  // Once true, the problem has proven mastery and leaves the active review
  // queue; it only resurfaces via the daily Comeback Challenge.
  graduated: boolean;
}

export interface AppSettings {
  darkMode: boolean;
  dailyGoal: number;
  // Max reviews surfaced per day on the dashboard (most-overdue first).
  dailyReviewBudget: number;
}

export const SortKey = {
  NAME: "name",
  PATTERN: "pattern",
  NEXT_REVIEW: "next review",
  DATE_ADDED: "date added",
  COMFORT: "comfort",
  DIFFICULTY: "difficulty",
};

export type SortKey = (typeof SortKey)[keyof typeof SortKey];
