import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative grid w-full items-start gap-x-2 gap-y-0.5 rounded-xl border border-oklch(0.922 0 0) px-3.5 py-3 text-oklch(0.145 0 0) text-sm has-[>svg]:has-data-[slot=alert-action]:grid-cols-[calc(var(--spacing)*4)_1fr_auto] has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-data-[slot=alert-action]:grid-cols-[1fr_auto] has-[>svg]:gap-x-2 [&>svg]:h-lh [&>svg]:w-4 dark:border-oklch(1 0 0 / 10%) dark:text-oklch(0.985 0 0)",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default:
          "bg-transparent dark:bg-oklch(0.922 0 0)/32 [&>svg]:text-oklch(0.556 0 0) dark:dark:bg-oklch(1 0 0 / 15%)/32 dark:[&>svg]:text-oklch(0.708 0 0)",
        error:
          "border-oklch(0.577 0.245 27.325)/32 bg-oklch(0.577 0.245 27.325)/4 [&>svg]:text-oklch(0.577 0.245 27.325) dark:border-oklch(0.704 0.191 22.216)/32 dark:bg-oklch(0.704 0.191 22.216)/4 dark:[&>svg]:text-oklch(0.704 0.191 22.216)",
        info: "border-info/32 bg-info/4 [&>svg]:text-info",
        success: "border-success/32 bg-success/4 [&>svg]:text-success",
        warning: "border-warning/32 bg-warning/4 [&>svg]:text-warning",
      },
    },
  },
);

export function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants>): React.ReactElement {
  return (
    <div
      className={cn(alertVariants({ variant }), className)}
      data-slot="alert"
      role="alert"
      {...props}
    />
  );
}

export function AlertTitle({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn("font-medium [svg~&]:col-start-2", className)}
      data-slot="alert-title"
      {...props}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 text-oklch(0.556 0 0) [svg~&]:col-start-2 dark:text-oklch(0.708 0 0)",
        className,
      )}
      data-slot="alert-description"
      {...props}
    />
  );
}

export function AlertAction({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn(
        "flex gap-1 max-sm:col-start-2 max-sm:mt-2 sm:row-start-1 sm:row-end-3 sm:self-center sm:[[data-slot=alert-description]~&]:col-start-2 sm:[[data-slot=alert-title]~&]:col-start-2 sm:[svg~&]:col-start-2 sm:[svg~[data-slot=alert-description]~&]:col-start-3 sm:[svg~[data-slot=alert-title]~&]:col-start-3",
        className,
      )}
      data-slot="alert-action"
      {...props}
    />
  );
}
