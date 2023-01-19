import {KEY} from "@/API_KEY";
const API_KEY = KEY
const tickersHandlers = new Map()
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)
const AGGREGATE_INDEX = '5'
socket.addEventListener('message', e => {
    const {TYPE: type, FROMSYMBOL: currency, PRICE: newPrice}  = JSON.parse(e.data)
    if(type !== AGGREGATE_INDEX || newPrice === undefined){
    return
    }
    const handlers = tickersHandlers.get(currency) ?? []
    handlers.forEach(fn =>fn(newPrice))

})

function sendToWS(message) {
    const stringifiedMessage = JSON.stringify(message)
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(stringifiedMessage)
        return
    }
    socket.addEventListener('open', ()=>{
        socket.send(stringifiedMessage)
    }, {once: true})
}

function subscribeToTickerOnWS(ticker) {
    sendToWS({action: "SubAdd", subs: [`5~CCCAGG~${ticker}~USD`]})
}
function unsubscribeFromTickerOnWS(ticker) {
    sendToWS({action: "SubRemove", subs: [`5~CCCAGG~${ticker}~USD`]})
}

export const subscribeTOTicker = (ticker, cb) => {
    const subscribers = tickersHandlers.get(ticker) || []
    tickersHandlers.set(ticker, [...subscribers, cb])
    subscribeToTickerOnWS(ticker)
}

export const unsubscribeFromTicker = (ticker) => {
 tickersHandlers.delete(ticker)
    unsubscribeFromTickerOnWS(ticker)
}
//setInterval(loadTickers,5000)
//window.tickers = tickersHandlers


// const loadTickers = () => {
//     if (tickersHandlers.size === 0) {
//         return
//     }
//
//     fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...tickersHandlers.keys()].join(
//             ','
//         )}&tsyms=USD&api_key=${API_KEY}`
//     )
//         .then(r => r.json())
//         .then(rawData => {
//             const updatedPrices =  Object.fromEntries(
//                 Object.entries(rawData).map(([key, value]) => [key, value.USD])
//
//             )
//             Object.entries(updatedPrices).forEach(([currency, newPrice] )=> {
//              const handlers = tickersHandlers.get(currency) ?? []
//                 handlers.forEach(fn =>fn(newPrice))
//             })
//             })
// }

// export const unsubscribeFromTicker = (ticker, cb) => {
//     const subscribers = tickersHandlers.get(ticker) || []
//     tickersHandlers.set(ticker, subscribers.filter(fn => fn !== cb))
// }