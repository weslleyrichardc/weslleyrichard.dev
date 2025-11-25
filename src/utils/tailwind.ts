import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges and combines Tailwind CSS classes using clsx and tailwind-merge.
 * @param inputs - Class values to combine
 * @returns The merged class string
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
