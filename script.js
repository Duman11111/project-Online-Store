document.addEventListener('DOMContentLoaded', function() {

    // --- 1. Данные (в реальном приложении они бы приходили с сервера) ---
    const products = [
        {
            id: 'B001',
            name: 'The Pragmatic Programmer',
            price: 45.50,
            category: 'Book',
            image: 'https://images-na.ssl-images-amazon.com/images/I/51IA4hT6jrL._SX384_BO1,204,203,200_.jpg'
        },
        {
            id: 'E001',
            name: 'DevBook Pro Laptop',
            price: 1500.00,
            category: 'Electronics',
            image: 'https://via.placeholder.com/400x300.png/2c3e50/ecf0f1?text=DevBook+Pro'
        },
        {
            id: 'A001',
            name: 'Mechanical Keyboard',
            price: 120.00,
            category: 'Accessory',
            image: 'https://via.placeholder.com/400x300.png/2c3e50/ecf0f1?text=Keyboard'
        },
        {
            id: 'B002',
            name: 'Clean Code',
            price: 40.00,
            category: 'Book',
            image: 'https://images-na.ssl-images-amazon.com/images/I/41xShlnlJiL._SX379_BO1,204,203,200_.jpg'
        },
        {
            id: 'E002',
            name: '4K Monitor',
            price: 450.00,
            category: 'Electronics',
            image: 'https://via.placeholder.com/400x300.png/2c3e50/ecf0f1?text=4K+Monitor'
        },
        {
            id: 'A002',
            name: 'Ergonomic Mouse',
            price: 75.00,
            category: 'Accessory',
            image: 'https://via.placeholder.com/400x300.png/2c3e50/ecf0f1?text=Ergo+Mouse'
        }
    ];

    const CART_STORAGE_KEY = 'gemini-store-cart';

    // --- 2. Состояние приложения ---
    let currentCategory = 'All'; // Текущая выбранная категория
    let searchTerm = ''; // Текущий поисковый запрос
    let currentSort = 'default'; // Текущая сортировка
    let cartItems = loadCart(); // Загружаем корзину из хранилища при запуске

    // --- 3. Находим главный контейнер приложения ---
    const appContainer = document.getElementById('app');

    // --- Функции для работы с хранилищем ---
    function saveCart() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }

    function loadCart() {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        // Если в хранилище что-то есть, загружаем, иначе — пустой массив
        return savedCart ? JSON.parse(savedCart) : [];
    }

    // --- 4. Функции для отрисовки разных "страниц" ---

    function renderStorePage() {
        appContainer.innerHTML = `
            <div class="store-layout">
                <main class="product-list">
                    <div class="product-list-header">
                        <h2>Товары</h2>
                        <input type="text" id="search-input" placeholder="Поиск по названию..." value="${searchTerm}">
                        <div class="sort-container">
                            <select id="sort-select">
                                <option value="default" ${currentSort === 'default' ? 'selected' : ''}>Сортировка по умолчанию</option>
                                <option value="price-asc" ${currentSort === 'price-asc' ? 'selected' : ''}>Цена: по возрастанию</option>
                                <option value="price-desc" ${currentSort === 'price-desc' ? 'selected' : ''}>Цена: по убыванию</option>
                            </select>
                        </div>
                        <div id="category-filters"></div>
                    </div>
                    <div id="product-grid"></div>
                </main>
                <aside class="cart">
                    <div class="cart-header">
                        <h2>Корзина</h2>
                        <button id="clear-cart-btn" class="btn-text">Очистить</button>
                    </div>
                    <div id="cart-items"></div>
                    <div class="cart-total">
                        <strong>Итого: <span id="cart-total-price">$0.00</span></strong>
                    </div>
                    <button id="checkout-btn" class="btn-primary">Оформить заказ</button>
                </aside>
            </div>
        `;

        renderCategoryFilters();
        renderProducts();
        renderCart();
        addStoreEventListeners();
    }

    function renderProductDetailPage(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) {
            renderStorePage(); // Если товар не найден, показываем главный магазин
            return;
        }

        appContainer.innerHTML = `
            <div class="product-detail-layout">
                <a href="/" class="back-to-store-btn">← Назад в магазин</a>
                <div class="product-detail-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-detail-image">
                </div>
                <div class="product-detail-info">
                    <h2>${product.name}</h2>
                    <p>Категория: ${product.category}</p>
                    <p class="product-detail-price">$${product.price.toFixed(2)}</p>
                    <p>Это подробное описание товара. Здесь можно рассказать о его преимуществах, характеристиках и особенностях использования.</p>
                    <button class="add-to-cart-btn btn-primary" data-id="${product.id}">Добавить в корзину</button>
                </div>
            </div>
        `;

        addProductDetailEventListeners();
    }

    // --- 5. Функции для отрисовки компонентов ---

    // Эта функция была исправлена в предыдущем ответе, здесь она уже корректна.
    function renderCart() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalPriceEl = document.getElementById('cart-total-price');
        if (!cartItemsContainer || !cartTotalPriceEl) return; // Элементов нет на странице товара

        cartItemsContainer.innerHTML = '';

        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<p class="cart-item-placeholder">Ваша корзина пуста.</p>';
        } else {
            cartItems.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.className = 'cart-item';
                cartItemDiv.setAttribute('data-id', item.id);
                cartItemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-controls">
                        <button class="quantity-decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-increase">+</button>
                        <button class="remove-item">×</button>
                    </div>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
            });
        }

        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalPriceEl.textContent = `$${total.toFixed(2)}`;
        saveCart();
    }

    // Функция для отрисовки кнопок-фильтров
    function renderCategoryFilters() {
        const categoryFiltersContainer = document.getElementById('category-filters');
        if (!categoryFiltersContainer) return;

        const categories = ['All', ...new Set(products.map(p => p.category))];
        categoryFiltersContainer.innerHTML = ''; // Очищаем контейнер
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.textContent = category;
            button.setAttribute('data-category', category);
            if (category === currentCategory) {
                button.classList.add('active');
            }
            categoryFiltersContainer.appendChild(button);
        });
    }

    // Функция для отрисовки товаров с учетом фильтра
    function renderProducts() {
        const productGridContainer = document.getElementById('product-grid');
        if (!productGridContainer) return;

        productGridContainer.innerHTML = ''; // Очищаем сетку товаров

        let productsToRender = [...products];

        // 1. Сортировка
        if (currentSort === 'price-asc') {
            productsToRender.sort((a, b) => a.price - b.price);
        } else if (currentSort === 'price-desc') {
            productsToRender.sort((a, b) => b.price - a.price);
        }

        // 2. Фильтрация по категории и по поисковому запросу
        const filteredProducts = productsToRender.filter(product => {
            const matchesCategory = currentCategory === 'All' || product.category === currentCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        if (filteredProducts.length === 0) {
            productGridContainer.innerHTML = '<p>В этой категории нет товаров.</p>';
            return;
        }

        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            // Оборачиваем содержимое в ссылку
            productCard.innerHTML = `
                <a href="?product=${product.id}" class="product-link" data-navigo>
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <p class="product-price">$${product.price.toFixed(2)}</p>
                    </div>
                </a>
                <div class="product-card-footer">
                    <button class="add-to-cart-btn" data-id="${product.id}">Добавить в корзину</button>
                </div>
            `;
            productGridContainer.appendChild(productCard);
        });
    }

    // --- 6. Обработчики событий ---

    function handleAddToCart(productId) {
        const existingItem = cartItems.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            const productToAdd = products.find(p => p.id === productId);
            if (productToAdd) {
                cartItems.push({ ...productToAdd, quantity: 1 });
            }
        }
        renderCart();

        const cartElement = document.querySelector('.cart');
        if (cartElement) {
            cartElement.classList.add('cart-highlight');
            setTimeout(() => {
                cartElement.classList.remove('cart-highlight');
            }, 500);
        }
    }

    function handleCartControls(event) {
        const target = event.target;
        const parentItem = target.closest('.cart-item');
        if (!parentItem) return;

        const productId = parentItem.getAttribute('data-id');
        const itemInCart = cartItems.find(item => item.id === productId);

        if (!itemInCart) return;

        if (target.classList.contains('quantity-increase')) {
            itemInCart.quantity++;
        } else if (target.classList.contains('quantity-decrease')) {
            itemInCart.quantity--;
            if (itemInCart.quantity <= 0) {
                // Если количество <= 0, удаляем товар из корзины
                cartItems = cartItems.filter(item => item.id !== productId);
            }
        } else if (target.classList.contains('remove-item')) {
            // Удаляем товар по кнопке "x"
            cartItems = cartItems.filter(item => item.id !== productId);
        }

        renderCart();
    }

    function addStoreEventListeners() {
        const productGridContainer = document.getElementById('product-grid');
        const categoryFiltersContainer = document.getElementById('category-filters');
        const searchInput = document.getElementById('search-input');
        const sortSelect = document.getElementById('sort-select');
        const cartItemsContainer = document.getElementById('cart-items');
        const clearCartBtn = document.getElementById('clear-cart-btn');
        const checkoutBtn = document.getElementById('checkout-btn');

        productGridContainer.addEventListener('click', function(event) {
            // Проверяем, был ли клик по кнопке "Добавить в корзину"
            if (event.target.classList.contains('add-to-cart-btn')) {
                const productId = event.target.getAttribute('data-id');
                handleAddToCart(productId);
                return;
            }
            
            // Если клик был не по кнопке, проверяем, был ли он по ссылке на товар
            const productLink = event.target.closest('.product-link');
            if (productLink) {
                event.preventDefault(); // Предотвращаем стандартный переход по ссылке
                    const url = new URL(productLink.href);
                    history.pushState({}, '', url.search); // Меняем URL без перезагрузки
                    router(); // Запускаем роутер для отрисовки новой страницы
            }
        });

        cartItemsContainer.addEventListener('click', handleCartControls);

        clearCartBtn.addEventListener('click', () => {
            cartItems = [];
            renderCart();
        });

        checkoutBtn.addEventListener('click', () => {
            if (cartItems.length === 0) {
                alert('Ваша корзина пуста.');
            } else {
                alert('Спасибо за ваш заказ!');
                cartItems = [];
                renderCart();
            }
        });

        searchInput.addEventListener('input', (event) => {
            searchTerm = event.target.value;
            renderProducts();
        });

        sortSelect.addEventListener('change', (event) => {
            currentSort = event.target.value;
            renderProducts();
        });

        categoryFiltersContainer.addEventListener('click', (event) => {
            if (event.target.tagName !== 'BUTTON') return;
            currentCategory = event.target.getAttribute('data-category');
            renderCategoryFilters();
            renderProducts();
        });
    }

    function addProductDetailEventListeners() {
        const backBtn = document.querySelector('.back-to-store-btn');
        const addToCartBtn = document.querySelector('.add-to-cart-btn');

        backBtn.addEventListener('click', function(event) {
            event.preventDefault();
            history.pushState({}, '', '/');
            router();
        });

        addToCartBtn.addEventListener('click', function(event) {
            const productId = event.target.getAttribute('data-id');
            handleAddToCart(productId);
            alert('Товар добавлен в корзину!');
        });
    }

    // --- 7. Маршрутизатор (Router) и Инициализация ---

    function router() {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('product');

        if (productId) {
            renderProductDetailPage(productId);
        } else {
            renderStorePage();
        }
    }

    window.addEventListener('popstate', router); // Обрабатываем кнопки "назад/вперед" в браузере
    document.addEventListener('DOMContentLoaded', router); // Запускаем роутер при загрузке страницы
});