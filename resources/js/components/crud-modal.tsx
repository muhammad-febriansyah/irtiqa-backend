import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

interface CrudModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
  isSubmitting?: boolean
  submitLabel?: string
  cancelLabel?: string
}

export function CrudModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Simpan",
  cancelLabel = "Batal",
}: CrudModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(e)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <div className="py-4">{children}</div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner className="mr-2" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
