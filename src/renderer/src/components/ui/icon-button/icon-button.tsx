import { Button, ButtonProps } from '@mantine/core'

import { Icon, IconVariant } from '../icon'

type IconButtonProps = ButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon_size: number // px
    variant: IconVariant
    className?: string
  }

export function IconButton({ icon_size, variant, className, ...otherProps }: IconButtonProps) {
  return (
    <Button type="button" variant="transparent" className={className} p={0} {...otherProps}>
      <Icon variant={variant} size={`${icon_size}px`} />
    </Button>
  )
}
