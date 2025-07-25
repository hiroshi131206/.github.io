// 現在の年を自動で取得
document.getElementById('current-year').textContent = new Date().getFullYear();

// モバイルメニューのトグル
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');

mobileMenuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileMenuToggle.classList.toggle('active');
});

// スムーズスクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // モバイルメニューを閉じる
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        }
    });
});

// スクロール時のヘッダー処理と上に戻るボタン
let lastScroll = 0;
const header = document.querySelector('.header');
const scrollToTopButton = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // ヘッダーの処理
    if (currentScroll > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // 上に戻るボタンの表示/非表示
    if (currentScroll > 300) {
        scrollToTopButton.classList.add('show');
    } else {
        scrollToTopButton.classList.remove('show');
    }
    
    lastScroll = currentScroll;
});

// 上に戻るボタンのクリックイベント（抜錨アニメーション付き）
scrollToTopButton.addEventListener('click', () => {
    // 抜錨アニメーションを開始
    scrollToTopButton.classList.add('weighing-anchor');
    
    // スムーズスクロール
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // アニメーション終了後にクラスを削除
    setTimeout(() => {
        scrollToTopButton.classList.remove('weighing-anchor');
    }, 800);
});

// 控えめなスクロールアニメーション
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// 監視対象の要素を追加
document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});

// パフォーマンス向上のため、一度アニメーションした要素は監視を停止
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelectorAll('.animate-on-scroll.animate').forEach(el => {
            observer.unobserve(el);
        });
    }, 2000);
});

// メディアプレイヤーの同時再生防止機能
document.addEventListener('DOMContentLoaded', () => {
    const audioElements = document.querySelectorAll('audio');
    const videoElements = document.querySelectorAll('iframe');
    
    // 音声ファイルの同時再生防止
    audioElements.forEach(audio => {
        audio.addEventListener('play', () => {
            // 他の音声を停止
            audioElements.forEach(otherAudio => {
                if (otherAudio !== audio && !otherAudio.paused) {
                    otherAudio.pause();
                    otherAudio.currentTime = 0;
                }
            });
            
            // 動画も停止（YouTube等の外部動画は制御が困難だが、試行）
            videoElements.forEach(video => {
                try {
                    // Google Drive動画の停止を試行
                    if (video.src.includes('drive.google.com')) {
                        video.src = video.src;
                    }
                } catch (e) {
                    // 外部動画の制御エラーは無視
                    console.log('動画制御に制限があります');
                }
            });
        });
    });
});

// セキュリティ機能
document.addEventListener('DOMContentLoaded', () => {
    // 右クリック禁止（プロフィール画像エリア）
    const profileImage = document.querySelector('.profile-image');
    if (profileImage) {
        profileImage.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
        
        // ドラッグ禁止
        profileImage.addEventListener('dragstart', (e) => {
            e.preventDefault();
            return false;
        });
    }
    
    // 音声・動画要素の右クリック禁止
    const mediaElements = document.querySelectorAll('audio, iframe');
    mediaElements.forEach(media => {
        media.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
    });
    
    // 開発者ツール検知（基本的な対策）
    let devtools = {
        open: false,
        orientation: null
    };
    
    const threshold = 160;
    setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                // 開発者ツールが開かれた場合の警告（必要に応じて）
                console.clear();
                console.log('%c警告', 'color: red; font-size: 20px; font-weight: bold;');
                console.log('%cこのサイトのコンテンツは著作権で保護されています。', 'color: red; font-size: 14px;');
            }
        } else {
            devtools.open = false;
        }
    }, 500);
    
    // キーボードショートカット無効化
    document.addEventListener('keydown', (e) => {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U を無効化
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
            (e.ctrlKey && e.key === 'u')) {
            e.preventDefault();
            return false;
        }
        
        // Ctrl+S (保存) を無効化
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            return false;
        }
    });
    
    // 選択・コピー防止（プロフィール画像とメディアエリア）
    const protectedAreas = document.querySelectorAll('.profile-image, .sample-item, .video-item');
    protectedAreas.forEach(area => {
        area.style.userSelect = 'none';
        area.style.webkitUserSelect = 'none';
        area.style.mozUserSelect = 'none';
        area.style.msUserSelect = 'none';
        
        area.addEventListener('selectstart', (e) => {
            e.preventDefault();
            return false;
        });
    });
});