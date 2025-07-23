interface ToolbarProps {
    bgColor: string;
    setBgColor: (color: string) => void;
    textInput: string;
    setTextInput: (text: string) => void;
    handleAddText: () => void;
    handleDownload: () => void;
}

export function Toolbar({ bgColor, setBgColor, textInput, setTextInput, handleAddText, handleDownload }: ToolbarProps) {
    return (
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
    );
}

