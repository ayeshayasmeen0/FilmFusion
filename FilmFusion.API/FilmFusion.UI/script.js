// @ts-nocheck
const API_URL = 'https://localhost:7249/api';
let allMovies = [];
let currentMovieId = null;
let currentMovieData = null;

// ========== SINGLE STORAGE KEYS (Same as Admin) ==========
const STORAGE_KEYS = {
    MOVIES: 'filmfusion_movies',
    USERS: 'users',
    LIKES: 'likes',
    COMMENTS: 'comments',
    WATCHLIST: 'watchlist',
    FAVORITES: 'favorites'
};

// ========== INITIALIZE DEFAULT DATA (No Default Movies) ==========
function initializeDefaultData() {
    // Initialize movies - EMPTY initially, only admin can add
    if (!localStorage.getItem(STORAGE_KEYS.MOVIES)) {
        localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify([]));
        localStorage.setItem('cached_movies', JSON.stringify([]));
    }

    // Initialize users with admin
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        const defaultUsers = [
            { id: "admin_001", username: "Admin", email: "admin@filmfusion.com", password: "admin123", role: "Admin", isActive: true, createdAt: new Date().toISOString(), bio: "System Administrator", profilePicture: null },
            { id: "user_001", username: "Demo User", email: "demo@filmfusion.com", password: "demo123", role: "User", isActive: true, createdAt: new Date().toISOString(), bio: "Movie enthusiast", profilePicture: null }
        ];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
    }

    // Initialize empty collections
    if (!localStorage.getItem(STORAGE_KEYS.LIKES)) localStorage.setItem(STORAGE_KEYS.LIKES, '{}');
    if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) localStorage.setItem(STORAGE_KEYS.COMMENTS, '{}');
    if (!localStorage.getItem(STORAGE_KEYS.WATCHLIST)) localStorage.setItem(STORAGE_KEYS.WATCHLIST, '{}');
    if (!localStorage.getItem(STORAGE_KEYS.FAVORITES)) localStorage.setItem(STORAGE_KEYS.FAVORITES, '{}');
}

// ========== HELPER FUNCTIONS ==========
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type) {
    const existingToast = document.getElementById('toastMessage');
    if (existingToast) existingToast.remove();
    const toast = document.createElement('div');
    toast.id = 'toastMessage';
    toast.style.cssText = `
        position: fixed; bottom: 20px; right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3a86ff'};
        color: white; padding: 0.8rem 1.2rem; border-radius: 12px;
        font-size: 0.8rem; z-index: 9999; animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

// ========== MOVIE FUNCTIONS (Same as Admin) ==========
function getAllMovies() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MOVIES)) || [];
}

function getMovieById(id) {
    const movies = getAllMovies();
    return movies.find(m => m.id == id);
}

// ========== USER FUNCTIONS ==========
function getAllUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
}

function saveAllUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getCurrentUser() {
    const userId = localStorage.getItem('userId');
    if (!userId) return null;
    const users = getAllUsers();
    return users.find(u => u.id == userId);
}

// ========== USER'S FAVORITE FUNCTIONS (Fixed) ==========
function getUserFavorites() {
    const userId = localStorage.getItem('userId');
    if (!userId) return [];
    const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || {};
    return favorites[userId] || [];
}

function addToFavorites(movieId) {
    const userId = localStorage.getItem('userId');
    if (!userId) { showToast('Please login first', 'error'); return false; }

    let favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || {};
    if (!favorites[userId]) favorites[userId] = [];

    if (!favorites[userId].includes(movieId)) {
        favorites[userId].push(movieId);
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
        showToast('❤️ Added to favorites!', 'success');

        // Add to history
        const movie = getMovieById(movieId);
        if (movie) addToHistory('favorite', movie);
        return true;
    }
    return false;
}

function removeFromFavorites(movieId) {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    let favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || {};
    if (favorites[userId]) {
        favorites[userId] = favorites[userId].filter(id => id != movieId);
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
        showToast('Removed from favorites', 'success');
        if (typeof loadFavorites === 'function') loadFavorites();
    }
}

function isMovieFavorited(movieId) {
    const favorites = getUserFavorites();
    return favorites.includes(movieId);
}

// ========== USER'S WATCHLIST FUNCTIONS (Fixed) ==========
function getUserWatchlist() {
    const userId = localStorage.getItem('userId');
    if (!userId) return [];
    const watchlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST)) || {};
    return watchlist[userId] || [];
}

function addToWatchlist(movieId) {
    const userId = localStorage.getItem('userId');
    if (!userId) { showToast('Please login first', 'error'); return false; }

    let watchlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST)) || {};
    if (!watchlist[userId]) watchlist[userId] = [];

    if (!watchlist[userId].includes(movieId)) {
        watchlist[userId].push(movieId);
        localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
        showToast('📝 Added to watchlist!', 'success');

        // Add to history
        const movie = getMovieById(movieId);
        if (movie) addToHistory('watchlist', movie);
        return true;
    }
    return false;
}

function removeFromWatchlist(movieId) {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    let watchlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST)) || {};
    if (watchlist[userId]) {
        watchlist[userId] = watchlist[userId].filter(id => id != movieId);
        localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
        showToast('Removed from watchlist', 'success');
        if (typeof loadWatchlist === 'function') loadWatchlist();
    }
}

function isMovieInWatchlist(movieId) {
    const watchlist = getUserWatchlist();
    return watchlist.includes(movieId);
}

// ========== USER'S LIKES FUNCTIONS ==========
function getUserLikes() {
    const userId = localStorage.getItem('userId');
    if (!userId) return [];
    const likes = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKES)) || {};
    return likes[userId] || [];
}

function addToLikes(movieId) {
    const userId = localStorage.getItem('userId');
    if (!userId) { showToast('Please login first', 'error'); return false; }

    let likes = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKES)) || {};
    if (!likes[userId]) likes[userId] = [];

    // Remove from dislikes if present
    let dislikes = JSON.parse(localStorage.getItem(STORAGE_KEYS.DISLIKES)) || {};
    if (dislikes[userId] && dislikes[userId].includes(movieId)) {
        dislikes[userId] = dislikes[userId].filter(id => id != movieId);
        localStorage.setItem(STORAGE_KEYS.DISLIKES, JSON.stringify(dislikes));
    }

    if (!likes[userId].includes(movieId)) {
        likes[userId].push(movieId);
        localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(likes));
        showToast('👍 Thanks for liking!', 'success');

        // Add to history
        const movie = getMovieById(movieId);
        if (movie) addToHistory('like', movie);
        return true;
    }
    return false;
}

// ========== USER'S COMMENTS FUNCTIONS (Fixed - No Replacement) ==========
function addComment(movieId, commentText) {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName') || 'User';
    if (!userId) { showToast('Please login first', 'error'); return false; }

    let comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS)) || {};
    if (!comments[userId]) comments[userId] = [];

    // Add new comment (not replace)
    comments[userId].push({
        id: Date.now(),
        movieId: movieId,
        text: commentText,
        timestamp: new Date().toISOString(),
        userName: userName
    });

    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    showToast('💬 Comment added!', 'success');

    // Add to history
    const movie = getMovieById(movieId);
    if (movie) addToHistory('comment', movie);
    return true;
}

function getMovieComments(movieId) {
    const comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS)) || {};
    const allComments = [];

    for (const userId in comments) {
        if (comments[userId] && Array.isArray(comments[userId])) {
            comments[userId].forEach(comment => {
                if (comment.movieId == movieId) {
                    allComments.push({
                        ...comment,
                        userId: userId
                    });
                }
            });
        }
    }

    // Sort by timestamp descending
    allComments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return allComments;
}

// ========== NOTIFICATION SYSTEM ==========
function sendNotificationToUser(userId, title, message, type) {
    let userNotifications = JSON.parse(localStorage.getItem(`notifications_${userId}`)) || [];
    userNotifications.unshift({
        id: Date.now(),
        title: title,
        message: message,
        type: type || 'info',
        isRead: false,
        createdAt: new Date().toISOString(),
        timestamp: new Date().toLocaleString()
    });
    if (userNotifications.length > 50) userNotifications = userNotifications.slice(0, 50);
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(userNotifications));
}

function getUserNotifications() {
    const userId = localStorage.getItem('userId');
    if (!userId) return [];
    return JSON.parse(localStorage.getItem(`notifications_${userId}`)) || [];
}

function updateNotificationBadge() {
    const notifications = getUserNotifications();
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        if (unreadCount > 0) {
            badge.style.display = 'flex';
            badge.innerText = unreadCount > 9 ? '9+' : unreadCount;
        } else {
            badge.style.display = 'none';
        }
    }
}

function markNotificationAsRead(notificationId) {
    const notifications = getUserNotifications();
    const notification = notifications.find(n => n.id == notificationId);
    if (notification) {
        notification.isRead = true;
        localStorage.setItem(`notifications_${localStorage.getItem('userId')}`, JSON.stringify(notifications));
        updateNotificationBadge();
        loadNotificationsList();
    }
}

function markAllNotificationsAsRead() {
    const notifications = getUserNotifications();
    notifications.forEach(n => n.isRead = true);
    localStorage.setItem(`notifications_${localStorage.getItem('userId')}`, JSON.stringify(notifications));
    updateNotificationBadge();
    loadNotificationsList();
    showToast('All notifications marked as read', 'success');
}

function deleteNotification(notificationId) {
    if (!confirm('Delete this notification?')) return;
    let notifications = getUserNotifications();
    notifications = notifications.filter(n => n.id != notificationId);
    localStorage.setItem(`notifications_${localStorage.getItem('userId')}`, JSON.stringify(notifications));
    updateNotificationBadge();
    loadNotificationsList();
    showToast('Notification deleted', 'success');
}

function clearAllNotifications() {
    if (!confirm('Delete all notifications?')) return;
    localStorage.setItem(`notifications_${localStorage.getItem('userId')}`, JSON.stringify([]));
    updateNotificationBadge();
    loadNotificationsList();
    showToast('All notifications cleared', 'success');
}

function loadNotificationsList() {
    const notifications = getUserNotifications();
    const container = document.getElementById('notificationsList');
    const countSpan = document.getElementById('notificationsCount');

    if (!container) return;
    if (countSpan) countSpan.innerText = notifications.length;

    if (notifications.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:2rem; color:rgba(255,255,255,0.5);">
            <i class="fas fa-bell-slash" style="font-size:2rem;"></i>
            <p>No notifications yet</p>
        </div>`;
        return;
    }

    container.innerHTML = notifications.map(notif => `
        <div class="notification-item" style="padding:0.8rem; border-bottom:1px solid rgba(100,180,250,0.1); background:${notif.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(58,134,255,0.1)'};">
            <div style="display:flex; justify-content:space-between;">
                <div>
                    <strong>${escapeHtml(notif.title)}</strong>
                    ${!notif.isRead ? '<span style="background:#3a86ff; padding:2px 8px; border-radius:10px; font-size:0.6rem; margin-left:8px;">New</span>' : ''}
                </div>
                <button onclick="deleteNotification(${notif.id})" style="background:none; border:none; color:#e74c3c; cursor:pointer;">&times;</button>
            </div>
            <div style="font-size:0.75rem; margin-top:4px;">${escapeHtml(notif.message)}</div>
            <div style="font-size:0.6rem; color:rgba(255,255,255,0.4); margin-top:4px;">${notif.timestamp}</div>
            ${!notif.isRead ? `<button onclick="markNotificationAsRead(${notif.id})" style="background:#64b4fa; border:none; color:white; padding:2px 10px; border-radius:15px; margin-top:5px; cursor:pointer; font-size:0.6rem;">Mark Read</button>` : ''}
        </div>
    `).join('');
}

function showNotificationsModal() {
    let modal = document.getElementById('notificationsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'notificationsModal';
        modal.style.cssText = `
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); backdrop-filter: blur(12px);
            justify-content: center; align-items: center; z-index: 2000;
        `;
        document.body.appendChild(modal);
    }

    loadNotificationsList();
    modal.innerHTML = `
        <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 24px; width: 90%; max-width: 500px; max-height: 80vh; display: flex; flex-direction: column; border: 1px solid rgba(100,180,250,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid rgba(100,180,250,0.1);">
                <h3 style="color: white;"><i class="fas fa-bell"></i> Notifications <span id="notificationsCount" style="background:#3a86ff; padding:2px 8px; border-radius:20px; font-size:0.7rem;">0</span></h3>
                <div>
                    <button onclick="markAllNotificationsAsRead()" style="background:rgba(100,180,250,0.2); border:none; color:#64b4fa; padding:5px 10px; border-radius:20px; cursor:pointer; margin-right:8px;">Mark all read</button>
                    <button onclick="clearAllNotifications()" style="background:rgba(231,76,60,0.2); border:none; color:#e74c3c; padding:5px 10px; border-radius:20px; cursor:pointer; margin-right:8px;">Clear all</button>
                    <button onclick="closeNotificationsModal()" style="background:none; border:none; color:white; font-size:1.2rem; cursor:pointer;">&times;</button>
                </div>
            </div>
            <div id="notificationsList" style="flex:1; overflow-y: auto; padding: 0.5rem;"></div>
        </div>
    `;
    modal.style.display = 'flex';
    updateNotificationBadge();
}

function closeNotificationsModal() {
    const modal = document.getElementById('notificationsModal');
    if (modal) modal.style.display = 'none';
}

function addNotificationStyles() {
    if (document.getElementById('notificationStyles')) return;
    const style = document.createElement('style');
    style.id = 'notificationStyles';
    style.textContent = `
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .toast-message { animation: slideIn 0.3s ease; }
    `;
    document.head.appendChild(style);
}

function addWelcomeNotification() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    const welcomeSent = localStorage.getItem(`welcomeNotif_${userId}`);
    if (!welcomeSent) {
        sendNotificationToUser(userId, '👋 Welcome to FilmFusion!', 'Start exploring movies, add to favorites, and create your watchlist. Enjoy!', 'welcome');
        localStorage.setItem(`welcomeNotif_${userId}`, 'true');
    }
}

function addDailyNotification() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    const today = new Date().toDateString();
    const lastDaily = localStorage.getItem(`dailyNotif_${userId}`);
    if (lastDaily !== today) {
        sendNotificationToUser(userId, '🎬 Daily Movie Recommendation', 'Check out our latest movie collection! New movies added regularly.', 'daily');
        localStorage.setItem(`dailyNotif_${userId}`, today);
    }
}

// ========== USER STATS FUNCTIONS ==========
function loadUserStats() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const movies = getAllMovies();
    const favorites = getUserFavorites();
    const watchlist = getUserWatchlist();
    const history = JSON.parse(localStorage.getItem(`history_${userId}`)) || [];

    const totalMoviesEl = document.getElementById('totalMovies');
    const favoritesCountEl = document.getElementById('favoritesCount');
    const watchlistCountEl = document.getElementById('watchlistCount');
    const historyCountEl = document.getElementById('historyCount');

    if (totalMoviesEl) totalMoviesEl.innerText = movies.length;
    if (favoritesCountEl) favoritesCountEl.innerText = favorites.length;
    if (watchlistCountEl) watchlistCountEl.innerText = watchlist.length;
    if (historyCountEl) historyCountEl.innerText = history.length;
}

// ========== MOVIES DISPLAY (From Admin's Data) ==========
function loadMovies() {
    const movies = getAllMovies();
    displayMovies(movies);
}

function displayMovies(movies) {
    const grid = document.getElementById('moviesGrid');
    if (!grid) return;

    if (!movies || movies.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🎬</div><h3>No movies found</h3><p>Admin will add movies soon. Check back later!</p></div>';
        return;
    }

    grid.innerHTML = movies.map(m => `
        <div class="movie-card" onclick="viewMovie(${m.id})" style="cursor:pointer;">
            <div class="movie-poster">
                <img src="${m.posterPath ? `https://image.tmdb.org/t/p/w500${m.posterPath}` : `https://via.placeholder.com/500x750/1a2634/64b4fa?text=${encodeURIComponent(m.title)}`}" alt="${m.title}" onerror="this.src='https://via.placeholder.com/500x750/1a2634/64b4fa?text=${encodeURIComponent(m.title)}'">
                <div class="movie-rating-badge">⭐ ${m.rating}/10</div>
            </div>
            <div class="movie-info">
                <div class="movie-title">${escapeHtml(m.title)}</div>
                <div class="movie-year">${m.year || 'N/A'}</div>
                <div class="movie-genre">${m.genre ? m.genre.split(',').slice(0, 2).map(g => `<span>${g.trim()}</span>`).join('') : '<span>No genre</span>'}</div>
            </div>
        </div>
    `).join('');
}

function searchMovies() {
    const query = document.getElementById('searchInput')?.value.trim().toLowerCase();
    if (!query) { loadMovies(); return; }
    const movies = getAllMovies();
    const filtered = movies.filter(m => m.title.toLowerCase().includes(query));
    displayMovies(filtered);
}

function filterByGenre() {
    const genre = document.getElementById('genreFilter')?.value.toLowerCase();
    if (!genre) { loadMovies(); return; }
    const movies = getAllMovies();
    const filtered = movies.filter(m => m.genre && m.genre.toLowerCase().includes(genre));
    displayMovies(filtered);
}

// ========== VIEW MOVIE ==========
function viewMovie(id) {
    if (id) {
        currentMovieId = id;
        currentMovieData = getMovieById(id);
        window.location.href = `watch-movie.html?id=${id}`;
    }
}

// ========== WATCH MOVIE PAGE ==========
function loadMovieForWatch() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        alert('No movie selected');
        window.location.href = 'user-dashboard.html';
        return;
    }

    currentMovieId = parseInt(movieId);
    const movie = getMovieById(currentMovieId);

    if (!movie) {
        alert('Movie not found');
        window.location.href = 'user-dashboard.html';
        return;
    }

    currentMovieData = movie;

    const titleEl = document.getElementById('movieTitle');
    const yearEl = document.getElementById('movieYear');
    const genreEl = document.getElementById('movieGenre');
    const ratingEl = document.getElementById('movieRating');
    const overviewEl = document.getElementById('movieOverview');

    if (titleEl) titleEl.innerText = movie.title;
    if (yearEl) yearEl.innerText = movie.year;
    if (genreEl) genreEl.innerText = movie.genre;
    if (ratingEl) ratingEl.innerText = '⭐ ' + movie.rating + '/10';
    if (overviewEl) overviewEl.innerText = movie.overview;

    const player = document.getElementById('moviePlayer');
    if (player) {
        const tmdbId = movie.tmdbId || movie.id;
        player.src = `https://vidsrc.to/embed/movie/${tmdbId}`;
    }

    addToHistory('watch', movie);
    loadCommentsForWatch(movieId);
    updateActionButtons();
}

function updateActionButtons() {
    if (!currentMovieId) return;
    const favBtn = document.getElementById('favoriteBtn');
    const watchlistBtn = document.getElementById('watchlistBtn');
    const likeBtn = document.getElementById('likeBtn');

    if (favBtn) {
        if (isMovieFavorited(currentMovieId)) {
            favBtn.innerHTML = '<i class="fas fa-heart"></i> Favorited';
            favBtn.style.background = '#e74c3c';
        } else {
            favBtn.innerHTML = '<i class="far fa-heart"></i> Favorite';
            favBtn.style.background = 'rgba(100,180,250,0.2)';
        }
    }

    if (watchlistBtn) {
        if (isMovieInWatchlist(currentMovieId)) {
            watchlistBtn.innerHTML = '<i class="fas fa-bookmark"></i> In Watchlist';
            watchlistBtn.style.background = '#2ecc71';
        } else {
            watchlistBtn.innerHTML = '<i class="far fa-bookmark"></i> Watchlist';
            watchlistBtn.style.background = 'rgba(100,180,250,0.2)';
        }
    }
}

function toggleFavorite() {
    if (!currentMovieId) return;
    if (isMovieFavorited(currentMovieId)) {
        removeFromFavorites(currentMovieId);
    } else {
        addToFavorites(currentMovieId);
    }
    updateActionButtons();
}

function toggleWatchlist() {
    if (!currentMovieId) return;
    if (isMovieInWatchlist(currentMovieId)) {
        removeFromWatchlist(currentMovieId);
    } else {
        addToWatchlist(currentMovieId);
    }
    updateActionButtons();
}

function likeMovie() {
    if (!currentMovieId) return;
    addToLikes(currentMovieId);
}

// ========== COMMENTS FUNCTIONS (Fixed - No Replacement) ==========
function loadCommentsForWatch(movieId) {
    const container = document.getElementById('commentsList');
    const countSpan = document.getElementById('commentsCount');

    if (!container) return;

    const comments = getMovieComments(movieId);

    if (countSpan) countSpan.innerText = `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`;

    if (comments.length === 0) {
        container.innerHTML = '<div class="no-comments" style="text-align:center; padding:1rem; color:rgba(255,255,255,0.5);">No comments yet. Be the first to comment!</div>';
        return;
    }

    const currentUser = localStorage.getItem('userName');

    container.innerHTML = comments.map(c => `
        <div class="comment-item" style="margin-bottom:1rem; border-bottom:1px solid rgba(100,180,250,0.1); padding-bottom:0.8rem;">
            <div style="display:flex; gap:0.8rem;">
                <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#3a86ff,#64b4fa); display:flex; align-items:center; justify-content:center;">
                    <span style="font-size:0.8rem;">${c.userName ? c.userName.charAt(0).toUpperCase() : 'U'}</span>
                </div>
                <div style="flex:1;">
                    <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                        <span style="font-weight:600; color:white;">${escapeHtml(c.userName || 'User')}</span>
                        <span style="font-size:0.7rem; color:rgba(255,255,255,0.5);">${new Date(c.timestamp).toLocaleString()}</span>
                    </div>
                    <div style="color:rgba(255,255,255,0.8); font-size:0.85rem; margin-top:0.3rem;">${escapeHtml(c.text)}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function addCommentForWatch() {
    const input = document.getElementById('commentInput');
    const comment = input?.value.trim();
    if (!comment) { alert('Please write a comment'); return; }
    if (!currentMovieId) return;

    addComment(currentMovieId, comment);
    input.value = '';
    loadCommentsForWatch(currentMovieId);
}

// ========== FAVORITES PAGE ==========
function loadFavorites() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const favorites = getUserFavorites();
    const movies = getAllMovies();
    const favoriteMovies = movies.filter(m => favorites.includes(m.id));
    const grid = document.getElementById('favoritesGrid');

    if (!grid) return;

    if (favoriteMovies.length === 0) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-icon">❤️</div><h3>No favorites yet</h3><p>Start adding movies to your favorites!</p><button class="btn-explore" onclick="location.href='user-dashboard.html'">Explore Movies →</button></div>`;
        return;
    }

    grid.innerHTML = favoriteMovies.map(m => `
        <div class="movie-card" onclick="viewMovie(${m.id})">
            <div class="movie-poster">
                <img src="${m.posterPath ? `https://image.tmdb.org/t/p/w500${m.posterPath}` : `https://via.placeholder.com/500x750/1a2634/64b4fa?text=${encodeURIComponent(m.title)}`}" alt="${m.title}">
                <div class="movie-rating-badge">⭐ ${m.rating}/10</div>
                <button class="remove-fav-btn" onclick="event.stopPropagation(); removeFromFavorites(${m.id})" style="position:absolute; top:10px; left:10px; background:#e74c3c; border:none; color:white; width:30px; height:30px; border-radius:50%; cursor:pointer;">🗑️</button>
            </div>
            <div class="movie-info">
                <div class="movie-title">${escapeHtml(m.title)}</div>
                <div class="movie-year">${m.year || 'N/A'}</div>
            </div>
        </div>
    `).join('');
}

// ========== WATCHLIST PAGE ==========
function loadWatchlist() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const watchlist = getUserWatchlist();
    const movies = getAllMovies();
    const watchlistMovies = movies.filter(m => watchlist.includes(m.id));
    const grid = document.getElementById('watchlistGrid');

    if (!grid) return;

    if (watchlistMovies.length === 0) {
        grid.innerHTML = `<div class="empty-state"><div class="empty-icon">📝</div><h3>Watchlist empty</h3><p>Start adding movies to your watchlist!</p><button class="btn-explore" onclick="location.href='user-dashboard.html'">Explore Movies →</button></div>`;
        return;
    }

    grid.innerHTML = watchlistMovies.map(m => `
        <div class="movie-card" onclick="viewMovie(${m.id})">
            <div class="movie-poster">
                <img src="${m.posterPath ? `https://image.tmdb.org/t/p/w500${m.posterPath}` : `https://via.placeholder.com/500x750/1a2634/64b4fa?text=${encodeURIComponent(m.title)}`}" alt="${m.title}">
                <div class="movie-rating-badge">⭐ ${m.rating}/10</div>
                <button class="remove-watchlist-btn" onclick="event.stopPropagation(); removeFromWatchlist(${m.id})" style="position:absolute; top:10px; left:10px; background:#e74c3c; border:none; color:white; width:30px; height:30px; border-radius:50%; cursor:pointer;">🗑️</button>
            </div>
            <div class="movie-info">
                <div class="movie-title">${escapeHtml(m.title)}</div>
                <div class="movie-year">${m.year || 'N/A'}</div>
            </div>
        </div>
    `).join('');
}

// ========== HISTORY PAGE ==========
function loadHistory() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const history = JSON.parse(localStorage.getItem(`history_${userId}`)) || [];
    const container = document.getElementById('historyList');

    if (!container) return;

    if (history.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="empty-icon">📜</div><h3>No history yet</h3><p>Watch movies to see your history here!</p><button class="btn-explore" onclick="location.href='user-dashboard.html'">Explore Movies →</button></div>`;
        return;
    }

    container.innerHTML = history.map(h => `
        <div class="history-item" style="display:flex; align-items:center; gap:1rem; padding:0.8rem; border-bottom:1px solid rgba(100,180,250,0.1);">
            <div style="width:50px; height:70px; background:rgba(100,180,250,0.1); border-radius:8px; display:flex; align-items:center; justify-content:center;">
                <i class="fas ${h.action === 'watch' ? 'fa-play' : h.action === 'like' ? 'fa-heart' : h.action === 'favorite' ? 'fa-star' : 'fa-bookmark'}" style="color:#64b4fa; font-size:1.2rem;"></i>
            </div>
            <div style="flex:1;">
                <div style="font-weight:600;">${escapeHtml(h.movieTitle)}</div>
                <div style="font-size:0.7rem; color:rgba(255,255,255,0.5);">${h.actionLabel} • ${h.date}</div>
            </div>
        </div>
    `).join('');
}

function clearHistory() {
    if (!confirm('Clear all watch history?')) return;
    const userId = localStorage.getItem('userId');
    if (userId) {
        localStorage.setItem(`history_${userId}`, JSON.stringify([]));
        loadHistory();
        showToast('History cleared', 'success');
    }
}

// ========== PROFILE FUNCTIONS ==========
function loadProfile() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const user = getAllUsers().find(u => u.id == userId);
    if (!user) return;

    const nameEl = document.getElementById('profileName');
    const emailEl = document.getElementById('profileEmail');
    const bioEl = document.getElementById('profileBio');
    const joinedEl = document.getElementById('profileJoined');
    const avatarEl = document.getElementById('profileAvatar');

    if (nameEl) nameEl.textContent = user.username;
    if (emailEl) emailEl.textContent = user.email;
    if (bioEl) bioEl.textContent = user.bio || 'Movie enthusiast';
    if (joinedEl) joinedEl.textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
    if (avatarEl) {
        const userAvatar = localStorage.getItem('userAvatar');
        if (userAvatar && userAvatar !== 'null') {
            avatarEl.src = userAvatar;
        } else {
            avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=3a86ff&color=fff&size=130`;
        }
    }
}

function saveProfile() {
    const userId = localStorage.getItem('userId');
    const newUsername = document.getElementById('editUsername')?.value;
    const newEmail = document.getElementById('editEmail')?.value;
    const newBio = document.getElementById('editBio')?.value;

    if (!newUsername || !newEmail) {
        alert('Username and email are required!');
        return;
    }

    let users = getAllUsers();
    const userIndex = users.findIndex(u => u.id == userId);

    if (userIndex !== -1) {
        users[userIndex].username = newUsername;
        users[userIndex].email = newEmail;
        users[userIndex].bio = newBio;
        saveAllUsers(users);

        localStorage.setItem('userName', newUsername);
        localStorage.setItem('userEmail', newEmail);
        localStorage.setItem('userBio', newBio);

        showToast('Profile updated successfully!', 'success');
        closeEditModal();
        loadProfile();
    }
}

function changePassword() {
    const userEmail = localStorage.getItem('userEmail');
    const oldPassword = document.getElementById('oldPassword')?.value;
    const newPassword = document.getElementById('newPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;

    if (!oldPassword || !newPassword || !confirmPassword) {
        alert('Please fill all fields');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
    }

    if (newPassword.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }

    let users = getAllUsers();
    const userIndex = users.findIndex(u => u.email === userEmail);

    if (userIndex === -1) {
        alert('User not found!');
        return;
    }

    if (users[userIndex].password !== oldPassword) {
        alert('Current password is incorrect!');
        return;
    }

    users[userIndex].password = newPassword;
    saveAllUsers(users);
    localStorage.setItem('userPassword', newPassword);

    alert('✅ Password changed successfully! Please login again.');
    closePasswordModal();
    setTimeout(() => { logout(); }, 2000);
}

function openEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        document.getElementById('editUsername').value = localStorage.getItem('userName') || '';
        document.getElementById('editEmail').value = localStorage.getItem('userEmail') || '';
        document.getElementById('editBio').value = localStorage.getItem('userBio') || '';
        modal.style.display = 'flex';
    }
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) modal.style.display = 'none';
}

function openPasswordModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) {
        document.getElementById('oldPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        modal.style.display = 'flex';
    }
}

function closePasswordModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) modal.style.display = 'none';
}

function openAvatarModal() {
    const modal = document.getElementById('avatarModal');
    if (modal) modal.style.display = 'flex';
}

function closeAvatarModal() {
    const modal = document.getElementById('avatarModal');
    if (modal) modal.style.display = 'none';
}

function setAvatar(imageUrl) {
    localStorage.setItem('userAvatar', imageUrl);

    let users = getAllUsers();
    const userId = localStorage.getItem('userId');
    const userIndex = users.findIndex(u => u.id == userId);

    if (userIndex !== -1) {
        users[userIndex].profilePicture = imageUrl;
        saveAllUsers(users);
    }

    const avatarEl = document.getElementById('profileAvatar');
    if (avatarEl) avatarEl.src = imageUrl;

    const navAvatar = document.getElementById('navUserAvatar');
    if (navAvatar) navAvatar.innerHTML = `<img src="${imageUrl}" style="width:100%; height:100%; object-fit:cover;">`;

    closeAvatarModal();
    showToast('Profile picture updated!', 'success');
}

function handleGalleryUpload(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            setAvatar(e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

// ========== HELPER FUNCTIONS ==========
function addToHistory(action, movieData) {
    const userId = localStorage.getItem('userId');
    if (!userId || !movieData) return;

    let history = JSON.parse(localStorage.getItem(`history_${userId}`)) || [];
    const actionLabels = {
        'watch': '🎬 Watched',
        'like': '👍 Liked',
        'favorite': '❤️ Added to Favorites',
        'watchlist': '📝 Added to Watchlist',
        'comment': '💬 Commented'
    };

    history.unshift({
        id: Date.now(),
        timestamp: Date.now(),
        movieId: movieData.id,
        movieTitle: movieData.title,
        action: action,
        actionLabel: actionLabels[action] || action,
        date: new Date().toLocaleString()
    });

    if (history.length > 100) history = history.slice(0, 100);
    localStorage.setItem(`history_${userId}`, JSON.stringify(history));
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

// ========== LOGIN FUNCTIONS ==========
function handleLocalLogin(email, password) {
    let users = getAllUsers();
    let user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userName', user.username);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userRole', user.role || 'User');
        localStorage.setItem('userPassword', user.password);
        localStorage.setItem('userBio', user.bio || 'Movie enthusiast');
        localStorage.setItem('userJoined', user.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString());
        localStorage.setItem('userAvatar', user.profilePicture || '');

        if (user.role === 'Admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'user-dashboard.html';
        }
    } else {
        alert('Invalid credentials!\n\nDemo login: demo@filmfusion.com / demo123\nAdmin login: admin@filmfusion.com / admin123');
    }
}

async function handleUserLogin(email, password) {
    try {
        const res = await fetch(`${API_URL}/Auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userName', data.username);
            localStorage.setItem('userRole', 'User');
            localStorage.setItem('userEmail', email);
            window.location.href = 'user-dashboard.html';
            return;
        }
    } catch (err) { }
    handleLocalLogin(email, password);
}

function handleLocalSignup(username, email, password) {
    let users = getAllUsers();
    if (users.find(u => u.email === email)) {
        alert('Email already exists!');
        return;
    }

    const newUser = {
        id: Date.now().toString(),
        username: username,
        email: email,
        password: password,
        bio: 'Movie enthusiast',
        role: 'User',
        isActive: true,
        createdAt: new Date().toISOString(),
        profilePicture: null
    };

    users.push(newUser);
    saveAllUsers(users);
    alert('Signup successful! Please login.');

    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    if (loginForm) loginForm.style.display = 'block';
    if (signupForm) signupForm.style.display = 'none';
}

async function handleUserSignup(username, email, password, confirmPassword) {
    if (password !== confirmPassword) { alert('Passwords do not match!'); return; }
    if (password.length < 6) { alert('Password must be at least 6 characters'); return; }

    try {
        const res = await fetch(`${API_URL}/Auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        if (res.ok) {
            alert('Signup successful! Please login.');
            const loginForm = document.getElementById('loginForm');
            const signupForm = document.getElementById('signupForm');
            if (loginForm) loginForm.style.display = 'block';
            if (signupForm) signupForm.style.display = 'none';
            return;
        }
    } catch (err) { }
    handleLocalSignup(username, email, password);
}



// Load movie for watch page (Enhanced version)
function loadMovieForWatchEnhanced() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        alert('No movie selected');
        window.location.href = 'user-dashboard.html';
        return;
    }

    currentMovieId = parseInt(movieId);
    const movie = getMovieById(currentMovieId);

    if (!movie) {
        alert('Movie not found');
        window.location.href = 'user-dashboard.html';
        return;
    }

    currentMovieData = movie;

    // Update all UI elements
    const titleEl = document.getElementById('movieTitle');
    const yearEl = document.getElementById('movieYear');
    const genreEl = document.getElementById('movieGenre');
    const ratingEl = document.getElementById('movieRating');
    const overviewEl = document.getElementById('movieOverview');
    const directorEl = document.getElementById('movieDirector');
    const castEl = document.getElementById('movieCast');
    const durationEl = document.getElementById('movieDuration');

    if (titleEl) titleEl.innerText = movie.title;
    if (yearEl) yearEl.innerText = movie.year || 'N/A';
    if (genreEl) genreEl.innerText = movie.genre || 'General';
    if (ratingEl) ratingEl.innerText = '⭐ ' + (movie.rating || '0') + '/10';
    if (overviewEl) overviewEl.innerText = movie.overview || 'No description available.';
    if (directorEl) directorEl.innerText = movie.director || 'Not specified';
    if (castEl) castEl.innerText = movie.cast || 'Not specified';
    if (durationEl) durationEl.innerHTML = movie.duration || '—';

   

    // Update action buttons state
    updateMovieActionButtons();

    // Load comments
    loadCommentsForWatch(currentMovieId);

    // Add to history
    addToHistory('watch', movie);

    // Set user avatar in comment section
    const userAvatar = localStorage.getItem('userAvatar');
    const avatarContainer = document.getElementById('currentUserAvatar');
    if (avatarContainer) {
        if (userAvatar && userAvatar !== 'null') {
            avatarContainer.innerHTML = `<img src="${userAvatar}" style="width:100%; height:100%; object-fit:cover;">`;
        } else {
            const userName = localStorage.getItem('userName') || 'U';
            avatarContainer.innerHTML = `<span>${userName.charAt(0).toUpperCase()}</span>`;
        }
    }
}

// Update movie action buttons state (Favorite/Watchlist/Like)
function updateMovieActionButtons() {
    if (!currentMovieId) return;

    const favBtn = document.getElementById('favoriteBtn');
    const watchlistBtn = document.getElementById('watchlistBtn');
    const likeBtn = document.getElementById('likeBtn');

    if (favBtn) {
        if (isMovieFavorited(currentMovieId)) {
            favBtn.innerHTML = '<i class="fas fa-heart"></i> Favorited';
            favBtn.classList.add('active');
        } else {
            favBtn.innerHTML = '<i class="far fa-heart"></i> Favorite';
            favBtn.classList.remove('active');
        }
    }

    if (watchlistBtn) {
        if (isMovieInWatchlist(currentMovieId)) {
            watchlistBtn.innerHTML = '<i class="fas fa-bookmark"></i> In Watchlist';
            watchlistBtn.classList.add('active');
        } else {
            watchlistBtn.innerHTML = '<i class="far fa-bookmark"></i> Watchlist';
            watchlistBtn.classList.remove('active');
        }
    }
}

// Toggle favorite from watch page
function toggleMovieFavorite() {
    if (!currentMovieId) return;
    if (isMovieFavorited(currentMovieId)) {
        removeFromFavorites(currentMovieId);
    } else {
        addToFavorites(currentMovieId);
    }
    updateMovieActionButtons();
}

// Toggle watchlist from watch page
function toggleMovieWatchlist() {
    if (!currentMovieId) return;
    if (isMovieInWatchlist(currentMovieId)) {
        removeFromWatchlist(currentMovieId);
    } else {
        addToWatchlist(currentMovieId);
    }
    updateMovieActionButtons();
}

// Like movie from watch page
function likeCurrentMovie() {
    if (!currentMovieId) return;
    addToLikes(currentMovieId);
    // Update like button visual
    const likeBtn = document.getElementById('likeBtn');
    if (likeBtn) {
        likeBtn.innerHTML = '<i class="fas fa-thumbs-up"></i> Liked!';
        likeBtn.style.background = '#27ae60';
        likeBtn.style.color = 'white';
        setTimeout(() => {
            likeBtn.innerHTML = '<i class="far fa-thumbs-up"></i> Like';
            likeBtn.style.background = 'rgba(39,174,96,0.2)';
            likeBtn.style.color = '#2ecc71';
        }, 2000);
    }
}

// Clear comment input
function clearCommentInput() {
    const input = document.getElementById('commentInput');
    if (input) input.value = '';
}

// Enhanced add comment for watch page
function addWatchComment() {
    const input = document.getElementById('commentInput');
    const comment = input?.value.trim();
    if (!comment) {
        showToast('Please write a comment', 'error');
        return;
    }
    if (!currentMovieId) return;

    addComment(currentMovieId, comment);
    input.value = '';
    loadCommentsForWatch(currentMovieId);
}



// ========== NOTIFICATION FUNCTIONS FOR WATCH PAGE ==========
function showNotificationBell() {
    if (typeof showNotificationsModal === 'function') {
        showNotificationsModal();
    }
}

// ========== OVERRIDE loadMovieForWatch if needed ==========
// Agar pehle se loadMovieForWatch function hai to use override karo
// Nahi to yeh function use hoga
if (typeof window.loadMovieForWatch !== 'function') {
    window.loadMovieForWatch = loadMovieForWatchEnhanced;
} else {
    // Agar already hai to enhanced version use karo
    const originalLoadMovie = window.loadMovieForWatch;
    window.loadMovieForWatch = function () {
        originalLoadMovie();
        // Additional enhancement
        setTimeout(() => {
            updateMovieActionButtons();
            
        }, 100);
    };
}

// Make new functions global

window.updateMovieActionButtons = updateMovieActionButtons;
window.toggleMovieFavorite = toggleMovieFavorite;
window.toggleMovieWatchlist = toggleMovieWatchlist;
window.likeCurrentMovie = likeCurrentMovie;
window.clearCommentInput = clearCommentInput;
window.addWatchComment = addWatchComment;

window.showNotificationBell = showNotificationBell;
window.loadMovieForWatchEnhanced = loadMovieForWatchEnhanced;

// ========== FIX: Make sure loadCommentsForWatch uses the correct function ==========
// Ensure comments load properly
const originalLoadComments = window.loadCommentsForWatch;
window.loadCommentsForWatch = function (movieId) {
    const container = document.getElementById('commentsList');
    const countSpan = document.getElementById('commentsCount');

    if (!container) return;

    const comments = getMovieComments(movieId || currentMovieId);

    if (countSpan) countSpan.innerText = `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`;

    if (comments.length === 0) {
        container.innerHTML = '<div class="no-comments"><i class="fas fa-comments"></i> No comments yet. Be the first to comment!</div>';
        return;
    }

    container.innerHTML = comments.map(c => `
        <div class="comment-item" style="margin-bottom:1rem; border-bottom:1px solid rgba(100,180,250,0.1); padding-bottom:0.8rem;">
            <div style="display:flex; gap:0.8rem;">
                <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#3a86ff,#64b4fa); display:flex; align-items:center; justify-content:center;">
                    <span style="font-size:0.8rem;">${c.userName ? c.userName.charAt(0).toUpperCase() : 'U'}</span>
                </div>
                <div style="flex:1;">
                    <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                        <span style="font-weight:600; color:white;">${escapeHtml(c.userName || 'User')}</span>
                        <span style="font-size:0.7rem; color:rgba(255,255,255,0.5);">${new Date(c.timestamp).toLocaleString()}</span>
                    </div>
                    <div style="color:rgba(255,255,255,0.8); font-size:0.85rem; margin-top:0.3rem;">${escapeHtml(c.text)}</div>
                </div>
            </div>
        </div>
    `).join('');
};

console.log('✅ Watch movie functions loaded successfully!');
// ========== TRAILER FUNCTIONS ==========
// Yeh function TMDB API se trailer fetch karega movie ke title ke according

let currentTrailerUrl = '';

async function fetchMovieTrailer(movieTitle, movieYear) {
    try {
        // Search movie on TMDB
        const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=0fef51148b56778e567f9ceeac3fbc13&query=${encodeURIComponent(movieTitle)}&year=${movieYear}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData.results && searchData.results.length > 0) {
            const movieId = searchData.results[0].id;

            // Get videos for this movie
            const videoUrl = `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=0fef51148b56778e567f9ceeac3fbc13`;
            const videoRes = await fetch(videoUrl);
            const videoData = await videoRes.json();

            // Find YouTube trailer
            const trailer = videoData.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
            if (trailer) {
                return `https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`;
            }
        }

        // Fallback: Search YouTube directly
        return `https://www.youtube.com/embed?listType=search&q=${encodeURIComponent(movieTitle + ' ' + movieYear + ' official trailer')}&autoplay=1`;

    } catch (error) {
        console.error('Error fetching trailer:', error);
        // Fallback YouTube search
        return `https://www.youtube.com/embed?listType=search&q=${encodeURIComponent(movieTitle + ' official trailer')}&autoplay=1`;
    }
}

// Updated loadMovieForWatch function
const originalLoadMovieForWatch = window.loadMovieForWatch || function () { };

window.loadMovieForWatch = async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        alert('No movie selected');
        window.location.href = 'user-dashboard.html';
        return;
    }

    currentMovieId = parseInt(movieId);
    const movie = getMovieById(currentMovieId);

    if (!movie) {
        alert('Movie not found');
        window.location.href = 'user-dashboard.html';
        return;
    }

    currentMovieData = movie;

    // Update UI elements
    const titleEl = document.getElementById('movieTitle');
    const yearEl = document.getElementById('movieYear');
    const genreEl = document.getElementById('movieGenre');
    const ratingEl = document.getElementById('movieRating');
    const overviewEl = document.getElementById('movieOverview');
    const directorEl = document.getElementById('movieDirector');
    const castEl = document.getElementById('movieCast');
    const durationEl = document.getElementById('movieDuration');

    if (titleEl) titleEl.innerText = movie.title;
    if (yearEl) yearEl.innerText = movie.year || 'N/A';
    if (genreEl) genreEl.innerText = movie.genre || 'General';
    if (ratingEl) ratingEl.innerText = '⭐ ' + (movie.rating || '0') + '/10';
    if (overviewEl) overviewEl.innerText = movie.overview || 'No description available.';
    if (directorEl) directorEl.innerText = movie.director || 'Not specified';
    if (castEl) castEl.innerText = movie.cast || 'Not specified';
    if (durationEl) durationEl.innerHTML = movie.duration || '—';

    // Load trailer from TMDB
    const player = document.getElementById('moviePlayer');
    if (player) {
        player.src = 'about:blank';
        showToast('Loading trailer...', 'info');
        const trailerUrl = await fetchMovieTrailer(movie.title, movie.year);
        player.src = trailerUrl;
    }

    // Update action buttons state
    updateMovieActionButtons();

    // Load comments
    if (typeof loadCommentsForWatch === 'function') {
        loadCommentsForWatch(currentMovieId);
    }

    // Add to history
    addToHistory('watch', movie);
};

// Make sure functions are global
window.fetchMovieTrailer = fetchMovieTrailer;
window.loadMovieForWatch = loadMovieForWatch;
window.updateMovieActionButtons = updateMovieActionButtons;
window.toggleMovieFavorite = toggleMovieFavorite;
window.toggleMovieWatchlist = toggleMovieWatchlist;
window.likeCurrentMovie = likeCurrentMovie;
window.clearCommentInput = clearCommentInput;
window.addWatchComment = addWatchComment;

console.log('✅ Movie trailer functions loaded successfully!');

// ========== WELCOME PAGE FUNCTIONS - ADD AT THE END OF script.js ==========

// Navigation scroll function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Get Started button handler
function handleGetStarted() {
    window.location.href = 'index.html';
}

// Explore Features button handler
function handleExploreFeatures() {
    scrollToSection('features');
}

// Admin modal handlers
function showAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) modal.classList.add('active');
}

function closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) modal.classList.remove('active');
}

function handleAdminLogin() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    if (email === 'admin@filmfusion.com' && password === 'admin123') {
        localStorage.setItem('userId', 'admin_001');
        localStorage.setItem('userName', 'Admin');
        localStorage.setItem('userRole', 'Admin');
        localStorage.setItem('userEmail', email);
        window.location.href = 'admin-dashboard.html';
    } else {
        alert('Invalid admin credentials! Use: admin@filmfusion.com / admin123');
    }
}

// Initialize welcome page if on welcome.html
function initWelcomePage() {
    // Check if we are on welcome page
    if (!document.getElementById('getStartedBtn')) return;

    // Get Started buttons
    const getStartedBtn = document.getElementById('getStartedBtn');
    const getStartedBtn2 = document.getElementById('getStartedBtn2');

    if (getStartedBtn) getStartedBtn.onclick = handleGetStarted;
    if (getStartedBtn2) getStartedBtn2.onclick = handleGetStarted;

    // Explore Features button
    const exploreBtn = document.getElementById('exploreFeaturesBtn');
    if (exploreBtn) exploreBtn.onclick = handleExploreFeatures;

    // Navigation links
    const homeNav = document.getElementById('homeNav');
    const featuresNav = document.getElementById('featuresNav');
    const aboutNav = document.getElementById('aboutNav');
    const scrollIndicator = document.getElementById('scrollIndicator');

    if (homeNav) homeNav.onclick = () => scrollToSection('home');
    if (featuresNav) featuresNav.onclick = () => scrollToSection('features');
    if (aboutNav) aboutNav.onclick = () => scrollToSection('about');
    if (scrollIndicator) scrollIndicator.onclick = () => scrollToSection('features');

    // Admin modal
    const adminLink = document.getElementById('adminLink');
    const adminModalClose = document.getElementById('closeAdminModal');
    const adminLoginBtn = document.getElementById('adminLoginBtn');

    if (adminLink) adminLink.onclick = showAdminModal;
    if (adminModalClose) adminModalClose.onclick = closeAdminModal;
    if (adminLoginBtn) adminLoginBtn.onclick = handleAdminLogin;

    // Close modal when clicking outside
    window.onclick = function (e) {
        const modal = document.getElementById('adminModal');
        if (e.target === modal) closeAdminModal();
    };
}

// Call welcome page init when DOM loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWelcomePage);
} else {
    initWelcomePage();
}

console.log('✅ Welcome page functions loaded successfully!');

// ========== PAGE INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function () {
    initializeDefaultData();
    addNotificationStyles();

    // Dashboard page
    if (document.getElementById('moviesGrid') && !document.getElementById('statsGrid')) {
        const userId = localStorage.getItem('userId');
        if (!userId || userId === 'null') {
            window.location.href = 'index.html';
            return;
        }
        loadUserStats();
        loadMovies();

        // Set welcome message
        const userName = localStorage.getItem('userName');
        const nameSpan = document.getElementById('userNameDisplay');
        if (nameSpan && userName) nameSpan.innerText = userName;

        // Set avatar
        const navAvatar = document.getElementById('navUserAvatar');
        const userAvatar = localStorage.getItem('userAvatar');
        if (navAvatar) {
            if (userAvatar && userAvatar !== 'null') {
                navAvatar.innerHTML = `<img src="${userAvatar}" style="width:100%; height:100%; object-fit:cover;">`;
            } else if (userName) {
                navAvatar.innerHTML = `<span>${userName.charAt(0).toUpperCase()}</span>`;
            }
        }

        const navUserName = document.getElementById('navUserName');
        if (navUserName && userName) navUserName.innerText = userName;

        const navUserEmail = document.getElementById('navUserEmail');
        if (navUserEmail) navUserEmail.innerText = localStorage.getItem('userEmail') || '';

        updateNotificationBadge();
        addWelcomeNotification();
        addDailyNotification();
    }

    // Favorites page
    if (document.getElementById('favoritesGrid')) {
        loadFavorites();
    }

    // Watchlist page
    if (document.getElementById('watchlistGrid')) {
        loadWatchlist();
    }

    // History page
    if (document.getElementById('historyList')) {
        loadHistory();
    }

    // Profile page
    if (document.getElementById('profileName')) {
        loadProfile();
    }

    // Watch movie page
    if (document.getElementById('moviePlayer')) {
        loadMovieForWatch();
    }
});

// Make functions global
window.viewMovie = viewMovie;
window.searchMovies = searchMovies;
window.filterByGenre = filterByGenre;
window.loadMovies = loadMovies;
window.toggleFavorite = toggleFavorite;
window.toggleWatchlist = toggleWatchlist;
window.likeMovie = likeMovie;
window.addCommentForWatch = addCommentForWatch;
window.loadFavorites = loadFavorites;
window.loadWatchlist = loadWatchlist;
window.loadHistory = loadHistory;
window.clearHistory = clearHistory;
window.showNotificationsModal = showNotificationsModal;
window.closeNotificationsModal = closeNotificationsModal;
window.markNotificationAsRead = markNotificationAsRead;
window.markAllNotificationsAsRead = markAllNotificationsAsRead;
window.deleteNotification = deleteNotification;
window.clearAllNotifications = clearAllNotifications;
window.updateNotificationBadge = updateNotificationBadge;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.saveProfile = saveProfile;
window.openPasswordModal = openPasswordModal;
window.closePasswordModal = closePasswordModal;
window.changePassword = changePassword;
window.openAvatarModal = openAvatarModal;
window.closeAvatarModal = closeAvatarModal;
window.handleGalleryUpload = handleGalleryUpload;
window.logout = logout;
window.removeFromFavorites = removeFromFavorites;
window.removeFromWatchlist = removeFromWatchlist;