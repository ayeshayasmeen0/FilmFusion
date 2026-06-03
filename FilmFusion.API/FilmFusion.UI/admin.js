// ========== SINGLE SOURCE OF TRUTH ==========
const STORAGE_KEYS = {
    MOVIES: 'filmfusion_movies',
    USERS: 'users',
    LIKES: 'likes',
    COMMENTS: 'comments',
    WATCHLIST: 'watchlist',
    FAVORITES: 'favorites'
};

// ========== INITIALIZE DEFAULT DATA (Only once) ==========
function initializeDefaultData() {
    // Initialize movies - ONLY if empty, no default movies
    if (!localStorage.getItem(STORAGE_KEYS.MOVIES)) {
        localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify([]));
        localStorage.setItem('cached_movies', JSON.stringify([]));
    }

    // Initialize users with admin
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        const defaultUsers = [
            { id: "admin_001", username: "Admin", email: "admin@filmfusion.com", password: "admin123", role: "Admin", isActive: true, createdAt: new Date().toISOString(), bio: "System Administrator", profilePicture: null }
        ];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
    }

    // Initialize empty collections
    if (!localStorage.getItem(STORAGE_KEYS.LIKES)) localStorage.setItem(STORAGE_KEYS.LIKES, '{}');
    if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) localStorage.setItem(STORAGE_KEYS.COMMENTS, '{}');
    if (!localStorage.getItem(STORAGE_KEYS.WATCHLIST)) localStorage.setItem(STORAGE_KEYS.WATCHLIST, '{}');
    if (!localStorage.getItem(STORAGE_KEYS.FAVORITES)) localStorage.setItem(STORAGE_KEYS.FAVORITES, '{}');
}

function escapeHtml(text) { if (!text) return ''; const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }

function showToast(message, type) {
    const existingToast = document.getElementById('toastMessage');
    if (existingToast) existingToast.remove();
    const toast = document.createElement('div');
    toast.id = 'toastMessage';
    toast.className = 'toast-message ' + (type === 'error' ? 'toast-error' : type === 'info' ? 'toast-info' : '');
    toast.innerHTML = '<i class="fas ' + (type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle') + '"></i> ' + message;
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3000);
}

function getAllMovies() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.MOVIES)) || []; }
function saveAllMovies(movies) {
    localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(movies));
    localStorage.setItem('cached_movies', JSON.stringify(movies));
}
function getAllUsers() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || []; }
function saveAllUsers(users) { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); }

// ========== SEND NOTIFICATION TO USER ==========
function sendNotificationToUser(userId, title, message, type = 'movie') {
    let userNotifications = JSON.parse(localStorage.getItem(`notifications_${userId}`)) || [];
    userNotifications.unshift({
        id: Date.now() + Math.random(),
        title: title,
        message: message,
        type: type,
        isRead: false,
        createdAt: new Date().toISOString(),
        timestamp: new Date().toLocaleString()
    });
    if (userNotifications.length > 50) userNotifications = userNotifications.slice(0, 50);
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(userNotifications));
}

function sendNotificationToAllUsers(title, message, type = 'movie') {
    const users = getAllUsers();
    users.forEach(function (user) {
        sendNotificationToUser(user.id, title, message, type);
    });
}

// ========== ADMIN STATS ==========
function loadAdminStats() {
    const movies = getAllMovies();
    const users = getAllUsers();
    const likes = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKES)) || {};
    const comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS)) || {};
    const watchlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST)) || {};
    const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || {};

    let totalLikes = 0, totalComments = 0, totalWatchlist = 0, totalFavorites = 0;
    Object.values(likes).forEach(function (arr) { if (Array.isArray(arr)) totalLikes += arr.length; });
    Object.values(comments).forEach(function (arr) { if (Array.isArray(arr)) totalComments += arr.length; });
    Object.values(watchlist).forEach(function (arr) { if (Array.isArray(arr)) totalWatchlist += arr.length; });
    Object.values(favorites).forEach(function (arr) { if (Array.isArray(arr)) totalFavorites += arr.length; });

    document.getElementById('totalUsers').innerText = users.length;
    document.getElementById('totalMovies').innerText = movies.length;
    document.getElementById('totalLikes').innerText = totalLikes;
    document.getElementById('totalComments').innerText = totalComments;
    document.getElementById('totalWatchlist').innerText = totalWatchlist;
    document.getElementById('totalFavorites').innerText = totalFavorites;
    document.getElementById('userCountNav').innerText = users.length;
    document.getElementById('movieCountNav').innerText = movies.length;

    // Calculate size
    let totalSize = 0;
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        var value = localStorage.getItem(key);
        totalSize += (key.length + (value ? value.length : 0)) * 2;
    }
    document.getElementById('dbSizeInfo').innerText = Math.round(totalSize / 1024) + ' KB';
}

// ========== MOVIES GRID ==========
function loadMoviesGrid() {
    const container = document.getElementById('moviesGrid');
    if (!container) return;
    let movies = getAllMovies();
    const searchTerm = document.getElementById('movieSearchInput') ? document.getElementById('movieSearchInput').value.toLowerCase() : '';
    const genreFilter = document.getElementById('genreFilterSelect') ? document.getElementById('genreFilterSelect').value.toLowerCase() : '';

    if (searchTerm) movies = movies.filter(function (m) { return m.title.toLowerCase().includes(searchTerm); });
    if (genreFilter) movies = movies.filter(function (m) { return m.genre && m.genre.toLowerCase().includes(genreFilter); });

    if (movies.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-film"></i><p>No movies found. Click "Import from TMDB" to add movies.</p></div>';
        return;
    }

    container.innerHTML = movies.map(function (movie) {
        return '<div class="movie-card">' +
            '<div class="movie-poster">' +
            '<img src="' + (movie.posterPath ? 'https://image.tmdb.org/t/p/w500' + movie.posterPath : 'https://via.placeholder.com/300x450/1a2634/64b4fa?text=' + encodeURIComponent(movie.title)) + '" alt="' + movie.title + '" onerror="this.src=\'https://via.placeholder.com/300x450/1a2634/64b4fa?text=' + encodeURIComponent(movie.title) + '\'">' +
            '<div class="movie-rating-badge">⭐ ' + movie.rating + '/10</div>' +
            '<button class="delete-movie" onclick="deleteMovie(' + movie.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div>' +
            '<div class="movie-info">' +
            '<h4>' + escapeHtml(movie.title) + '</h4>' +
            '<p>' + movie.year + ' • ' + (movie.genre ? movie.genre.split(',')[0] : 'N/A') + '</p>' +
            '</div>' +
            '</div>';
    }).join('');
}

function deleteMovie(movieId) {
    if (!confirm('Delete this movie permanently? This will also remove from users\' favorites and watchlists.')) return;
    let movies = getAllMovies();
    movies = movies.filter(function (m) { return m.id != movieId; });
    saveAllMovies(movies);

    // Notify all users
    sendNotificationToAllUsers('🎬 Movie Removed', 'A movie has been removed from the library.');

    showToast('Movie deleted successfully', 'success');
    loadMoviesGrid();
    loadAdminStats();
    loadActivities();
    loadTopMovies();
    initCharts();
}

// ========== USERS LIST ==========
function loadUsersList() {
    const users = getAllUsers();
    const container = document.getElementById('usersTableBody');
    const likes = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKES)) || {};
    const comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS)) || {};
    const watchlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST)) || {};
    const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || {};

    if (users.length === 0) {
        container.innerHTML = '<tr><td colspan="11"><div class="empty-state">No users</div></td></tr>';
        return;
    }

    container.innerHTML = users.map(function (user) {
        var userLikes = likes[user.id] ? likes[user.id].length : 0;
        var userComments = comments[user.id] ? comments[user.id].length : 0;
        var userWatchlist = watchlist[user.id] ? watchlist[user.id].length : 0;
        var userFavorites = favorites[user.id] ? favorites[user.id].length : 0;
        var isAdmin = user.role === 'Admin';
        return '<tr>' +
            '<td>' + user.id + '</td>' +
            '<td><strong>' + escapeHtml(user.username) + '</strong></td>' +
            '<td>' + (user.email || 'N/A') + '</td>' +
            '<td><span class="badge ' + (isAdmin ? 'badge-admin' : 'badge-user') + '">' + (user.role || 'User') + '</span></td>' +
            '<td><span class="badge ' + (user.isActive !== false ? 'badge-active' : 'badge-inactive') + '">' + (user.isActive !== false ? 'Active' : 'Inactive') + '</span></td>' +
            '<td>' + userLikes + '</td>' +
            '<td>' + userComments + '</td>' +
            '<td>' + userWatchlist + '</td>' +
            '<td>' + userFavorites + '</td>' +
            '<td>' + (user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A') + '</td>' +
            '<td><div class="action-icons">' + (isAdmin ? '<span style="color:#64b4fa;"><i class="fas fa-shield-alt"></i></span>' : '<button class="delete-user" onclick="deleteUser(\'' + user.id + '\')"><i class="fas fa-trash"></i></button>') + '</div></td>' +
            '</tr>';
    }).join('');
}

function deleteUser(userId) {
    if (!confirm('Delete this user permanently? All their data will be removed.')) return;
    let users = getAllUsers();
    var user = users.find(function (u) { return u.id == userId; });
    if (user && user.role === 'Admin') { showToast('Cannot delete admin user', 'error'); return; }
    users = users.filter(function (u) { return u.id != userId; });
    saveAllUsers(users);

    // Remove user data
    var likes = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKES)) || {};
    var comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS)) || {};
    var watchlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST)) || {};
    var favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || {};
    delete likes[userId];
    delete comments[userId];
    delete watchlist[userId];
    delete favorites[userId];
    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(likes));
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));

    showToast('User deleted successfully', 'success');
    loadUsersList();
    loadAdminStats();
    loadActivities();
}

// ========== ACTIVITIES (Real-time from all users) ==========
function loadActivities() {
    const likes = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKES)) || {};
    const comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS)) || {};
    const watchlist = JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST)) || {};
    const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || {};
    const users = getAllUsers();
    const movies = getAllMovies();

    // Likes activity
    var likeActivities = [];
    Object.keys(likes).forEach(function (uid) {
        var mids = likes[uid];
        if (Array.isArray(mids)) {
            mids.forEach(function (mid) {
                var user = users.find(function (u) { return u.id == uid; });
                var movie = movies.find(function (m) { return m.id == mid; });
                if (user && movie && user.role !== 'Admin') {
                    likeActivities.push({ user: user.username, movie: movie.title, userId: uid, movieId: mid });
                }
            });
        }
    });
    var likesContainer = document.getElementById('recentLikes');
    if (likesContainer) {
        likesContainer.innerHTML = likeActivities.slice(0, 15).map(function (a) {
            return '<div class="activity-item"><div class="activity-icon like"><i class="fas fa-heart"></i></div><div class="activity-details"><div class="activity-title">' + escapeHtml(a.user) + ' liked "' + escapeHtml(a.movie) + '"</div><div class="activity-time">Just now</div></div></div>';
        }).join('') || '<div class="empty-state">No likes yet</div>';
    }

    // Comments activity
    var commentActivities = [];
    Object.keys(comments).forEach(function (uid) {
        var cmts = comments[uid];
        if (Array.isArray(cmts)) {
            cmts.forEach(function (c) {
                var user = users.find(function (u) { return u.id == uid; });
                var movie = movies.find(function (m) { return m.id == c.movieId; });
                if (user && movie && user.role !== 'Admin') {
                    commentActivities.push({ user: user.username, movie: movie.title, comment: c.text });
                }
            });
        }
    });
    var commentsContainer = document.getElementById('recentComments');
    if (commentsContainer) {
        commentsContainer.innerHTML = commentActivities.slice(0, 15).map(function (a) {
            return '<div class="activity-item"><div class="activity-icon comment"><i class="fas fa-comment"></i></div><div class="activity-details"><div class="activity-title">' + escapeHtml(a.user) + ' commented on "' + escapeHtml(a.movie) + '"</div><div class="activity-subtitle">"' + escapeHtml(a.comment ? a.comment.substring(0, 60) : '') + '"</div></div></div>';
        }).join('') || '<div class="empty-state">No comments yet</div>';
    }

    // Watchlist activity
    var watchlistActivities = [];
    Object.keys(watchlist).forEach(function (uid) {
        var mids = watchlist[uid];
        if (Array.isArray(mids)) {
            mids.forEach(function (mid) {
                var user = users.find(function (u) { return u.id == uid; });
                var movie = movies.find(function (m) { return m.id == mid; });
                if (user && movie && user.role !== 'Admin') {
                    watchlistActivities.push({ user: user.username, movie: movie.title });
                }
            });
        }
    });
    var watchlistContainer = document.getElementById('recentWatchlist');
    if (watchlistContainer) {
        watchlistContainer.innerHTML = watchlistActivities.slice(0, 15).map(function (a) {
            return '<div class="activity-item"><div class="activity-icon watchlist"><i class="fas fa-bookmark"></i></div><div class="activity-details"><div class="activity-title">' + escapeHtml(a.user) + ' added "' + escapeHtml(a.movie) + '" to watchlist</div></div></div>';
        }).join('') || '<div class="empty-state">No watchlist additions</div>';
    }

    // Favorites activity
    var favoriteActivities = [];
    Object.keys(favorites).forEach(function (uid) {
        var mids = favorites[uid];
        if (Array.isArray(mids)) {
            mids.forEach(function (mid) {
                var user = users.find(function (u) { return u.id == uid; });
                var movie = movies.find(function (m) { return m.id == mid; });
                if (user && movie && user.role !== 'Admin') {
                    favoriteActivities.push({ user: user.username, movie: movie.title });
                }
            });
        }
    });
    var favoritesContainer = document.getElementById('recentFavorites');
    if (favoritesContainer) {
        favoritesContainer.innerHTML = favoriteActivities.slice(0, 15).map(function (a) {
            return '<div class="activity-item"><div class="activity-icon favorite"><i class="fas fa-star"></i></div><div class="activity-details"><div class="activity-title">' + escapeHtml(a.user) + ' added "' + escapeHtml(a.movie) + '" to favorites</div></div></div>';
        }).join('') || '<div class="empty-state">No favorites yet</div>';
    }
}

function loadTopMovies() {
    const movies = getAllMovies();
    var topMovies = movies.slice().sort(function (a, b) { return parseFloat(b.rating) - parseFloat(a.rating); }).slice(0, 10);
    var container = document.getElementById('topMoviesList');
    if (container) {
        container.innerHTML = topMovies.map(function (m, i) {
            return '<div class="top-movie-item"><div class="movie-rank">#' + (i + 1) + '</div><div class="movie-info"><h4>' + escapeHtml(m.title) + '</h4><p>' + m.year + '</p></div><div class="movie-rating">⭐ ' + m.rating + '</div></div>';
        }).join('');
    }

    // Most active users
    var likes = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKES)) || {};
    var comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS)) || {};
    var users = getAllUsers();
    var userActivity = [];
    users.forEach(function (user) {
        if (user.role !== 'Admin') {
            var activityCount = (likes[user.id] ? likes[user.id].length : 0) + (comments[user.id] ? comments[user.id].length : 0);
            userActivity.push({ name: user.username, activity: activityCount });
        }
    });
    userActivity.sort(function (a, b) { return b.activity - a.activity; });
    var activeContainer = document.getElementById('mostActiveUsers');
    if (activeContainer) {
        activeContainer.innerHTML = userActivity.slice(0, 10).map(function (u, i) {
            return '<div class="top-movie-item"><div class="movie-rank">#' + (i + 1) + '</div><div class="movie-info"><h4>' + escapeHtml(u.name) + '</h4><p>' + u.activity + ' interactions</p></div></div>';
        }).join('') || '<div class="empty-state">No activity yet</div>';
    }
}

// ========== TMDB IMPORT ==========
async function searchTMDB() {
    const query = document.getElementById('tmdbSearchInput').value;
    if (!query) { showToast('Enter movie name', 'error'); return; }
    const resultsDiv = document.getElementById('tmdbResultsList');
    resultsDiv.innerHTML = '<div class="loading-skeleton">Searching...</div>';
    try {
        const response = await fetch('https://api.themoviedb.org/3/search/movie?api_key=0fef51148b56778e567f9ceeac3fbc13&query=' + encodeURIComponent(query));
        const data = await response.json();
        if (!data.results || data.results.length === 0) { resultsDiv.innerHTML = '<div class="empty-state">No movies found</div>'; return; }
        resultsDiv.innerHTML = data.results.map(function (movie) {
            return '<div class="tmdb-result-item"><span>' + movie.title + ' (' + (movie.release_date ? movie.release_date.split('-')[0] : 'N/A') + ')</span><button onclick="importFromTMDB(' + movie.id + ')">Import</button></div>';
        }).join('');
    } catch (error) { resultsDiv.innerHTML = '<div class="empty-state">Error searching</div>'; }
}

async function importFromTMDB(tmdbId) {
    try {
        const response = await fetch('https://api.themoviedb.org/3/movie/' + tmdbId + '?api_key=0fef51148b56778e567f9ceeac3fbc13');
        const movie = await response.json();
        var existingMovies = getAllMovies();
        if (existingMovies.some(function (m) { return m.tmdbId == movie.id; })) {
            showToast('Movie already exists', 'error');
            return;
        }
        var newMovie = {
            id: Date.now(), tmdbId: movie.id, title: movie.title,
            year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
            genre: movie.genres ? movie.genres.map(function (g) { return g.name; }).join(', ') : 'General',
            rating: movie.vote_average ? movie.vote_average.toFixed(1) : '0',
            overview: movie.overview || 'No description',
            posterPath: movie.poster_path
        };
        var movies = getAllMovies();
        movies.push(newMovie);
        saveAllMovies(movies);

        // Send notification to all users about new movie
        sendNotificationToAllUsers('🎬 New Movie Added!', '"' + movie.title + '" has been added to the library. Check it out!');

        showToast('✅ "' + movie.title + '" imported!', 'success');
        closeModals();
        loadMoviesGrid();
        loadAdminStats();
        loadActivities();
        loadTopMovies();
        initCharts();
    } catch (error) { showToast('Error importing', 'error'); }
}

function addNewMovie() {
    var title = document.getElementById('addMovieTitle').value;
    var genre = document.getElementById('addMovieGenre').value;
    var year = document.getElementById('addMovieYear').value;
    var rating = document.getElementById('addMovieRating').value;
    var poster = document.getElementById('addMoviePoster').value;
    var description = document.getElementById('addMovieDesc').value;

    if (!title || !genre || !year) { showToast('Please fill required fields', 'error'); return; }
    var movies = getAllMovies();
    if (movies.some(function (m) { return m.title.toLowerCase() === title.toLowerCase(); })) {
        showToast('Movie already exists', 'error');
        return;
    }
    var newMovie = {
        id: Date.now(), title: title, year: year, genre: genre, rating: rating || '0',
        overview: description || 'No description', posterPath: poster || null
    };
    movies.push(newMovie);
    saveAllMovies(movies);

    // Send notification to all users
    sendNotificationToAllUsers('🎬 New Movie Added!', '"' + title + '" has been added to the library. Check it out!');

    showToast('✅ Movie added!', 'success');
    closeModals();
    document.getElementById('addMovieTitle').value = '';
    document.getElementById('addMovieGenre').value = '';
    document.getElementById('addMovieYear').value = '';
    document.getElementById('addMovieRating').value = '';
    document.getElementById('addMoviePoster').value = '';
    document.getElementById('addMovieDesc').value = '';
    loadMoviesGrid();
    loadAdminStats();
    loadActivities();
    loadTopMovies();
    initCharts();
}

// ========== CHARTS ==========
let userGrowthChart, genreChart;

function initCharts() {
    const users = getAllUsers();
    var last7Days = [];
    for (var i = 6; i >= 0; i--) {
        var date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    var userCounts = last7Days.map(function (day) {
        return users.filter(function (u) {
            return u.createdAt && new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === day;
        }).length;
    });
    var ctx = document.getElementById('userGrowthChart');
    if (ctx) {
        if (userGrowthChart) userGrowthChart.destroy();
        userGrowthChart = new Chart(ctx, {
            type: 'line',
            data: { labels: last7Days, datasets: [{ label: 'New Users', data: userCounts, borderColor: '#3a86ff', backgroundColor: 'rgba(58,134,255,0.1)', fill: true, tension: 0.4 }] },
            options: { responsive: true, plugins: { legend: { labels: { color: 'white' } } }, scales: { y: { ticks: { color: 'white' } }, x: { ticks: { color: 'white' } } } }
        });
    }

    const movies = getAllMovies();
    var genres = {};
    movies.forEach(function (m) {
        if (m.genre) {
            m.genre.split(',').forEach(function (g) {
                var genre = g.trim();
                genres[genre] = (genres[genre] || 0) + 1;
            });
        }
    });
    var genreCtx = document.getElementById('genreChart');
    if (genreCtx) {
        if (genreChart) genreChart.destroy();
        genreChart = new Chart(genreCtx, {
            type: 'doughnut',
            data: { labels: Object.keys(genres), datasets: [{ data: Object.values(genres), backgroundColor: ['#3a86ff', '#64b4fa', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6'] }] },
            options: { responsive: true, plugins: { legend: { labels: { color: 'white' } } } }
        });
    }
}

// ========== EXPORT ==========
function downloadCSV(csv, filename) {
    var blob = new Blob([csv], { type: 'text/csv' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

function exportUsersCSV() {
    const users = getAllUsers();
    let csv = "ID,Username,Email,Role,Status,Joined\n";
    users.forEach(function (u) { csv += u.id + ',' + u.username + ',' + (u.email || '') + ',' + (u.role || 'User') + ',' + (u.isActive !== false ? 'Active' : 'Inactive') + ',' + (u.createdAt || '') + '\n'; });
    downloadCSV(csv, 'users_' + new Date().toISOString().split('T')[0] + '.csv');
    showToast('Users exported', 'success');
}

function exportMoviesCSV() {
    const movies = getAllMovies();
    let csv = "ID,Title,Year,Genre,Rating\n";
    movies.forEach(function (m) { csv += m.id + ',' + m.title + ',' + m.year + ',' + m.genre + ',' + m.rating + '\n'; });
    downloadCSV(csv, 'movies_' + new Date().toISOString().split('T')[0] + '.csv');
    showToast('Movies exported', 'success');
}

function exportFullData() {
    var data = { movies: getAllMovies(), users: getAllUsers(), exportDate: new Date().toISOString() };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'backup_' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
    showToast('Backup exported', 'success');
}

function clearCache() {
    if (confirm('Clear cache?')) {
        localStorage.removeItem('cached_movies');
        showToast('Cache cleared', 'success');
        setTimeout(function () { location.reload(); }, 1000);
    }
}

function resetDatabase() {
    if (confirm('⚠️ WARNING: This will delete ALL data! Are you absolutely sure?')) {
        localStorage.clear();
        initializeDefaultData();
        showToast('Database reset', 'success');
        setTimeout(function () { location.reload(); }, 1500);
    }
}

// ========== MODALS ==========
function closeModals() {
    var modals = ['importModal', 'addMovieModal', 'userDetailModal'];
    modals.forEach(function (id) {
        var modal = document.getElementById(id);
        if (modal) modal.style.display = 'none';
    });
}

function viewUserDetails(userId) {
    const user = getAllUsers().find(function (u) { return u.id == userId; });
    if (!user) return;
    const body = document.getElementById('userDetailBody');
    if (body) {
        body.innerHTML = '<div class="user-detail-content">' +
            '<div class="user-detail-row"><div class="user-detail-label">Username:</div><div class="user-detail-value">' + escapeHtml(user.username) + '</div></div>' +
            '<div class="user-detail-row"><div class="user-detail-label">Email:</div><div class="user-detail-value">' + escapeHtml(user.email) + '</div></div>' +
            '<div class="user-detail-row"><div class="user-detail-label">Role:</div><div class="user-detail-value">' + (user.role || 'User') + '</div></div>' +
            '<div class="user-detail-row"><div class="user-detail-label">Status:</div><div class="user-detail-value">' + (user.isActive !== false ? 'Active' : 'Inactive') + '</div></div>' +
            '<div class="user-detail-row"><div class="user-detail-label">Joined:</div><div class="user-detail-value">' + (user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A') + '</div></div>' +
            '<div class="user-detail-row"><div class="user-detail-label">Bio:</div><div class="user-detail-value">' + (user.bio || 'No bio') + '</div></div>' +
            '</div>';
    }
    document.getElementById('userDetailModal').style.display = 'flex';
}

// ========== PAGE NAVIGATION ==========
function switchToPage(page) {
    document.querySelectorAll('.nav-item').forEach(function (nav) { nav.classList.remove('active'); });
    document.querySelectorAll('.page-content').forEach(function (content) { content.classList.remove('active'); });
    var activeNav = document.querySelector('.nav-item[data-page="' + page + '"]');
    if (activeNav) activeNav.classList.add('active');
    var activePage = document.getElementById(page + 'Page');
    if (activePage) activePage.classList.add('active');
    var titles = { dashboard: 'Dashboard', movies: 'Movies', users: 'Users', analytics: 'Analytics', settings: 'Settings' };
    document.getElementById('pageTitle').innerText = titles[page] || 'Dashboard';
}

// ========== EVENT LISTENERS ==========
function initEventListeners() {
    document.querySelectorAll('.nav-item').forEach(function (item) {
        item.addEventListener('click', function (e) { e.preventDefault(); switchToPage(item.dataset.page); });
    });
    document.getElementById('menuToggle').addEventListener('click', function () {
        document.getElementById('sidebar').classList.toggle('collapsed');
    });
    document.getElementById('logoutBtn').addEventListener('click', function () {
        if (confirm('Logout?')) { localStorage.clear(); window.location.href = 'index.html'; }
    });
    document.getElementById('importTmdbBtn').addEventListener('click', function () { document.getElementById('importModal').style.display = 'flex'; });
    document.getElementById('addMovieBtn').addEventListener('click', function () { document.getElementById('addMovieModal').style.display = 'flex'; });
    document.getElementById('refreshMoviesBtn').addEventListener('click', function () { loadMoviesGrid(); showToast('Refreshed', 'info'); });
    document.getElementById('exportMoviesBtn').addEventListener('click', exportMoviesCSV);
    document.getElementById('exportUsersBtn').addEventListener('click', exportUsersCSV);
    document.getElementById('exportFullDataBtn').addEventListener('click', exportFullData);
    document.getElementById('clearCacheBtn').addEventListener('click', clearCache);
    document.getElementById('resetDatabaseBtn').addEventListener('click', resetDatabase);
    document.getElementById('searchTmdbBtn').addEventListener('click', searchTMDB);
    document.getElementById('submitAddMovieBtn').addEventListener('click', addNewMovie);
    document.getElementById('closeImportModalBtn').addEventListener('click', closeModals);
    document.getElementById('closeAddMovieModalBtn').addEventListener('click', closeModals);
    document.getElementById('cancelAddMovieBtn').addEventListener('click', closeModals);
    document.getElementById('closeUserDetailBtn').addEventListener('click', closeModals);
    document.getElementById('movieSearchInput').addEventListener('input', loadMoviesGrid);
    document.getElementById('genreFilterSelect').addEventListener('change', loadMoviesGrid);
    document.getElementById('userSearchInput').addEventListener('input', loadUsersList);
    document.getElementById('roleFilterSelect').addEventListener('change', loadUsersList);
    document.getElementById('statusFilterSelect').addEventListener('change', loadUsersList);
}

// ========== INIT ==========
function init() {
    initializeDefaultData();
    loadAdminStats();
    loadMoviesGrid();
    loadUsersList();
    loadActivities();
    loadTopMovies();
    initCharts();
    initEventListeners();

    // Real-time refresh every 10 seconds
    setInterval(function () {
        loadAdminStats();
        loadActivities();
    }, 10000);
}

init();

// Make functions global for onclick
window.deleteMovie = deleteMovie;
window.deleteUser = deleteUser;
window.viewUserDetails = viewUserDetails;
window.closeModals = closeModals;