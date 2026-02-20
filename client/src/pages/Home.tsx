import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, CheckCircle2, Star, Shield, Clock, Award } from 'lucide-react';
import { useServices } from '@/hooks/use-services';
import { Header } from '@/components/Header';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { data: services, isLoading } = useServices();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-teal-200/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-1/3 w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-3xl -z-10" />

        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 space-y-8 max-w-2xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 text-sm font-semibold mb-6">
                  #1 Trusted Healthcare Platform
                </span>
                <h1 className="text-5xl lg:text-7xl font-display font-bold text-slate-900 leading-[1.1]">
                  Expert care, <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-teal-400">
                    right at home.
                  </span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed max-w-lg mt-6">
                  Connect with certified healthcare professionals for home visits, nursing care, and specialized treatments.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Link href="/services">
                    <button className="px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg shadow-xl shadow-primary/25 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                      Find a Specialist
                    </button>
                  </Link>
                  <button className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-semibold text-lg hover:bg-slate-50 transition-all duration-300">
                    How it Works
                  </button>
                </div>
              </motion.div>
              
              <div className="flex items-center gap-8 pt-4">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-slate-200">
                      {/* Random avatar from Unsplash */}
                      <img 
                        src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=100&h=100&fit=crop`} 
                        alt="User" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <p className="text-sm text-slate-600 font-medium">Trusted by 10,000+ patients</p>
                </div>
              </div>
            </div>

            <div className="flex-1 relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative z-10"
              >
                {/* Hero Image - Doctor Patient Interaction */}
                <img 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=1000&fit=crop" 
                  alt="Doctor with patient"
                  className="rounded-3xl shadow-2xl shadow-slate-900/10 object-cover aspect-[4/5] max-h-[600px] w-full"
                />
                
                {/* Floating Card */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-xs"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Verified Pro</p>
                      <p className="text-sm text-slate-500">Dr. Sarah Johnson</p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-4/5 h-full bg-green-500 rounded-full" />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">98% Satisfaction Rate</p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-display font-bold text-slate-900 mb-4">Our Medical Services</h2>
            <p className="text-lg text-slate-600">Comprehensive care packages designed for your comfort and recovery at home.</p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3].map(i => <Skeleton key={i} className="h-80 w-full rounded-2xl" />)}
            </div>
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {services?.map((service) => (
                <motion.div key={service.id} variants={item}>
                  <Link href={`/book/${service.id}`}>
                    <div className="group bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer h-full flex flex-col">
                      <div className="relative overflow-hidden rounded-xl mb-6 aspect-video">
                        <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-300" />
                        <img 
                          src={service.imageUrl || "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80"} 
                          alt={service.name}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="px-2 pb-2 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold tracking-wider uppercase text-primary bg-primary/10 px-2 py-1 rounded-md">
                            {service.category}
                          </span>
                          <div className="flex items-center text-slate-500 text-sm">
                            <Clock className="w-4 h-4 mr-1" />
                            {service.durationMinutes}m
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-slate-600 text-sm mb-6 line-clamp-2 flex-1">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                          <span className="text-lg font-bold text-slate-900">
                            ${(service.price / 100).toFixed(0)}
                          </span>
                          <span className="flex items-center text-sm font-semibold text-primary group-hover:translate-x-1 transition-transform">
                            Book Now <ArrowRight className="w-4 h-4 ml-1" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Shield, title: "Verified Professionals", desc: "Every provider is vetted, certified, and background checked." },
              { icon: Clock, title: "Same-Day Service", desc: "Book appointments as soon as 2 hours from now." },
              { icon: Award, title: "Quality Guarantee", desc: "If you're not satisfied, we'll make it right or refund you." },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 text-primary">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
