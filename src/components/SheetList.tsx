'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';

interface Worker {
  name: string;
  wages: number;
  status: 'pending' | 'paid';
}

interface Sheet {
  _id: string;
  location: string;
  date: string;
  status: 'draft' | 'final';
  workers: Worker[];
  createdAt: string;
}

type SortField = 'location' | 'date' | 'workers' | 'totalWages' | 'status' | 'createdAt';
type SortOrder = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export default function SheetList() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [filteredSheets, setFilteredSheets] = useState<Sheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Sorting and filtering state
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'createdAt', order: 'desc' });
  const [filters, setFilters] = useState({
    location: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
  });

  const calculateTotalWages = (workers: Worker[]) => {
    return workers.reduce((total, worker) => total + worker.wages, 0);
  };

  const calculateGrandTotal = (sheets: Sheet[]) => {
    return sheets.reduce((total, sheet) => total + calculateTotalWages(sheet.workers), 0);
  };

  const calculateTotalWorkers = (sheets: Sheet[]) => {
    return sheets.reduce((total, sheet) => total + sheet.workers.length, 0);
  };

  useEffect(() => {
    fetchSheets();
  }, []);

  useEffect(() => {
    // Apply filters and sorting whenever sheets, filters, or sort config changes
    let result = [...sheets];

    // Apply filters
    if (filters.location) {
      result = result.filter(sheet => 
        sheet.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.status !== 'all') {
      result = result.filter(sheet => sheet.status === filters.status);
    }
    if (filters.dateFrom) {
      result = result.filter(sheet => 
        new Date(sheet.date) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      result = result.filter(sheet => 
        new Date(sheet.date) <= new Date(filters.dateTo)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.field) {
        case 'location':
          comparison = a.location.localeCompare(b.location);
          break;
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'workers':
          comparison = a.workers.length - b.workers.length;
          break;
        case 'totalWages':
          comparison = calculateTotalWages(a.workers) - calculateTotalWages(b.workers);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortConfig.order === 'asc' ? comparison : -comparison;
    });

    setFilteredSheets(result);
  }, [sheets, filters, sortConfig]);

  const fetchSheets = async () => {
    try {
      const response = await fetch('/api/sheets');
      if (!response.ok) throw new Error('Failed to fetch sheets');
      const data = await response.json();
      setSheets(data);
    } catch (err) {
      setError('Failed to load attendance sheets');
      console.error('Error fetching sheets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sheet?')) {
      return;
    }

    setIsDeleting(id);
    try {
      const response = await fetch(`/api/sheets?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete sheet');
      
      toast.success('Sheet deleted successfully');
      setSheets(sheets.filter(sheet => sheet._id !== id));
    } catch (err) {
      console.error('Error deleting sheet:', err);
      toast.error('Failed to delete sheet');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSort = (field: SortField) => {
    setSortConfig(current => ({
      field,
      order: current.field === field && current.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) return <ChevronsUpDown className="h-4 w-4" />;
    return sortConfig.order === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    return status === 'final' 
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Attendance Sheets</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/sheets/new"
            className="inline-flex mb-2 items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Add Sheet
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Input
            placeholder="Filter by location"
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            className="w-full"
          />
        </div>
        <div>
          <Select
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="final">Final</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Input
            type="date"
            placeholder="From Date"
            value={filters.dateFrom}
            onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            className="w-full"
          />
        </div>
        <div>
          <Input
            type="date"
            placeholder="To Date"
            value={filters.dateTo}
            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            className="w-full"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-6 bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Total Sheets</span>
            <span className="text-2xl font-semibold">{filteredSheets.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Total Workers</span>
            <span className="text-2xl font-semibold">{calculateTotalWorkers(filteredSheets)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">Total Wages</span>
            <span className="text-2xl font-semibold">
              {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(calculateGrandTotal(filteredSheets))}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <div className="min-w-full divide-y divide-gray-300">
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="flex items-center space-x-4 rounded-xl border p-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                      <div className="ml-auto space-x-2">
                        <Skeleton className="h-10 w-10" />
                        <Skeleton className="h-10 w-10" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-500 mb-4">{error}</div>
                  <Link
                    href="/sheets/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create New Sheet
                  </Link>
                </div>
              ) : sheets.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No attendance sheets found</p>
                  <Link
                    href="/sheets/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create New Sheet
                  </Link>
                </div>
              ) : (
                <div>
                  {/* Desktop view */}
                  <table className="hidden md:table min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          scope="col" 
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                          onClick={() => handleSort('location')}
                        >
                          <div className="flex items-center gap-2">
                            Location
                            {getSortIcon('location')}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                          onClick={() => handleSort('date')}
                        >
                          <div className="flex items-center gap-2">
                            Date
                            {getSortIcon('date')}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                          onClick={() => handleSort('workers')}
                        >
                          <div className="flex items-center gap-2">
                            Workers
                            {getSortIcon('workers')}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 cursor-pointer"
                          onClick={() => handleSort('totalWages')}
                        >
                          <div className="flex items-center gap-2 justify-end">
                            Total Wages
                            {getSortIcon('totalWages')}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center gap-2">
                            Status
                            {getSortIcon('status')}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                          onClick={() => handleSort('createdAt')}
                        >
                          <div className="flex items-center gap-2">
                            Created
                            {getSortIcon('createdAt')}
                          </div>
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredSheets.map((sheet) => (
                        <tr key={sheet._id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                            {sheet.location.charAt(0).toUpperCase() + sheet.location.slice(1)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {format(new Date(sheet.date), 'MMM d, yyyy')}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {sheet.workers.length} workers
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right font-medium">
                            {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(calculateTotalWages(sheet.workers))}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(sheet.status)}`}>
                              {sheet.status.charAt(0).toUpperCase() + sheet.status.slice(1)}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {format(new Date(sheet.createdAt), 'MMM d, yyyy')}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/sheets/${sheet._id}`}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                View
                              </Link>
                              <Link
                                href={`/sheets/${sheet._id}/edit`}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDelete(sheet._id)}
                                disabled={isDeleting === sheet._id}
                                className={`text-red-600 hover:text-red-900 ${isDeleting === sheet._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {isDeleting === sheet._id ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={2} className="px-3 py-4 text-sm font-medium text-gray-900">
                          Total Sheets: <span className="font-bold">{filteredSheets.length}</span>
                        </td>
                        <td className="px-3 py-4 text-sm font-medium text-gray-900">
                          Total Workers: <span className="font-bold">{calculateTotalWorkers(filteredSheets)}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right font-bold">
                          {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(calculateGrandTotal(filteredSheets))}
                        </td>
                        <td colSpan={3}></td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Mobile view */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {filteredSheets.map((sheet) => (
                      <div key={sheet._id} className="px-4 py-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {sheet.location.charAt(0).toUpperCase() + sheet.location.slice(1)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(sheet.date), 'MMM d, yyyy')}
                            </div>
                          </div>
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(sheet.status)}`}>
                            {sheet.status.charAt(0).toUpperCase() + sheet.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {sheet.workers.length} workers
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          Total: {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(calculateTotalWages(sheet.workers))}
                        </div>
                        <div className="flex justify-start gap-4 pt-2">
                          <Link
                            href={`/sheets/${sheet._id}`}
                            className="text-sm text-gray-600 hover:text-gray-900"
                          >
                            View
                          </Link>
                          <Link
                            href={`/sheets/${sheet._id}/edit`}
                            className="text-sm text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(sheet._id)}
                            disabled={isDeleting === sheet._id}
                            className={`text-sm text-red-600 hover:text-red-900 ${isDeleting === sheet._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {isDeleting === sheet._id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile Footer */}
                  <div className="md:hidden bg-gray-50 border-t border-gray-200 px-4 py-4">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="text-sm text-gray-700">
                        Sheets: <span className="font-medium">{filteredSheets.length}</span>
                      </div>
                      <div className="text-sm text-gray-700">
                        Workers: <span className="font-medium">{calculateTotalWorkers(filteredSheets)}</span>
                      </div>
                      <div className="text-sm text-gray-700">
                        Total Wages: <span className="font-medium">
                          {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(calculateGrandTotal(filteredSheets))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
