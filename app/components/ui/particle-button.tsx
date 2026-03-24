"use client"

import * as React from "react"
import { useState, useRef } from "react"
import { ShadcnButton, type ShadcnButtonProps } from "@/app/components/ui/shadcn-button"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/app/lib/utils"

interface ParticleButtonProps extends ShadcnButtonProps {
  onSuccess?: () => void
  successDuration?: number
  particleColor?: string
  showIcon?: boolean
}

function SuccessParticles({
  buttonRef,
  color,
}: {
  buttonRef: React.RefObject<HTMLButtonElement>
  color: string
}) {
  const rect = buttonRef.current?.getBoundingClientRect()
  if (!rect) return null

  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  return (
    <AnimatePresence>
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed w-1.5 h-1.5 rounded-full pointer-events-none z-50"
          style={{ left: centerX, top: centerY, backgroundColor: color }}
          initial={{
            scale: 0,
            x: 0,
            y: 0,
            opacity: 1,
          }}
          animate={{
            scale: [0, 1.5, 0],
            x: [0, (i % 2 ? 1 : -1) * (Math.random() * 60 + 20)],
            y: [0, -Math.random() * 60 - 20],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 0.7,
            delay: i * 0.05,
            ease: "easeOut",
          }}
        />
      ))}
    </AnimatePresence>
  )
}

const ParticleButton = React.forwardRef<HTMLButtonElement, ParticleButtonProps>(
  (
    {
      children,
      onClick,
      onSuccess,
      successDuration = 800,
      particleColor = "#8b7cf7",
      className,
      showIcon = false,
      ...props
    },
    forwardedRef
  ) => {
    const [showParticles, setShowParticles] = useState(false)
    const internalRef = useRef<HTMLButtonElement>(null)
    const buttonRef = (forwardedRef as React.RefObject<HTMLButtonElement>) || internalRef

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setShowParticles(true)
      setTimeout(() => {
        setShowParticles(false)
      }, successDuration)

      onClick?.(e)
      onSuccess?.()
    }

    return (
      <>
        {showParticles && <SuccessParticles buttonRef={buttonRef} color={particleColor} />}
        <ShadcnButton
          ref={buttonRef}
          onClick={handleClick}
          className={cn(
            "relative cursor-pointer",
            showParticles && "scale-95",
            "transition-transform duration-100",
            className
          )}
          {...props}
        >
          {children}
        </ShadcnButton>
      </>
    )
  }
)

ParticleButton.displayName = "ParticleButton"

export { ParticleButton }
export type { ParticleButtonProps }
