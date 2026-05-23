"use client";

import { useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export default function ConfirmDeleteDialog({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  isDeleting = false,
}: ConfirmDeleteDialogProps) {
  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isDeleting && onCancel()} />
      
      {/* Dialog */}
      <div className="relative bg-[#1a1a24] border border-[#2a2a3a] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-white mb-2">
            {isDeleting ? "Deleting..." : title}
          </h3>

          {/* Description */}
          <p className="text-sm text-[#a3a3aa] mb-6">
            {isDeleting ? "Please wait while we delete this item." : description}
          </p>

          {/* Buttons */}
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 rounded-xl border-[#2a2a3a] bg-[#2a2a3a] hover:bg-[#3a3a4a] text-white font-medium transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              loading={isDeleting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors border-none"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
