import React from 'react';

const NeoInput = ({
    className = '',
    ...props
}) => {
    return (
        <input
            className={`
        bg-black/30 
        border-[1.5px] border-primary/20 
        rounded-xl 
        px-[18px] py-[14px] 
        text-[15px] 
        text-white 
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] 
        focus:border-primary/60 
        focus:shadow-[0_0_0_4px_rgba(255,107,53,0.1)] 
        focus:bg-black/50 
        placeholder:text-secondary 
        outline-none 
        ${className}
      `}
            {...props}
        />
    );
};

export default NeoInput;
