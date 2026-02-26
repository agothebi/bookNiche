"use client";

import { useEffect, useState } from "react";

const QUOTES: { text: string; attribution: string }[] = [
  {
    text: "A room without books is like a body without a soul.",
    attribution: "Marcus Tullius Cicero",
  },
  {
    text: "I have lived a thousand lives and I've loved a thousand loves.",
    attribution: "George R.R. Martin",
  },
  {
    text: "There is no friend as loyal as a book.",
    attribution: "Ernest Hemingway",
  },
  {
    text: "One must always be careful of books, and what is inside them, for words have the power to change us.",
    attribution: "Cassandra Clare",
  },
  {
    text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.",
    attribution: "George R.R. Martin",
  },
  {
    text: "Not all those who wander are lost.",
    attribution: "J.R.R. Tolkien",
  },
  {
    text: "The world was hers for the reading.",
    attribution: "Betty Smith",
  },
  {
    text: "Books are a uniquely portable magic.",
    attribution: "Stephen King",
  },
  {
    text: "I am not afraid of storms, for I am learning how to sail my ship.",
    attribution: "Louisa May Alcott",
  },
  {
    text: "She is too fond of books, and it has turned her brain.",
    attribution: "Louisa May Alcott",
  },
  {
    text: "If you only read the books that everyone else is reading, you can only think what everyone else is thinking.",
    attribution: "Haruki Murakami",
  },
  {
    text: "We read to know we are not alone.",
    attribution: "C.S. Lewis",
  },
  {
    text: "Words are, in my not-so-humble opinion, our most inexhaustible source of magic.",
    attribution: "J.K. Rowling",
  },
  {
    text: "It is what you read when you don't have to that determines what you will be when you can't help it.",
    attribution: "Oscar Wilde",
  },
  {
    text: "The book you don't read won't help.",
    attribution: "Jim Rohn",
  },
];

export function LiteraryQuoteBar() {
  const [quote, setQuote] = useState<(typeof QUOTES)[number] | null>(null);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  if (!quote) return null;

  return (
    <footer className="w-full px-4 py-4">
      <p className="max-w-4xl mx-auto text-center font-serif italic text-sm text-[var(--foreground-muted)] leading-relaxed">
        <span
          className="text-[var(--sakura-deep)] not-italic mr-0.5"
          aria-hidden
        >
          ❝
        </span>
        {quote.text}
        <span
          className="text-[var(--sakura-deep)] not-italic ml-0.5"
          aria-hidden
        >
          ❞
        </span>
        <span className="not-italic font-medium text-xs ml-2">
          — {quote.attribution}
        </span>
      </p>
    </footer>
  );
}
