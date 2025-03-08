import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { forwardRef } from 'react'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
  onKeyDown?: (e: React.KeyboardEvent) => void
  onBlur?: () => void
}

export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  ({ value, onChange, onSend, disabled, onKeyDown, onBlur }, ref) => {
    return (
      <div className='flex gap-2 border-t p-4 sticky bottom-0 bg-background'>
        <Input
          ref={ref}
          className='focus-visible:ring-2'
          placeholder='Type a message...'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          disabled={disabled}
        />
        <Button onClick={onSend} disabled={disabled}>
          {disabled ? 'Sending...' : 'Send'}
        </Button>
      </div>
    )
  }
) 