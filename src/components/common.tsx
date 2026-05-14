import type { CardProps } from "../types";

export function Card({ children, className = "" }: CardProps) {
  return <div className={`card ${className}`.trim()}>{children}</div>;
}
