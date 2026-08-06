import { cn } from "@/core/utils"

type SynclyLogoProps = {
  className?: string
  size?: number
}

/** Brand mark used on auth screens and empty states. */
export function SynclyLogo({ className, size = 40 }: SynclyLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icons/syncly-mark.svg"
      alt="Syncly"
      width={size}
      height={size}
      className={cn("rounded-[22%] shadow-sm", className)}
      draggable={false}
    />
  )
}
