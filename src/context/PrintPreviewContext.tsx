/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface PrintPreviewOptions {
  title: string;
  subtitle?: string;
  documentNumber?: string;
  category?: string;
  orientation?: 'portrait' | 'landscape';
  content: React.ReactNode;
  showSignatures?: boolean;
  showOfficialStamp?: boolean;
}

interface PrintPreviewContextType {
  isOpen: boolean;
  options: PrintPreviewOptions | null;
  openPrintPreview: (opts: PrintPreviewOptions) => void;
  closePrintPreview: () => void;
}

const PrintPreviewContext = createContext<PrintPreviewContextType | undefined>(undefined);

export const PrintPreviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<PrintPreviewOptions | null>(null);

  const openPrintPreview = useCallback((opts: PrintPreviewOptions) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const closePrintPreview = useCallback(() => {
    setIsOpen(false);
    setOptions(null);
  }, []);

  return (
    <PrintPreviewContext.Provider
      value={{
        isOpen,
        options,
        openPrintPreview,
        closePrintPreview,
      }}
    >
      {children}
    </PrintPreviewContext.Provider>
  );
};

export const usePrintPreview = () => {
  const context = useContext(PrintPreviewContext);
  if (!context) {
    throw new Error('usePrintPreview must be used within a PrintPreviewProvider');
  }
  return context;
};
