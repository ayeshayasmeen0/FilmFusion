// @ts-nocheck
const API_URL = 'https://localhost:7249/api';

// ========== INITIALIZE DEFAULT USER ==========
function initializeDefaultUser() {
    let users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.length === 0) {
        const defaultUser = {
            id: 'user_001',
            username: 'Demo User',
            email: 'demo@filmfusion.com',
            password: 'demo123',
            bio: 'Movie enthusiast who loves discovering new films.',
            role: 'Movie Lover',
            createdAt: new Date().toISOString(),
            profilePicture: null
        };
        users.push(defaultUser);
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Default user created');
    }
}
initializeDefaultUser();

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

// ========== USER STATS FUNCTION ==========
async function loadUserStats() {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
        const moviesRes = await fetch(`${API_URL}/Movies`);
        const movies = await moviesRes.json();
        const totalMoviesEl = document.getElementById('totalMovies');
        if (totalMoviesEl) totalMoviesEl.innerText = movies.length;

        const favRes = await fetch(`${API_URL}/Movies/favorites/${userId}`);
        const favorites = await favRes.json();
        const favCountEl = document.getElementById('favoritesCount');
        if (favCountEl) favCountEl.innerText = favorites.length;

        const watchRes = await fetch(`${API_URL}/Movies/watchlist/${userId}`);
        const watchlist = await watchRes.json();
        const watchCountEl = document.getElementById('watchlistCount');
        if (watchCountEl) watchCountEl.innerText = watchlist.length;

        try {
            const historyRes = await fetch(`${API_URL}/UserMovieInteractions/${userId}/watched`);
            if (historyRes.ok) {
                const history = await historyRes.json();
                const historyCountEl = document.getElementById('historyCount');
                if (historyCountEl) historyCountEl.innerText = history.length;
            } else {
                const historyCountEl = document.getElementById('historyCount');
                if (historyCountEl) historyCountEl.innerText = '0';
            }
        } catch (e) {
            const historyCountEl = document.getElementById('historyCount');
            if (historyCountEl) historyCountEl.innerText = '0';
        }
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}
window.loadUserStats = loadUserStats;

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

// ========== FIXED: LOCAL LOGIN (WORKS PERFECTLY) ==========
function handleLocalLogin(email, password) {
    console.log('=== LOCAL LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Password:', password);

    let users = JSON.parse(localStorage.getItem('users')) || [];
    console.log('Total users in storage:', users.length);

    // Debug: Show all users
    users.forEach((u, i) => {
        console.log(`User ${i}: Email="${u.email}", Password="${u.password}"`);
    });

    // Try multiple matching strategies
    let user = null;

    // Strategy 1: Exact match
    user = users.find(u => u.email === email && u.password === password);

    // Strategy 2: Case insensitive email
    if (!user) {
        user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    }

    // Strategy 3: Case insensitive both
    if (!user) {
        user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password.toLowerCase() === password.toLowerCase());
    }

    if (user) {
        console.log('✅ LOGIN SUCCESS! User found:', user.username);

        // Save all user data to localStorage
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userName', user.username);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userRole', 'User');
        localStorage.setItem('userPassword', user.password);
        localStorage.setItem('userBio', user.bio || 'Movie enthusiast');
        localStorage.setItem('userJoined', user.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString());
        localStorage.setItem('userAvatar', user.profilePicture || '');

        // Redirect to dashboard
        window.location.href = 'user-dashboard.html';
    } else {
        console.log('❌ LOGIN FAILED!');

        // Check if email exists (wrong password case)
        const emailExists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (emailExists) {
            alert(`Invalid password! Please try again.\n\nHint: Your password is: ${emailExists.password}`);
        } else {
            alert('User not found! Please sign up first.\n\nDemo login: demo@filmfusion.com / demo123');
        }
    }
}

// ========== FIXED: MAIN LOGIN FUNCTION ==========
async function handleUserLogin(email, password) {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Password:', password);

    try {
        // Try backend first
        const res = await fetch(`${API_URL}/Auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            const data = await res.json();
            console.log('Backend login success');

            const userId = data.userId;
            const userName = data.username;

            localStorage.setItem('userId', userId);
            localStorage.setItem('userName', userName);
            localStorage.setItem('userRole', 'User');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userPassword', password);
            localStorage.setItem('userJoined', new Date().toLocaleDateString());
            localStorage.setItem('userBio', data.bio || 'Movie enthusiast');

            // Update users array
            let users = JSON.parse(localStorage.getItem('users')) || [];
            const existingUser = users.find(u => u.email === email);
            if (!existingUser) {
                users.push({
                    id: userId,
                    username: userName,
                    email: email,
                    password: password,
                    bio: data.bio || 'Movie enthusiast',
                    role: 'User',
                    createdAt: new Date().toISOString(),
                    profilePicture: null
                });
                localStorage.setItem('users', JSON.stringify(users));
            } else {
                existingUser.password = password;
                existingUser.username = userName;
                localStorage.setItem('users', JSON.stringify(users));
            }

            window.location.href = 'user-dashboard.html';
            return;
        }
    } catch (err) {
        console.log('Backend not available, using local login');
    }

    // Fallback to local login
    handleLocalLogin(email, password);
}

// ========== USER SIGNUP ==========
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
    } catch (err) {
        console.log('Backend not available, using local signup');
    }

    // Local signup
    handleLocalSignup(username, email, password);
}

function handleLocalSignup(username, email, password) {
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if email already exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        alert('Email already exists!');
        return;
    }

    const newUser = {
        id: Date.now().toString(),
        username: username,
        email: email,
        password: password,
        bio: 'Movie enthusiast who loves discovering new films.',
        role: 'Movie Lover',
        createdAt: new Date().toISOString(),
        profilePicture: null
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    console.log('New user created:', newUser.email, newUser.password);
    alert('Signup successful! Please login.');

    // Switch to login form
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    if (loginForm) loginForm.style.display = 'block';
    if (signupForm) signupForm.style.display = 'none';
}

function setupUserAuthButtons() {
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const signupSubmitBtn = document.getElementById('signupSubmitBtn');

    if (loginSubmitBtn) {
        loginSubmitBtn.onclick = () => {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            if (!email || !password) { alert('Please enter email and password'); return; }
            handleUserLogin(email, password);
        };
    }

    if (signupSubmitBtn) {
        signupSubmitBtn.onclick = () => {
            const username = document.getElementById('signupUsername').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;
            if (!username || !email || !password) { alert('Please fill all fields'); return; }
            handleUserSignup(username, email, password, confirmPassword);
        };
    }
}

// ========== VIEW MOVIE ==========
window.viewMovie = function (id) {
    if (id) {
        console.log('Viewing movie:', id);
        window.location.href = `watch-movie.html?id=${id}`;
    }
};

// ========== WATCH MOVIE PAGE ==========
window.loadMovieForWatch = async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        alert('No movie selected');
        window.location.href = 'user-dashboard.html';
        return;
    }

    try {
        const res = await fetch(`${API_URL}/Movies/${movieId}`);
        if (!res.ok) throw new Error('Movie not found');

        const movie = await res.json();

        const titleEl = document.getElementById('movieTitle');
        const yearEl = document.getElementById('movieYear');
        const genreEl = document.getElementById('movieGenre');
        const ratingEl = document.getElementById('movieRating');
        const overviewEl = document.getElementById('movieOverview');
        const directorEl = document.getElementById('movieDirector');
        const castEl = document.getElementById('movieCast');

        if (titleEl) titleEl.innerText = movie.title;
        if (yearEl) yearEl.innerText = movie.year;
        if (genreEl) genreEl.innerText = movie.genre;
        if (ratingEl) ratingEl.innerText = '⭐ ' + movie.rating + '/10';
        if (overviewEl) overviewEl.innerText = movie.overview;
        if (directorEl) directorEl.innerText = movie.director || 'Not specified';
        if (castEl) castEl.innerText = movie.cast || 'Not specified';

        const player = document.getElementById('moviePlayer');
        if (player) {
            const tmdbId = movie.tmdbId || movie.id;
            player.src = `https://vidsrc.to/embed/movie/${tmdbId}`;
        }

        addToHistory('watch', movie);
        await loadCommentsForWatch(movieId);

    } catch (error) {
        console.error('Error loading movie:', error);
        alert('Failed to load movie details');
    }
};

// ========== COMMENTS FUNCTIONS ==========
let currentCommentsCache = {};

async function loadCommentsForWatch(movieId) {
    const currentMovieId = movieId || new URLSearchParams(window.location.search).get('id');
    if (!currentMovieId) return;

    try {
        const res = await fetch(`${API_URL}/Movies/${currentMovieId}/comments-with-details?sortBy=latest`);
        const data = await res.json();
        const container = document.getElementById('commentsList');
        const countSpan = document.getElementById('commentsCount');

        if (!container) return;

        currentCommentsCache[currentMovieId] = data.comments || [];

        if (!data.comments || data.comments.length === 0) {
            container.innerHTML = '<div class="no-comments">No comments yet. Be the first to comment!</div>';
            if (countSpan) countSpan.innerText = '0 Comments';
            return;
        }

        if (countSpan) countSpan.innerText = `${data.totalCount} Comment${data.totalCount !== 1 ? 's' : ''}`;

        const currentUser = localStorage.getItem('userName');
        const userId = localStorage.getItem('userId');

        container.innerHTML = data.comments.map(c => `
            <div class="comment-item" data-comment-id="${c.id}" style="margin-bottom:1rem; border-bottom:1px solid rgba(100,180,250,0.1); padding-bottom:0.8rem;">
                <div style="display:flex; gap:0.8rem;">
                    <div style="width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#3a86ff,#64b4fa); display:flex; align-items:center; justify-content:center; overflow:hidden;">
                        <img src="${c.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.username || 'U')}&background=3a86ff&color=fff&size=36`}" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <div style="flex:1;">
                        <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                            <span style="font-weight:600; color:white;">${escapeHtml(c.username || 'User')}</span>
                            <span style="font-size:0.7rem; color:rgba(255,255,255,0.5);">${new Date(c.commentDate).toLocaleString()}</span>
                        </div>
                        <div style="color:rgba(255,255,255,0.8); font-size:0.85rem; margin:0.3rem 0;">${escapeHtml(c.comment)}</div>
                        <div style="display:flex; gap:0.8rem; margin-top:0.3rem;">
                            <button onclick="window.toggleCommentLike(${c.id})" style="background:transparent; border:none; color:#64b4fa; cursor:pointer; font-size:0.7rem;">👍 Like (${c.likesCount || 0})</button>
                            <button onclick="window.showReplyInput(${c.id})" style="background:transparent; border:none; color:#64b4fa; cursor:pointer; font-size:0.7rem;">💬 Reply</button>
                        </div>
                        ${c.username === currentUser ? `
                            <button onclick="window.deleteComment(${c.id})" style="background:rgba(231,76,60,0.2); border:none; color:#e74c3c; cursor:pointer; padding:0.2rem 0.6rem; border-radius:12px; font-size:0.7rem; margin-top:0.3rem;">Delete</button>
                        ` : ''}
                        <div id="reply-input-${c.id}" class="reply-input-area" style="display:none; margin-top:0.5rem;">
                            <input type="text" id="reply-text-${c.id}" placeholder="Write a reply..." style="width:100%; padding:0.4rem; background:rgba(255,255,255,0.08); border:1px solid rgba(100,180,250,0.3); border-radius:20px; color:white; font-size:0.75rem;">
                            <div style="display:flex; gap:0.5rem; margin-top:0.3rem;">
                                <button onclick="window.submitReply(${c.id})" style="background:#3a86ff; color:white; border:none; border-radius:20px; padding:0.2rem 0.8rem; cursor:pointer;">Reply</button>
                                <button onclick="window.cancelReply(${c.id})" style="background:transparent; color:rgba(255,255,255,0.5); border:none; cursor:pointer;">Cancel</button>
                            </div>
                        </div>
                        <div id="replies-${c.id}" style="margin-left:44px; margin-top:0.5rem;">
                            ${c.replies && c.replies.length > 0 ? `
                                <button onclick="window.toggleReplies(${c.id})" style="background:transparent; border:none; color:#64b4fa; cursor:pointer; font-size:0.7rem;">▼ Show ${c.replies.length} replies</button>
                                <div id="replies-list-${c.id}" style="display:none; margin-top:0.5rem;">
                                    ${c.replies.map(r => `
                                        <div style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
                                            <div style="width:24px; height:24px; border-radius:50%; background:linear-gradient(135deg,#64b4fa,#3a86ff); display:flex; align-items:center; justify-content:center; overflow:hidden;">
                                                <img src="${r.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.username || 'U')}&background=64b4fa&color=fff&size=24`}" style="width:100%; height:100%; object-fit:cover;">
                                            </div>
                                            <div style="flex:1;">
                                                <div><span style="font-weight:600; color:white; font-size:0.75rem;">${escapeHtml(r.username || 'User')}</span> <span style="font-size:0.6rem; color:rgba(255,255,255,0.5);">${new Date(r.createdAt).toLocaleString()}</span></div>
                                                <div style="color:rgba(255,255,255,0.7); font-size:0.75rem;">${escapeHtml(r.replyText)}</div>
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

    } catch (error) {
        console.error('Error loading comments:', error);
        const container = document.getElementById('commentsList');
        if (container) container.innerHTML = '<div class="no-comments">Failed to load comments</div>';
    }
}

window.addCommentForWatch = async function () {
    const input = document.getElementById('commentInput');
    const comment = input?.value.trim();
    if (!comment) { alert('Please write a comment'); return; }

    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const currentMovieId = new URLSearchParams(window.location.search).get('id');
    if (!currentMovieId) return;

    try {
        const response = await fetch(`${API_URL}/Movies/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: parseInt(userId), movieId: parseInt(currentMovieId), comment })
        });

        if (response.ok) {
            input.value = '';
            await loadCommentsForWatch(currentMovieId);
            alert('Comment added!');
        } else {
            alert('Failed to add comment');
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        alert('Error adding comment');
    }
};

window.deleteComment = async function (commentId) {
    if (!confirm('Delete this comment?')) return;
    try {
        const response = await fetch(`${API_URL}/Movies/comment/${commentId}`, { method: 'DELETE' });
        if (response.ok) {
            const movieId = new URLSearchParams(window.location.search).get('id');
            await loadCommentsForWatch(movieId);
            alert('Comment deleted!');
        } else {
            alert('Failed to delete comment');
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Error deleting comment');
    }
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
            const movieId = new URLSearchParams(window.location.search).get('id');
            await loadCommentsForWatch(movieId);
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
            window.cancelReply(commentId);
            const movieId = new URLSearchParams(window.location.search).get('id');
            await loadCommentsForWatch(movieId);
            alert('Reply added!');
        } else alert('Failed to add reply');
    } catch (error) { console.error('Error adding reply:', error); alert('Error adding reply'); }
};

window.showReplyInput = function (commentId) {
    const replyDiv = document.getElementById(`reply-input-${commentId}`);
    if (replyDiv) replyDiv.style.display = 'block';
};

window.cancelReply = function (commentId) {
    const replyDiv = document.getElementById(`reply-input-${commentId}`);
    if (replyDiv) replyDiv.style.display = 'none';
    const input = document.getElementById(`reply-text-${commentId}`);
    if (input) input.value = '';
};

window.toggleReplies = function (commentId) {
    const repliesList = document.getElementById(`replies-list-${commentId}`);
    const showBtn = document.querySelector(`#replies-${commentId} button`);
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

window.editComment = async function (commentId, oldText) {
    const newText = prompt('Edit your comment:', oldText);
    if (!newText || newText === oldText) return;
    try {
        const response = await fetch(`${API_URL}/Movies/comment/${commentId}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment: newText })
        });
        if (response.ok) {
            const movieId = new URLSearchParams(window.location.search).get('id');
            await loadCommentsForWatch(movieId);
            alert('Comment updated!');
        }
        else alert('Failed to update comment');
    } catch (error) { console.error('Error editing comment:', error); alert('Error updating comment'); }
};

// ========== MOVIE ACTIONS ==========
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
    if (!movies?.length) { grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🎬</div><h3>No movies found</h3><p>Try searching for something else</p></div>'; return; }

    const isAdmin = localStorage.getItem('userRole') === 'Admin';

    if (isAdmin) {
        grid.innerHTML = movies.map(m => `
            <div class="movie-card" style="cursor:default;">
                <div class="movie-poster">
                    <img src="${m.posterPath ? `https://image.tmdb.org/t/p/w500${m.posterPath}` : `https://via.placeholder.com/500x750/1a2634/64b4fa?text=${encodeURIComponent(m.title)}`}" alt="${m.title}">
                    <div class="movie-rating-badge">⭐ ${m.rating}/10</div>
                </div>
                <div class="movie-info">
                    <div class="movie-title">${m.title}</div>
                    <div class="movie-year">${m.year || 'N/A'}</div>
                    <div class="movie-genre">${m.genre ? m.genre.split(',').slice(0, 2).map(g => `<span>${g.trim()}</span>`).join('') : '<span>No genre</span>'}</div>
                    <button class="delete-btn" onclick="event.stopPropagation(); window.deleteMovie(${m.id})" style="margin-top:0.5rem; width:100%; background:#e74c3c; color:white; border:none; padding:0.3rem; border-radius:8px; cursor:pointer;">Delete</button>
                </div>
            </div>
        `).join('');
    } else {
        grid.innerHTML = movies.map(m => `
            <div class="movie-card" onclick="window.viewMovie(${m.id})" style="cursor:pointer;">
                <div class="movie-poster">
                    <img src="${m.posterPath ? `https://image.tmdb.org/t/p/w500${m.posterPath}` : `https://via.placeholder.com/500x750/1a2634/64b4fa?text=${encodeURIComponent(m.title)}`}" alt="${m.title}">
                    <div class="movie-rating-badge">⭐ ${m.rating}/10</div>
                </div>
                <div class="movie-info">
                    <div class="movie-title">${m.title}</div>
                    <div class="movie-year">${m.year || 'N/A'}</div>
                    <div class="movie-genre">${m.genre ? m.genre.split(',').slice(0, 2).map(g => `<span>${g.trim()}</span>`).join('') : '<span>No genre</span>'}</div>
                </div>
            </div>
        `).join('');
    }
}

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
async function loadAllUsers() { const res = await fetch(`${API_URL}/Admin/users`); const users = await res.json(); const container = document.getElementById('usersList'); if (!container) return; if (!users?.length) { container.innerHTML = '<p>No users.</p>'; return; } let html = '<table style="width:100%; border-collapse:collapse;"><tr style="background:#f0f0f0;"><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Action</th><tr>'; for (let u of users) html += `<tr><td style="padding:0.5rem;">${u.id}</td><td style="padding:0.5rem;">${u.username}</td><td style="padding:0.5rem;">${u.email}</td><td style="padding:0.5rem;">${u.role}</td><td style="padding:0.5rem;"><button class="btn btn-danger" onclick="deleteUser(${u.id})">Delete</button></td></tr>`; html += '</table>'; container.innerHTML = html; }
async function deleteUser(id) { if (!confirm('Delete user?')) return; const res = await fetch(`${API_URL}/Admin/user/${id}`, { method: 'DELETE' }); if (res.ok) { loadAllUsers(); loadDashboardStats(); alert('User deleted'); } }

// ========== TMDB IMPORT ==========
window.searchTMDB = async function () { const q = document.getElementById('tmdbSearchQuery')?.value; if (!q) return; const res = await fetch(`${API_URL}/Movies/search-tmdb?query=${encodeURIComponent(q)}`); const results = await res.json(); const container = document.getElementById('tmdbResults'); if (container) { let html = ''; for (let m of results) html += `<div style="display:flex; justify-content:space-between; padding:5px; border-bottom:1px solid #ddd;"><span style="color:white;">${m.title} (${m.release_date?.split('-')[0] || 'N/A'})</span><button onclick="importMovie(${m.id})" style="background: linear-gradient(135deg,#3a86ff,#64b4fa); color:white; border:none; padding:0.2rem 0.8rem; border-radius:8px; cursor:pointer;">Import</button></div>`; container.innerHTML = html; } };
window.importMovie = async function (tmdbId) { const res = await fetch(`${API_URL}/Movies/import/${tmdbId}`, { method: 'POST' }); if (res.ok) { alert('Movie imported!'); closeModals(); loadMovies(); } else alert('Import failed'); };
window.refreshData = async function () { await loadDashboardStats(); await loadAllUsers(); await loadMovies(); alert('✅ All data refreshed!'); };

// ========== EXPORT FUNCTIONS ==========
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

// ========== PROFILE FUNCTIONS ==========
window.loadProfile = function () {
    const userName = localStorage.getItem('userName') || 'User';
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
    const userBio = localStorage.getItem('userBio') || 'Movie enthusiast who loves discovering new films.';
    const userJoined = localStorage.getItem('userJoined') || new Date().toLocaleDateString();
    const userAvatar = localStorage.getItem('userAvatar');

    const nameEl = document.getElementById('profileName');
    const emailEl = document.getElementById('profileEmail');
    const roleEl = document.getElementById('profileUserRole');
    const bioEl = document.getElementById('profileBio');
    const joinedEl = document.getElementById('profileJoined');
    const avatarEl = document.getElementById('profileAvatar');

    if (nameEl) nameEl.textContent = userName;
    if (emailEl) emailEl.textContent = userEmail;
    if (roleEl) roleEl.textContent = 'Movie Lover';
    if (bioEl) bioEl.textContent = userBio;
    if (joinedEl) joinedEl.textContent = userJoined;
    if (avatarEl) {
        if (userAvatar) avatarEl.src = userAvatar;
        else avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3a86ff&color=fff&size=130`;
    }
};

window.openEditModal = function () {
    const modal = document.getElementById('editModal');
    if (modal) {
        document.getElementById('editUsername').value = localStorage.getItem('userName') || '';
        document.getElementById('editEmail').value = localStorage.getItem('userEmail') || '';
        document.getElementById('editBio').value = localStorage.getItem('userBio') || '';
        modal.classList.add('active');
    }
};

window.closeEditModal = function () {
    const modal = document.getElementById('editModal');
    if (modal) modal.classList.remove('active');
};

window.saveProfile = function () {
    const userId = localStorage.getItem('userId');
    const newUsername = document.getElementById('editUsername').value;
    const newEmail = document.getElementById('editEmail').value;
    const newBio = document.getElementById('editBio').value;

    if (!newUsername || !newEmail) {
        alert('Username and email are required!');
        return;
    }

    localStorage.setItem('userName', newUsername);
    localStorage.setItem('userEmail', newEmail);
    localStorage.setItem('userBio', newBio);

    let users = JSON.parse(localStorage.getItem('users')) || [];
    let userIndex = users.findIndex(u => u.email === localStorage.getItem('userEmail'));

    if (userIndex === -1) {
        userIndex = users.findIndex(u => String(u.id) === String(userId));
    }

    if (userIndex !== -1) {
        users[userIndex].username = newUsername;
        users[userIndex].email = newEmail;
        users[userIndex].bio = newBio;
        localStorage.setItem('users', JSON.stringify(users));
    }

    const nameEl = document.getElementById('profileName');
    const emailEl = document.getElementById('profileEmail');
    const bioEl = document.getElementById('profileBio');
    if (nameEl) nameEl.textContent = newUsername;
    if (emailEl) emailEl.textContent = newEmail;
    if (bioEl) bioEl.textContent = newBio;

    window.closeEditModal();
    alert('✅ Profile updated successfully!');
};

window.openChangePasswordModal = function () {
    const modal = document.getElementById('passwordModal');
    if (modal) {
        document.getElementById('oldPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        modal.classList.add('active');
    }
};

window.closePasswordModal = function () {
    const modal = document.getElementById('passwordModal');
    if (modal) modal.classList.remove('active');
};

window.changePassword = function () {
    const userEmail = localStorage.getItem('userEmail');
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!userEmail) {
        alert('Please login again!');
        window.location.href = 'index.html';
        return;
    }

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

    let users = JSON.parse(localStorage.getItem('users')) || [];
    let userIndex = users.findIndex(u => u.email === userEmail);

    if (userIndex === -1) {
        alert('User not found! Please login again.');
        return;
    }

    if (users[userIndex].password !== oldPassword) {
        alert('Current password is incorrect!');
        return;
    }

    users[userIndex].password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('userPassword', newPassword);

    alert('✅ Password changed successfully!');
    window.closePasswordModal();

    document.getElementById('oldPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';

    if (confirm('Password changed! Please login again with your new password.')) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
};

window.openAvatarModal = function () {
    const modal = document.getElementById('avatarModal');
    if (modal) modal.classList.add('active');
};

window.closeAvatarModal = function () {
    const modal = document.getElementById('avatarModal');
    if (modal) modal.classList.remove('active');
};

window.openGallery = function () {
    document.getElementById('galleryInput').click();
};

window.handleGalleryUpload = function (input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            window.setAvatar(e.target.result);
        };
        reader.readAsDataURL(file);
    }
};

window.setAvatar = function (imageUrl) {
    const userEmail = localStorage.getItem('userEmail');
    localStorage.setItem('userAvatar', imageUrl);

    let users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.email === userEmail);

    if (userIndex !== -1) {
        users[userIndex].profilePicture = imageUrl;
        localStorage.setItem('users', JSON.stringify(users));
    }

    const avatarEl = document.getElementById('profileAvatar');
    if (avatarEl) avatarEl.src = imageUrl;

    window.closeAvatarModal();
    alert('✅ Profile picture updated!');
};

// ========== HELPER FUNCTIONS ==========
function setupNavigationLinks() { const homeLink = document.getElementById('homeLink'); const featuresLink = document.getElementById('featuresLink'); const aboutLink = document.getElementById('aboutLink'); const profileLink = document.getElementById('profileLink'); if (homeLink) homeLink.onclick = () => window.scrollToSection('home'); if (featuresLink) featuresLink.onclick = () => window.scrollToSection('features'); if (aboutLink) aboutLink.onclick = () => window.scrollToSection('about'); if (profileLink) profileLink.onclick = () => window.goToProfile(); }
function checkAndShowProfileLink() { const userId = localStorage.getItem('userId'); const profileLink = document.getElementById('profileLink'); if (userId && profileLink) { profileLink.style.display = 'inline-block'; profileLink.onclick = () => window.goToProfile(); } }
window.scrollToSection = function (sectionId) { const element = document.getElementById(sectionId); if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
window.goToProfile = function () { const userId = localStorage.getItem('userId'); if (userId) window.location.href = 'user-profile.html'; else { alert('Please login first'); window.scrollToSection('home'); } };
window.logout = function () { localStorage.clear(); window.location.href = 'index.html'; };

function escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }

function addToHistory(action, movieData) {
    const userId = localStorage.getItem('userId');
    if (!userId || !movieData) return;
    let history = JSON.parse(localStorage.getItem(`history_${userId}`)) || [];
    const actionLabels = { 'watch': '🎬 Watched', 'like': '👍 Liked', 'dislike': '👎 Disliked', 'favorite': '❤️ Added to Favorites', 'watchlist': '📝 Added to Watchlist' };
    history.unshift({ id: Date.now(), timestamp: Date.now(), movieId: movieData.id, movieTitle: movieData.title, action: action, actionLabel: actionLabels[action] || action, date: new Date().toLocaleString() });
    if (history.length > 100) history = history.slice(0, 100);
    localStorage.setItem(`history_${userId}`, JSON.stringify(history));
}

// ========== ADMIN DASHBOARD FUNCTIONS ==========
async function loadAdminStats() {
    try {
        const usersRes = await fetch(`${API_URL}/Admin/users`);
        const users = await usersRes.json();
        const moviesRes = await fetch(`${API_URL}/Movies`);
        const movies = await moviesRes.json();
        let totalFavorites = 0, totalWatchlist = 0;
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
                <div class="admin-stat-card"><div class="stat-info"><h3>Total Users</h3><div class="stat-number">${users.length}</div></div><div class="stat-icon">👥</div></div>
                <div class="admin-stat-card"><div class="stat-info"><h3>Total Movies</h3><div class="stat-number">${movies.length}</div></div><div class="stat-icon">🎬</div></div>
                <div class="admin-stat-card"><div class="stat-info"><h3>Total Favorites</h3><div class="stat-number">${totalFavorites}</div></div><div class="stat-icon">❤️</div></div>
                <div class="admin-stat-card"><div class="stat-info"><h3>Total Watchlist</h3><div class="stat-number">${totalWatchlist}</div></div><div class="stat-icon">📝</div></div>
            `;
        }
    } catch (e) { console.error('Error loading stats:', e); }
}

async function loadLikesActivity() {
    try {
        const usersRes = await fetch(`${API_URL}/Admin/users`);
        const users = await usersRes.json();
        const likes = [];
        for (let user of users) {
            try {
                const favRes = await fetch(`${API_URL}/Movies/favorites/${user.id}`);
                const favs = await favRes.json();
                favs.forEach(m => { likes.push({ username: user.username, movieTitle: m.title, time: new Date().toLocaleString() }); });
            } catch (e) { }
        }
        const recent = likes.slice(-15).reverse();
        const container = document.getElementById('likesActivity');
        if (!container) return;
        if (recent.length === 0) { container.innerHTML = '<div style="text-align:center; padding:2rem; color:rgba(255,255,255,0.5);">No likes yet</div>'; return; }
        container.innerHTML = recent.map(a => `<div class="activity-item"><div class="activity-icon like">👍</div><div class="activity-details"><div class="activity-title">${a.username}</div><div class="activity-subtitle">Liked: ${a.movieTitle}</div><div class="activity-time">${a.time}</div></div><div class="activity-type type-like">Like</div></div>`).join('');
    } catch (e) { console.error(e); }
}

async function loadDislikesActivity() {
    const container = document.getElementById('dislikesActivity');
    if (container) container.innerHTML = '<div style="text-align:center; padding:2rem; color:rgba(255,255,255,0.5);">No dislikes yet</div>';
}

async function loadCommentsActivity() {
    try {
        const moviesRes = await fetch(`${API_URL}/Movies`);
        const movies = await moviesRes.json();
        const allComments = [];
        for (let movie of movies) {
            try {
                const commentsRes = await fetch(`${API_URL}/Movies/${movie.id}/comments`);
                const comments = await commentsRes.json();
                comments.forEach(c => { allComments.push({ username: c.username, movieTitle: movie.title, comment: c.comment, time: new Date(c.commentDate).toLocaleString() }); });
            } catch (e) { }
        }
        const recent = allComments.slice(-15).reverse();
        const container = document.getElementById('commentsActivity');
        if (!container) return;
        if (recent.length === 0) { container.innerHTML = '<div style="text-align:center; padding:2rem; color:rgba(255,255,255,0.5);">No comments yet</div>'; return; }
        container.innerHTML = recent.map(a => `<div class="activity-item"><div class="activity-icon comment">💬</div><div class="activity-details"><div class="activity-title">${a.username}</div><div class="activity-subtitle">Commented on ${a.movieTitle}: "${a.comment.substring(0, 50)}${a.comment.length > 50 ? '...' : ''}"</div><div class="activity-time">${a.time}</div></div><div class="activity-type type-comment">Comment</div></div>`).join('');
    } catch (e) { console.error(e); }
}

async function loadWatchlistActivity() {
    try {
        const usersRes = await fetch(`${API_URL}/Admin/users`);
        const users = await usersRes.json();
        const watchlistItems = [];
        for (let user of users) {
            try {
                const watchRes = await fetch(`${API_URL}/Movies/watchlist/${user.id}`);
                const watchlist = await watchRes.json();
                watchlist.forEach(m => { watchlistItems.push({ username: user.username, movieTitle: m.title, time: new Date().toLocaleString() }); });
            } catch (e) { }
        }
        const recent = watchlistItems.slice(-15).reverse();
        const container = document.getElementById('watchlistActivity');
        if (!container) return;
        if (recent.length === 0) { container.innerHTML = '<div style="text-align:center; padding:2rem; color:rgba(255,255,255,0.5);">No watchlist additions</div>'; return; }
        container.innerHTML = recent.map(a => `<div class="activity-item"><div class="activity-icon watchlist">📝</div><div class="activity-details"><div class="activity-title">${a.username}</div><div class="activity-subtitle">Added to watchlist: ${a.movieTitle}</div><div class="activity-time">${a.time}</div></div><div class="activity-type type-watchlist">Watchlist</div></div>`).join('');
    } catch (e) { console.error(e); }
}

async function loadFavoritesActivity() {
    try {
        const usersRes = await fetch(`${API_URL}/Admin/users`);
        const users = await usersRes.json();
        const favorites = [];
        for (let user of users) {
            try {
                const favRes = await fetch(`${API_URL}/Movies/favorites/${user.id}`);
                const favs = await favRes.json();
                favs.forEach(m => { favorites.push({ username: user.username, movieTitle: m.title, time: new Date().toLocaleString() }); });
            } catch (e) { }
        }
        const recent = favorites.slice(-15).reverse();
        const container = document.getElementById('favoritesActivity');
        if (!container) return;
        if (recent.length === 0) { container.innerHTML = '<div style="text-align:center; padding:2rem; color:rgba(255,255,255,0.5);">No favorites yet</div>'; return; }
        container.innerHTML = recent.map(a => `<div class="activity-item"><div class="activity-icon favorite">❤️</div><div class="activity-details"><div class="activity-title">${a.username}</div><div class="activity-subtitle">Added to favorites: ${a.movieTitle}</div><div class="activity-time">${a.time}</div></div><div class="activity-type type-favorite">Favorite</div></div>`).join('');
    } catch (e) { console.error(e); }
}

async function loadTopMoviesList() {
    try {
        const res = await fetch(`${API_URL}/Movies`);
        const movies = await res.json();
        const top = movies.sort((a, b) => b.rating - a.rating).slice(0, 6);
        const container = document.getElementById('topMoviesList');
        if (container) {
            container.innerHTML = top.map(m => `<div class="activity-item" onclick="window.viewMovie(${m.id})" style="cursor:pointer;"><div class="activity-icon" style="background:linear-gradient(135deg,#3a86ff,#64b4fa);">⭐</div><div class="activity-details"><div class="activity-title">${m.title}</div><div class="activity-subtitle">⭐ ${m.rating}/10 • ${m.year}</div><div class="progress-bar"><div class="progress-fill" style="width: ${(m.rating / 10) * 100}%"></div></div></div></div>`).join('');
        }
    } catch (e) { console.error(e); }
}

async function loadGenreDistributionList() {
    try {
        const res = await fetch(`${API_URL}/Movies`);
        const movies = await res.json();
        const genres = {};
        movies.forEach(m => { m.genre.split(',').forEach(g => { const genre = g.trim(); genres[genre] = (genres[genre] || 0) + 1; }); });
        const sorted = Object.entries(genres).sort((a, b) => b[1] - a[1]).slice(0, 8);
        const container = document.getElementById('genreDistribution');
        if (container) {
            container.innerHTML = sorted.map(([genre, count]) => `<div class="activity-item"><div class="activity-icon" style="background:linear-gradient(135deg,#3a86ff,#64b4fa);">🎭</div><div class="activity-details"><div class="activity-title">${genre}</div><div class="activity-subtitle">${count} movies</div><div class="progress-bar"><div class="progress-fill" style="width: ${(count / movies.length) * 100}%"></div></div></div></div>`).join('');
        }
    } catch (e) { console.error(e); }
}

let userGrowthChart;
async function initUserGrowthChart() {
    try {
        const usersRes = await fetch(`${API_URL}/Admin/users`);
        const users = await usersRes.json();
        const monthly = {};
        users.forEach(u => { const date = new Date(u.createdAt); monthly[date.toLocaleString('default', { month: 'short' })] = (monthly[date.toLocaleString('default', { month: 'short' })] || 0) + 1; });
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const values = months.map(m => monthly[m] || 0);
        const ctx = document.getElementById('userGrowthChart')?.getContext('2d');
        if (ctx && userGrowthChart) userGrowthChart.destroy();
        if (ctx) {
            userGrowthChart = new Chart(ctx, {
                type: 'line',
                data: { labels: months, datasets: [{ label: 'New Users', data: values, borderColor: '#3a86ff', backgroundColor: 'rgba(58, 134, 255, 0.1)', tension: 0.4, fill: true }] },
                options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom', labels: { color: 'white' } } } }
            });
        }
    } catch (e) { console.error(e); }
}

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

// ========== PAGE INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('particles')) createParticles();
    setupWelcomePage();
    setupFormSwitching();
    setupAdminModal();
    setupForgotPassword();
    setupUserAuthButtons();

    if (document.getElementById('moviesGrid') && !document.getElementById('statsGrid')) {
        const userId = localStorage.getItem('userId');
        if (userId && userId !== 'null' && userId !== 'undefined') {
            loadMovies();
        }
    }

    if (document.getElementById('statsGrid')) {
        const userId = localStorage.getItem('userId');
        const userRole = localStorage.getItem('userRole');
        if (!userId || userId === 'null' || userId === 'undefined' || userRole !== 'Admin') {
            window.location.href = 'index.html';
            return;
        }
        loadDashboardStats();
        loadAllUsers();
        loadMovies();
        loadAdminDashboardData();
    }

    if (document.getElementById('favoritesGrid')) loadFavorites();
    if (document.getElementById('watchlistGrid')) loadWatchlist();

    if (document.getElementById('moviePlayer')) {
        const userId = localStorage.getItem('userId');
        if (userId && userId !== 'null' && userId !== 'undefined') {
            window.loadMovieForWatch();
        } else {
            window.location.href = 'index.html';
        }
    }

    if (document.getElementById('profileName') && localStorage.getItem('userId')) window.loadProfile();

    window.onclick = function (e) {
        if (e.target && e.target.classList && e.target.classList.contains('modal-overlay')) {
            e.target.style.display = 'none';
        }
    };
});