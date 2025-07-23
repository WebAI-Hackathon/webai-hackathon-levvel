import {type DragEvent, useEffect, useRef, useState} from "react";

export default function ImageDropCanvas() {
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = function (event) {
                setImgSrc(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    useEffect(() => {
        if (imgSrc && canvasRef.current) {
            const img = new window.Image();
            img.onload = () => {
                const ctx = canvasRef.current!.getContext("2d");
                if (ctx) {
                    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
                    // Bild auf Canvas anpassen
                    const scale = Math.min(
                        canvasRef.current!.width / img.width,
                        canvasRef.current!.height / img.height
                    );
                    const x = (canvasRef.current!.width - img.width * scale) / 2;
                    const y = (canvasRef.current!.height - img.height * scale) / 2;
                    ctx.drawImage(
                        img,
                        0,
                        0,
                        img.width,
                        img.height,
                        x,
                        y,
                        img.width * scale,
                        img.height * scale
                    );
                }
            };
            img.src = imgSrc;
        }
    }, [imgSrc]);

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
                border: "2px dashed #aaa",
                borderRadius: 8,
                width: 400,
                height: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "2rem auto",
                background: "#fafafa",
            }}
        >
            <canvas
                ref={canvasRef}
                width={380}
                height={280}
                style={{ background: "#fff", borderRadius: 4 }}
            />
            {!imgSrc && (
                <span
                    style={{
                        position: "absolute",
                        color: "#888",
                        pointerEvents: "none",
                        textAlign: "center",
                    }}
                >
          Bild hierher ziehen und ablegen
        </span>
            )}
        </div>
    );
}
