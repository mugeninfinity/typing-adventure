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
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    return { success: true };
};

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('media', file);
    return handleResponse(await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    }));
};

export const checkAuth = async () => handleResponse(await fetch('/api/auth/check'));
export const login = async (identifier, password) => handleResponse(await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
}));
export const logout = async () => handleResponse(await fetch('/api/auth/logout', { method: 'POST' }));

export const getCards = async () => handleResponse(await fetch('/api/cards'));
export const saveCard = async (card) => {
    const url = card.id ? `/api/cards/${card.id}` : '/api/cards';
    const method = card.id ? 'PUT' : 'POST';
    return handleResponse(await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(card),
    }));
};
export const deleteCard = async (id) => handleResponse(await fetch(`/api/cards/${id}`, { method: 'DELETE' }));

export const getAchievements = async () => handleResponse(await fetch('/api/achievements'));
export const saveAchievements = async (achievements) => {
    return handleResponse(await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(achievements),
    }));
};

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

// FIND THE `deleteUser` FUNCTION AND ADD THIS NEW FUNCTION AFTER IT

// START COPYING HERE
export const updateUserAvatar = async (userId, avatar_url) => {
    return handleResponse(await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // We only send the specific field we want to change
        body: JSON.stringify({ avatar_url: avatar_url }),
    }));
};

export const getHistory = async (userId) => handleResponse(await fetch(`/api/history/${userId}`));
export const saveHistory = async (history) => {
    return handleResponse(await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(history),
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

// ADMIN: Mon Management
export const getAllMons = async () => handleResponse(await fetch('/api/mons'));
export const deleteMon = async (id) => handleResponse(await fetch(`/api/mons/${id}`, { method: 'DELETE' }));

export const getUserMons = async (userId) => handleResponse(await fetch(`/api/users/${userId}/mons`));

// Mon Types
export const getMonTypes = async () => handleResponse(await fetch('/api/mon-types'));
export const saveMonType = async (monType) => {
    const url = monType.id ? `/api/mon-types/${monType.id}` : '/api/mon-types';
    const method = monType.id ? 'PUT' : 'POST';
    return handleResponse(await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(monType),
    }));
};
export const deleteMonType = async (id) => handleResponse(await fetch(`/api/mon-types/${id}`, { method: 'DELETE' }));
// END COPYING HERE