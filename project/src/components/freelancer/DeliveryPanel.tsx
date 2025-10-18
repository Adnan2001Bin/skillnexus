// src/components/freelancer/DeliverProjectDialog.tsx
"use client";

import * as React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { UTFileUploader } from "@/components/client/UTFileUploader";
import {
  Upload,
  X,
  SendHorizonal,
  FileText,
  Info,
} from "lucide-react";

type DeliveryFile = { name: string; size?: number; url: string };

export function DeliverProjectDialog({
  open,
  orderId,
  onClose,
  onDelivered,
}: {
  open: boolean;
  orderId: string;
  onClose: () => void;
  onDelivered?: () => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [files, setFiles] = React.useState<DeliveryFile[]>([]);

  const hasContent = message.trim().length > 0 || files.length > 0;
  const charCount = message.length;
  const charLimit = 4000;

  const removeFile = (idx: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

  const reset = () => {
    setMessage("");
    setFiles([]);
  };

  const submit = async () => {
    if (!hasContent) {
      toast({
        variant: "destructive",
        title: "Add something to deliver",
        description: "Include a message and/or at least one file.",
      });
      return;
    }
    try {
      setBusy(true);
      const res = await fetch(`/api/freelancer/orders/${orderId}/delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, files }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Delivery failed");

      toast({ title: "Delivered", description: "The client has been notified." });
      reset();
      onDelivered?.();
      onClose();
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Delivery failed",
        description: e?.message || "Could not deliver the order.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="space-y-1 border-b border-slate-200 bg-slate-50 px-5 py-3.5">
          <DialogTitle className="text-sm font-semibold text-slate-900">
            Deliver project
          </DialogTitle>
          <DialogDescription className="text-[11px] text-slate-600">
            Finalize with a short note and attach deliverables. This marks the order as <b>completed</b>.
          </DialogDescription>
        </DialogHeader>

        {/* Body (scrollable) */}
        <div className="flex max-h-[85vh] flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {/* Message */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-800">Message</label>
              <Textarea
                rows={5}
                value={message}
                onChange={(e) =>
                  e.target.value.length <= charLimit && setMessage(e.target.value)
                }
                placeholder="Handoff note, changelog, how to use the files, important links…"
                className="resize-y"
                disabled={busy}
              />
              <div className="flex items-center justify-between">
                <div className="mt-0.5 inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Info className="h-3.5 w-3.5" />
                  Links are allowed and visible to the client.
                </div>
                <div className="text-[11px] text-slate-500">
                  {charCount}/{charLimit}
                </div>
              </div>
            </div>

            {/* Files */}
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium text-slate-800">Files</label>
              <UTFileUploader
                maxFiles={8}
                onChange={(uploaded: DeliveryFile[]) => setFiles(uploaded)}
                note="Drag & drop or click to add files (PDFs, images, zips, etc.)"
                disabled={busy}
              />

              {/* Compact file chips */}
              {files.length > 0 && (
                <div className="mt-2">
                  <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-500">
                    Attached ({files.length})
                  </div>
                  <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1">
                    {files.map((f, i) => (
                      <span
                        key={`${f.url}-${i}`}
                        className="group inline-flex max-w-full items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-700 ring-1 ring-slate-200"
                        title={f.name}
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate underline decoration-emerald-600/50 underline-offset-2 hover:text-emerald-700"
                        >
                          {f.name}
                        </a>
                        {typeof f.size === "number" && (
                          <span className="shrink-0 text-[10px] text-slate-500">
                            · {Math.round(f.size / 1024)} KB
                          </span>
                        )}
                        <button
                          type="button"
                          aria-label="Remove file"
                          onClick={() => removeFile(i)}
                          disabled={busy}
                          className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                <Upload className="h-3.5 w-3.5" />
                Files are shared as secure links for the client to download.
              </div>
            </div>
          </div>

          {/* Footer (sticky) */}
          <DialogFooter className="sticky bottom-0 z-10 flex items-center justify-between gap-2 border-t border-slate-200 bg-white px-5 py-3.5">
            <DialogClose asChild>
              <Button variant="outline" size="sm" disabled={busy}>
                Close
              </Button>
            </DialogClose>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={reset}
                disabled={busy || !hasContent}
                title="Clear message & files"
              >
                Reset
              </Button>
              <Button size="sm" onClick={submit} disabled={busy}>
                {busy ? (
                  "Delivering…"
                ) : (
                  <>
                    <SendHorizonal className="mr-2 h-4 w-4" />
                    Deliver order
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DeliverProjectDialog;
