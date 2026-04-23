/**
 * Formats a phone number to display only 10 digits.
 * Strips any +91 or 91 prefix, returning just the 10-digit number.
 * e.g., "+919328573977" -> "9328573977"
 * e.g., "919328573977" -> "9328573977"
 * e.g., "9328573977" -> "9328573977"
 */
export const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';

    // Remove all non-numeric characters
    const numbersOnly = phone.replace(/\D/g, '');

    // If it starts with 91 and has 12 digits, strip the 91 prefix
    if (numbersOnly.startsWith('91') && numbersOnly.length === 12) {
        return numbersOnly.slice(2);
    }

    // If it's already 10 digits, return as is
    if (numbersOnly.length === 10) {
        return numbersOnly;
    }

    return numbersOnly;
};

/**
 * Strips formatting to get raw digits.
 * Useful for inputs.
 */
export const rawPhone = (phone: string): string => {
    return phone.replace(/\D/g, '');
};
