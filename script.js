// グローバル変数
let isLoading = true;
let scrollPosition = 0;

// ローディング処理
document.addEventListener('DOMContentLoaded', () => {
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loading);
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            loading.classList.add('hidden');
            isLoading = false;
            initAnimations();
        }, 800);
    });
});

// カスタムカーソル
if (window.matchMedia('(min-width: 768px)').matches) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 20 + 'px';
        cursor.style.top = e.clientY - 20 + 'px';
    });
    
    document.querySelectorAll('a, button, .sample-item, .video-item, .work-category').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// スムーズスクロール改善
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // モバイルメニューを閉じる
            const navMenu = document.querySelector('.nav-menu');
            const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        }
    });
});

// ヘッダーの動的スタイル
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // スクロール方向の検出
    if (currentScroll > lastScroll && currentScroll > 100) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }
    
    // スクロール状態の管理
    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
    scrollPosition = currentScroll;
});

// パララックス効果
const parallaxElements = document.querySelectorAll('.hero, .profile-image, .video-item');

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    parallaxElements.forEach(el => {
        const speed = el.dataset.speed || 0.5;
        const yPos = -(scrolled * speed);
        el.style.transform = `translateY(${yPos}px)`;
    });
});

// スクロールアニメーション
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('aos-animate');
                
                // 段階的アニメーション
                const children = entry.target.querySelectorAll('.sample-item, .work-category, .equipment-category');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.style.opacity = '1';
                        child.style.transform = 'translateY(0)';
                    }, index * 100);
                });
            }
        });
    }, observerOptions);
    
    // アニメーション対象要素
    document.querySelectorAll('.section').forEach(el => {
        el.setAttribute('data-aos', 'fade-up');
        observer.observe(el);
    });
}

// モバイルメニューの改善
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navMenu = document.querySelector('.nav-menu');
let isMenuOpen = false;

mobileMenuToggle.addEventListener('click', () => {
    isMenuOpen = !isMenuOpen;
    mobileMenuToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // メニュー開閉時のボディスクロール制御
    if (isMenuOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

// テキストアニメーション
const animateText = (element) => {
    const text = element.textContent;
    element.textContent = '';
    
    [...text].forEach((char, index) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.opacity = '0';
        span.style.display = 'inline-block';
        span.style.animation = `fadeInUp 0.5s ${index * 0.02}s forwards`;
        element.appendChild(span);
    });
};

// ヒーローテキストアニメーション
if (!isLoading) {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) animateText(heroTitle);
}

// オーディオプレイヤーのカスタマイズ
document.querySelectorAll('audio').forEach(audio => {
    audio.addEventListener('play', function() {
        // 他のオーディオを停止
        document.querySelectorAll('audio').forEach(otherAudio => {
            if (otherAudio !== audio) {
                otherAudio.pause();
            }
        });
        
        // 再生中のアイテムをハイライト
        const sampleItem = audio.closest('.sample-item');
        if (sampleItem) {
            document.querySelectorAll('.sample-item').forEach(item => {
                item.classList.remove('playing');
            });
            sampleItem.classList.add('playing');
        }
    });
    
    audio.addEventListener('pause', function() {
        const sampleItem = audio.closest('.sample-item');
        if (sampleItem) {
            sampleItem.classList.remove('playing');
        }
    });
});

// フォームバリデーション
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        const inputs = this.querySelectorAll('[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
                
                // エラーメッセージ表示
                if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('error-message')) {
                    const errorMsg = document.createElement('span');
                    errorMsg.className = 'error-message';
                    errorMsg.textContent = 'このフィールドは必須です';
                    errorMsg.style.color = 'var(--accent-color)';
                    errorMsg.style.fontSize = '0.875rem';
                    errorMsg.style.marginTop = '0.25rem';
                    errorMsg.style.display = 'block';
                    input.parentNode.appendChild(errorMsg);
                }
            } else {
                input.classList.remove('error');
                const errorMsg = input.parentNode.querySelector('.error-message');
                if (errorMsg) errorMsg.remove();
            }
        });
        
        if (!isValid) {
            e.preventDefault();
            
            // エラーフィールドまでスクロール
            const firstError = this.querySelector('.error');
            if (firstError) {
                firstError.focus();
                const rect = firstError.getBoundingClientRect();
                window.scrollTo({
                    top: rect.top + window.pageYOffset - 100,
                    behavior: 'smooth'
                });
            }
        }
    });
    
    // リアルタイムバリデーション
    contactForm.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.classList.add('error');
            } else {
                this.classList.remove('error');
                const errorMsg = this.parentNode.querySelector('.error-message');
                if (errorMsg) errorMsg.remove();
            }
        });
    });
}

// 年の自動更新
document.getElementById('current-year').textContent = new Date().getFullYear();

// パフォーマンス最適化：遅延読み込み
const lazyImages = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
        }
    });
});

lazyImages.forEach(img => imageObserver.observe(img));

// マウスホバーエフェクト
document.querySelectorAll('.work-category, .equipment-category').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// キーボードナビゲーション
document.addEventListener('keydown', (e) => {
    // Escapeキーでモバイルメニューを閉じる
    if (e.key === 'Escape' && isMenuOpen) {
        mobileMenuToggle.click();
    }
    
    // Tabキーでのフォーカス管理
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
});

// ページ遷移アニメーション
window.addEventListener('beforeunload', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
});

console.log('🎨 Portfolio site loaded successfully!');
console.log('💻 Developed with passion for voice acting');