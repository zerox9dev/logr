"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Avatar as AvatarPrimitive } from "radix-ui"

const avatarVariants = cva(
  // The hairline edge is drawn by an ::after ring rather than a border so it
  // never eats into the avatar's own box and stays crisp over any artwork.
  "group/avatar relative flex shrink-0 select-none after:absolute after:inset-0 after:rounded-[inherit] after:border after:border-line after:mix-blend-darken",
  {
    variants: {
      size: {
        xs: "size-4 text-xs",
        sm: "size-6 text-xs",
        md: "size-8 text-md-minus",
        lg: "size-16 text-base",
        xl: "size-24 text-summary",
      },
      shape: {
        circle: "rounded-full",
        square: "",
      },
    },
    compoundVariants: [
      { shape: "square", size: "xs", class: "rounded-sm" },
      { shape: "square", size: "sm", class: "rounded-sm" },
      { shape: "square", size: "md", class: "rounded-md" },
      { shape: "square", size: "lg", class: "rounded-[10px]" },
      { shape: "square", size: "xl", class: "rounded-[10px]" },
    ],
    defaultVariants: {
      size: "md",
      shape: "circle",
    },
  },
)

function Avatar({
  className,
  size = "md",
  shape = "circle",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(avatarVariants({ size, shape, className }))}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square size-full rounded-[inherit] object-cover",
        className
      )}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-[inherit] bg-muted font-semibold text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none",
        "group-data-[size=xs]/avatar:hidden",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=md]/avatar:size-2.5 group-data-[size=md]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3.5 group-data-[size=lg]/avatar:[&>svg]:size-2.5",
        "group-data-[size=xl]/avatar:size-5 group-data-[size=xl]/avatar:[&>svg]:size-3.5",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className
      )}
      {...props}
    />
  )
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=xs]/avatar-group:size-4 group-has-data-[size=sm]/avatar-group:size-6 group-has-data-[size=lg]/avatar-group:size-16 group-has-data-[size=xl]/avatar-group:size-24",
        className
      )}
      {...props}
    />
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
  avatarVariants,
}
