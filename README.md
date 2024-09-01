## NSE OI VISUALIZER & STRATEGY-BUILDER

A simple React application inspired by [Sensibull](https://www.sensibull.com/), that visualizes real-time Open Interest data and Option Strategy Payoffs (WIP) for Indian Benchmark Indices and F&O stocks. The app fetches data from NSE API to show OI bar plots and Strategy Payoff line plots. The data is auto-updated at 3-minute intervals, precisely at times when the minutes are divisible by 3. Frontend is made with React, Material UI, Redux and D3. Backend is made with NodeJS. (Note: The app is work in progress).

## Demo
![Usage Demo](frontend/demo/nse-oi-visualizer-demo.gif)

## Features
1. Fetches Real-time Open Interest data of Indian Benchmark Indices (NIFTY, BANKNIFTY, FINNIFTY and MIDCPNIFTY) and F&O stocks listed on NSE (185 stocks).
2. Shows Change in Open Interest and Total Open Interest.
3. Has a multi expiry selector to see combined Open Interest. With 4 (2 weekly, 2 monthly) selectable expiries for indices and 2 (2 monthly) selectable expiries for stocks.
4. Has a Strike range selector to adjust the no. of strikes to be shown.
4. Shows Option Strategy Payoff at a target date as well as the expiry date for the selected underlying (maximum 10 legs).
5. Uses Black-76 model to calculate singular IV for each strike, as it should be in theory according to put-call parity.
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

## To be done
1. Improved UI/UX.
2. Implement Error Boundaries and show appropriate error messages.
3. FII and DII data visualization.

## References
1. https://www.sensibull.com/ app.
2. https://sensibull.freshdesk.com/support/solutions/folders/43000300252 Sensibull explains the Math behind Option Pricing here.
3. https://2019.wattenberger.com/blog/react-and-d3 this is an insightful blog on how to use D3 with React, while keeping things Reacty.
4. https://www.nseindia.com/ data source.
