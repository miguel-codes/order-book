# Technical Questions

1. What would you add to your solution if you had more time?
    * Typescript as opposed to JS which I used to enable faster prototyping.
    * State management to avoid passing shared props between components.
    * Full test coverage for Orderbook, especially the price grouping tests.
    * Refactor Orderbook.jsx into more components to reduce its size.
    * Increase efficiency for price grouping.  
    * Move SCSS files into component folders as opposed to one shared file.  
    * Component size queries or similar solution for a cleaner non-CSS way to handle the 
      different mobile and desktop views, and to be able to dynamically display more rows on desktop.
2. What would you have done differently if you knew this page was going to get thousands of views
   per second vs per week?
    * If using SSR like NextJS, I would dynamically import the component to lazy load
      on the client to reduce server load.
3. What was the most useful feature that was added to the latest version of your chosen language?
   Please include a snippet of code that shows how you've used it.
    * Not exactly the latest version, but I felt that combining `useRef` with an additional `useEffect`
      for handling socket changes such as pausing (which was helpful for debugging) was the most useful
      in this assignment.
      ```
      useEffect(() => {
        if (!socket.current) {
          return;
       }

       socket.current.onmessage = (e) => {
         if (isPaused) {
           return;
         }
         try {
           const cleanData = DOMPurify.sanitize(e.data);
           const data = JSON.parse(cleanData);
           const ordersToUpdate = {};

          if (Array.isArray(data.asks)) {
            ordersToUpdate.asks = data.asks;
          }

          if (Array.isArray(data.bids)) {
            ordersToUpdate.bids = data.bids;
          }

           updateOrders(ordersToUpdate);
          } catch (err) {
            console.error('Parsing error: ', err.message);
          }
        };
      }, [isPaused, socket.current]);
      ```
    * Coming in a close second was `jest-websocket-mock` that allowed for testing the
    websocket and Orderbook.
4. How would you track down a performance issue in production? Have you ever had to do this?
    * It depends on the performance issue, but I would generally start by closely inspecting the
      page or component in question. This would involve adding FE logging for certain fields
      or to track memory usage, and checking BE server logs for potential irregularities.
5. Can you describe common security concerns to consider for a frontend developer?
    * XSS attacks that can make their way to HTML output.
    * Improper obfuscation of PII from data tracking.
    * Using insecure connections instead of forcing HTTPS.
    * Using external libraries that inject code such as advertising providers on pages that handle sensitive user
    data, for example login and checkout pages.
6. How would you improve the Kraken API that you just used?
    * The responses are slightly faster than the human eye can perceive, so
      it's possible throttling to send fewer messages to the client would be
      an optimization.