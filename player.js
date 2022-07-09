const puppeteer = require('puppeteer');
const songname = process.argv[2];


if (!songname) {
	throw "Please gimme song name aight";
}

console.log('Starting puppeteer');
(async () => {
    console.log('Starting puppeteer')
    const browser = await puppeteer.launch({
        headless: true,
        ignoreDefaultArgs: ['--mute-audio'],
        args: ["--autoplay-policy=no-user-gesture-required"]
    });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1280,
        height: 720
    });
    console.log('Scraping YouTube');
    await page.goto('https://youtube.com');
    await page.click('div#search-input.ytd-searchbox-spt');
    await page.focus('div#search-input.ytd-searchbox-spt');
    await page.type('div#search-input.ytd-searchbox-spt', songname);
    await page.keyboard.press('Enter'); 
    await page.waitForTimeout('2000');
    await page.click('a#video-title.yt-simple-endpoint.style-scope.ytd-video-renderer');
    await page.evaluate(() => {         
        self.moHandler = {
            changesObserver: function (mutation) {                
                if (mutation.type === 'attributes'){
                    if(mutation.target.className == 'ytp-ad-skip-button ytp-button' || mutation.target.className == 'style-scope ytd-button-renderer style-text size-default'){                      
                        mutation.target.click(); 
                    }
                }                  
            },
            subscriber: function (mutations) {              
                mutations.forEach((mutation) => {
                    self.moHandler.changesObserver(mutation);
                });                             
            },
            init: function () {            
                const target = self.document.documentElement;
                const config = {
                    attributes: true                    
                };
                self.mObserver = new MutationObserver(self.moHandler.subscriber);
                self.mObserver.observe(target, config);
            }
        }
        self.moHandler.init(); 
    });
    console.log('Playing music');
    await page.waitForTimeout(99999999);
    await browser.close();
})();

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}
