import { Loader2 } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DialogModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  isLoading?: boolean;
  isDelete?: boolean;
  width?: string;
}

export default function DialogModal({
  open,
  setOpen,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  isLoading,
  title,
  description,
  isDelete,
  children,
  width,
}: DialogModalProps) {
  const handleOpenChange = (val: boolean) => {
    setOpen(val);
  };

  const handleCancel = () => {
    setOpen(false);
    if (onCancel) onCancel();
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "bg-white rounded-lg max-h-[90vh] overflow-y-auto max-w-none",
          width ? width : "w-[500px]",
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-light-200">{description}</DialogDescription>
          )}
        </DialogHeader>

        {children}

        <DialogFooter className="flex flex-col items-center gap-1 justify-center">
          {onCancel && (
            <Button
              variant="outline"
              type="button"
              onClick={handleCancel}
              className="w-full"
              disabled={isLoading}
            >
              {cancelText ?? "Cancel"}
            </Button>
          )}
          {onConfirm && (
            <Button
              type="button"
              disabled={isLoading}
              className={cn("w-full", isDelete && "bg-red-500 text-white hover:bg-red-600")}
              onClick={handleConfirm}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
                </>
              ) : (
                (confirmText ?? (isDelete ? "Delete" : "Confirm"))
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
