export interface Layer {
    id: string;
    type: "image" | "text";
    content: string; // image src or text
    x: number;
    y: number;
    width?: number;
    height?: number;
    fontSize?: number;
    // Text layer options
    color?: string;
    fontFamily?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    // Image layer options
    opacity?: number;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    rotation?: number;
}

