export type Lesson = {
  id: number;
  title: string;
  description: string;
  keys: string[];
  sequence: string[];
};

export const lessons: Lesson[] = [
  {
    id: 1,
    title: "F and J",
    description: "Meet your pointer fingers!",
    keys: ["f", "j"],
    sequence: ["f", "j", "f", "j", "f", "j", "j", "f"],
  },
  {
    id: 2,
    title: "F, J, Space",
    description: "Add the big space bar.",
    keys: ["f", "j", " "],
    sequence: ["f", "j", " ", "f", " ", "j", "f", "j", " "],
  },
  {
    id: 3,
    title: "D and K",
    description: "Middle fingers join in.",
    keys: ["d", "k"],
    sequence: ["d", "k", "d", "k", "k", "d", "d", "k"],
  },
  {
    id: 4,
    title: "S and L",
    description: "Ring fingers next.",
    keys: ["s", "l"],
    sequence: ["s", "l", "s", "l", "l", "s", "s", "l"],
  },
  {
    id: 5,
    title: "A and ;",
    description: "Pinkies on home row.",
    keys: ["a", ";"],
    sequence: ["a", ";", "a", ";", ";", "a", "a", ";"],
  },
  {
    id: 6,
    title: "Home row mix",
    description: "All home-row friends.",
    keys: ["a", "s", "d", "f", "j", "k", "l", ";", " "],
    sequence: ["f", "j", "d", "k", "s", "l", "a", ";", " ", "f", "j"],
  },
  {
    id: 7,
    title: "E and I",
    description: "Reach up a little.",
    keys: ["e", "i"],
    sequence: ["e", "i", "e", "i", "i", "e", "e", "i"],
  },
  {
    id: 8,
    title: "R and U",
    description: "Index fingers stretch up.",
    keys: ["r", "u"],
    sequence: ["r", "u", "r", "u", "u", "r", "r", "u"],
  },
  {
    id: 9,
    title: "W and O",
    description: "Ring fingers reach up.",
    keys: ["w", "o"],
    sequence: ["w", "o", "w", "o", "o", "w", "w", "o"],
  },
  {
    id: 10,
    title: "Q and P",
    description: "Pinkies on the corners.",
    keys: ["q", "p"],
    sequence: ["q", "p", "q", "p", "p", "q", "q", "p"],
  },
  {
    id: 11,
    title: "C and ,",
    description: "Down from home row.",
    keys: ["c", ","],
    sequence: ["c", ",", "c", ",", ",", "c", "c", ","],
  },
  {
    id: 12,
    title: "V and M",
    description: "Index fingers down.",
    keys: ["v", "m"],
    sequence: ["v", "m", "v", "m", "m", "v", "v", "m"],
  },
  {
    id: 13,
    title: "X and .",
    description: "Ring fingers down.",
    keys: ["x", "."],
    sequence: ["x", ".", "x", ".", ".", "x", "x", "."],
  },
  {
    id: 14,
    title: "Z and /",
    description: "Pinkies reach down.",
    keys: ["z", "/"],
    sequence: ["z", "/", "z", "/", "/", "z", "z", "/"],
  },
  {
    id: 15,
    title: "T and Y",
    description: "The middle of the top row.",
    keys: ["t", "y"],
    sequence: ["t", "y", "t", "y", "y", "t", "t", "y"],
  },
  {
    id: 16,
    title: "G and H",
    description: "Home-row neighbors.",
    keys: ["g", "h"],
    sequence: ["g", "h", "g", "h", "h", "g", "g", "h"],
  },
];

export function getLesson(id: number): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

export function buildPracticeSequence(
  keys: string[],
  length: number,
): string[] {
  if (keys.length === 0) return [];
  return Array.from({ length }, () => {
    const pick = keys[Math.floor(Math.random() * keys.length)];
    return pick ?? keys[0]!;
  });
}

export const PRACTICE_KEY_OPTIONS = [
  "f",
  "j",
  " ",
  "d",
  "k",
  "s",
  "l",
  "a",
  ";",
  "e",
  "i",
  "r",
  "u",
];

export type World = {
  id: number;
  emoji: string;
  name: string;
  blurb: string;
  lessonIds: number[];
};

export const worlds: World[] = [
  {
    id: 1,
    emoji: "🏡",
    name: "Home Row Land",
    blurb: "Learn the middle row",
    lessonIds: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 2,
    emoji: "☁️",
    name: "Top Row Sky",
    blurb: "Reach the top row",
    lessonIds: [7, 8, 9, 10],
  },
  {
    id: 3,
    emoji: "🌳",
    name: "Bottom Row Forest",
    blurb: "Visit the bottom row",
    lessonIds: [11, 12, 13, 14],
  },
  {
    id: 4,
    emoji: "🌈",
    name: "Keyboard Mix",
    blurb: "Mix it up",
    lessonIds: [15, 16],
  },
];

export function worldForLesson(lessonId: number): World {
  return (
    worlds.find((world) => world.lessonIds.includes(lessonId)) ?? worlds[0]!
  );
}

export function nextAdventureId(completed: number[]): number {
  const next = lessons.find((lesson) => !completed.includes(lesson.id));
  return next?.id ?? lessons[lessons.length - 1]!.id;
}
