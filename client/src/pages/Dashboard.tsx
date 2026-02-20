import { useAuth } from '@/hooks/use-auth';
import { useBookings, useDashboardStats, useUpdateBookingStatus } from '@/hooks/use-bookings';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, 
  DollarSign, Users, TrendingUp, Activity 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user, role, isCustomer, isProvider, isAdmin } = useAuth();
  
  // Fetch bookings based on role
  const { data: bookings, isLoading } = useBookings({ 
    role, 
    userId: isAdmin ? '' : user.id 
  });
  
  // Fetch stats (only admin uses this endpoint in this demo, but provider could too)
  const { data: stats } = useDashboardStats();
  
  const { mutate: updateStatus } = useUpdateBookingStatus();

  // Mock data for charts if API not ready
  const chartData = [
    { name: 'Mon', revenue: 400, bookings: 4 },
    { name: 'Tue', revenue: 300, bookings: 3 },
    { name: 'Wed', revenue: 600, bookings: 6 },
    { name: 'Thu', revenue: 800, bookings: 8 },
    { name: 'Fri', revenue: 500, bookings: 5 },
    { name: 'Sat', revenue: 900, bookings: 9 },
    { name: 'Sun', revenue: 700, bookings: 7 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">
              {isAdmin ? 'Admin Dashboard' : isProvider ? 'Provider Portal' : 'My Bookings'}
            </h1>
            <p className="text-slate-500 mt-1">
              Welcome back, {user.name}
            </p>
          </div>
          {isCustomer && (
            <Button className="bg-primary shadow-lg shadow-primary/25">New Booking</Button>
          )}
        </div>

        {/* Stats Grid - Visible for Admin & Provider */}
        {(isAdmin || isProvider) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Revenue', value: stats ? `$${stats.revenue}` : '$12,450', icon: DollarSign, color: 'text-green-600 bg-green-100' },
              { label: 'Active Bookings', value: stats ? stats.totalBookings : '42', icon: Calendar, color: 'text-blue-600 bg-blue-100' },
              { label: 'Satisfaction', value: '4.9/5', icon: Activity, color: 'text-purple-600 bg-purple-100' },
              { label: 'Growth', value: '+12%', icon: TrendingUp, color: 'text-orange-600 bg-orange-100' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Charts Section - Admin Only */}
        {isAdmin && (
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-6">Weekly Revenue</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-6">Booking Volume</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="bookings" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* Bookings List */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">
            {isAdmin ? 'Recent Bookings' : 'Your Appointments'}
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />)}
            </div>
          ) : bookings?.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No bookings yet</h3>
              <p className="text-slate-500">When appointments are scheduled, they'll appear here.</p>
            </div>
          ) : (
            bookings?.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl border border-slate-100 hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center gap-6"
              >
                {/* Date Box */}
                <div className="flex-shrink-0 w-full md:w-24 bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                  <span className="block text-sm font-semibold text-slate-500 uppercase">
                    {format(new Date(booking.scheduledDate), 'MMM')}
                  </span>
                  <span className="block text-2xl font-bold text-slate-900">
                    {format(new Date(booking.scheduledDate), 'dd')}
                  </span>
                  <span className="block text-xs text-slate-400 mt-1">
                    {format(new Date(booking.scheduledDate), 'HH:mm')}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-slate-900">Service ID #{booking.serviceId}</h3>
                    <Badge variant="outline" className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                      {booking.address}
                    </span>
                    {booking.notes && (
                      <span className="flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1 text-slate-400" />
                        Notes provided
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions (Provider Only) */}
                {isProvider && booking.status === 'pending' && (
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button 
                      onClick={() => updateStatus({ id: booking.id, status: 'confirmed' })}
                      className="flex-1 md:flex-none bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Accept
                    </Button>
                    <Button 
                      onClick={() => updateStatus({ id: booking.id, status: 'cancelled' })}
                      variant="outline"
                      className="flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Decline
                    </Button>
                  </div>
                )}
                
                {/* Actions (Provider - Mark Complete) */}
                {isProvider && booking.status === 'confirmed' && (
                  <Button 
                    onClick={() => updateStatus({ id: booking.id, status: 'completed' })}
                    className="w-full md:w-auto bg-primary"
                  >
                    Mark Complete
                  </Button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
