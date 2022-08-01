// GetIndexedDBInstance().then(db => console.log(db))

// const html = function (templates, ...values) {
//     const template = document.createElement('template')
//     let str = ''
//     templates.forEach((template, index) => {
//         str += template
//         str = values[index] ? str + values[index] : str
//     })
//     template.innerHTML = str
//     return template.content
// }


// run()
runWithWorker()

// if (typeof (Worker) === "undefined") run()
// else runWithWorker()

// registerServiceWorker()

async function loadApiSettings() {
    const settings = await fetch('/api.json').then(res => res.json())
    console.log('settings', settings)
    return settings.api
}


const customer = 'diegotrs'

async function run() {
    const { apiUrl } = await loadApiSettings()
    const menu = document.querySelector('caffe-menu')
    const cart = document.querySelector('caffe-cart')
    const history = document.querySelector('caffe-order-history')

    cart.addEventListener('onplaceorder', async event => {
        const items = event.detail
        const order = new Order({ customer, items })

        await createOrder(apiUrl, order)
        cart.clear()
        refreshOrders(apiUrl, history, '.order-history')

    })

    menu.addEventListener('item-added', event => {
        console.log('item-added', event)
        cart.addItem(event.detail)
    })

    refreshOrders(apiUrl, history, '.order-history')
}


async function runWithWorker() {
    if (typeof (Worker) === "undefined") return
    const worker = new Worker('./src/web-worker.js')

    const menu = document.querySelector('caffe-menu')
    const cart = document.querySelector('caffe-cart')
    const history = document.querySelector('caffe-order-history')

    worker.onmessage = (msg) => {
        if (msg.data.type === 'getOrders') appendOrders(msg.data.orders, history, '.order-history')
        if (msg.data.type === 'createOrder') cart.clear()
    }

    cart.addEventListener('onplaceorder', async event => {
        console.log(event.detail)
        const items = event.detail
        const order = new Order({ customer, items })

        worker.postMessage({ type: 'createOrder', order })
    })

    menu.addEventListener('item-added', event => {
        console.log('item-added', event)
        cart.addItem(event.detail)
    })

    worker.postMessage({ type: 'getOrders' })
}


async function refreshOrders(apiUrl, history, selector) {
    getOrders(apiUrl)
        // getOrdersHtml(apiUrl)
        .then(orders => appendOrders(orders, history, selector))
}


/**
 *
 *
 * @param {Order} order
 * @return {*} 
 */
function createOrder(apiUrl, order) {
    const url = apiUrl + 'orders'

    // [ ] 2.3.2: send the order to the api
    const options = {
        method: 'POST',
        body: JSON.stringify(order),
        headers: {
            'Content-Type': 'application/json',

            // [ ] 5.3.2 use Authorization header on http createOrder
            'Authorization': 'json.web.token'
        }
    }

    return fetch(url, options).then(res => res.json())
}


async function getOrders(apiUrl) {
    const url = `${apiUrl}orders`
    // [ ] 2.3.1: get orders from api
    const orders = await fetch(url,

        // [ ] 5.3.1 use Authorization header on http getOrders
        { headers: { 'Authorization': 'json.web.token' } }
    ).then(res => res.json())
    return orders
}

async function getOrdersHtml(apiUrl) {
    const url = `${apiUrl}orders`
    console.log('getting orders html', url)
    // [o] 2.3.1: get orders from api
    const ordersHtml = await fetch(url,
        // [o] 5.3.1 use Authorization header on http getOrders
        {
            headers: {
                'Content-Type': 'text/html',
                'Authorization': 'json.web.token',
            }
        }
    ).then(res => res.text()).catch(err => console.warn(err))
    // console.log(ordersHtml)
    return ordersHtml
}


function appendOrders(orders, container, selector) {
    if (Array.isArray(orders)) {
        container.clear()
        orders.forEach(order => {
            container.addItem(order)
        })
        return
    }

    const ordersHtml = html`${orders}`
    if (!ordersHtml) return
    console.log(ordersHtml)
    const list = container.querySelector(selector)
    list.appendChild(ordersHtml)


}


async function registerServiceWorker() {
    if (!'serviceWorker' in navigator) return console.warn('no service worker support')
    console.info('registering service worker')
    try {
        const registration = await navigator.serviceWorker.register(`./src/service-worker.js`,
            // { scope: '/src/' }
        )

        if (registration.installing) {
            console.log('Service worker installing');
        } else if (registration.waiting) {
            console.log('Service worker installed');
        } else if (registration.active) {
            console.log('Service worker active');
        }

    } catch (err) {
        console.error(`Registration failed with ${err}`)
    }
}

