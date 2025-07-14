'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { ScanLog, VisitRequest } from '@/types';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { SCAN_TYPES, VISIT_STATUS } from '@/lib/constants';
import { 
  QrCode, 
  Camera, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  AlertTriangle,
  Play,
  Square
} from 'lucide-react';
import QRScanner from '@/components/QRScanner';
import ThemeToggle from '@/components/ThemeToggle';

export default function SecurityDashboard() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<ScanLog[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/scan/logs');
      setScanLogs(response.data.scanLogs || []);
      setRecentScans((response.data.scanLogs || []).slice(0, 5)); // Get 5 most recent
    } catch (error) {
      addToast({
        title: 'Error',
        message: 'Failed to load scan logs',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async (qrData: string) => {
    try {
      setLoading(true);
      
      // First verify the QR code
      const verifyResponse = await api.post('/scan/verify', { 
        qrCode: qrData 
      });
      
      if (!verifyResponse.data.valid) {
        addToast({
          title: 'Invalid QR Code',
          message: verifyResponse.data.message || 'QR code is not valid',
          type: 'error'
        });
        return;
      }

      // Show scan type selection
      const scanType = await showScanTypeDialog();
      if (!scanType) return;

      // Record the scan
      const scanResponse = await api.post('/scan/record', {
        qrCode: qrData,
        scanType,
        location: 'Main Gate' // Default location
      });

      addToast({
        title: 'Scan Successful',
        message: scanResponse.data.status === 'PENDING_APPROVAL' 
          ? 'Entry scan recorded. Waiting for warden approval.'
          : `${scanType} scan recorded successfully`,
        type: scanResponse.data.status === 'PENDING_APPROVAL' ? 'warning' : 'success'
      });

      // Refresh data
      fetchData();
      
      // Stop scanner after successful scan
      setScanning(false);
      
    } catch (error: any) {
      addToast({
        title: 'Scan Error',
        message: error.response?.data?.message || 'Failed to process scan',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const showScanTypeDialog = (): Promise<string | null> => {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
          <h3 class="text-lg font-semibold mb-4">Select Scan Type</h3>
          <div class="space-y-3">
            <button id="entry-btn" class="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Entry Scan
            </button>
            <button id="exit-btn" class="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Exit Scan
            </button>
            <button id="cancel-btn" class="w-full p-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      modal.querySelector('#entry-btn')?.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve(SCAN_TYPES.ENTRY);
      });
      
      modal.querySelector('#exit-btn')?.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve(SCAN_TYPES.EXIT);
      });
      
      modal.querySelector('#cancel-btn')?.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve(null);
      });
    });
  };

  const getScanTypeIcon = (scanType: string) => {
    return scanType === SCAN_TYPES.ENTRY ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getScanTypeColor = (scanType: string) => {
    return scanType === SCAN_TYPES.ENTRY ? 
      'bg-green-100 text-green-800' : 
      'bg-red-100 text-red-800';
  };

  const handleScannerError = (error: string) => {
    addToast({
      title: 'Scanner Error',
      message: error,
      type: 'error'
    });
  };

  const toggleScanner = () => {
    if (scanning) {
      // Immediately stop scanning
      setScanning(false);
    } else {
      // Start scanning with a small delay to ensure clean state
      setScanning(true);
    }
  };

  if (loading && (!Array.isArray(scanLogs) || scanLogs.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Security Portal</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleScanner}
                disabled={loading}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  scanning 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {scanning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{scanning ? 'Stop Scanner' : 'Start Scanner'}</span>
              </button>
              <ThemeToggle />
              <button
                onClick={logout}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Scanner Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">QR Code Scanner</h2>
              <div className={`px-3 py-1 rounded-full text-sm ${
                scanning 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
              }`}>
                {scanning ? 'Active' : 'Inactive'}
              </div>
            </div>
            
            <QRScanner onScan={handleQRScan} isActive={scanning} onError={handleScannerError} />
          </div>

          {/* Stats and Recent Scans */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Scans</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{Array.isArray(scanLogs) ? scanLogs.length : 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Today's Entries</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {(Array.isArray(scanLogs) ? scanLogs : []).filter(log => 
                        log.scanType === SCAN_TYPES.ENTRY && 
                        new Date(log.createdAt).toDateString() === new Date().toDateString()
                      ).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Scans */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Scans</h3>
              </div>
              <div className="p-6">
                {Array.isArray(recentScans) && recentScans.length > 0 ? (
                  <div className="space-y-4">
                    {recentScans.map((scan) => (
                      <div key={scan.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getScanTypeIcon(scan.scanType)}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {scan.visitRequest?.student?.name || 'Unknown Student'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(scan.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScanTypeColor(scan.scanType)}`}>
                          {scan.scanType}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <QrCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No scans recorded yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full Scan History */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Scan History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Scan Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {(Array.isArray(scanLogs) ? scanLogs : []).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.visitRequest?.student?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Room: {log.visitRequest?.student?.roomNumber || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getScanTypeIcon(log.scanType)}
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getScanTypeColor(log.scanType)}`}>
                          {log.scanType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.location || 'Main Gate'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Recorded
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
