import { initAuth, login, logout, loginWithGoogle } from './auth.js';
import { toggleModal, renderSkills, showView, renderMyListings, toggleListingModal, renderChatList, renderMessages, updateChatHeader, toggleNotifications, updateNotifications, renderRequests, openPublicProfile } from './ui.js';
import { db, auth } from './firebase_config.js';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc, getDoc, setDoc, where, limit, updateDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Initialize Auth Listener
initAuth();

// State
let allSkills = [];
let currentChatId = null;
let unsubscribeMessages = null;
let editingSkillId = null;
let currentRequests = [];
let sentRequests = [];
let unsubscribeRequests = null;
let unsubscribeSentRequests = null;
let unsubscribeChats = null;

// Initialize Globals
window.allChats = [];
window.currentRequests = [];
window.sentRequests = [];
window.currentChatId = null;

// DOM Elements
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const postSkillBtn = document.getElementById('post-skill-btn');
const closeModalBtn = document.getElementById('close-modal');
const postForm = document.getElementById('post-form');
const profileForm = document.getElementById('profile-form');

// Nav Elements
const navDashboard = document.getElementById('nav-dashboard');
const navListings = document.getElementById('nav-listings');
const navMessages = document.getElementById('nav-messages');
const navRequests = document.getElementById('nav-requests');
const navProfile = document.getElementById('nav-profile');
const navProfileLink = document.getElementById('nav-profile-link');
const navAbout = document.getElementById('nav-about');
const navLogo = document.getElementById('nav-logo');
const aboutToDashboardBtn = document.getElementById('about-to-dashboard-btn');

// Modal Elements
const closeListingModalBtn = document.getElementById('close-listing-modal');
const contactUserBtn = document.getElementById('contact-user-btn');

// Chat Elements
const chatSendBtn = document.getElementById('chat-send-btn');
const chatInput = document.getElementById('chat-input');

// Additional Auth Listener for App Logic
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Clear any existing chat state from previous session
        currentChatId = null;
        window.currentChatId = null;
        if (unsubscribeMessages) {
            unsubscribeMessages();
            unsubscribeMessages = null;
        }

        // Reset Chat UI
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="h-full flex items-center justify-center text-gray-400">
                    <p>Select a conversation to start messaging</p>
                </div>
            `;
        }
        updateChatHeader('Select a Chat');

        loadChats();
        listenForRequests();
        listenForSentRequests();

        // Load own profile to populate form if it exists
        getDoc(doc(db, "users", user.uid)).then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const bioInput = document.getElementById('profile-bio');
                const offerInput = document.getElementById('profile-skills-offer');
                const seekInput = document.getElementById('profile-skills-seek');

                if (bioInput) bioInput.value = data.bio || '';
                if (offerInput) offerInput.value = (data.skillsOffered || []).join(', ');
                if (seekInput) seekInput.value = (data.skillsSeeking || []).join(', ');
            }
        });

    } else {
        // Clear chat state
        currentChatId = null;
        window.currentChatId = null;
        window.allChats = [];
        window.currentRequests = [];
        window.sentRequests = [];

        // Unsubscribe listeners
        if (unsubscribeMessages) {
            unsubscribeMessages();
            unsubscribeMessages = null;
        }
        if (unsubscribeChats) {
            unsubscribeChats();
            unsubscribeChats = null;
        }
        if (unsubscribeRequests) {
            unsubscribeRequests();
            unsubscribeRequests = null;
        }
        if (unsubscribeSentRequests) {
            unsubscribeSentRequests();
            unsubscribeSentRequests = null;
        }

        // Clear Chat UI
        const chatSidebarList = document.getElementById('chat-sidebar-list');
        if (chatSidebarList) chatSidebarList.innerHTML = '';

        const chatMessagesEl = document.getElementById('chat-messages');
        if (chatMessagesEl) chatMessagesEl.innerHTML = '';

        updateChatHeader('Select a Chat');

        // Clear Notifications UI
        const notificationList = document.getElementById('notification-list');
        if (notificationList) notificationList.innerHTML = '';

        const notificationBadge = document.getElementById('notification-badge');
        if (notificationBadge) notificationBadge.classList.add('hidden');

        // Clear Requests UI
        const requestsGrid = document.getElementById('requests-grid');
        if (requestsGrid) requestsGrid.innerHTML = '';
    }
});

// Event Listeners

// Navigation
if (navDashboard) navDashboard.addEventListener('click', () => showView('dashboard'));
if (navLogo) navLogo.addEventListener('click', () => showView('about'));
if (navMessages) {
    navMessages.addEventListener('click', () => {
        showView('messages');
        // Reset current chat selection to show the "Select a chat" placeholder
        currentChatId = null;
        window.currentChatId = null;
        updateChatHeader('Select a Chat');

        // Unsubscribe from any active message listener to prevent ghost updates
        if (unsubscribeMessages) {
            unsubscribeMessages();
            unsubscribeMessages = null;
        }

        // Clear messages area
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="h-full flex items-center justify-center text-gray-400">
                    <p>Select a conversation to start messaging</p>
                </div>
            `;
        }
        loadChats();
    });
}
if (navRequests) {
    navRequests.addEventListener('click', () => {
        showView('requests');
        renderRequests(currentRequests);
    });
}
if (navProfile) navProfile.addEventListener('click', () => showView('profile'));
if (navProfileLink) navProfileLink.addEventListener('click', () => showView('profile'));
if (navAbout) navAbout.addEventListener('click', () => showView('about'));
if (aboutToDashboardBtn) aboutToDashboardBtn.addEventListener('click', () => showView('dashboard'));

if (navListings) {
    navListings.addEventListener('click', () => {
        showView('listings');
        updateMyListings();
    });
}

function updateMyListings() {
    if (auth.currentUser) {
        const mySkills = allSkills.filter(skill => skill.userId === auth.currentUser.uid);
        renderMyListings(mySkills);
    }
}

// Login
if (loginForm) {
    console.log("Login form found, attaching listener");
    loginForm.addEventListener('submit', (e) => {
        console.log("Login form submitted");
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        console.log("Attempting login for:", email);
        login(email, password);
    });
} else {
    console.error("Login form NOT found");
}

// Google Login
const googleLoginBtn = document.getElementById('google-login-btn');
if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
        loginWithGoogle();
    });
}

// Forgot Password
const forgotPasswordBtn = document.getElementById('forgot-password-btn');
if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', () => {
        alert("Password reset functionality will be available in the next update. Please contact support if you need immediate assistance.");
    });
}

// Create Account
const createAccountBtn = document.getElementById('create-account-btn');
if (createAccountBtn) {
    createAccountBtn.addEventListener('click', () => {
        alert("Account creation is currently closed for the public beta. Please sign in with your university Google account.");
    });
}

// Logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        logout();
    });
}

// Profile Save
if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!auth.currentUser) return;

        const bio = document.getElementById('profile-bio').value;
        const skillsOffer = document.getElementById('profile-skills-offer').value.split(',').map(s => s.trim()).filter(s => s);
        const skillsSeek = document.getElementById('profile-skills-seek').value.split(',').map(s => s.trim()).filter(s => s);

        try {
            await setDoc(doc(db, "users", auth.currentUser.uid), {
                email: auth.currentUser.email,
                displayName: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
                bio: bio,
                skillsOffered: skillsOffer,
                skillsSeeking: skillsSeek,
                updatedAt: serverTimestamp()
            }, { merge: true });
            alert("Profile saved successfully!");
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile.");
        }
    });
}

// View Profile Listener
window.addEventListener('view-profile', async (e) => {
    const userId = e.detail.userId;
    if (!userId) return;

    try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
            openPublicProfile(userDoc.data());
        } else {
            openPublicProfile({
                email: 'Unknown',
                displayName: 'User',
                bio: 'This user has not set up their profile yet.'
            });
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
    }
});

// Modal Controls
if (postSkillBtn) postSkillBtn.addEventListener('click', () => toggleModal(true));
if (closeModalBtn) closeModalBtn.addEventListener('click', () => toggleModal(false));

if (closeListingModalBtn) {
    closeListingModalBtn.addEventListener('click', () => toggleListingModal(false));
}

// Close modal on outside click
const postModal = document.getElementById('post-modal');
if (postModal) {
    postModal.addEventListener('click', (e) => {
        if (e.target.id === 'post-modal') {
            resetPostForm();
            toggleModal(false);
        }
    });
}

// Reset Post Form
function resetPostForm() {
    postForm.reset();
    editingSkillId = null;
    const submitBtn = postForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = "TRANSMIT";
    const modalTitle = document.querySelector('#post-modal h3');
    if (modalTitle) modalTitle.textContent = "Broadcast Signal";
}

// Post Skill
if (postForm) {
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!auth.currentUser) {
            alert("You must be logged in to post.");
            return;
        }

        const offering = document.getElementById('skill-offer').value;
        const seeking = document.getElementById('skill-seek').value;
        const description = document.getElementById('skill-desc').value;
        const userName = auth.currentUser.displayName || auth.currentUser.email.split('@')[0];

        try {
            if (editingSkillId) {
                // Update existing skill
                const skillRef = doc(db, "skills", editingSkillId);
                await updateDoc(skillRef, {
                    offering,
                    seeking,
                    description,
                    updatedAt: serverTimestamp()
                });
                alert("Signal updated!");
            } else {
                // Create new skill
                await addDoc(collection(db, "skills"), {
                    userId: auth.currentUser.uid,
                    userEmail: auth.currentUser.email,
                    userName: userName,
                    offering,
                    seeking,
                    description,
                    createdAt: serverTimestamp()
                });
                alert("Signal broadcasted!");
            }

            resetPostForm();
            toggleModal(false);
        } catch (error) {
            console.error("Error posting skill:", error);
            alert("Failed to broadcast signal.");
        }
    });
}

// Edit Listing Listener
window.addEventListener('edit-listing', (e) => {
    const skill = e.detail;
    if (!skill) return;

    editingSkillId = skill.id;

    // Populate form
    document.getElementById('skill-offer').value = skill.offering;
    document.getElementById('skill-seek').value = skill.seeking;
    document.getElementById('skill-desc').value = skill.description || '';

    // Update Modal UI
    const submitBtn = postForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.textContent = "UPDATE SIGNAL";

    const modalTitle = document.querySelector('#post-modal h3');
    if (modalTitle) modalTitle.textContent = "Update Signal";

    toggleListingModal(false); // Close detail modal
    toggleModal(true); // Open post modal
});

// Load Skills
const q = query(collection(db, "skills"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
    allSkills = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderSkills(allSkills);
    updateMyListings(); // Update my listings if view is active
});

// Send Connection Request
async function sendConnectionRequest(targetUserId, targetUserName, skillName) {
    if (!auth.currentUser) return;

    // 1. Check if chat already exists
    // We can't easily check all chats without querying. 
    // But we can check if we already have a request pending.

    const q = query(
        collection(db, "requests"),
        where("fromUserId", "==", auth.currentUser.uid),
        where("toUserId", "==", targetUserId),
        where("status", "==", "pending")
    );

    const snap = await getDocs(q);
    if (!snap.empty) {
        alert("You already have a pending request with this user.");
        return;
    }

    try {
        await addDoc(collection(db, "requests"), {
            fromUserId: auth.currentUser.uid,
            fromUserName: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
            toUserId: targetUserId,
            toUserName: targetUserName,
            skillName: skillName,
            status: 'pending',
            timestamp: serverTimestamp()
        });
        alert("Connection request sent!");
    } catch (error) {
        console.error("Error sending request:", error);
        alert("Failed to send request.");
    }
}

// Listen for Requests (Incoming)
function listenForRequests() {
    if (!auth.currentUser) return;

    const q = query(
        collection(db, "requests"),
        where("toUserId", "==", auth.currentUser.uid)
    );

    unsubscribeRequests = onSnapshot(q, (snapshot) => {
        let requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort client-side
        requests.sort((a, b) => {
            const timeA = a.timestamp ? a.timestamp.seconds : 0;
            const timeB = b.timestamp ? b.timestamp.seconds : 0;
            return timeB - timeA;
        });

        currentRequests = requests;
        window.currentRequests = requests; // Update global

        // Filter only pending for notifications
        const pendingRequests = requests.filter(r => r.status === 'pending');
        updateNotifications(window.allChats || [], pendingRequests, window.sentRequests || [], auth.currentUser.uid);

        // Render all requests in the view
        renderRequests(requests, window.sentRequests || []);
    });
}

// Listen for Sent Requests (Outgoing)
function listenForSentRequests() {
    if (!auth.currentUser) return;

    const q = query(
        collection(db, "requests"),
        where("fromUserId", "==", auth.currentUser.uid)
    );

    unsubscribeSentRequests = onSnapshot(q, (snapshot) => {
        let requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort client-side
        requests.sort((a, b) => {
            const timeA = a.timestamp ? a.timestamp.seconds : 0;
            const timeB = b.timestamp ? b.timestamp.seconds : 0;
            return timeB - timeA;
        });

        sentRequests = requests;
        window.sentRequests = requests; // Update global

        // Update notifications (to show accepted/rejected outcomes)
        updateNotifications(window.allChats || [], window.currentRequests || [], sentRequests, auth.currentUser.uid);

        renderRequests(window.currentRequests || [], requests);
    });
}

// Handle Request Action (Global)
window.handleRequestAction = async (requestId, action, fromUserId, fromUserName) => {
    try {
        if (action === 'accept') {
            await updateDoc(doc(db, "requests", requestId), {
                status: 'accepted',
                updatedAt: serverTimestamp()
            });
            // Start Chat
            await startChat(fromUserId, fromUserName);
            showView('messages');
        } else if (action === 'remove' || action === 'withdraw') {
            if (!confirm(`Are you sure you want to ${action} this connection request?`)) return;

            // 1. Fetch the request details BEFORE deleting it to identify the other user
            const reqSnap = await getDoc(doc(db, "requests", requestId));
            let otherUid = null;

            if (reqSnap.exists()) {
                const reqData = reqSnap.data();
                otherUid = reqData.fromUserId === auth.currentUser.uid ? reqData.toUserId : reqData.fromUserId;
            }

            // 2. Delete the request
            await deleteDoc(doc(db, "requests", requestId));

            // 3. Delete the chat if it exists
            if (otherUid && window.allChats) {
                const chat = window.allChats.find(c => c.participants.includes(otherUid));
                if (chat) {
                    await deleteDoc(doc(db, "chats", chat.id));
                }
            }
        } else {
            await updateDoc(doc(db, "requests", requestId), {
                status: 'rejected',
                updatedAt: serverTimestamp()
            });
        }
    } catch (error) {
        console.error("Error handling request:", error);
        alert("Action failed.");
    }
};

// Start Chat
async function startChat(targetUserId, targetUserName) {
    if (!auth.currentUser) return;

    // Check if chat already exists (client-side check from loaded chats)
    const existingChat = window.allChats ? window.allChats.find(c => c.participants.includes(targetUserId)) : null;

    if (existingChat) {
        // Chat exists, open it
        currentChatId = existingChat.id;
        window.currentChatId = existingChat.id;
        updateChatHeader(targetUserName);
        loadMessages(existingChat.id);
        showView('messages');
    } else {
        // Create new chat
        try {
            const chatRef = await addDoc(collection(db, "chats"), {
                participants: [auth.currentUser.uid, targetUserId],
                participantNames: {
                    [auth.currentUser.uid]: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
                    [targetUserId]: targetUserName
                },
                participantEmails: {
                    [auth.currentUser.uid]: auth.currentUser.email,
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastMessage: '',
                lastSenderId: ''
            });

            currentChatId = chatRef.id;
            window.currentChatId = chatRef.id;
            updateChatHeader(targetUserName);
            loadMessages(chatRef.id);
            showView('messages');
        } catch (error) {
            console.error("Error creating chat:", error);
        }
    }
}
window.startChat = startChat;

// Load Chats
function loadChats() {
    if (!auth.currentUser) return;

    const q = query(
        collection(db, "chats"),
        where("participants", "array-contains", auth.currentUser.uid)
    );

    unsubscribeChats = onSnapshot(q, (snapshot) => {
        let chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort client-side
        chats.sort((a, b) => {
            const timeA = a.updatedAt ? a.updatedAt.seconds : 0;
            const timeB = b.updatedAt ? b.updatedAt.seconds : 0;
            return timeB - timeA;
        });

        window.allChats = chats; // Store globally
        renderChatList(chats, auth.currentUser.uid, (chatId, email, name) => {
            currentChatId = chatId;
            window.currentChatId = chatId;
            updateChatHeader(name);
            loadMessages(chatId);
        });

        // Update notifications with chats (and current requests if any)
        updateNotifications(chats, currentRequests, window.sentRequests || [], auth.currentUser.uid);

    }, (error) => {
        console.error("Error loading chats:", error);
    });
}

// Load Messages
function loadMessages(chatId) {
    if (unsubscribeMessages) unsubscribeMessages();

    const q = query(
        collection(db, "chats", chatId, "messages"),
        orderBy("createdAt", "asc")
    );

    unsubscribeMessages = onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => doc.data());
        renderMessages(messages, auth.currentUser.uid);
    });
}

// Send Message
async function sendMessage(text) {
    if (!currentChatId || !auth.currentUser) return;

    try {
        await addDoc(collection(db, "chats", currentChatId, "messages"), {
            text,
            senderId: auth.currentUser.uid,
            createdAt: serverTimestamp()
        });

        await updateDoc(doc(db, "chats", currentChatId), {
            lastMessage: text,
            lastSenderId: auth.currentUser.uid,
            updatedAt: serverTimestamp()
        });

        chatInput.value = '';
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

// Delete Chat
window.deleteChat = async function (chatId) {
    if (!confirm("Are you sure you want to delete this conversation? This action cannot be undone.")) return;

    try {
        // 1. Delete all messages in the subcollection
        const messagesRef = collection(db, "chats", chatId, "messages");
        const messagesSnap = await getDocs(messagesRef);

        const deletePromises = messagesSnap.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        // 2. Delete the chat document itself
        await deleteDoc(doc(db, "chats", chatId));

        // If the deleted chat was the active one, clear the view
        if (currentChatId === chatId) {
            currentChatId = null;
            window.currentChatId = null;
            updateChatHeader('Select a Chat');
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                chatMessages.innerHTML = `
                    <div class="h-full flex items-center justify-center text-gray-400">
                        <p>Select a conversation to start messaging</p>
                    </div>
                `;
            }
            if (unsubscribeMessages) {
                unsubscribeMessages();
                unsubscribeMessages = null;
            }
        }
    } catch (error) {
        console.error("Error deleting chat:", error);
        alert("Failed to delete chat.");
    }
}

// Contact User
if (contactUserBtn) {
    contactUserBtn.addEventListener('click', () => {
        const targetUserId = contactUserBtn.dataset.userId;
        const targetUserEmail = contactUserBtn.dataset.userEmail;
        const targetUserName = contactUserBtn.dataset.userName || targetUserEmail.split('@')[0];
        const skillOffering = document.getElementById('detail-offering').textContent;

        if (auth.currentUser && auth.currentUser.uid === targetUserId) {
            alert("You cannot message yourself!");
            return;
        }

        toggleListingModal(false);

        if (contactUserBtn.dataset.action === 'message') {
            startChat(targetUserId, targetUserName);
        } else {
            // Use connection request flow
            sendConnectionRequest(targetUserId, targetUserName, skillOffering);
        }
    });
}

// Chat Listeners
if (chatSendBtn) {
    chatSendBtn.addEventListener('click', () => {
        console.log("Send button clicked");
        const text = chatInput.value.trim();
        if (text) sendMessage(text);
    });
} else {
    console.error("chatSendBtn not found");
}

// Open Chat Event (from Notifications)
window.addEventListener('open-chat', (e) => {
    const chatId = e.detail.chatId;
    if (chatId) {
        showView('messages');
        // We need to find the chat details to update header
        // Since we have allChats, we can find it
        if (window.allChats) {
            const chat = window.allChats.find(c => c.id === chatId);
            if (chat) {
                const otherUserId = chat.participants.find(uid => uid !== auth.currentUser.uid);
                const otherUserName = (chat.participantNames && chat.participantNames[otherUserId]) || 'User';

                currentChatId = chatId;
                window.currentChatId = chatId;
                updateChatHeader(otherUserName);
                loadMessages(chatId);
            }
        }
    }
});

// Notifications
const navNotifications = document.getElementById('nav-notifications');
if (navNotifications) {
    navNotifications.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById('notification-dropdown');
        const isHidden = dropdown.classList.contains('hidden');
        toggleNotifications(isHidden);
    });
}

// Close notifications on outside click
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown && !dropdown.classList.contains('hidden') && !e.target.closest('#nav-notifications') && !e.target.closest('#notification-dropdown')) {
        toggleNotifications(false);
    }
});

// Expose deleteSkill to window so the onclick in ui.js works (easiest fix for now)
// Expose deleteSkill to window so the onclick in ui.js works (easiest fix for now)
window.deleteSkill = async (id) => {
    if (!confirm("Are you sure you want to delete this transmission?")) return;

    try {
        // 1. Get the skill details to find associated requests
        const skillDoc = await getDoc(doc(db, "skills", id));
        if (!skillDoc.exists()) {
            // Just delete if not found (maybe already deleted)
            await deleteDoc(doc(db, "skills", id));
            return;
        }

        const skillData = skillDoc.data();
        const skillName = skillData.offering;

        // 2. Find pending requests for this skill
        // We look for requests where toUserId is current user (owner of skill) and skillName matches
        const q = query(
            collection(db, "requests"),
            where("toUserId", "==", auth.currentUser.uid),
            where("skillName", "==", skillName),
            where("status", "==", "pending")
        );

        const requestSnap = await getDocs(q);

        // 3. Delete associated pending requests
        const deletePromises = requestSnap.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        // 4. Delete the skill
        await deleteDoc(doc(db, "skills", id));

        // The snapshot listener will automatically update the UI
    } catch (error) {
        console.error("Error deleting skill:", error);
        alert("Failed to delete.");
    }
};
