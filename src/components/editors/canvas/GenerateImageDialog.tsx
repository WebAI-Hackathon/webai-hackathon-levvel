import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {ProjectFileType} from "@/types/project.ts";
import {useState} from "react";
import {Label} from "@/components/ui/label.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";

interface GenerateImageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGenerate: (prompt: string) => void;
}

export default function GenerateImageDialog({ open, onOpenChange, onGenerate }: GenerateImageDialogProps) {
    const [imagePrompt, setImagePrompt] = useState('');

    const handleGenerate = () => {
        if (imagePrompt.trim()) {
            onGenerate(imagePrompt.trim());
            setImagePrompt("");
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        Generate Image
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Prompt</Label>
                        <Textarea value={imagePrompt} onChange={(e) => {
                            setImagePrompt(e.target.value);
                        }} />
                    </div>

                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleGenerate} disabled={!imagePrompt.trim()}>
                        Generate
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
