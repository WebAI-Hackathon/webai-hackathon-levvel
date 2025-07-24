// src/components/Tool.tsx
import React, { useRef, useEffect } from 'react';

// Define the type for the event handler prop
type ToolCallEventHandler = (event: CustomEvent) => void;

// Define the component's props
type ToolProps = {
    name: string;
    description: string;
    onCall: ToolCallEventHandler;
    return?: boolean;
    children?: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, 'onCall'>;

export function Tool({
                         name,
                         description,
                         onCall,
                         children,
                         // Rename the 'return' prop to avoid conflict with the JS keyword
                         return: returnProp,
                         ...rest
                     }: ToolProps) {
    const toolRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const element = toolRef.current;
        if (!element || !onCall) return;

        const listener = (event: CustomEvent) => onCall(event);

        element.addEventListener('call', listener);

        return () => {
            element.removeEventListener('call', listener);
        };
    }, [onCall]); // Re-attach the listener if the onCall function changes

    return (
        <tool
            ref={toolRef}
            name={name}
            description={description}
            return={returnProp}
            {...rest}
        >
            {children}
        </tool>
    );
}
