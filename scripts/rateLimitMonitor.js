(function () {
  "use strict";

  // Create UI dynamically
  function createRateLimitDisplay() {
    if (document.querySelector('.rate-limit-container')) return;

    const container = document.createElement('div');
    container.className = 'rate-limit-container';
    container.style.position = 'fixed';
    container.style.bottom = '10px';
    container.style.right = '10px';
    container.style.padding = '10px';
    container.style.background = '#000';
    container.style.color = '#fff';
    container.style.borderRadius = '8px';
    container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
    container.style.zIndex = '9999';
    container.style.fontSize = '14px';
    container.style.fontFamily = 'Arial, sans-serif';

    const rateLimitText = document.createElement('span');
    rateLimitText.id = 'rate-limit-remaining';
    rateLimitText.textContent = 'Awaiting Message';

    const tooltip = document.createElement('div');
    tooltip.id = 'rate-limit-tooltip';
    tooltip.style.marginTop = '5px';
    tooltip.style.fontSize = '12px';
    tooltip.style.color = '#ccc';

    const tooltipText = document.createElement('p');
    tooltipText.id = 'rate-limit-tooltip-text';
    tooltipText.textContent = 'Resets in: Unknown';

    tooltip.appendChild(tooltipText);
    container.appendChild(rateLimitText);
    container.appendChild(tooltip);
    document.body.appendChild(container);
  }

  // Update UI based on rate limit data
  function updateRateLimitDisplay(remainingQueries, totalQueries, windowSizeSeconds) {
    const display = document.getElementById('rate-limit-remaining');
    if (display) {
      display.textContent = `${remainingQueries}/${totalQueries}`;

      const tooltipText = document.getElementById('rate-limit-tooltip-text');
      if (tooltipText) {
        tooltipText.textContent = `Resets in: ${formatTimeRemaining(windowSizeSeconds)}`;
      }

      const percentage = (remainingQueries / totalQueries) * 100;
      if (percentage <= 10) {
        display.style.color = 'rgba(255, 50, 50, 0.9)';
      } else if (percentage <= 30) {
        display.style.color = 'rgba(255, 165, 0, 0.9)';
      } else {
        display.style.color = '#fff';
      }
    }
  }

  // Format time for display
  function formatTimeRemaining(seconds) {
    if (!seconds || isNaN(seconds)) return "Unknown reset time";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  // Parse rate limit response
  function parseRateLimitResponse(responseText) {
    try {
      const data = JSON.parse(responseText);
      if (data && data.remainingQueries !== undefined && data.totalQueries !== undefined) {
        return {
          remainingQueries: data.remainingQueries,
          totalQueries: data.totalQueries,
          windowSizeSeconds: data.windowSizeSeconds,
        };
      } else if (data) {
        for (const key in data) {
          if (data[key] && typeof data[key] === 'object') {
            if (data[key].remaining !== undefined && data[key].limit !== undefined) {
              return {
                remainingQueries: data[key].remaining,
                totalQueries: data[key].limit,
                windowSizeSeconds: data[key].windowSizeSeconds || data.windowSizeSeconds,
              };
            }
          }
        }
      }
    } catch (e) {
      console.error("Error parsing rate limit response:", e);
    }
    return null;
  }

  // Override fetch to monitor rate-limits
  const originalFetch = window.fetch;
  window.fetch = function () {
    const url = arguments[0];
    const options = arguments[1] || {};
    const fetchPromise = originalFetch.apply(this, arguments);

    if (typeof url === "string" && url.includes("rate-limits")) {
      fetchPromise
        .then((response) => {
          const clone = response.clone();
          return clone.text().then((text) => ({ response, text }));
        })
        .then(({ response, text }) => {
          console.log("Rate-limits request detected:", text);
          const limits = parseRateLimitResponse(text);
          if (limits) {
            updateRateLimitDisplay(
              limits.remainingQueries,
              limits.totalQueries,
              limits.windowSizeSeconds
            );
          }
        })
        .catch((error) => console.error("Error getting response:", error));
    }

    return fetchPromise;
  };

  // Override XMLHttpRequest to monitor rate-limits
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function () {
    const url = arguments[1];
    const method = arguments[0];

    if (typeof url === "string" && url.includes("rate-limits")) {
      const xhr = this;
      const originalOnLoad = xhr.onload;

      xhr.onload = function () {
        console.log("Rate-limits XHR request detected:", xhr.responseText);
        const limits = parseRateLimitResponse(xhr.responseText);
        if (limits) {
          updateRateLimitDisplay(
            limits.remainingQueries,
            limits.totalQueries,
            limits.windowSizeSeconds
          );
        }

        if (originalOnLoad) originalOnLoad.apply(this, arguments);
      };
    }

    return originalOpen.apply(this, arguments);
  };

  // Initialize the monitor
  function initialize() {
    createRateLimitDisplay();
  }

  // Run on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
