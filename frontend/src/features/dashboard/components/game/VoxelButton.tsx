import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

const voxelBase =
  'inline-flex items-center justify-center gap-2 font-black uppercase tracking-wide text-stone-100 ' +
  'border-[4px] border-t-[#e8dcc4] border-l-[#e8dcc4] border-b-[#0a0604] border-r-[#0a0604] ' +
  'bg-gradient-to-b from-[#4a3f35] via-[#342b24] to-[#1c1612] ' +
  'shadow-[inset_0_3px_0_rgba(255,255,255,0.12),inset_0_-5px_0_rgba(0,0,0,0.42),0_6px_0_rgba(0,0,0,0.55),0_10px_24px_rgba(0,0,0,0.4)] ' +
  'transition-[transform,box-shadow,opacity] active:translate-y-[3px] active:shadow-[inset_0_4px_12px_rgba(0,0,0,0.5),0_2px_0_rgba(0,0,0,0.4)] ' +
  'disabled:pointer-events-none disabled:opacity-40 disabled:active:translate-y-0'

/** Gros levier centré en bas de tablette — moins large que l’îlot, relief maximal. */
const tabletMechanismClass =
  'mx-auto flex w-[min(100%,18.5rem)] justify-center rounded-xl py-3.5 px-5 text-sm tracking-[0.12em] sm:text-base'

export type VoxelButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'stone' | 'danger' | 'muted'
  /** Style « mécanisme à enclencher » pour la confirmation principale sur la tablette. */
  tabletMechanism?: boolean
}

const variantClass: Record<NonNullable<VoxelButtonProps['variant']>, string> = {
  stone: '',
  danger:
    'from-[#5c2a2a] via-[#3d1818] to-[#240c0c] border-t-[#ffc4c4] border-l-[#ffc4c4] border-b-[#1a0505] border-r-[#1a0505] text-rose-50 ' +
    'shadow-[inset_0_3px_0_rgba(255,200,200,0.18),inset_0_-5px_0_rgba(0,0,0,0.45),0_6px_0_rgba(0,0,0,0.55),0_10px_28px_rgba(80,0,0,0.35)]',
  muted:
    'from-[#3a3a38] via-[#2a2a28] to-[#181816] border-t-[#c4c4bc] border-l-[#c4c4bc] border-b-[#0c0c0a] border-r-[#0c0c0a] text-stone-200 ' +
    'shadow-[inset_0_3px_0_rgba(255,255,255,0.08),inset_0_-5px_0_rgba(0,0,0,0.4),0_6px_0_rgba(0,0,0,0.5)]',
}

const VoxelButton = forwardRef<HTMLButtonElement, VoxelButtonProps>(
  ({ className, variant = 'stone', type = 'button', tabletMechanism = false, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(voxelBase, variantClass[variant], tabletMechanism ? tabletMechanismClass : 'rounded-lg py-2.5 px-3 text-xs sm:text-sm', className)}
      {...props}
    />
  )
)
VoxelButton.displayName = 'VoxelButton'

export default VoxelButton
