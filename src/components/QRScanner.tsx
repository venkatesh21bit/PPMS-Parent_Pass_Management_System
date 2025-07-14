'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Camera, QrCode, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  isActive: boolean;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, isActive, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const initializationRef = useRef(false);

  useEffect(() => {
    // Only check camera permission when scanner becomes active
    if (isActive && hasPermission === null && !isInitializing) {
      setIsInitializing(true);
      const checkPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
          setHasPermission(true);
        } catch (error) {
          console.error('Camera permission error:', error);
          setHasPermission(false);
          setScannerError('Camera permission denied. Please allow camera access and refresh the page.');
        } finally {
          setIsInitializing(false);
        }
      };

      checkPermission();
    }
  }, [isActive, hasPermission, isInitializing]);

  useEffect(() => {
    if (!isActive) {
      // Clean up scanner and reset states when becoming inactive
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (error) {
          console.warn('Error clearing scanner:', error);
        }
        scannerRef.current = null;
      }
      setIsInitialized(false);
      setHasPermission(null);
      setScannerError(null);
      setIsInitializing(false);
      initializationRef.current = false;
      return;
    }

    // Initialize scanner when active and has permission, but only once
    if (isActive && hasPermission === true && !isInitialized && !initializationRef.current) {
      initializationRef.current = true;
      initializeScanner();
    }

    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (error) {
          console.warn('Error clearing scanner on cleanup:', error);
        }
        scannerRef.current = null;
      }
    };
  }, [isActive, hasPermission, isInitialized]);

  const initializeScanner = async () => {
    try {
      // Add a small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2,
        videoConstraints: {
          facingMode: "environment" // Use back camera on mobile devices
        }
      };

      const scanner = new Html5QrcodeScanner('qr-scanner-container', config, false);
      
      scanner.render(
        (decodedText) => {
          // Success callback - automatically stop scanning after successful scan
          console.log('QR Code detected:', decodedText);
          onScan(decodedText);
          setScannerError(null);
          
          // Don't immediately clear the scanner, let the parent component handle it
          // This prevents the camera from turning off immediately
        },
        (error) => {
          // Error callback - this fires frequently during scanning, so we don't show all errors
          if (error.includes('NotFoundException') || error.includes('No MultiFormat Readers')) {
            // This is normal when no QR code is detected - don't log these
            return;
          }
          console.warn('QR Scanner error:', error);
        }
      );

      scannerRef.current = scanner;
      setIsInitialized(true);
      setScannerError(null);
      console.log('QR Scanner initialized successfully');
    } catch (error) {
      console.error('Error initializing scanner:', error);
      setScannerError('Failed to initialize camera scanner. Please check your camera connection.');
      onError?.('Failed to initialize camera scanner');
      initializationRef.current = false;
    }
  };

  const handleManualInput = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const qrCode = formData.get('qrCode') as string;
    if (qrCode.trim()) {
      onScan(qrCode.trim());
      (e.currentTarget as HTMLFormElement).reset();
    }
  };

  if (hasPermission === null || isInitializing) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Camera className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <p>Initializing camera...</p>
            <p className="text-sm">Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="aspect-square bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center">
          <div className="text-center text-red-600 p-4">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" />
            <p className="font-medium mb-2">Camera Access Required</p>
            <p className="text-sm">Please allow camera access and refresh the page to use the QR scanner.</p>
          </div>
        </div>

        {/* Manual QR Input as fallback */}
        <div className="mt-4">
          <form onSubmit={handleManualInput} className="space-y-2">
            <label htmlFor="qrCode" className="block text-sm font-medium text-gray-700">
              Manual QR Code Input
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                name="qrCode"
                id="qrCode"
                placeholder="Enter QR code manually"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Scan
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Scanner Container */}
      {isActive ? (
        <div className="relative">
          {/* Scanner loading state */}
          {(!isInitialized || isInitializing) && hasPermission === true && (
            <div className="absolute inset-0 bg-gray-900 rounded-lg flex items-center justify-center z-10">
              <div className="text-center text-white">
                <Camera className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                <p className="font-medium">Starting camera...</p>
                <p className="text-sm opacity-75">Please wait</p>
              </div>
            </div>
          )}
          
          {/* Scanner container - this will be populated by html5-qrcode */}
          <div 
            id="qr-scanner-container" 
            className="w-full qr-scanner-transition"
            style={{ 
              minHeight: '300px',
              backgroundColor: 'transparent',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          ></div>
          
          {/* Scanning instructions */}
          {isInitialized && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <QrCode className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Camera Active</p>
                  <p className="text-xs text-blue-600">Point camera at QR code to scan</p>
                </div>
              </div>
            </div>
          )}
          
          {scannerError && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{scannerError}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center text-gray-500">
            <QrCode className="w-20 h-20 mx-auto mb-4 text-gray-400" />
            <p className="font-medium text-lg">QR Scanner Ready</p>
            <p className="text-sm">Click "Start Scanner" to activate camera</p>
          </div>
        </div>
      )}

      {/* Manual QR Input for backup */}
      <div className="mt-4">
        <form onSubmit={handleManualInput} className="space-y-2">
          <label htmlFor="qrCode" className="block text-sm font-medium text-gray-700">
            Manual QR Code Input
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              name="qrCode"
              id="qrCode"
              placeholder="Enter QR code manually"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Scan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
