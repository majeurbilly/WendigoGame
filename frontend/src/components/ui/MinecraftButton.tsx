import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type MinecraftButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
}

export default function MinecraftButton({
  className,
  disabled,
  type = 'button',
  ...props
}: MinecraftButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'w-full select-none bg-[#c6c6c6] px-5 py-3 text-center font-bold text-[#333]',
        'border-4 border-t-white border-l-white border-b-[#555555] border-r-[#555555]',
        'shadow-[inset_0_-2px_0_rgba(0,0,0,0.25)]',
        'transition-colors',
        !disabled && 'hover:bg-[#d6d6d6] hover:text-yellow-300',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
      {...props}
    />
  )
}

