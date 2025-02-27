// ############################################################
// HTMLファイルの読み込み
// ############################################################

fetch('./html/tools.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('tools-html').innerHTML = data;
    })
    .catch(error => console.error('Error loading tools.html:', error));


fetch('./html/news.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('news-html').innerHTML = data;
    })
    .catch(error => console.error('Error loading news.html:', error));


fetch('./html/members.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('members-html').innerHTML = data;
    })
    .catch(error => console.error('Error loading members.html:', error));


fetch('./html/publications.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('publications-html').innerHTML = data;
    })
    .catch(error => console.error('Error loading publications.html:', error));


fetch('./html/links.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('links-html').innerHTML = data;
    })
    .catch(error => console.error('Error loading links.html:', error));

// ############################################################
// タブ切り替え操作
// ############################################################

function openTab(evt, tabName) {
    // リンクのデフォルト動作を防ぐ（画面がスクロールしないようにする）
    if (evt) {
        evt.preventDefault();
    }

    // Hide all tab content
    var tabcontent = document.getElementsByClassName("tabcontent");
    for (var i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Remove the "active" class from all tab links
    var tablinks = document.getElementsByClassName("tablinks");
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab's content and add "active" class to the clicked tab
    document.getElementById(tabName).style.display = "block";
    if (evt) {
        evt.currentTarget.className += " active";
    }

    // Update the URL hash without scrolling
    history.replaceState(null, null, `#${tabName.toLowerCase()}`);
}

document.addEventListener("DOMContentLoaded", function () {
    // URLのハッシュを取得
    var hash = window.location.hash.slice(1); // "#" を除去
    var validTabs = ["tools", "news", "members", "publications", "links"]; // 有効なタブID

    // ハッシュが有効なタブIDの場合のみ適用
    if (validTabs.includes(hash)) {
        document.getElementById(hash.charAt(0).toUpperCase() + hash.slice(1)).style.display = "block";
        var button = document.querySelector(`.tablinks[onclick*="${hash.charAt(0).toUpperCase() + hash.slice(1)}"]`);
        if (button) {
            button.className += " active";
        }

        // スクロール位置をトップにリセット
        setTimeout(() => window.scrollTo(0, 0), 0);
    } else {
        // デフォルトタブを表示
        document.getElementById("Tools").style.display = "block";
        document.querySelector(`.tablinks[onclick*="Tools"]`).className += " active";
    }
});

// ハッシュ変更時の処理
window.addEventListener("hashchange", function () {
    var hash = window.location.hash.slice(1); // "#" を除去
    var validTabs = ["tools", "news", "members", "publications", "links"]; // 有効なタブID

    // ハッシュが有効なタブIDの場合のみ適用
    if (validTabs.includes(hash)) {
        openTab(null, hash.charAt(0).toUpperCase() + hash.slice(1));

        // スクロール位置をトップにリセット
        window.scrollTo(0, 0);
    }
});

