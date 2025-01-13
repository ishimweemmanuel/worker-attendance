'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { locations } from '@/config/locations';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  location: z.string().min(1, "Location is required"),
  date: z.string().min(1, "Date is required"),
  workers: z.array(z.object({
    name: z.string().min(1, "Worker name is required"),
    wages: z.number().min(0, "Wages must be a positive number"),
    status: z.string()
  })).min(1, "At least one worker is required"),
});

type FormValues = z.infer<typeof formSchema>;

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
}

export default function EditSheet({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const id = params.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: '',
      date: '',
      workers: [{ name: '', wages: 0, status: 'paid' }],
    },
  });

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
      
      // Reset form with fetched data
      form.reset({
        location: data.location,
        date: data.date.split('T')[0],
        workers: data.workers,
      });
    } catch (err) {
      console.error('Error fetching sheet:', err);
      toast.error('Failed to load sheet');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/sheets?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          _id: id,
          status: 'draft'
        }),
      });

      if (!response.ok) throw new Error('Failed to update sheet');
      
      toast.success('Sheet updated successfully');
      router.push('/sheets');
    } catch (err) {
      console.error('Error updating sheet:', err);
      toast.error('Failed to update sheet');
    } finally {
      setIsSaving(false);
    }
  };

  const addWorker = () => {
    const currentWorkers = form.getValues('workers');
    form.setValue('workers', [
      { name: '', wages: 0, status: 'paid' },
      ...currentWorkers,
    ]);
  };

  const removeWorker = (index: number) => {
    const currentWorkers = form.getValues('workers');
    if (currentWorkers.length <= 1) return;
    form.setValue(
      'workers',
      currentWorkers.filter((_, i) => i !== index)
    );
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle><Skeleton className="h-8 w-[200px]" /></CardTitle>
            <CardDescription><Skeleton className="h-4 w-[300px]" /></CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-9 w-[120px]" />
                </div>
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="flex-1 space-y-2 mx-4">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Skeleton className="h-10 w-[100px]" />
              <Skeleton className="h-10 w-[100px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="sm:max-w-4xl sm:mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Attendance Sheet</CardTitle>
            <CardDescription>Update the attendance details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Workers</h3>
                <Button
                  type="button"
                  onClick={addWorker}
                  variant="outline"
                >
                  Add Worker
                </Button>
              </div>

              {form.watch('workers').map((_, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`workers.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Worker Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter worker name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`workers.${index}.wages`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Wages</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter wages"
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`workers.${index}.status`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch('workers').length > 1 && (
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeWorker(index)}
                          >
                            Remove Worker
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
