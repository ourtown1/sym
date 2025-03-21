
🚀 Link Collector Bookmarklet
This repository hosts a bookmarklet that allows you to collect and copy all external links from a webpage into your clipboard.

📥 How to Install the Bookmarklet
Follow these steps to install and use the bookmarklet:

1. Create a Bookmark
Open your browser's Bookmarks Manager.
Create a new bookmark.
Name it something like "Link Collector".
2. Set the Bookmark URL
Copy and paste the following code into the URL field of the bookmark:
javascript
Copy
Edit
javascript:(async()=>{ 
    let response = await fetch('https://raw.githubusercontent.com/ourtown1/sym/main/link-collector.js'); 
    let script = await response.text(); 
    eval(script);
})();
3. Save the Bookmark
Click Save to store the bookmark.
4. How to Use
Open any webpage.
Click the "Link Collector" bookmark.
✅ A status message will appear at the top left of the page.
✅ After collecting links, they will be copied to your clipboard automatically.
🔧 How It Works
The bookmarklet loads an external JavaScript file hosted on GitHub using fetch().
The script extracts all external links from the page (excluding CDNs, tracking links, and static files).
The collected links are copied to the clipboard for easy use.
🌐 How to Update
Make changes to link-collector.js in the repository.
The bookmarklet will automatically update the next time you use it since it's loading the script dynamically.
❗️ Troubleshooting
If the bookmarklet isn’t working:
Make sure the repository is public.
Confirm that the raw.githubusercontent.com link is accessible.
Check browser permissions for clipboard access.
🎯 Example Code for link-collector.js
Here’s an example script you can include in link-collector.js:

javascript
Copy
Edit
(async function() {
    let links = new Set();

    function extractLinksFromText(text) {
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

    function collectLinks() {
        document.querySelectorAll('a[href], [data-href]').forEach(a => {
            let href = a.getAttribute('href') || a.getAttribute('data-href');
            if (href && href.startsWith('http')) {
                extractLinksFromText(href);
            }
        });

        extractLinksFromText(document.body.innerText);
    }

    collectLinks();

    let sortedLinks = [...links].sort();

    if (sortedLinks.length > 0) {
        await navigator.clipboard.writeText(sortedLinks.join('\n'));
        alert(`${sortedLinks.length} links copied to clipboard!`);
    } else {
        alert('No external links found!');
    }
})();
🏆 Done!
👉 Now you’re ready to collect links from any webpage! 😎
