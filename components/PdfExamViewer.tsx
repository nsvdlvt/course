"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, ZoomIn, ZoomOut } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";

type PdfExamViewerProps = {
  fileUrl: string;
};

export default function PdfExamViewer({ fileUrl }: PdfExamViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [scale, setScale] = useState(1.15);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      try {
        setLoading(true);
        setError("");

        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.mjs",
          import.meta.url
        ).toString();

        const task = pdfjs.getDocument({ url: fileUrl });
        const loadedPdf = await task.promise;

        if (cancelled) {
          return;
        }

        setPdf(loadedPdf);
        setPageCount(loadedPdf.numPages);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Không thể tải file PDF."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
      setPdf(null);
    };
  }, [fileUrl]);

  useEffect(() => {
    if (!pdf || !containerRef.current) {
      return;
    }

    let cancelled = false;
    const container = containerRef.current;
    const currentPdf = pdf;

    async function renderAllPages() {
      setRendering(true);
      container.replaceChildren();

      try {
        for (
          let pageNumber = 1;
          pageNumber <= currentPdf.numPages;
          pageNumber += 1
        ) {
          if (cancelled) {
            return;
          }

          const page = await currentPdf.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const fitWidthScale = Math.max(
            (container.clientWidth - 32) / baseViewport.width,
            0.5
          );
          const viewport = page.getViewport({ scale: fitWidthScale * scale });
          const pixelRatio = window.devicePixelRatio || 1;
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) {
            continue;
          }

          canvas.width = Math.floor(viewport.width * pixelRatio);
          canvas.height = Math.floor(viewport.height * pixelRatio);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;
          canvas.className =
            "mx-auto mb-5 block bg-white shadow-[0_12px_35px_rgba(15,23,42,0.22)]";

          context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

          await page.render({
            canvas,
            canvasContext: context,
            viewport,
          }).promise;

          if (!cancelled) {
            container.appendChild(canvas);
          }
        }
      } catch (renderError) {
        if (!cancelled) {
          setError(
            renderError instanceof Error
              ? renderError.message
              : "Không thể render PDF."
          );
        }
      } finally {
        if (!cancelled) {
          setRendering(false);
        }
      }
    }

    renderAllPages();

    return () => {
      cancelled = true;
    };
  }, [pdf, scale]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-300">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 bg-slate-100 px-3 py-2">
        <span className="text-sm font-semibold text-slate-700">
          {pageCount ? `${pageCount} trang` : "PDF"}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setScale((current) => Math.max(current - 0.15, 0.7))}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm"
          >
            <ZoomOut size={18} />
          </button>
          <span className="w-14 text-center text-sm font-semibold text-slate-700">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setScale((current) => Math.min(current + 0.15, 2.2))}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm"
          >
            <ZoomIn size={18} />
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-auto p-3 sm:p-5">
        {(loading || rendering) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-200/80 text-slate-600">
            <Loader2 size={28} className="mr-3 animate-spin" />
            {loading ? "Đang tải tài liệu..." : "Đang render tài liệu..."}
          </div>
        )}

        {error ? (
          <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-5 text-center text-sm text-red-600 shadow">
            {error}
          </div>
        ) : (
          <div ref={containerRef} />
        )}
      </div>
    </div>
  );
}
