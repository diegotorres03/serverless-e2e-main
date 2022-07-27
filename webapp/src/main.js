
const html = function (templates, ...values) {
    const template = document.createElement('template')
    let str = ''
    templates.forEach((template, index) => {
        str += template
        str = values[index] ? str + values[index] : str
    })
    template.innerHTML = str
    return template.content.firstChild
}



run()

const loadApiSettings = async () => {
    const settings = await fetch('/api.json').then(res => res.json())
    console.log('settings', settings)
    return settings.api
}

function run() {

    const menu = document.querySelector('caffe-menu')
    const cart = document.querySelector('caffe-cart')
    const history = document.querySelector('caffe-order-history')


    async function getOrders() {
        const url = `https://1vui2kjsjf.execute-api.us-east-2.amazonaws.com/dev/orders`

        // [ ] 2.3.1: get orders from api
        const orders = await fetch(url,

            // [ ] 5.3.1 use Authorization header on http getOrders
            { headers: { 'Authorization': 'json.web.token' } }
        ).then(res => res.json())
        return orders
    }

    async function refreshOrders() {
        const orders = await getOrders()
        history.clear()
        orders.forEach(order => {
            history.addItem(order)
        })
    }

    refreshOrders()

    cart.addEventListener('onplaceorder', async event => {
        console.log(event)
        console.log('fetch here')
        console.log(event.detail)

        const { apiUrl } = await loadApiSettings()
        // const url = apiUrl + 'orders'
        const url = `https://1vui2kjsjf.execute-api.us-east-2.amazonaws.com/dev/orders`

        const items = event.detail

        // [ ] 2.3.2: send the order to the api [docs](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_request_options)
        const options = {
            method: 'POST',
            body: JSON.stringify({
                id: Date.now().toString(),
                customer: 'diegotrs',
                items: items,
            }),
            headers: {
                'Content-Type': 'application/json',

                // [ ] 5.3.2 use Authorization header on http createOrder
                'Authorization': 'json.web.token'
            }
        }

        await fetch(url, options)
        cart.clear()
        refreshOrders()

    })

    menu.addEventListener('item-added', event => {
        console.log('item-added', event)
        cart.addItem(event.detail)
    })


}

