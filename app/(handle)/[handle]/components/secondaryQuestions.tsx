"use client";

import { UserCustomQuestion } from "../types";

interface SecondaryQuestionsProps {
  questions: UserCustomQuestion[];
}

export default function SecondaryQuestions({ questions }: SecondaryQuestionsProps) {
  // sortOrderでソート
  const sortedQuestions = [...questions].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="w-full @container">
      <div className="grid gap-4 @lg:grid-cols-2 @lg:gap-6">
        {sortedQuestions.map((question) => (
          <div key={question.id} className="space-y-2">
            <p className="font-medium text-sm">Q. {question.question}</p>
            <p className="text-sm text-muted-foreground truncate">A. {question.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
