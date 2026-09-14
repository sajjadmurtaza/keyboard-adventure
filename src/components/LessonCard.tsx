"use client";

type LessonCardProps = {
  title: string;
  description: string;
  locked: boolean;
  completed: boolean;
  onSelect: () => void;
};

export function LessonCard({
  title,
  description,
  locked,
  completed,
  onSelect,
}: LessonCardProps) {
  return (
    <button
      type="button"
      disabled={locked}
      onClick={onSelect}
      className="min-h-24 rounded-[28px] border-4 border-white bg-white p-5 text-left shadow-md transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <p className="text-xl font-bold text-[#34364A]">
        {locked ? "🔒 " : completed ? "⭐ " : ""}
        {title}
      </p>
      <p className="mt-1 text-[#5A5C72]">{description}</p>
    </button>
  );
}
