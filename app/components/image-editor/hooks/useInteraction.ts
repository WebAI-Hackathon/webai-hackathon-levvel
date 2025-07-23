import { useEffect, useRef, useState } from "react";
import { type Layer } from "../types";

export function useInteraction(
    layers: Layer[],
    setLayers: React.Dispatch<React.SetStateAction<Layer[]>>,
    selectedLayerId: string | null,
    setSelectedLayerId: React.Dispatch<React.SetStateAction<string | null>>,
    canvasRef: React.RefObject<HTMLCanvasElement | null>,
    imageCache: { [src: string]: HTMLImageElement }
) {
    const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
    const [resizeHandle, setResizeHandle] = useState<null | { corner: string }>(null);
    const [resizeStart, setResizeStart] = useState<{ mouseX: number; fontSize: number } | null>(null);
    const [rotateHandleActive, setRotateHandleActive] = useState(false);
    const [rotateStart, setRotateStart] = useState<{
        mouseX: number;
        mouseY: number;
        startAngle: number;
        initialAngle: number;
        layerType?: "text" | "image";
    } | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const getLocalMouseCoords = (layer: Layer, mouseX: number, mouseY: number) => {
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

        const handleMouseDown = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            for (let i = layers.length - 1; i >= 0; i--) {
                const layer = layers[i];
                if (layer.id !== selectedLayerId) continue;

                const { x: localMouseX, y: localMouseY } = getLocalMouseCoords(layer, mouseX, mouseY);
                const ctx = canvas.getContext("2d")!;

                if (layer.type === "text") {
                    const fontSize = layer.fontSize || 24;
                    ctx.font = `${fontSize}px sans-serif`;
                    const textWidth = ctx.measureText(layer.content).width;
                    const rotateHandleX = layer.x + textWidth / 2;
                    const rotateHandleY = layer.y + 18;
                    if (Math.abs(localMouseX - rotateHandleX) < 16 && Math.abs(localMouseY - rotateHandleY) < 16) {
                        setRotateHandleActive(true);
                        const cx = layer.x + textWidth / 2;
                        const cy = layer.y - fontSize / 2;
                        const dx = mouseX - cx;
                        const dy = mouseY - cy;
                        const initialAngle = Math.atan2(dy, dx) * 180 / Math.PI;
                        setRotateStart({ mouseX, mouseY, startAngle: layer.rotation ?? 0, initialAngle, layerType: "text" });
                        return;
                    }
                } else if (layer.type === "image") {
                    const w = layer.width || 100;
                    const h = layer.height || 100;
                    const rotateHandleX = layer.x + w / 2;
                    const rotateHandleY = layer.y + h + 22;
                    if (Math.abs(localMouseX - rotateHandleX) < 16 && Math.abs(localMouseY - rotateHandleY) < 16) {
                        setRotateHandleActive(true);
                        const cx = layer.x + w / 2;
                        const cy = layer.y + h / 2;
                        const dx = mouseX - cx;
                        const dy = mouseY - cy;
                        const initialAngle = Math.atan2(dy, dx) * 180 / Math.PI;
                        setRotateStart({ mouseX, mouseY, startAngle: layer.rotation ?? 0, initialAngle, layerType: "image" });
                        return;
                    }
                }

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
                            return;
                        }
                    }
                } else if (layer.type === "text") {
                    const fontSize = layer.fontSize || 24;
                    ctx.font = `${fontSize}px sans-serif`;
                    const textWidth = ctx.measureText(layer.content).width;
                    const handleX = layer.x + textWidth + 8;
                    const handleY = layer.y - fontSize / 2;
                    if (Math.abs(localMouseX - handleX) < 18 && Math.abs(localMouseY - handleY) < 18) {
                        setResizeHandle({ corner: "right" });
                        setResizeStart({ mouseX, fontSize });
                        return;
                    }
                }
            }

            for (let i = layers.length - 1; i >= 0; i--) {
                const layer = layers[i];
                const { x: localMouseX, y: localMouseY } = getLocalMouseCoords(layer, mouseX, mouseY);
                const ctx = canvas.getContext("2d")!;

                if (layer.type === "text") {
                    const fontSize = layer.fontSize || 24;
                    ctx.font = `${fontSize}px sans-serif`;
                    const textWidth = ctx.measureText(layer.content).width;
                    if (localMouseX >= layer.x && localMouseX <= layer.x + textWidth && localMouseY >= layer.y - fontSize && localMouseY <= layer.y) {
                        setSelectedLayerId(layer.id);
                        setDraggedLayerId(layer.id);
                        setDragOffset({ x: mouseX - layer.x, y: mouseY - layer.y });
                        return;
                    }
                } else if (layer.type === "image") {
                    const width = layer.width || 100;
                    const height = layer.height || 100;
                    if (localMouseX >= layer.x && localMouseX <= layer.x + width && localMouseY >= layer.y && localMouseY <= layer.y + height) {
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

            if (rotateHandleActive && selectedLayerId && rotateStart) {
                setLayers(layers => layers.map(layer => {
                    if (layer.id !== selectedLayerId) return layer;
                    const ctx = canvas.getContext("2d")!;
                    let cx, cy;
                    if (layer.type === "text") {
                        const fontSize = layer.fontSize || 24;
                        ctx.font = `${fontSize}px sans-serif`;
                        const textWidth = ctx.measureText(layer.content).width;
                        cx = layer.x + textWidth / 2;
                        cy = layer.y - fontSize / 2;
                    } else {
                        const w = layer.width || 100;
                        const h = layer.height || 100;
                        cx = layer.x + w / 2;
                        cy = layer.y + h / 2;
                    }
                    const dx = mouseX - cx;
                    const dy = mouseY - cy;
                    const currentAngle = Math.atan2(dy, dx) * 180 / Math.PI;
                    const deltaAngle = currentAngle - rotateStart.initialAngle;
                    return { ...layer, rotation: rotateStart.startAngle + deltaAngle };
                }));
                return;
            }

            if (resizeHandle && selectedLayerId) {
                setLayers(layers => layers.map(layer => {
                    if (layer.id !== selectedLayerId) return layer;

                    if (layer.type === "image") {
                        const oldW = layer.width || 100;
                        const oldH = layer.height || 100;

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
                        const angleRad = (layer.rotation ?? 0) * Math.PI / 180;
                        const invCos = Math.cos(-angleRad);
                        const invSin = Math.sin(-angleRad);
                        const mouseVecX = mouseX - anchor.x;
                        const mouseVecY = mouseY - anchor.y;
                        const localMouseVecX = mouseVecX * invCos - mouseVecY * invSin;
                        const localMouseVecY = mouseVecX * invSin + mouseVecY * invCos;

                        let newW = 0, newH = 0;
                        switch (resizeHandle.corner) {
                            case "tl": newW = -localMouseVecX; newH = -localMouseVecY; break;
                            case "tr": newW = localMouseVecX; newH = -localMouseVecY; break;
                            case "bl": newW = -localMouseVecX; newH = localMouseVecY; break;
                            case "br": newW = localMouseVecX; newH = localMouseVecY; break;
                        }

                        newW = Math.max(10, newW);
                        newH = Math.max(10, newH);

                        const localAnchorX = resizeHandle.corner.includes("l") ? newW : 0;
                        const localAnchorY = resizeHandle.corner.includes("t") ? newH : 0;
                        const localNewCenterX = newW / 2;
                        const localNewCenterY = newH / 2;
                        const vecCenterX = localAnchorX - localNewCenterX;
                        const vecCenterY = localAnchorY - localNewCenterY;
                        const cos = Math.cos(angleRad);
                        const sin = Math.sin(angleRad);
                        const rotatedVecCenterX = vecCenterX * cos - vecCenterY * sin;
                        const rotatedVecCenterY = vecCenterX * sin + vecCenterY * cos;
                        const newCenterX = anchor.x - rotatedVecCenterX;
                        const newCenterY = anchor.y - rotatedVecCenterY;
                        const newX = newCenterX - newW / 2;
                        const newY = newCenterY - newH / 2;

                        return { ...layer, x: newX, y: newY, width: newW, height: newH };
                    } else if (layer.type === "text" && resizeHandle.corner === "right" && resizeStart) {
                        const deltaX = mouseX - resizeStart.mouseX;
                        const fontSize = Math.max(8, resizeStart.fontSize + deltaX / 2);
                        return { ...layer, fontSize };
                    }
                    return layer;
                }));
                return;
            }

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
    }, [layers, setLayers, selectedLayerId, setSelectedLayerId, canvasRef, imageCache, dragOffset, resizeHandle, resizeStart, rotateHandleActive, rotateStart]);

    return {
        draggedLayerId
    };
}

