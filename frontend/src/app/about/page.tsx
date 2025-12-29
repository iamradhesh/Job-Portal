
import Link from "next/link";
import React from "react";
import aboutImg from "@/assets/about.jpeg";
import { 
  ArrowRight, 
  Target, 
  Users, 
  Rocket, 
  Heart,
  TrendingUp,
  Award,
  Sparkles,
  CheckCircle2,
  Globe,
  Zap
} from "lucide-react";
import Image from "next/image";
import { Button } from "../components/ui/button";

const About = () => {
  const stats = [
    { value: "50K+", label: "Active Jobs", icon: <Rocket size={20} /> },
    { value: "100K+", label: "Job Seekers", icon: <Users size={20} /> },
    { value: "5K+", label: "Companies", icon: <Globe size={20} /> },
    { value: "95%", label: "Success Rate", icon: <TrendingUp size={20} /> }
  ];

  const values = [
    {
      icon: <Target size={24} />,
      title: "Mission-Driven",
      description: "We're committed to connecting talent with opportunity, creating pathways to success for everyone."
    },
    {
      icon: <Heart size={24} />,
      title: "People-First",
      description: "Your career journey matters to us. We prioritize meaningful connections over quick transactions."
    },
    {
      icon: <Zap size={24} />,
      title: "Innovation",
      description: "Leveraging cutting-edge technology to make job searching smarter, faster, and more effective."
    },
    {
      icon: <Award size={24} />,
      title: "Excellence",
      description: "We maintain the highest standards in everything we do, ensuring quality experiences for all users."
    }
  ];

  const features = [
    "AI-powered job matching",
    "Real-time application tracking",
    "Verified company profiles",
    "Career development resources",
    "Expert interview preparation",
    "Salary insights & negotiation tips"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-violet-500/5 to-fuchsia-500/5 pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            {/* Badge */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-fuchsia-500/10 border border-blue-500/20 backdrop-blur-sm">
                <Sparkles size={16} className="text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
                  About HireHub
                </span>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Text Content */}
              <div className="space-y-6 text-center lg:text-left order-2 lg:order-1">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  Connecting Talent
                  <span className="block mt-2 bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 dark:from-blue-400 dark:via-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                    With Opportunity
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  At HireHub, we&#39;re revolutionizing the job search experience by creating meaningful connections between talented individuals and forward-thinking companies. Your success is our mission.
                </p>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
                  <Link href="/jobs">
                    <Button size="lg" className="h-12 px-8 rounded-full bg-linear-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-lg hover:shadow-xl transition-all duration-300">
                      Explore Jobs
                      <ArrowRight className="ml-2" size={18} />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="h-12 px-8 rounded-full">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Image */}
              <div className="order-1 lg:order-2">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-linear-to-r from-blue-500 to-violet-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                  <Image
                    src={aboutImg}
                    className="relative w-full rounded-2xl shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500"
                    alt="About HireHub"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 border-y bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center space-y-2 group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-blue-500/10 to-violet-500/10 mb-3 group-hover:scale-110 transition-transform duration-300">
                  {React.cloneElement(stat.icon, { className: "text-blue-600 dark:text-blue-400" })}
                </div>
                <div className="text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Empowering careers and transforming the way people find their dream jobs
              </p>
            </div>
            
            <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/20 dark:to-violet-950/20 border border-blue-200/50 dark:border-blue-800/30">
              <div className="absolute top-6 left-6 text-6xl text-blue-200 dark:text-blue-900/50 font-serif">&quot;</div>
              <p className="relative text-lg md:text-xl leading-relaxed text-foreground/90 italic pl-8">
                We believe that everyone deserves to find work they love. That&#39;s why we&#39;ve built a platform that combines cutting-edge technology with human-centered design to make job searching not just easier, but genuinely enjoyable. Our AI-powered matching, comprehensive resources, and supportive community are here to guide you every step of the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                Our Core Values
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {values.map((value, idx) => (
                <div 
                  key={idx} 
                  className="group p-6 md:p-8 rounded-2xl bg-card border hover:shadow-xl hover:border-blue-500/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      {React.cloneElement(value.icon, { className: "text-blue-600 dark:text-blue-400" })}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{value.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                Why Choose HireHub?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Advanced tools and features designed to accelerate your career journey
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-900/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-medium text-foreground/90">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-violet-600 to-fuchsia-600 dark:from-blue-900 dark:via-violet-900 dark:to-fuchsia-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
              <Rocket size={16} />
              <span className="text-sm font-semibold">Ready to Launch Your Career?</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Find Your Dream Job Today
            </h2>

            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              Join thousands of successful job seekers who found their perfect match on HireHub. Your next opportunity is just a click away.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center pt-6">
              <Link href="/jobs">
                <Button 
                  size="lg" 
                  className="h-14 px-8 text-base rounded-full bg-white text-blue-600 hover:bg-white/90 hover:scale-105 shadow-xl transition-all duration-300"
                >
                  Get Started Now
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
              <Link href="/register">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-14 px-8 text-base rounded-full border-white/30 text-blue-600 hover:bg-white/10 hover:scale-105 transition-all duration-300"
                >
                  Create Free Account
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 pt-8 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Free to join</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;