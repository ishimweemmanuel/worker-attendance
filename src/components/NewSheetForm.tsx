'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { locations } from '@/config/locations';
import { toast } from 'react-hot-toast';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

export default function NewSheetForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: locations[0].id,
      date: '',
      workers: [{ name: '', wages: 0, status: 'paid' }],
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          status: 'draft'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create sheet');
      }

      toast.success('Sheet created successfully');
      router.push('/sheets');
    } catch (error: any) {
      console.error('Error creating sheet:', error);
      toast.error(error.message || 'Failed to create sheet');
    } finally {
      setIsSubmitting(false);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="sm:max-w-4xl sm:mx-auto space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>New Attendance Sheet</CardTitle>
              <CardDescription>Create a new attendance record</CardDescription>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Sheet'}
            </Button>
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
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Add Worker</CardTitle>
                    <Button
                      type="button"
                      onClick={addWorker}
                      variant="outline"
                    >
                      Add Worker
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="workers.0.name"
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
                      name="workers.0.wages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wages</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter wages"
                              value={field.value || ''}
                              onChange={(e) => {
                                const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="workers.0.status"
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
                  </div>
                </CardContent>
              </Card>

              {form.watch('workers').length > 0 && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Worker Name</TableHead>
                        <TableHead>Wages</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.watch('workers').map((worker, index) => (
                        <TableRow key={index}>
                          <TableCell>{worker.name}</TableCell>
                          <TableCell>{worker.wages}</TableCell>
                          <TableCell className="capitalize">{worker.status}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => removeWorker(index)}
                              disabled={form.watch('workers').length <= 1}
                            >
                              <span className="sr-only">Delete</span>
                              ✕
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
