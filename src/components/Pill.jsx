import React from 'react';

const Pill = ({ name, value, isFilled }) => {
  const className = `var-pill ${isFilled ? 'filled' : 'empty'}`;
  return (
    <span className={className} contentEditable={false} data-var={name}>
      {value || `<<${name}>>`}
    </span>
  );
};

export default Pill;
