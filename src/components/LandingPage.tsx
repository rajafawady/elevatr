'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { 
  Target, 
  Calendar, 
  BarChart3, 
  Trophy, 
  LogIn, 
  User, 
  ArrowRight,
  CheckCircle,
  Zap,
  Users,
  Globe,
  Shield
} from 'lucide-react';

export function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: Target,
      title: 'Sprint Planning',
      description: 'Set clear goals and track your progress in structured 15-day or 30-day career sprints',
    },
    {
      icon: Calendar,
      title: 'Daily Tracking',
      description: 'Monitor tasks, update journal entries, and maintain consistent momentum',
    },
    {
      icon: BarChart3,
      title: 'Progress Analytics',
      description: 'Visualize your growth with detailed progress reports and actionable insights',
    },
    {
      icon: Trophy,
      title: 'Achievement System',
      description: 'Celebrate milestones and build momentum with our comprehensive achievement tracking',
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Accelerated Growth',
      description: 'Structured approach to career development with measurable results'
    },
    {
      icon: Users,
      title: 'Expert-Designed',
      description: 'Built by career development professionals for maximum effectiveness'
    },
    {
      icon: Globe,
      title: 'Access Anywhere',
      description: 'Cloud sync keeps your progress accessible from any device'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data is secure with local storage options and encrypted cloud backup'
    }
  ];

  const handleGetStarted = () => {
    router.push('/login');
  };

  const handleLearnMore = () => {
    // Scroll to features section
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen elevatr-container relative overflow-hidden w-full">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-accent/10 to-primary/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="elevatr-content-area py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20 elevatr-animate-fade-in">

            <h1 className="text-7xl font-bold elevatr-gradient-text">
              Elevatr
            </h1>

          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Accelerate Your Career Growth
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-12">
            Transform your career with structured sprints, daily tracking, and actionable insights. 
            Take control of your professional development with our proven methodology.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 justify-center items-center mb-16">
            <ElevatrButton
              onClick={handleGetStarted}
              variant="motivation"
              size="lg"
              className="text-lg px-8 py-4 group"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </ElevatrButton>
            
            
            <ElevatrButton
              onClick={() => router.push('/login')}
              variant="secondary"
              size="lg"
              className="text-lg px-8 py-4 group"
            >
              <User className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
              Try Local Mode
            </ElevatrButton>
          </div>

        </div>

        {/* Features Section */}
        <section id="features" className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold elevatr-gradient-text mb-6">
              Why Choose Elevatr?
            </h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive platform provides everything you need to structure, 
              track, and accelerate your career development journey.
            </p>
          </div>          <div className="elevatr-grid gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="elevatr-animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <ElevatrCard 
                  variant="glass" 
                  hover
                  className="elevatr-card-content text-center group h-full"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-8 w-8 text-primary group-hover:text-accent transition-colors duration-300" />
                  </div>
                  <h4 className="text-xl font-semibold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </ElevatrCard>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-foreground mb-6">
              Built for Your Success
            </h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every feature is designed with your career growth in mind, 
              backed by proven methodologies and user feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">
                  {benefit.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-12 mb-20">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Ready to Elevate Your Career?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who are already using Elevatr to 
            accelerate their career growth and achieve their goals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ElevatrButton
              onClick={handleGetStarted}
              variant="motivation"
              size="lg"
              className="text-lg px-8 py-4 group"
            >
              Start Your Journey
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </ElevatrButton>

          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            No signup required • Works offline • Cloud sync available
          </p>
        </section>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground text-sm">
            &copy; 2024 Elevatr. Elevate your career, one sprint at a time.
          </p>
        </div>
      </div>
    </div>
  );
}
