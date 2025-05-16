import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a random strong password
 * @param length Password length (default: 12)
 * @param includeSymbols Whether to include special characters (default: true)
 * @returns A random strong password
 */
export function generateRandomPassword(length: number = 12, includeSymbols: boolean = true): string {
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let chars = lowerChars + upperChars + numbers;
  if (includeSymbols) {
    chars += symbols;
  }
  
  // Ensure we have at least one of each character type
  let password = '';
  password += lowerChars.charAt(Math.floor(Math.random() * lowerChars.length));
  password += upperChars.charAt(Math.floor(Math.random() * upperChars.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  
  if (includeSymbols) {
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));
  }
  
  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
} 