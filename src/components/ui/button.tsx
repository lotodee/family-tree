import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export function Button({ children, variant = "primary", ...props }: ButtonProps) {
  return <button {...props}>{children}</button>;
}
