/// <reference types="vite/client" />
declare namespace JSX {
    interface IntrinsicElements {
        'context': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
            // Add any custom props here
            name?: string;
        }, HTMLElement>;
        // You can add more custom elements here if needed
        'tool': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
            name: string;
            description?: string;
            return?: boolean;
        }, HTMLElement>;

        'prop': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
            name: string;
            type: string;
            required?: boolean;
            description?: string;
        }, HTMLElement>;

        'array': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {}, HTMLElement>;
        'dict': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {}, HTMLElement>;
    }
}
