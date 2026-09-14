export type MascotMood =
  | "idle"
  | "encourage"
  | "success"
  | "streak"
  | "complete";

export type MascotViewProps = {
  mood: MascotMood;
  compact?: boolean;
  tiny?: boolean;
};
