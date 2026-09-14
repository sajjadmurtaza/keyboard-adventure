"use client";

type FeedbackMessageProps = {
  text: string;
  kind: "idle" | "success" | "retry";
};

export function FeedbackMessage({ text, kind }: FeedbackMessageProps) {
  const color =
    kind === "success"
      ? "text-[#2F9E5C]"
      : kind === "retry"
        ? "text-[#7657E8]"
        : "text-[#34364A]";

  return (
    <p
      className={`min-h-8 text-center font-[family-name:var(--font-display)] text-2xl font-bold ${color}`}
    >
      {text}
    </p>
  );
}
