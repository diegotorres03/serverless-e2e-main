const addResourcesToCache = async (resources) => {
    const cache = await caches.open("v1")
    await cache.addAll(resources)
};

self.addEventListener("install", (event) => {
    event.waitUntil(
        addResourcesToCache([

            "api.json",
            "index.html",
            "webapp.json",

            "/assets/avocado-toast.png",
            "/assets/AWSOME.png",
            "/assets/capuccino.png",
            "/assets/croissant.png",
            "/assets/cup-coffee.png",
            "/assets/hot-chocolate.png",
            "/assets/SVG/AWSOME.svg",

            "/src/caffe-cart-item.component.js",
            "/src/caffe-cart.component.js",
            "/src/caffe-menu-item.component.js",
            "/src/caffe-menu.component.js",
            "/src/caffe-order-history-item.component.js",
            "/src/caffe-order-history.component.js",
            "/src/drag-drop.component.js",
            "/src/index copy.js",
            "/src/index.js",
            "/src/indexed-db.js",
            "/src/main-2.js",
            "/src/order.class.js",
            "/src/service-worker.js",
            "/src/web-worker.js"

        ])
    )
})

console.log(`(>*.*)> Hi There! I'm inside a web worker`)

const putInCache = async (request, response) => {
    const cache = await caches.open("v1");
    await cache.put(request, response);
}

const cacheFirst = async (request) => {
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }
    const responseFromNetwork = await fetch(request);
    putInCache(request, responseFromNetwork.clone())
    return responseFromNetwork;
};

self.addEventListener('fetch', (event) => {
    event.respondWith(cacheFirst(event.request));
})