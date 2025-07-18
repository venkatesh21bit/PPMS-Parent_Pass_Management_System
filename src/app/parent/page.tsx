'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { VisitRequest, ScanLog } from '@/types';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { VISIT_STATUS } from '@/lib/constants';
import NewVisitForm from '@/components/NewVisitForm';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import ModernHeader from '@/components/ModernHeader';
import { ModernCard, StatsCard } from '@/components/ModernCard';
import { Calendar, QrCode, Plus, CheckCircle, XCircle, AlertCircle, Eye, Clock } from 'lucide-react';


export default function ParentDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewVisitForm, setShowNewVisitForm] = useState(false);
  const [selectedQRRequest, setSelectedQRRequest] = useState<VisitRequest | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const visitsResponse = await api.get('/visits');
      setVisitRequests(visitsResponse.data.visitRequests || visitsResponse.data);
    } catch {
      addToast({
        title: 'Error',
        message: 'Failed to load data',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case VISIT_STATUS.APPROVED:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case VISIT_STATUS.REJECTED:
        return <XCircle className="w-5 h-5 text-red-500" />;
      case VISIT_STATUS.PENDING:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case VISIT_STATUS.APPROVED:
        return 'bg-green-100 text-green-800';
      case VISIT_STATUS.REJECTED:
        return 'bg-red-100 text-red-800';
      case VISIT_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this visit request? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/visits/${requestId}`);
      addToast({
        title: 'Success',
        message: 'Visit request deleted successfully',
        type: 'success'
      });
      fetchData(); // Refresh the list
    } catch {
      addToast({
        title: 'Error',
        message: 'Failed to delete visit request',
        type: 'error'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Modern Header */}
      <ModernHeader
        title="Parent Portal"
        subtitle={`Welcome back, ${user?.name}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Requests"
            value={visitRequests.length}
            icon={<Calendar className="w-6 h-6" />}
            color="blue"
          />
          <StatsCard
            title="Approved"
            value={visitRequests.filter(v => v.status === VISIT_STATUS.APPROVED).length}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
          />
          <StatsCard
            title="Pending"
            value={visitRequests.filter(v => v.status === VISIT_STATUS.PENDING).length}
            icon={<AlertCircle className="w-6 h-6" />}
            color="yellow"
          />
        </div>

        {/* Recent Visit Requests */}
        <ModernCard>
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Visit Requests</h2>
            <button
              onClick={() => setShowNewVisitForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>New Visit Request</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Visit Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    QR Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {visitRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {request.student?.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Roll No: {request.student?.rollNumber}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {request.student?.hostelName} {request.student?.roomNumber && `- Room ${request.student.roomNumber}`}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {request.student?.course} {request.student?.branch && `- ${request.student.branch}`} {request.student?.year && `(Year ${request.student.year})`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {new Date(request.validFrom).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(request.validFrom).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{request.purpose}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.qrCode ? (
                        <button 
                          className={`$
                            request.status === 'APPROVED' 
                              ? 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                              : request.status === 'REJECTED'
                              ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                              : 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300'
                          }`}
                          onClick={() => {
                            setSelectedQRRequest(request);
                            setShowQRCode(true);
                          }}
                          title={`QR Code (${request.status})`}
                        >
                          <QrCode className="w-5 h-5" />
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedQRRequest(request);
                            setShowModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        {(request.status === 'PENDING' && (!request.scanLogs || request.scanLogs.length === 0)) && (
                          <button 
                            onClick={() => handleDeleteRequest(request.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 flex items-center space-x-1"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ModernCard>
      </div>

      {/* New Visit Form Modal */}
      <NewVisitForm
        isOpen={showNewVisitForm}
        onClose={() => setShowNewVisitForm(false)}
        onSuccess={fetchData}
      />

      {/* QR Code Display Modal */}
      {selectedQRRequest && (
        <QRCodeDisplay
          qrCodeData={selectedQRRequest.qrCode}
          studentName={selectedQRRequest.student?.name || ''}
          visitDate={selectedQRRequest.validFrom}
          status={selectedQRRequest.status}
          isOpen={showQRCode}
          onClose={() => {
            setShowQRCode(false);
            setSelectedQRRequest(null);
          }}
        />
      )}

      {/* View Request Details Modal */}
      {selectedQRRequest && showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Visit Request Details</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Request Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Student Name</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedQRRequest.student?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Room Number</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedQRRequest.student?.roomNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedQRRequest.student?.course}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Branch</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedQRRequest.student?.branch}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Visit Date</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(selectedQRRequest.validFrom).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valid Until</label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(selectedQRRequest.validUntil).toLocaleString()}
                  </p>
                </div>
                {selectedQRRequest.vehicleNo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle Number</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedQRRequest.vehicleNo}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <div className="mt-1 flex items-center space-x-2">
                    {getStatusIcon(selectedQRRequest.status)}
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedQRRequest.status)}`}>
                      {selectedQRRequest.status}
                    </span>
                  </div>
                </div>
                {selectedQRRequest.purpose && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Purpose</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedQRRequest.purpose}</p>
                  </div>
                )}
              </div>

              {/* Scan History */}
              {selectedQRRequest.scanLogs && selectedQRRequest.scanLogs.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Scan History</h3>
                  <div className="space-y-2">
                    {selectedQRRequest.scanLogs.map((scan: ScanLog, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {scan.scanType} by {scan.scanner?.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(scan.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedQRRequest(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
