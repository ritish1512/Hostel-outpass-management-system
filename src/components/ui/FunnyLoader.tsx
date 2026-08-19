'use client'

import { useState, useEffect } from 'react'
import { Loader2, Bone, Coffee, Flame, Footprints } from 'lucide-react'

const FUNNY_PHRASES = [
  "Chasing the tail of the data...",
  "Feeding the hamsters powering our servers...",
  "Recalculating the meaning of life (and code)...",
  "Reticulating splines...",
  "The code is fine, the server is just taking a nap...",
  "Mining crypto to pay for this database query...",
  "Spinning the wheel of fortune...",
  "Brewing espresso for the backend...",
]

const ICONS = [
  <Bone className="w-8 h-8 text-amber-500 animate-bounce" key="bone" />,
  <Coffee className="w-8 h-8 text-amber-500 animate-bounce" key="coffee" />,
  <Flame className="w-8 h-8 text-amber-500 animate-bounce" key="flame" />,
  <Footprints className="w-8 h-8 text-amber-500 animate-bounce" key="steps" />,
]

export default function FunnyLoader() {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [iconIndex, setIconIndex] = useState(0)

  useEffect(() => {
    // Cycle phrases every 2.5 seconds
    const phraseInterval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % FUNNY_PHRASES.length)
    }, 4500)

    // Cycle icons every 4 seconds to match changing themes
    const iconInterval = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % ICONS.length)
    }, 6000)

    return () => {
      clearInterval(phraseInterval)
      clearInterval(iconInterval)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-950 rounded-2xl shadow-2xl max-w-sm mx-auto border border-zinc-800 text-center">
      {/* Spinner Graphic */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer Rotating Loader */}
        <Loader2 className="w-20 h-20 text-zinc-700 animate-[spin_3s_linear_infinite] absolute" />

        {/* Inner Faster Loader */}
        <Loader2 className="w-16 h-16 text-amber-400 animate-spin absolute" />

        {/* Center Dynamic Icon */}
        <div className="z-10 bg-zinc-950 p-2 rounded-full">
          {ICONS[iconIndex]}
        </div>
      </div>

      {/* Text Container */}
      <div className="mt-6 min-h-[50px] flex flex-col justify-center">
        <p className="text-zinc-400 text-xs font-bold tracking-widest uppercase mb-1 animate-pulse">
          Loading...
        </p>
        <p className="text-zinc-200 text-sm font-medium transition-all duration-300 ease-in-out">
          {FUNNY_PHRASES[phraseIndex]}
        </p>
      </div>
    </div>
  )
}
