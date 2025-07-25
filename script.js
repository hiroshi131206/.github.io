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