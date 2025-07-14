'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, X } from 'lucide-react';

interface QRCodeDisplayProps {
  qrCodeData: string;
  studentName: string;
  visitDate: string;
  status?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeDisplay({ 
  qrCodeData, 
  studentName, 
  visitDate, 
  status = 'PENDING',
  isOpen, 
  onClose 
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && qrCodeData && canvasRef.current) {
      generateQRCode();
    }
  }, [isOpen, qrCodeData]);

  const generateQRCode = async () => {
    if (!canvasRef.current) return;
    
    try {
      await QRCode.toCanvas(canvasRef.current, qrCodeData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `visit-qr-${studentName.replace(/\s+/g, '-')}-${new Date().getTime()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Visit QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 text-center">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">{studentName}</h3>
            <p className="text-sm text-gray-600">
              Visit Date: {new Date(visitDate).toLocaleString()}
            </p>
            <div className="mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                status === 'APPROVED' 
                  ? 'bg-green-100 text-green-800' 
                  : status === 'REJECTED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {status}
              </span>
            </div>
          </div>

          {/* QR Code Canvas */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <canvas ref={canvasRef} className="mx-auto" />
            </div>
          </div>

          {/* Status-based Instructions */}
          {status === 'PENDING' ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">QR Code Generated - Pending Approval:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Your QR code is ready!</li>
                <li>• Security will scan this at the gate</li>
                <li>• Warden approval will be requested after scanning</li>
                <li>• Keep this QR code saved on your phone</li>
              </ul>
            </div>
          ) : status === 'APPROVED' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
              <h4 className="text-sm font-medium text-green-900 mb-2">Visit Approved - Ready to Use:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Your visit has been approved!</li>
                <li>• Show this QR code to security at the hostel gate</li>
                <li>• The code will be scanned for both entry and exit</li>
                <li>• Valid only for the specified date and time</li>
              </ul>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <h4 className="text-sm font-medium text-red-900 mb-2">Visit Request Rejected:</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Your visit request has been rejected</li>
                <li>• Please contact the warden for more information</li>
                <li>• You may submit a new request if needed</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={downloadQRCode}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download QR Code</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
