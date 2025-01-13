import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, ListPlus, BarChart3, Users } from 'lucide-react';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-4 md:p-6">      
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">Welcome to Worker Attendance System</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Link href="/sheets/new" className="block">
          <Card className="h-full hover:border-blue-500 transition-all hover:shadow-md group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 md:p-6">
              <CardTitle className="text-base md:text-lg font-medium">New Sheet</CardTitle>
              <ListPlus className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-2">
              <CardDescription className="text-sm text-gray-600">
                Create a new attendance sheet for workers
              </CardDescription>
              <div className="mt-2 md:mt-4 text-xs md:text-sm text-gray-500">
                Quick and easy way to record worker attendance and wages
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/sheets" className="block">
          <Card className="h-full hover:border-blue-500 transition-all hover:shadow-md group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 md:p-6">
              <CardTitle className="text-base md:text-lg font-medium">View Sheets</CardTitle>
              <ClipboardList className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-2">
              <CardDescription className="text-sm text-gray-600">
                Manage all attendance sheets
              </CardDescription>
              <div className="mt-2 md:mt-4 text-xs md:text-sm text-gray-500">
                View, edit, and track all your attendance records
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/attendance" className="block">
          <Card className="h-full hover:border-blue-500 transition-all hover:shadow-md group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 md:p-6">
              <CardTitle className="text-base md:text-lg font-medium">Analytics</CardTitle>
              <BarChart3 className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-2">
              <CardDescription className="text-sm text-gray-600">
                View attendance analytics
              </CardDescription>
              <div className="mt-2 md:mt-4 text-xs md:text-sm text-gray-500">
                Track attendance patterns and wage statistics
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/workers" className="block">
          <Card className="h-full hover:border-blue-500 transition-all hover:shadow-md group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 md:p-6">
              <CardTitle className="text-base md:text-lg font-medium">Workers</CardTitle>
              <Users className="h-5 w-5 text-orange-600 group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 md:pt-2">
              <CardDescription className="text-sm text-gray-600">
                Manage worker profiles
              </CardDescription>
              <div className="mt-2 md:mt-4 text-xs md:text-sm text-gray-500">
                View and manage worker details and history
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-8 p-4 md:p-6 bg-blue-50 rounded-lg">
        <h2 className="text-lg md:text-xl font-semibold text-blue-900 mb-2">Quick Tips</h2>
        <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-blue-800">
          <li>Create a new attendance sheet for today's work</li>
          <li>View and manage existing sheets in the View Sheets section</li>
          <li>Check analytics for insights on attendance and wages</li>
          <li>Manage your worker profiles in the Workers section</li>
        </ul>
      </div>
    </main>
  );
}
