import {type DragEvent, useEffect, useRef, useState} from "react";

// Extend Layer type for text formatting
interface Layer {
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
    borderRadius?: number; // Add this line
    // Add rotation property to Layer
    rotation?: number;
}

export default function ImageDropCanvas() {
    const [layers, setLayers] = useState<Layer[]>([]);
    const [textInput, setTextInput] = useState("");
    const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState<{x: number; y: number} | null>(null);
    const [bgColor, setBgColor] = useState<string>("#fff");
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Cache loaded images
    const [imageCache, setImageCache] = useState<{[src: string]: HTMLImageElement}>({});

    // Add image layer on drop
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const imgSrc = event.target?.result as string;
                // Add new image layer
                setLayers(layers => [
                    ...layers,
                    {
                        id: Math.random().toString(36).slice(2),
                        type: "image",
                        content: imgSrc,
                        x: 10,
                        y: 10,
                        width: 200,
                        height: 150,
                    },
                ]);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    // Add text layer
    const handleAddText = () => {
        if (textInput.trim()) {
            setLayers(layers => [
                ...layers,
                {
                    id: Math.random().toString(36).slice(2),
                    type: "text",
                    content: textInput,
                    x: 20,
                    y: 40,
                    fontSize: 32,
                },
            ]);
            setTextInput("");
        }
    };

    // Preload images when layers change
    useEffect(() => {
        const imageLayers = layers.filter(l => l.type === "image");
        imageLayers.forEach(layer => {
            if (!imageCache[layer.content]) {
                const img = new window.Image();
                img.src = layer.content;
                img.onload = () => {
                    setImageCache(cache => ({ ...cache, [layer.content]: img }));
                };
            }
        });
    }, [layers, imageCache]);

    const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
    const [resizeHandle, setResizeHandle] = useState<null | {corner: string}> (null);
    // Store initial mouse X and font size for text resizing
    const [resizeStart, setResizeStart] = useState<{mouseX: number; fontSize: number} | null>(null);

    // Add local state for rotation input
    const [rotationInput, setRotationInput] = useState<string>("");

    // Helper: get layer by id
    const getLayerById = (id: string | null) => layers.find(l => l.id === id);

    // Helper: update selected layer and sync rotation input only for rotation
    const updateSelectedLayer = (props: Partial<Layer>) => {
        setLayers(layers => layers.map(l => l.id === selectedLayerId ? { ...l, ...props } : l));
        if (Object.prototype.hasOwnProperty.call(props, "rotation")) {
            if (props.rotation !== undefined && props.rotation !== null) {
                setRotationInput(String(props.rotation));
            } else {
                setRotationInput("");
            }
        }
    };

    // Sync rotationInput when selected layer changes
    useEffect(() => {
        const layer = getLayerById(selectedLayerId);
        if (layer) {
            setRotationInput(
                layer.rotation !== undefined && layer.rotation !== null
                    ? String(layer.rotation)
                    : "0"
            );
        } else {
            setRotationInput("");
        }
    }, [selectedLayerId, layers]);

    // Draw all layers synchronously, with resize/rotate handles for selected layer
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        layers.forEach(layer => {
            ctx.save();
            // Apply rotation if set
            const angle = (layer.rotation ?? 0) * Math.PI / 180;
            let cx = layer.x, cy = layer.y;
            if (layer.type === "image") {
                cx += (layer.width || (imageCache[layer.content]?.width ?? 0)) / 2;
                cy += (layer.height || (imageCache[layer.content]?.height ?? 0)) / 2;
            } else if (layer.type === "text") {
                ctx.font = `${layer.fontSize || 24}px ${layer.fontFamily || "sans-serif"}`;
                const textWidth = ctx.measureText(layer.content).width;
                cx += textWidth / 2;
                cy -= (layer.fontSize || 24) / 2;
            }
            ctx.translate(cx, cy);
            ctx.rotate(angle);
            ctx.translate(-cx, -cy);
            // Draw layer
            if (layer.type === "image") {
                const img = imageCache[layer.content];
                if (img) {
                    ctx.save();
                    ctx.globalAlpha = layer.opacity ?? 1;
                    // Draw rounded rect if borderRadius is set
                    const w = layer.width || img.width;
                    const h = layer.height || img.height;
                    const r = layer.borderRadius ?? 0;
                    if (r > 0) {
                        ctx.beginPath();
                        // Rounded rect path
                        ctx.moveTo(layer.x + r, layer.y);
                        ctx.lineTo(layer.x + w - r, layer.y);
                        ctx.quadraticCurveTo(layer.x + w, layer.y, layer.x + w, layer.y + r);
                        ctx.lineTo(layer.x + w, layer.y + h - r);
                        ctx.quadraticCurveTo(layer.x + w, layer.y + h, layer.x + w - r, layer.y + h);
                        ctx.lineTo(layer.x + r, layer.y + h);
                        ctx.quadraticCurveTo(layer.x, layer.y + h, layer.x, layer.y + h - r);
                        ctx.lineTo(layer.x, layer.y + r);
                        ctx.quadraticCurveTo(layer.x, layer.y, layer.x + r, layer.y);
                        ctx.closePath();
                        ctx.clip();
                    }
                    ctx.drawImage(
                        img,
                        layer.x,
                        layer.y,
                        w,
                        h
                    );
                    if (layer.borderWidth && layer.borderWidth > 0) {
                        ctx.save();
                        ctx.strokeStyle = layer.borderColor || "#000";
                        ctx.lineWidth = layer.borderWidth;
                        if (r > 0) {
                            ctx.beginPath();
                            ctx.moveTo(layer.x + r, layer.y);
                            ctx.lineTo(layer.x + w - r, layer.y);
                            ctx.quadraticCurveTo(layer.x + w, layer.y, layer.x + w, layer.y + r);
                            ctx.lineTo(layer.x + w, layer.y + h - r);
                            ctx.quadraticCurveTo(layer.x + w, layer.y + h, layer.x + w - r, layer.y + h);
                            ctx.lineTo(layer.x + r, layer.y + h);
                            ctx.quadraticCurveTo(layer.x, layer.y + h, layer.x, layer.y + h - r);
                            ctx.lineTo(layer.x, layer.y + r);
                            ctx.quadraticCurveTo(layer.x, layer.y, layer.x + r, layer.y);
                            ctx.closePath();
                            ctx.stroke();
                        } else {
                            ctx.strokeRect(layer.x, layer.y, w, h);
                        }
                        ctx.restore();
                    }
                    ctx.restore();
                    // Draw resize handles if selected
                    if (layer.id === selectedLayerId) {
                        const w = layer.width || img.width;
                        const h = layer.height || img.height;
                        ctx.save();
                        ctx.strokeStyle = "#007bff";
                        ctx.lineWidth = 2;
                        ctx.strokeRect(layer.x, layer.y, w, h);
                        // Draw handles (corners)
                        const handleSize = 8;
                        const handles = [
                            [layer.x, layer.y],
                            [layer.x + w, layer.y],
                            [layer.x, layer.y + h],
                            [layer.x + w, layer.y + h],
                        ];
                        ctx.fillStyle = "#fff";
                        ctx.strokeStyle = "#007bff";
                        handles.forEach(([hx, hy]) => {
                            ctx.beginPath();
                            ctx.arc(hx, hy, handleSize, 0, 2 * Math.PI);
                            ctx.fill();
                            ctx.stroke();
                        });
                        ctx.restore();
                    }
                }
            } else if (layer.type === "text") {
                let fontStyle = "";
                if (layer.italic) fontStyle += "italic ";
                if (layer.bold) fontStyle += "bold ";
                ctx.font = `${fontStyle}${layer.fontSize || 24}px ${layer.fontFamily || "sans-serif"}`;
                ctx.fillStyle = layer.color || "#222";
                ctx.textBaseline = "alphabetic";
                ctx.fillText(layer.content, layer.x, layer.y);
                // Underline/strikethrough
                if (layer.underline || layer.strikethrough) {
                    const textWidth = ctx.measureText(layer.content).width;
                    if (layer.underline) {
                        ctx.strokeStyle = layer.color || "#222";
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(layer.x, layer.y + 2);
                        ctx.lineTo(layer.x + textWidth, layer.y + 2);
                        ctx.stroke();
                    }
                    if (layer.strikethrough) {
                        ctx.strokeStyle = layer.color || "#222";
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(layer.x, layer.y - (layer.fontSize || 24) / 2);
                        ctx.lineTo(layer.x + textWidth, layer.y - (layer.fontSize || 24) / 2);
                        ctx.stroke();
                    }
                }
                // Draw improved resize handle if selected
                if (layer.id === selectedLayerId) {
                    const fontSize = layer.fontSize || 24;
                    const textWidth = ctx.measureText(layer.content).width;
                    ctx.save();
                    ctx.strokeStyle = "#007bff";
                    ctx.lineWidth = 2;
                    ctx.setLineDash([4, 2]);
                    ctx.strokeRect(layer.x, layer.y - fontSize, textWidth, fontSize);
                    ctx.setLineDash([]);
                    // Draw larger handle at right-middle for resize
                    const resizeHandleSize = 14;
                    const resizeHandleX = layer.x + textWidth + 8;
                    const resizeHandleY = layer.y - fontSize / 2;
                    ctx.beginPath();
                    ctx.arc(resizeHandleX, resizeHandleY, resizeHandleSize, 0, 2 * Math.PI);
                    ctx.fillStyle = "#fff";
                    ctx.strokeStyle = "#007bff";
                    ctx.fill();
                    ctx.stroke();
                    // Draw rotate handle at bottom center
                    const rotateHandleSize = 12;
                    const rotateHandleX = layer.x + textWidth / 2;
                    const rotateHandleY = layer.y + 18;
                    ctx.beginPath();
                    ctx.arc(rotateHandleX, rotateHandleY, rotateHandleSize, 0, 2 * Math.PI);
                    ctx.fillStyle = "#fff";
                    ctx.strokeStyle = "#28a745";
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                }
            }
            ctx.restore();
        });
        // If resizing text, show preview line for new font size
        if (resizeHandle && selectedLayerId) {
            const layer = getLayerById(selectedLayerId);
            if (layer && layer.type === "text" && resizeHandle.corner === "right") {
                ctx.save();
                ctx.strokeStyle = "#007bff";
                ctx.setLineDash([2, 2]);
                ctx.lineWidth = 1.5;
                ctx.font = `${layer.fontSize || 24}px sans-serif`;
                const textWidth = ctx.measureText(layer.content).width;
                ctx.beginPath();
                ctx.moveTo(layer.x, layer.y - (layer.fontSize || 24));
                ctx.lineTo(layer.x + textWidth, layer.y - (layer.fontSize || 24));
                ctx.stroke();
                ctx.restore();
            }
        }
    }, [layers, imageCache, bgColor, selectedLayerId, resizeHandle]);

    // Add rotate handle logic
    const [rotateHandleActive, setRotateHandleActive] = useState(false);
    // Store initial mouse position, start angle, and initial angle from center to mouse
    const [rotateStart, setRotateStart] = useState<{
        mouseX: number;
        mouseY: number;
        startAngle: number;
        initialAngle: number;
    } | null>(null);

    // Mouse event handlers for selecting, dragging, and resizing layers
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let resizing = false;

        const handleMouseDown = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Helper function to transform mouse coordinates for a rotated layer
            const getLocalMouseCoords = (layer: Layer) => {
                const angle = layer.rotation ?? 0;
                if (angle === 0) return { x: mouseX, y: mouseY };

                const angleRad = -angle * Math.PI / 180;
                const cos = Math.cos(angleRad);
                const sin = Math.sin(angleRad);

                const ctx = canvas.getContext("2d");
                if (!ctx) return { x: mouseX, y: mouseY };

                let cx, cy;
                if (layer.type === "image") {
                    const img = imageCache[layer.content];
                    const w = layer.width || (img ? img.width : 100);
                    const h = layer.height || (img ? img.height : 100);
                    cx = layer.x + w / 2;
                    cy = layer.y + h / 2;
                } else { // text
                    ctx.font = `${layer.fontSize || 24}px ${layer.fontFamily || "sans-serif"}`;
                    const textWidth = ctx.measureText(layer.content).width;
                    cx = layer.x + textWidth / 2;
                    cy = layer.y - (layer.fontSize || 24) / 2;
                }

                const dx = mouseX - cx;
                const dy = mouseY - cy;
                const localX = dx * cos - dy * sin + cx;
                const localY = dx * sin + dy * cos + cy;

                return { x: localX, y: localY };
            };

            // Check handles first (rotate, then resize)
            for (let i = layers.length - 1; i >= 0; i--) {
                const layer = layers[i];
                if (layer.id !== selectedLayerId) continue;

                const { x: localMouseX, y: localMouseY } = getLocalMouseCoords(layer);

                // 1. Check for rotate handle (text only for now)
                if (layer.type === "text") {
                    const fontSize = layer.fontSize || 24;
                    const ctx = canvas.getContext("2d");
                    ctx.font = `${fontSize}px sans-serif`;
                    const textWidth = ctx.measureText(layer.content).width;
                    const rotateHandleX = layer.x + textWidth / 2;
                    const rotateHandleY = layer.y + 18;
                    if (Math.abs(localMouseX - rotateHandleX) < 16 && Math.abs(localMouseY - rotateHandleY) < 16) {
                        setRotateHandleActive(true);
                        const cx = layer.x + textWidth / 2;
                        const cy = layer.y - fontSize / 2;
                        const dx = mouseX - cx; // Use original mouse coords for angle calculation
                        const dy = mouseY - cy;
                        const initialAngle = Math.atan2(dy, dx) * 180 / Math.PI;
                        setRotateStart({
                            mouseX,
                            mouseY,
                            startAngle: layer.rotation ?? 0,
                            initialAngle,
                        });
                        return; // Found handle, stop processing
                    }
                }

                // 2. Check for resize handles
                if (layer.type === "image") {
                    const w = layer.width || 100;
                    const h = layer.height || 100;
                    const handles = [
                        { corner: "tl", x: layer.x, y: layer.y },
                        { corner: "tr", x: layer.x + w, y: layer.y },
                        { corner: "bl", x: layer.x, y: layer.y + h },
                        { corner: "br", x: layer.x + w, y: layer.y + h },
                    ];
                    for (const handle of handles) {
                        if (Math.abs(localMouseX - handle.x) < 12 && Math.abs(localMouseY - handle.y) < 12) {
                            setResizeHandle({ corner: handle.corner });
                            resizing = true;
                            return;
                        }
                    }
                } else if (layer.type === "text") {
                    const fontSize = layer.fontSize || 24;
                    const ctx = canvas.getContext("2d");
                    ctx.font = `${fontSize}px sans-serif`;
                    const textWidth = ctx.measureText(layer.content).width;
                    const handleX = layer.x + textWidth + 8;
                    const handleY = layer.y - fontSize / 2;
                    if (Math.abs(localMouseX - handleX) < 18 && Math.abs(localMouseY - handleY) < 18) {
                        setResizeHandle({ corner: "right" });
                        setResizeStart({ mouseX, fontSize });
                        resizing = true;
                        return;
                    }
                }
            }

            // If no handle was clicked, check for layer selection/dragging
            for (let i = layers.length - 1; i >= 0; i--) {
                const layer = layers[i];
                const { x: localMouseX, y: localMouseY } = getLocalMouseCoords(layer);

                if (layer.type === "text") {
                    const fontSize = layer.fontSize || 24;
                    const ctx = canvas.getContext("2d");
                    ctx.font = `${fontSize}px sans-serif`;
                    const textWidth = ctx.measureText(layer.content).width;
                    const textHeight = fontSize;
                    if (
                        localMouseX >= layer.x &&
                        localMouseX <= layer.x + textWidth &&
                        localMouseY >= layer.y - textHeight &&
                        localMouseY <= layer.y
                    ) {
                        setSelectedLayerId(layer.id);
                        setDraggedLayerId(layer.id);
                        setDragOffset({ x: mouseX - layer.x, y: mouseY - layer.y });
                        return;
                    }
                } else if (layer.type === "image") {
                    const width = layer.width || 100;
                    const height = layer.height || 100;
                    if (
                        localMouseX >= layer.x &&
                        localMouseX <= layer.x + width &&
                        localMouseY >= layer.y &&
                        localMouseY <= layer.y + height
                    ) {
                        setSelectedLayerId(layer.id);
                        setDraggedLayerId(layer.id);
                        setDragOffset({ x: mouseX - layer.x, y: mouseY - layer.y });
                        return;
                    }
                }
            }

            // If nothing was clicked, deselect
            setSelectedLayerId(null);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Helper function to transform mouse coordinates for a rotated layer
            const getLocalMouseCoords = (layer: Layer) => {
                const angle = layer.rotation ?? 0;
                if (angle === 0) return { x: mouseX, y: mouseY };

                const angleRad = -angle * Math.PI / 180;
                const cos = Math.cos(angleRad);
                const sin = Math.sin(angleRad);

                const ctx = canvas.getContext("2d");
                if (!ctx) return { x: mouseX, y: mouseY };

                let cx, cy;
                if (layer.type === "image") {
                    const img = imageCache[layer.content];
                    const w = layer.width || (img ? img.width : 100);
                    const h = layer.height || (img ? img.height : 100);
                    cx = layer.x + w / 2;
                    cy = layer.y + h / 2;
                } else { // text
                    ctx.font = `${layer.fontSize || 24}px ${layer.fontFamily || "sans-serif"}`;
                    const textWidth = ctx.measureText(layer.content).width;
                    cx = layer.x + textWidth / 2;
                    cy = layer.y - (layer.fontSize || 24) / 2;
                }

                const dx = mouseX - cx;
                const dy = mouseY - cy;
                const localX = dx * cos - dy * sin + cx;
                const localY = dx * sin + dy * cos + cy;

                return { x: localX, y: localY };
            };

            // Rotate logic for text
            if (rotateHandleActive && selectedLayerId && rotateStart) {
                setLayers(layers => layers.map(layer => {
                    if (layer.id !== selectedLayerId || layer.type !== "text") return layer;
                    // Center of text
                    const fontSize = layer.fontSize || 24;
                    const ctx = canvas.getContext("2d");
                    ctx.font = `${fontSize}px sans-serif`;
                    const textWidth = ctx.measureText(layer.content).width;
                    const cx = layer.x + textWidth / 2;
                    const cy = layer.y - fontSize / 2;
                    // Calculate current angle from center to mouse
                    const dx = mouseX - cx;
                    const dy = mouseY - cy;
                    const currentAngle = Math.atan2(dy, dx) * 180 / Math.PI;
                    // Calculate delta from initial angle
                    const deltaAngle = currentAngle - rotateStart.initialAngle;
                    // Apply rotation relative to startAngle
                    return { ...layer, rotation: rotateStart.startAngle + deltaAngle };
                }));
                return;
            }
            // Improved text resize logic
            if (resizeHandle && selectedLayerId) {
                setLayers(layers => layers.map(layer => {
                    if (layer.id !== selectedLayerId) return layer;

                    const { x: localMouseX, y: localMouseY } = getLocalMouseCoords(layer);

                    if (layer.type === "image") {
                        const oldW = layer.width || 100;
                        const oldH = layer.height || 100;

                        // Determine the anchor point (the corner opposite to the handle)
                        // This point should remain stationary in world coordinates during resize.
                        const getAnchor = () => {
                            const cx = layer.x + oldW / 2;
                            const cy = layer.y + oldH / 2;
                            const angleRad = (layer.rotation ?? 0) * Math.PI / 180;
                            const cos = Math.cos(angleRad);
                            const sin = Math.sin(angleRad);

                            let anchorXLocal = 0, anchorYLocal = 0;
                            switch (resizeHandle.corner) {
                                case "tl": anchorXLocal = oldW; anchorYLocal = oldH; break;
                                case "tr": anchorXLocal = 0; anchorYLocal = oldH; break;
                                case "bl": anchorXLocal = oldW; anchorYLocal = 0; break;
                                case "br": anchorXLocal = 0; anchorYLocal = 0; break;
                            }

                            const anchorVecX = anchorXLocal - oldW / 2;
                            const anchorVecY = anchorYLocal - oldH / 2;

                            const rotatedAnchorVecX = anchorVecX * cos - anchorVecY * sin;
                            const rotatedAnchorVecY = anchorVecX * sin + anchorVecY * cos;

                            return {
                                x: cx + rotatedAnchorVecX,
                                y: cy + rotatedAnchorVecY,
                            };
                        };

                        const anchor = getAnchor();

                        // We need to find the new top-left corner (newX, newY) and dimensions (newW, newH)
                        // such that the anchor point remains the same.
                        const angleRad = (layer.rotation ?? 0) * Math.PI / 180;
                        const cos = Math.cos(angleRad);
                        const sin = Math.sin(angleRad);
                        const invCos = Math.cos(-angleRad);
                        const invSin = Math.sin(-angleRad);

                        // Vector from anchor to current mouse position in world coordinates
                        const mouseVecX = mouseX - anchor.x;
                        const mouseVecY = mouseY - anchor.y;

                        // Rotate this vector into the layer's local coordinate system
                        const localMouseVecX = mouseVecX * invCos - mouseVecY * invSin;
                        const localMouseVecY = mouseVecX * invSin + mouseVecY * invCos;

                        let newW = 0, newH = 0;
                        let localHandleX = 0, localHandleY = 0;

                        switch (resizeHandle.corner) {
                            case "tl":
                                newW = -localMouseVecX;
                                newH = -localMouseVecY;
                                localHandleX = -newW;
                                localHandleY = -newH;
                                break;
                            case "tr":
                                newW = localMouseVecX;
                                newH = -localMouseVecY;
                                localHandleX = newW;
                                localHandleY = -newH;
                                break;
                            case "bl":
                                newW = -localMouseVecX;
                                newH = localMouseVecY;
                                localHandleX = -newW;
                                localHandleY = newH;
                                break;
                            case "br":
                                newW = localMouseVecX;
                                newH = localMouseVecY;
                                localHandleX = newW;
                                localHandleY = newH;
                                break;
                        }

                        newW = Math.max(10, newW);
                        newH = Math.max(10, newH);

                        // The anchor in the new local coordinate system
                        const localAnchorX = resizeHandle.corner.includes("l") ? newW : 0;
                        const localAnchorY = resizeHandle.corner.includes("t") ? newH : 0;

                        // Center of the new rectangle in local coordinates
                        const localNewCenterX = newW / 2;
                        const localNewCenterY = newH / 2;

                        // Vector from the new center to the anchor in local coordinates
                        const vecCenterX = localAnchorX - localNewCenterX;
                        const vecCenterY = localAnchorY - localNewCenterY;

                        // Rotate this vector to world coordinates
                        const rotatedVecCenterX = vecCenterX * cos - vecCenterY * sin;
                        const rotatedVecCenterY = vecCenterX * sin + vecCenterY * cos;

                        // The new center in world coordinates
                        const newCenterX = anchor.x - rotatedVecCenterX;
                        const newCenterY = anchor.y - rotatedVecCenterY;

                        // The new top-left corner (x, y)
                        const newX = newCenterX - newW / 2;
                        const newY = newCenterY - newH / 2;

                        return { ...layer, x: newX, y: newY, width: newW, height: newH };
                    } else if (layer.type === "text" && resizeHandle.corner === "right" && resizeStart) {
                        // Calculate new font size based on horizontal drag from initial mouseX
                        const deltaX = mouseX - resizeStart.mouseX; // Text resize is simpler, no need for local coords here
                        const fontSize = Math.max(8, resizeStart.fontSize + deltaX / 2);
                        return { ...layer, fontSize };
                    }
                    return layer;
                }));
                return;
            }
            // Drag logic
            if (draggedLayerId && dragOffset) {
                setLayers(layers =>
                    layers.map(layer =>
                        layer.id === draggedLayerId
                            ? { ...layer, x: mouseX - dragOffset.x, y: mouseY - dragOffset.y }
                            : layer
                    )
                );
            }
        };

        const handleMouseUp = () => {
            setDraggedLayerId(null);
            setDragOffset(null);
            setResizeHandle(null);
            setResizeStart(null);
            setRotateHandleActive(false);
            setRotateStart(null);
        };

        canvas.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [layers, draggedLayerId, dragOffset, selectedLayerId, resizeHandle, resizeStart, rotateHandleActive, rotateStart]);

    // Download canvas as image
    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = 'canvas.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    // Move layer up/down in the stack
    const moveLayer = (index: number, direction: "up" | "down") => {
        setLayers(layers => {
            const newLayers = [...layers];
            const target = direction === "up" ? index - 1 : index + 1;
            if (target < 0 || target >= layers.length) return layers;
            [newLayers[index], newLayers[target]] = [newLayers[target], newLayers[index]];
            return newLayers;
        });
    };

    return (
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{
                    border: "2px dashed #aaa",
                    borderRadius: 8,
                    width: 400,
                    height: 340,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "2rem auto",
                    background: "#fafafa",
                    position: "relative",
                }}
            >
                <canvas
                    ref={canvasRef}
                    width={380}
                    height={280}
                    style={{ background: "#fff", borderRadius: 4 }}
                />
                <div style={{ marginTop: 12, width: "100%", textAlign: "center" }}>
                    <input
                        type="color"
                        value={bgColor}
                        onChange={e => setBgColor(e.target.value)}
                        style={{ marginRight: 8, width: 32, height: 32, verticalAlign: "middle" }}
                        title="Select background color"
                    />
                    <input
                        type="text"
                        value={textInput}
                        onChange={e => setTextInput(e.target.value)}
                        placeholder="Add text layer..."
                        style={{ padding: 4, borderRadius: 4, border: "1px solid #ccc", width: 180 }}
                    />
                    <button
                        onClick={handleAddText}
                        style={{ marginLeft: 8, padding: "4px 12px", borderRadius: 4, border: "none", background: "#007bff", color: "#fff" }}
                    >
                        Add Text
                    </button>
                    <button
                        onClick={handleDownload}
                        style={{ marginLeft: 8, padding: "4px 12px", borderRadius: 4, border: "none", background: "#28a745", color: "#fff" }}
                    >
                        Download Image
                    </button>
                </div>
                {layers.length === 0 && (
                    <span
                        style={{
                            position: "absolute",
                            top: 120,
                            left: 0,
                            right: 0,
                            color: "#888",
                            pointerEvents: "none",
                            textAlign: "center",
                        }}
                    >
          Drag and drop an image or add text layer
        </span>
                )}
            </div>
            {/* Layer list sidebar */}
            <div style={{
                width: 180,
                marginLeft: 24,
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 8,
                padding: 12,
                boxShadow: "0 2px 8px #0001",
                height: 340,
                overflowY: "auto"
            }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Layers</div>
                {layers.length === 0 && <div style={{ color: "#888" }}>No layers</div>}
                {layers.reverse().map((layer, idx) => (
                    <div key={layer.id} style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 10,
                        padding: 6,
                        borderRadius: 6,
                        background: draggedLayerId === layer.id ? "#e6f0ff" : "#f8f8f8",
                        border: "1px solid #eee"
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>
                                {layer.type === "image" ? "Image" : "Text"}
                            </div>
                            {layer.type === "image" ? (
                                <img src={layer.content} alt="preview" style={{ width: 32, height: 24, objectFit: "cover", borderRadius: 3, marginTop: 2 }} />
                            ) : (
                                <div style={{ fontSize: 13, color: "#222", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 100 }}>{layer.content}</div>
                            )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginLeft: 8 }}>
                            <button
                                onClick={() => moveLayer(idx, "up")}
                                disabled={idx === 0}
                                style={{ fontSize: 12, marginBottom: 2, background: "#eee", border: "none", borderRadius: 3, cursor: idx === 0 ? "not-allowed" : "pointer" }}
                                title="Move up"
                            >↑</button>
                            <button
                                onClick={() => moveLayer(idx, "down")}
                                disabled={idx === layers.length - 1}
                                style={{ fontSize: 12, background: "#eee", border: "none", borderRadius: 3, cursor: idx === layers.length - 1 ? "not-allowed" : "pointer" }}
                                title="Move down"
                            >↓</button>
                            <button
                                onClick={() => {
                                    setLayers(layers => layers.filter(l => l.id !== layer.id));
                                    if (selectedLayerId === layer.id) setSelectedLayerId(null);
                                }}
                                style={{
                                    fontSize: 12,
                                    background: "#ffdddd",
                                    border: "none",
                                    borderRadius: 3,
                                    marginTop: 4,
                                    cursor: "pointer",
                                    color: "#a00"
                                }}
                                title="Delete layer"
                            >✕</button>
                        </div>
                    </div>
                ))}
            </div>
            {/* Edit panel for selected layer */}
            <div style={{
                width: 220,
                marginLeft: 24,
                background: "#fff",
                border: "1px solid #eee",
                borderRadius: 8,
                padding: 12,
                boxShadow: "0 2px 8px #0001",
                height: 340,
                overflowY: "auto"
            }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Edit Layer</div>
                {selectedLayerId ? (() => {
                    const layer = getLayerById(selectedLayerId);
                    if (!layer) return null;
                    return (
                        <div>
                            {layer.type === "text" && (
                                <>
                                    <div style={{ marginBottom: 8 }}>
                                        <label style={{ fontSize: 13 }}>Text Color:</label>
                                        <input type="color" value={layer.color || "#222"} onChange={e => updateSelectedLayer({ color: e.target.value })} style={{ marginLeft: 8 }} />
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                        <label style={{ fontSize: 13 }}>Font:</label>
                                        <select value={layer.fontFamily || "sans-serif"} onChange={e => updateSelectedLayer({ fontFamily: e.target.value })} style={{ marginLeft: 8 }}>
                                            <option value="sans-serif">Sans</option>
                                            <option value="serif">Serif</option>
                                            <option value="monospace">Mono</option>
                                            <option value="cursive">Cursive</option>
                                            <option value="fantasy">Fantasy</option>
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                        <label style={{ fontSize: 13 }}>Style:</label>
                                        <button onClick={() => updateSelectedLayer({ bold: !layer.bold })} style={{ fontWeight: "bold", marginLeft: 8, background: layer.bold ? "#007bff" : "#eee", color: layer.bold ? "#fff" : "#222", border: "none", borderRadius: 3, padding: "2px 8px" }}>B</button>
                                        <button onClick={() => updateSelectedLayer({ italic: !layer.italic })} style={{ fontStyle: "italic", marginLeft: 4, background: layer.italic ? "#007bff" : "#eee", color: layer.italic ? "#fff" : "#222", border: "none", borderRadius: 3, padding: "2px 8px" }}>I</button>
                                        <button onClick={() => updateSelectedLayer({ underline: !layer.underline })} style={{ textDecoration: "underline", marginLeft: 4, background: layer.underline ? "#007bff" : "#eee", color: layer.underline ? "#fff" : "#222", border: "none", borderRadius: 3, padding: "2px 8px" }}>U</button>
                                        <button onClick={() => updateSelectedLayer({ strikethrough: !layer.strikethrough })} style={{ textDecoration: "line-through", marginLeft: 4, background: layer.strikethrough ? "#007bff" : "#eee", color: layer.strikethrough ? "#fff" : "#222", border: "none", borderRadius: 3, padding: "2px 8px" }}>S</button>
                                    </div>
                                </>
                            )}
                            {layer.type === "image" && (
                                <>
                                    <div style={{ marginBottom: 8 }}>
                                        <label style={{ fontSize: 13 }}>Opacity:</label>
                                        <input type="range" min={0.1} max={1} step={0.01} value={layer.opacity ?? 1} onChange={e => updateSelectedLayer({ opacity: Number(e.target.value) })} style={{ marginLeft: 8 }} />
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                        <label style={{ fontSize: 13 }}>Border Color:</label>
                                        <input type="color" value={layer.borderColor || "#000"} onChange={e => updateSelectedLayer({ borderColor: e.target.value })} style={{ marginLeft: 8 }} />
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                        <label style={{ fontSize: 13 }}>Border Width:</label>
                                        <input type="number" min={0} max={20} value={layer.borderWidth ?? 0} onChange={e => updateSelectedLayer({ borderWidth: Number(e.target.value) })} style={{ marginLeft: 8, width: 50 }} />
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                        <label style={{ fontSize: 13 }}>Border Radius:</label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={Math.min(layer.width ?? 200, layer.height ?? 150) / 2}
                                            value={layer.borderRadius ?? 0}
                                            onChange={e => updateSelectedLayer({ borderRadius: Number(e.target.value) })}
                                            style={{ marginLeft: 8, width: 50 }}
                                        />
                                        <span style={{ marginLeft: 8 }}>px</span>
                                    </div>
                                </>
                            )}
                            <div style={{ marginBottom: 8 }}>
                                <label style={{ fontSize: 13 }}>Rotation:</label>
                                <input
                                    type="number"
                                    step={1}
                                    value={rotationInput}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setRotationInput(val);
                                        // Only update layer if input is a valid number
                                        if (/^-?\d+$/.test(val)) {
                                            updateSelectedLayer({ rotation: Number(val) });
                                        } else if (val === "") {
                                            updateSelectedLayer({ rotation: undefined });
                                        }
                                    }}
                                    onBlur={e => {
                                        // On blur, if empty, set to undefined
                                        if (e.target.value === "") {
                                            setRotationInput("");
                                            updateSelectedLayer({ rotation: undefined });
                                        } else {
                                            // Remove leading zeros
                                            const cleaned = String(Number(e.target.value));
                                            setRotationInput(cleaned);
                                            updateSelectedLayer({ rotation: Number(cleaned) });
                                        }
                                    }}
                                    style={{ marginLeft: 8, width: 60 }}
                                />
                                <span style={{ marginLeft: 8 }}>°</span>
                            </div>
                        </div>
                    );
                })() : <div style={{ color: "#888" }}>Select a layer to edit</div>}
            </div>
        </div>
    );
}
