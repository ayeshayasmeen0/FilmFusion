// @ts-nocheck
const API_URL = 'https://localhost:7249/api';
const GEMINI_API_KEY = 'AIzaSyBQw2Xaj4rurXngdUzDVXbFbHgx9kH9xWY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ========== INDEX PAGE AUTH FUNCTIONS ==========
window.selectedRole = null;

window.selectRole = function (role) {
    window.selectedRole = role;
    const adminBtn = document.getElementById('adminRoleBtn');
    const userBtn = document.getElementById('userRoleBtn');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginTitle = document.getElementById('loginTitle');
    const emailInput = document.getElementById('loginEmail');

    if (adminBtn) adminBtn.classList.toggle('active', role === 'admin');
    if (userBtn) userBtn.classList.toggle('active', role === 'user');
    if (loginForm) loginForm.style.display = 'block';
    if (signupForm) signupForm.style.display = role === 'user' ? 'block' : 'none';
    if (loginTitle) loginTitle.innerText = role === 'admin' ? '👑 Admin Login' : '👤 User Login';
    if (emailInput && role === 'admin') emailInput.value = 'admin@filmfusion.com';
    if (emailInput && role === 'user') emailInput.value = '';
};

window.switchToSignup = function () {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'block';
};

window.switchToLogin = function () {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    if (signupForm) signupForm.style.display = 'none';
    if (loginForm) loginForm.style.display = 'block';
};

window.scrollToSection = function (sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

window.updateMoviePlayer = function (movieData) {
    const playerEl = document.getElementById('moviePlayer');
    if (playerEl && movieData) {
        if (movieData.trailerUrl) {
            const videoId = movieData.trailerUrl.split('v=')[1];
            if (videoId) {
                playerEl.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            } else {
                playerEl.src = `https://www.youtube.com/embed?listType=search&q=${encodeURIComponent(movieData.title + ' full movie')}&autoplay=1`;
            }
        } else {
            playerEl.src = `https://www.youtube.com/embed?listType=search&q=${encodeURIComponent(movieData.title + ' full movie')}&autoplay=1`;
        }
    }
};

window.handleLogin = async function () {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;

    if (window.selectedRole === 'admin') {
        if (email === 'admin@filmfusion.com' && password === 'admin123') {
            localStorage.setItem('userId', '1');
            localStorage.setItem('userName', 'Admin');
            localStorage.setItem('userRole', 'Admin');
            window.location.href = 'admin-dashboard.html';
        } else {
            alert('Invalid admin credentials! Use: admin@filmfusion.com / admin123');
        }
    } else {
        try {
            const res = await fetch(`${API_URL}/Auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('userName', data.username);
                localStorage.setItem('userRole', 'User');
                window.location.href = 'user-dashboard.html';
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }
};

window.handleSignup = async function () {
    const username = document.getElementById('signupUsername')?.value;
    const email = document.getElementById('signupEmail')?.value;
    const password = document.getElementById('signupPassword')?.value;

    try {
        const res = await fetch(`${API_URL}/Auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        if (res.ok) {
            alert('Signup successful! Please login.');
            window.switchToLogin();
        } else {
            alert('Signup failed');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
};

// ========== COMMON FUNCTIONS ==========
window.logout = function () {
    localStorage.clear();
    window.location.href = 'index.html';
};

async function loadMovies() {
    try {
        const res = await fetch(`${API_URL}/Movies`);
        const movies = await res.json();
        displayMovies(movies);
    } catch (e) { console.error(e); }
}

function displayMovies(movies) {
    const grid = document.getElementById('moviesGrid');
    if (!grid) return;
    if (!movies?.length) { grid.innerHTML = '<p>No movies found.</p>'; return; }

    const isAdmin = localStorage.getItem('userRole') === 'Admin';
    grid.innerHTML = movies.map(m => `
        <div class="movie-card" onclick="window.viewMovie(${m.id})" style="cursor:pointer;">
            ${m.posterPath ? `<img src="https://image.tmdb.org/t/p/w200${m.posterPath}" style="width:100%; border-radius:12px;">` : ''}
            <div class="movie-title">${m.title}</div>
            <div class="movie-year">${m.year} • ${m.genre}</div>
            <div class="movie-rating">⭐ ${m.rating}/10</div>
            <p style="font-size:0.9rem; color:#666;">${(m.overview || 'No description.').substring(0, 100)}...</p>
            ${isAdmin ? `<button class="btn btn-danger" onclick="event.stopPropagation(); window.deleteMovie(${m.id})">Delete</button>` : ''}
        </div>
    `).join('');
}

window.viewMovie = function (id) {
    if (id) window.location.href = `watch-movie.html?id=${id}`;
};

window.searchMovies = async function () {
    const q = document.getElementById('searchInput')?.value.trim();
    if (!q) { loadMovies(); return; }
    const res = await fetch(`${API_URL}/Movies/search?query=${encodeURIComponent(q)}`);
    displayMovies(await res.json());
};

window.filterByGenre = async function () {
    const g = document.getElementById('genreFilter')?.value;
    if (!g) { loadMovies(); return; }
    const res = await fetch(`${API_URL}/Movies/genre/${g}`);
    displayMovies(await res.json());
};

window.addMovie = async function () {
    const movie = {
        title: document.getElementById('movieTitle')?.value,
        genre: document.getElementById('movieGenre')?.value,
        year: parseInt(document.getElementById('movieYear')?.value),
        rating: parseFloat(document.getElementById('movieRating')?.value),
        description: document.getElementById('movieDescription')?.value,
        tags: document.getElementById('movieTags')?.value
    };
    const res = await fetch(`${API_URL}/Movies`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(movie) });
    if (res.ok) { alert('Movie added!'); closeModals(); loadMovies(); }
    else alert('Failed');
};

window.deleteMovie = async function (id) {
    if (!confirm('Delete this movie?')) return;
    const res = await fetch(`${API_URL}/Movies/${id}`, { method: 'DELETE' });
    if (res.ok) { alert('Deleted!'); loadMovies(); }
    else alert('Failed');
};

function closeModals() {
    ['loginModal', 'signupModal', 'addMovieModal', 'importModal'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

window.showAddMovieModal = function () {
    const modal = document.getElementById('addMovieModal');
    if (modal) modal.style.display = 'flex';
};

window.showImportModal = function () {
    const modal = document.getElementById('importModal');
    if (modal) modal.style.display = 'flex';
};

// ========== WATCH MOVIE PAGE FUNCTIONS ==========
let currentMovieId = null;

async function loadMovieForWatch() {
    const urlParams = new URLSearchParams(window.location.search);
    currentMovieId = urlParams.get('id');
    if (!currentMovieId) return;

    const res = await fetch(`${API_URL}/Movies/${currentMovieId}`);
    const movie = await res.json();

    const titleEl = document.getElementById('movieTitle');
    const overviewEl = document.getElementById('movieOverview');
    const ratingEl = document.getElementById('movieRating');
    const genreEl = document.getElementById('movieGenre');
    const directorEl = document.getElementById('movieDirector');
    const castEl = document.getElementById('movieCast');
    const playerEl = document.getElementById('moviePlayer');

    if (titleEl) titleEl.innerText = movie.title;
    if (overviewEl) overviewEl.innerText = movie.overview || 'No description.';
    if (ratingEl) ratingEl.innerText = movie.rating;
    if (genreEl) genreEl.innerText = movie.genre;
    if (directorEl) directorEl.innerText = movie.director || 'N/A';
    if (castEl) castEl.innerText = movie.cast || 'N/A';

    if (playerEl) {
        if (movie.trailerUrl) {
            const videoId = movie.trailerUrl.split('v=')[1];
            if (videoId) {
                playerEl.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            } else {
                playerEl.src = `https://www.youtube.com/embed?listType=search&q=${encodeURIComponent(movie.title + ' full movie')}&autoplay=1`;
            }
        } else {
            playerEl.src = `https://www.youtube.com/embed?listType=search&q=${encodeURIComponent(movie.title + ' full movie')}&autoplay=1`;
        }
    }

    if (window.updateMoviePlayer) {
        window.updateMoviePlayer(movie);
    }
    loadCommentsForWatch();
}

async function loadCommentsForWatch() {
    if (!currentMovieId) return;
    const res = await fetch(`${API_URL}/Movies/${currentMovieId}/comments`);
    const comments = await res.json();
    const container = document.getElementById('commentsList');
    if (!container) return;
    if (!comments?.length) { container.innerHTML = '<p>No comments yet.</p>'; return; }
    container.innerHTML = comments.map(c => `
        <div style="padding:0.8rem; border-bottom:1px solid #ddd;">
            <strong>${c.username || 'User'}</strong>
            <div style="margin-top:0.3rem;">${c.comment}</div>
            <div style="font-size:0.8rem; color:#888;">${new Date(c.commentDate).toLocaleString()}</div>
        </div>
    `).join('');
}

window.addCommentForWatch = async function () {
    const input = document.getElementById('commentInput');
    const comment = input?.value.trim();
    if (!comment) return;
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    await fetch(`${API_URL}/Movies/comment`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(userId), movieId: parseInt(currentMovieId), comment })
    });
    if (input) input.value = '';
    loadCommentsForWatch();
    alert('Comment added!');
};

window.likeMovie = function () { alert('👍 Thanks for liking!'); };
window.dislikeMovie = function () { alert('👎 Sorry you disliked!'); };

window.toggleFavorite = async function () {
    const userId = localStorage.getItem('userId');
    if (!userId || !currentMovieId) return;
    await fetch(`${API_URL}/Movies/favorite`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(userId), movieId: parseInt(currentMovieId) })
    });
    alert('❤️ Added to favorites!');
};

window.toggleWatchlist = async function () {
    const userId = localStorage.getItem('userId');
    if (!userId || !currentMovieId) return;
    await fetch(`${API_URL}/Movies/watchlist`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(userId), movieId: parseInt(currentMovieId) })
    });
    alert('📝 Added to watchlist!');
};

window.markAsWatched = async function () {
    const userId = localStorage.getItem('userId');
    if (!userId || !currentMovieId) return;
    await fetch(`${API_URL}/Movies/watched`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parseInt(userId), movieId: parseInt(currentMovieId) })
    });
    alert('✅ Marked as watched!');
};

// ========== FAVORITES PAGE ==========
async function loadFavorites() {
    const userId = localStorage.getItem('userId');
    const res = await fetch(`${API_URL}/Movies/favorites/${userId}`);
    const movies = await res.json();
    const grid = document.getElementById('favoritesGrid');
    if (!grid) return;
    if (!movies?.length) { grid.innerHTML = '<p>No favorites yet.</p>'; return; }
    grid.innerHTML = movies.map(m => `
        <div class="movie-card" onclick="window.viewMovie(${m.id})" style="cursor:pointer;">
            ${m.posterPath ? `<img src="https://image.tmdb.org/t/p/w200${m.posterPath}" style="width:100%; border-radius:12px;">` : ''}
            <div class="movie-title">${m.title}</div>
            <div class="movie-year">${m.year} • ${m.genre}</div>
            <div class="movie-rating">⭐ ${m.rating}/10</div>
            <button class="btn btn-danger" onclick="event.stopPropagation(); removeFromFavorites(${m.id})">Remove</button>
        </div>
    `).join('');
}

async function removeFromFavorites(movieId) {
    const userId = localStorage.getItem('userId');
    await fetch(`${API_URL}/Movies/favorite?userId=${userId}&movieId=${movieId}`, { method: 'DELETE' });
    loadFavorites();
    alert('Removed from favorites');
}

// ========== WATCHLIST PAGE ==========
async function loadWatchlist() {
    const userId = localStorage.getItem('userId');
    const res = await fetch(`${API_URL}/Movies/watchlist/${userId}`);
    const movies = await res.json();
    const grid = document.getElementById('watchlistGrid');
    if (!grid) return;
    if (!movies?.length) { grid.innerHTML = '<p>Watchlist empty.</p>'; return; }
    grid.innerHTML = movies.map(m => `
        <div class="movie-card" onclick="window.viewMovie(${m.id})" style="cursor:pointer;">
            ${m.posterPath ? `<img src="https://image.tmdb.org/t/p/w200${m.posterPath}" style="width:100%; border-radius:12px;">` : ''}
            <div class="movie-title">${m.title}</div>
            <div class="movie-year">${m.year} • ${m.genre}</div>
            <div class="movie-rating">⭐ ${m.rating}/10</div>
            <button class="btn btn-danger" onclick="event.stopPropagation(); removeFromWatchlist(${m.id})">Remove</button>
        </div>
    `).join('');
}

async function removeFromWatchlist(movieId) {
    const userId = localStorage.getItem('userId');
    await fetch(`${API_URL}/Movies/watchlist?userId=${userId}&movieId=${movieId}`, { method: 'DELETE' });
    loadWatchlist();
    alert('Removed from watchlist');
}

// ========== ADMIN FUNCTIONS ==========
async function loadDashboardStats() {
    const res = await fetch(`${API_URL}/Admin/dashboard`);
    const stats = await res.json();
    const grid = document.getElementById('statsGrid');
    if (grid) grid.innerHTML = `
        <div class="stat-card"><div class="stat-number">${stats.totalUsers}</div><div>Total Users</div></div>
        <div class="stat-card"><div class="stat-number">${stats.totalMovies}</div><div>Total Movies</div></div>
    `;
}

async function loadAllUsers() {
    const res = await fetch(`${API_URL}/Admin/users`);
    const users = await res.json();
    const container = document.getElementById('usersList');
    if (!container) return;
    if (!users?.length) { container.innerHTML = '<p>No users.</p>'; return; }
    let html = '<table style="width:100%; border-collapse:collapse;"><tr style="background:#f0f0f0;"><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Action</th></tr>';
    for (let u of users) {
        html += `<tr><td style="padding:0.5rem;">${u.id}</td><td style="padding:0.5rem;">${u.username}</td><td style="padding:0.5rem;">${u.email}</td><td style="padding:0.5rem;">${u.role}</td><td style="padding:0.5rem;"><button class="btn btn-danger" onclick="deleteUser(${u.id})">Delete</button></td></tr>`;
    }
    html += '</table>';
    container.innerHTML = html;
}

async function deleteUser(id) {
    if (!confirm('Delete user?')) return;
    const res = await fetch(`${API_URL}/Admin/user/${id}`, { method: 'DELETE' });
    if (res.ok) { loadAllUsers(); loadDashboardStats(); alert('User deleted'); }
}

// ========== TMDB IMPORT ==========
window.searchTMDB = async function () {
    const q = document.getElementById('tmdbSearchQuery')?.value;
    if (!q) return;
    const res = await fetch(`${API_URL}/Movies/search-tmdb?query=${encodeURIComponent(q)}`);
    const results = await res.json();
    const container = document.getElementById('tmdbResults');
    if (container) {
        let html = '';
        for (let m of results) {
            html += `<div style="display:flex; justify-content:space-between; padding:5px; border-bottom:1px solid #ddd;">
                <span>${m.title} (${m.release_date?.split('-')[0] || 'N/A'})</span>
                <button onclick="importMovie(${m.id})">Import</button>
            </div>`;
        }
        container.innerHTML = html;
    }
};

window.importMovie = async function (tmdbId) {
    const res = await fetch(`${API_URL}/Movies/import/${tmdbId}`, { method: 'POST' });
    if (res.ok) { alert('Movie imported!'); closeModals(); loadMovies(); }
    else alert('Import failed');
};

// ========== REAL GEMINI AI CHATBOT FUNCTIONS ==========
window.sendMessage = async function () {
    const input = document.getElementById('chatInput');
    const msg = input?.value.trim();
    if (!msg) return;

    addMessage(msg, 'user');
    if (input) input.value = '';
    addTypingIndicator();

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `You are a friendly movie recommendation AI. User: "${msg}". Respond helpfully with movie suggestions.` }]
                }]
            })
        });
        const data = await response.json();
        removeTypingIndicator();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || getFallbackResponse(msg);
        addMessage(aiText, 'bot');

        const movies = await getMovieRecommendations(msg);
        if (movies?.length) showRecommendations(movies);
    } catch (error) {
        removeTypingIndicator();
        addMessage(getFallbackResponse(msg), 'bot');
    }
};

function getFallbackResponse(query) {
    const q = query.toLowerCase();
    if (q.includes('horror')) return "🎬 Horror movies: The Conjuring (2013), Hereditary (2018), Get Out (2017)";
    if (q.includes('comedy')) return "😂 Comedy movies: Superbad (2007), The Hangover (2009), Crazy Rich Asians (2018)";
    if (q.includes('action')) return "💥 Action movies: John Wick (2014), Mad Max (2015), The Dark Knight (2008)";
    if (q.includes('romance')) return "💕 Romance movies: The Notebook (2004), La La Land (2016), Crazy Rich Asians (2018)";
    return "🎬 Tell me what you're in the mood for! Horror, comedy, action, romance, or just how you feel (happy, sad, excited).";
}

function addMessage(text, sender) {
    const chat = document.getElementById('chatMessages');
    if (!chat) return;
    const div = document.createElement('div');
    div.className = `message ${sender}-message`;
    div.innerHTML = `<div class="message-content">${text.replace(/\n/g, '<br>')}</div>`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function addTypingIndicator() {
    const chat = document.getElementById('chatMessages');
    if (!chat) return;
    const div = document.createElement('div');
    div.className = 'message bot-message';
    div.id = 'typingIndicator';
    div.innerHTML = '<div class="message-content">🤔 Thinking<span>.</span><span>.</span><span>.</span></div>';
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function removeTypingIndicator() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
}

async function getMovieRecommendations(query) {
    const q = query.toLowerCase();
    let genre = '';
    if (q.includes('horror')) genre = 'horror';
    else if (q.includes('comedy')) genre = 'comedy';
    else if (q.includes('action')) genre = 'action';
    else if (q.includes('romance')) genre = 'romance';
    try {
        if (genre) {
            const res = await fetch(`${API_URL}/Movies/genre/${genre}`);
            const movies = await res.json();
            return movies.slice(0, 4);
        }
        const res = await fetch(`${API_URL}/Movies`);
        const movies = await res.json();
        movies.sort((a, b) => b.rating - a.rating);
        return movies.slice(0, 4);
    } catch (e) { return []; }
}

function showRecommendations(movies) {
    const section = document.getElementById('recommendationsSection');
    const grid = document.getElementById('recommendationsGrid');
    if (!section || !grid) return;
    if (movies?.length) {
        section.style.display = 'block';
        grid.innerHTML = movies.map(m => `
            <div class="movie-card" onclick="window.viewMovie(${m.id})" style="cursor:pointer;">
                <div class="movie-title">${m.title}</div>
                <div class="movie-year">${m.year} • ${m.genre}</div>
                <div class="movie-rating">⭐ ${m.rating}/10</div>
            </div>
        `).join('');
    } else {
        section.style.display = 'none';
    }
}

// ========== PROFILE PAGE FUNCTIONS ==========
let currentUserData = null;

window.loadProfile = async function () {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    try {
        const res = await fetch(`${API_URL}/Auth/profile/${userId}`);
        const user = await res.json();
        currentUserData = user;
        const nameEl = document.getElementById('profileName');
        const emailEl = document.getElementById('profileEmail');
        const roleEl = document.getElementById('profileUserRole');
        const bioEl = document.getElementById('profileBio');
        const joinedEl = document.getElementById('profileJoined');
        const avatarEl = document.getElementById('profileAvatar');
        if (nameEl) nameEl.innerText = user.username || 'User';
        if (emailEl) emailEl.innerText = user.email || '-';
        if (roleEl) roleEl.innerText = user.role || 'User';
        if (bioEl) bioEl.innerHTML = user.bio || 'No bio yet.';
        if (user.createdAt && joinedEl) {
            joinedEl.innerText = new Date(user.createdAt).toLocaleDateString();
        }
        if (avatarEl) {
            avatarEl.src = user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'User')}&background=9b59b6&color=fff`;
        }
    } catch (e) { console.error(e); }
    // ========== AVATAR UPLOAD FUNCTIONS (Gallery + Camera) ==========
    window.handleGalleryUpload = function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imageUrl = e.target.result;
                window.setAvatar(imageUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    window.handleCameraUpload = function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const imageUrl = e.target.result;
                window.setAvatar(imageUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    // Updated setAvatar to handle base64 images
    window.setAvatar = async function (url) {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        try {
            const response = await fetch(`${API_URL}/Auth/profile/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profilePicture: url })
            });

            if (response.ok) {
                const avatarEl = document.getElementById('profileAvatar');
                if (avatarEl) avatarEl.src = url;
                window.closeAvatarModal();
                alert('✅ Profile picture updated!');

                // Clear file inputs
                const galleryInput = document.getElementById('galleryInput');
                const cameraInput = document.getElementById('cameraInput');
                if (galleryInput) galleryInput.value = '';
                if (cameraInput) cameraInput.value = '';
            } else {
                alert('❌ Failed to update profile picture');
            }
        } catch (error) {
            alert('❌ Error: ' + error.message);
        }
    };
};

window.openEditModal = function () {
    if (currentUserData) {
        const usernameEl = document.getElementById('editUsername');
        const emailEl = document.getElementById('editEmail');
        const bioEl = document.getElementById('editBio');
        const modal = document.getElementById('editModal');
        if (usernameEl) usernameEl.value = currentUserData.username || '';
        if (emailEl) emailEl.value = currentUserData.email || '';
        if (bioEl) bioEl.value = currentUserData.bio || '';
        if (modal) modal.style.display = 'flex';
    }
};

window.closeEditModal = function () {
    const modal = document.getElementById('editModal');
    if (modal) modal.style.display = 'none';
};

window.saveProfile = async function () {
    const userId = localStorage.getItem('userId');
    const username = document.getElementById('editUsername')?.value;
    const email = document.getElementById('editEmail')?.value;
    const bio = document.getElementById('editBio')?.value;
    if (!username || !email) { alert('Username and email required'); return; }
    const res = await fetch(`${API_URL}/Auth/profile/${userId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, bio })
    });
    if (res.ok) {
        alert('Profile updated!');
        window.closeEditModal();
        window.loadProfile();
        localStorage.setItem('userName', username);
    } else { alert('Update failed'); }
};

const avatarList = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
];

window.openAvatarModal = function () {
    const container = document.getElementById('avatarOptions');
    const modal = document.getElementById('avatarModal');
    if (container) {
        container.innerHTML = avatarList.map(url => `<img src="${url}" class="avatar-option" onclick="window.setAvatar('${url}')">`).join('');
    }
    if (modal) modal.style.display = 'flex';
};

window.closeAvatarModal = function () {
    const modal = document.getElementById('avatarModal');
    if (modal) modal.style.display = 'none';
};

window.setAvatar = async function (url) {
    const userId = localStorage.getItem('userId');
    const res = await fetch(`${API_URL}/Auth/profile/${userId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePicture: url })
    });
    if (res.ok) {
        const avatarEl = document.getElementById('profileAvatar');
        if (avatarEl) avatarEl.src = url;
        window.closeAvatarModal();
        alert('Avatar updated!');
    }
};

window.setCustomAvatar = async function () {
    const url = document.getElementById('avatarUrlInput')?.value;
    if (url) await window.setAvatar(url);
    else alert('Enter a valid URL');
};

// ========== PAGE INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('moviesGrid') && !document.getElementById('statsGrid')) {
        if (!localStorage.getItem('userId')) window.location.href = 'index.html';
        loadMovies();
    }
    if (document.getElementById('statsGrid')) {
        const role = localStorage.getItem('userRole');
        if (role !== 'Admin') window.location.href = 'index.html';
        loadDashboardStats(); loadAllUsers(); loadMovies();
    }
    if (document.getElementById('favoritesGrid')) loadFavorites();
    if (document.getElementById('watchlistGrid')) loadWatchlist();
    if (document.getElementById('moviePlayer')) {
        if (!localStorage.getItem('userId')) window.location.href = 'index.html';
        else loadMovieForWatch();
    }
    if (document.getElementById('profileName') && localStorage.getItem('userId')) window.loadProfile();

    window.onclick = (e) => {
        if (e.target?.classList?.contains('modal-overlay')) e.target.style.display = 'none';
    };
});