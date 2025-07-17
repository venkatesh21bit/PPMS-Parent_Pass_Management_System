'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { X, Calendar, Clock, User, Car, GraduationCap, Building } from 'lucide-react';

interface NewVisitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewVisitForm({ isOpen, onClose, onSuccess }: NewVisitFormProps) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    hostelName: '',
    roomNumber: '',
    degree: '',
    branch: '',
    year: '',
    vehicleNo: '',
    purpose: '',
    visitDate: '',
    visitTime: '',
    duration: '4' // Default 4 hours
  });

  useEffect(() => {
    if (isOpen) {
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, visitDate: today }));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentName || !formData.rollNumber || !formData.hostelName || !formData.visitDate || !formData.visitTime) {
      addToast({
        title: 'Validation Error',
        message: 'Please fill in all required fields',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      // Combine date and time
      const visitDateTime = new Date(`${formData.visitDate}T${formData.visitTime}`);
      const validUntil = new Date(visitDateTime.getTime() + (parseInt(formData.duration) * 60 * 60 * 1000));

      const requestData = {
        studentName: formData.studentName,
        rollNumber: formData.rollNumber,
        hostelName: formData.hostelName,
        roomNumber: formData.roomNumber,
        degree: formData.degree,
        branch: formData.branch,
        year: formData.year ? parseInt(formData.year) : undefined,
        vehicleNo: formData.vehicleNo || undefined,
        purpose: formData.purpose || undefined,
        validFrom: visitDateTime.toISOString(),
        validUntil: validUntil.toISOString()
      };

      await api.post('/visits', requestData);
      
      addToast({
        title: 'Success',
        message: 'Visit request submitted successfully',
        type: 'success'
      });

      // Reset form
      setFormData({
        studentName: '',
        rollNumber: '',
        hostelName: '',
        roomNumber: '',
        degree: '',
        branch: '',
        year: '',
        vehicleNo: '',
        purpose: '',
        visitDate: '',
        visitTime: '',
        duration: '4'
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      let errorMsg = 'Failed to submit request';
      if (typeof error === 'object' && error !== null && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response && error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
        errorMsg = (error.response.data as { message?: string }).message || errorMsg;
      }
      addToast({
        title: 'Error',
        message: errorMsg,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">New Visit Request</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Student Information */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Student Information</h3>
            
            {/* Student Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Student Name *
              </label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                placeholder="Enter student's full name"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Roll Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <GraduationCap className="w-4 h-4 inline mr-1" />
                Roll Number *
              </label>
              <input
                type="text"
                value={formData.rollNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                placeholder="e.g., cb.sc.u4cse23519"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Hostel and Room */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  Hostel Name *
                </label>
                <input
                  type="text"
                  value={formData.hostelName}
                  onChange={(e) => setFormData(prev => ({ ...prev, hostelName: e.target.value }))}
                  placeholder="e.g., Boys Hostel A"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Room Number
                </label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                  placeholder="e.g., 201"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Academic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <GraduationCap className="w-4 h-4 inline mr-1" />
                  Degree
                </label>
                <select
                  value={formData.degree}
                  onChange={(e) => setFormData(prev => ({ ...prev, degree: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Degree</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="B.Sc">B.Sc</option>
                  <option value="M.Sc">M.Sc</option>
                  <option value="BBA">BBA</option>
                  <option value="MBA">MBA</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="Ph.D">Ph.D</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Branch/Department
                </label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                  placeholder="e.g., Computer Science"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Visit Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Visit Date *
              </label>
              <input
                type="date"
                value={formData.visitDate}
                onChange={(e) => setFormData(prev => ({ ...prev, visitDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Visit Time *
              </label>
              <input
                type="time"
                value={formData.visitTime}
                onChange={(e) => setFormData(prev => ({ ...prev, visitTime: e.target.value }))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration (hours)
            </label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="2">2 hours</option>
              <option value="4">4 hours</option>
              <option value="6">6 hours</option>
              <option value="8">8 hours</option>
              <option value="12">12 hours</option>
              <option value="24">24 hours</option>
            </select>
          </div>

          {/* Vehicle Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Car className="w-4 h-4 inline mr-1" />
              Vehicle Number (Optional)
            </label>
            <input
              type="text"
              value={formData.vehicleNo}
              onChange={(e) => setFormData(prev => ({ ...prev, vehicleNo: e.target.value }))}
              placeholder="e.g., KA-01-AB-1234"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Purpose of Visit (Optional)
            </label>
            <textarea
              value={formData.purpose}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
              rows={3}
              placeholder="Brief description of the visit purpose..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Information Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Important Information:</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Your request will be sent to the warden for approval</li>
              <li>• You will receive a QR code once approved</li>
              <li>• Please arrive within the specified time window</li>
              <li>• Security will scan the QR code for entry and exit</li>
            </ul>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
