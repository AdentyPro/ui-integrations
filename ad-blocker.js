/**
 * Расширенный детектор AdBlocker
 * Включает методы для обнаружения различных типов блокировщиков рекламы
 */

class AdvancedAdBlockerDetector {
    constructor(options = {}) {
        this.options = {
            timeout: options.timeout || 3000,
            threshold: options.threshold || 1, // Минимальное количество положительных тестов
            debug: options.debug || false,
            ...options
        };
        
        this.results = {
            image: false,
            script: false,
            html: false
        };
        
        this.adBlockerDetected = false;
        this.callbacks = {
            onDetected: options.onDetected || (() => {}),
            onNotDetected: options.onNotDetected || (() => {}),
            onComplete: options.onComplete || (() => {})
        };
    }

    /**
     * Запуск всех тестов
     */
    async detect() {
        if (this.options.debug) {
            console.log('🚀 Запуск детектора AdBlocker...');
        }

        const tests = [
            this.testImage(),
            this.testScript(),
            this.testHtml()
        ];

        // Ждем завершения всех тестов
        await Promise.allSettled(tests);
        
        // Даем дополнительное время для завершения асинхронных операций
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.evaluateResults();
        return this.adBlockerDetected;
    }

    /**
     * Тест 1: Подозрительная картинка
     */
    async testImage() {
        return new Promise((resolve) => {
            // Используем реальные домены, которые часто блокируются uBlock
            const suspiciousDomains = [
                'https://dc740.4shared.com/img/zYnDpTnt/s23/11bf951e698/Ad_online',
                'https://img.freepik.com/free-photo/sassy-goodlooking-redhead-female-yellow-sweater-listen-music-white-headphones-touch-earphones_1258-126219.jpg',
                'https://mitup.ru/assets/img/partners/ya_metrika.png'
            ];
            
            let blockedCount = 0;
            let totalImages = suspiciousDomains.length;
            let completedImages = 0;
            
            suspiciousDomains.forEach((testUrl, index) => {
                const img = new Image();
                const startTime = Date.now();
                
                let loaded = false;
                
                img.onload = () => {
                    const loadTime = Date.now() - startTime;
                    loaded = true;
                    if (this.options.debug) {
                        console.log('✅ Картинка загружена за', loadTime, 'мс:', testUrl);
                    }
                    completedImages++;
                    this.checkImageCompletion();
                };
                
                img.onerror = () => {
                    if (this.options.debug) {
                        console.log('❌ Картинка заблокирована:', testUrl);
                    }
                    blockedCount++;
                    completedImages++;
                    this.checkImageCompletion();
                };
                
                img.src = testUrl;
                
                // Таймаут для каждой картинки
                setTimeout(() => {
                    if (!loaded) {
                        if (this.options.debug) {
                            console.log('⏰ Таймаут для картинки:', testUrl);
                        }
                        blockedCount++;
                    }
                    completedImages++;
                    this.checkImageCompletion();
                }, this.options.timeout);
            });
            
            // Функция для проверки завершения всех тестов
            this.checkImageCompletion = () => {
                if (completedImages === totalImages) {
                    // Если заблокировано больше половины картинок, считаем что adblocker обнаружен
                    this.results.image = blockedCount > 0;
                    
                    if (this.options.debug) {
                        console.log(`📊 Картинки: ${blockedCount}/${totalImages} заблокировано`);
                    }
                    
                    resolve();
                }
            };
        });
    }

    /**
     * Тест 2: Скрипт ad.js
     */
    async testScript() {
        return new Promise((resolve) => {
            // Используем реальные источники, которые часто блокируются uBlock
            const adScriptSources = [
                'https://www.googleadservices.com/pagead/conversion.js',
                'https://connect.facebook.net/en_US/fbevents.js',
                'https://mc.yandex.ru/metrika/watch.js'
            ];
            
            let blockedCount = 0;
            let totalScripts = adScriptSources.length;
            let completedScripts = 0;
            
            adScriptSources.forEach((source, index) => {
                const script = document.createElement('script');
                script.id = `adblocker-test-script-${index}`;
                script.src = source;
                
                let loaded = false;
                
                script.onload = () => {
                    loaded = true;
                    if (this.options.debug) {
                        console.log('✅ Скрипт загружен:', source);
                    }
                    completedScripts++;
                    this.checkScriptCompletion();
                };
                
                script.onerror = () => {
                    if (this.options.debug) {
                        console.log('❌ Скрипт заблокирован:', source);
                    }
                    blockedCount++;
                    completedScripts++;
                    this.checkScriptCompletion();
                };
                
                document.head.appendChild(script);
                
                // Таймаут для каждого скрипта
                setTimeout(() => {
                    if (!loaded) {
                        if (this.options.debug) {
                            console.log('⏰ Таймаут для скрипта:', source);
                        }
                        blockedCount++;
                    }
                    completedScripts++;
                    this.checkScriptCompletion();
                    
                    // Удаляем скрипт
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                }, this.options.timeout);
            });
            
            // Функция для проверки завершения всех тестов
            this.checkScriptCompletion = () => {
                if (completedScripts === totalScripts) {
                    // Если заблокировано больше половины скриптов, считаем что adblocker обнаружен
                    this.results.script = blockedCount > 0;
                    
                    if (this.options.debug) {
                        console.log(`📊 Скрипты: ${blockedCount}/${totalScripts} заблокировано`);
                    }
                    
                    resolve();
                }
            };
        });
    }

    /**
     * Тест 3: HTML элементы с признаками рекламы
     */
    testHtml() {
        // Создаем временные элементы для тестирования с явными признаками рекламы
        const testElements = [
            { tag: 'div', className: 'ad-banner', text: '🔥 HOT DEALS! 🔥 CLICK HERE NOW! 🔥 LIMITED TIME OFFER! 🔥' },
            { tag: 'div', className: 'sponsored-content', text: '⭐ SPONSORED CONTENT ⭐ BUY NOW! ⭐ SPECIAL PRICE! ⭐' },
            { tag: 'div', id: 'google_ads_iframe', text: 'ADVERTISEMENT - CLICK TO LEARN MORE' },
            { tag: 'ins', className: 'adsbygoogle', text: 'AD - CLICK HERE' },
            { tag: 'div', className: 'advertisement', text: '🎯 TARGETED AD - CLICK FOR MORE INFO' },
            { tag: 'div', className: 'banner-ad', text: '📢 BANNER ADVERTISEMENT - SPECIAL OFFER INSIDE' },
            { tag: 'div', id: 'advertisement', text: '💎 PREMIUM OFFER - LIMITED TIME ONLY' },
            { tag: 'div', className: 'ads', text: '🚀 BOOST YOUR BUSINESS - CLICK HERE' },
            { tag: 'iframe', id: 'google_ads_iframe', src: 'https://ads.example.com' },
            { tag: 'div', className: 'google-ads', text: '🔍 GOOGLE ADS - FIND WHAT YOU NEED' },
            { tag: 'div', className: 'facebook-ads', text: '📘 FACEBOOK ADS - CONNECT WITH US' },
            { tag: 'div', className: 'popup-ad', text: '💥 POPUP AD - EXCLUSIVE DEAL!' },
            { tag: 'div', className: 'sidebar-ad', text: '📋 SIDEBAR AD - RELATED OFFERS' },
            { tag: 'div', className: 'header-ad', text: '📰 HEADER AD - TOP DEALS' },
            { tag: 'div', className: 'footer-ad', text: '👣 FOOTER AD - BOTTOM OFFERS' }
        ];
        
        let hiddenCount = 0;
        
        testElements.forEach(({ tag, className, id, text, src }) => {
            const element = document.createElement(tag);
            if (className) element.className = className;
            if (id) element.id = id;
            if (src) element.src = src;
            if (text) element.textContent = text;
            
            // Добавляем стили, которые делают элемент более "рекламным"
            element.style.position = 'absolute';
            element.style.left = '-9999px';
            element.style.top = '-9999px';
            element.style.width = '300px';
            element.style.height = '250px';
            element.style.backgroundColor = '#ff6b6b';
            element.style.color = 'white';
            element.style.fontWeight = 'bold';
            element.style.fontSize = '16px';
            element.style.textAlign = 'center';
            element.style.padding = '20px';
            element.style.borderRadius = '10px';
            element.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
            element.style.zIndex = '9999';
            
            // Добавляем атрибуты, которые часто блокируются
            element.setAttribute('data-ad', 'true');
            element.setAttribute('data-advertisement', 'true');
            element.setAttribute('data-sponsored', 'true');
            
            document.body.appendChild(element);
            
            // Проверяем, скрыт ли элемент
            const style = window.getComputedStyle(element);
            if (style.display === 'none' || 
                style.visibility === 'hidden' || 
                style.opacity === '0' ||
                style.width === '0px' ||
                style.height === '0px' ||
                style.transform === 'scale(0)' ||
                style.clip === 'rect(0px, 0px, 0px, 0px)') {
                hiddenCount++;
            }
            
            // Удаляем элемент
            document.body.removeChild(element);
        });
        
        this.results.html = hiddenCount > 0;
        
        if (this.options.debug) {
            console.log(this.results.html ? '❌ HTML элементы заблокированы' : '✅ HTML элементы видны');
        }
    }

    

    /**
     * Оценка результатов
     */
    evaluateResults() {
        const positiveTests = Object.values(this.results).filter(result => result).length;
        
        this.adBlockerDetected = positiveTests >= this.options.threshold;
        
        if (this.options.debug) {
            console.log('📊 Результаты тестов:', this.results);
            console.log('🎯 Положительных тестов:', positiveTests);
            console.log('🚫 AdBlocker обнаружен:', this.adBlockerDetected);
        }
        
        // Вызываем колбэки
        if (this.adBlockerDetected) {
            this.callbacks.onDetected(this.results);
        } else {
            this.callbacks.onNotDetected(this.results);
        }
        
        this.callbacks.onComplete(this.results, this.adBlockerDetected);
    }

    /**
     * Получить детальные результаты
     */
    getResults() {
        return {
            detected: this.adBlockerDetected,
            results: { ...this.results },
            positiveCount: Object.values(this.results).filter(result => result).length,
            totalTests: Object.keys(this.results).length
        };
    }
}

// Экспорт для использования в браузере
if (typeof window !== 'undefined') {
    window.AdvancedAdBlockerDetector = AdvancedAdBlockerDetector;
}

// Экспорт для Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedAdBlockerDetector;
} 

const dete = new AdvancedAdBlockerDetector({debug: true});
dete.detect();