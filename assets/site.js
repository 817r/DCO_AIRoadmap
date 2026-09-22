// DCO_AI Reforger — shared nav, footer, data loading and helpers.
// Every page loads this at the end of <body>, then uses DCO.ready / DCO.load().

(function () {
    const PAGES = [
        ['index.html', 'Home'],
        ['roadmap.html', 'Roadmap'],
        ['features.html', 'Features'],
        ['devlog.html', 'Devlog'],
        ['media.html', 'Media'],
        ['about.html', 'Team'],
        ['recruitment.html', 'Join Us'],
    ];
    const current = location.pathname.split('/').pop() || 'index.html';

    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fmt = n => Number(n).toLocaleString('en-US');

    // ----- Nav -----
    const links = PAGES.map(([href, label]) =>
        `<li><a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a></li>`).join('');
    document.body.insertAdjacentHTML('afterbegin', `
        <a class="sr-only" href="#main">Skip to content</a>
        <nav class="nav" aria-label="Main">
            <div class="container">
                <a class="brand" href="index.html">
                    <img src="images/dragon_company.png" alt="" width="36" height="36">
                    <span class="brand-name">DCO<span>_</span>AI</span>
                </a>
                <ul class="nav-links" id="nav-links">
                    ${links}
                </ul>
                <a class="btn btn-primary btn-sm nav-cta" href="donate.html"${current === 'donate.html' ? ' aria-current="page"' : ''}>Support</a>
                <button class="nav-toggle" aria-label="Menu" aria-expanded="false" aria-controls="nav-links"><span></span></button>
            </div>
        </nav>`);
    const nav = document.querySelector('.nav');
    nav.querySelector('.nav-toggle').addEventListener('click', e => {
        const open = nav.classList.toggle('open');
        e.currentTarget.setAttribute('aria-expanded', open);
    });

    // ----- Data -----
    const cache = {};
    const load = name => cache[name] || (cache[name] = fetch(`data/${name}.json`).then(r => {
        if (!r.ok) throw new Error(`data/${name}.json: ${r.status}`);
        return r.json();
    }));

    function funding(site) {
        const raised = site.donors.reduce((sum, d) => sum + d.amount, 0);
        const goal = site.funding.goal;
        return { raised, goal, pct: Math.min(100, raised / goal * 100), count: site.donors.length };
    }

    const rank = (site, amount) => site.funding.ranks.find(r => amount >= r.min);

    // Progress colour, same thresholds everywhere
    function status(prog) {
        if (prog >= 75) return { key: 'complete', label: 'Complete', color: 'var(--green)' };
        if (prog >= 25) return { key: 'progress', label: 'In Progress', color: 'var(--yellow)' };
        if (prog > 0) return { key: 'early', label: 'Early Dev', color: 'var(--orange)' };
        return { key: 'planned', label: 'Planned', color: 'var(--red)' };
    }

    // Release state from the "ver" field: a version = on Workshop, "dev" = dev build only
    function release(ver) {
        if (ver === 'dev') return { key: 'dev', html: '<span class="chip chip-dev" title="In the development build, coming in the next Workshop update">Dev build</span>' };
        if (ver === 'planned') return { key: 'planned', html: '<span class="chip chip-planned">Planned</span>' };
        return { key: 'live', html: `<span class="chip chip-live" title="Live on the Workshop since ${esc(ver)}">${esc(ver)}</span>` };
    }

    // Fill [data-bind] / [data-link] / [data-bar] from site.json
    function bind(site) {
        const f = funding(site);
        const values = {
            version: site.version,
            gameVersion: site.gameVersion,
            phase: site.phase,
            downloads: fmt(site.downloads),
            rating: site.rating + '%',
            releases: site.releases,
            raised: '$' + fmt(f.raised),
            goal: '$' + fmt(f.goal),
            pct: (Math.round(f.pct * 10) / 10) + '%',
            contributors: f.count,
            email: site.links.email,
        };
        document.querySelectorAll('[data-bind]').forEach(el => {
            const v = values[el.dataset.bind];
            if (v !== undefined) el.textContent = v;
        });
        document.querySelectorAll('[data-link]').forEach(el => {
            const key = el.dataset.link;
            el.href = key === 'email' ? `mailto:${site.links.email}` : site.links[key];
            if (key !== 'email') { el.target = '_blank'; el.rel = 'noopener'; }
        });
        document.querySelectorAll('[data-bar="funding"]').forEach(el => {
            requestAnimationFrame(() => { el.style.width = f.pct + '%'; });
        });
    }

    // Lite YouTube: thumbnail until clicked, then the real player
    function initVideos(root = document) {
        root.querySelectorAll('.yt[data-yt]:not([data-ready])').forEach(el => {
            const id = el.dataset.yt;
            el.dataset.ready = '1';
            el.style.backgroundImage = `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)`;
            el.setAttribute('role', 'button');
            el.setAttribute('tabindex', '0');
            el.setAttribute('aria-label', 'Play video: ' + (el.dataset.title || 'DCO_AI gameplay'));
            el.innerHTML = `<span class="yt-play"></span>${el.dataset.title ? `<span class="yt-title">${esc(el.dataset.title)}</span>` : ''}`;
            const play = () => {
                el.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="${esc(el.dataset.title || 'DCO_AI video')}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
            };
            el.addEventListener('click', play, { once: true });
            el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); } }, { once: true });
        });
    }

    // ----- Footer -----
    const year = new Date().getFullYear();
    document.body.insertAdjacentHTML('beforeend', `
        <footer class="footer">
            <div class="container">
                <div class="footer-grid">
                    <div>
                        <a class="brand" href="index.html">
                            <img src="images/dragon_company.png" alt="" width="36" height="36">
                            <span class="brand-name">DCO<span>_</span>AI Reforger</span>
                        </a>
                        <p>Autonomous tactical AI for Arma Reforger, built by Dragon Company. Free on the Workshop, funded by players.</p>
                    </div>
                    <div>
                        <h4>Project</h4>
                        <ul>${PAGES.slice(1).map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('')}</ul>
                    </div>
                    <div>
                        <h4>Connect</h4>
                        <ul>
                            <li><a data-link="workshop" href="#">Workshop</a></li>
                            <li><a data-link="discord" href="#">Discord</a></li>
                            <li><a data-link="kofi" href="#">Ko-fi</a></li>
                            <li><a data-link="email" href="#">Email</a></li>
                            <li><a href="donate.html">Support</a></li>
                        </ul>
                    </div>
                </div>
                <div class="footer-bottom">
                    <span>© ${year} Dragon Company · DCO_AI Reforger</span>
                    <span>Community mod. Not affiliated with Bohemia Interactive.</span>
                </div>
            </div>
        </footer>`);

    const ready = load('site').then(site => { bind(site); initVideos(); return site; });
    ready.catch(err => console.error('DCO: could not load site data', err));

    window.DCO = { ready, load, funding, rank, status, release, esc, fmt, initVideos };
})();
