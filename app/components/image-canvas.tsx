import {type DragEvent, useEffect, useRef, useState} from "react";

// Layer type definition
interface Layer {
    id: string;
    type: "image" | "text";
    content: string; // image src or text
    x: number;
    y: number;
    width?: number;
    height?: number;
    fontSize?: number;
}

export default function ImageDropCanvas() {
    const [layers, setLayers] = useState<Layer[]>([]);
    const [textInput, setTextInput] = useState("");
    const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState<{x: number; y: number} | null>(null);
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

    // Draw all layers synchronously
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        // Fill white background
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Draw image layers from cache
        layers.filter(l => l.type === "image").forEach(layer => {
            const img = imageCache[layer.content];
            if (img) {
                ctx.drawImage(
                    img,
                    layer.x,
                    layer.y,
                    layer.width || img.width,
                    layer.height || img.height
                );
            }
        });
        // Draw text layers
        layers.filter(l => l.type === "text").forEach(textLayer => {
            ctx.font = `${textLayer.fontSize || 24}px sans-serif`;
            ctx.fillStyle = "#222";
            ctx.fillText(textLayer.content, textLayer.x, textLayer.y);
        });
    }, [layers, imageCache]);

    // Mouse event handlers for dragging any layer
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleMouseDown = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            // Find topmost layer under mouse (text or image)
            for (let i = layers.length - 1; i >= 0; i--) {
                const layer = layers[i];
                if (layer.type === "text") {
                    const fontSize = layer.fontSize || 24;
                    const ctx = canvas.getContext("2d");
                    ctx.font = `${fontSize}px sans-serif`;
                    const textWidth = ctx.measureText(layer.content).width;
                    const textHeight = fontSize;
                    if (
                        mouseX >= layer.x &&
                        mouseX <= layer.x + textWidth &&
                        mouseY >= layer.y - textHeight &&
                        mouseY <= layer.y
                    ) {
                        setDraggedLayerId(layer.id);
                        setDragOffset({ x: mouseX - layer.x, y: mouseY - layer.y });
                        return;
                    }
                } else if (layer.type === "image") {
                    const width = layer.width || 100;
                    const height = layer.height || 100;
                    if (
                        mouseX >= layer.x &&
                        mouseX <= layer.x + width &&
                        mouseY >= layer.y &&
                        mouseY <= layer.y + height
                    ) {
                        setDraggedLayerId(layer.id);
                        setDragOffset({ x: mouseX - layer.x, y: mouseY - layer.y });
                        return;
                    }
                }
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!draggedLayerId || !dragOffset) return;
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            setLayers(layers =>
                layers.map(layer =>
                    layer.id === draggedLayerId
                        ? { ...layer, x: mouseX - dragOffset.x, y: mouseY - dragOffset.y }
                        : layer
                )
            );
        };

        const handleMouseUp = () => {
            setDraggedLayerId(null);
            setDragOffset(null);
        };

        canvas.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [layers, draggedLayerId, dragOffset]);

    // Download canvas as image
    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = 'canvas.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    return (
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
    );
}
