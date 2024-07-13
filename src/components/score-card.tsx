import { cn } from '@/lib/utils'
import React from 'react'

type ScoreCardProps = {
    name: 'positive' | 'negative' | 'neutral';
    percentage: number;
}

const ScoreCard = ({name, percentage}:ScoreCardProps) => {
  return (
    <div key={name} className={cn("flex-1 rounded-lg p-4 text-center min-w-max",
        // percentage < 100 ?? "mx-3",
        name=== "positive" ? "bg-emerald-500/15 text-emerald-600" : name === "negative" ? "bg-rose-500/15 text-rose-600" : "bg-neutral-500/15 text-neutral-800"
    )}>
    <div className="text-4xl font-bold w-fit">
      {percentage}%
    </div>
    <div className="text-sm font-medium capitalize">{name}</div>
  </div>
  )
}

export default ScoreCard