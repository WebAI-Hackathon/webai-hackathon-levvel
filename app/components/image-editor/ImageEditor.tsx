import {useEffect, useRef, useState} from "react";
import {useLayers} from "./hooks/useLayers";
import {useInteraction} from "./hooks/useInteraction";
import {Canvas} from "./Canvas";
import {LayersPanel} from "./LayersPanel";
import {EditPanel} from "./EditPanel";
import {Toolbar} from "./Toolbar";

export default function ImageEditor() {
    const {
        layers,
        setLayers,
        selectedLayerId,
        setSelectedLayerId,
        textInput,
        setTextInput,
        bgColor,
        setBgColor,
        getLayerById,
        updateSelectedLayer,
        handleAddText,
        moveLayer,
        deleteLayer,
        rotationInput,
        setRotationInput
    } = useLayers();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imageCache, setImageCache] = useState<{ [src: string]: HTMLImageElement }>({});

    const {draggedLayerId} = useInteraction(layers, setLayers, selectedLayerId, setSelectedLayerId, canvasRef, imageCache);

    useEffect(() => {
        const imageLayers = layers.filter(l => l.type === "image");
        imageLayers.forEach(layer => {
            if (!imageCache[layer.content]) {
                const img = new window.Image();
                img.src = layer.content;
                img.onload = () => {
                    setImageCache(cache => ({...cache, [layer.content]: img}));
                };
            }
        });
    }, [layers, imageCache]);

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

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const prevSelected = selectedLayerId;
        setSelectedLayerId(null);
        setTimeout(() => {
            const link = document.createElement('a');
            link.download = 'canvas.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            setSelectedLayerId(prevSelected);
        }, 30);
    };

    return (
        <div style={{display: "flex", flexDirection: "row", justifyContent: "center"}}>
            <div>
                <Canvas
                    ref={canvasRef}
                    layers={layers}
                    setLayers={setLayers}
                    bgColor={bgColor}
                    selectedLayerId={selectedLayerId}
                    imageCache={imageCache}
                />
                <Toolbar
                    bgColor={bgColor}
                    setBgColor={setBgColor}
                    textInput={textInput}
                    setTextInput={setTextInput}
                    handleAddText={handleAddText}
                    handleDownload={handleDownload}
                />
            </div>
            <LayersPanel
                layers={layers}
                draggedLayerId={draggedLayerId}
                moveLayer={moveLayer}
                deleteLayer={deleteLayer}
            />
            <EditPanel
                selectedLayer={getLayerById(selectedLayerId)}
                updateSelectedLayer={updateSelectedLayer}
                rotationInput={rotationInput}
                setRotationInput={setRotationInput}
            />
        </div>
    );
}
