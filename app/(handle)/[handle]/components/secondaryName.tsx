"use client";

interface SecondaryNameProps {
  characterName: string | null;
  subname: string | null;
}

export default function SecondaryName({ characterName, subname }: SecondaryNameProps) {
  if (!characterName && !subname) {
    return null;
  }

  return (
    <div className="w-full  bg-gray-50 rounded-md p-6 z-10">
      <div className="border-b pb-4">
        {subname && (
          <p className="text-sm text-muted-foreground mb-1">{subname}</p>
        )}
        {characterName && (
          <h1 className="text-2xl md:text-3xl font-bold">{characterName}</h1>
        )}
      </div>
    </div>
  );
}
