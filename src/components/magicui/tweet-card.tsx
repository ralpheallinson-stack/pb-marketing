import { Suspense } from "react"
import { Tweet } from "react-tweet"
import { cn } from "@/lib/utils"

export function MagicTweet({
  id,
  className,
}: {
  id: string
  className?: string
}) {
  return (
    <div className={cn("[&_[data-theme=light]]:hidden", className)}>
      <Tweet id={id} />
    </div>
  )
}

export function TweetSkeleton() {
  return (
    <div className="w-full h-[200px] rounded-xl bg-white/5 animate-pulse" />
  )
}
