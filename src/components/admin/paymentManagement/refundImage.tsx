import { useRef, useState } from "react";
import { uploadSingleImage } from "../../../services/api/api.upload";

type Props = {
    images: string[];
    onChange: (images: string[]) => void;
};

export const RefundImageUpload = ({ images, onChange }: Props) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);

    const handleUpload = async (file: File) => {
        if (!file.type.startsWith("image/")) return;

        try {
            setUploading(true);

            const formData = new FormData();
            formData.append("file", file);

            const res = await uploadSingleImage(formData);
            if (!res) return;

            onChange([...images, res.url]);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = (img: string) => {
        onChange(images.filter((i) => i !== img));
    };

    return (
        <div>
            <label className="text-sm font-medium">Images</label>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(file);
                    e.target.value = "";
                }}
            />

            <div
                className={`
                    flex gap-2 mt-2 flex-wrap p-2 rounded transition
                    ${dragging ? "border-2 border-blue-400 bg-blue-50" : ""}
                `}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);

                    const file = e.dataTransfer.files?.[0];
                    if (file) handleUpload(file);
                }}
            >
                {/* images */}
                {images.map((img) => (
                    <div key={img} className="relative group w-16 h-16">
                        <img src={img} className="w-full h-full object-cover rounded border" />

                        {/* delete button */}
                        <button
                            type="button"
                            onClick={() => handleRemove(img)}
                            className="
                                absolute top-1 right-1
                                w-4 h-4 rounded-full
                                bg-black/60 text-white text-xs
                                flex items-center justify-center
                                opacity-0 group-hover:opacity-100
                                transition
                            "
                        >
                            ✕
                        </button>
                    </div>
                ))}

                {/* loading */}
                {uploading && (
                    <div className="w-16 h-16 rounded border flex items-center justify-center bg-gray-100 animate-pulse">
                        <span className="text-xs text-gray-400">Loading...</span>
                    </div>
                )}

                {/* add button */}
                {!uploading && (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="
                            w-16 h-16 rounded border border-dashed
                            flex items-center justify-center
                            text-gray-500 hover:border-gray-400 hover:text-gray-700
                        "
                    >
                        +
                    </button>
                )}
            </div>

            {dragging && <p className="text-xs text-blue-500 mt-1">Thả ảnh vào để upload</p>}
        </div>
    );
};
