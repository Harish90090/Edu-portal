const Utils = {
    API_BASE_URL: 'https://edu-portal-3.onrender.com',

    showElement: (element) => {
        if (element) element.classList.remove('hidden');
    },

    hideElement: (element) => {
        if (element) element.classList.add('hidden');
    },

    showToast: (title, message, type = 'info') => {
        const toastElement = document.getElementById('liveToast');
        const toastTitle = document.getElementById('toastTitle');
        const toastMessage = document.getElementById('toastMessage');
        
        if (!toastElement || !toastTitle || !toastMessage) return;

        toastTitle.textContent = title;
        toastMessage.textContent = message;
        
        toastElement.className = 'toast';
        
        const typeClasses = {
            success: 'bg-success text-white',
            danger: 'bg-danger text-white',
            warning: 'bg-warning text-dark',
            info: 'bg-info text-white'
        };
        
        toastElement.classList.add(...typeClasses[type].split(' '));
        
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    },

    setLoading: (button, isLoading, loadingText = 'Loading...') => {
        if (!button) return;
        
        const textElement = button.querySelector('.btn-text');
        const spinner = button.querySelector('.loading-spinner');
        
        if (isLoading) {
            button.disabled = true;
            if (textElement) textElement.textContent = loadingText;
            if (spinner) Utils.showElement(spinner);
        } else {
            button.disabled = false;
            if (textElement) textElement.textContent = button.getAttribute('data-original-text') || 'Submit';
            if (spinner) Utils.hideElement(spinner);
        }
    },

    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    },

    formatMessageTime: (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    },

    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    isLoggedIn: () => {
        const user = localStorage.getItem('currentUser');
        const token = localStorage.getItem('token');
        return !!(user && token);
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    clearUserData: () => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
    },

    playNotificationSound: () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio context not supported');
        }
    }
};
