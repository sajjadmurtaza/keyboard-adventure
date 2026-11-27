import type { ReactNode } from "react";

/** Index of first case-insensitive match of letter in word, or -1. */
export function firstLetterIndex(word: string, letter: string): number {
  const needle = letter.trim().toLowerCase();
  if (!word || !needle || needle.length !== 1) return -1;
  return word.toLowerCase().indexOf(needle);
}

/** Highlight the first case-insensitive match of `letter` inside `word`. */
export function highlightLetterInWord(word: string, letter: string): ReactNode {
  const idx = firstLetterIndex(word, letter);
  if (idx < 0) return word;

  return (
    <>
      {word.slice(0, idx)}
      <span className="letter-highlight" data-testid="letter-highlight">
        {word.slice(idx, idx + 1)}
      </span>
      {word.slice(idx + 1)}
    </>
  );
}
