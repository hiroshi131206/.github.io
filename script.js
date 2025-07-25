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

// 改良版メディアプレイヤーの同時再生防止機能
document.addEventListener('DOMContentLoaded', () => {
    // メディア要素の管理
    const mediaManager = {
        currentlyPlaying: null,
        audioElements: [],
        videoElements: [],
        
        init() {
            // 音声要素を収集
            this.audioElements = Array.from(document.querySelectorAll('audio'));
            // 動画要素（iframe）を収集
            this.videoElements = Array.from(document.querySelectorAll('iframe'));
            
            // 各メディア要素にユニークIDを付与
            this.audioElements.forEach((audio, index) => {
                audio.setAttribute('data-media-id', `audio-${index}`);
                this.setupAudioEvents(audio);
            });
            
            this.videoElements.forEach((iframe, index) => {
                iframe.setAttribute('data-media-id', `video-${index}`);
                this.setupVideoEvents(iframe);
            });
            
            // ページの可視性変更時にすべてのメディアを停止
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.stopAllMedia();
                }
            });
        },
        
        setupAudioEvents(audio) {
            // 音声再生開始時
            audio.addEventListener('play', () => {
                const mediaId = audio.getAttribute('data-media-id');
                this.stopOtherMedia(mediaId);
                this.currentlyPlaying = mediaId;
            });
            
            // 音声停止・終了時
            audio.addEventListener('pause', () => {
                if (this.currentlyPlaying === audio.getAttribute('data-media-id')) {
                    this.currentlyPlaying = null;
                }
            });
            
            audio.addEventListener('ended', () => {
                if (this.currentlyPlaying === audio.getAttribute('data-media-id')) {
                    this.currentlyPlaying = null;
                }
            });
        },
        
        setupVideoEvents(iframe) {
            const mediaId = iframe.getAttribute('data-media-id');
            
            // iframeのクリックを検知するためのオーバーレイを作成
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10;
                background: transparent;
                cursor: pointer;
            `;
            
            // iframe要素の親要素の位置情報を確保
            const wrapper = iframe.closest('.video-wrapper');
            if (wrapper) {
                wrapper.style.position = 'relative';
                wrapper.appendChild(overlay);
                
                // オーバーレイクリック時に他のメディアを停止
                overlay.addEventListener('click', () => {
                    this.stopOtherMedia(mediaId);
                    this.currentlyPlaying = mediaId;
                    
                    // 短時間後にオーバーレイを非表示にして動画操作を可能にする
                    setTimeout(() => {
                        overlay.style.display = 'none';
                    }, 100);
                });
                
                // 動画が停止されたときオーバーレイを再表示
                const resetOverlay = () => {
                    overlay.style.display = 'block';
                    if (this.currentlyPlaying === mediaId) {
                        this.currentlyPlaying = null;
                    }
                };
                
                // マウスが動画エリアから離れたらオーバーレイを再表示
                wrapper.addEventListener('mouseleave', resetOverlay);
            }
            
            // YouTube動画の場合、より積極的な制御を試行
            if (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be')) {
                this.setupYouTubeControl(iframe);
            }
        },
        
        setupYouTubeControl(iframe) {
            // YouTube Player APIの読み込みを試行
            if (typeof YT === 'undefined' && !window.youtubeAPILoading) {
                window.youtubeAPILoading = true;
                const script = document.createElement('script');
                script.src = 'https://www.youtube.com/iframe_api';
                document.head.appendChild(script);
            }
        },
        
        stopOtherMedia(currentMediaId) {
            // 他の音声を停止
            this.audioElements.forEach(audio => {
                const audioId = audio.getAttribute('data-media-id');
                if (audioId !== currentMediaId && !audio.paused) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            });
            
            // 他の動画を制御（強制的にsrcを更新）
            this.videoElements.forEach(iframe => {
                const videoId = iframe.getAttribute('data-media-id');
                if (videoId !== currentMediaId) {
                    this.stopVideo(iframe);
                }
            });
        },
        
        stopVideo(iframe) {
            try {
                const originalSrc = iframe.src;
                
                if (originalSrc.includes('youtube.com') || originalSrc.includes('youtu.be')) {
                    // YouTube動画の場合：autoplay=0を確実に付与
                    const url = new URL(originalSrc);
                    url.searchParams.set('autoplay', '0');
                    url.searchParams.delete('autoplay=1');
                    iframe.src = url.toString();
                    
                    // 少し待ってから元のURLに戻す（停止効果）
                    setTimeout(() => {
                        iframe.src = originalSrc;
                    }, 100);
                    
                } else if (originalSrc.includes('drive.google.com')) {
                    // Google Drive動画の場合：srcを一時的にクリア
                    iframe.src = 'about:blank';
                    setTimeout(() => {
                        iframe.src = originalSrc;
                    }, 200);
                    
                } else {
                    // その他の動画：src更新で停止を試行
                    iframe.src = iframe.src;
                }
                
            } catch (error) {
                console.log('動画制御に制限があります:', error);
            }
        },
        
        stopAllMedia() {
            // すべての音声を停止
            this.audioElements.forEach(audio => {
                if (!audio.paused) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            });
            
            // すべての動画を停止
            this.videoElements.forEach(iframe => {
                this.stopVideo(iframe);
            });
            
            this.currentlyPlaying = null;
        }
    };
    
    // メディアマネージャーを初期化
    mediaManager.init();
    
    // 追加のフォーカス制御
    window.addEventListener('blur', () => {
        mediaManager.stopAllMedia();
    });
    
    // ウィンドウサイズ変更時にオーバーレイ位置を調整
    window.addEventListener('resize', () => {
        // レイアウト調整のための小さな遅延
        setTimeout(() => {
            document.querySelectorAll('.video-wrapper').forEach(wrapper => {
                const iframe = wrapper.querySelector('iframe');
                const overlay = wrapper.querySelector('div[style*="position: absolute"]');
                if (iframe && overlay) {
                    const rect = iframe.getBoundingClientRect();
                    const wrapperRect = wrapper.getBoundingClientRect();
                    // オーバーレイ位置を再調整（必要に応じて）
                }
            });
        }, 100);
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