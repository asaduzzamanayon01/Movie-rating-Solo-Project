"use client";

import { Rating as ReactRating } from "@smastrom/react-rating";

export function Rating({
  value,
  onChange,
}: {
  value: number;
  onChange: (newRating: number) => void;
}) {
  return (
    <ReactRating
      style={{ maxWidth: 500 }}
      value={value}
      onChange={onChange} // Using onChange instead of onValueChange
    />
  );
}
