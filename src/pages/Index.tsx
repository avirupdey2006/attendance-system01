import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { Shield, UserPlus, Camera, ChartBar, CheckCircle, Lock, Zap } from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: Camera,
      title: 'Real-time Recognition',
      description: 'Advanced facial recognition that identifies students in milliseconds.',
    },
    {
      icon: Lock,
      title: 'Liveness Detection',
      description: 'Tamper-proof verification ensures only real faces are recognized.',
    },
    {
      icon: Zap,
      title: 'Instant Recording',
      description: 'Attendance is marked and timestamped the moment a face is verified.',
    },
    {
      icon: ChartBar,
      title: 'Detailed Analytics',
      description: 'Comprehensive dashboard with daily, weekly, and monthly reports.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-24 md:py-32">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary-foreground/5 blur-3xl" />
        </div>

        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground/80">
              <Shield className="h-4 w-4" />
              <span>Secure & Tamper-Proof System</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl lg:text-6xl animate-slide-up">
              Smart Attendance
              <span className="block mt-2 text-accent">Through Facial Recognition</span>
            </h1>
            
            <p className="mb-10 text-lg text-primary-foreground/70 md:text-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
              A modern, secure, and efficient way to track student attendance. 
              No more manual roll calls — just look at the camera.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button asChild size="xl" variant="accent">
                <Link to="/register">
                  <UserPlus className="h-5 w-5" />
                  Register Student
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/attendance">
                  <Camera className="h-5 w-5" />
                  Mark Attendance
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4 md:text-4xl">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Our system combines cutting-edge technology with ease of use to deliver
              reliable attendance tracking.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-xl bg-card p-6 shadow-card transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4 md:text-4xl">
              Get Started in 3 Steps
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Register',
                description: 'Students register with their ID and capture their face using the camera.',
              },
              {
                step: '02',
                title: 'Verify',
                description: 'The system verifies liveness and stores the facial data securely.',
              },
              {
                step: '03',
                title: 'Attend',
                description: 'Students simply look at the master camera to mark their attendance.',
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className="relative text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground text-2xl font-bold shadow-elegant">
                  {item.step}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 right-0 translate-x-1/2 w-full max-w-[100px] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl bg-gradient-primary p-8 md:p-12 text-center shadow-elegant">
            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-primary-foreground/10 blur-3xl" />
            
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground/80">
                <CheckCircle className="h-4 w-4" />
                <span>Ready to get started?</span>
              </div>
              
              <h2 className="mb-4 text-2xl font-bold text-primary-foreground md:text-3xl">
                Start Tracking Attendance Today
              </h2>
              <p className="mb-8 text-primary-foreground/70">
                Register students and begin marking attendance with just a glance.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" variant="accent">
                  <Link to="/register">Register First Student</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Link to="/admin">View Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">FaceAttend</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} FaceAttend. Secure attendance tracking system.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
