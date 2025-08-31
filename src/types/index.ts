// Database types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Component props types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Theme types
export type Theme = "light" | "dark" | "system";

// Navigation types
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

// NextAuth types are defined in src/lib/auth.ts

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
