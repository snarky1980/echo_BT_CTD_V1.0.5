import React, { useCallback } from 'react';

// Reverted to original simple pill rendering with OPTIONAL focus broadcast only on click/focus (no hover highlighting)
const PillComponent = ({ name, value, isFilled }) => {
  const className = `var-pill ${isFilled ? 'filled' : 'empty'}`;

  const emitFocus = useCallback(() => {
    try {
      const ev = new CustomEvent('ea-focus-variable', { detail: { key: name } })
      window.dispatchEvent(ev)
    } catch {}
  }, [name])

  const clearFocus = useCallback(() => {
    try {
      const ev = new CustomEvent('ea-focus-variable', { detail: { key: null } })
      window.dispatchEvent(ev)
    } catch {}
  }, [])

  return (
    <span
      className={className}
      data-var={name}
      onClick={emitFocus}
      onFocus={emitFocus}
      onBlur={clearFocus}
      tabIndex={0}
    >
      {value}
    </span>
  );
};

export default PillComponent;
