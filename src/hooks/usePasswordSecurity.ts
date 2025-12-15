import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Common passwords to check against (basic list - in production use a more comprehensive list)
const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
  'letmein', 'trustno1', 'dragon', 'baseball', 'master', 'michael', 'football',
  'shadow', 'ashley', 'fussball', '123123', '654321', 'superman', 'passw0rd',
  'welcome', 'password1', 'password123', 'admin', 'admin123', 'root', 'toor'
];

interface PasswordStrength {
  score: number;
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
  suggestions: string[];
}

export const usePasswordSecurity = () => {
  const [isCheckingPassword, setIsCheckingPassword] = useState(false);

  const checkPasswordStrength = useCallback((password: string): PasswordStrength => {
    let score = 0;
    const suggestions: string[] = [];

    // Length checks
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (password.length < 8) suggestions.push('Use at least 8 characters');

    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    else suggestions.push('Add lowercase letters');
    
    if (/[A-Z]/.test(password)) score += 1;
    else suggestions.push('Add uppercase letters');
    
    if (/[0-9]/.test(password)) score += 1;
    else suggestions.push('Add numbers');
    
    if (/[^A-Za-z0-9]/.test(password)) score += 2;
    else suggestions.push('Add special characters (!@#$%^&*)');

    // Penalize common patterns
    if (/^[a-zA-Z]+$/.test(password)) score -= 1;
    if (/^[0-9]+$/.test(password)) score -= 2;
    if (/(.)\1{2,}/.test(password)) {
      score -= 1;
      suggestions.push('Avoid repeated characters');
    }

    // Check for common passwords
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
      score = 0;
      suggestions.push('This is a commonly used password - choose something unique');
    }

    // Check for sequential patterns
    if (/123|234|345|456|567|678|789|890|abc|bcd|cde|def/.test(password.toLowerCase())) {
      score -= 1;
      suggestions.push('Avoid sequential patterns');
    }

    // Normalize score
    score = Math.max(0, Math.min(5, score));

    const strengthMap: Record<number, Pick<PasswordStrength, 'label' | 'color'>> = {
      0: { label: 'Very Weak', color: 'bg-destructive' },
      1: { label: 'Weak', color: 'bg-orange-500' },
      2: { label: 'Fair', color: 'bg-yellow-500' },
      3: { label: 'Strong', color: 'bg-lime-500' },
      4: { label: 'Strong', color: 'bg-green-500' },
      5: { label: 'Very Strong', color: 'bg-green-600' },
    };

    return {
      score,
      ...strengthMap[score],
      suggestions: suggestions.slice(0, 3), // Return top 3 suggestions
    };
  }, []);

  const isPasswordCompromised = useCallback(async (password: string): Promise<boolean> => {
    // Check against common passwords list
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
      return true;
    }
    
    // In production, you would also check against the Have I Been Pwned API
    // For now, we'll just check against our local list
    return false;
  }, []);

  const updatePassword = useCallback(async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsCheckingPassword(true);
    
    try {
      // Check if new password is strong enough
      const strength = checkPasswordStrength(newPassword);
      if (strength.score < 3) {
        return {
          success: false,
          error: 'Password is too weak. Please choose a stronger password.',
        };
      }

      // Check if password is compromised
      const isCompromised = await isPasswordCompromised(newPassword);
      if (isCompromised) {
        return {
          success: false,
          error: 'This password has been found in data breaches. Please choose a different password.',
        };
      }

      // Update password via Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Update last password change timestamp in profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ last_password_change: new Date().toISOString() })
          .eq('id', user.id);
      }

      toast.success('Password updated successfully');
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update password';
      return { success: false, error: message };
    } finally {
      setIsCheckingPassword(false);
    }
  }, [checkPasswordStrength, isPasswordCompromised]);

  const validatePasswordRequirements = useCallback((password: string): {
    isValid: boolean;
    requirements: { met: boolean; text: string }[];
  } => {
    const requirements = [
      { met: password.length >= 8, text: 'At least 8 characters' },
      { met: /[A-Z]/.test(password), text: 'At least one uppercase letter' },
      { met: /[a-z]/.test(password), text: 'At least one lowercase letter' },
      { met: /[0-9]/.test(password), text: 'At least one number' },
      { met: /[^A-Za-z0-9]/.test(password), text: 'At least one special character' },
    ];

    return {
      isValid: requirements.every(r => r.met),
      requirements,
    };
  }, []);

  return {
    checkPasswordStrength,
    isPasswordCompromised,
    updatePassword,
    validatePasswordRequirements,
    isCheckingPassword,
  };
};
