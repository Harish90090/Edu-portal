// Chat functionality with enhanced debugging
const Chat = {
    socket: null,
    currentChatUser: null,
    unreadMessagesCount: 0,
    isTyping: false,
    typingTimeout: null,
    isInitialized: false,

    init: function() {
        console.log('🔧 Chat.init() called');
        
        const currentUser = Utils.getCurrentUser();
        if (!currentUser) {
            console.error('❌ No user found for chat initialization');
            return;
        }

        console.log('👤 Current user:', currentUser.email);
        
        try {
            this.connectSocket();
            this.bindEvents();
            this.showFloatingChatButton();
            this.isInitialized = true;
            console.log('✅ Chat system initialized successfully');
        } catch (error) {
            console.error('❌ Chat initialization failed:', error);
        }
    },

    connectSocket: function() {
        console.log('🔌 Attempting socket connection...');
        
        const currentUser = Utils.getCurrentUser();
        if (!currentUser) {
            console.error('❌ No user for socket connection');
            return;
        }

        try {
            // Check if Socket.IO is available
            if (typeof io === 'undefined') {
                console.error('❌ Socket.IO library not loaded');
                Utils.showToast('Error', 'Chat library not loaded. Please refresh the page.', 'danger');
                return;
            }

            console.log('🌐 Connecting to: http://localhost:5000');
            this.socket = io('http://localhost:5000', {
                transports: ['websocket', 'polling'],
                timeout: 10000
            });

            // Socket event listeners with detailed logging
            this.socket.on('connect', () => {
                console.log('✅ Socket.IO Connected successfully');
                console.log('📡 Socket ID:', this.socket.id);
                Utils.showToast('Success', 'Chat connected', 'success');
                
                // Join user room after connection
                this.socket.emit('user_join', currentUser.id);
                console.log('🚪 Joined user room:', currentUser.id);
            });

            this.socket.on('disconnect', (reason) => {
                console.log('❌ Socket disconnected. Reason:', reason);
                Utils.showToast('Warning', 'Chat disconnected', 'warning');
            });

            this.socket.on('connect_error', (error) => {
                console.error('❌ Socket connection error:', error);
                console.error('Error details:', error.message);
                Utils.showToast('Error', `Chat connection failed: ${error.message}`, 'danger');
            });

            this.socket.on('receive_message', this.handleReceiveMessage.bind(this));
            this.socket.on('message_sent', this.handleMessageSent.bind(this));
            this.socket.on('user_status_update', this.handleUserStatusUpdate.bind(this));
            this.socket.on('user_typing', this.handleUserTyping.bind(this));

            console.log('🔧 Socket event listeners registered');

        } catch (error) {
            console.error('❌ Socket connection exception:', error);
            Utils.showToast('Error', 'Failed to initialize chat connection', 'danger');
        }
    },

    showFloatingChatButton: function() {
        const floatingChatBtn = document.getElementById('floatingChatBtn');
        if (floatingChatBtn) {
            floatingChatBtn.classList.remove('hidden');
            console.log('🔄 Floating chat button shown');
        } else {
            console.error('❌ Floating chat button element not found');
        }
    },

    openChatModal: function() {
        console.log('🎯 Chat.openChatModal() called');
        console.log('📊 Chat state:', {
            initialized: this.isInitialized,
            socket: this.socket ? 'exists' : 'null',
            connected: this.socket?.connected ? 'yes' : 'no'
        });

        // Check if user is logged in
        const currentUser = Utils.getCurrentUser();
        if (!currentUser) {
            console.error('❌ No user logged in');
            Utils.showToast('Error', 'Please login to use chat', 'danger');
            return false;
        }

        // Check if Bootstrap is available
        if (typeof bootstrap === 'undefined') {
            console.error('❌ Bootstrap not loaded');
            Utils.showToast('Error', 'UI library not loaded', 'danger');
            return false;
        }

        // Get chat modal element
        const chatModalElement = document.getElementById('chatModal');
        if (!chatModalElement) {
            console.error('❌ Chat modal element not found in DOM');
            Utils.showToast('Error', 'Chat interface not found', 'danger');
            return false;
        }

        console.log('✅ Chat modal element found');

        try {
            // Set modal titles based on user type
            const chatUserType = currentUser.type === 'student' ? 'Teachers' : 'Students';
            const contactsTitle = currentUser.type === 'student' ? 'Teacher' : 'Student';
            
            document.getElementById('chatUserType').textContent = chatUserType;
            document.getElementById('contactsTitle').textContent = contactsTitle;

            console.log('📝 Modal titles set for:', chatUserType);

            // Create Bootstrap modal instance
            const chatModal = new bootstrap.Modal(chatModalElement, {
                backdrop: true,
                keyboard: true,
                focus: true
            });

            console.log('🔧 Bootstrap modal instance created');

            // Load contacts before showing modal
            this.loadContacts();
            this.resetChatUI();

            // Show the modal
            chatModal.show();
            console.log('✅ Chat modal shown successfully');

            // Focus on input when modal is fully shown
            chatModalElement.addEventListener('shown.bs.modal', () => {
                console.log('🎉 Chat modal fully shown and ready');
                document.getElementById('messageInput')?.focus();
            });

            return true;

        } catch (error) {
            console.error('❌ Error opening chat modal:', error);
            console.error('Error stack:', error.stack);
            Utils.showToast('Error', `Failed to open chat: ${error.message}`, 'danger');
            return false;
        }
    },

    resetChatUI: function() {
        console.log('🔄 Resetting chat UI');
        
        this.currentChatUser = null;
        
        // Reset all UI elements with null checks
        const elements = {
            'currentChatUser': document.getElementById('currentChatUser'),
            'userStatus': document.getElementById('userStatus'),
            'messageInput': document.getElementById('messageInput'),
            'sendMessageBtn': document.getElementById('sendMessageBtn'),
            'chatActions': document.getElementById('chatActions'),
            'noMessagesText': document.getElementById('noMessagesText'),
            'messagesContainer': document.getElementById('messagesContainer')
        };

        Object.entries(elements).forEach(([name, element]) => {
            if (element) {
                switch(name) {
                    case 'currentChatUser':
                        element.textContent = 'Select a contact to start chatting';
                        break;
                    case 'userStatus':
                        element.textContent = 'Offline';
                        element.className = 'text-muted';
                        break;
                    case 'messageInput':
                        element.disabled = true;
                        element.value = '';
                        break;
                    case 'sendMessageBtn':
                        element.disabled = true;
                        break;
                    case 'chatActions':
                        element.classList.add('hidden');
                        break;
                    case 'noMessagesText':
                        element.style.display = 'block';
                        break;
                    case 'messagesContainer':
                        element.innerHTML = '';
                        break;
                }
                console.log(`✅ Reset ${name} element`);
            } else {
                console.error(`❌ ${name} element not found`);
            }
        });

        this.clearTypingIndicator();
    },

    bindEvents: function() {
        console.log('🔗 Binding chat events...');

        // Send message button
        const sendMessageBtn = document.getElementById('sendMessageBtn');
        if (sendMessageBtn) {
            sendMessageBtn.addEventListener('click', this.sendMessage.bind(this));
            console.log('✅ Send message button event bound');
        } else {
            console.error('❌ Send message button not found');
        }

        // Message input enter key
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
            console.log('✅ Message input events bound');
        } else {
            console.error('❌ Message input not found');
        }

        console.log('🔗 All chat events bound successfully');
    },

    loadContacts: async function() {
        console.log('📞 Loading contacts...');
        
        try {
            const currentUser = Utils.getCurrentUser();
            if (!currentUser) {
                throw new Error('No user logged in');
            }

            const contactsList = document.getElementById('contactsList');
            if (!contactsList) {
                throw new Error('Contacts list element not found');
            }
            
            // Show loading state
            contactsList.innerHTML = `
                <div class="text-center p-4">
                    <div class="loading-spinner"></div>
                    <p class="mt-2 text-muted">Loading contacts...</p>
                </div>
            `;

            console.log('🌐 Fetching contacts from API...');
            const response = await fetch(`${Utils.API_BASE_URL}/chat/contacts/${currentUser.id}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📨 API response:', data);
            
            if (data.success) {
                console.log(`✅ Loaded ${data.contacts?.length || 0} contacts`);
                this.displayContacts(data.contacts);
            } else {
                throw new Error(data.message || 'Failed to load contacts');
            }
        } catch (error) {
            console.error('❌ Error loading contacts:', error);
            const contactsList = document.getElementById('contactsList');
            if (contactsList) {
                contactsList.innerHTML = `
                    <div class="text-center p-4 text-danger">
                        <i class="fas fa-exclamation-triangle mb-2"></i>
                        <p>Failed to load contacts</p>
                        <small>${error.message}</small>
                    </div>
                `;
            }
        }
    },

    displayContacts: function(contacts) {
        console.log('🎨 Displaying contacts:', contacts);
        
        const contactsList = document.getElementById('contactsList');
        if (!contactsList) {
            console.error('❌ Contacts list container not found');
            return;
        }
        
        if (!Array.isArray(contacts) || contacts.length === 0) {
            contactsList.innerHTML = `
                <div class="text-center p-4 text-muted">
                    <i class="fas fa-users mb-2"></i>
                    <p>No contacts available</p>
                </div>
            `;
            console.log('ℹ️ No contacts to display');
            return;
        }
        
        contactsList.innerHTML = contacts.map(contact => {
            if (!contact || typeof contact !== 'object') return '';
            
            const isActive = this.currentChatUser && this.currentChatUser._id === contact._id;
            const statusColor = contact.isOnline ? 'contact-online' : 'contact-offline';
            const statusText = contact.isOnline ? 'Online' : `Last seen ${Utils.formatMessageTime(contact.lastSeen)}`;
            const identifier = contact.studentId || contact.teacherId;
            
            return `
                <button class="contact-item ${isActive ? 'active' : ''} ${contact.unreadCount > 0 ? 'unread-highlight' : ''}" 
                        data-user-id="${contact._id}" onclick="Chat.selectContact('${contact._id}')">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1 text-start">
                            <h6 class="mb-1">${this.escapeHtml(contact.firstName)} ${this.escapeHtml(contact.lastName)}</h6>
                            <small class="text-muted">${this.escapeHtml(contact.email)}</small>
                            ${identifier ? `<small class="text-muted d-block">ID: ${this.escapeHtml(identifier)}</small>` : ''}
                            <div class="d-flex align-items-center mt-1">
                                <i class="fas fa-circle ${statusColor} me-1" style="font-size: 8px;"></i>
                                <small class="${statusColor}">${statusText}</small>
                            </div>
                        </div>
                        ${contact.unreadCount > 0 ? `
                            <span class="badge bg-danger rounded-pill">${contact.unreadCount}</span>
                        ` : ''}
                    </div>
                    ${contact.lastMessage ? `
                        <small class="text-muted d-block mt-2 text-truncate">
                            ${this.escapeHtml(contact.lastMessage)}
                        </small>
                    ` : ''}
                </button>
            `;
        }).join('');
        
        console.log(`✅ Displayed ${contacts.length} contacts`);
    },

    selectContact: async function(userId) {
        console.log('👆 Selecting contact:', userId);
        
        try {
            const currentUser = Utils.getCurrentUser();
            if (!currentUser) {
                throw new Error('Please login first');
            }

            const response = await fetch(`${Utils.API_BASE_URL}/chat/contacts/${currentUser.id}`);
            const data = await response.json();
            
            if (data.success) {
                const contact = data.contacts.find(c => c._id === userId);
                if (contact) {
                    this.currentChatUser = contact;
                    this.updateChatHeader(contact);
                    this.loadMessages(contact._id);
                    
                    console.log('✅ Contact selected:', contact.firstName);
                    
                    // Mark messages as read
                    if (this.socket) {
                        this.socket.emit('mark_messages_read', {
                            userId: currentUser.id,
                            otherUserId: contact._id
                        });
                    }
                    
                    // Reload contacts to update unread counts
                    this.loadContacts();
                } else {
                    throw new Error('Contact not found');
                }
            } else {
                throw new Error(data.message || 'Failed to select contact');
            }
        } catch (error) {
            console.error('❌ Error selecting contact:', error);
            Utils.showToast('Error', 'Failed to select contact', 'danger');
        }
    },

    updateChatHeader: function(contact) {
        console.log('📝 Updating chat header for:', contact.firstName);
        
        const elements = {
            'currentChatUser': document.getElementById('currentChatUser'),
            'userStatus': document.getElementById('userStatus'),
            'messageInput': document.getElementById('messageInput'),
            'sendMessageBtn': document.getElementById('sendMessageBtn'),
            'chatActions': document.getElementById('chatActions')
        };

        if (elements.currentChatUser) {
            elements.currentChatUser.textContent = `${contact.firstName} ${contact.lastName}`;
        }
        
        if (elements.userStatus) {
            elements.userStatus.textContent = contact.isOnline ? 'Online' : `Last seen ${Utils.formatMessageTime(contact.lastSeen)}`;
            elements.userStatus.className = contact.isOnline ? 'contact-online' : 'contact-offline';
        }
        
        if (elements.chatActions) elements.chatActions.classList.remove('hidden');
        if (elements.messageInput) {
            elements.messageInput.disabled = false;
            elements.messageInput.focus();
        }
        if (elements.sendMessageBtn) elements.sendMessageBtn.disabled = false;
        
        console.log('✅ Chat header updated');
    },

    sendMessage: function() {
        console.log('📤 Attempting to send message...');
        
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) {
            console.error('❌ Message input not found');
            return;
        }

        const message = messageInput.value.trim();
        
        if (!message) {
            console.log('ℹ️ No message to send');
            return;
        }

        if (!this.currentChatUser) {
            console.error('❌ No contact selected');
            Utils.showToast('Warning', 'Please select a contact first', 'warning');
            return;
        }

        if (!this.socket || !this.socket.connected) {
            console.error('❌ Socket not connected');
            Utils.showToast('Error', 'Chat not connected. Please try again.', 'danger');
            return;
        }
        
        const currentUser = Utils.getCurrentUser();
        if (!currentUser) {
            console.error('❌ No user logged in');
            return;
        }

        console.log('📨 Sending message to:', this.currentChatUser.firstName);
        
        this.socket.emit('send_message', {
            senderId: currentUser.id,
            receiverId: this.currentChatUser._id,
            message: message
        });
        
        messageInput.value = '';
        console.log('✅ Message sent (awaiting confirmation)');
    },

    handleReceiveMessage: function(message) {
        console.log('📩 Message received:', message);
        const currentUser = Utils.getCurrentUser();
        
        if (this.currentChatUser && message.sender._id === this.currentChatUser._id) {
            this.displayMessage(message);
            this.scrollToBottom();
            
            if (this.socket && currentUser) {
                this.socket.emit('mark_messages_read', {
                    userId: currentUser.id,
                    otherUserId: this.currentChatUser._id
                });
            }
        } else {
            this.unreadMessagesCount++;
            this.updateNotificationBadge();
            Utils.playNotificationSound();
            Utils.showToast('New Message', `New message from ${message.sender.firstName}`, 'info');
        }
        
        this.loadContacts();
    },

    handleMessageSent: function(message) {
        console.log('✅ Message sent confirmation received:', message);
        this.displayMessage(message);
        this.scrollToBottom();
    },

    handleUserStatusUpdate: function(data) {
        console.log('🔄 User status update:', data);
        this.loadContacts();
    },

    handleUserTyping: function(data) {
        console.log('⌨️ Typing indicator:', data);
        this.showTypingIndicator(data.userId, data.isTyping);
    },

    loadMessages: async function(otherUserId) {
        console.log('📚 Loading messages for user:', otherUserId);
        
        try {
            const currentUser = Utils.getCurrentUser();
            const messagesContainer = document.getElementById('messagesContainer');
            
            if (!messagesContainer) {
                throw new Error('Messages container not found');
            }
            
            messagesContainer.innerHTML = `
                <div class="text-center p-4">
                    <div class="loading-spinner"></div>
                    <p class="mt-2 text-muted">Loading messages...</p>
                </div>
            `;
            
            const response = await fetch(`${Utils.API_BASE_URL}/chat/messages/${currentUser.id}/${otherUserId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                console.log(`✅ Loaded ${data.messages?.length || 0} messages`);
                this.displayMessages(data.messages);
            } else {
                throw new Error(data.message || 'Failed to load messages');
            }
        } catch (error) {
            console.error('❌ Error loading messages:', error);
            const messagesContainer = document.getElementById('messagesContainer');
            if (messagesContainer) {
                messagesContainer.innerHTML = `
                    <div class="text-center p-4 text-danger">
                        <i class="fas fa-exclamation-triangle mb-2"></i>
                        <p>Failed to load messages</p>
                    </div>
                `;
            }
        }
    },

    displayMessages: function(messages) {
        console.log('🎨 Displaying messages:', messages?.length);
        
        const messagesContainer = document.getElementById('messagesContainer');
        const noMessagesText = document.getElementById('noMessagesText');
        
        if (!messagesContainer) return;
        
        if (!Array.isArray(messages) || messages.length === 0) {
            if (noMessagesText) noMessagesText.style.display = 'block';
            messagesContainer.innerHTML = '';
            console.log('ℹ️ No messages to display');
            return;
        }
        
        if (noMessagesText) noMessagesText.style.display = 'none';
        messagesContainer.innerHTML = '';
        
        messages.forEach(message => {
            this.displayMessage(message);
        });
        
        this.scrollToBottom();
        console.log(`✅ Displayed ${messages.length} messages`);
    },

    displayMessage: function(message) {
        const messagesContainer = document.getElementById('messagesContainer');
        const currentUser = Utils.getCurrentUser();
        
        if (!messagesContainer || !currentUser) return;
        
        const isOwnMessage = message.sender._id === currentUser.id;
        
        const messageElement = document.createElement('div');
        messageElement.className = `d-flex mb-3 ${isOwnMessage ? 'justify-content-end' : 'justify-content-start'}`;
        messageElement.innerHTML = `
            <div class="message-bubble ${isOwnMessage ? 'bg-primary text-white' : 'bg-light'} rounded p-3" 
                 style="max-width: 70%;">
                ${!isOwnMessage ? `<small class="text-muted d-block">${this.escapeHtml(message.sender.firstName)}</small>` : ''}
                <div class="message-content">${this.escapeHtml(message.message)}</div>
                <small class="message-time ${isOwnMessage ? 'text-white-50' : 'text-muted'} d-block mt-1">
                    ${Utils.formatMessageTime(message.timestamp)}
                    ${message.read && isOwnMessage ? ' ✓✓' : isOwnMessage ? ' ✓' : ''}
                </small>
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
    },

    scrollToBottom: function() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }
    },

    showTypingIndicator: function(userId, isTyping) {
        console.log('⌨️ Showing typing indicator:', { userId, isTyping });
        
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;
        
        const typingIndicator = document.getElementById('typingIndicator');
        
        if (isTyping) {
            if (!typingIndicator) {
                const indicator = document.createElement('div');
                indicator.id = 'typingIndicator';
                indicator.className = 'typing-indicator';
                indicator.innerHTML = `
                    <span>${this.currentChatUser?.firstName || 'User'} is typing</span>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                `;
                messagesContainer.appendChild(indicator);
            }
        } else {
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }
        
        this.scrollToBottom();
    },

    clearTypingIndicator: function() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    },

    updateNotificationBadge: function() {
        const chatNotification = document.getElementById('chatNotification');
        const floatingChatBtn = document.getElementById('floatingChatBtn');
        
        if (this.unreadMessagesCount > 0) {
            if (chatNotification) {
                chatNotification.textContent = this.unreadMessagesCount > 99 ? '99+' : this.unreadMessagesCount;
                chatNotification.classList.remove('hidden');
            }
            if (floatingChatBtn) {
                floatingChatBtn.classList.add('pulse');
            }
        } else {
            if (chatNotification) chatNotification.classList.add('hidden');
            if (floatingChatBtn) floatingChatBtn.classList.remove('pulse');
        }
    },

    escapeHtml: function(text) {
        if (text === null || text === undefined) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }
};