export interface DefaultCategory {
  name: string;
  description: string;
  color: string;
  icon: string;
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  {
    name: "Travel",
    description: "Places to explore, cultures to experience, and journeys across the globe.",
    color: "sky",
    icon: "plane",
  },
  {
    name: "Experiences",
    description: "Unforgettable moments, adventures, and meaningful life stories.",
    color: "amber",
    icon: "sparkles",
  },
  {
    name: "Life",
    description: "Core aspirations, wisdom, relationships, and major personal milestones.",
    color: "rose",
    icon: "heart",
  },
  {
    name: "Skills",
    description: "Talents to master, crafts to learn, languages, and instruments.",
    color: "indigo",
    icon: "lightbulb",
  },
  {
    name: "Career",
    description: "Professional ambitions, creative ventures, and impactful achievements.",
    color: "emerald",
    icon: "briefcase",
  },
  {
    name: "Fitness",
    description: "Health milestones, outdoor endurance, and physical strength challenges.",
    color: "teal",
    icon: "activity",
  },
  {
    name: "Money",
    description: "Financial freedom goals, investments, and dream purchases.",
    color: "yellow",
    icon: "coins",
  },
  {
    name: "Personal",
    description: "Habits, mindset, spiritual growth, and personal projects.",
    color: "violet",
    icon: "user",
  },
];

