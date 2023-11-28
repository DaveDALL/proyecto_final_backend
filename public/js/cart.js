let port = window.port

const fetchPurchase = async (cid) => {
    let fetchingPurchaserUrl = `http://${window.location.host}/api/carts/${cid}/purchase`
    try {
        let response = await fetch(fetchingPurchaserUrl, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
              }
        })
        let ticketData = await response.json()
        return ticketData
    }catch(err) {
        console.log('No es posible realizar la compra ' + err)
    }
}

const fetchingCart = async () => {
    let cartFetchUrl = `http://${window.location.host}/api${window.location.pathname}`
    try {
        let response = await fetch(cartFetchUrl)
        let cartData = await response.json()
        return cartData
    }catch(err) {
        console.log('No es posible realizar un fetch del cart ' + err)
    }
}

const fetchToDeleteCartProduct = async (cid, pid) => {
    let deleteProductUrl = `http://${window.location.host}/api/carts/${cid}/products/${pid}`
    try {
        let response = await fetch(deleteProductUrl, {
            method: 'DELETE',
            headers: {
                'Content-type': 'application/json'
              }
        })
        let deleteInfo = await response.json()
        return deleteInfo
    }catch(err) {
        console.log('No fue posible eliminar el producto del cart ' + err)
    }
}

const cartRenderCards = (cid, products) => {
 let cartBox = document.getElementById('cartContainer')
 cartBox.innerHTML= ' '
 products.map( product => {
    let cartBlister = document.createElement('div')
    cartBlister.classList.add('cart-blister', 'col-8')
    let {productId, qty} = product
    cartBlister.innerHTML = `
        <div class="cart-product-box">
            <div class"cart-image-box col-2">
                <img src=${productId.thumbnails[0]} />
            </div>
            <div class="col-3">${productId.title}</div>
            <div class="col-2">${qty} piezas</div>
            <div class"col-2">subtotal $${(qty*productId.price).toFixed(2)}</div>
            <div>
                <button id=${productId.code}>Eliminar</button>
            </div>
        </div>
    `
    cartBox.append(cartBlister)
    let deleteButton = document.getElementById(productId.code)
    deleteButton.addEventListener('click', () => deleteProductFromCart(cid, productId._id))
 })
 cartBox.innerHTML += `
    <div>
        <button id="endPurchase">Finalizar Compra</button>
    </div>
 `
 let purchaseButton = document.getElementById("endPurchase")
 purchaseButton.addEventListener('click', () => endingPurchase(cid))
}

const endingPurchase = async (cid) => {
    let ticketData = await fetchPurchase(cid)
    let ticketAmount = ticketData.payload.ticket.amount
    let ticketCode = ticketData.payload.ticket.code
    let ticketDate = ticketData.payload.ticket.purchase_datetime
    let localDate = new Date(ticketDate).toLocaleString('es-MX')
    let localTime = new Date(ticketDate).toLocaleTimeString('es-MX')
    let ticketBuyer = ticketData.payload.ticket.purchaser
    let buyedProducts = ticketData.payload.ticket.buyedProducts
    let ticketBox = document.getElementById("cartContainer")
    ticketBox.innerHTML= ' '
    ticketBox.innerHTML = `
        <div>
            <h3><strong>TICKET DE COMPRA</strong></h3>
        </div>
        <div>
            <h6>Su ticket de compra es el : ${ticketCode}</h6>
            <h6>La fecha de compra de su ticket es : ${localDate} ${localTime}</h6>
            <h6>Su usuario es : ${ticketBuyer}</h6>
            <h6>El monto de su ticket es de : ${ticketAmount}</h6>
            
        </div>
    `
    buyedProducts.map(product => {
        let ticketBlister = document.createElement('div')
        ticketBlister.classList.add('ticket-blister', 'col-8')
        let {productId, qty, subtotal} = product
        ticketBlister.innerHTML = `
            <div class="cart-product-box">
                <div class="col-3">${productId.title}</div>
                <div class="col-2">${qty} piezas</div>
                <div class"col-2">subtotal $${subtotal.toFixed(2)}</div>
            </div>
        `
        ticketBox.append(ticketBlister)
    })

    ticketBox.innerHTML += `
        <div>
            <h6><strong>NOTA: Los productos sin existencia permaneceran en el carrito de compra</strong></h6>
            <h6><strong>Y Los puede eliminar posteriormente, al finalizar, y visualiza el carrito nuevamente.</strong></h6>
            <h6><strong>Tome una captura de pantalla para el seguimiento de su compra.</strong></h6>
        </div>
    `

}

const cartRender = async () => {
    let cartData = await fetchingCart()
    let {payload} = cartData
    let {_id, products} = payload
    cartRenderCards(_id, products)
}

async function deleteProductFromCart (cid, pid) {
    let deleteResult = await fetchToDeleteCartProduct(cid, pid)
    if(deleteResult.status === 'success') alert('Producto eliminado con exito')
    cartRender()
}

cartRender()

let returnButton = document.getElementById('returnButton')
returnButton.addEventListener('click', () => {
    window.close()
})