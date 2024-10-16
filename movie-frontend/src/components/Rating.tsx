"use client";

import { Rating as ReactRating } from "@smastrom/react-rating";

export function Rating({
    value,
    onChange,
    width,
    readOnly = false,
}: {
    value: number;
    width: number;
    onChange?: (newRating: number) => void;
    readOnly?: boolean;
}) {
    return (
        <ReactRating
            id="rating-comp"
            style={{ maxWidth: width ?? 500 }}
            value={value}
            onChange={readOnly ? undefined : onChange}
            readOnly={readOnly}
        />
    );
}
