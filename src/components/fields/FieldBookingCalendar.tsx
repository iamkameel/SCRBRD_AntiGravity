"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Clock, User, Calendar as CalendarIcon, AlertTriangle, CheckCircle2, Repeat } from "lucide-react";
import { createBookingAction, getFieldBookingsAction, BookingData } from "@/app/actions/fieldBookingActions";
import { toast } from "sonner";

interface Booking {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  title: string;
  organizer: string;
  type: 'Match' | 'Practice' | 'Maintenance' | 'Event';
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  recurring?: {
    frequency: 'weekly' | 'biweekly' | 'monthly';
    endDate: Date;
  };
}

interface FieldBookingCalendarProps {
  fieldId: string;
}

export function FieldBookingCalendar({ fieldId }: FieldBookingCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch bookings when date changes
  useEffect(() => {
    const fetchBookings = async () => {
      if (!date) return;
      setIsLoading(true);
      
      // Fetch bookings for the selected month to show indicators (optimization: could fetch whole month)
      // For now, just fetching for the selected day + surrounding days could be better, 
      // but let's stick to simple day fetching or maybe a range if the API supports it.
      // The current API supports start/end date. Let's fetch the whole month of the selected date.
      
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const result = await getFieldBookingsAction(fieldId, startOfMonth, endOfMonth);
      
      if (result.success && result.bookings) {
        const mappedBookings: Booking[] = result.bookings.map((b: any) => ({
          id: b.id,
          date: new Date(b.date), // Ensure date object
          startTime: b.startTime,
          endTime: b.endTime,
          title: b.title,
          organizer: b.organizer,
          type: b.type,
          status: b.status || 'Confirmed',
          recurring: b.recurring ? {
            frequency: b.recurring.frequency,
            endDate: new Date(b.recurring.endDate)
          } : undefined
        }));
        setBookings(mappedBookings);
      }
      setIsLoading(false);
    };

    fetchBookings();
  }, [fieldId, date]); // Re-fetch when date (month focus) changes would be ideal, but date changes on selection. 
  // Optimization: Only re-fetch if month changes. For now, simple re-fetch is safe.

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    type: 'Practice' as Booking['type'],
    organizer: '',
    isRecurring: false,
    recurringFrequency: 'weekly' as 'weekly' | 'biweekly' | 'monthly',
    recurringEndDate: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter bookings for selected date
  const selectedDateBookings = bookings.filter(b => 
    date && b.date.toDateString() === date.toDateString()
  );

  // Check for time conflicts
  const checkConflict = (startTime: string, endTime: string, bookingDate: Date): boolean => {
    const bookingsOnDate = bookings.filter(b => 
      b.date.toDateString() === bookingDate.toDateString() &&
      b.status !== 'Cancelled'
    );

    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    return bookingsOnDate.some(booking => {
      const bookingStart = timeToMinutes(booking.startTime);
      const bookingEnd = timeToMinutes(booking.endTime);
      
      // Check if times overlap
      return (start < bookingEnd && end > bookingStart);
    });
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.organizer.trim()) return 'Organizer is required';
    if (!formData.startTime) return 'Start time is required';
    if (!formData.endTime) return 'End time is required';
    
    const start = timeToMinutes(formData.startTime);
    const end = timeToMinutes(formData.endTime);
    
    if (start >= end) return 'End time must be after start time';
    if ((end - start) < 30) return 'Booking must be at least 30 minutes';
    if ((end - start) > 720) return 'Booking cannot exceed 12 hours';
    
    if (date && checkConflict(formData.startTime, formData.endTime, date)) {
      return 'This time slot conflicts with an existing booking';
    }

    if (formData.isRecurring && !formData.recurringEndDate) {
      return 'End date is required for recurring bookings';
    }

    return null;
  };

  const generateRecurringBookings = (baseBooking: Omit<Booking, 'id'>, frequency: 'weekly' | 'biweekly' | 'monthly', endDate: Date): Booking[] => {
    const bookings: Booking[] = [];
    let currentDate = new Date(baseBooking.date);
    const end = new Date(endDate);
    
    // Start from next occurrence since base booking is already created
    if (frequency === 'weekly') currentDate.setDate(currentDate.getDate() + 7);
    else if (frequency === 'biweekly') currentDate.setDate(currentDate.getDate() + 14);
    else if (frequency === 'monthly') currentDate.setMonth(currentDate.getMonth() + 1);

    while (currentDate <= end) {
      bookings.push({
        ...baseBooking,
        id: `temp-${Date.now()}-${Math.random()}`, // Temp ID until saved
        date: new Date(currentDate)
      });
      
      // Increment based on frequency
      if (frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (frequency === 'biweekly') {
        currentDate.setDate(currentDate.getDate() + 14);
      } else if (frequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    
    return bookings;
  };

  const handleSubmit = async () => {
    setFormError(null);
    setSuccessMessage(null);

    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    if (!date) return;

    const baseBookingData: BookingData = {
      date: date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      title: formData.title,
      organizer: formData.organizer,
      type: formData.type,
      status: 'Confirmed',
      recurring: formData.isRecurring ? {
        frequency: formData.recurringFrequency,
        endDate: new Date(formData.recurringEndDate)
      } : undefined
    };

    try {
      // Create primary booking
      const result = await createBookingAction(fieldId, baseBookingData);
      
      if (!result.success) {
        setFormError(result.error || 'Failed to create booking');
        return;
      }

      const newBookingsList = [...bookings];
      
      // Add primary booking to local state
      newBookingsList.push({
        id: result.id!,
        ...baseBookingData,
        date: new Date(baseBookingData.date),
        recurring: baseBookingData.recurring ? {
            frequency: baseBookingData.recurring.frequency,
            endDate: new Date(baseBookingData.recurring.endDate)
        } : undefined
      } as Booking);

      // Handle recurring bookings
      if (formData.isRecurring && formData.recurringEndDate) {
        const recurringBookings = generateRecurringBookings(
          { 
            ...baseBookingData, 
            date: new Date(baseBookingData.date),
            recurring: {
                frequency: formData.recurringFrequency,
                endDate: new Date(formData.recurringEndDate)
            }
          } as any, // Cast to avoid strict type issues with temp objects
          formData.recurringFrequency,
          new Date(formData.recurringEndDate)
        );
        
        // Create all recurring bookings in Firestore
        // Note: In a production app, this should be a batch operation or a backend function
        let successCount = 0;
        for (const booking of recurringBookings) {
          const recurringResult = await createBookingAction(fieldId, {
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            title: booking.title,
            organizer: booking.organizer,
            type: booking.type,
            status: 'Confirmed',
            recurring: {
                frequency: formData.recurringFrequency,
                endDate: new Date(formData.recurringEndDate),
                parentBookingId: result.id // Link to parent
            }
          });
          
          if (recurringResult.success) {
            successCount++;
            newBookingsList.push({
                ...booking,
                id: recurringResult.id!
            });
          }
        }
        
        setSuccessMessage(`Booking created with ${successCount} recurring events!`);
      } else {
        setSuccessMessage('Booking created successfully!');
      }

      setBookings(newBookingsList);
      toast.success("Booking created successfully");

      // Reset form
      setFormData({
        title: '',
        startTime: '',
        endTime: '',
        type: 'Practice',
        organizer: '',
        isRecurring: false,
        recurringFrequency: 'weekly',
        recurringEndDate: ''
      });

      setTimeout(() => {
        setIsDialogOpen(false);
        setSuccessMessage(null);
      }, 1500);

    } catch (err) {
      console.error(err);
      setFormError('An unexpected error occurred');
      toast.error("Failed to create booking");
    }
  };

  const getTypeColor = (type: Booking['type']) => {
    switch (type) {
      case 'Match': return 'default';
      case 'Practice': return 'secondary';
      case 'Maintenance': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Calendar View */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            modifiers={{
                booked: (date) => bookings.some(b => b.date.toDateString() === date.toDateString())
            }}
            modifiersStyles={{
                booked: { fontWeight: 'bold', textDecoration: 'underline', color: 'var(--primary)' }
            }}
          />
        </CardContent>
      </Card>

      {/* Schedule View */}
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Schedule for {date?.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Booking</DialogTitle>
                <DialogDescription>
                  Create a booking for {date?.toLocaleDateString()}
                </DialogDescription>
              </DialogHeader>
              
              {formError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              {successMessage && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input 
                    id="title"
                    placeholder="e.g. U15 Match vs Rivals"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input 
                      id="startTime"
                      type="time" 
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input 
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Event Type</Label>
                  <Select value={formData.type} onValueChange={(value: Booking['type']) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Match">Match</SelectItem>
                      <SelectItem value="Practice">Practice</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Event">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizer">Organizer</Label>
                  <Input 
                    id="organizer"
                    placeholder="Contact person"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                  />
                </div>

                {/* Recurring Booking Options */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="recurring"
                      checked={formData.isRecurring}
                      onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: !!checked })}
                    />
                    <Label htmlFor="recurring" className="flex items-center gap-2 cursor-pointer">
                      <Repeat className="h-4 w-4" />
                      Recurring Booking
                    </Label>
                  </div>

                  {formData.isRecurring && (
                    <div className="ml-6 space-y-3 animate-in fade-in duration-200">
                      <div className="space-y-2">
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select 
                          value={formData.recurringFrequency} 
                          onValueChange={(value: 'weekly' | 'biweekly' | 'monthly') => 
                            setFormData({ ...formData, recurringFrequency: value })
                          }
                        >
                          <SelectTrigger id="frequency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly (Every 2 weeks)</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endDate">Repeat Until</Label>
                        <Input 
                          id="endDate"
                          type="date"
                          value={formData.recurringEndDate}
                          onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Button className="w-full" onClick={handleSubmit}>
                  Create Booking
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">Loading bookings...</div>
            ) : selectedDateBookings.length > 0 ? (
              selectedDateBookings.map(booking => (
                <div 
                  key={booking.id} 
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center w-16 p-2 bg-muted rounded-md text-center">
                      <Clock className="h-4 w-4 mb-1 text-muted-foreground" />
                      <span className="text-xs font-bold">{booking.startTime}</span>
                      <span className="text-[10px] text-muted-foreground">to {booking.endTime}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{booking.title}</h4>
                        {booking.recurring && (
                          <Repeat className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <User className="h-3 w-3" />
                        <span>{booking.organizer}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getTypeColor(booking.type)}>{booking.type}</Badge>
                    <Badge variant="outline" className={
                      booking.status === 'Confirmed' ? 'text-emerald-500 border-emerald-500/20' : 'text-amber-500 border-amber-500/20'
                    }>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No bookings for this date</p>
                <Button variant="link" onClick={() => setIsDialogOpen(true)}>
                  Schedule something?
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
