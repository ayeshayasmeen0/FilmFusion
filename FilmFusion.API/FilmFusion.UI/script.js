// @ts-nocheck
const API_URL = 'https://localhost:7249/api';

// ========== PARTICLES ANIMATION ==========
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 6 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = Math.random() * 10 + 10 + 's';
        particlesContainer.appendChild(particle);
    }
}

// ========== WELCOME PAGE FUNCTIONS ==========
function setupWelcomePage() {
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const homeNav = document.getElementById('homeNav');
    const featuresNav = document.getElementById('featuresNav');
    const aboutNav = document.getElementById('aboutNav');
    const getStartedBtn = document.getElementById('getStartedBtn');
    const exploreFeaturesBtn = document.getElementById('exploreFeaturesBtn');
    const scrollIndicator = document.getElementById('scrollIndicator');
    if (homeNav) homeNav.onclick = (e) => { e.preventDefault(); scrollToSection('home'); };
    if (featuresNav) featuresNav.onclick = (e) => { e.preventDefault(); scrollToSection('features'); };
    if (aboutNav) aboutNav.onclick = (e) => { e.preventDefault(); scrollToSection('about'); };
    if (getStartedBtn) getStartedBtn.onclick = () => { window.location.href = 'index.html'; };
    if (exploreFeaturesBtn) exploreFeaturesBtn.onclick = () => scrollToSection('features');
    if (scrollIndicator) scrollIndicator.onclick = () => scrollToSection('features');
}

// ========== INDEX PAGE UI FUNCTIONS ==========
function setupFormSwitching() {
    const showSignupBtn = document.getElementById('showSignupBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    if (showSignupBtn) showSignupBtn.onclick = () => { loginForm.style.display = 'none'; signupForm.style.display = 'block'; };
    if (showLoginBtn) showLoginBtn.onclick = () => { signupForm.style.display = 'none'; loginForm.style.display = 'block'; };
}

function setupAdminModal() {
    const adminLink = document.getElementById('adminLink');
    const adminModal = document.getElementById('adminModal');
    const closeAdminModal = document.getElementById('closeAdminModal');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    if (adminLink) adminLink.onclick = (e) => { e.preventDefault(); adminModal.style.display = 'flex'; };
    if (closeAdminModal) closeAdminModal.onclick = () => { adminModal.style.display = 'none'; };
    if (adminLoginBtn) adminLoginBtn.onclick = () => {
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        if (email === 'admin@filmfusion.com' && password === 'admin123') {
            localStorage.setItem('userId', '1');
            localStorage.setItem('userName', 'Admin');
            localStorage.setItem('userRole', 'Admin');
            window.location.href = 'admin-dashboard.html';
        } else alert('Invalid admin credentials! Use: admin@filmfusion.com / admin123');
    };
}

function setupForgotPassword() {
    const forgotLink = document.getElementById('forgotPassword');
    if (forgotLink) forgotLink.onclick = (e) => { e.preventDefault(); alert('Contact admin to reset password: admin@filmfusion.com'); };
}

// ========== USER LOGIN/SIGNUP ==========
async function handleUserLogin(email, password) {
    try {
        const res = await fetch(`${API_URL}/Auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userName', data.username);
            localStorage.setItem('userRole', 'User');
            window.location.href = 'user-dashboard.html';
        } else alert(data.message || 'Login failed');
    } catch (err) { alert('Error: ' + err.message); }
}

async function handleUserSignup(username, email, password, confirmPassword) {
    if (password !== confirmPassword) { alert('Passwords do not match!'); return; }
    if (password.length < 6) { alert('Password must be at least 6 characters'); return; }
    try {
        const res = await fetch(`${API_URL}/Auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password }) });
        if (res.ok) {
            alert('Signup successful! Please login.');
            const loginForm = document.getElementById('loginForm');
            const signupForm = document.getElementById('signupForm');
            if (loginForm) loginForm.style.display = 'block';
            if (signupForm) signupForm.style.display = 'none';
        } else { const data = await res.json(); alert('Signup failed: ' + (data.message || 'Try different email')); }
    } catch (err) { alert('Error: ' + err.message); }
}

function setupUserAuthButtons() {
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const signupSubmitBtn = document.getElementById('signupSubmitBtn');
    if (loginSubmitBtn) loginSubmitBtn.onclick = () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        if (!email || !password) { alert('Please enter email and password'); return; }
        handleUserLogin(email, password);
    };
    if (signupSubmitBtn) signupSubmitBtn.onclick = () => {
        const username = document.getElementById('signupUsername').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        if (!username || !email || !password) { alert('Please fill all fields'); return; }
        handleUserSignup(username, email, password, confirmPassword);
    };
}

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
            playerEl.src = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : `https://www.youtube.com/embed?listType=search&q=${encodeURIComponent(movie.title + ' full movie')}&autoplay=1`;
        } else {
            playerEl.src = `https://www.youtube.com/embed?listType=search&q=${encodeURIComponent(movie.title + ' full movie')}&autoplay=1`;
        }
    }
    await loadCommentsForWatch();
    if (window.updateMoviePlayer) window.updateMoviePlayer(movie);
}

window.loadCommentsForWatch = async function () {
    if (!currentMovieId) return;
    try {
        const res = await fetch(`${API_URL}/Movies/${currentMovieId}/comments-with-details?sortBy=latest`);
        const data = await res.json();
        const container = document.getElementById('commentsList');
        const countSpan = document.getElementById('commentsCount');
        if (!container) return;
        if (!data.comments || data.comments.length === 0) {
            container.innerHTML = '<div class="no-comments">No comments yet. Be the first to comment!</div>';
            if (countSpan) countSpan.innerText = '0 Comments';
            return;
        }
        if (countSpan) countSpan.innerText = `${data.totalCount} Comment${data.totalCount !== 1 ? 's' : ''}`;
        const currentUser = localStorage.getItem('userName');
        const userId = localStorage.getItem('userId');
        for (let comment of data.comments) {
            try {
                const likeStatusRes = await fetch(`${API_URL}/Movies/comment/${comment.id}/like-status`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: parseInt(userId) })
                });
                const likeStatus = await likeStatusRes.json();
                comment.hasUserLiked = likeStatus.hasLiked;
            } catch (e) { comment.hasUserLiked = false; }
            try {
                const repliesRes = await fetch(`${API_URL}/Movies/comment/${comment.id}/replies`);
                comment.replies = await repliesRes.json();
            } catch (e) { comment.replies = []; }
        }
        container.innerHTML = data.comments.map(c => `
            <div class="comment-item" data-comment-id="${c.id}">
                <div class="comment-main">
                    <div class="comment-avatar-small">
                        <img src="${c.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.username || 'U')}&background=3a86ff&color=fff&bold=true&size=36`}" alt="${c.username}">
                    </div>
                    <div class="comment-content">
                        <div class="comment-user">
                            <span class="comment-user-name">${escapeHtml(c.username || 'User')}</span>
                            <span class="comment-user-time">${new Date(c.commentDate).toLocaleString()}</span>
                        </div>
                        <div class="comment-text" id="comment-text-${c.id}">${escapeHtml(c.comment)}</div>
                        <div class="comment-stats">
                            <span class="like-count" id="likes-count-${c.id}">${c.likesCount || 0} ${c.likesCount === 1 ? 'like' : 'likes'}</span>
                        </div>
                        <div class="comment-actions-small">
                            <button class="like-btn-small ${c.hasUserLiked ? 'liked' : ''}" onclick="toggleCommentLike(${c.id})">
                                ${c.hasUserLiked ? '❤️ Liked' : '👍 Like'}
                            </button>
                            <button class="reply-btn" onclick="showReplyInput(${c.id})">💬 Reply</button>
                            ${c.username === currentUser ? `
                            <div class="comment-menu">
                                <button class="comment-menu-btn" onclick="toggleCommentMenu(${c.id})">⋮</button>
                                <div class="comment-menu-content" id="menu-${c.id}">
                                    <span onclick="editComment(${c.id}, '${escapeHtml(c.comment).replace(/'/g, "\\'")}')">✏️ Edit</span>
                                    <span onclick="deleteComment(${c.id})">🗑️ Delete</span>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                        <div id="reply-input-${c.id}" class="reply-input-area" style="display: none;">
                            <input type="text" id="reply-text-${c.id}" class="reply-input" placeholder="Write a reply...">
                            <button class="reply-submit" onclick="submitReply(${c.id})">Reply</button>
                            <button class="cancel-reply" onclick="cancelReply(${c.id})">Cancel</button>
                        </div>
                        <div id="replies-${c.id}" class="replies-section">
                            ${c.replies && c.replies.length > 0 ? `
                                <button class="show-replies-btn" onclick="toggleReplies(${c.id})">
                                    ▼ Show ${c.replies.length} ${c.replies.length === 1 ? 'reply' : 'replies'}
                                </button>
                                <div id="replies-list-${c.id}" style="display: none;">
                                    ${c.replies.map(r => `
                                        <div class="reply-item">
                                            <div class="reply-avatar">
                                                <img src="${r.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.username || 'U')}&background=64b4fa&color=fff&size=28`}" alt="${r.username}">
                                            </div>
                                            <div class="reply-content">
                                                <div>
                                                    <span class="reply-user-name">${escapeHtml(r.username || 'User')}</span>
                                                    <span class="reply-time">${new Date(r.createdAt).toLocaleString()}</span>
                                                </div>
                                                <div class="reply-text">${escapeHtml(r.replyText)}</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        await loadNotificationCount();
    } catch (error) { console.error('Error loading comments:', error); }
};

window.toggleCommentLike = async function (commentId) {
    const userId = localStorage.getItem('userId');
    if (!userId) { alert('Please login to like comments'); return; }
    try {
        const response = await fetch(`${API_URL}/Movies/comment/${commentId}/like`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: parseInt(userId) })
        });
        if (response.ok) {
            const likeCountRes = await fetch(`${API_URL}/Movies/comment/${commentId}/likes-count`);
            const countData = await likeCountRes.json();
            const likeBtn = document.querySelector(`.comment-item[data-comment-id="${commentId}"] .like-btn-small`);
            const likesCountSpan = document.getElementById(`likes-count-${commentId}`);
            if (likeBtn) {
                const isLiked = likeBtn.innerHTML.includes('❤️');
                likeBtn.innerHTML = isLiked ? '👍 Like' : '❤️ Liked';
                if (isLiked) likeBtn.classList.remove('liked');
                else likeBtn.classList.add('liked');
            }
            if (likesCountSpan) likesCountSpan.innerText = `${countData.likesCount} ${countData.likesCount === 1 ? 'like' : 'likes'}`;
        }
    } catch (error) { console.error('Error liking comment:', error); alert('Error liking comment'); }
};

window.submitReply = async function (commentId) {
    const userId = localStorage.getItem('userId');
    if (!userId) { alert('Please login to reply'); return; }
    const replyText = document.getElementById(`reply-text-${commentId}`)?.value.trim();
    if (!replyText) { alert('Please write a reply'); return; }
    try {
        const response = await fetch(`${API_URL}/Movies/comment/${commentId}/reply`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: parseInt(userId), replyText: replyText })
        });
        if (response.ok) {
            document.getElementById(`reply-text-${commentId}`).value = '';
            cancelReply(commentId);
            await loadRepliesForComment(commentId);
            alert('Reply added!');
        } else alert('Failed to add reply');
    } catch (error) { console.error('Error adding reply:', error); alert('Error adding reply'); }
};

async function loadRepliesForComment(commentId) {
    try {
        const res = await fetch(`${API_URL}/Movies/comment/${commentId}/replies`);
        const replies = await res.json();
        const repliesContainer = document.getElementById(`replies-${commentId}`);
        if (repliesContainer) {
            if (replies && replies.length > 0) {
                repliesContainer.innerHTML = `
                    <button class="show-replies-btn" onclick="toggleReplies(${commentId})">
                        ▼ Show ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}
                    </button>
                    <div id="replies-list-${commentId}" style="display: none;">
                        ${replies.map(r => `
                            <div class="reply-item">
                                <div class="reply-avatar">
                                    <img src="${r.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.username || 'U')}&background=64b4fa&color=fff&size=28`}" alt="${r.username}">
                                </div>
                                <div class="reply-content">
                                    <div>
                                        <span class="reply-user-name">${escapeHtml(r.username || 'User')}</span>
                                        <span class="reply-time">${new Date(r.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div class="reply-text">${escapeHtml(r.replyText)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else repliesContainer.innerHTML = '';
        }
    } catch (error) { console.error('Error loading replies:', error); }
}

window.showReplyInput = function (commentId) {
    document.querySelectorAll('.reply-input-area').forEach(div => {
        if (div.id !== `reply-input-${commentId}`) div.style.display = 'none';
    });
    const replyDiv = document.getElementById(`reply-input-${commentId}`);
    if (replyDiv) { replyDiv.style.display = 'flex'; document.getElementById(`reply-text-${commentId}`)?.focus(); }
};

window.cancelReply = function (commentId) {
    const replyDiv = document.getElementById(`reply-input-${commentId}`);
    if (replyDiv) {
        replyDiv.style.display = 'none';
        const input = document.getElementById(`reply-text-${commentId}`);
        if (input) input.value = '';
    }
};

window.toggleReplies = function (commentId) {
    const repliesList = document.getElementById(`replies-list-${commentId}`);
    const showBtn = document.querySelector(`#replies-${commentId} .show-replies-btn`);
    if (repliesList) {
        if (repliesList.style.display === 'none') {
            repliesList.style.display = 'block';
            if (showBtn) showBtn.innerHTML = showBtn.innerHTML.replace('▼', '▲').replace('Show', 'Hide');
        } else {
            repliesList.style.display = 'none';
            if (showBtn) showBtn.innerHTML = showBtn.innerHTML.replace('▲', '▼').replace('Hide', 'Show');
        }
    }
};

async function loadNotificationCount() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    try {
        const res = await fetch(`${API_URL}/Movies/notifications/${userId}`);
        const notifications = await res.json();
        const unreadCount = notifications.filter(n => !n.isRead).length;
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            if (unreadCount > 0) { badge.style.display = 'flex'; badge.innerText = unreadCount > 9 ? '9+' : unreadCount; }
            else badge.style.display = 'none';
        }
    } catch (error) { console.error('Error loading notifications:', error); }
}

window.toggleNotifications = async function () {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    try {
        const res = await fetch(`${API_URL}/Movies/notifications/${userId}`);
        const notifications = await res.json();
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:#1a2634; border-radius:16px; padding:1rem; max-width:350px; width:90%; max-height:400px; overflow-y:auto; z-index:1000; border:1px solid #3a86ff;';
        modal.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                <h3 style="color:white;">🔔 Notifications</h3>
                <button onclick="this.parentElement.parentElement.remove()" style="background:transparent; border:none; color:white; font-size:1.2rem; cursor:pointer;">✕</button>
            </div>
            <div>${notifications.map(n => `
                <div class="notification-item" style="padding:0.8rem; border-bottom:1px solid rgba(100,180,250,0.1); ${n.isRead ? 'opacity:0.6;' : ''}">
                    <div style="font-size:0.8rem;">${escapeHtml(n.message)}</div>
                    <div style="font-size:0.65rem; color:rgba(255,255,255,0.5); margin-top:0.2rem;">${new Date(n.createdAt).toLocaleString()}</div>
                </div>
            `).join('') || '<div style="text-align:center; padding:1rem;">No notifications</div>'}</div>
        `;
        document.body.appendChild(modal);
        for (let n of notifications.filter(n => !n.isRead)) {
            await fetch(`${API_URL}/Movies/notifications/${n.id}/read`, { method: 'PUT' });
        }
        await loadNotificationCount();
    } catch (error) { console.error('Error loading notifications:', error); }
};

window.addCommentForWatch = async function () {
    const input = document.getElementById('commentInput');
    const comment = input?.value.trim();
    if (!comment) { alert('Please write a comment'); return; }
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    try {
        const response = await fetch(`${API_URL}/Movies/comment`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: parseInt(userId), movieId: parseInt(currentMovieId), comment })
        });
        if (response.ok) { input.value = ''; await loadCommentsForWatch(); alert('Comment added!'); }
        else alert('Failed to add comment');
    } catch (error) { console.error('Error adding comment:', error); alert('Error adding comment'); }
};

window.editComment = async function (commentId, oldText) {
    const newText = prompt('Edit your comment:', oldText);
    if (!newText || newText === oldText) return;
    try {
        const response = await fetch(`${API_URL}/Movies/comment/${commentId}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment: newText })
        });
        if (response.ok) { await loadCommentsForWatch(); alert('Comment updated!'); }
        else alert('Failed to update comment');
    } catch (error) { console.error('Error editing comment:', error); alert('Error updating comment'); }
};

window.deleteComment = async function (commentId) {
    if (!confirm('Delete this comment?')) return;
    try {
        const response = await fetch(`${API_URL}/Movies/comment/${commentId}`, { method: 'DELETE' });
        if (response.ok) { await loadCommentsForWatch(); alert('Comment deleted!'); }
        else alert('Failed to delete comment');
    } catch (error) { console.error('Error deleting comment:', error); alert('Error deleting comment'); }
};

function toggleCommentMenu(commentId) {
    const menu = document.getElementById(`menu-${commentId}`);
    if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    document.addEventListener('click', function closeMenu(e) {
        if (menu && !menu.contains(e.target) && !e.target.classList.contains('comment-menu-btn')) {
            menu.style.display = 'none';
            document.removeEventListener('click', closeMenu);
        }
    });
}

function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }

window.likeMovie = function () { alert('👍 Thanks for liking!'); };
window.dislikeMovie = function () { alert('👎 Sorry you disliked!'); };
window.toggleFavorite = async function () { const userId = localStorage.getItem('userId'); if (!userId || !currentMovieId) return; await fetch(`${API_URL}/Movies/favorite`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: parseInt(userId), movieId: parseInt(currentMovieId) }) }); alert('❤️ Added to favorites!'); };
window.toggleWatchlist = async function () { const userId = localStorage.getItem('userId'); if (!userId || !currentMovieId) return; await fetch(`${API_URL}/Movies/watchlist`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: parseInt(userId), movieId: parseInt(currentMovieId) }) }); alert('📝 Added to watchlist!'); };
window.markAsWatched = function () { alert('✅ Marked as watched!'); };
window.updateMoviePlayer = function (movieData) { const playerEl = document.getElementById('moviePlayer'); if (playerEl && movieData) { const videoId = movieData.trailerUrl?.split('v=')[1]; playerEl.src = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : `https://www.youtube.com/embed?listType=search&q=${encodeURIComponent(movieData.title + ' full movie')}&autoplay=1`; } };

// ========== MOVIES FUNCTIONS ==========
async function loadMovies() { try { const res = await fetch(`${API_URL}/Movies`); const movies = await res.json(); displayMovies(movies); } catch (e) { console.error(e); } }
function displayMovies(movies) {
    const grid = document.getElementById('moviesGrid');
    if (!grid) return;
    if (!movies?.length) { grid.innerHTML = '<p>No movies found.</p>'; return; }
    const isAdmin = localStorage.getItem('userRole') === 'Admin';
    grid.innerHTML = movies.map(m => `<div class="movie-card" onclick="window.viewMovie(${m.id})" style="cursor:pointer;">${m.posterPath ? `<img src="https://image.tmdb.org/t/p/w200${m.posterPath}" style="width:100%; border-radius:12px;">` : ''}<div class="movie-title">${m.title}</div><div class="movie-year">${m.year} • ${m.genre}</div><div class="movie-rating">⭐ ${m.rating}/10</div><p style="font-size:0.9rem; color:#666;">${(m.overview || 'No description.').substring(0, 100)}...</p>${isAdmin ? `<button class="btn btn-danger" onclick="event.stopPropagation(); window.deleteMovie(${m.id})">Delete</button>` : ''}</div>`).join('');
}
window.viewMovie = function (id) { if (id) window.location.href = `watch-movie.html?id=${id}`; };
window.searchMovies = async function () { const q = document.getElementById('searchInput')?.value.trim(); if (!q) { loadMovies(); return; } const res = await fetch(`${API_URL}/Movies/search?query=${encodeURIComponent(q)}`); displayMovies(await res.json()); };
window.filterByGenre = async function () { const g = document.getElementById('genreFilter')?.value; if (!g) { loadMovies(); return; } const res = await fetch(`${API_URL}/Movies/genre/${g}`); displayMovies(await res.json()); };
window.addMovie = async function () { const movie = { title: document.getElementById('movieTitle')?.value, genre: document.getElementById('movieGenre')?.value, year: parseInt(document.getElementById('movieYear')?.value), rating: parseFloat(document.getElementById('movieRating')?.value), description: document.getElementById('movieDescription')?.value, tags: document.getElementById('movieTags')?.value }; const res = await fetch(`${API_URL}/Movies`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(movie) }); if (res.ok) { alert('Movie added!'); closeModals(); loadMovies(); } else alert('Failed'); };
window.deleteMovie = async function (id) { if (!confirm('Delete this movie?')) return; const res = await fetch(`${API_URL}/Movies/${id}`, { method: 'DELETE' }); if (res.ok) { alert('Deleted!'); loadMovies(); } else alert('Failed'); };
function closeModals() { ['loginModal', 'signupModal', 'addMovieModal', 'importModal'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; }); }
window.showAddMovieModal = function () { const modal = document.getElementById('addMovieModal'); if (modal) modal.style.display = 'flex'; };
window.showImportModal = function () { const modal = document.getElementById('importModal'); if (modal) modal.style.display = 'flex'; };

// ========== FAVORITES PAGE ==========
async function loadFavorites() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    try {
        const res = await fetch(`${API_URL}/Movies/favorites/${userId}`);
        const movies = await res.json();
        const grid = document.getElementById('favoritesGrid');
        if (!grid) return;
        if (!movies || movies.length === 0) { grid.innerHTML = `<div class="empty-state"><div class="empty-icon">❤️</div><h3>No favorites yet</h3><p>Start adding movies to your favorites!</p><button class="btn-explore" onclick="window.location.href='user-dashboard.html'">Explore Movies →</button></div>`; return; }
        grid.innerHTML = movies.map(m => `<div class="movie-card" onclick="window.viewMovie(${m.id})"><div class="movie-poster">${m.posterPath ? `<img src="https://image.tmdb.org/t/p/w500${m.posterPath}" alt="${m.title}">` : `<img src="https://via.placeholder.com/500x750/1a2634/64b4fa?text=${encodeURIComponent(m.title)}" alt="${m.title}">`}<div class="rating-badge">⭐ ${m.rating}/10</div><button class="remove-fav-btn" onclick="event.stopPropagation(); removeFromFavorites(${m.id})">🗑️</button><div class="heart-icon-badge">❤️</div></div><div class="movie-info"><div class="movie-title">${m.title}</div><div class="movie-year">${m.year || 'N/A'}</div><div class="movie-genre">${m.genre ? m.genre.split(',').slice(0, 2).map(g => `<span>${g.trim()}</span>`).join('') : '<span>No genre</span>'}</div></div></div>`).join('');
    } catch (e) { console.error(e); }
}
async function removeFromFavorites(movieId) { const userId = localStorage.getItem('userId'); if (!userId) { alert('Please login first'); return; } try { const response = await fetch(`${API_URL}/Movies/favorite?userId=${userId}&movieId=${movieId}`, { method: 'DELETE' }); if (response.ok) { alert('✅ Removed from favorites!'); loadFavorites(); } else alert('❌ Failed to remove from favorites'); } catch (error) { console.error('Error removing from favorites:', error); alert('❌ Error removing from favorites'); } }
window.removeFromFavorites = removeFromFavorites;

// ========== WATCHLIST PAGE ==========
async function loadWatchlist() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    try {
        const res = await fetch(`${API_URL}/Movies/watchlist/${userId}`);
        const movies = await res.json();
        const grid = document.getElementById('watchlistGrid');
        if (!grid) return;
        if (!movies || movies.length === 0) { grid.innerHTML = `<div class="empty-state"><div class="empty-icon">📝</div><h3>Watchlist empty</h3><p>Start adding movies to your watchlist!</p><button class="btn-explore" onclick="window.location.href='user-dashboard.html'">Explore Movies →</button></div>`; return; }
        grid.innerHTML = movies.map(m => `<div class="movie-card" onclick="window.viewMovie(${m.id})"><div class="movie-poster">${m.posterPath ? `<img src="https://image.tmdb.org/t/p/w500${m.posterPath}" alt="${m.title}">` : `<img src="https://via.placeholder.com/500x750/1a2634/64b4fa?text=${encodeURIComponent(m.title)}" alt="${m.title}">`}<div class="rating-badge">⭐ ${m.rating}/10</div><button class="remove-watchlist-btn" onclick="event.stopPropagation(); removeFromWatchlist(${m.id})">🗑️</button></div><div class="movie-info"><div class="movie-title">${m.title}</div><div class="movie-year">${m.year || 'N/A'}</div><div class="movie-genre">${m.genre ? m.genre.split(',').slice(0, 2).map(g => `<span>${g.trim()}</span>`).join('') : '<span>No genre</span>'}</div></div></div>`).join('');
    } catch (e) { console.error(e); }
}
async function removeFromWatchlist(movieId) { const userId = localStorage.getItem('userId'); if (!userId) { alert('Please login first'); return; } try { const response = await fetch(`${API_URL}/Movies/watchlist?userId=${userId}&movieId=${movieId}`, { method: 'DELETE' }); if (response.ok) { alert('✅ Removed from watchlist!'); loadWatchlist(); } else alert('❌ Failed to remove from watchlist'); } catch (error) { console.error('Error removing from watchlist:', error); alert('❌ Error removing from watchlist'); } }
window.removeFromWatchlist = removeFromWatchlist;

// ========== ADMIN FUNCTIONS ==========
async function loadDashboardStats() { const res = await fetch(`${API_URL}/Admin/dashboard`); const stats = await res.json(); const grid = document.getElementById('statsGrid'); if (grid) grid.innerHTML = `<div class="stat-card"><div class="stat-number">${stats.totalUsers}</div><div>Total Users</div></div><div class="stat-card"><div class="stat-number">${stats.totalMovies}</div><div>Total Movies</div></div>`; }
async function loadAllUsers() { const res = await fetch(`${API_URL}/Admin/users`); const users = await res.json(); const container = document.getElementById('usersList'); if (!container) return; if (!users?.length) { container.innerHTML = '<p>No users.</p>'; return; } let html = '<table style="width:100%; border-collapse:collapse;"><tr style="background:#f0f0f0;"><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Action</th></tr>'; for (let u of users) html += `<tr><td style="padding:0.5rem;">${u.id}</td><td style="padding:0.5rem;">${u.username}</td><td style="padding:0.5rem;">${u.email}</td><td style="padding:0.5rem;">${u.role}</td><td style="padding:0.5rem;"><button class="btn btn-danger" onclick="deleteUser(${u.id})">Delete</button></td></tr>`; html += '</table>'; container.innerHTML = html; }
async function deleteUser(id) { if (!confirm('Delete user?')) return; const res = await fetch(`${API_URL}/Admin/user/${id}`, { method: 'DELETE' }); if (res.ok) { loadAllUsers(); loadDashboardStats(); alert('User deleted'); } }

// ========== TMDB IMPORT ==========
window.searchTMDB = async function () { const q = document.getElementById('tmdbSearchQuery')?.value; if (!q) return; const res = await fetch(`${API_URL}/Movies/search-tmdb?query=${encodeURIComponent(q)}`); const results = await res.json(); const container = document.getElementById('tmdbResults'); if (container) { let html = ''; for (let m of results) html += `<div style="display:flex; justify-content:space-between; padding:5px; border-bottom:1px solid #ddd;"><span>${m.title} (${m.release_date?.split('-')[0] || 'N/A'})</span><button onclick="importMovie(${m.id})">Import</button></div>`; container.innerHTML = html; } };
window.importMovie = async function (tmdbId) { const res = await fetch(`${API_URL}/Movies/import/${tmdbId}`, { method: 'POST' }); if (res.ok) { alert('Movie imported!'); closeModals(); loadMovies(); } else alert('Import failed'); };
window.refreshData = async function () { await loadDashboardStats(); await loadAllUsers(); await loadMovies(); alert('✅ All data refreshed!'); };

// ========== EXPORT FUNCTIONS (WORKING CSV) ==========
function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

window.exportData = async function () {
    try {
        const usersRes = await fetch(`${API_URL}/Admin/users`);
        const users = await usersRes.json();
        const moviesRes = await fetch(`${API_URL}/Movies`);
        const movies = await moviesRes.json();
        let csv = "FilmFusion Full Report\nGenerated: " + new Date().toLocaleString() + "\n\nUSERS REPORT\nID,Username,Email,Role,Joined\n";
        users.forEach(u => csv += `${u.id},${u.username},${u.email},${u.role},${new Date(u.createdAt).toLocaleString()}\n`);
        csv += "\nMOVIES REPORT\nID,Title,Genre,Year,Rating,Description\n";
        movies.forEach(m => { const desc = (m.overview || '').replace(/,/g, ' ').replace(/\n/g, ' '); csv += `${m.id},${m.title},${m.genre},${m.year},${m.rating},"${desc}"\n`; });
        downloadCSV(csv, `filmfusion_full_report_${new Date().toISOString().split('T')[0]}.csv`);
        alert('✅ Full report exported!');
    } catch (error) { alert('❌ Export error: ' + error.message); }
};

window.exportUsersCSV = async function () {
    try {
        const res = await fetch(`${API_URL}/Admin/users`);
        const users = await res.json();
        let csv = "ID,Username,Email,Role,Joined\n";
        users.forEach(u => csv += `${u.id},${u.username},${u.email},${u.role},${new Date(u.createdAt).toLocaleString()}\n`);
        downloadCSV(csv, `filmfusion_users_${new Date().toISOString().split('T')[0]}.csv`);
        alert('✅ Users exported!');
    } catch (error) { alert('❌ Export error: ' + error.message); }
};

window.exportMoviesCSV = async function () {
    try {
        const res = await fetch(`${API_URL}/Movies`);
        const movies = await res.json();
        let csv = "ID,Title,Genre,Year,Rating,Description\n";
        movies.forEach(m => { const desc = (m.overview || '').replace(/,/g, ' ').replace(/\n/g, ' '); csv += `${m.id},${m.title},${m.genre},${m.year},${m.rating},"${desc}"\n`; });
        downloadCSV(csv, `filmfusion_movies_${new Date().toISOString().split('T')[0]}.csv`);
        alert('✅ Movies exported!');
    } catch (error) { alert('❌ Export error: ' + error.message); }
};

// ========== PROFILE PAGE FUNCTIONS ==========
let currentUserData = null;
window.loadProfile = async function () { const userId = localStorage.getItem('userId'); if (!userId) return; try { const res = await fetch(`${API_URL}/Auth/profile/${userId}`); const user = await res.json(); currentUserData = user; const nameEl = document.getElementById('profileName'); const emailEl = document.getElementById('profileEmail'); const roleEl = document.getElementById('profileUserRole'); const bioEl = document.getElementById('profileBio'); const joinedEl = document.getElementById('profileJoined'); const avatarEl = document.getElementById('profileAvatar'); if (nameEl) nameEl.innerText = user.username || 'User'; if (emailEl) emailEl.innerText = user.email || '-'; if (roleEl) roleEl.innerText = user.role || 'User'; if (bioEl) bioEl.innerHTML = user.bio || 'No bio yet.'; if (user.createdAt && joinedEl) joinedEl.innerText = new Date(user.createdAt).toLocaleDateString(); if (avatarEl) avatarEl.src = user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'User')}&background=9b59b6&color=fff`; } catch (e) { console.error(e); } };
window.openEditModal = function () { if (currentUserData) { const usernameEl = document.getElementById('editUsername'); const emailEl = document.getElementById('editEmail'); const bioEl = document.getElementById('editBio'); const modal = document.getElementById('editModal'); if (usernameEl) usernameEl.value = currentUserData.username || ''; if (emailEl) emailEl.value = currentUserData.email || ''; if (bioEl) bioEl.value = currentUserData.bio || ''; if (modal) modal.style.display = 'flex'; } };
window.closeEditModal = function () { const modal = document.getElementById('editModal'); if (modal) modal.style.display = 'none'; };
window.saveProfile = async function () { const userId = localStorage.getItem('userId'); const username = document.getElementById('editUsername')?.value; const email = document.getElementById('editEmail')?.value; const bio = document.getElementById('editBio')?.value; if (!username || !email) { alert('Username and email required'); return; } const res = await fetch(`${API_URL}/Auth/profile/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, bio }) }); if (res.ok) { alert('Profile updated!'); window.closeEditModal(); window.loadProfile(); localStorage.setItem('userName', username); } else alert('Update failed'); };
window.openAvatarModal = function () { const modal = document.getElementById('avatarModal'); if (modal) modal.style.display = 'flex'; };
window.closeAvatarModal = function () { const modal = document.getElementById('avatarModal'); if (modal) modal.style.display = 'none'; };
window.handleGalleryUpload = function (event) { const file = event.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (e) => window.setAvatar(e.target.result); reader.readAsDataURL(file); } };
window.handleCameraUpload = function (event) { const file = event.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (e) => window.setAvatar(e.target.result); reader.readAsDataURL(file); } };
window.setAvatar = async function (url) { const userId = localStorage.getItem('userId'); if (!userId) return; try { const response = await fetch(`${API_URL}/Auth/profile/${userId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profilePicture: url }) }); if (response.ok) { const avatarEl = document.getElementById('profileAvatar'); if (avatarEl) avatarEl.src = url; window.closeAvatarModal(); alert('✅ Profile picture updated!'); } else alert('❌ Failed to update profile picture'); } catch (error) { alert('❌ Error: ' + error.message); } };
window.setCustomAvatar = async function () { const url = document.getElementById('avatarUrlInput')?.value; if (url) await window.setAvatar(url); else alert('Enter a valid URL'); };

// ========== HELPER FUNCTIONS ==========
function setupNavigationLinks() { const homeLink = document.getElementById('homeLink'); const featuresLink = document.getElementById('featuresLink'); const aboutLink = document.getElementById('aboutLink'); const profileLink = document.getElementById('profileLink'); if (homeLink) homeLink.onclick = () => window.scrollToSection('home'); if (featuresLink) featuresLink.onclick = () => window.scrollToSection('features'); if (aboutLink) aboutLink.onclick = () => window.scrollToSection('about'); if (profileLink) profileLink.onclick = () => window.goToProfile(); }
function checkAndShowProfileLink() { const userId = localStorage.getItem('userId'); const profileLink = document.getElementById('profileLink'); if (userId && profileLink) { profileLink.style.display = 'inline-block'; profileLink.onclick = () => window.goToProfile(); } }
window.scrollToSection = function (sectionId) { const element = document.getElementById(sectionId); if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
window.goToProfile = function () { const userId = localStorage.getItem('userId'); if (userId) window.location.href = 'user-profile.html'; else { alert('Please login first'); window.scrollToSection('home'); } };
window.logout = function () { localStorage.clear(); window.location.href = 'index.html'; };

// ========== ADMIN DASHBOARD FUNCTIONS ==========

// Stats Cards
async function loadAdminStats() {
    try {
        const usersRes = await fetch(`${API_URL}/Admin/users`);
        const users = await usersRes.json();
        const moviesRes = await fetch(`${API_URL}/Movies`);
        const movies = await moviesRes.json();

        let totalFavorites = 0;
        let totalWatchlist = 0;
        for (let user of users) {
            try {
                const favRes = await fetch(`${API_URL}/Movies/favorites/${user.id}`);
                const favs = await favRes.json();
                totalFavorites += favs.length;
                const watchRes = await fetch(`${API_URL}/Movies/watchlist/${user.id}`);
                const watch = await watchRes.json();
                totalWatchlist += watch.length;
            } catch (e) { }
        }

        const statsGrid = document.getElementById('statsGrid');
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div class="admin-stat-card">
                    <div class="stat-info"><h3>Total Users</h3><div class="stat-number">${users.length}</div></div>
                    <div class="stat-icon">👥</div>
                </div>
                <div class="admin-stat-card">
                    <div class="stat-info"><h3>Total Movies</h3><div class="stat-number">${movies.length}</div></div>
                    <div class="stat-icon">🎬</div>
                </div>
                <div class="admin-stat-card">
                    <div class="stat-info"><h3>Total Favorites</h3><div class="stat-number">${totalFavorites}</div></div>
                    <div class="stat-icon">❤️</div>
                </div>
                <div class="admin-stat-card">
                    <div class="stat-info"><h3>Total Watchlist</h3><div class="stat-number">${totalWatchlist}</div></div>
                    <div class="stat-icon">📝</div>
                </div>
            `;
        }
    } catch (e) { console.error('Error loading stats:', e); }
}

// Likes Activity
async function loadLikesActivity() {
    try {
        const usersRes = await fetch(`${API_URL}/Admin/users`);
        const users = await usersRes.json();
        const likes = [];
        for (let user of users) {
            try {
                const favRes = await fetch(`${API_URL}/Movies/favorites/${user.id}`);
                const favs = await favRes.json();
                favs.forEach(m => {
                    likes.push({ username: user.username, movieTitle: m.title, time: new Date().toLocaleString() });
                });
            } catch (e) { }
        }
        const recent = likes.slice(-15).reverse();
        const container = document.getElementById('likesActivity');
        if (!container) return;
        if (recent.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:2rem; color:rgba(255,255,255,0.5);">No likes yet</div>';
            return;
        }
        container.innerHTML = recent.map(a => `
            <div class="activity-item">
                <div class="activity-icon like">👍</div>
                <div class="activity-details">
                    <div class="activity-title">${a.username}</div>
                    <div class="activity-subtitle">Liked: ${a.movieTitle}</div>
                    <div class="activity-time">${a.time}</div>
                </div>
                <div class="activity-type type-like">Like</div>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

// Dislikes Activity
async function loadDislikesActivity() {
    const container = document.getElementById('dislikesActivity');
    if (container) {
        container.innerHTML = '<div style="text-align:center; padding:2rem; color:rgba(255,255,255,0.5);">No dislikes yet</div>';
    }
}

// Comments Activity
async function loadCommentsActivity() {
    try {
        const moviesRes = await fetch(`${API_URL}/Movies`);
        const movies = await moviesRes.json();
        const allComments = [];
        for (let movie of movies) {
            try {
                const commentsRes = await fetch(`${API_URL}/Movies/${movie.id}/comments`);
                const comments = await commentsRes.json();
                comments.forEach(c => {
                    allComments.push({ username: c.username, movieTitle: movie.title, comment: c.comment, time: new Date(c.commentDate).toLocaleString() });
                });
            } catch (e) { }
        }
        const recent = allComments.slice(-15).reverse();
        const container = document.getElementById('commentsActivity');
        if (!container) return;
        if (recent.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:2rem; color:rgba(255,255,255,0.5);">No comments yet</div>';
            return;
        }
        container.innerHTML = recent.map(a => `
            <div class="activity-item">
                <div class="activity-icon comment">💬</div>
                <div class="activity-details">
                    <div class="activity-title">${a.username}</div>
                    <div class="activity-subtitle">Commented on ${a.movieTitle}: "${a.comment.substring(0, 50)}${a.comment.length > 50 ? '...' : ''}"</div>
                    <div class="activity-time">${a.time}</div>
                </div>
                <div class="activity-type type-comment">Comment</div>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

// Watchlist Activity
async function loadWatchlistActivity() {
    try {
        const usersRes = await fetch(`${API_URL}/Admin/users`);
        const users = await usersRes.json();
        const watchlistItems = [];
        for (let user of users) {
            try {
                const watchRes = await fetch(`${API_URL}/Movies/watchlist/${user.id}`);
                const watchlist = await watchRes.json();
                watchlist.forEach(m => {
                    watchlistItems.push({ username: user.username, movieTitle: m.title, time: new Date().toLocaleString() });
                });
            } catch (e) { }
        }
        const recent = watchlistItems.slice(-15).reverse();
        const container = document.getElementById('watchlistActivity');
        if (!container) return;
        if (recent.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:2rem; color:rgba(255,255,255,0.5);">No watchlist additions</div>';
            return;
        }
        container.innerHTML = recent.map(a => `
            <div class="activity-item">
                <div class="activity-icon watchlist">📝</div>
                <div class="activity-details">
                    <div class="activity-title">${a.username}</div>
                    <div class="activity-subtitle">Added to watchlist: ${a.movieTitle}</div>
                    <div class="activity-time">${a.time}</div>
                </div>
                <div class="activity-type type-watchlist">Watchlist</div>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

// Favorites Activity
async function loadFavoritesActivity() {
    try {
        const usersRes = await fetch(`${API_URL}/Admin/users`);
        const users = await usersRes.json();
        const favorites = [];
        for (let user of users) {
            try {
                const favRes = await fetch(`${API_URL}/Movies/favorites/${user.id}`);
                const favs = await favRes.json();
                favs.forEach(m => {
                    favorites.push({ username: user.username, movieTitle: m.title, time: new Date().toLocaleString() });
                });
            } catch (e) { }
        }
        const recent = favorites.slice(-15).reverse();
        const container = document.getElementById('favoritesActivity');
        if (!container) return;
        if (recent.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:2rem; color:rgba(255,255,255,0.5);">No favorites yet</div>';
            return;
        }
        container.innerHTML = recent.map(a => `
            <div class="activity-item">
                <div class="activity-icon favorite">❤️</div>
                <div class="activity-details">
                    <div class="activity-title">${a.username}</div>
                    <div class="activity-subtitle">Added to favorites: ${a.movieTitle}</div>
                    <div class="activity-time">${a.time}</div>
                </div>
                <div class="activity-type type-favorite">Favorite</div>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

// Top Movies
async function loadTopMoviesList() {
    try {
        const res = await fetch(`${API_URL}/Movies`);
        const movies = await res.json();
        const top = movies.sort((a, b) => b.rating - a.rating).slice(0, 6);
        const container = document.getElementById('topMoviesList');
        if (container) {
            container.innerHTML = top.map(m => `
                <div class="activity-item" onclick="window.viewMovie(${m.id})" style="cursor:pointer;">
                    <div class="activity-icon" style="background:linear-gradient(135deg,#3a86ff,#64b4fa);">⭐</div>
                    <div class="activity-details">
                        <div class="activity-title">${m.title}</div>
                        <div class="activity-subtitle">⭐ ${m.rating}/10 • ${m.year}</div>
                        <div class="progress-bar"><div class="progress-fill" style="width: ${(m.rating / 10) * 100}%"></div></div>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) { console.error(e); }
}

// Genre Distribution
async function loadGenreDistributionList() {
    try {
        const res = await fetch(`${API_URL}/Movies`);
        const movies = await res.json();
        const genres = {};
        movies.forEach(m => {
            m.genre.split(',').forEach(g => {
                const genre = g.trim();
                genres[genre] = (genres[genre] || 0) + 1;
            });
        });
        const sorted = Object.entries(genres).sort((a, b) => b[1] - a[1]).slice(0, 8);
        const container = document.getElementById('genreDistribution');
        if (container) {
            container.innerHTML = sorted.map(([genre, count]) => `
                <div class="activity-item">
                    <div class="activity-icon" style="background:linear-gradient(135deg,#3a86ff,#64b4fa);">🎭</div>
                    <div class="activity-details">
                        <div class="activity-title">${genre}</div>
                        <div class="activity-subtitle">${count} movies</div>
                        <div class="progress-bar"><div class="progress-fill" style="width: ${(count / movies.length) * 100}%"></div></div>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) { console.error(e); }
}

// User Growth Chart
let userGrowthChart;
async function initUserGrowthChart() {
    try {
        const usersRes = await fetch(`${API_URL}/Admin/users`);
        const users = await usersRes.json();
        const monthly = {};
        users.forEach(u => {
            const date = new Date(u.createdAt);
            monthly[date.toLocaleString('default', { month: 'short' })] = (monthly[date.toLocaleString('default', { month: 'short' })] || 0) + 1;
        });
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const values = months.map(m => monthly[m] || 0);

        const ctx = document.getElementById('userGrowthChart')?.getContext('2d');
        if (ctx && userGrowthChart) userGrowthChart.destroy();
        if (ctx) {
            userGrowthChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [{
                        label: 'New Users',
                        data: values,
                        borderColor: '#3a86ff',
                        backgroundColor: 'rgba(58, 134, 255, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom', labels: { color: 'white' } } } }
            });
        }
    } catch (e) { console.error(e); }
}

// Call all admin dashboard functions
function loadAdminDashboardData() {
    loadAdminStats();
    loadLikesActivity();
    loadDislikesActivity();
    loadCommentsActivity();
    loadWatchlistActivity();
    loadFavoritesActivity();
    loadTopMoviesList();
    loadGenreDistributionList();
    initUserGrowthChart();
}

// Update DOMContentLoaded to include admin dashboard
const originalDOMContentLoaded = document.addEventListener('DOMContentLoaded', function () {
    // ... existing code ...
    if (document.getElementById('statsGrid')) {
        loadAdminDashboardData();
    }
});

// ========== PAGE INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('particles')) createParticles();
    setupWelcomePage();
    setupFormSwitching();
    setupAdminModal();
    setupForgotPassword();
    setupUserAuthButtons();
    if (document.getElementById('moviesGrid') && !document.getElementById('statsGrid')) { if (!localStorage.getItem('userId')) window.location.href = 'index.html'; loadMovies(); }
    if (document.getElementById('statsGrid')) { const role = localStorage.getItem('userRole'); if (role !== 'Admin') window.location.href = 'index.html'; loadDashboardStats(); loadAllUsers(); loadMovies(); }
    if (document.getElementById('favoritesGrid')) loadFavorites();
    if (document.getElementById('watchlistGrid')) loadWatchlist();
    if (document.getElementById('moviePlayer')) { if (!localStorage.getItem('userId')) window.location.href = 'index.html'; else loadMovieForWatch(); }
    if (document.getElementById('profileName') && localStorage.getItem('userId')) window.loadProfile();
    window.onclick = function (e) { if (e.target && e.target.classList && e.target.classList.contains('modal-overlay')) e.target.style.display = 'none'; };
});