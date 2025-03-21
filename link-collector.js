(async function() {
    let links = new Set();

    // Status Message
    let statusMessage = document.createElement('div');
    statusMessage.innerText = 'Collecting links...';
    statusMessage.style.position = 'fixed';
    statusMessage.style.top = '10px';
    statusMessage.style.left = '10px';
    statusMessage.style.backgroundColor = '#222';
    statusMessage.style.color = '#fff';
    statusMessage.style.padding = '8px';
    statusMessage.style.borderRadius = '4px';
    statusMessage.style.zIndex = '999999';
    document.body.appendChild(statusMessage);

    // Helper to extract URLs using regex, with filtering
    function extractLinksFromText(text) {
        if (typeof text === 'string') {
            let urlRegex = /(https?:\/\/[^\s'"]+)/g;
            let found = text.match(urlRegex) || [];
            found.forEach(link => {
                if (
                    !link.includes('perplexity.ai') &&
                    !link.includes('facebook.net') &&
                    !link.includes('google.com') &&
                    !link.includes('cloudfront.net') &&
                    !link.includes('cdn') &&
                    !link.includes('localhost') &&
                    !link.includes('0.0.0.0') &&
                    !link.includes('127.0.0.1') &&
                    !/\.(js|css|png|jpg|jpeg|gif|webp|svg|ico)(\?|#|$)/.test(link)
                ) {
                    links.add(link);
                }
            });
        }
    }

    function collectLinks() {
        document.querySelectorAll('a[href], [data-href]').forEach(a => {
            let href = a.getAttribute('href') || a.getAttribute('data-href');
            if (typeof href === 'string' && href.startsWith('http')) {
                extractLinksFromText(href);
            }
        });

        // Extract links from text content (if direct linking is encoded in JS)
        document.querySelectorAll('*').forEach(el => {
            if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) { // TEXT_NODE
                let text = el.innerText;
                if (typeof text === 'string') {
                    extractLinksFromText(text);
                }
            }
        });

        extractLinksFromText(document.body.innerText || '');

        // Collect from shadow DOM
        function findShadowLinks(node) {
            if (node.shadowRoot) {
                node.shadowRoot.querySelectorAll('a[href], [data-href]').forEach(a => {
                    let href = a.getAttribute('href') || a.getAttribute('data-href');
                    if (href && href.startsWith('http')) {
                        extractLinksFromText(href);
                    }
                });
                node.shadowRoot.childNodes.forEach(findShadowLinks);
            }
        }
        document.querySelectorAll('*').forEach(findShadowLinks);
    }

    // ✅ Move the function call AFTER definition
    collectLinks();

    // Display results after a short delay
    setTimeout(() => {
        let sortedLinks = [...links].sort();

        console.log(`Total unique links found: ${sortedLinks.length}`);
        console.log(sortedLinks);

        if (sortedLinks.length > 0) {
            navigator.clipboard.writeText(sortedLinks.join('\n'))
                .then(() => {
                    statusMessage.innerText = `✅ ${sortedLinks.length} links copied to clipboard!`;
                    setTimeout(() => document.body.removeChild(statusMessage), 3000);
                })
                .catch(() => {
                    statusMessage.innerText = '❌ Clipboard access denied. Please copy manually.';
                    setTimeout(() => document.body.removeChild(statusMessage), 4000);
                });
        } else {
            statusMessage.innerText = '❌ No external links found!';
            setTimeout(() => document.body.removeChild(statusMessage), 2000);
        }
    }, 500);

})();
