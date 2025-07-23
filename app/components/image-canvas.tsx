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

    // Helper: get layer by id
    const getLayerById = (id: string | null) => layers.find(l => l.id === id);

    // Draw all layers synchronously, with resize handles for selected layer
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        layers.forEach(layer => {
            if (layer.type === "image") {
                const img = imageCache[layer.content];
                if (img) {
                    ctx.drawImage(
                        img,
                        layer.x,
                        layer.y,
                        layer.width || img.width,
                        layer.height || img.height
                    );
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
                ctx.font = `${layer.fontSize || 24}px sans-serif`;
                ctx.fillStyle = "#222";
                ctx.fillText(layer.content, layer.x, layer.y);
                // Draw improved resize handle if selected
                if (layer.id === selectedLayerId) {
                    const fontSize = layer.fontSize || 24;
                    ctx.save();
                    ctx.strokeStyle = "#007bff";
                    ctx.lineWidth = 2;
                    const textWidth = ctx.measureText(layer.content).width;
                    ctx.setLineDash([4, 2]);
                    ctx.strokeRect(layer.x, layer.y - fontSize, textWidth, fontSize);
                    ctx.setLineDash([]);
                    // Draw larger handle at right-middle
                    const handleSize = 14;
                    const handleX = layer.x + textWidth + 8;
                    const handleY = layer.y - fontSize / 2;
                    ctx.beginPath();
                    ctx.arc(handleX, handleY, handleSize, 0, 2 * Math.PI);
                    ctx.fillStyle = "#fff";
                    ctx.strokeStyle = "#007bff";
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                }
            }
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

    // Mouse event handlers for selecting, dragging, and resizing layers
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let resizing = false;

        const handleMouseDown = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            // Check resize handles first
            for (let i = layers.length - 1; i >= 0; i--) {
                const layer = layers[i];
                if (layer.id === selectedLayerId) {
                    if (layer.type === "image") {
                        const w = layer.width || 100;
                        const h = layer.height || 100;
                        const handles = [
                            {corner: "tl", x: layer.x, y: layer.y},
                            {corner: "tr", x: layer.x + w, y: layer.y},
                            {corner: "bl", x: layer.x, y: layer.y + h},
                            {corner: "br", x: layer.x + w, y: layer.y + h},
                        ];
                        for (const handle of handles) {
                            if (Math.abs(mouseX - handle.x) < 12 && Math.abs(mouseY - handle.y) < 12) {
                                setResizeHandle({corner: handle.corner});
                                resizing = true;
                                return;
                            }
                        }
                    } else if (layer.type === "text") {
                        const fontSize = layer.fontSize || 24;
                        const ctx = canvas.getContext("2d");
                        ctx.font = `${fontSize}px sans-serif`;
                        const textWidth = ctx.measureText(layer.content).width;
                        // Improved: right-middle handle for text
                        const handleX = layer.x + textWidth + 8;
                        const handleY = layer.y - fontSize / 2;
                        if (Math.abs(mouseX - handleX) < 18 && Math.abs(mouseY - handleY) < 18) {
                            setResizeHandle({corner: "right"});
                            setResizeStart({ mouseX, fontSize });
                            resizing = true;
                            return;
                        }
                    }
                }
            }
            // If not resizing, check for layer selection/dragging
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
                        setSelectedLayerId(layer.id);
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
                        setSelectedLayerId(layer.id);
                        setDraggedLayerId(layer.id);
                        setDragOffset({ x: mouseX - layer.x, y: mouseY - layer.y });
                        return;
                    }
                }
            }
            setSelectedLayerId(null);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            // Improved text resize logic
            if (resizeHandle && selectedLayerId) {
                setLayers(layers => layers.map(layer => {
                    if (layer.id !== selectedLayerId) return layer;
                    if (layer.type === "image") {
                        let newX = layer.x, newY = layer.y, newW = layer.width || 100, newH = layer.height || 100;
                        if (resizeHandle.corner === "br") {
                            newW = Math.max(10, mouseX - layer.x);
                            newH = Math.max(10, mouseY - layer.y);
                        } else if (resizeHandle.corner === "tr") {
                            newW = Math.max(10, mouseX - layer.x);
                            newY = mouseY;
                            newH = Math.max(10, layer.y + (layer.height || 100) - mouseY);
                        } else if (resizeHandle.corner === "bl") {
                            newX = mouseX;
                            newW = Math.max(10, layer.x + (layer.width || 100) - mouseX);
                            newH = Math.max(10, mouseY - layer.y);
                        } else if (resizeHandle.corner === "tl") {
                            newX = mouseX;
                            newY = mouseY;
                            newW = Math.max(10, layer.x + (layer.width || 100) - mouseX);
                            newH = Math.max(10, layer.y + (layer.height || 100) - mouseY);
                        }
                        return { ...layer, x: newX, y: newY, width: newW, height: newH };
                    } else if (layer.type === "text" && resizeHandle.corner === "right" && resizeStart) {
                        // Calculate new font size based on horizontal drag from initial mouseX
                        const deltaX = mouseX - resizeStart.mouseX;
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
        };

        canvas.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            canvas.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [layers, draggedLayerId, dragOffset, selectedLayerId, resizeHandle, resizeStart]);

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
                {layers.map((layer, idx) => (
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
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
