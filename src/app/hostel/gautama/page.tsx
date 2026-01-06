'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { VisitRequest } from '@/types';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { VISIT_STATUS } from '@/lib/constants';
import ModernHeader from '@/components/ModernHeader';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  AlertTriangle,
  Eye,
  Check,
  X
} from 'lucide-react';

interface ApprovalModalProps {
  request: VisitRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, comments?: string) => void;
  onReject: (id: string, comments: string) => void;
}

function ApprovalModal({ request, isOpen, onClose, onApprove, onReject }: ApprovalModalProps) {
  const [comments, setComments] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  if (!isOpen || !request) return null;

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(request.id, comments);
    } else if (action === 'reject') {
      if (!comments.trim()) {
        alert('Comments are required for rejection');
        return;
      }
      onReject(request.id, comments);
    }
    setComments('');
    setAction(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-auto max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Review Visit Request</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Student Name</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{request.student?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Room Number</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{request.student?.roomNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Parent Name</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{request.parent?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{request.parent?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Visit Date</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {new Date(request.validFrom).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valid Until</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {new Date(request.validUntil).toLocaleString()}
              </p>
            </div>
            {request.vehicleNo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle Number</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{request.vehicleNo}</p>
              </div>
            )}
            {request.purpose && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Purpose</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{request.purpose}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comments {action === 'reject' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              placeholder={action === 'reject' ? 'Please provide reason for rejection' : 'Optional comments...'}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setAction('reject');
              handleSubmit();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Reject</span>
          </button>
          <button
            onClick={() => {
              setAction('approve');
              handleSubmit();
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Approve</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GautamaHostelPortal() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'pending-scans' | 'inside' | 'out'>('pending-scans');
  const [selectedRequest, setSelectedRequest] = useState<VisitRequest | null>(null);
  const [showModal, setShowModal] = useState(false);

  const HOSTEL_NAME = 'Gautama Bhavanam';

  const fetchVisitRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/visits?hostelName=${encodeURIComponent(HOSTEL_NAME)}`);
      const requests = response.data.visitRequests || response.data;
      setVisitRequests(requests);

      const pendingScannedVisits = requests.filter(
        (r: VisitRequest) => r.status === VISIT_STATUS.INSIDE
      );
      
      if (pendingScannedVisits.length > 0) {
        addToast({
          title: 'Attention Required',
          message: `${pendingScannedVisits.length} visit(s) scanned and awaiting approval`,
          type: 'info'
        });
      }
    } catch {
      addToast({
        title: 'Error',
        message: 'Failed to load visit requests',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (user) {
      fetchVisitRequests();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleApprove = async (requestId: string, comments?: string) => {
    try {
      await api.post(`/visits/${requestId}/approve`, { 
        status: true, 
        remarks: comments 
      });
      addToast({
        title: 'Success',
        message: 'Visit request approved successfully',
        type: 'success'
      });
      fetchVisitRequests();
    } catch (error: unknown) {
      let message = 'Failed to approve request';
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        typeof (error as { response?: unknown }).response === 'object' &&
        (error as { response?: { data?: unknown } }).response &&
        'data' in (error as { response: { data?: unknown } }).response &&
        typeof ((error as { response: { data?: unknown } }).response.data) === 'object' &&
        ((error as { response: { data: { error?: string } } }).response.data &&
          'error' in (error as { response: { data: { error?: string } } }).response.data)
      ) {
        message = ((error as { response: { data: { error?: string } } }).response.data.error) || message;
      }
      addToast({
        title: 'Error',
        message,
        type: 'error'
      });
    }
  };

  const handleReject = async (requestId: string, comments: string) => {
    try {
      await api.post(`/visits/${requestId}/approve`, { 
        status: false, 
        remarks: comments 
      });
      addToast({
        title: 'Success',
        message: 'Visit request rejected',
        type: 'success'
      });
      fetchVisitRequests();
    } catch (error: unknown) {
      let message = 'Failed to reject request';
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        typeof (error as { response?: unknown }).response === 'object' &&
        (error as { response?: { data?: unknown } }).response &&
        'data' in (error as { response: { data?: unknown } }).response &&
        typeof ((error as { response: { data?: unknown } }).response.data) === 'object' &&
        ((error as { response: { data: { message?: string } } }).response.data &&
          'message' in (error as { response: { data: { message?: string } } }).response.data)
      ) {
        message = ((error as { response: { data: { message?: string } } }).response.data.message) || message;
      }
      addToast({
        title: 'Error',
        message,
        type: 'error'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case VISIT_STATUS.APPROVED:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case VISIT_STATUS.REJECTED:
        return <XCircle className="w-5 h-5 text-red-500" />;
      case VISIT_STATUS.PENDING:
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case VISIT_STATUS.INSIDE:
        return <AlertTriangle className="w-5 h-5 text-blue-500" />;
      case VISIT_STATUS.OUT:
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
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
      case VISIT_STATUS.INSIDE:
        return 'bg-blue-100 text-blue-800';
      case VISIT_STATUS.OUT:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = (() => {
    if (filter === 'pending-scans') {
      return visitRequests.filter(r => r.status === VISIT_STATUS.INSIDE);
    } else if (filter === 'all') {
      return visitRequests;
    } else if (filter === 'inside') {
      return visitRequests.filter(r => r.status === VISIT_STATUS.INSIDE);
    } else if (filter === 'out') {
      return visitRequests.filter(r => r.status === VISIT_STATUS.OUT);
    } else {
      return visitRequests.filter(request => request.status === filter.toUpperCase());
    }
  })();

  const pendingCount = visitRequests.filter(r => r.status === VISIT_STATUS.PENDING).length;
  const approvedCount = visitRequests.filter(r => r.status === VISIT_STATUS.APPROVED).length;
  const rejectedCount = visitRequests.filter(r => r.status === VISIT_STATUS.REJECTED).length;
  const insideCount = visitRequests.filter(r => r.status === VISIT_STATUS.INSIDE).length;
  const outCount = visitRequests.filter(r => r.status === VISIT_STATUS.OUT).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ModernHeader
        title="Gautama Bhavanam Portal"
        subtitle={`Welcome back, ${user?.name}`}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Need Approval</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{insideCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{visitRequests.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{approvedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{rejectedCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6 border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'pending-scans', label: 'Scanned (Need Approval)', count: insideCount },
                { key: 'pending', label: 'Pending', count: pendingCount },
                { key: 'all', label: 'All', count: visitRequests.length },
                { key: 'approved', label: 'Approved', count: approvedCount },
                { key: 'rejected', label: 'Rejected', count: rejectedCount },
                { key: 'out', label: 'Completed (Out)', count: outCount },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as 'all' | 'pending' | 'approved' | 'rejected' | 'pending-scans' | 'inside' | 'out')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Student Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Parent Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Visit Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Scan Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {request.student?.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Room: {request.student?.roomNumber}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Course: {request.student?.course}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {request.parent?.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {request.parent?.email}
                        </div>
                        {request.vehicleNo && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Vehicle: {request.vehicleNo}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        From: {new Date(request.validFrom).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Until: {new Date(request.validUntil).toLocaleString()}
                      </div>
                      {request.purpose && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Purpose: {request.purpose}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.scanLogs && request.scanLogs.length > 0 ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Entry Scanned
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(request.scanLogs[0].createdAt).toLocaleString()}
                          </div>
                          <div className="text-xs text-orange-600 dark:text-orange-400">
                            Waiting for approval
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Not scanned
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowModal(true);
                          }}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Review</span>
                        </button>
                        {request.status === VISIT_STATUS.INSIDE && (
                          <>
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                            >
                              <Check className="w-4 h-4" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                            >
                              <X className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No visit requests found for Gautama Bhavanam</p>
            </div>
          )}
        </div>
      </div>

      <ApprovalModal
        request={selectedRequest}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedRequest(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
