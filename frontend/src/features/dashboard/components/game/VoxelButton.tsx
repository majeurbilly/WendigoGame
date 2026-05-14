import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

const voxelBase =
  'inline-flex items-center justify-center gap-2 font-black uppercase tracking-wide text-stone-100 ' +
  'border-[3px] border-t-[#d4b896] border-l-[#d4b896] border-b-[#120a06] border-r-[#120a06] ' +
  'bg-gradient-to-b from-[#4a3f35] via-[#342b24] to-[#1c1612] ' +
  'shadow-[inset_0_2px_0_rgba(255,255,255,0.07),inset_0_-3px_0_rgba(0,0,0,0.35),0_4px_0_rgba(0,0,0,0.45)] ' +
  'transition-[transform,box-shadow,opacity] active:translate-y-[2px] active:shadow-[inset_0_3px_8px_rgba(0,0,0,0.45)] ' +
  'disabled:pointer-events-none disabled:opacity-40 disabled:active:translate-y-0'

export type VoxelButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'stone' | 'danger' | 'muted'
}

const variantClass: Record<NonNullable<VoxelButtonProps['variant']>, string> = {
  stone: '',
  danger:
    'from-[#5c2a2a] via-[#3d1818] to-[#240c0c] border-t-[#e8a0a0] border-l-[#e8a0a0] text-rose-50 shadow-[inset_0_2px_0_rgba(255,200,200,0.12),inset_0_-3px_0_rgba(0,0,0,0.4),0_4px_0_rgba(0,0,0,0.45)]',
  muted:
    'from-[#3a3a38] via-[#2a2a28] to-[#181816] border-t-[#9a9a90] border-l-[#9a9a90] text-stone-200',
}

const VoxelButton = forwardRef<HTMLButtonElement, VoxelButtonProps>(
  ({ className, variant = 'stone', type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={cn(voxelBase, variantClass[variant], 'rounded-md py-2.5 px-3 text-xs sm:text-sm', className)} {...props} />
  )
)
VoxelButton.displayName = 'VoxelButton'

export default VoxelButton
