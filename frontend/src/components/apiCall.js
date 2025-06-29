// START COPYING HERE
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.text();
        if (error.startsWith('<!DOCTYPE html>')) {
            throw new Error('Server returned an HTML error page. The backend might be down.');
        }
        throw new Error(error || `HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    return { success: true };
};

export const checkAuth = async () => handleResponse(await fetch('/api/auth/check'));

export const login = async (identifier, password) => {
    return handleResponse(await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
    }));
};

export const logout = async () => handleResponse(await fetch('/api/auth/logout', { method: 'POST' }));

export const getUsers = async () => handleResponse(await fetch('/api/users'));

export const saveUser = async (user) => {
    const url = user.id ? `/api/users/${user.id}` : '/api/users';
    const method = user.id ? 'PUT' : 'POST';
    return handleResponse(await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
    }));
};

export const deleteUser = async (id) => handleResponse(await fetch(`/api/users/${id}`, { method: 'DELETE' }));

export const getCards = async () => handleResponse(await fetch('/api/cards'));

export const saveCard = async (card) => {
    if (!card) {
        console.error("saveCard called with undefined card");
        return;
    }
    const url = card.id ? `/api/cards/${card.id}` : '/api/cards';
    const method = card.id ? 'PUT' : 'POST';
    return handleResponse(await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(card),
    }));
};

export const deleteCard = async (id) => handleResponse(await fetch(`/api/cards/${id}`, { method: 'DELETE' }));

export const getHistory = async (userId) => handleResponse(await fetch(`/api/history/${userId}`));

export const saveHistory = async (history) => {
    return handleResponse(await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(history),
    }));
};

export const getAchievements = async () => handleResponse(await fetch('/api/achievements'));

export const saveAchievements = async (achievements) => {
    return handleResponse(await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(achievements),
    }));
};

export const getJournal = async (userId) => handleResponse(await fetch(`/api/journal/${userId}`));

export const saveJournalEntry = async (entry) => {
    const url = entry.id ? `/api/journal/${entry.id}` : '/api/journal';
    const method = entry.id ? 'PUT' : 'POST';
    return handleResponse(await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
    }));
};

export const deleteJournalEntry = async (id) => handleResponse(await fetch(`/api/journal/${id}`, { method: 'DELETE' }));

export const getSiteSettings = async () => handleResponse(await fetch('/api/site-settings'));

export const saveSiteSettings = async (settings) => {
    return handleResponse(await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
    }));
};

export const saveUserSettings = async (userId, settings) => {
    return handleResponse(await fetch(`/api/users/${userId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
    }));
};
// END COPYING HERE