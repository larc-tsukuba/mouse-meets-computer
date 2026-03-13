// ############################################################
// Shared constants and helpers
// ############################################################

const VALID_TABS = ['home', 'tools', 'news', 'members', 'publications', 'links'];

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);

const getTabButton = (tabName) => document.querySelector(`.tablinks[onclick*="${tabName}"]`);

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

// ############################################################
// HTMLファイルの読み込み
// ############################################################

const loadFragment = async (path, targetId, entryClassName) => {
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
        }
    } catch (error) {
        console.error(`Error loading ${path}:`, error);
    }
};

const initializeContent = () => {
    const fragments = [
        { path: './html/tools.html', targetId: 'tools-html' },
        { path: './html/news.html', targetId: 'news-html', entryClassName: 'news-entry' },
        { path: './html/members.html', targetId: 'members-html' },
        { path: './html/publications.html', targetId: 'publications-html', entryClassName: 'publication-entry' },
        { path: './html/links.html', targetId: 'links-html' }
    ];

    fragments.forEach(({ path, targetId, entryClassName }) => {
        void loadFragment(path, targetId, entryClassName);
    });
};

initializeContent();

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

const initializeTabs = () => {
    const hash = window.location.hash.slice(1);
    const hasValidHash = VALID_TABS.includes(hash);
    const initialTabName = hasValidHash ? capitalize(hash) : 'Home';

    openTab(null, initialTabName, { updateHash: hasValidHash });

    if (hasValidHash) {
        setTimeout(() => window.scrollTo(0, 0), 0);
    }
};

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (VALID_TABS.includes(hash)) {
        openTab(null, capitalize(hash), { updateHash: false });
        window.scrollTo(0, 0);
    }
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
