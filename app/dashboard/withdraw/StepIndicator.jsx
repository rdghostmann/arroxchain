// StepIndicator.jsx
"use client";

export function StepIndicator({ steps, currentStep, color = "blue" }) {
  const colorClasses = {
    blue: "text-blue-600",
    emerald: "text-emerald-600",
  };

  return (
    <div className="flex justify-between text-xs font-medium mb-4">
      {steps.map((label, i) => (
        <span
          key={i}
          className={i + 1 === currentStep ? colorClasses[color] : "text-muted-foreground"}
        >
          {i + 1}. {label}
        </span>
      ))}
    </div>
  );
}