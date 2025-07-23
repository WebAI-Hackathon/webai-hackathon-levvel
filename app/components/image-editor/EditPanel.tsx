import { type Layer } from "./types";

interface EditPanelProps {
    selectedLayer: Layer | undefined;
    updateSelectedLayer: (props: Partial<Layer>) => void;
    rotationInput: string;
    setRotationInput: (value: string) => void;
}

export function EditPanel({ selectedLayer, updateSelectedLayer, rotationInput, setRotationInput }: EditPanelProps) {
    if (!selectedLayer) {
        return (
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
                <div style={{ color: "#888" }}>Select a layer to edit</div>
            </div>
        );
    }

    return (
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
            <div>
                {selectedLayer.type === "text" && (
                    <>
                        <div style={{ marginBottom: 8 }}>
                            <label style={{ fontSize: 13 }}>Text:</label>
                            <input
                                type="text"
                                value={selectedLayer.content}
                                onChange={e => updateSelectedLayer({ content: e.target.value })}
                                style={{ marginLeft: 8, width: 140 }}
                            />
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <label style={{ fontSize: 13 }}>Text Color:</label>
                            <input type="color" value={selectedLayer.color || "#222"} onChange={e => updateSelectedLayer({ color: e.target.value })} style={{ marginLeft: 8 }} />
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <label style={{ fontSize: 13 }}>Font:</label>
                            <select value={selectedLayer.fontFamily || "sans-serif"} onChange={e => updateSelectedLayer({ fontFamily: e.target.value })} style={{ marginLeft: 8 }}>
                                <option value="sans-serif">Sans</option>
                                <option value="serif">Serif</option>
                                <option value="monospace">Mono</option>
                                <option value="cursive">Cursive</option>
                                <option value="fantasy">Fantasy</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <label style={{ fontSize: 13 }}>Style:</label>
                            <button onClick={() => updateSelectedLayer({ bold: !selectedLayer.bold })} style={{ fontWeight: "bold", marginLeft: 8, background: selectedLayer.bold ? "#007bff" : "#eee", color: selectedLayer.bold ? "#fff" : "#222", border: "none", borderRadius: 3, padding: "2px 8px" }}>B</button>
                            <button onClick={() => updateSelectedLayer({ italic: !selectedLayer.italic })} style={{ fontStyle: "italic", marginLeft: 4, background: selectedLayer.italic ? "#007bff" : "#eee", color: selectedLayer.italic ? "#fff" : "#222", border: "none", borderRadius: 3, padding: "2px 8px" }}>I</button>
                            <button onClick={() => updateSelectedLayer({ underline: !selectedLayer.underline })} style={{ textDecoration: "underline", marginLeft: 4, background: selectedLayer.underline ? "#007bff" : "#eee", color: selectedLayer.underline ? "#fff" : "#222", border: "none", borderRadius: 3, padding: "2px 8px" }}>U</button>
                            <button onClick={() => updateSelectedLayer({ strikethrough: !selectedLayer.strikethrough })} style={{ textDecoration: "line-through", marginLeft: 4, background: selectedLayer.strikethrough ? "#007bff" : "#eee", color: selectedLayer.strikethrough ? "#fff" : "#222", border: "none", borderRadius: 3, padding: "2px 8px" }}>S</button>
                        </div>
                    </>
                )}
                {selectedLayer.type === "image" && (
                    <>
                        <div style={{ marginBottom: 8 }}>
                            <label style={{ fontSize: 13 }}>Opacity:</label>
                            <input type="range" min={0.1} max={1} step={0.01} value={selectedLayer.opacity ?? 1} onChange={e => updateSelectedLayer({ opacity: Number(e.target.value) })} style={{ marginLeft: 8 }} />
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <label style={{ fontSize: 13 }}>Border Color:</label>
                            <input type="color" value={selectedLayer.borderColor || "#000"} onChange={e => updateSelectedLayer({ borderColor: e.target.value })} style={{ marginLeft: 8 }} />
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <label style={{ fontSize: 13 }}>Border Width:</label>
                            <input type="number" min={0} max={20} value={selectedLayer.borderWidth ?? 0} onChange={e => updateSelectedLayer({ borderWidth: Number(e.target.value) })} style={{ marginLeft: 8, width: 50 }} />
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <label style={{ fontSize: 13 }}>Border Radius:</label>
                            <input
                                type="number"
                                min={0}
                                max={Math.min(selectedLayer.width ?? 200, selectedLayer.height ?? 150) / 2}
                                value={selectedLayer.borderRadius ?? 0}
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
                            if (/^-?\d+$/.test(val)) {
                                updateSelectedLayer({ rotation: Number(val) });
                            } else if (val === "") {
                                updateSelectedLayer({ rotation: undefined });
                            }
                        }}
                        onBlur={e => {
                            if (e.target.value === "") {
                                setRotationInput("");
                                updateSelectedLayer({ rotation: undefined });
                            } else {
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
        </div>
    );
}
