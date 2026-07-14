import React from "react";

const Card = ({ className = "", children }) => {
  return (
    <div
      className={[
        "bg-white border border-neutral-200 rounded-3xl shadow-sm card-lift",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
};

export default Card;

