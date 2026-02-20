import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useServices } from '@/hooks/use-services';
import { useCreateBooking } from '@/hooks/use-bookings';
import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays } from 'date-fns';
import { Check, ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const STEPS = [
  { id: 1, title: 'Schedule', icon: CalendarIcon },
  { id: 2, title: 'Details', icon: FileText },
  { id: 3, title: 'Confirm', icon: Check },
];

export default function BookingFlow() {
  const [match, params] = useRoute('/book/:serviceId');
  const [, setLocation] = useLocation();
  const serviceId = parseInt(params?.serviceId || '0');
  
  const { data: services } = useServices();
  const service = services?.find(s => s.id === serviceId);
  
  const { user } = useAuth();
  const { mutate: createBooking, isPending } = useCreateBooking();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  if (!service) return null;

  const handleNext = () => {
    if (step === 1 && (!date || !time)) {
      toast({ title: "Please select date and time", variant: "destructive" });
      return;
    }
    if (step === 2 && !address) {
      toast({ title: "Please enter your address", variant: "destructive" });
      return;
    }
    if (step === 3) {
      handleSubmit();
      return;
    }
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = () => {
    if (!date || !time) return;
    
    // Combine date and time
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledDate = new Date(date);
    scheduledDate.setHours(hours, minutes);

    createBooking({
      serviceId,
      customerId: parseInt(user.id),
      scheduledDate: scheduledDate.toISOString(),
      address,
      notes,
      status: 'pending'
    }, {
      onSuccess: () => setLocation('/dashboard')
    });
  };

  const timeSlots = [
    "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10" />
            <div 
              className="absolute top-1/2 left-0 h-1 bg-primary transition-all duration-500 -z-10" 
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
            
            {STEPS.map((s) => (
              <div key={s.id} className="flex flex-col items-center bg-slate-50 px-2">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    step >= s.id 
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/30" 
                      : "bg-white border-slate-300 text-slate-400"
                  )}
                >
                  <s.icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-xs font-semibold mt-2 uppercase tracking-wider",
                  step >= s.id ? "text-primary" : "text-slate-400"
                )}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 min-h-[500px] flex flex-col">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1"
                  >
                    <h2 className="text-2xl font-bold mb-6">Choose Date & Time</h2>
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="flex-1">
                        <Label className="mb-4 block">Select Date</Label>
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                          className="rounded-md border shadow-sm p-3 w-full"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="mb-4 block">Available Slots</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {timeSlots.map((slot) => (
                            <button
                              key={slot}
                              onClick={() => setTime(slot)}
                              className={cn(
                                "py-3 px-4 rounded-lg border text-sm font-medium transition-all hover:border-primary",
                                time === slot 
                                  ? "bg-primary text-white border-primary ring-2 ring-primary/20" 
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                              )}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 space-y-6"
                  >
                    <h2 className="text-2xl font-bold mb-6">Service Location & Notes</h2>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Service Address</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                          <Input 
                            placeholder="123 Wellness Ave, Suite 100" 
                            className="pl-10 h-12"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Special Instructions (Optional)</Label>
                        <Textarea 
                          placeholder="Gate code, parking info, or specific symptoms..."
                          className="min-h-[150px] resize-none"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1"
                  >
                    <h2 className="text-2xl font-bold mb-6">Review & Confirm</h2>
                    
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-4">
                      <div className="flex justify-between border-b border-slate-200 pb-4">
                        <span className="text-slate-500">Service</span>
                        <span className="font-bold text-slate-900">{service.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-4">
                        <span className="text-slate-500">Date & Time</span>
                        <span className="font-bold text-slate-900">
                          {date && format(date, "MMM dd, yyyy")} at {time}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-4">
                        <span className="text-slate-500">Duration</span>
                        <span className="font-bold text-slate-900">{service.durationMinutes} minutes</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-4">
                        <span className="text-slate-500">Location</span>
                        <span className="font-bold text-slate-900 text-right max-w-[200px]">{address}</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-lg font-bold text-slate-900">Total</span>
                        <span className="text-2xl font-bold text-primary">${(service.price / 100).toFixed(0)}</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-500 mt-6 text-center">
                      By confirming, you agree to our Terms of Service and Cancellation Policy.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between pt-8 mt-auto border-t border-slate-100">
                <Button 
                  variant="ghost" 
                  onClick={handleBack}
                  disabled={step === 1}
                  className={cn("text-slate-500", step === 1 && "invisible")}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={isPending}
                  className="bg-primary hover:bg-primary/90 px-8"
                >
                  {step === 3 ? (isPending ? "Booking..." : "Confirm Booking") : "Next Step"} 
                  {step !== 3 && <ChevronRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sticky top-24">
              <div className="aspect-video rounded-xl overflow-hidden mb-6">
                <img 
                  src={service.imageUrl || ""} 
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{service.name}</h3>
              <p className="text-slate-600 text-sm mb-6">{service.description}</p>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-slate-600">
                  <Check className="w-4 h-4 mr-2 text-green-500" /> Free cancellation (24h)
                </div>
                <div className="flex items-center text-slate-600">
                  <Check className="w-4 h-4 mr-2 text-green-500" /> Instant confirmation
                </div>
                <div className="flex items-center text-slate-600">
                  <Check className="w-4 h-4 mr-2 text-green-500" /> Expert providers
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
