<div style="display:inline-flex; align-items:center;">
  <img src="frontend/misc/trend-icon.svg" alt="Trend Icon" />
  <h2 style="margin-left:6px">NSE-OI-VISUALIZER</h2>
</div>
A simple React application inspired by [Sensibull](https://www.sensibull.com/), that visualizes real-time Open Interest data of Indian Benchmark Indices and F&O stocks. The app fetches data from NSE API through a proxy server and plots the data as bar charts. The app shows Change in Open Interest and Total Open Interest for the selected instrument. The data is auto-updated at 3-minute intervals, precisely at times when the minutes are divisible by 3. Frontend is made with React, Material UI, Redux and D3. Backend is made with NodeJS. (Note: The app is work in progress).

## Demo
![Usage Demo](frontend/demo/nse-oi-visualizer-demo.gif)

## Features
1. Fetches Real-time Open Interest data of Indian Benchmark Indices (NIFTY, BANKNIFTY, FINNIFTY and MIDCPNIFTY) and F&O stocks listed on NSE (185 stocks).
2. Shows Change in Open Interest and Total Open Interest.
3. Has a multi expiry selector to see combined Open Interest. With 4 (2 weekly, 2 monthly) selectable expiries for indices and 2 (2 monthly) selectable expiries for stocks.
4. Has a Strike range selector to adjust the no. of strikes to be shown.
5. Auto-updates data, using a web worker, precisely at times when the minutes are divisible by 3 (ex: 9:30, 9:33, 9:36,...,9:57, 10:00 etc).
6. Caches data with RTK Query for a maximum of 3 minutes.
7. Charts have tooltips.
8. Local storage persistence of the selected underlying.

## How to run it locally
1. Clone the repository.
2. cd into backend directory and run `npm install` to install dependencies.
3. Run 'npm run dev' to start the proxy server.
4. cd into frontend directory and run `npm install` to install dependencies.
5. Run 'npm run dev' to start the frontend app.
6. Open http://localhost:5173/ in your browser.
7. You are good to go.

## To be added
1. FII and DII data visualization.
2. Option Chain table.
3. Option Payoff visualization? Maybe.

## References
1. Tried to replicate the UI of https://www.sensibull.com/ app.
2. https://2019.wattenberger.com/blog/react-and-d3 this is an insightful blog on how to use D3 with React, while keeping things Reacty.

## Site link
## https://nse-oi-visualizer.pages.dev/
