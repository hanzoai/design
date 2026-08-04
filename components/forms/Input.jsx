import React from 'react'

export function Input({ invalid = false, style, ...rest }) {
  const [focus, setFocus] = React.useState(false)
  return (
    <input
      onFocus={(e)=>{setFocus(true);rest.onFocus&&rest.onFocus(e)}}
      onBlur={(e)=>{setFocus(false);rest.onBlur&&rest.onBlur(e)}}
      style={{
        width:'100%',height:36,padding:'0 12px',
        fontFamily:'var(--font-sans)',fontSize:'var(--text-control)',color:'var(--foreground)',
        background:'var(--surface-2)',
        border:'1px solid ' + (invalid ? 'var(--state-error)' : focus ? 'var(--border-focus)' : 'var(--border-control)'),
        borderRadius:'var(--radius-sm)',
        transition:'border-color var(--duration-fast) var(--ease-out)',
        ...style,
      }}
      {...rest}
    />
  )
}
