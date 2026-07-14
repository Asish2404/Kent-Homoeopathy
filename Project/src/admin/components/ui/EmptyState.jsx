import React from "react";

const EmptyState = ({ title = "Nothing here yet", description = "" }) => {
  return (
    <div className="py-10 text-center">
      <div className="text-neutral-900 font-extrabold">{title}</div>
      {description ? (
        <div className="text-neutral-500 text-sm mt-2">{description}</div>
      ) : null}
    </div>
  );
};

export default EmptyState;

