import type { ComponentProps } from "react";
import "./Key.css";

type KeyProps = ComponentProps<"button"> & {
  variant?: "default" | "operator" | "secondary" | "primary";
};

export default function Key({
  variant = "default",
  type = "button",
  ...props
}: KeyProps) {
  return (
    <button type={type} data-slot="key" data-variant={variant} {...props} />
  );
}
