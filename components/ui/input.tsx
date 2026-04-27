import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base
        'h-10 w-full min-w-0 rounded-lg border px-3 py-2 text-sm',
        // Colors — always light
        'border-gray-300 bg-white text-gray-900 placeholder:text-gray-400',
        // Shadow so it looks like a real input box
        'shadow-sm',
        // Focus
        'outline-none transition-[border-color,box-shadow]',
        'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
        // Error state
        'aria-invalid:border-red-400 aria-invalid:ring-2 aria-invalid:ring-red-400/20',
        // Disabled
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
        // File input
        'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-700',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
