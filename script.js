// Login Validation (guarded)
(function(){
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const error = document.getElementById('error');
        if (username.length < 4 || password.length < 6 || !username || !password) {
            if (error) error.textContent = 'Invalid credentials.';
        } else {
            window.location.href = 'home.html';
        }
    });
})();

// Date and Time
function updateDateTime() {
    const now = new Date();
    document.getElementById('datetime').textContent = now.toLocaleString();
}
if (document.getElementById('datetime')) {
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

// Slideshow
// Make slideshow code safe on pages that don't include slideshow elements
(function(){
    let slideIndex = 0;
    const slides = document.querySelectorAll('#slideshow img');
    const dotsContainer = document.getElementById('dots');
    if (!slides || slides.length === 0 || !dotsContainer) return; // nothing to do

    slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.addEventListener('click', () => showSlide(i));
        dotsContainer.appendChild(dot);
    });

    function showSlide(n) {
        slides.forEach(s => s.classList.remove('active'));
        document.querySelectorAll('#dots .dot').forEach(d => d.classList.remove('active'));
        slideIndex = n;
        slides[slideIndex].classList.add('active');
        const dots = document.querySelectorAll('#dots .dot');
        if (dots[slideIndex]) dots[slideIndex].classList.add('active');
    }

    function nextSlide() { showSlide((slideIndex + 1) % slides.length); }
    function prevSlide() { showSlide((slideIndex - 1 + slides.length) % slides.length); }

    const nextBtn = document.getElementById('next');
    const prevBtn = document.getElementById('prev');
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);

    // default interval
    const interval = 3000;
    setInterval(nextSlide, interval);
    showSlide(0);
})();

// Grades: populate tables with random grades
(function(){
    const gradeOptions = ['A+', 'A', 'B+', 'B'];
    function randomGrade(){ return gradeOptions[Math.floor(Math.random()*gradeOptions.length)]; }

    // Key per page
    function gradesStorageKey(){ return 'grades:' + (location.pathname || location.href); }

    function loadSavedGrades(){
        try {
            const raw = localStorage.getItem(gradesStorageKey());
            return raw ? JSON.parse(raw) : {};
        } catch(e){ return {}; }
    }

    function saveGrades(obj){
        try { localStorage.setItem(gradesStorageKey(), JSON.stringify(obj)); } catch(e){}
    }

    function assignGrades(){
        const tables = document.querySelectorAll('.grades-table');
        if (!tables || tables.length===0) return;
        const saved = loadSavedGrades();

        tables.forEach(table => {
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const courseCell = row.querySelector('td:first-child');
                const gradeCell = row.querySelector('td.grade');
                if (!courseCell || !gradeCell) return;
                const course = courseCell.textContent.trim();
                if (saved[course]) {
                    gradeCell.textContent = saved[course];
                } else {
                    const g = randomGrade();
                    gradeCell.textContent = g;
                    saved[course] = g;
                }
                // make grade cells editable by cycling on click (attach listener once)
                gradeCell.style.cursor = 'pointer';
                gradeCell.title = 'Click to change grade';
                if (!gradeCell.dataset.listenerAttached) {
                    gradeCell.addEventListener('click', function(){
                        const current = this.textContent.trim();
                        const idx = gradeOptions.indexOf(current);
                        const next = gradeOptions[(idx + 1) % gradeOptions.length];
                        this.textContent = next;
                        saved[course] = next;
                        saveGrades(saved);
                    });
                    gradeCell.dataset.listenerAttached = '1';
                }
            });
        });

        // persist after initial population
        saveGrades(saved);
    }

    // Run on DOMContentLoaded if not already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', assignGrades);
    } else {
        assignGrades();
    }
    // No regenerate button handler — grades are assigned on load and persist in localStorage.
})();

// Dropdown interaction: support hover, focus and click/touch toggle
(function(){
    const dropdowns = document.querySelectorAll('.dropdown');
    if (!dropdowns || dropdowns.length === 0) return;

    dropdowns.forEach(dd => {
        const trigger = dd.querySelector(':scope > a');

        // Mouse enter/leave to add/remove open class (ensures hide on cursor leave)
        dd.addEventListener('mouseenter', () => dd.classList.add('open'));
        dd.addEventListener('mouseleave', () => dd.classList.remove('open'));

        // On touch devices or when click is used, toggle open state
        if (trigger) {
            trigger.addEventListener('click', (e) => {
                // If device supports hover, let hover handle it; otherwise toggle
                if (window.matchMedia && window.matchMedia('(hover: none)').matches) {
                    e.preventDefault();
                    dd.classList.toggle('open');
                }
            });
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        dropdowns.forEach(dd => {
            if (!dd.contains(e.target)) dd.classList.remove('open');
        });
    });
})();

// Hobbies page: save and restore brief history (video upload/paths removed)
(function(){
    const historyBox = document.getElementById('hobbiesHistory');
    const saveHistoryBtn = document.getElementById('saveHobbiesHistory');
    const clearHistoryBtn = document.getElementById('clearHobbiesHistory');
    const historyKey = 'hobbies:history';

    function restoreHistory(){
        try { const h = localStorage.getItem(historyKey); if (h && historyBox) historyBox.value = h; } catch(e){}
    }

    function saveHistory(){ if (!historyBox) return; try { localStorage.setItem(historyKey, historyBox.value); } catch(e){} }

    if (saveHistoryBtn) saveHistoryBtn.addEventListener('click', saveHistory);
    if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', ()=>{ if (historyBox) { historyBox.value=''; saveHistory(); } });

    // restore on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', restoreHistory);
    } else { restoreHistory(); }
})();

// Career page slideshow and history box (robust initializer)
(function(){
    const historyKey = 'career:history';
    function initCareerModule(){
        try {
            const slideshow = document.getElementById('careerSlideshow');
            if (!slideshow) return; // nothing to do on pages without the slideshow

            const slides = Array.from(slideshow.querySelectorAll('.career-slide'));
            if (!slides || slides.length === 0) return;

            const prev = slideshow.querySelector('#careerPrev') || document.getElementById('careerPrev');
            const next = slideshow.querySelector('#careerNext') || document.getElementById('careerNext');
            let dots = document.getElementById('careerDots');
            if (!dots) {
                dots = document.createElement('div');
                dots.id = 'careerDots';
                slideshow.appendChild(dots);
            }

            const intervalMs = (slideshow.dataset && slideshow.dataset.interval) ? (parseInt(slideshow.dataset.interval, 10) || 3000) : 3000;
            let idx = 0;
            let timer = null;

            // create dots
            dots.innerHTML = '';
            slides.forEach((_, i)=>{
                const d = document.createElement('span');
                d.className = 'dot';
                d.setAttribute('role', 'button');
                d.setAttribute('aria-label', 'Show slide ' + (i+1));
                d.addEventListener('click', ()=>{ show(i); resetTimer(); });
                dots.appendChild(d);
            });

            function show(i){
                if (i < 0) i = slides.length - 1;
                if (i >= slides.length) i = 0;
                slides.forEach((s, j)=> s.classList.toggle('active', j === i));
                const ds = dots ? Array.from(dots.querySelectorAll('.dot')) : [];
                ds.forEach((d, j)=> d.classList.toggle('active', j === i));
                idx = i;
            }

            function nextSlide(){ show((idx + 1) % slides.length); }
            function prevSlide(){ show((idx - 1 + slides.length) % slides.length); }

            if (next) next.addEventListener('click', ()=>{ nextSlide(); resetTimer(); });
            if (prev) prev.addEventListener('click', ()=>{ prevSlide(); resetTimer(); });

            function startTimer(){ if (timer) clearInterval(timer); if (slides.length > 1) timer = setInterval(nextSlide, intervalMs); }
            function stopTimer(){ if (timer) { clearInterval(timer); timer = null; } }
            function resetTimer(){ stopTimer(); startTimer(); }

            // pause/resume on hover and touch
            slideshow.addEventListener('mouseenter', stopTimer);
            slideshow.addEventListener('mouseleave', startTimer);
            slideshow.addEventListener('touchstart', stopTimer, {passive:true});
            slideshow.addEventListener('touchend', ()=>{ resetTimer(); }, {passive:true});

            // Initialize
            show(0);
            startTimer();

        } catch (err) {
            console.error('Career slideshow init error:', err);
        }
    }

    // career history persistence (supports textarea or contenteditable div)
    function restoreCareerHistory(){
        try {
            const historyBox = document.getElementById('careerHistory');
            const saveBtn = document.getElementById('saveCareerHistory');
            function getHistory(){ try { if (!historyBox) return ''; return (historyBox.value !== undefined) ? historyBox.value : (historyBox.innerText || historyBox.textContent || ''); } catch(e){ return ''; } }
            function setHistory(v){ try { if (!historyBox) return; if (historyBox.value !== undefined) historyBox.value = v; else historyBox.innerText = v; } catch(e){} }
            function restore(){ try { const h = localStorage.getItem(historyKey); if (h) setHistory(h); } catch(e){} }
            function save(){ try { const v = getHistory(); localStorage.setItem(historyKey, v); } catch(e){} }
            if (saveBtn) saveBtn.addEventListener('click', save);
            restore();
        } catch (err) { console.error('Career history init error:', err); }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function(){ initCareerModule(); restoreCareerHistory(); });
    } else {
        initCareerModule(); restoreCareerHistory();
    }
})();