// Definición de productos disponibles
const PRODUCTS = [
    { id: 'p1', name: 'Comic Amazing Spiderman N°1', category: 'comics', price: 22000 },
    { id: 'p2', name: 'Manga Demon Slayer N°10', category: 'manga', price: 22000 },
    { id: 'p3', name: 'Figura Spiderman 2 Hot Toys', category: 'figuras', price: 450000 },
    { id: 'p4', name: 'Remera BlueLock', category: 'merch', price: 23000 },
    { id: 'p5', name: 'Gorra Ataque a los titanes', category: 'merch', price: 3000 },
    { id: 'p6', name: 'Buzo Marvel', category: 'merch', price: 40000 },
    { id: 'p7', name: 'Pijama Pikachu', category: 'merch', price: 35000 },
];

// Definición de promociones y a qué categorias/prods aplican
const PROMOTIONS = {
    dos50: {
        title: 'Llevá 2 productos y obtené 50% OFF en el segundo',
        desc: 'Seleccioná hasta 2 unidades de cualquier producto seleccionado, y el segundo (de menor valor) tendrá 50% de descuento.',
        filter: prod => true // aplica a todos
    },
    '3x2': {
        title: '3x2 en Productos de Merchandising',
        desc: 'Llevando 3 unidades pagás 2 (el producto de menor valor es gratis!).',
        filter: prod => prod.category === 'merch' //solo aplica a la categoría merch
    },
    '10off': {
        title: '10% OFF en Compras superiores a $30.000',
        desc: 'Si el subtotal supera $30.000 se aplica 10% de descuento al total.',
        filter: prod => true
    }
};

const promoSelect = document.getElementById('promo-select');
const promoDetails = document.getElementById('promo-details');
const promoTitle = document.getElementById('promo-title');
const promoDesc = document.getElementById('promo-desc');
const productsList = document.getElementById('products-list');
const calcularBtn = document.getElementById('calcular-btn');
const calcResult = document.getElementById('calc-result');

function renderProductsForPromo(promoKey) {
    productsList.innerHTML = '';
    if (!promoKey) {
        promoDetails.hidden = true;
        return;
    }
    const promo = PROMOTIONS[promoKey];
    promoTitle.textContent = promo.title;
    promoDesc.textContent = promo.desc;
    promoDetails.hidden = false;

    // Filtrar productos aplicables
    const items = PRODUCTS.filter(promo.filter);
    if (items.length === 0) {
        productsList.innerHTML = '<p>No hay productos para esta promoción.</p>';
        return;
    }

    items.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product-item';
        div.innerHTML = `
            <label class="product-checkbox">
                <input type="checkbox" data-id="${p.id}" class="prod-check">
                <span class="prod-info">
                    <strong class="prod-name">${p.name}</strong>
                    <span class="prod-price">$${p.price.toLocaleString()}</span>
                </span>
            </label>
            <div class="prod-controls">
                <input type="number" min="1" value="1" class="qty-input" data-id="${p.id}" aria-label="cantidad ${p.name}">
            </div>
        `;
        productsList.appendChild(div);
    });
}

// Cambio de promoción
promoSelect.addEventListener('change', (e) => {
    renderProductsForPromo(e.target.value);
    calcResult.innerHTML = '';
});

// Cálculo promo seleccionada
calcularBtn.addEventListener('click', () => {
    const promoKey = promoSelect.value;
    if (!promoKey) return;
    // Recolectar productos seleccionados y cantidades
    const checked = Array.from(document.querySelectorAll('.prod-check:checked')).map(ch => ch.dataset.id);
    if (checked.length === 0) {
        calcResult.innerHTML = '<p class="small-muted">Seleccioná al menos un producto para ver el cálculo total.</p>';
        return;
    }
    const selection = checked.map(id => {
        const prod = PRODUCTS.find(p => p.id === id);
        const qtyInput = document.querySelector(`.qty-input[data-id="${id}"]`);
        const qty = Math.max(1, parseInt(qtyInput.value || '1', 10));
        return { ...prod, qty };
    });

    // Cálculo de subtotal y descuentos
    let subtotal = selection.reduce((s, it) => s + it.price * it.qty, 0);
    let descuento = 0;

    if (promoKey === 'dos50') {
        // Si hay al menos 2 items totales, calcular 50% sobre el de menor precio entre los seleccionados
        const totalUnits = selection.reduce((s,it) => s + it.qty, 0);
        if (totalUnits >= 2) {
            // crear array con cada unidad como precio para encontrar menor
            const unitPrices = [];
            selection.forEach(it => {
                for (let i=0;i<it.qty;i++) unitPrices.push(it.price);
            });
            unitPrices.sort((a,b)=>a-b);
            descuento = unitPrices[0] * 0.5;
        }
    } else if (promoKey === '3x2') {
        // Para merchandising: por cada 3 unidades, 1 gratis (el de menor valor)
        const merchUnits = [];
        selection.forEach(it => {
            for (let i=0;i<it.qty;i++) merchUnits.push(it.price);
        });
        merchUnits.sort((a,b)=>a-b); // menor primero
        const freeUnits = Math.floor(merchUnits.length / 3);
        descuento = merchUnits.slice(0, freeUnits).reduce((s,v)=>s+v,0);
    } else if (promoKey === '10off') {
        if (subtotal > 30000) descuento = subtotal * 0.10;
    }

    const total = subtotal - descuento;
    calcResult.innerHTML = `
        <p>Subtotal: <strong>$${subtotal.toLocaleString()}</strong></p>
        <p>Descuento: <strong>-$${Math.round(descuento).toLocaleString()}</strong></p>
        <p>Total con descuento: <strong>$${Math.round(total).toLocaleString()}</strong></p>
    `;
});