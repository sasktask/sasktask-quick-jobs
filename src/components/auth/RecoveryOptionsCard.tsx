import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound, Mail, Phone, HelpCircle, ChevronRight, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface RecoveryOption {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  action: () => void;
}

interface RecoveryOptionsCardProps {
  onForgotPassword: () => void;
  onForgotEmail: () => void;
  onContactSupport: () => void;
}

export const RecoveryOptionsCard: React.FC<RecoveryOptionsCardProps> = ({
  onForgotPassword,
  onForgotEmail,
  onContactSupport,
}) => {
  const options: RecoveryOption[] = [
    {
      id: "password",
      icon: <KeyRound className="h-5 w-5 text-primary" />,
      title: "Forgot Password",
      description: "Reset your password via email",
      action: onForgotPassword,
    },
    {
      id: "email",
      icon: <Mail className="h-5 w-5 text-primary" />,
      title: "Forgot Email",
      description: "Find your account using phone number",
      action: onForgotEmail,
    },
    {
      id: "support",
      icon: <HelpCircle className="h-5 w-5 text-primary" />,
      title: "Need Help?",
      description: "Contact our support team",
      action: onContactSupport,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Shield className="h-4 w-4" />
        <span>Account Recovery Options</span>
      </div>
      
      {options.map((option, index) => (
        <motion.div
          key={option.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card 
            className="cursor-pointer hover:border-primary/50 transition-all duration-200 hover:shadow-md group"
            onClick={option.action}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    {option.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-foreground">{option.title}</h4>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
