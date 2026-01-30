export type SignupRole = "task_giver" | "task_doer" | "both";

export interface SignupDraft {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  emailVerificationId?: string | null;
  emailVerified?: boolean;
  role: SignupRole | "";
  wantsBothRoles: boolean;
  password: string;
  confirmPassword: string;
  phone: string;
  phoneVerified?: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
}

const SIGNUP_DRAFT_KEY = "signup_draft_v1";

const emptyDraft: SignupDraft = {
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  emailVerificationId: null,
  emailVerified: false,
  role: "",
  wantsBothRoles: false,
  password: "",
  confirmPassword: "",
  phone: "",
  phoneVerified: false,
  termsAccepted: false,
  privacyAccepted: false,
};

export const getSignupDraft = (): SignupDraft => {
  if (typeof window === "undefined") {
    return { ...emptyDraft };
  }
  try {
    const raw = window.localStorage.getItem(SIGNUP_DRAFT_KEY);
    if (!raw) return { ...emptyDraft };
    const parsed = JSON.parse(raw);
    return { ...emptyDraft, ...parsed };
  } catch {
    return { ...emptyDraft };
  }
};

export const saveSignupDraft = (updates: Partial<SignupDraft>) => {
  if (typeof window === "undefined") return;
  const current = getSignupDraft();
  const next = { ...current, ...updates };
  window.localStorage.setItem(SIGNUP_DRAFT_KEY, JSON.stringify(next));
};

export const clearSignupDraft = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SIGNUP_DRAFT_KEY);
};
