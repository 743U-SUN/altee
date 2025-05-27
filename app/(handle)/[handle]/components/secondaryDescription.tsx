"use client";

interface SecondaryDescriptionProps {
  description: string;
}

export default function SecondaryDescription({ description }: SecondaryDescriptionProps) {
  return (
    <div className="w-full">
      <p className="text-base leading-relaxed whitespace-pre-wrap">
        {description}
      </p>
    </div>
  );
}
