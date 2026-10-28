/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  Download,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  School,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import { usePrintPreview } from '../context/PrintPreviewContext';
import { useAuth } from '../context/AuthContext';

export const PrintPreviewModal: React.FC = () => {
  const { isOpen, options, closePrintPreview } = usePrintPreview();
  const { currentUser, logAuditAction } = useAuth();
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (options?.orientation) {
      setOrientation(options.orientation);
    } else {
      setOrientation('portrait');
    }
    setZoomLevel(100);
  }, [options]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closePrintPreview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closePrintPreview]);

  // Handle body class for print isolation
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('print-preview-active');
    } else {
      document.body.classList.remove('print-preview-active');
    }
    return () => {
      document.body.classList.remove('print-preview-active');
    };
  }, [isOpen]);

  if (!isOpen || !options) return null;

  const handlePrint = () => {
    logAuditAction(
      'print_report',
      `Printed document: "${options.title}" (Ref: ${options.documentNumber || 'N/A'})`
    );
    window.print();
  };

  const handleDownloadPdf = () => {
    logAuditAction(
      'export_pdf',
      `Downloaded PDF export: "${options.title}" (Ref: ${options.documentNumber || 'N/A'})`
    );
    // In browser, calling print dialog with 'Save as PDF' option is the standard lossless vector export
    window.print();
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const currentTimeFormatted = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="print-preview-modal-root print-preview-modal-backdrop fixed inset-0 z-[9999] flex flex-col bg-slate-950/85 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      {/* Top Modal Controls Toolbar (Hidden during print) */}
      <header className="no-print bg-slate-900 border-b border-slate-800 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg print-preview-controls">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Print Preview & Official Report Generation</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                A4 {orientation.toUpperCase()}
              </span>
            </h3>
            <p className="text-xs text-slate-400 truncate max-w-md">
              {options.title} {options.documentNumber ? `· Ref: ${options.documentNumber}` : ''}
            </p>
          </div>
        </div>

        {/* Toolbar Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(70, prev - 15))}
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] font-semibold text-slate-300 w-12 text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(150, prev + 15))}
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Orientation Toggle */}
          <button
            onClick={() => setOrientation((prev) => (prev === 'portrait' ? 'landscape' : 'portrait'))}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Toggle Page Orientation"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="capitalize">{orientation}</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Download or Save as PDF"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Download PDF</span>
          </button>

          {/* Primary Print Button */}
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
            title="Print Document"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>

          {/* Close Modal Button */}
          <button
            onClick={closePrintPreview}
            className="p-1.5 rounded-lg hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800 transition-colors ml-2"
            title="Close Preview (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Preview Container Scroll Viewport */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-start justify-center print-preview-container">
        {/* A4 Sheet Paper Card */}
        <div
          ref={paperRef}
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
            width: orientation === 'portrait' ? '210mm' : '297mm',
            minHeight: orientation === 'portrait' ? '297mm' : '210mm',
          }}
          className="print-preview-sheet bg-white text-slate-900 shadow-2xl rounded-sm p-8 sm:p-12 flex flex-col justify-between border border-slate-300 print:shadow-none print:border-none print:p-0 print:m-0"
        >
          {/* Header Section: Ministry of Education & School Letterhead */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-900 text-white flex items-center justify-center font-bold text-xl border-2 border-amber-400 shrink-0">
                <School className="w-8 h-8 text-amber-300" />
              </div>

              <div className="flex-1 text-center">
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-700">
                  Republic of Kenya · Ministry of Education
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight uppercase mt-0.5">
                  LIMURU MODEL COMPREHENSIVE SCHOOL
                </h1>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">
                  Kiambu County · Limuru Sub-County · P.O. Box 240-00217 Limuru, Kenya
                </p>
                <div className="flex items-center justify-center gap-3 text-[11px] font-bold text-emerald-900 mt-1">
                  <span>Center No: <strong>20401823</strong></span>
                  <span>·</span>
                  <span>KEMIS Code: <strong>KM-LM-0418</strong></span>
                  <span>·</span>
                  <span>Tel: <strong>+254 722 000 111</strong></span>
                </div>
              </div>

              <div className="w-16 h-16 flex items-center justify-center border-2 border-slate-300 rounded-lg p-1 text-center shrink-0">
                <div className="text-[10px] font-bold text-slate-500 uppercase leading-tight">
                  OFFICIAL COPY
                </div>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="mt-5 pt-3 border-t border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">
                  {options.title}
                </h2>
                {options.subtitle && (
                  <p className="text-xs text-slate-600 font-medium">{options.subtitle}</p>
                )}
              </div>

              <div className="text-right text-[11px] text-slate-600 font-medium">
                <div>Date: <strong>{currentDateFormatted}</strong> ({currentTimeFormatted})</div>
                <div>
                  Generated By:{' '}
                  <strong className="text-slate-900">
                    {currentUser?.fullName || 'Authorized Officer'}
                  </strong>{' '}
                  ({currentUser?.role ? currentUser.role.toUpperCase() : 'STAFF'})
                </div>
              </div>
            </div>
          </div>

          {/* Report Data / Main Content Area */}
          <div className="flex-1 text-xs text-slate-900 space-y-4 my-2">
            {options.content}
          </div>

          {/* Official Signature, Seal & Footer Section */}
          <div className="mt-8 pt-6 border-t-2 border-slate-800 space-y-6">
            {options.showSignatures !== false && (
              <div className="grid grid-cols-3 gap-6 text-[11px]">
                {/* Prepared By Signature */}
                <div className="space-y-12">
                  <div className="font-bold text-slate-700 uppercase">
                    Prepared By:
                  </div>
                  <div className="border-t border-slate-400 pt-1">
                    <div className="font-bold text-slate-900">
                      {currentUser?.fullName || 'Bursar / Lead Educator'}
                    </div>
                    <div className="text-slate-500 text-[10px]">Accounts & Academics Office</div>
                    <div className="text-slate-400 text-[9px] font-mono">Date: ____________________</div>
                  </div>
                </div>

                {/* Circular Official Rubber Stamp */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-emerald-900 flex flex-col items-center justify-center text-center p-2 text-emerald-950 rotate-[-4deg]">
                    <span className="text-[8px] font-black uppercase tracking-tighter">Limuru Model Comp.</span>
                    <span className="text-[7px] font-bold text-slate-600 uppercase">★ OFFICIAL STAMP ★</span>
                    <span className="text-[7px] font-mono mt-0.5">{new Date().toISOString().slice(0, 10)}</span>
                    <span className="text-[6px] font-bold uppercase tracking-widest text-emerald-800">APPROVED</span>
                  </div>
                </div>

                {/* Verified & Approved By Head Teacher */}
                <div className="space-y-12 text-right">
                  <div className="font-bold text-slate-700 uppercase">
                    Approved By:
                  </div>
                  <div className="border-t border-slate-400 pt-1">
                    <div className="font-bold text-slate-900">Dr. Anthony K. Macharia</div>
                    <div className="text-slate-500 text-[10px]">Head Teacher & Secretary to BoM</div>
                    <div className="text-slate-400 text-[9px] font-mono">Signature: ____________________</div>
                  </div>
                </div>
              </div>
            )}

            {/* Document Bottom Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Verified by Limuru Comprehensive School CBC Information System · Kenya MoE Standards</span>
              </div>
              <div className="tabular-nums">
                Page 1 of 1 · Ref: {options.documentNumber || `DOC-${Date.now().toString().slice(-6)}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
