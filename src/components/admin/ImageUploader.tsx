"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState<Record<string, number>>({});
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    const key = file.name;
    setUploading((prev) => ({ ...prev, [key]: 0 }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const { publicUrl } = await res.json() as { publicUrl: string };

      setUploading((prev) => ({ ...prev, [key]: 100 }));
      onChange([...images, publicUrl]);

      setTimeout(() => {
        setUploading((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }, 800);

      return publicUrl;
    } catch (err) {
      toast.error(`Failed to upload ${file.name}`);
      setUploading((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      if (images.length >= 8) {
        toast.error("Maximum 8 images per product");
        return;
      }
      const remaining = 8 - images.length;
      const toUpload = Array.from(files).slice(0, remaining);
      if (toUpload.length < Array.from(files).length) {
        toast.warning(`Only uploading ${toUpload.length} images (max 8 total)`);
      }
      await Promise.all(toUpload.map(uploadFile));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [images]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeImage = (url: string) => {
    onChange(images.filter((img) => img !== url));
  };

  const moveImage = (from: number, to: number) => {
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const uploadingCount = Object.keys(uploading).length;

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDraggingOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-secondary/50"
        )}
      >
        <Upload className="mx-auto mb-3 text-muted" size={24} />
        <p className="font-body text-sm text-foreground">
          Drop images here or{" "}
          <span className="text-primary underline underline-offset-2">browse</span>
        </p>
        <p className="font-body text-xs text-muted mt-1">
          Up to 8 images · JPG, PNG, WebP · Max 10MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Image Grid */}
      {(images.length > 0 || uploadingCount > 0) && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative group aspect-square rounded-md overflow-hidden bg-secondary border border-border"
            >
              <Image src={url} alt="" fill className="object-cover" />

              {/* Primary Badge */}
              {index === 0 && (
                <span className="absolute top-1 left-1 bg-primary text-white text-[9px] font-accent tracking-wider uppercase px-1.5 py-0.5 rounded-sm z-10">
                  Primary
                </span>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 z-20">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, index - 1);
                    }}
                    className="size-7 bg-white rounded-sm flex items-center justify-center text-foreground text-xs hover:bg-secondary transition-colors"
                    title="Move left"
                  >
                    ←
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(url);
                  }}
                  className="size-7 bg-white rounded-sm flex items-center justify-center text-foreground hover:bg-destructive hover:text-white transition-colors"
                  title="Remove image"
                >
                  <X size={13} />
                </button>
                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, index + 1);
                    }}
                    className="size-7 bg-white rounded-sm flex items-center justify-center text-foreground text-xs hover:bg-secondary transition-colors"
                    title="Move right"
                  >
                    →
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Uploading placeholder(s) */}
          {uploadingCount > 0 &&
            Array.from({ length: uploadingCount }).map((_, i) => (
              <div
                key={`uploading-${i}`}
                className="aspect-square rounded-md bg-secondary border-2 border-dashed border-border flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-[10px] text-muted font-body">Uploading...</p>
                </div>
              </div>
            ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-muted">
          {images.length}/8 images · Drag and use arrows to reorder · First image is primary
        </p>
      )}
    </div>
  );
}
