// Dashboard functionality
const Dashboard = {
    init: function() {
        console.log('📊 Dashboard Initializing...');
        this.loadDashboardContent();
        this.bindEvents();
    },

    loadDashboardContent: function() {
        const dashboardSection = document.getElementById('dashboardSection');
        const currentUser = Utils.getCurrentUser();

        if (!dashboardSection) {
            console.error('Dashboard section element not found');
            return;
        }

        if (!currentUser) {
            console.error('No current user found for dashboard');
            Utils.showToast('Error', 'Please login to access dashboard', 'danger');
            return;
        }

        console.log('Loading dashboard content for user:', currentUser.email);
        
        // Create dashboard HTML structure
        dashboardSection.innerHTML = `
            <div class="welcome-banner">
                <h2>Welcome, <span id="userName">${this.escapeHtml(currentUser.firstName)} ${this.escapeHtml(currentUser.lastName)}</span>!</h2>
                <p>You are logged in as a <span id="userRole" class="text-capitalize">${this.escapeHtml(currentUser.type)}</span></p>
                <small>Registered on: <span id="registrationDate">${this.escapeHtml(Utils.formatDate(currentUser.registrationDate))}</span></small>
                <div class="mt-3">
                    <button class="btn btn-light me-2" onclick="Dashboard.openChat()">
                        <i class="fas fa-comments me-2"></i>Open Chat
                    </button>
                    <button class="btn btn-outline-light" onclick="Dashboard.loadChatSessions()">
                        <i class="fas fa-history me-2"></i>Chat History
                    </button>
                    <button class="btn btn-outline-light ms-2" onclick="Dashboard.refreshUsers()">
                        <i class="fas fa-sync-alt me-2"></i>Refresh
                    </button>
                </div>
            </div>
            
            <div class="dashboard-section">
                <h3 class="section-title">Registered Users</h3>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header bg-warning text-white d-flex justify-content-between align-items-center">
                                <h4 class="mb-0"><i class="fas fa-chalkboard-teacher me-2"></i>Teachers</h4>
                                <div>
                                    <span class="badge bg-light text-dark" id="teachersCount">0</span>
                                    <span class="badge bg-success ms-1" id="teachersOnline">0 online</span>
                                </div>
                            </div>
                            <div class="card-body">
                                <div id="teachersList">
                                    <div class="text-center py-4">
                                        <div class="loading-spinner"></div>
                                        <p class="mt-2 text-muted">Loading teachers...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                                <h4 class="mb-0"><i class="fas fa-user-graduate me-2"></i>Students</h4>
                                <div>
                                    <span class="badge bg-light text-dark" id="studentsCount">0</span>
                                    <span class="badge bg-success ms-1" id="studentsOnline">0 online</span>
                                </div>
                            </div>
                            <div class="card-body">
                                <div id="studentsList">
                                    <div class="text-center py-4">
                                        <div class="loading-spinner"></div>
                                        <p class="mt-2 text-muted">Loading students...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Chat Sessions Section -->
            <div class="dashboard-section hidden" id="chatSessionsSection">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h3 class="section-title mb-0">Recent Conversations</h3>
                    <button class="btn btn-sm btn-outline-secondary" onclick="Dashboard.loadChatSessions()">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
                <div class="card">
                    <div class="card-body">
                        <div id="chatSessionsList">
                            <div class="text-center py-4">
                                <div class="loading-spinner"></div>
                                <p class="mt-2 text-muted">Loading conversations...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Load users data
        this.loadUsers();
        
        console.log('Dashboard content loaded successfully');
    },

    bindEvents: function() {
        console.log('Binding dashboard events...');
        // Add any dashboard-specific event bindings here
        // Currently no specific events needed beyond what's in HTML onclick handlers
    },

    openChat: function() {
        console.log('Opening chat from dashboard...');
        
        if (typeof Chat === 'undefined') {
            console.error('Chat module not available');
            Utils.showToast('Error', 'Chat system not available. Please refresh the page.', 'danger');
            return;
        }

        if (typeof Chat.openChatModal !== 'function') {
            console.error('Chat.openChatModal function not found');
            Utils.showToast('Error', 'Chat feature not functioning properly', 'danger');
            return;
        }

        // Ensure chat is initialized before opening
        if (!Chat.socket) {
            console.log('Chat not initialized, initializing now...');
            Chat.init();
            
            // Wait a bit for initialization then open modal
            setTimeout(() => {
                Chat.openChatModal();
            }, 500);
        } else {
            Chat.openChatModal();
        }
    },

    refreshUsers: function() {
        console.log('Refreshing users list...');
        Utils.showToast('Info', 'Refreshing users...', 'info');
        this.loadUsers();
    },

    loadUsers: async function() {
        console.log('Loading users from API...');
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                Utils.showToast('Error', 'Authentication required. Please login again.', 'danger');
                return;
            }

            // Show loading state in user lists
            this.showLoadingState();

            const response = await fetch(`${Utils.API_BASE_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                console.log('Users loaded successfully:', data.users.length, 'users found');
                this.displayUsers(data.users);
                Utils.showToast('Success', `Loaded ${data.users.length} users`, 'success');
            } else {
                console.error('API returned error:', data.message);
                Utils.showToast('Error', data.message || 'Failed to load users', 'danger');
                this.showErrorState();
            }
        } catch (error) {
            console.error('Error loading users:', error);
            Utils.showToast('Error', 'Failed to load users. Check your connection.', 'danger');
            this.showErrorState();
        }
    },

    showLoadingState: function() {
        const teachersList = document.getElementById('teachersList');
        const studentsList = document.getElementById('studentsList');
        
        if (teachersList) {
            teachersList.innerHTML = `
                <div class="text-center py-4">
                    <div class="loading-spinner"></div>
                    <p class="mt-2 text-muted">Loading teachers...</p>
                </div>
            `;
        }
        
        if (studentsList) {
            studentsList.innerHTML = `
                <div class="text-center py-4">
                    <div class="loading-spinner"></div>
                    <p class="mt-2 text-muted">Loading students...</p>
                </div>
            `;
        }
    },

    showErrorState: function() {
        const teachersList = document.getElementById('teachersList');
        const studentsList = document.getElementById('studentsList');
        
        if (teachersList) {
            teachersList.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-exclamation-triangle text-danger fa-2x mb-3"></i>
                    <p class="text-danger">Failed to load teachers</p>
                    <button class="btn btn-sm btn-outline-danger" onclick="Dashboard.loadUsers()">
                        <i class="fas fa-redo me-1"></i>Retry
                    </button>
                </div>
            `;
        }
        
        if (studentsList) {
            studentsList.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-exclamation-triangle text-danger fa-2x mb-3"></i>
                    <p class="text-danger">Failed to load students</p>
                    <button class="btn btn-sm btn-outline-danger" onclick="Dashboard.loadUsers()">
                        <i class="fas fa-redo me-1"></i>Retry
                    </button>
                </div>
            `;
        }
    },

    displayUsers: function(users) {
        if (!Array.isArray(users)) {
            console.error('Users data is not an array:', users);
            Utils.showToast('Error', 'Invalid users data received', 'danger');
            return;
        }

        const teachers = users.filter(u => u && u.type === 'teacher');
        const students = users.filter(u => u && u.type === 'student');

        // Update counts
        const teachersCountElement = document.getElementById('teachersCount');
        const studentsCountElement = document.getElementById('studentsCount');
        const teachersOnlineElement = document.getElementById('teachersOnline');
        const studentsOnlineElement = document.getElementById('studentsOnline');
        
        if (teachersCountElement) teachersCountElement.textContent = teachers.length.toString();
        if (studentsCountElement) studentsCountElement.textContent = students.length.toString();
        
        // Count online users
        const onlineTeachers = teachers.filter(t => t.isOnline).length;
        const onlineStudents = students.filter(s => s.isOnline).length;
        
        if (teachersOnlineElement) teachersOnlineElement.textContent = `${onlineTeachers} online`;
        if (studentsOnlineElement) studentsOnlineElement.textContent = `${onlineStudents} online`;

        console.log(`Displaying ${teachers.length} teachers (${onlineTeachers} online) and ${students.length} students (${onlineStudents} online)`);

        // Display user lists
        this.displayUserList('teachersList', teachers, 'teacher');
        this.displayUserList('studentsList', students, 'student');
    },

    displayUserList: function(containerId, users, type) {
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.error(`Container with id ${containerId} not found`);
            return;
        }

        if (!Array.isArray(users) || users.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-users text-muted fa-2x mb-3"></i>
                    <p class="text-muted">No ${type}s found</p>
                </div>
            `;
            return;
        }

        container.innerHTML = users.map(user => {
            if (!user || typeof user !== 'object') {
                return '';
            }

            const safeFirstName = this.escapeHtml(user.firstName || 'Unknown');
            const safeLastName = this.escapeHtml(user.lastName || 'User');
            const safeEmail = this.escapeHtml(user.email || 'No email');
            const safeStudentId = this.escapeHtml(user.studentId || '');
            const safeTeacherId = this.escapeHtml(user.teacherId || '');
            const safeDepartment = this.escapeHtml(user.department || '');
            const isOnline = Boolean(user.isOnline);
            const statusText = isOnline ? 'Online' : 'Offline';
            const statusClass = isOnline ? 'status-active' : 'status-pending';
            const lastSeen = user.lastSeen ? Utils.formatMessageTime(user.lastSeen) : '';

            return `
                <div class="card ${type}-card mb-3 user-card" data-user-id="${user._id}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <h6 class="mb-1">${safeFirstName} ${safeLastName}</h6>
                                <small class="text-muted">${safeEmail}</small>
                                <div class="mt-2">
                                    ${safeStudentId ? `<small class="text-muted"><strong>ID:</strong> ${safeStudentId}</small><br>` : ''}
                                    ${safeTeacherId ? `<small class="text-muted"><strong>ID:</strong> ${safeTeacherId}</small><br>` : ''}
                                    ${safeDepartment ? `<small class="text-muted"><strong>Dept:</strong> ${safeDepartment}</small>` : ''}
                                </div>
                                ${!isOnline && lastSeen ? `<small class="text-muted mt-1 d-block"><i>Last seen: ${lastSeen}</i></small>` : ''}
                            </div>
                            <div class="text-end">
                                <span class="status-badge ${statusClass}">
                                    <i class="fas fa-circle me-1" style="font-size: 8px;"></i>
                                    ${statusText}
                                </span>
                                ${type === 'student' ? `
                                    <button class="btn btn-sm btn-outline-primary mt-2" onclick="Dashboard.startChatWithUser('${user._id}')">
                                        <i class="fas fa-comment me-1"></i>Chat
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    startChatWithUser: function(userId) {
        console.log('Starting chat with user:', userId);
        this.openChatSession(userId);
    },

    loadChatSessions: async function() {
        console.log('Loading chat sessions...');
        
        try {
            const currentUser = Utils.getCurrentUser();
            if (!currentUser || !currentUser.id) {
                Utils.showToast('Error', 'User not found. Please login again.', 'danger');
                return;
            }

            const chatSessionsSection = document.getElementById('chatSessionsSection');
            const chatSessionsList = document.getElementById('chatSessionsList');

            if (!chatSessionsSection || !chatSessionsList) {
                console.error('Chat sessions elements not found');
                return;
            }

            // Show loading state
            Utils.showElement(chatSessionsSection);
            chatSessionsList.innerHTML = `
                <div class="text-center py-4">
                    <div class="loading-spinner"></div>
                    <p class="mt-2 text-muted">Loading conversations...</p>
                </div>
            `;

            const response = await fetch(`${Utils.API_BASE_URL}/chat/sessions/${currentUser.id}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && Array.isArray(data.sessions) && data.sessions.length > 0) {
                console.log('Chat sessions loaded:', data.sessions.length);
                this.displayChatSessions(data.sessions);
                Utils.showToast('Success', `Loaded ${data.sessions.length} conversations`, 'success');
            } else {
                chatSessionsList.innerHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-comments text-muted fa-2x mb-3"></i>
                        <p class="text-muted">No conversations yet</p>
                        <small class="text-muted">Start a chat to see your conversations here</small>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading chat sessions:', error);
            const chatSessionsList = document.getElementById('chatSessionsList');
            if (chatSessionsList) {
                chatSessionsList.innerHTML = `
                    <div class="text-center py-4">
                        <i class="fas fa-exclamation-triangle text-danger fa-2x mb-3"></i>
                        <p class="text-danger">Failed to load conversations</p>
                        <button class="btn btn-sm btn-outline-danger" onclick="Dashboard.loadChatSessions()">
                            <i class="fas fa-redo me-1"></i>Retry
                        </button>
                    </div>
                `;
            }
            Utils.showToast('Error', 'Failed to load conversations', 'danger');
        }
    },

    displayChatSessions: function(sessions) {
        const chatSessionsList = document.getElementById('chatSessionsList');
        const currentUser = Utils.getCurrentUser();

        if (!chatSessionsList || !currentUser) {
            console.error('Required elements not found for displaying chat sessions');
            return;
        }

        if (!Array.isArray(sessions)) {
            chatSessionsList.innerHTML = '<p class="text-muted text-center">No conversations yet</p>';
            return;
        }

        chatSessionsList.innerHTML = sessions.map(session => {
            if (!session || typeof session !== 'object') {
                return '';
            }

            const otherUser = currentUser.type === 'student' ? session.teacher : session.student;
            
            if (!otherUser || typeof otherUser !== 'object') {
                return '';
            }

            const safeFirstName = this.escapeHtml(otherUser.firstName || 'Unknown');
            const safeLastName = this.escapeHtml(otherUser.lastName || 'User');
            const safeEmail = this.escapeHtml(otherUser.email || 'No email');
            const safeLastMessage = this.escapeHtml(session.lastMessage || 'No messages yet');
            const safeLastMessageTime = Utils.formatMessageTime(session.lastMessageTime);
            const unreadCount = Number(session.unreadCount) || 0;
            const otherUserId = String(otherUser._id || '');

            return `
                <div class="chat-session-item border-bottom p-3" style="cursor: pointer;" 
                     onclick="Dashboard.openChatSession('${this.escapeHtml(otherUserId)}')">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="mb-1">${safeFirstName} ${safeLastName}</h6>
                            <small class="text-muted">${safeEmail}</small>
                            <p class="mb-1 mt-2 text-truncate" title="${safeLastMessage}">
                                <i class="fas fa-comment text-muted me-1"></i>
                                ${safeLastMessage}
                            </p>
                        </div>
                        <div class="text-end">
                            <small class="text-muted d-block">${safeLastMessageTime}</small>
                            ${unreadCount > 0 ? `
                                <span class="badge bg-danger mt-1">${unreadCount} unread</span>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    openChatSession: function(otherUserId) {
        if (!otherUserId) {
            console.error('No user ID provided for chat session');
            Utils.showToast('Error', 'Cannot start chat: Invalid user', 'danger');
            return;
        }

        console.log('Opening chat session with user:', otherUserId);

        if (typeof Chat === 'undefined') {
            Utils.showToast('Error', 'Chat system not available', 'danger');
            return;
        }

        // Open chat modal
        this.openChat();
        
        // Wait for modal to open then select the contact
        setTimeout(() => {
            if (typeof Chat.selectContact === 'function') {
                // Try to select the contact directly
                Chat.selectContact(otherUserId);
            } else {
                // Fallback: wait for contacts to load and then find the right one
                setTimeout(() => {
                    const contactItems = document.querySelectorAll('.contact-item');
                    let contactFound = false;
                    
                    contactItems.forEach(item => {
                        const userId = item.getAttribute('data-user-id');
                        if (userId === otherUserId) {
                            item.click();
                            contactFound = true;
                        }
                    });
                    
                    if (!contactFound) {
                        console.log('Contact not immediately found, waiting for contacts to load...');
                        // If contact not found, wait a bit more and try again
                        setTimeout(() => {
                            const retryItems = document.querySelectorAll('.contact-item');
                            retryItems.forEach(item => {
                                const userId = item.getAttribute('data-user-id');
                                if (userId === otherUserId) {
                                    item.click();
                                }
                            });
                        }, 1500);
                    }
                }, 1000);
            }
        }, 800);
    },

    // Helper function to escape HTML to prevent XSS
    escapeHtml: function(text) {
        if (text === null || text === undefined) {
            return '';
        }
        
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }
};