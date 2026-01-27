import React, { useMemo } from "react";
import { Check, X, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

interface Requirement {
  label: string;
  met: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showRequirements = true,
}) => {
  const requirements: Requirement[] = useMemo(() => [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { label: "One number (0-9)", met: /[0-9]/.test(password) },
    { label: "One special character (!@#$%^&*)", met: /[^A-Za-z0-9]/.test(password) },
  ], [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter(r => r.met).length;
    const hasExtraLength = password.length >= 12;
    const hasMultipleSpecial = (password.match(/[^A-Za-z0-9]/g) || []).length >= 2;
    
    let score = metCount;
    if (hasExtraLength) score += 1;
    if (hasMultipleSpecial) score += 1;

    if (score <= 2) return { label: "Weak", color: "bg-destructive", percentage: 20 };
    if (score <= 4) return { label: "Fair", color: "bg-orange-500", percentage: 40 };
    if (score <= 5) return { label: "Good", color: "bg-yellow-500", percentage: 60 };
    if (score <= 6) return { label: "Strong", color: "bg-lime-500", percentage: 80 };
    return { label: "Very Strong", color: "bg-green-500", percentage: 100 };
  }, [password, requirements]);

  if (!password) return null;

  return (
    <div className="space-y-3">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Password strength</span>
          <span className={`text-xs font-medium ${
            strength.label === "Weak" ? "text-destructive" :
            strength.label === "Fair" ? "text-orange-500" :
            strength.label === "Good" ? "text-yellow-500" :
            "text-green-500"
          }`}>
            {strength.label}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${strength.color} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${strength.percentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <div className="grid grid-cols-1 gap-1">
          {requirements.map((req, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-2"
            >
              {req.met ? (
                <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
              ) : (
                <X className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              )}
              <span className={`text-xs ${req.met ? "text-foreground" : "text-muted-foreground"}`}>
                {req.label}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Security tips for weak passwords */}
      {strength.percentage <= 40 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20"
        >
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-xs text-destructive">
            Weak passwords are easy to guess. Try using a mix of letters, numbers, and symbols.
          </p>
        </motion.div>
      )}
    </div>
  );
};
