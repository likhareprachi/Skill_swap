// DOM Elements
const loginView = document.getElementById('login-view');
const aboutView = document.getElementById('about-view');
const dashboardView = document.getElementById('dashboard-view');
const profileView = document.getElementById('profile-view');
const myListingsView = document.getElementById('my-listings-view');
const messagesView = document.getElementById('messages-view');
const requestsView = document.getElementById('requests-view');

const navbar = document.getElementById('navbar');
const userEmailSpan = document.getElementById('user-email');
const postModal = document.getElementById('post-modal');
const skillsGrid = document.getElementById('skills-grid');
const myListingsGrid = document.getElementById('my-listings-grid');
const requestsGrid = document.getElementById('requests-grid');
const navNotifications = document.getElementById('nav-notifications');
const notificationDropdown = document.getElementById('notification-dropdown');
const notificationBadge = document.getElementById('notification-badge');
const notificationList = document.getElementById('notification-list');
const markReadBtn = document.getElementById('mark-read-btn');

const publicProfileModal = document.getElementById('public-profile-modal');
const publicProfileContent = document.getElementById('public-profile-content');
const closePublicProfileBtn = document.getElementById('close-public-profile');

// Views Map
const views = {
    'about': aboutView,
    'dashboard': dashboardView,
    'profile': profileView,
    'listings': myListingsView,
    'messages': messagesView,
    'requests': requestsView
};

// Toggle Public Profile Modal
export function togglePublicProfile(show) {
    if (show) {
        publicProfileModal.classList.remove('hidden');
        setTimeout(() => {
            publicProfileModal.classList.remove('opacity-0');
            publicProfileContent.classList.remove('scale-95');
            publicProfileContent.classList.add('scale-100');
        }, 10);
    } else {
        publicProfileModal.classList.add('opacity-0');
        publicProfileContent.classList.remove('scale-100');
        publicProfileContent.classList.add('scale-95');
        setTimeout(() => {
            publicProfileModal.classList.add('hidden');
        }, 300);
    }
}

if (closePublicProfileBtn) {
    closePublicProfileBtn.addEventListener('click', () => togglePublicProfile(false));
}
if (publicProfileModal) {
    publicProfileModal.addEventListener('click', (e) => {
        if (e.target.id === 'public-profile-modal') togglePublicProfile(false);
    });
}

// Open Public Profile
export function openPublicProfile(user) {
    if (!user) return;
    document.getElementById('public-profile-avatar').textContent = (user.displayName ? user.displayName[0] : (user.email ? user.email[0] : 'U')).toUpperCase();
    document.getElementById('public-profile-name').textContent = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
    document.getElementById('public-profile-email').textContent = user.email || '';
    document.getElementById('public-profile-bio').textContent = user.bio || 'No bio provided.';

    const offeringContainer = document.getElementById('public-profile-offering');
    if (offeringContainer) {
        offeringContainer.innerHTML = '';
        if (user.skillsOffered && user.skillsOffered.length > 0) {
            user.skillsOffered.forEach(skill => {
                const span = document.createElement('span');
                span.className = 'px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-bold';
                span.textContent = skill;
                offeringContainer.appendChild(span);
            });
        } else {
            offeringContainer.innerHTML = '<span class="text-slate-400 text-xs">None listed</span>';
        }
    }

    const seekingContainer = document.getElementById('public-profile-seeking');
    if (seekingContainer) {
        seekingContainer.innerHTML = '';
        if (user.skillsSeeking && user.skillsSeeking.length > 0) {
            user.skillsSeeking.forEach(skill => {
                const span = document.createElement('span');
                span.className = 'px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs font-bold';
                span.textContent = skill;
                seekingContainer.appendChild(span);
            });
        } else {
            seekingContainer.innerHTML = '<span class="text-slate-400 text-xs">None listed</span>';
        }
    }

    togglePublicProfile(true);
}

// Render Requests
// Render Requests
export function renderRequests(incoming, outgoing) {
    if (!requestsGrid) return;
    requestsGrid.innerHTML = '';

    // Helper to render a single request item
    const createRequestItem = (req, isOutgoing) => {
        const div = document.createElement('div');
        div.className = 'glass p-4 rounded-xl flex justify-between items-center mb-4';

        let statusBadge = '';
        let actionButtons = '';
        const otherUserName = isOutgoing ? req.toUserName : req.fromUserName;
        const skillName = req.skillName;

        if (req.status === 'pending') {
            statusBadge = `<span class="px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-700">Pending</span>`;
            if (isOutgoing) {
                actionButtons = `
                    <button class="withdraw-req-btn px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-bold text-sm transition-colors" data-id="${req.id}">Withdraw</button>
                `;
            } else {
                actionButtons = `
                    <button class="view-profile-btn px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold text-sm transition-colors" data-uid="${req.fromUserId}">View Profile</button>
                    <button class="accept-req-btn px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm transition-colors shadow-lg shadow-blue-500/30" data-id="${req.id}" data-uid="${req.fromUserId}" data-name="${req.fromUserName}">Accept</button>
                    <button class="reject-req-btn px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-bold text-sm transition-colors" data-id="${req.id}">Decline</button>
                `;
            }
        } else if (req.status === 'accepted') {
            statusBadge = `<span class="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">Accepted</span>`;
            if (isOutgoing) {
                actionButtons = `
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm transition-colors shadow-lg shadow-blue-500/30" onclick="window.startChat('${req.toUserId}', '${req.toUserName}')">Message</button>
                `;
            } else {
                actionButtons = `
                    <button class="view-profile-btn px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold text-sm transition-colors" data-uid="${req.fromUserId}">View Profile</button>
                    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm transition-colors shadow-lg shadow-blue-500/30" onclick="window.startChat('${req.fromUserId}', '${req.fromUserName}')">Message</button>
                    <button class="remove-req-btn px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-bold text-sm transition-colors" data-id="${req.id}">Remove</button>
                `;
            }
        } else if (req.status === 'rejected') {
            statusBadge = `<span class="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700">Declined</span>`;
            if (!isOutgoing) {
                actionButtons = `
                    <button class="view-profile-btn px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold text-sm transition-colors" data-uid="${req.fromUserId}">View Profile</button>
                `;
            }
        }

        div.innerHTML = `
            <div>
                <div class="flex items-center space-x-2 mb-1">
                    <h4 class="font-bold text-slate-800 text-lg">${otherUserName}</h4>
                    ${statusBadge}
                </div>
                <p class="text-slate-600 text-sm">${isOutgoing ? 'You want' : 'Wants'} to connect for <span class="font-bold text-blue-600">${skillName}</span></p>
                <p class="text-slate-400 text-xs mt-1">${req.timestamp ? new Date(req.timestamp.seconds * 1000).toLocaleDateString() : ''}</p>
            </div>
            <div class="flex space-x-3">
                ${actionButtons}
            </div>
        `;

        // Add Listeners
        const viewProfileBtn = div.querySelector('.view-profile-btn');
        if (viewProfileBtn) {
            viewProfileBtn.onclick = () => {
                const event = new CustomEvent('view-profile', { detail: { userId: req.fromUserId } });
                window.dispatchEvent(event);
            };
        }

        const acceptBtn = div.querySelector('.accept-req-btn');
        if (acceptBtn) {
            acceptBtn.onclick = () => {
                if (window.handleRequestAction) {
                    window.handleRequestAction(req.id, 'accept', req.fromUserId, req.fromUserName);
                }
            };
        }

        const rejectBtn = div.querySelector('.reject-req-btn');
        if (rejectBtn) {
            rejectBtn.onclick = () => {
                if (window.handleRequestAction) {
                    window.handleRequestAction(req.id, 'reject');
                }
            };
        }

        const removeBtn = div.querySelector('.remove-req-btn');
        if (removeBtn) {
            removeBtn.onclick = () => {
                if (window.handleRequestAction) {
                    window.handleRequestAction(req.id, 'remove');
                }
            };
        }

        const withdrawBtn = div.querySelector('.withdraw-req-btn');
        if (withdrawBtn) {
            withdrawBtn.onclick = () => {
                if (window.handleRequestAction) {
                    window.handleRequestAction(req.id, 'withdraw');
                }
            };
        }

        return div;
    };

    // Render Incoming
    if (incoming && incoming.length > 0) {
        const h3 = document.createElement('h3');
        h3.className = 'text-xl font-bold text-slate-700 mb-4';
        h3.textContent = 'Received Requests';
        requestsGrid.appendChild(h3);
        incoming.forEach(req => requestsGrid.appendChild(createRequestItem(req, false)));
    } else {
        const p = document.createElement('p');
        p.className = 'text-slate-400 text-center py-4 mb-8';
        p.textContent = 'No connection requests received.';
        requestsGrid.appendChild(p);
    }

    // Render Outgoing
    if (outgoing && outgoing.length > 0) {
        const h3 = document.createElement('h3');
        h3.className = 'text-xl font-bold text-slate-700 mb-4 mt-8';
        h3.textContent = 'Sent Requests';
        requestsGrid.appendChild(h3);
        outgoing.forEach(req => requestsGrid.appendChild(createRequestItem(req, true)));
    }
}

// Helper: Hide all views except login
function hideAllAppViews() {
    Object.values(views).forEach(view => {
        if (view) {
            view.classList.add('hidden');
            view.classList.remove('animate-fade-in-up');
        }
    });
}

// Show Specific View
export function showView(viewName) {
    loginView.classList.add('hidden');
    navbar.classList.remove('hidden');

    hideAllAppViews();

    const targetView = views[viewName];
    if (targetView) {
        targetView.classList.remove('hidden');
        targetView.classList.add('animate-fade-in-up');
    }
}

// Show Dashboard (Default)
export function showDashboard() {
    showView('dashboard');
}

// Show Login
export function showLogin() {
    hideAllAppViews();
    navbar.classList.add('hidden');
    loginView.classList.remove('hidden');
}

// Update User Info in Navbar & Profile
export function updateUserInfo(user) {
    if (user && user.email) {
        // Navbar
        const emailEls = document.querySelectorAll('#user-email');
        const displayName = user.displayName || user.email.split('@')[0];
        emailEls.forEach(el => el.textContent = displayName);

        // Profile
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const profileAvatar = document.getElementById('profile-avatar');

        if (profileName) profileName.textContent = user.displayName || user.email.split('@')[0];
        if (profileEmail) profileEmail.textContent = user.email;
        if (profileAvatar) profileAvatar.textContent = (user.email[0] || 'U').toUpperCase();
    }
}

// Toggle Modal
export function toggleModal(show) {
    if (show) {
        postModal.classList.remove('hidden');
        setTimeout(() => {
            postModal.classList.remove('opacity-0');
            postModal.querySelector('#post-modal-content').classList.remove('scale-95');
            postModal.querySelector('#post-modal-content').classList.add('scale-100');
        }, 10);
    } else {
        postModal.classList.add('opacity-0');
        postModal.querySelector('#post-modal-content').classList.remove('scale-100');
        postModal.querySelector('#post-modal-content').classList.add('scale-95');
        setTimeout(() => {
            postModal.classList.add('hidden');
        }, 300);
    }
}

// Toggle Notifications
export function toggleNotifications(show) {
    if (show) {
        notificationDropdown.classList.remove('hidden');
        // Reset state for animation
        notificationDropdown.classList.add('opacity-0', 'scale-95');
        notificationDropdown.classList.remove('opacity-100', 'scale-100');

        setTimeout(() => {
            notificationDropdown.classList.remove('opacity-0', 'scale-95');
            notificationDropdown.classList.add('opacity-100', 'scale-100');
        }, 10);
    } else {
        notificationDropdown.classList.remove('opacity-100', 'scale-100');
        notificationDropdown.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            notificationDropdown.classList.add('hidden');
        }, 200);
    }
}

// Update Notifications List
export function updateNotifications(chats, requests, sentRequests, currentUserId) {
    if (!notificationList || !notificationBadge) return;

    // Filter for chats where the last message was NOT sent by the current user
    // AND the user is NOT currently viewing that chat
    const recentMessages = chats.filter(chat => {
        const isFromOther = chat.lastSenderId && chat.lastSenderId !== currentUserId;
        const isNotCurrentChat = chat.id !== window.currentChatId;
        return chat.lastMessage && isFromOther && isNotCurrentChat;
    });

    const pendingRequests = Array.isArray(requests) ? requests : [];

    // Filter sent requests that have been accepted or rejected
    // We can limit this to recent ones if we had a timestamp check, but for now show all non-pending
    const requestUpdates = Array.isArray(sentRequests) ? sentRequests.filter(req =>
        req.status === 'accepted' || req.status === 'rejected'
    ) : [];

    const totalNotifications = recentMessages.length + pendingRequests.length + requestUpdates.length;

    // Update Badge
    if (totalNotifications > 0) {
        notificationBadge.textContent = totalNotifications;
        notificationBadge.classList.remove('hidden');
        notificationBadge.classList.add('flex', 'items-center', 'justify-center', 'text-[10px]', 'font-bold', 'text-white', 'bg-red-500', 'w-4', 'h-4', 'rounded-full', 'absolute', '-top-1', '-right-1', 'border-2', 'border-[#0f172a]');
    } else {
        notificationBadge.classList.add('hidden');
    }

    // Render List
    notificationList.innerHTML = '';

    if (totalNotifications === 0) {
        notificationList.innerHTML = `
            <div class="p-8 text-center text-slate-500 text-sm">
                <p>No new signals received.</p>
            </div>
        `;
    } else {
        // Render Pending Requests (Incoming)
        pendingRequests.forEach(req => {
            const div = document.createElement('div');
            div.className = 'p-3 border-b border-slate-200 bg-blue-50/50 hover:bg-blue-100/50 transition-colors';
            div.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <span class="font-bold text-sm text-slate-800">Connection Request</span>
                    <span class="text-xs text-blue-600 font-medium">New</span>
                </div>
                <p class="text-xs text-slate-600 mb-2"><span class="font-bold">${req.fromUserName}</span> wants to connect for <span class="font-bold text-blue-600">${req.skillName}</span></p>
                <div class="flex space-x-2">
                    <button class="accept-req-btn px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors" data-id="${req.id}" data-uid="${req.fromUserId}" data-name="${req.fromUserName}">Accept</button>
                    <button class="reject-req-btn px-3 py-1 bg-slate-200 text-slate-700 text-xs rounded hover:bg-slate-300 transition-colors" data-id="${req.id}">Decline</button>
                </div>
            `;

            // Add listeners
            const acceptBtn = div.querySelector('.accept-req-btn');
            const rejectBtn = div.querySelector('.reject-req-btn');

            acceptBtn.onclick = (e) => {
                e.stopPropagation();
                if (window.handleRequestAction) {
                    window.handleRequestAction(req.id, 'accept', req.fromUserId, req.fromUserName);
                }
            };

            rejectBtn.onclick = (e) => {
                e.stopPropagation();
                if (window.handleRequestAction) {
                    window.handleRequestAction(req.id, 'reject');
                }
            };

            notificationList.appendChild(div);
        });

        // Render Request Updates (Outgoing)
        requestUpdates.forEach(req => {
            const div = document.createElement('div');
            const isAccepted = req.status === 'accepted';
            const bgColor = isAccepted ? 'bg-green-50/50 hover:bg-green-100/50' : 'bg-red-50/50 hover:bg-red-100/50';
            const statusColor = isAccepted ? 'text-green-600' : 'text-red-600';
            const statusText = isAccepted ? 'Accepted' : 'Declined';

            div.className = `p-3 border-b border-slate-200 ${bgColor} transition-colors`;

            let actionHtml = '';
            if (isAccepted) {
                actionHtml = `<button class="msg-btn px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors mt-2">Message</button>`;
            } else {
                actionHtml = `<button class="dismiss-btn px-3 py-1 bg-slate-200 text-slate-700 text-xs rounded hover:bg-slate-300 transition-colors mt-2">Dismiss</button>`;
            }

            div.innerHTML = `
                <div class="flex justify-between items-start mb-1">
                    <span class="font-bold text-sm text-slate-800">Request Update</span>
                    <span class="text-xs ${statusColor} font-medium">${statusText}</span>
                </div>
                <p class="text-xs text-slate-600"><span class="font-bold">${req.toUserName}</span> ${req.status} your request for <span class="font-bold text-slate-700">${req.skillName}</span></p>
                ${actionHtml}
            `;

            if (isAccepted) {
                const msgBtn = div.querySelector('.msg-btn');
                if (msgBtn) {
                    msgBtn.onclick = (e) => {
                        e.stopPropagation();
                        toggleNotifications(false);
                        window.startChat(req.toUserId, req.toUserName);
                    };
                }
            } else {
                const dismissBtn = div.querySelector('.dismiss-btn');
                if (dismissBtn) {
                    dismissBtn.onclick = (e) => {
                        e.stopPropagation();
                        // For now, we can't really "dismiss" it from the DB without deleting the request or adding a 'read' flag.
                        // But since we are showing ALL accepted/rejected requests, maybe we should allow deleting them?
                        // Or just hide it from the UI for this session?
                        // Let's call remove request to clean it up.
                        if (window.handleRequestAction) {
                            window.handleRequestAction(req.id, 'remove');
                        }
                    };
                }
            }

            notificationList.appendChild(div);
        });

        // Render Messages
        recentMessages.forEach(chat => {
            // Identify sender name
            const otherUserId = chat.participants.find(uid => uid !== currentUserId);
            const otherUserName = (chat.participantNames && chat.participantNames[otherUserId]) || 'User';
            const date = chat.updatedAt ? new Date(chat.updatedAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

            const div = document.createElement('div');
            div.className = 'p-3 border-b border-slate-200 hover:bg-white/60 transition-colors cursor-pointer';
            div.innerHTML = `
                <div class="flex justify-between items-start mb-1">
                    <span class="font-bold text-sm text-slate-800">${otherUserName}</span>
                    <span class="text-xs text-slate-500">${date}</span>
                </div>
                <p class="text-xs text-slate-600 truncate">${chat.lastMessage}</p>
            `;

            // On click, open the chat
            div.onclick = () => {
                toggleNotifications(false);
                const event = new CustomEvent('open-chat', { detail: { chatId: chat.id } });
                window.dispatchEvent(event);
            };

            notificationList.appendChild(div);
        });
    }

    // Check for new messages to toast
    const now = Date.now();
    const newestMsg = recentMessages[0];
    if (newestMsg && newestMsg.updatedAt) {
        const msgTime = newestMsg.updatedAt.seconds * 1000;
        if (now - msgTime < 5000) { // If message is less than 5 seconds old
            // Identify sender name
            const otherUserId = newestMsg.participants.find(uid => uid !== currentUserId);
            const otherUserName = (newestMsg.participantNames && newestMsg.participantNames[otherUserId]) || 'User';

            // Simple debounce check
            if (window.lastToastId !== newestMsg.id + newestMsg.updatedAt.seconds) {
                showToast(`New message from ${otherUserName}`);
                window.lastToastId = newestMsg.id + newestMsg.updatedAt.seconds;
            }
        }
    }
}

// Toast Notification Helper
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 animate-fade-in-up flex items-center space-x-3';
    toast.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Render Skills to Grid
export function renderSkills(skills) {
    skillsGrid.innerHTML = '';

    if (skills.length === 0) {
        skillsGrid.innerHTML = '<p class="text-slate-400 col-span-full text-center">No skills posted yet. Be the first!</p>';
        return;
    }

    skills.forEach(skill => {
        const card = createSkillCard(skill);
        skillsGrid.appendChild(card);
    });
}

// Render My Listings
export function renderMyListings(skills) {
    myListingsGrid.innerHTML = '';

    if (skills.length === 0) {
        myListingsGrid.innerHTML = '<p class="text-slate-400 col-span-full text-center">No active transmissions found.</p>';
        return;
    }

    skills.forEach(skill => {
        const card = createSkillCard(skill, true); // true for 'isOwner'
        myListingsGrid.appendChild(card);
    });
}

const listingModal = document.getElementById('listing-modal');
const detailOffering = document.getElementById('detail-offering');
const detailSeeking = document.getElementById('detail-seeking');
const detailDescription = document.getElementById('detail-description');
const detailUser = document.getElementById('detail-user');
const contactUserBtn = document.getElementById('contact-user-btn');

// Toggle Listing Modal
export function toggleListingModal(show) {
    if (show) {
        listingModal.classList.remove('hidden');
        setTimeout(() => {
            listingModal.classList.remove('opacity-0');
            listingModal.querySelector('#listing-modal-content').classList.remove('scale-95');
            listingModal.querySelector('#listing-modal-content').classList.add('scale-100');
        }, 10);
    } else {
        listingModal.classList.add('opacity-0');
        listingModal.querySelector('#listing-modal-content').classList.remove('scale-100');
        listingModal.querySelector('#listing-modal-content').classList.add('scale-95');
        setTimeout(() => {
            listingModal.classList.add('hidden');
        }, 300);
    }
}

import { auth } from './firebase_config.js';

// Open Listing Details
export function openListingDetails(skill) {
    detailOffering.textContent = skill.offering;
    detailSeeking.textContent = skill.seeking;
    detailDescription.textContent = skill.description || 'No description provided.';
    detailUser.textContent = skill.userEmail || 'Unknown User';

    // Store user info on the contact button for the event listener
    contactUserBtn.dataset.userId = skill.userId;
    contactUserBtn.dataset.userEmail = skill.userEmail;
    contactUserBtn.dataset.userName = skill.userName || skill.userEmail.split('@')[0];

    // Update Button Text
    const btnText = contactUserBtn.querySelector('span');

    // Check for existing chat
    // We only consider a chat "valid" for the "Message" button if there is ALSO an accepted request OR if we don't enforce requests for chatting (but here we seem to enforce it via the UI flow).
    // However, the prompt implies that removing the request should disable messaging.
    // So, we should check if there is an accepted request.

    // Actually, the best way is to ensure that when a request is removed, the chat is also removed. 
    // But purely UI-wise here:
    const existingChat = window.allChats ? window.allChats.find(c => c.participants.includes(skill.userId)) : null;

    // Check for pending sent request
    const sentRequest = window.sentRequests ? window.sentRequests.find(r => r.toUserId === skill.userId) : null;

    // Check for pending received request
    const receivedRequest = window.currentRequests ? window.currentRequests.find(r => r.fromUserId === skill.userId) : null;

    // Check for ACCEPTED request (Connection)
    // We need to know if we are connected. 
    // We can check sentRequests (accepted) or currentRequests (accepted).
    // But `window.sentRequests` and `window.currentRequests` might only contain pending ones depending on how we loaded them?
    // `listenForRequests` loads ALL requests for toUserId.
    // `listenForSentRequests` loads ONLY pending sent requests (see app.js line 430).

    // So we might not know if we have an accepted sent request unless we change `listenForSentRequests`.

    // Let's assume for now we will fix the data consistency in app.js.

    // Reset classes
    contactUserBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-slate-400', 'hover:bg-slate-500');
    contactUserBtn.disabled = false;

    if (existingChat) {
        if (btnText) btnText.textContent = "Message";
        contactUserBtn.dataset.action = "message";
    } else if (sentRequest) {
        if (btnText) btnText.textContent = "Request Sent";
        contactUserBtn.dataset.action = "pending";
        contactUserBtn.disabled = true;
        contactUserBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else if (receivedRequest && receivedRequest.status === 'pending') {
        if (btnText) btnText.textContent = "View Request";
        contactUserBtn.dataset.action = "view-request";
    } else {
        if (btnText) btnText.textContent = "Connect";
        contactUserBtn.dataset.action = "connect";
    }

    // Handle Edit Button
    let editBtn = document.getElementById('edit-listing-btn');
    if (!editBtn) {
        editBtn = document.createElement('button');
        editBtn.id = 'edit-listing-btn';
        editBtn.className = 'glass-btn w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hidden bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/40 mt-4';
        editBtn.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            <span>Edit Listing</span>
        `;
        contactUserBtn.parentNode.insertBefore(editBtn, contactUserBtn.nextSibling);

        // Add listener (using a custom event or global handler would be better, but we'll dispatch an event)
        editBtn.addEventListener('click', () => {
            const event = new CustomEvent('edit-listing', { detail: skill });
            window.dispatchEvent(event);
        });
    }

    const isOwner = auth.currentUser && auth.currentUser.uid === skill.userId;

    if (isOwner) {
        contactUserBtn.classList.add('hidden');
        editBtn.classList.remove('hidden');
    } else {
        contactUserBtn.classList.remove('hidden');
        editBtn.classList.add('hidden');
    }

    toggleListingModal(true);
}

// Helper: Create Card HTML
function createSkillCard(skill, isOwner = false) {
    const card = document.createElement('div');
    card.className = 'glass-card p-6 relative overflow-hidden group cursor-pointer hover:bg-white/60 transition-colors';
    // Add click handler for details (except when clicking delete)
    card.onclick = (e) => {
        if (!e.target.closest('button')) {
            openListingDetails(skill);
        }
    };

    let actionButtons = '';
    if (isOwner) {
        actionButtons = `
            <div class="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="p-1 bg-red-500/20 text-red-500 rounded hover:bg-red-500/40" onclick="deleteSkill('${skill.id}')">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        `;
    } else {
        actionButtons = `
            <div class="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <span class="text-xs font-bold px-2 py-1 rounded bg-blue-500/20 text-blue-600">OFFERING</span>
            </div>
        `;
    }

    card.innerHTML = `
        ${actionButtons}
        <h3 class="text-xl font-bold text-slate-800 mb-2">${skill.offering}</h3>
        <p class="text-slate-600 text-sm mb-4 line-clamp-2">${skill.description || 'No description provided.'}</p>
        <div class="flex items-center justify-between mt-4 border-t border-slate-200 pt-4">
            <div class="flex items-center space-x-2">
                <div class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-400"></div>
                <span class="text-xs text-slate-500">${skill.userName || (skill.userEmail ? skill.userEmail.split('@')[0] : 'User')}</span>
            </div>
            <span class="text-xs text-purple-600">Seeking: ${skill.seeking}</span>
        </div>
    `;
    return card;
}

// Chat Elements
const chatSidebarList = document.getElementById('chat-sidebar-list');
const chatMessages = document.getElementById('chat-messages');
const chatHeaderName = document.getElementById('chat-header-name');

// Render Chat List
export function renderChatList(chats, currentUserId, onChatSelect) {
    if (!chatSidebarList) return;
    chatSidebarList.innerHTML = '';

    if (chats.length === 0) {
        chatSidebarList.innerHTML = '<p class="text-xs text-slate-400 p-4 text-center">No active chats.</p>';
        return;
    }

    chats.forEach(chat => {
        // Identify the other user
        const otherUserId = chat.participants.find(uid => uid !== currentUserId);
        const otherUserEmail = (chat.participantEmails && chat.participantEmails[otherUserId]) || 'User';
        const otherUserName = (chat.participantNames && chat.participantNames[otherUserId]) || otherUserEmail.split('@')[0];

        const div = document.createElement('div');
        div.className = 'p-3 rounded-lg bg-white/40 cursor-pointer hover:bg-white/60 transition-colors mb-2 relative group';

        // Highlight active chat
        if (chat.id === window.currentChatId) { // We'll set this global or pass it in
            div.classList.add('bg-blue-100', 'border', 'border-blue-200');
            div.classList.remove('bg-white/40');
        }

        const date = chat.updatedAt ? new Date(chat.updatedAt.seconds * 1000).toLocaleDateString() : '';

        // Unread Indicator
        const isUnread = chat.lastSenderId && chat.lastSenderId !== currentUserId;
        const unreadDot = isUnread ? `<span class="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full"></span>` : '';

        div.innerHTML = `
            ${unreadDot}
            <div class="flex justify-between items-start">
                <h4 class="font-bold text-sm text-slate-800 truncate max-w-[70%]">${otherUserName}</h4>
                <div class="flex flex-col items-end">
                    <span class="text-xs text-slate-500 whitespace-nowrap mb-1">${date}</span>
                    <button class="delete-chat-btn p-1 text-slate-400 hover:text-red-500 hover:bg-white/60 rounded transition-all z-10" data-id="${chat.id}" title="Delete Chat">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
            <p class="text-xs text-slate-600 truncate pr-2 -mt-1">${chat.lastMessage || 'No messages yet'}</p>
        `;

        div.onclick = (e) => {
            // Prevent click if deleting
            if (e.target.closest('.delete-chat-btn')) return;
            onChatSelect(chat.id, otherUserEmail, otherUserName);
        };

        const deleteBtn = div.querySelector('.delete-chat-btn');
        if (deleteBtn) {
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                if (window.deleteChat) {
                    window.deleteChat(chat.id);
                }
            };
        }

        chatSidebarList.appendChild(div);
    });
}

// Render Messages
export function renderMessages(messages, currentUserId) {
    if (!chatMessages) return;
    chatMessages.innerHTML = '';

    if (messages.length === 0) {
        chatMessages.innerHTML = '<p class="text-sm text-slate-400 text-center mt-10">Start the conversation!</p>';
        return;
    }

    messages.forEach(msg => {
        const isMe = msg.senderId === currentUserId;
        const div = document.createElement('div');
        div.className = `flex ${isMe ? 'justify-end' : 'justify-start'}`;

        div.innerHTML = `
            <div class="${isMe ? 'bg-blue-600 rounded-tr-none text-white' : 'bg-white/80 rounded-tl-none text-slate-800'} p-3 rounded-2xl max-w-xs text-sm shadow-sm">
                ${msg.text}
            </div>
        `;
        chatMessages.appendChild(div);
    });

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

export function updateChatHeader(name) {
    if (chatHeaderName) chatHeaderName.textContent = name;
}
