"use client"

interface AvatarCirclesProps {
  avatarUrls: string[]
  className?: string
}

export function AvatarCircles({ avatarUrls, className = "" }: AvatarCirclesProps) {
  return (
    <div className={`flex -space-x-2 ${className}`}>
      {avatarUrls.map((url, i) => (
        <img
          key={i}
          src={url}
          alt=""
          width={32}
          height={32}
          className="w-8 h-8 rounded-full border-2 border-[#0E1117] object-cover"
          style={{ zIndex: avatarUrls.length - i }}
        />
      ))}
    </div>
  )
}
