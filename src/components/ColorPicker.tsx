import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {useState} from "react";
import {HexAlphaColorPicker, HexColorInput} from "react-colorful";

export default function ColorPicker({
    activeColor,
    onColorChange,
}: {
    activeColor: string;
    onColorChange: (color: string) => void;
}) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger className="w-full">
                <div className="w-full flex items-center justify-between p-1 bg-white border rounded-md cursor-pointer hover:bg-gray-50" onClick={() => setOpen(!open)}>
                    <div
                        className="w-full h-8 rounded-md min-w-8"
                        style={{ backgroundColor: activeColor }}
                    />
                </div>
            </PopoverTrigger>
            <PopoverContent className="p-4">
                <div className="flex flex-col items-center">
                    <HexAlphaColorPicker color={activeColor} onChange={onColorChange} className="w-full h-32" />
                    <div className="px-3">
                        <HexColorInput color={activeColor} onChange={onColorChange} alpha prefixed className="mt-2 w-full" />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
