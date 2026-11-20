/**
 * OBUMSJ Website - Google Drive Integration Foundation Service (Task 4)
 * Provides browser-based Google Identity Services (GIS) Token Client authorization,
 * Google Picker API integration, and Drive API v3 folder/file management.
 * 
 * Strict Security Guarantees:
 * 1. Scope restricted strictly to 'https://www.googleapis.com/auth/drive.file'.
 * 2. Access tokens are kept strictly in JavaScript memory (closure variables).
 * 3. Never stores access tokens in localStorage, sessionStorage, Firestore, URLs, or logs.
 * 4. Never exposes OAuth client secrets.
 * 5. Uses modern GIS (google.accounts.oauth2) instead of deprecated Google Sign-In.
 */

// Private memory-only state (never exported or persisted)
let driveAccessToken = null;
let tokenExpiresAt = 0;
let tokenClient = null;
let gisLoaded = false;
let gapiLoaded = false;
let pickerLoaded = false;

// Active runtime configuration (loaded from Firestore settings/drive)
let driveConfig = {
    clientId: '',
    apiKey: '',
    appId: '',
    orgAccount: ''
};

// Event listeners for state changes
const stateListeners = new Set();

export const DRIVE_STATUS = {
    NOT_CONFIGURED: 'NOT_CONFIGURED',
    DISCONNECTED: 'DISCONNECTED',
    CONNECTING: 'CONNECTING',
    CONNECTED: 'CONNECTED',
    EXPIRED: 'EXPIRED'
};

let currentStatus = DRIVE_STATUS.NOT_CONFIGURED;
let connectedUser = null; // { emailAddress, displayName, photoLink }

/**
 * Register a listener for Drive connection state changes
 * @param {Function} listener - Callback receiving (status, connectedUser, error)
 */
export function onDriveStateChange(listener) {
    if (typeof listener === 'function') {
        stateListeners.add(listener);
        // Immediately notify with current state
        listener(currentStatus, connectedUser, null);
    }
    return () => stateListeners.delete(listener);
}

function notifyStateChange(error = null) {
    stateListeners.forEach(fn => {
        try {
            fn(currentStatus, connectedUser, error);
        } catch (e) {
            console.error('[DriveService] State listener error:', e);
        }
    });
}

function updateStatus(newStatus, error = null) {
    currentStatus = newStatus;
    notifyStateChange(error);
}

/**
 * Update active Google Drive configuration from settings
 * @param {Object} cfg - { clientId, apiKey, appId, orgAccount }
 */
export function setDriveConfig(cfg) {
    if (!cfg) return;
    driveConfig = {
        clientId: (cfg.clientId || '').trim(),
        apiKey: (cfg.apiKey || '').trim(),
        appId: (cfg.appId || '').trim(),
        orgAccount: (cfg.orgAccount || '').trim()
    };

    if (!driveConfig.clientId || !driveConfig.apiKey) {
        updateStatus(DRIVE_STATUS.NOT_CONFIGURED);
    } else if (currentStatus === DRIVE_STATUS.NOT_CONFIGURED) {
        updateStatus(DRIVE_STATUS.DISCONNECTED);
    }
}

/**
 * Asynchronously load Google Identity Services (GIS) and Google API client (GAPI)
 */
export async function loadGoogleScripts() {
    const promises = [];

    // 1. Google Identity Services (GIS)
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        promises.push(new Promise((resolve, reject) => {
            const existing = document.getElementById('google-gis-script');
            if (existing) {
                existing.addEventListener('load', () => { gisLoaded = true; resolve(); });
                existing.addEventListener('error', (err) => reject(new Error('Failed to load Google Identity Services library.')));
                return;
            }
            const script = document.createElement('script');
            script.id = 'google-gis-script';
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                gisLoaded = true;
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load Google Identity Services library.'));
            document.head.appendChild(script);
        }));
    } else {
        gisLoaded = true;
    }

    // 2. Google API Client (GAPI) for Picker
    if (!window.gapi) {
        promises.push(new Promise((resolve, reject) => {
            const existing = document.getElementById('google-gapi-script');
            if (existing) {
                existing.addEventListener('load', () => {
                    window.gapi.load('picker', () => {
                        gapiLoaded = true;
                        pickerLoaded = true;
                        resolve();
                    });
                });
                existing.addEventListener('error', (err) => reject(new Error('Failed to load Google API Client library.')));
                return;
            }
            const script = document.createElement('script');
            script.id = 'google-gapi-script';
            script.src = 'https://apis.google.com/js/api.js';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                gapiLoaded = true;
                window.gapi.load('picker', () => {
                    pickerLoaded = true;
                    resolve();
                });
            };
            script.onerror = () => reject(new Error('Failed to load Google API Client library.'));
            document.head.appendChild(script);
        }));
    } else if (!pickerLoaded) {
        promises.push(new Promise((resolve) => {
            window.gapi.load('picker', () => {
                pickerLoaded = true;
                resolve();
            });
        }));
    }

    await Promise.all(promises);
}

/**
 * Check if the in-memory access token is currently valid and not expired
 */
export function isTokenValid() {
    if (!driveAccessToken) return false;
    // Buffer of 60 seconds before actual expiration
    return Date.now() < (tokenExpiresAt - 60000);
}

/**
 * Get the current connection status
 */
export function getDriveStatus() {
    if (!driveConfig.clientId || !driveConfig.apiKey) {
        return DRIVE_STATUS.NOT_CONFIGURED;
    }
    if (driveAccessToken && !isTokenValid()) {
        return DRIVE_STATUS.EXPIRED;
    }
    return currentStatus;
}

/**
 * Get connected Google account details
 */
export function getConnectedUser() {
    return connectedUser;
}

/**
 * Request Google Drive authorization via GIS Token Client
 * Strictly requests 'https://www.googleapis.com/auth/drive.file'
 */
export async function connectGoogleDrive() {
    if (!driveConfig.clientId || !driveConfig.apiKey) {
        const err = new Error('Google Drive integration is not configured. Please supply a Client ID and API Key.');
        updateStatus(DRIVE_STATUS.NOT_CONFIGURED, err);
        throw err;
    }

    updateStatus(DRIVE_STATUS.CONNECTING);

    try {
        await loadGoogleScripts();

        return new Promise((resolve, reject) => {
            try {
                tokenClient = window.google.accounts.oauth2.initTokenClient({
                    client_id: driveConfig.clientId,
                    scope: 'https://www.googleapis.com/auth/drive.file',
                    callback: async (tokenResponse) => {
                        if (tokenResponse.error) {
                            console.error('[DriveService] Authorization error:', tokenResponse);
                            updateStatus(DRIVE_STATUS.DISCONNECTED, tokenResponse);
                            reject(new Error(`Drive authorization denied: ${tokenResponse.error_description || tokenResponse.error}`));
                            return;
                        }

                        // Save token in MEMORY ONLY
                        driveAccessToken = tokenResponse.access_token;
                        const expiresIn = parseInt(tokenResponse.expires_in, 10) || 3600;
                        tokenExpiresAt = Date.now() + (expiresIn * 1000);

                        try {
                            // Verify connection and fetch user identity
                            connectedUser = await fetchDriveUserInfo();
                            updateStatus(DRIVE_STATUS.CONNECTED);
                            resolve({ connectedUser, expiresIn });
                        } catch (uErr) {
                            console.warn('[DriveService] Could not fetch user profile:', uErr);
                            connectedUser = { emailAddress: 'Connected Account', displayName: 'Administrator' };
                            updateStatus(DRIVE_STATUS.CONNECTED);
                            resolve({ connectedUser, expiresIn });
                        }
                    },
                    error_callback: (err) => {
                        console.error('[DriveService] GIS error_callback:', err);
                        updateStatus(DRIVE_STATUS.DISCONNECTED, err);
                        reject(new Error(`Google authorization window error: ${err.message || 'Window closed'}`));
                    }
                });

                // Request access token with consent prompt
                tokenClient.requestAccessToken({ prompt: '' });
            } catch (initErr) {
                updateStatus(DRIVE_STATUS.DISCONNECTED, initErr);
                reject(initErr);
            }
        });
    } catch (loadErr) {
        updateStatus(DRIVE_STATUS.DISCONNECTED, loadErr);
        throw loadErr;
    }
}

/**
 * Disconnect Google Drive and revoke the in-memory access token
 */
export async function disconnectGoogleDrive() {
    if (driveAccessToken && window.google?.accounts?.oauth2?.revoke) {
        try {
            await new Promise((resolve) => {
                window.google.accounts.oauth2.revoke(driveAccessToken, () => resolve());
            });
        } catch (e) {
            console.warn('[DriveService] Token revocation notice:', e);
        }
    }

    // Clear all in-memory credentials
    driveAccessToken = null;
    tokenExpiresAt = 0;
    connectedUser = null;

    updateStatus(driveConfig.clientId && driveConfig.apiKey ? DRIVE_STATUS.DISCONNECTED : DRIVE_STATUS.NOT_CONFIGURED);
}

/**
 * Fetch connected Google user profile from Drive API v3
 */
export async function fetchDriveUserInfo() {
    if (!isTokenValid()) {
        updateStatus(DRIVE_STATUS.EXPIRED);
        throw new Error('Drive access token expired or not available.');
    }

    const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user(displayName,emailAddress,photoLink)', {
        headers: {
            'Authorization': `Bearer ${driveAccessToken}`
        }
    });

    if (!response.ok) {
        if (response.status === 401) {
            updateStatus(DRIVE_STATUS.EXPIRED);
        }
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Drive API error HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.user || null;
}

/**
 * Test Drive API Connection
 */
export async function testDriveConnection() {
    const user = await fetchDriveUserInfo();
    return {
        success: true,
        user,
        expiresInSeconds: Math.max(0, Math.round((tokenExpiresAt - Date.now()) / 1000))
    };
}

/**
 * Open Google Picker for file selection
 * @param {Object} options - { title, multiSelect, mimeTypes, onPick, onCancel }
 */
export async function openGooglePicker(options = {}) {
    if (!isTokenValid()) {
        updateStatus(DRIVE_STATUS.EXPIRED);
        throw new Error('Please connect or re-authorize Google Drive before using the File Picker.');
    }
    if (!driveConfig.apiKey) {
        throw new Error('Google API Developer Key is not configured.');
    }

    await loadGoogleScripts();

    if (!window.google?.picker) {
        throw new Error('Google Picker API failed to initialize.');
    }

    return new Promise((resolve, reject) => {
        try {
            const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS);
            view.setIncludeFolders(true);
            view.setMode(window.google.picker.DocsViewMode.LIST);

            if (options.mimeTypes && Array.isArray(options.mimeTypes)) {
                view.setMimeTypes(options.mimeTypes.join(','));
            }

            const builder = new window.google.picker.PickerBuilder()
                .addView(view)
                .setOAuthToken(driveAccessToken)
                .setDeveloperKey(driveConfig.apiKey)
                .setCallback((data) => {
                    if (data.action === window.google.picker.Action.PICKED) {
                        const docs = data.docs || [];
                        if (typeof options.onPick === 'function') options.onPick(docs);
                        resolve({ action: 'picked', docs });
                    } else if (data.action === window.google.picker.Action.CANCEL) {
                        if (typeof options.onCancel === 'function') options.onCancel();
                        resolve({ action: 'cancel', docs: [] });
                    }
                });

            if (driveConfig.appId) {
                builder.setAppId(driveConfig.appId);
            }
            if (options.title) {
                builder.setTitle(options.title);
            }
            if (options.multiSelect) {
                builder.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED);
            }

            const picker = builder.build();
            picker.setVisible(true);
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Search for an existing folder by name and parent ID in Drive
 */
export async function searchDriveFolder(folderName, parentId = null) {
    if (!isTokenValid()) throw new Error('Drive token expired or not connected.');

    let q = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName.replace(/'/g, "\\'")}' and trashed = false`;
    if (parentId) {
        q += ` and '${parentId}' in parents`;
    }

    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,parents)&spaces=drive`;
    const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${driveAccessToken}` }
    });

    if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Search folder HTTP ${res.status}`);
    }

    const data = await res.json();
    return (data.files && data.files.length > 0) ? data.files[0] : null;
}

/**
 * Create a new folder in Drive
 */
export async function createDriveFolder(folderName, parentId = null) {
    if (!isTokenValid()) throw new Error('Drive token expired or not connected.');

    const body = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
    };
    if (parentId) {
        body.parents = [parentId];
    }

    const res = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${driveAccessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Create folder HTTP ${res.status}`);
    }

    return await res.json();
}

/**
 * Ensure the full OBUMSJ Resources folder hierarchy exists:
 * OBUMSJ Resources/
 *   ├── Qirat/
 *   ├── Ruqiya/
 *   └── Academy/
 * 
 * Idempotent: reuses existing folders if found to avoid duplicates.
 */
export async function ensureOrganizationalFolders() {
    if (!isTokenValid()) throw new Error('Please connect Google Drive before initializing folder hierarchy.');

    // 1. Root: OBUMSJ Resources
    let rootFolder = await searchDriveFolder('OBUMSJ Resources');
    let rootCreated = false;
    if (!rootFolder) {
        rootFolder = await createDriveFolder('OBUMSJ Resources');
        rootCreated = true;
    }

    // 2. Subfolders: Qirat, Ruqiya, Academy
    const subfolderNames = ['Qirat', 'Ruqiya', 'Academy'];
    const subfolderResults = {};

    for (const name of subfolderNames) {
        let sub = await searchDriveFolder(name, rootFolder.id);
        let created = false;
        if (!sub) {
            sub = await createDriveFolder(name, rootFolder.id);
            created = true;
        }
        subfolderResults[name.toLowerCase()] = {
            id: sub.id,
            name: name,
            created: created
        };
    }

    return {
        root: {
            id: rootFolder.id,
            name: 'OBUMSJ Resources',
            created: rootCreated
        },
        sectors: subfolderResults,
        ownerEmail: connectedUser?.emailAddress || 'Unknown'
    };
}

/**
 * Retrieve metadata for a specific Google Drive file and verify access
 * @param {string} fileId - The Google Drive file ID
 * @returns {Promise<Object>} { id, name, mimeType, size, webViewLink, parents }
 */
export async function getDriveFileMetadata(fileId) {
    if (!fileId || typeof fileId !== 'string') {
        throw new Error('A valid Google Drive File ID is required.');
    }
    if (!isTokenValid()) {
        updateStatus(DRIVE_STATUS.EXPIRED);
        throw new Error('Google Drive access token is expired or not connected. Please re-authorize.');
    }

    const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?fields=id,name,mimeType,size,trashed,parents,webViewLink`;
    const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${driveAccessToken}` }
    });

    if (!res.ok) {
        if (res.status === 401) {
            updateStatus(DRIVE_STATUS.EXPIRED);
        }
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Failed to verify Drive file (HTTP ${res.status}).`);
    }

    const data = await res.json();
    if (data.trashed) {
        throw new Error('The selected file is currently in Google Drive trash.');
    }

    return {
        id: data.id,
        name: data.name,
        mimeType: data.mimeType || 'application/octet-stream',
        size: parseInt(data.size || '0', 10),
        webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
        parents: data.parents || []
    };
}

/**
 * Upload a file directly to a specified Google Drive folder via Drive API v3 Resumable Upload
 * Supports files of any size (> 5 MB) with progress tracking and cancellation.
 * @param {File|Blob} file - The file object to upload
 * @param {string} folderId - Target Google Drive folder ID (required)
 * @param {Function} [onProgress] - Callback ({ loaded, total, percent })
 * @param {Object} [options] - { onCancelHandle?: (cancelFn) => void }
 * @returns {Promise<Object>} Uploaded file metadata
 */
export async function uploadFileToDriveFolder(file, folderId, onProgress = null, options = {}) {
    if (!file) {
        throw new Error('No file provided for upload.');
    }
    if (!folderId || typeof folderId !== 'string') {
        throw new Error('Target Google Drive sector folder ID is required before upload.');
    }
    if ((file.size || 0) <= 0) {
        throw new Error('Cannot upload an empty file.');
    }
    if (!isTokenValid()) {
        updateStatus(DRIVE_STATUS.EXPIRED);
        throw new Error('Google Drive access token is expired or not connected. Please re-authorize.');
    }

    const fileName = file.name || 'unnamed_resource';
    const mimeType = file.type || 'application/octet-stream';

    const metadata = {
        name: fileName,
        mimeType: mimeType,
        parents: [folderId]
    };

    // Step 1: Initiate Resumable Upload Session
    const initUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,mimeType,size,webViewLink,parents';
    const initRes = await fetch(initUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${driveAccessToken}`,
            'Content-Type': 'application/json; charset=UTF-8',
            'X-Upload-Content-Type': mimeType,
            'X-Upload-Content-Length': String(file.size)
        },
        body: JSON.stringify(metadata)
    });

    if (!initRes.ok) {
        if (initRes.status === 401) {
            updateStatus(DRIVE_STATUS.EXPIRED);
        }
        const errJson = await initRes.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Failed to initialize Drive upload session (HTTP ${initRes.status}).`);
    }

    const sessionUri = initRes.headers.get('Location');
    if (!sessionUri) {
        throw new Error('Google Drive did not return a resumable upload session URI.');
    }

    // Step 2: Stream file contents to session URI with real progress reporting
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', sessionUri, true);
        xhr.setRequestHeader('Content-Type', mimeType);

        if (typeof options?.onCancelHandle === 'function') {
            options.onCancelHandle(() => {
                try { xhr.abort(); } catch (_) {}
            });
        }

        if (xhr.upload && typeof onProgress === 'function') {
            xhr.upload.onprogress = (evt) => {
                if (evt.lengthComputable) {
                    const percent = Math.min(100, Math.round((evt.loaded / evt.total) * 100));
                    onProgress({ loaded: evt.loaded, total: evt.total, percent });
                }
            };
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    resolve({
                        id: data.id,
                        name: data.name || fileName,
                        mimeType: data.mimeType || mimeType,
                        size: parseInt(data.size || file.size || '0', 10),
                        webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
                        folderId: folderId,
                        parents: data.parents || [folderId]
                    });
                } catch (parseErr) {
                    reject(new Error('Failed to parse Google Drive upload response.'));
                }
            } else {
                if (xhr.status === 401) {
                    updateStatus(DRIVE_STATUS.EXPIRED);
                }
                let msg = `Drive upload interrupted or failed (HTTP ${xhr.status}).`;
                try {
                    const errObj = JSON.parse(xhr.responseText);
                    if (errObj.error?.message) msg = errObj.error.message;
                } catch (_) {}
                reject(new Error(msg));
            }
        };

        xhr.onerror = () => {
            reject(new Error('Network interruption occurred during Google Drive upload. Please verify connection and retry.'));
        };

        xhr.onabort = () => {
            reject(new Error('Drive file upload was cancelled.'));
        };

        xhr.ontimeout = () => {
            reject(new Error('Drive file upload timed out.'));
        };

        xhr.send(file);
    });
}

// ============================================================================
// TASK 6: GOOGLE DRIVE PUBLIC PERMISSION MANAGEMENT (ADMINISTRATIVE)
// ============================================================================

/**
 * Retrieve permissions list for a specific Google Drive file
 * @param {string} fileId - The Google Drive file ID
 * @returns {Promise<Array>} List of permission objects
 */
export async function getFilePermissions(fileId) {
    if (!fileId || typeof fileId !== 'string') {
        throw new Error('Valid Google Drive file ID is required.');
    }
    if (!isTokenValid()) {
        updateStatus(DRIVE_STATUS.EXPIRED);
        throw new Error('Google Drive access token is expired or disconnected.');
    }

    const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions?fields=permissions(id,type,role)`;
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${driveAccessToken}`,
            'Accept': 'application/json'
        }
    });

    if (!res.ok) {
        if (res.status === 401) updateStatus(DRIVE_STATUS.EXPIRED);
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Failed to inspect Drive permissions (HTTP ${res.status}).`);
    }

    const data = await res.json();
    return data.permissions || [];
}

/**
 * Create a public read permission ("anyone with the link can view") on a specific Google Drive file
 * @param {string} fileId - The Google Drive file ID
 * @returns {Promise<Object>} { id, role, type }
 */
export async function createPublicFilePermission(fileId) {
    if (!fileId || typeof fileId !== 'string') {
        throw new Error('Valid Google Drive file ID is required.');
    }
    if (!isTokenValid()) {
        updateStatus(DRIVE_STATUS.EXPIRED);
        throw new Error('Google Drive access token is expired or disconnected.');
    }

    const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions?fields=id,type,role`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${driveAccessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            role: 'reader',
            type: 'anyone'
        })
    });

    if (!res.ok) {
        if (res.status === 401) updateStatus(DRIVE_STATUS.EXPIRED);
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Failed to create public Drive file permission (HTTP ${res.status}).`);
    }

    return await res.json();
}

/**
 * Delete a specific permission from a Google Drive file
 * @param {string} fileId - The Google Drive file ID
 * @param {string} permissionId - The specific permission ID to remove
 * @returns {Promise<boolean>}
 */
export async function deleteFilePermission(fileId, permissionId) {
    if (!fileId || !permissionId) {
        throw new Error('Both fileId and permissionId are required to delete a Drive permission.');
    }
    if (!isTokenValid()) {
        updateStatus(DRIVE_STATUS.EXPIRED);
        throw new Error('Google Drive access token is expired or disconnected.');
    }

    const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions/${encodeURIComponent(permissionId)}`;
    const res = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${driveAccessToken}`
        }
    });

    if (!res.ok && res.status !== 404) {
        if (res.status === 401) updateStatus(DRIVE_STATUS.EXPIRED);
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Failed to delete Drive permission (HTTP ${res.status}).`);
    }

    return true;
}

/**
 * Idempotently ensure a file has public read permission
 * If a permission with type 'anyone' and role 'reader' already exists, reuses it.
 * Otherwise, creates a new one.
 * @param {string} fileId - The Google Drive file ID
 * @returns {Promise<{ permissionId: string, isExisting: boolean }>}
 */
export async function ensurePublicFilePermission(fileId) {
    const permissions = await getFilePermissions(fileId);
    const existing = permissions.find(p => p.type === 'anyone' && p.role === 'reader');
    if (existing) {
        return {
            permissionId: existing.id,
            isExisting: true
        };
    }

    const created = await createPublicFilePermission(fileId);
    return {
        permissionId: created.id,
        isExisting: false
    };
}
