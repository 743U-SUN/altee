"use client";

interface SecondaryDescriptionProps {
  description: string;
}

export default function SecondaryDescription({ description }: SecondaryDescriptionProps) {
  return (
    <div className="w-full bg-gray-100 p-6 rounded-md z-10">
      <p className="text-base leading-relaxed whitespace-pre-wrap">
        {description}
      </p>
    </div>
  );
}
