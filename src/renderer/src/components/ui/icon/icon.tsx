import { ICON_MAP, IconVariant } from './icon-map'

export type IconProps = {
  size: string
  variant: IconVariant
  className?: string
}

export function Icon({ size, variant, className }: IconProps) {
  const Obj = ICON_MAP[variant]
  return (
    <div style={{ width: size, height: size }} className={className}>
      <Obj />
    </div>
  )
}
