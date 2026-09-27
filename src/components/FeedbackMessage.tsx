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
      key={kind === "retry" ? text : kind}
      className={`mb-1 h-8 overflow-hidden text-center font-[family-name:var(--font-display)] text-xl font-bold leading-8 ${color} ${kind === "retry" ? "animate-wrong-pop" : ""}`}
      data-testid={kind === "success" ? "success-teach" : "lesson-instruction"}
    >
      {text}
    </p>
  );
}
