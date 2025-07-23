import { type Layer } from "./types";

interface LayersPanelProps {
    layers: Layer[];
    draggedLayerId: string | null;
    moveLayer: (index: number, direction: "up" | "down") => void;
    deleteLayer: (id: string) => void;
}

export function LayersPanel({ layers, draggedLayerId, moveLayer, deleteLayer }: LayersPanelProps) {
    return (
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
            {[...layers].reverse().map((layer, idx) => {
                const originalIndex = layers.length - 1 - idx;
                return (
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
                                onClick={() => moveLayer(originalIndex, "down")}
                                disabled={originalIndex === layers.length - 1}
                                style={{ fontSize: 12, background: "#eee", border: "none", borderRadius: 3, cursor: originalIndex === layers.length - 1 ? "not-allowed" : "pointer" }}
                                title="Move down"
                            >↑</button>
                            <button
                                onClick={() => moveLayer(originalIndex, "up")}
                                disabled={originalIndex === 0}
                                style={{ fontSize: 12, marginBottom: 2, background: "#eee", border: "none", borderRadius: 3, cursor: originalIndex === 0 ? "not-allowed" : "pointer" }}
                                title="Move up"
                            >↓</button>

                            <button
                                onClick={() => deleteLayer(layer.id)}
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
                )
            })}
        </div>
    );
}

