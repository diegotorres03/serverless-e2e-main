
// const apiUrl = '//https://y36j1ckw6e.execute-api.us-east-2.amazonaws.com/dev/'
const items = []
let editable = true


const loadApiSettings = async () => {
    const settings = await fetch('/api.json').then(res => res.json())
    console.log('settings', settings)
    return settings.api
}

const renderItems = items => {
    // alert('rendering items')
    const list = document.querySelector('#wc-shopping-cart')
    const listItems = items.map(item =>
        html`<caffe-cart-item name="${item.name}" type="${item.type}" qty="${item.qty}" ></caffe-cart-item>`)
    // list.innerHTML = listItems.join('\n')
    console.log('listItems', listItems)
    listItems.forEach(list.appendChild)
}

const renderOrders = orders => {
    const list = document.querySelector('.order-history')
    const listItems = orders.map(order =>
        `<li data-id="${order.id}" data-customer="${order.customer}" >
                    <b>Customer:</b> <span>${order.customer}</span>
                    <br>
                    <b>Items:</b>
                    
                    <ol>
                        ${order.items.map(item => `<li 
                            data-name="${item.name}"
                            data-type="${item.type}"
                            data-qty="${item.qty}"
                            >${item.name} x ${item.qty}</li>`).join('\n')}
                    </ol>
                </li>`)
    list.innerHTML = listItems.join('\n')
}

// handle click on each product button
const handleAddProduct = event => {
    console.log(event)
    console.log(event.target)
    console.log(event.target.dataset)
    const data = event.target.dataset
    const item = { name: data.name, type: data.type, qty: 1 }
    const index = items.findIndex(cartItem => cartItem.name === item.name)
    console.log(index)
    if (index !== -1) items[index].qty += 1
    else items.push(item)
    renderItems(items)
}

async function getOrders(apiUrl) {
    const url = apiUrl + 'orders'

    // [ ] 2.3.1: get orders from api [docs](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
    const orders = await fetch(url,

        // [ ] 5.3.1 use Authorization header on http getOrders
        { headers: { 'Authorization': 'json.web.token' } }
    ).then(res => res.json())
    return orders
}

async function run() {
    const { apiUrl } = await loadApiSettings()
    getOrders(apiUrl).then(renderOrders)


    // select all product buttons
    const productBtns = [...document.querySelectorAll('.add-product-btn')]

    // attach the handler to each product button
    productBtns.forEach(btn => btn.addEventListener('click', handleAddProduct))

    // select the place order button
    const placeOrderBtn = document.querySelector('#place-order-btn')

    // add handler to place order button
    placeOrderBtn.addEventListener('click', async event => {
        editable = false
        renderItems(items)
        const url = apiUrl + 'orders'
        try {

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
            
            items.length = 0
            renderItems(items)
            await getOrders(apiUrl).then(renderOrders).catch(console.error)
        } catch (err) {
            console.error(err)
        } finally {
            editable = true
        }
    })

}

run()



        // [aws-sdk docs](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/top-level-namespace.html)

/* example request using fetch api

const url = 'https://path.to.api.com/resource'

const options = {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
        'Content-Type': 'application/json'
    }
}

// send POST request
fetch(url, options)
    .then(res => res.json())
    .then(res => console.log(res))
    .catch(error => console.error(error))
*/

