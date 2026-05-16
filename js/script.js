// ############################################################
// Shared constants and helpers
// ############################################################

const VALID_TABS = ['home', 'tools', 'news', 'members', 'publications', 'links'];
const ENTRY_HASH_PATTERN = /^(news|publications)-(\d{4}-\d{2}-\d{2})(?:-(\d+))?$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ENTRY_HASH_TARGETS = {
    news: 'News',
    publications: 'Publications'
};

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const getTabButton = (tabName) => document.querySelector(`.tablinks[onclick*="${tabName}"]`);

const getCurrentHash = () => {
    const hash = window.location.hash.slice(1);

    try {
        return decodeURIComponent(hash);
    } catch {
        return hash;
    }
};

const getEntryHashTarget = (hash) => {
    const match = hash.match(ENTRY_HASH_PATTERN);
    if (!match) {
        return null;
    }

    const [, prefix, , duplicateIndex] = match;
    if (duplicateIndex && Number(duplicateIndex) < 2) {
        return null;
    }

    const tabName = ENTRY_HASH_TARGETS[prefix];
    return tabName ? { id: hash, tabName } : null;
};

function normalizeEntries(container, entryClassName) {
    if (!container || container.dataset.normalized === 'true') {
        return;
    }

    const fragment = document.createDocumentFragment();
    let entry = null;

    const commitEntry = () => {
        if (entry && entry.childElementCount > 0) {
            fragment.appendChild(entry);
        }
        entry = null;
    };

    for (const node of container.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '') {
            continue;
        }

        if (node.nodeType === Node.COMMENT_NODE) {
            continue;
        }

        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'HR') {
            commitEntry();
            continue;
        }

        if (!entry) {
            entry = document.createElement('article');
            entry.className = entryClassName;
        }

        entry.appendChild(node);
    }

    commitEntry();
    container.replaceChildren(fragment);
    container.dataset.normalized = 'true';
}

function assignEntryIds(container, entryClassName, entryHashPrefix) {
    if (!container || !entryClassName || !entryHashPrefix || container.dataset.entryIds === 'true') {
        return;
    }

    const dateCounts = new Map();

    Array.from(container.children).forEach((entry) => {
        if (!entry.classList.contains(entryClassName)) {
            return;
        }

        const date = entry.querySelector('h3 time[datetime]')?.getAttribute('datetime');
        if (!date || !ISO_DATE_PATTERN.test(date)) {
            return;
        }

        const dateCount = (dateCounts.get(date) ?? 0) + 1;
        dateCounts.set(date, dateCount);

        entry.id = `${entryHashPrefix}-${date}${dateCount > 1 ? `-${dateCount}` : ''}`;
    });

    container.dataset.entryIds = 'true';
}

// ############################################################
// HTMLファイルの読み込み
// ############################################################

const loadFragment = async (path, targetId, entryClassName, entryHashPrefix) => {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to load ${path}: ${response.status}`);
        }

        const target = document.getElementById(targetId);
        if (!target) {
            console.error(`Target container not found: ${targetId}`);
            return;
        }

        target.innerHTML = await response.text();
        if (entryClassName) {
            normalizeEntries(target, entryClassName);
            assignEntryIds(target, entryClassName, entryHashPrefix);
        }
    } catch (error) {
        console.error(`Error loading ${path}:`, error);
    }
};

const initializeContent = () => {
    const fragments = [
        { path: './html/tools.html', targetId: 'tools-html' },
        { path: './html/news.html', targetId: 'news-html', entryClassName: 'news-entry', entryHashPrefix: 'news' },
        { path: './html/members.html', targetId: 'members-html' },
        {
            path: './html/publications.html',
            targetId: 'publications-html',
            entryClassName: 'publication-entry',
            entryHashPrefix: 'publications'
        },
        { path: './html/links.html', targetId: 'links-html' }
    ];

    return Promise.all(fragments.map(({ path, targetId, entryClassName, entryHashPrefix }) => (
        loadFragment(path, targetId, entryClassName, entryHashPrefix)
    )));
};

const contentReady = initializeContent();

// ############################################################
// タブ切り替え操作
// ############################################################

function openTab(evt, tabName, options = {}) {
    const { updateHash = true } = options;

    evt?.preventDefault();

    document.querySelectorAll('.tabcontent').forEach((content) => {
        content.style.display = 'none';
    });

    document.querySelectorAll('.tablinks').forEach((tab) => {
        tab.classList.remove('active');
    });

    const activeTab = document.getElementById(tabName);
    if (!activeTab) {
        console.error(`Tab content not found: ${tabName}`);
        return;
    }

    activeTab.style.display = 'block';
    const activeButton = evt?.currentTarget ?? getTabButton(tabName);
    activeButton?.classList.add('active');

    if (updateHash) {
        history.replaceState(null, '', `#${tabName.toLowerCase()}`);
    }
}

const initializeFooterYear = () => {
    const currentYear = document.getElementById('current-year');
    if (currentYear) {
        currentYear.textContent = String(new Date().getFullYear());
    }
};

const scrollToEntry = (entryId, behavior = 'smooth') => {
    const target = document.getElementById(entryId);
    if (!target) {
        console.warn(`Entry target not found: ${entryId}`);
        return;
    }

    requestAnimationFrame(() => {
        target.scrollIntoView({
            behavior,
            block: 'start'
        });
    });
};

const scrollToTop = (behavior = 'auto') => {
    requestAnimationFrame(() => {
        if (behavior === 'smooth') {
            window.scrollTo({ top: 0, left: 0, behavior });
            return;
        }

        window.scrollTo(0, 0);
    });
};

const handleHashNavigation = async (behavior = 'auto') => {
    const hash = getCurrentHash();
    const entryTarget = getEntryHashTarget(hash);

    if (entryTarget) {
        openTab(null, entryTarget.tabName, { updateHash: false });
        await contentReady;
        if (getCurrentHash() !== entryTarget.id) {
            return;
        }

        scrollToEntry(entryTarget.id, behavior);
        return;
    }

    if (VALID_TABS.includes(hash)) {
        openTab(null, capitalize(hash), { updateHash: false });
        scrollToTop(behavior);
        return;
    }

    openTab(null, 'Home', { updateHash: false });
};

const initializeTabs = () => {
    void handleHashNavigation();
};

window.addEventListener('hashchange', () => {
    void handleHashNavigation('smooth');
});

// ############################################################
// インタラクティブ図のツールクリック機能
// ############################################################

const highlightToolCard = (targetElement) => {
    targetElement.style.transition = 'all 0.3s ease';
    targetElement.style.transform = 'scale(1.02)';
    targetElement.style.boxShadow = '0 8px 25px rgba(239, 131, 0, 0.3)';

    setTimeout(() => {
        targetElement.style.transform = 'scale(1)';
        targetElement.style.boxShadow = '';
    }, 2000);
};

const initializeInteractiveTools = () => {
    document.querySelectorAll('.clickable-tool').forEach((tool) => {
        tool.addEventListener('click', () => {
            const { section: sectionId } = tool.dataset;
            if (!sectionId) {
                return;
            }

            openTab(null, 'Tools');

            setTimeout(() => {
                const targetElement = document.getElementById(sectionId);
                if (!targetElement) {
                    console.error(`Tool section not found: ${sectionId}`);
                    return;
                }

                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });

                highlightToolCard(targetElement);
            }, 300);
        });

        tool.addEventListener('mouseenter', () => {
            const { section: sectionId } = tool.dataset;
            if (!sectionId) {
                return;
            }

            tool.style.cursor = 'pointer';
            tool.setAttribute('title', `${sectionId}の詳細を見る`);
        });
    });
};

document.addEventListener('DOMContentLoaded', () => {
    initializeFooterYear();
    initializeTabs();
    initializeInteractiveTools();
});
