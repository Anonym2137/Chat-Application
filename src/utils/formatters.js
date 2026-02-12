/**
 * Utility functions for formatting dates, times, and user data
 */

/**
 * Format timestamp to locale time (HH:MM)
 * @param {string|Date} timestamp 
 * @returns {string}
 */
export const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format timestamp to locale date
 * @param {string|Date} timestamp 
 * @returns {string}
 */
export const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
};

/**
 * Get user initials from user object
 * @param {object} user - User object with username, name, surname
 * @returns {string}
 */
export const getInitials = (user) => {
    if (!user) return '?';

    // Try to use name and surname first
    if (user.name || user.surname) {
        const first = user.name?.[0] || '';
        const last = user.surname?.[0] || '';
        return (first + last).toUpperCase() || user.username?.[0]?.toUpperCase() || '?';
    }

    // Fall back to username
    return user.username?.[0]?.toUpperCase() || '?';
};

/**
 * Check if two timestamps are on different dates
 * @param {string|Date} timestamp1 
 * @param {string|Date} timestamp2 
 * @returns {boolean}
 */
export const isDifferentDate = (timestamp1, timestamp2) => {
    return formatDate(timestamp1) !== formatDate(timestamp2);
};
