import { useState, useCallback } from "react";
import { type Layer } from "../types";

export function useLayers() {
    const [layers, setLayers] = useState<Layer[]>([]);
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
    const [textInput, setTextInput] = useState("");
    const [bgColor, setBgColor] = useState<string>("#fff");
    const [rotationInput, setRotationInput] = useState<string>("");

    const getLayerById = useCallback((id: string | null) => layers.find(l => l.id === id), [layers]);

    const updateSelectedLayer = useCallback((props: Partial<Layer>) => {
        if (!selectedLayerId) return;
        setLayers(layers => layers.map(l => l.id === selectedLayerId ? { ...l, ...props } : l));
        if (Object.prototype.hasOwnProperty.call(props, "rotation")) {
            if (props.rotation !== undefined && props.rotation !== null) {
                setRotationInput(String(props.rotation));
            } else {
                setRotationInput("");
            }
        }
    }, [selectedLayerId]);

    const handleAddText = useCallback(() => {
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
    }, [textInput]);

    const moveLayer = useCallback((index: number, direction: "up" | "down") => {
        setLayers(layers => {
            const newLayers = [...layers];
            const currentLayer = newLayers[index];
            const targetIndex = direction === "up" ? layers.length - 1 - (layers.length - 1 - index + 1) : layers.length - 1 - (layers.length - 1 - index - 1);


            if (targetIndex < 0 || targetIndex >= layers.length) return layers;

            newLayers.splice(index, 1);
            newLayers.splice(targetIndex, 0, currentLayer);

            return newLayers;
        });
    }, []);

    const deleteLayer = (id: string) => {
        setLayers(layers => layers.filter(l => l.id !== id));
        if (selectedLayerId === id) {
            setSelectedLayerId(null);
        }
    };

    return {
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
    };
}

