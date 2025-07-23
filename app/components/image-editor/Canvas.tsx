import {type Dispatch, type DragEvent, forwardRef, type SetStateAction, useEffect} from "react";
import {type Layer} from "./types";

interface CanvasProps {
    layers: Layer[];
    setLayers: Dispatch<SetStateAction<Layer[]>>;
    bgColor: string;
    selectedLayerId: string | null;
    imageCache: { [src: string]: HTMLImageElement };
}

const OPENAI_API_KEY = 'sk-6fxih0xp5IOxgF6xfIlzrA'; // Replace with your API key

async function generateImageDescription(image: string) {
    try {
        const response = await fetch('https://api.litviva.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'hackathon/vlm',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that describes images.'
                    },
                    {
                        role: 'user',
                        content: [
                            {type: "text", text: "whats in this image?"},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": image,
                                }
                            }
                        ],
                    },
                ],
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || response.statusText);
        }

        const data = await response.json();
        const message = data.choices[0]?.message.content;
        return message || "No description available.";
    } catch (err) {
        throw err;
    }
}

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(({
                                                                      layers,
                                                                      setLayers,
                                                                      bgColor,
                                                                      selectedLayerId,
                                                                      imageCache
                                                                  }, ref) => {

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const imgSrc = event.target?.result as string;
                const newLayerId = Math.random().toString(36).slice(2);
                setLayers([
                    ...layers,
                    {
                        id: newLayerId,
                        type: "image",
                        content: imgSrc,
                        x: 10,
                        y: 10,
                        width: 200,
                        height: 150,
                    } as Layer,
                ]);

                generateImageDescription(imgSrc).then((description) => {
                    setLayers((prevLayers: Layer[]) =>
                        prevLayers.map(layer =>
                            layer.id === newLayerId
                                ? { ...layer, layerDescription: description } as Layer
                                : layer
                        )
                    );
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    useEffect(() => {
        const canvas = (ref as React.RefObject<HTMLCanvasElement>)?.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        layers.forEach(layer => {
            ctx.save();
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

            if (layer.type === "image") {
                const img = imageCache[layer.content];
                if (img) {
                    ctx.save();
                    ctx.globalAlpha = layer.opacity ?? 1;
                    const w = layer.width || img.width;
                    const h = layer.height || img.height;
                    const r = layer.borderRadius ?? 0;
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
                        ctx.clip();
                    }
                    ctx.drawImage(img, layer.x, layer.y, w, h);
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
                    if (layer.id === selectedLayerId) {
                        const w = layer.width || img.width;
                        const h = layer.height || img.height;
                        ctx.save();
                        ctx.strokeStyle = "#007bff";
                        ctx.lineWidth = 2;
                        ctx.strokeRect(layer.x, layer.y, w, h);
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
                        const rotateHandleSize = 12;
                        const rotateHandleX = layer.x + w / 2;
                        const rotateHandleY = layer.y + h + 22;
                        ctx.beginPath();
                        ctx.arc(rotateHandleX, rotateHandleY, rotateHandleSize, 0, 2 * Math.PI);
                        ctx.fillStyle = "#fff";
                        ctx.strokeStyle = "#28a745";
                        ctx.fill();
                        ctx.stroke();
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
                if (layer.id === selectedLayerId) {
                    const fontSize = layer.fontSize || 24;
                    const textWidth = ctx.measureText(layer.content).width;
                    ctx.save();
                    ctx.strokeStyle = "#007bff";
                    ctx.lineWidth = 2;
                    ctx.setLineDash([4, 2]);
                    ctx.strokeRect(layer.x, layer.y - fontSize, textWidth, fontSize);
                    ctx.setLineDash([]);
                    const resizeHandleSize = 14;
                    const resizeHandleX = layer.x + textWidth + 8;
                    const resizeHandleY = layer.y - fontSize / 2;
                    ctx.beginPath();
                    ctx.arc(resizeHandleX, resizeHandleY, resizeHandleSize, 0, 2 * Math.PI);
                    ctx.fillStyle = "#fff";
                    ctx.strokeStyle = "#007bff";
                    ctx.fill();
                    ctx.stroke();
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
    }, [layers, imageCache, bgColor, selectedLayerId, ref]);

    return (
        <>
            {layers.filter((layer) => ((layer.type === "image" ? layer.layerDescription : layer.content)?.trim() || "").length > 0).length !== 0 && (
                <context name="Canvas Content">
                    {layers.map((layer, index) => `Layer ${index + 1} ` + (layer.type === "image" ? "(Image)" : "(Text)") + ": " + (layer.type === "image" ? layer.layerDescription : layer.content)).join("\n")}
                </context>)}
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
                    ref={ref}
                    width={380}
                    height={280}
                    style={{background: "#fff", borderRadius: 4}}
                />
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
        </>
    );
});

Canvas.displayName = "Canvas";
