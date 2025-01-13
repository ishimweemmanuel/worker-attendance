'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';

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
  updatedAt: string;
}

export default function SheetDetails() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchSheet();
    }
  }, [id]);

  const fetchSheet = async () => {
    try {
      const response = await fetch(`/api/sheets/${id}`);
      if (!response.ok) throw new Error('Failed to fetch sheet');
      const data = await response.json();
      setSheet(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load sheet details';
      console.error('Error fetching sheet:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'final' 
      ? 'bg-green-100 text-green-800'
      : status === 'paid'
      ? 'bg-blue-100 text-blue-800'
      : status === 'pending'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-gray-100 text-gray-800';
  };

  const calculateTotalWages = (workers: Worker[]) => {
    return workers.reduce((total, worker) => total + worker.wages, 0);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !sheet) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'Sheet not found'}</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Link
            href="/sheets"
            className="text-sm text-indigo-600 hover:text-indigo-900"
          >
            ← Back to Sheets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sheet Details
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Created on {format(new Date(sheet.createdAt), 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/sheets"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to List
          </Link>
          <Link
            href={`/sheets/${sheet._id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Edit Sheet
          </Link>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {sheet.location.charAt(0).toUpperCase() + sheet.location.slice(1)}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {format(new Date(sheet.date), 'MMMM d, yyyy')}
              </p>
            </div>
            <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(sheet.status)}`}>
              {sheet.status.charAt(0).toUpperCase() + sheet.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Total Workers</dt>
              <dd className="mt-1 text-sm text-gray-900">{sheet.workers.length}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Total Wages</dt>
              <dd className="mt-1 text-sm text-gray-900">{calculateTotalWages(sheet.workers).toLocaleString()} Frw</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Workers Details</dt>
              <dd className="mt-1">
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul role="list" className="divide-y divide-gray-200">
                    {sheet.workers.map((worker, index) => (
                      <li key={index} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 font-medium">
                                  {worker.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                              <div className="text-sm text-gray-500">{worker.wages.toLocaleString()} Frw</div>
                            </div>
                          </div>
                          <div>
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(worker.status)}`}>
                              {worker.status.charAt(0).toUpperCase() + worker.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </dd>
            </div>
          </dl>
        </div>
        <div className="bg-gray-50 px-4 py-4 sm:px-6">
          <div className="text-sm text-gray-500">
            Last updated: {format(new Date(sheet.updatedAt), 'MMMM d, yyyy HH:mm')}
          </div>
        </div>
      </div>
    </div>
  );
}
