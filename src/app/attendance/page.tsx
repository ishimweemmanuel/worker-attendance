'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Dynamically import ApexCharts with no SSR to avoid hydration issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

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

interface LocationStats {
  location: string;
  totalWorkers: number;
  totalWages: number;
  averageWages: number;
  percentageOfTotalWages: number;
}

const COLORS = ['#4096ff', '#36cfc9', '#73d13d', '#ff7a45', '#9254de'];

export default function AttendancePage() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [locationStats, setLocationStats] = useState<LocationStats[]>([]);
  const [totalWages, setTotalWages] = useState(0);

  useEffect(() => {
    fetchSheets();
  }, []);

  useEffect(() => {
    if (sheets.length > 0) {
      calculateStats();
    }
  }, [sheets, timeRange]);

  const fetchSheets = async () => {
    try {
      const response = await fetch('/api/sheets');
      if (!response.ok) throw new Error('Failed to fetch sheets');
      const data = await response.json();
      setSheets(data);
    } catch (err) {
      setError('Failed to load attendance data');
      console.error('Error fetching sheets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
    const stats = new Map<string, LocationStats>();
    let totalWagesSum = 0;

    // Filter sheets based on time range
    const filteredSheets = sheets.filter(sheet => {
      const sheetDate = new Date(sheet.date);
      const now = new Date();
      switch (timeRange) {
        case 'week':
          return sheetDate >= new Date(now.setDate(now.getDate() - 7));
        case 'month':
          return sheetDate >= new Date(now.setMonth(now.getMonth() - 1));
        case 'year':
          return sheetDate >= new Date(now.setFullYear(now.getFullYear() - 1));
        default:
          return true;
      }
    });

    // Calculate stats for each location
    filteredSheets.forEach(sheet => {
      const location = sheet.location;
      const workerCount = sheet.workers.length;
      const wagesSum = sheet.workers.reduce((sum, worker) => sum + worker.wages, 0);
      totalWagesSum += wagesSum;

      if (!stats.has(location)) {
        stats.set(location, {
          location,
          totalWorkers: 0,
          totalWages: 0,
          averageWages: 0,
          percentageOfTotalWages: 0
        });
      }

      const currentStats = stats.get(location)!;
      stats.set(location, {
        ...currentStats,
        totalWorkers: currentStats.totalWorkers + workerCount,
        totalWages: currentStats.totalWages + wagesSum
      });
    });

    // Calculate percentages and averages
    const finalStats = Array.from(stats.values()).map(stat => ({
      ...stat,
      averageWages: stat.totalWages / stat.totalWorkers || 0,
      percentageOfTotalWages: (stat.totalWages / totalWagesSum) * 100 || 0
    }));

    setLocationStats(finalStats);
    setTotalWages(totalWagesSum);
  };

  // ApexCharts options for bar chart
  const barChartOptions = {
    chart: {
      type: 'bar' as const,
      background: 'transparent',
      toolbar: {
        show: false
      },
      height: '100%'
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (value: number) {
        return new Intl.NumberFormat('en-RW', { 
          style: 'currency', 
          currency: 'RWF',
          maximumFractionDigits: 0
        }).format(value);
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: locationStats.map(stat => stat.location),
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      },
      labels: {
        rotate: -45,
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Wages (Frw)',
        style: {
          fontSize: '12px'
        }
      },
      labels: {
        formatter: function (value: number) {
          return new Intl.NumberFormat('en-RW', { 
            style: 'currency', 
            currency: 'RWF',
            maximumFractionDigits: 0
          }).format(value);
        },
        style: {
          fontSize: '12px'
        }
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (value: number) {
          return new Intl.NumberFormat('en-RW', { 
            style: 'currency', 
            currency: 'RWF',
            maximumFractionDigits: 0
          }).format(value);
        }
      }
    },
    colors: ['#4096ff'],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 250
        },
        legend: {
          show: false
        },
        dataLabels: {
          style: {
            fontSize: '10px'
          }
        }
      }
    }]
  };

  // ApexCharts options for pie chart
  const pieChartOptions = {
    chart: {
      type: 'donut' as const,
      background: 'transparent',
      height: '100%'
    },
    labels: locationStats.map(stat => stat.location),
    colors: COLORS,
    legend: {
      position: 'bottom' as const,
      fontSize: '12px',
      formatter: function(label: string, opts: { w: any; seriesIndex: number }) {
        const stat = locationStats[opts.seriesIndex];
        return `${label} (${new Intl.NumberFormat('en-RW', { 
          style: 'currency', 
          currency: 'RWF',
          maximumFractionDigits: 0
        }).format(stat.totalWages)})`;
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Wages',
              fontSize: '14px',
              formatter: function () {
                return new Intl.NumberFormat('en-RW', { 
                  style: 'currency', 
                  currency: 'RWF',
                  maximumFractionDigits: 0
                }).format(totalWages);
              }
            }
          }
        }
      }
    },
    tooltip: {
      y: {
        formatter: function (value: number) {
          return new Intl.NumberFormat('en-RW', { 
            style: 'currency', 
            currency: 'RWF',
            maximumFractionDigits: 0
          }).format(value);
        }
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 250
        },
        legend: {
          position: 'bottom',
          fontSize: '10px'
        }
      }
    }]
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-4 md:p-6 space-y-4 md:space-y-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-4 md:p-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <h1 className="text-xl md:text-2xl font-bold">Attendance Analytics</h1>
        <Select
          value={timeRange}
          onValueChange={setTimeRange}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card className="col-span-1">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-sm md:text-base">Total Workers</CardTitle>
            <CardDescription className="text-xs md:text-sm">Across all locations</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            <div className="text-lg md:text-2xl font-bold">
              {locationStats.reduce((sum, stat) => sum + stat.totalWorkers, 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-sm md:text-base">Total Wages</CardTitle>
            <CardDescription className="text-xs md:text-sm">All payments</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            <div className="text-lg md:text-2xl font-bold">
              {new Intl.NumberFormat('en-RW', { 
                style: 'currency', 
                currency: 'RWF',
                maximumFractionDigits: 0
              }).format(totalWages)}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-sm md:text-base">Average Wage</CardTitle>
            <CardDescription className="text-xs md:text-sm">Per worker</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            <div className="text-lg md:text-2xl font-bold">
              {new Intl.NumberFormat('en-RW', { 
                style: 'currency', 
                currency: 'RWF',
                maximumFractionDigits: 0
              }).format(totalWages / locationStats.reduce((sum, stat) => sum + stat.totalWorkers, 0) || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-sm md:text-base">Locations</CardTitle>
            <CardDescription className="text-xs md:text-sm">Active sites</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
            <div className="text-lg md:text-2xl font-bold">
              {locationStats.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-sm md:text-base">Wages by Location</CardTitle>
            <CardDescription className="text-xs md:text-sm">Total wages distribution</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="h-[250px] md:h-[300px] w-full">
              {typeof window !== 'undefined' && (
                <Chart
                  options={barChartOptions}
                  series={[{
                    name: 'Total Wages',
                    data: locationStats.map(stat => stat.totalWages)
                  }]}
                  type="bar"
                  height="100%"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-sm md:text-base">Wage Distribution</CardTitle>
            <CardDescription className="text-xs md:text-sm">Percentage of total wages by location</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="h-[250px] md:h-[300px] w-full">
              {typeof window !== 'undefined' && (
                <Chart
                  options={pieChartOptions}
                  series={locationStats.map(stat => stat.totalWages)}
                  type="donut"
                  height="100%"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-sm md:text-base">Location Details</CardTitle>
          <CardDescription className="text-xs md:text-sm">Detailed statistics for each location</CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 md:p-6 text-xs md:text-sm">Location</th>
                  <th className="text-left p-4 md:p-6 text-xs md:text-sm">Total Workers</th>
                  <th className="text-left p-4 md:p-6 text-xs md:text-sm">Total Wages</th>
                  <th className="text-left p-4 md:p-6 text-xs md:text-sm">Average Wage</th>
                  <th className="text-left p-4 md:p-6 text-xs md:text-sm">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {locationStats.map((stat) => (
                  <tr key={stat.location} className="border-b">
                    <td className="p-4 md:p-6 text-xs md:text-sm">{stat.location}</td>
                    <td className="p-4 md:p-6 text-xs md:text-sm">{stat.totalWorkers}</td>
                    <td className="p-4 md:p-6 text-xs md:text-sm">{new Intl.NumberFormat('en-RW', { 
                      style: 'currency', 
                      currency: 'RWF',
                      maximumFractionDigits: 0
                    }).format(stat.totalWages)}</td>
                    <td className="p-4 md:p-6 text-xs md:text-sm">{new Intl.NumberFormat('en-RW', { 
                      style: 'currency', 
                      currency: 'RWF',
                      maximumFractionDigits: 0
                    }).format(stat.averageWages)}</td>
                    <td className="p-4 md:p-6 text-xs md:text-sm">{stat.percentageOfTotalWages.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
