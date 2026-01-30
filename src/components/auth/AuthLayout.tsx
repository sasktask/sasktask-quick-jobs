import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, CheckCircle2, Star, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
  step?: number;
  totalSteps?: number;
  title?: string;
  subtitle?: string;
  showProgress?: boolean;
  showTrustBadges?: boolean;
}

const trustStats = [
  { icon: Users, label: "50K+ Users", value: "Trust us daily" },
  { icon: Shield, label: "Verified", value: "Secure platform" },
  { icon: Star, label: "4.9 Rating", value: "App Store" },
];

const securityBadges = [
  { icon: Lock, label: "256-bit encryption" },
  { icon: Shield, label: "SOC 2 Compliant" },
  { icon: CheckCircle2, label: "Verified payments" },
];

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  step,
  totalSteps = 4,
  title,
  subtitle,
  showProgress = true,
  showTrustBadges = true,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding & Trust (Desktop only) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary" />
        
        {/* Mesh pattern overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 text-white w-full">
          {/* Logo & Title */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-12"
            >
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold">S</span>
              </div>
              <span className="text-2xl font-bold tracking-tight">SaskTask</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
                Get things done,
                <br />
                <span className="text-white/90">the smart way.</span>
              </h1>
              <p className="text-lg text-white/80 max-w-md">
                Join thousands of Canadians who trust SaskTask for their everyday tasks.
                Safe, secure, and reliable.
              </p>
            </motion.div>
          </div>

          {/* Trust indicators */}
          {showTrustBadges && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-8"
            >
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {trustStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center"
                  >
                    <stat.icon className="w-6 h-6 mx-auto mb-2 text-white/90" />
                    <p className="font-semibold text-sm">{stat.label}</p>
                    <p className="text-xs text-white/70">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Security badges */}
              <div className="flex flex-wrap gap-3">
                {securityBadges.map((badge, index) => (
                  <motion.div
                    key={badge.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
                  >
                    <badge.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{badge.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Testimonial */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-white/90 mb-4 italic">
                  "SaskTask made it so easy to find help for my move. The verification process gave me complete peace of mind."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-semibold">
                    JM
                  </div>
                  <div>
                    <p className="font-medium text-sm">Jessica M.</p>
                    <p className="text-xs text-white/70">Saskatoon, SK</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border/50">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-lg">SaskTask</span>
          </div>

          {/* Progress indicator */}
          {showProgress && step !== undefined && (
            <div className="hidden sm:flex items-center gap-2 mx-auto lg:ml-0">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <React.Fragment key={i}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      i + 1 < step
                        ? "bg-primary text-primary-foreground"
                        : i + 1 === step
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1 < step ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < totalSteps - 1 && (
                    <div
                      className={`w-8 h-0.5 transition-all duration-300 ${
                        i + 1 < step ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            Exit
          </Button>
        </div>

        {/* Mobile step indicator */}
        {showProgress && step !== undefined && (
          <div className="sm:hidden px-4 py-3 border-b border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Step {step} of {totalSteps}</span>
              <span className="text-sm text-muted-foreground">{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg"
          >
            {(title || subtitle) && (
              <div className="mb-8 text-center lg:text-left">
                {title && (
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-muted-foreground">{subtitle}</p>
                )}
              </div>
            )}
            {children}
          </motion.div>
        </div>

        {/* Footer security notice */}
        <div className="p-4 md:p-6 border-t border-border/50">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Secure connection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Your data is protected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Trusted by 50K+ users</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
