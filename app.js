// ==================== LANGUAGE SYSTEM ====================
let currentLanguage = 'en'; // 'en' or 'el' (Greek)

const translations = {
    en: {
        welcome: 'Welcome!',
        thisWeek: 'This Week',
        allTime: 'All Time',
        activeOrders: 'Active Orders',
        readyForDelivery: 'Ready For Delivery',
        pending: 'Pending',
        completed: 'Completed',
        recentCustomers: 'Recent Customers',
        home: 'Home',
        new: 'New',
        customers: 'Customers',
        newOrder: 'New Order',
        newCustomer: 'New Customer',
        inProgress: 'In Progress'
    },
    el: {
        welcome: 'Καλώς ήρθατε!',
        thisWeek: 'Αυτή την Εβδομάδα',
        allTime: 'Όλος ο Χρόνος',
        activeOrders: 'Ενεργές Παραγγελίες',
        readyForDelivery: 'Έτοιμες για Παράδοση',
        pending: 'Εκκρεμείς',
        completed: 'Ολοκληρωμένες',
        recentCustomers: 'Πρόσφατοι Πελάτες',
        home: 'Αρχική',
        new: 'Νέο',
        customers: 'Πελάτες',
        newOrder: 'Νέα Παραγγελία',
        newCustomer: 'Νέος Πελάτης',
        inProgress: 'Σε Εξέλιξη'
    }
};

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'el' : 'en';
    updateLanguage();
}

function updateLanguage() {
    const t = translations[currentLanguage];
    
    // Update home screen text
    const greeting = document.querySelector('.greeting');
    if (greeting) greeting.textContent = t.welcome;
    
    const cardTitles = document.querySelectorAll('.card-title');
    if (cardTitles[0]) cardTitles[0].textContent = t.thisWeek;
    if (cardTitles[1]) cardTitles[1].textContent = t.allTime;
    
    const statLabels = document.querySelectorAll('.stat-label');
    if (statLabels[0]) statLabels[0].textContent = t.activeOrders;
    if (statLabels[1]) statLabels[1].textContent = t.readyForDelivery;
    if (statLabels[2]) statLabels[2].textContent = t.pending;
    if (statLabels[3]) statLabels[3].textContent = t.completed;
    if (statLabels[4]) statLabels[4].textContent = t.pending;
    
    const popupHeader = document.querySelector('.popup-header');
    if (popupHeader) popupHeader.textContent = t.recentCustomers;
    
    const navLabels = document.querySelectorAll('.nav-label-new');
    if (navLabels[0]) navLabels[0].textContent = t.home;
    if (navLabels[1]) navLabels[1].textContent = t.customers;
    
    const plusMenuItems = document.querySelectorAll('.plus-menu-item-new');
    if (plusMenuItems[0]) plusMenuItems[0].innerHTML = `<span>✂️</span> ${t.newOrder}`;
    if (plusMenuItems[1]) plusMenuItems[1].innerHTML = `<span>👤</span> ${t.newCustomer}`;
}

// ==================== WELCOME SCREEN ====================

function startApp() {
    localStorage.setItem('hasSeenWelcome', 'true');
    
    const welcomeScreen = document.getElementById('screen-welcome');
    welcomeScreen.classList.add('fade-out');
    
    setTimeout(() => {
        welcomeScreen.classList.remove('active');
        showScreen('screen-home');
    }, 600);
}

function checkWelcomeStatus() {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    if (hasSeenWelcome === 'true') {
        document.getElementById('screen-welcome').classList.remove('active');
        showScreen('screen-home');
    }
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', async () => {
    checkWelcomeStatus();
    await initDB();
    setTodayDate();
    loadCustomers();
    loadOrders();
    setupEventListeners();
    loadRecentCustomers();
    updateStats();
    // Initialize navigation active states for home screen
    updateNavigationActiveStates('screen-home');
});

// ==================== SCREEN NAVIGATION ====================

let currentScreen = 'screen-home';

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    // Close the plus menu when navigating
closePlusMenu();  
    // Show the selected screen
    document.getElementById(screenId).classList.add('active');
    
    // Load recent customers when home screen is shown
    if (screenId === 'screen-home') {
        displayRecentCustomers();
    }

    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;

    closePlusMenu();

    // Update navigation active states
    updateNavigationActiveStates(screenId);

    // Load data for the screen
    if (screenId === 'screen-customers') {
        loadCustomers();
    } else if (screenId === 'screen-home') {
        loadOrders();
        loadRecentCustomers();
        updateStats();
    }
}

function updateNavigationActiveStates(screenId) {
    // Remove ALL active classes from ALL navigation items across ALL screens
    document.querySelectorAll('.nav-item-new, .nav-item-customers, .nav-item-new-customer, .nav-item-customer-detail').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelectorAll('.plus-button-new, .plus-button-customers, .plus-button-new-customer, .plus-button-customer-detail').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active class based on current screen
    if (screenId === 'screen-home') {
        // HOME SCREEN - Activate FIRST icon (home)
        const homeNavItems = document.querySelectorAll('.bottom-nav-new .nav-item-new');
        if (homeNavItems.length > 0) {
            homeNavItems[0].classList.add('active'); // HOME icon
        }
    } 
    else if (screenId === 'screen-customers') {
        // CUSTOMERS SCREEN - Activate LAST icon (customers) on BOTH navbars
        
        // Activate in home screen navbar (for when switching back)
        const homeNavItems = document.querySelectorAll('.bottom-nav-new .nav-item-new');
        if (homeNavItems.length > 1) {
            homeNavItems[1].classList.add('active'); // CUSTOMERS icon (last one)
        }
        
        // Activate in customers screen navbar
        const customerNavItems = document.querySelectorAll('.bottom-nav-customers .nav-item-customers');
        if (customerNavItems.length > 1) {
            customerNavItems[1].classList.add('active'); // CUSTOMERS icon (last one)
        }
    } 
    else if (screenId === 'screen-new-customer') {
        // NEW CUSTOMER SCREEN - Activate PLUS button on ALL navbars
        document.querySelectorAll('.plus-button-new').forEach(btn => {
            btn.classList.add('active');
        });
        document.querySelectorAll('.plus-button-customers').forEach(btn => {
            btn.classList.add('active');
        });
        document.querySelectorAll('.plus-button-new-customer').forEach(btn => {
            btn.classList.add('active');
        });
    }
    else if (screenId === 'screen-customer-detail') {
        // CUSTOMER DETAIL SCREEN - No specific active state (neutral)
        // User came from either home or customers, so don't highlight anything specific
    }
}

function goBack() {
    if (currentCustomerId) {
        showCustomerDetail(currentCustomerId);
    } else {
        showScreen('screen-home');
    }
}

// ==================== PLUS MENU ====================

function togglePlusMenu() {
    const menu = document.getElementById('plus-menu-new');
    const overlay = document.getElementById('modal-overlay-new');
    
    if (menu && overlay) {
        const isActive = menu.classList.contains('active');
        
        if (isActive) {
            menu.classList.remove('active');
            overlay.classList.remove('active');
        } else {
            menu.classList.add('active');
            overlay.classList.add('active');
        }
    }
}


function closePlusMenu() {
    const menu = document.getElementById('plus-menu-new');
    const overlay = document.getElementById('modal-overlay-new');
    
    if (menu) menu.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}



// ==================== MENU & NOTIFICATIONS ====================

function toggleMenu() {
    alert('Menu - Coming soon!\nSettings, Profile, Help');
}

// ==================== NOTIFICATIONS SYSTEM ====================

async function showNotifications() {
    try {
        const orders = await getAllOrders();
        const customers = await getAllCustomers();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Categorize orders
        const overdueOrders = [];
        const todayOrders = [];
        const upcomingOrders = [];
        const noDateOrders = [];

        for (const order of orders) {
            if (order.completed) continue;

            const customer = customers.find(c => c.id === order.customerId);
            if (!customer) continue;

            const orderWithCustomer = { ...order, customerName: customer.name };

            if (!order.deliveryDate) {
                noDateOrders.push(orderWithCustomer);
                continue;
            }

            const deliveryDate = new Date(order.deliveryDate);
            deliveryDate.setHours(0, 0, 0, 0);

            if (deliveryDate < today) {
                overdueOrders.push(orderWithCustomer);
            } else if (deliveryDate.getTime() === today.getTime()) {
                todayOrders.push(orderWithCustomer);
            } else if (deliveryDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
                upcomingOrders.push(orderWithCustomer);
            }
        }

        createNotificationPopup(overdueOrders, todayOrders, upcomingOrders, noDateOrders);
    } catch (error) {
        console.error('Error loading notifications:', error);
        alert('Error loading notifications');
    }
}

function createNotificationPopup(overdue, today, upcoming, noDate) {
    const existingPopup = document.getElementById('notification-popup');
    if (existingPopup) existingPopup.remove();

    const existingOverlay = document.getElementById('notification-overlay');
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement('div');
    overlay.id = 'notification-overlay';
    overlay.className = 'notification-overlay';
    overlay.onclick = closeNotifications;
    document.body.appendChild(overlay);

    const popup = document.createElement('div');
    popup.id = 'notification-popup';
    popup.className = 'notification-popup';

    let content = `
        <div class="notification-popup-header">
            <div class="notification-popup-title">Delivery Reminders</div>
            <button class="notification-close-btn" onclick="closeNotifications()">×</button>
        </div>
        <div class="notification-popup-content">
    `;

    const hasNotifications = overdue.length > 0 || today.length > 0 || upcoming.length > 0 || noDate.length > 0;

    if (!hasNotifications) {
        content += `
            <div class="notification-empty">
                <div style="font-size: 48px; margin-bottom: 16px;">🔔</div>
                <div>No delivery reminders</div>
                <div style="font-size: 14px; margin-top: 8px;">All orders are on track!</div>
            </div>
        `;
    } else {
        if (overdue.length > 0) {
            content += `<div class="notification-section"><div class="notification-section-title">⚠️ Overdue (${overdue.length})</div>`;
            overdue.forEach(order => {
                const garmentType = order.items && order.items[0] ? order.items[0].type : 'order';
                const daysOverdue = Math.floor((new Date() - new Date(order.deliveryDate)) / (1000 * 60 * 60 * 24));
                content += `
                    <div class="notification-card" onclick="closeNotifications(); setTimeout(() => showOrderDetail('${order.id}'), 100);">
                        <div class="notification-card-header">
                            <div class="notification-card-customer">${order.customerName}</div>
                            <div class="notification-card-badge badge-overdue">OVERDUE</div>
                        </div>
                        <div class="notification-card-details">${garmentType.charAt(0).toUpperCase() + garmentType.slice(1)} order</div>
                        <div class="notification-card-date">${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'} overdue</div>
                    </div>
                `;
            });
            content += `</div>`;
        }

        if (today.length > 0) {
            content += `<div class="notification-section"><div class="notification-section-title">📅 Due Today (${today.length})</div>`;
            today.forEach(order => {
                const garmentType = order.items && order.items[0] ? order.items[0].type : 'order';
                content += `
                    <div class="notification-card" onclick="closeNotifications(); setTimeout(() => showOrderDetail('${order.id}'), 100);">
                        <div class="notification-card-header">
                            <div class="notification-card-customer">${order.customerName}</div>
                            <div class="notification-card-badge badge-today">TODAY</div>
                        </div>
                        <div class="notification-card-details">${garmentType.charAt(0).toUpperCase() + garmentType.slice(1)} order</div>
                        <div class="notification-card-date">Ready for pickup today</div>
                    </div>
                `;
            });
            content += `</div>`;
        }

        if (upcoming.length > 0) {
            content += `<div class="notification-section"><div class="notification-section-title">📆 This Week (${upcoming.length})</div>`;
            upcoming.forEach(order => {
                const garmentType = order.items && order.items[0] ? order.items[0].type : 'order';
                const daysUntil = Math.ceil((new Date(order.deliveryDate) - new Date()) / (1000 * 60 * 60 * 24));
                content += `
                    <div class="notification-card" onclick="closeNotifications(); setTimeout(() => showOrderDetail('${order.id}'), 100);">
                        <div class="notification-card-header">
                            <div class="notification-card-customer">${order.customerName}</div>
                            <div class="notification-card-badge badge-upcoming">UPCOMING</div>
                        </div>
                        <div class="notification-card-details">${garmentType.charAt(0).toUpperCase() + garmentType.slice(1)} order</div>
                        <div class="notification-card-date">Due in ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}</div>
                    </div>
                `;
            });
            content += `</div>`;
        }

        if (noDate.length > 0) {
            content += `<div class="notification-section"><div class="notification-section-title">📋 No Delivery Date (${noDate.length})</div>`;
            noDate.forEach(order => {
                const garmentType = order.items && order.items[0] ? order.items[0].type : 'order';
                content += `
                    <div class="notification-card" onclick="closeNotifications(); setTimeout(() => showOrderDetail('${order.id}'), 100);">
                        <div class="notification-card-header">
                            <div class="notification-card-customer">${order.customerName}</div>
                            <div class="notification-card-badge badge-no-date">NO DATE</div>
                        </div>
                        <div class="notification-card-details">${garmentType.charAt(0).toUpperCase() + garmentType.slice(1)} order</div>
                        <div class="notification-card-date">Delivery date not set</div>
                    </div>
                `;
            });
            content += `</div>`;
        }
    }

    content += `</div>`;
    popup.innerHTML = content;
    document.body.appendChild(popup);

    setTimeout(() => {
        overlay.classList.add('active');
        popup.classList.add('active');
    }, 10);
}

function closeNotifications() {
    const popup = document.getElementById('notification-popup');
    const overlay = document.getElementById('notification-overlay');

    if (popup) popup.classList.remove('active');
    if (overlay) overlay.classList.remove('active');

    setTimeout(() => {
        if (popup) popup.remove();
        if (overlay) overlay.remove();
    }, 300);
}

// ==================== STATS LOADING ====================

async function updateStats() {
    const orders = await getAllOrders();
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // This week stats
    const weekOrders = orders.filter(o => new Date(o.orderDate) >= oneWeekAgo);
    const activeOrders = weekOrders.filter(o => !o.completed).length;
    const readyOrders = weekOrders.filter(o => o.status === 'ready').length;
    const pendingOrders = weekOrders.filter(o => !o.completed && o.status !== 'ready').length;
    
    // All time stats
    const completedOrders = orders.filter(o => o.completed).length;
    const totalPending = orders.filter(o => !o.completed).length;
    
    // Update UI
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers[0]) statNumbers[0].textContent = activeOrders;
    if (statNumbers[1]) statNumbers[1].textContent = readyOrders;
    if (statNumbers[2]) statNumbers[2].textContent = pendingOrders;
    if (statNumbers[3]) statNumbers[3].textContent = completedOrders;
    if (statNumbers[4]) statNumbers[4].textContent = totalPending;
}

// ==================== RECENT CUSTOMERS ====================

async function loadRecentCustomers() {
    const orders = await getAllOrders();
    const customerIds = new Set();
    const recentCustomers = [];
    
    // Get unique customers from recent orders
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    for (const order of orders) {
        if (!customerIds.has(order.customerId) && recentCustomers.length < 3) {
            customerIds.add(order.customerId);
            const customer = await getCustomer(order.customerId);
            if (customer) {
                recentCustomers.push({
                    customer,
                    order
                });
            }
        }
    }
    
    displayRecentCustomers(recentCustomers);
}

function displayRecentCustomers(recentCustomers) {
    const container = document.getElementById('recent-customers-list');
    if (!container) return;
    
    if (recentCustomers.length === 0) {
        container.innerHTML = '<div style="color: rgba(255,255,255,0.7); text-align: center; padding: 20px;">No recent orders</div>';
        return;
    }
    
    container.innerHTML = recentCustomers.map(({customer, order}) => {
        const garment = order.items && order.items[0] ? order.items[0].type : 'order';
        const garmentText = garment.charAt(0).toUpperCase() + garment.slice(1);
        const garmentIcons = {
    jacket: `<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle;">
        <g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3">
            <path d="M6 10L18 4H30L42 10L40 35H34V44H24H14V35H8L6 10Z"/>
            <path d="M14 35L14 20"/>
            <path d="M34 35V20"/>
            <path d="M24 10C27.3137 10 30 7.31371 30 4H18C18 7.31371 20.6863 10 24 10Z"/>
        </g>
    </svg>`,
    pants: `<svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle;">
        <path fill="currentColor" d="m223.88 214l-22-176A16 16 0 0 0 186 24H70a16 16 0 0 0-15.88 14l-22 176A16 16 0 0 0 48 232h40.69a16 16 0 0 0 15.51-12.06l23.8-92l23.79 91.94A16 16 0 0 0 167.31 232H208a16 16 0 0 0 15.88-18M192.9 95.2A32.13 32.13 0 0 1 169 72h21ZM186 40l2 16H68l2-16ZM66 72h21a32.13 32.13 0 0 1-23.9 23.2Zm22.69 144H48l13-104.27A48.08 48.08 0 0 0 103.32 72H120v23Zm78.6-.06L136 95V72h16.68A48.08 48.08 0 0 0 195 111.73L208 216Z"/>
    </svg>`,
    shirt: `<svg width="24" height="24" viewBox="0 0 2048 2048" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle;">
        <path fill="currentColor" d="m2048 384l-128 512h-256v1024H384V896H128L0 384l768-256q0 53 20 99t55 82t81 55t100 20q53 0 99-20t82-55t55-81t20-100zm-153 84l-524-175q-24 50-60 90t-82 69t-97 44t-108 16q-56 0-108-15t-97-44t-81-69t-61-91L153 468l75 300h284v1024h1024V768h284z"/>
    </svg>`
};
const icon = garmentIcons[garment] || garmentIcons.jacket;
        
        // Determine status
        let statusBadges = '';
        if (order.completed) {
            statusBadges = '<span class="status-badge status-ready">Ready</span>';
        } else {
            statusBadges = '<span class="status-badge status-progress">In Progress</span>';
            if (order.urgent) {
                statusBadges += '<span class="status-badge status-pending">Urgent</span>';
            } else {
                statusBadges += '<span class="status-badge status-pending">Pending</span>';
            }
        }
        
        return `
            <div class="customer-card glass-card-customer" onclick="showCustomerDetail(${customer.id})">
                <div class="customer-info">
                    <div class="customer-name">${customer.name}</div>
                    <div class="customer-garment">${icon} ${garmentText}</div>
                    <div class="customer-status">
                        ${statusBadges}
                    </div>
                </div>
                <div class="customer-arrow">→</div>
            </div>
        `;
    }).join('');
}

// ==================== CUSTOMER MANAGEMENT ====================

let currentCustomerId = null;
let currentOrderId = null;

async function handleCustomerSubmit(e) {
    e.preventDefault();
    
    const customer = {
        name: document.getElementById('customer-name').value,
        phone: document.getElementById('customer-phone').value,
        address: document.getElementById('customer-address').value,
        email: document.getElementById('customer-email').value,
        createdDate: new Date().toISOString()
    };
    
    try {
        const customerId = await addCustomer(customer);
        alert('✅ Customer saved successfully!');
        showCustomerDetail(customerId);
    } catch (error) {
        alert('❌ Error saving customer: ' + error);
    }
    
    return false;
}

async function loadCustomers() {
    const customers = await getAllCustomers();
    displayCustomers(customers);
    displayCustomersNew(customers);
}

async function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const customers = await searchCustomers(query);
    displayCustomers(customers);
    displayCustomersNew(customers);
}

function displayCustomers(customers) {
    const container = document.getElementById('customer-list');

    if (!container) return;

    if (customers.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No customers found</p></div>';
        return;
    }

    container.innerHTML = customers.map(customer => `
        <div class="customer-item" onclick="showCustomerDetail(${customer.id})">
            <div>
                <h3>${customer.name}</h3>
                <p>${customer.phone || 'No phone'}</p>
            </div>
            <div class="customer-arrow">→</div>
        </div>
    `).join('');
}

async function displayCustomersNew(customers) {
    const container = document.getElementById('customers-list-container');

    if (!container) return;

    // Check if "No customers found" message exists
    const noCustomersMsg = container.querySelector('.no-customers-message');

    if (customers.length === 0) {
        // Show "No customers found" message
        if (noCustomersMsg) {
            noCustomersMsg.style.display = 'flex';
        }
        // Clear any customer cards
        const customerCards = container.querySelectorAll('.customer-card-item');
        customerCards.forEach(card => card.remove());
        return;
    }

    // Hide "No customers found" message when there are customers
    if (noCustomersMsg) {
        noCustomersMsg.style.display = 'none';
    }

    // Get order counts for each customer
    const customersWithOrders = await Promise.all(customers.map(async customer => {
        const orders = await getCustomerOrders(customer.id);
        return {
            ...customer,
            orderCount: orders.length
        };
    }));

    // Create customer cards HTML
    const customerCardsHTML = customersWithOrders.map(customer => {
        const initial = customer.name.charAt(0).toUpperCase();
        const phone = customer.phone || 'No phone';
        const orderCount = customer.orderCount;

        return `
            <div class="customer-card-item" onclick="showCustomerDetail(${customer.id})">
                <div class="customer-initial-circle">${initial}</div>
                <div class="customer-card-info">
                    <div class="customer-card-name">${customer.name}</div>
                    <div class="customer-card-details">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24c1.12.37 2.33.57 3.57.57c.55 0 1 .45 1 1V20c0 .55-.45 1-1 1c-9.39 0-17-7.61-17-17c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1c0 1.25.2 2.45.57 3.57c.11.35.03.74-.25 1.02z" fill="currentColor"/>
                        </svg>
                        ${phone}
                    </div>
                    <div class="customer-card-details">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8zm4 18H6V4h7v5h5zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01L12.01 11z" fill="currentColor"/>
                        </svg>
                        ${orderCount} ${orderCount === 1 ? 'order' : 'orders'}
                    </div>
                </div>
                <div class="customer-card-arrow">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6l-6 6z" fill="currentColor"/>
                    </svg>
                </div>
            </div>
        `;
    }).join('');

    // If noCustomersMsg exists, insert cards after it
    if (noCustomersMsg) {
        // Remove old customer cards first
        const oldCards = container.querySelectorAll('.customer-card-item');
        oldCards.forEach(card => card.remove());
        // Insert new cards after the message
        noCustomersMsg.insertAdjacentHTML('afterend', customerCardsHTML);
    } else {
        // If no message element, just replace all content
        container.innerHTML = customerCardsHTML;
    }
}

// ==================== CUSTOMER DETAIL SCREEN ====================

async function showCustomerDetail(customerId) {
    currentCustomerId = customerId;
    const customer = await getCustomer(customerId);
    const orders = await getCustomerOrders(customerId);
    
    if (!customer) {
        alert('Customer not found!');
        return;
    }
    
    // Update header name
    const headerName = document.getElementById('customer-detail-header-name');
    if (headerName) {
        headerName.textContent = customer.name;
    }
    
    // Update customer info cards
    document.getElementById('detail-customer-name').textContent = customer.name || '[......]';
    document.getElementById('detail-customer-phone').textContent = customer.phone || '[......]';
    document.getElementById('detail-customer-address').textContent = customer.address || '[......]';
    document.getElementById('detail-customer-email').textContent = customer.email || '[......]';
    
    // Update orders count
    document.getElementById('orders-count-text').textContent = `Orders (${orders.length})`;
    
    // Display orders
    displayCustomerDetailOrders(orders);
    
    // Show the screen
    showScreen('screen-customer-detail');
}

function displayCustomerDetailOrders(orders) {
    const container = document.getElementById('customer-orders-list');
    
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div style="
                width: 100%;
                min-height: 150px;
                background: rgba(0, 0, 0, 0.11);
                border: 1px dashed rgba(255, 255, 255, 0.3);
                border-radius: 18px;
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                padding: 40px 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Sen', sans-serif;
                font-size: 18px;
                font-weight: 400;
                color: rgba(255, 255, 255, 0.7);
                text-align: center;
                margin: 0;
                box-shadow: none;
            ">
                No orders yet
            </div>
        `;
        return;
    }
    
    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    container.innerHTML = orders.map(order => {
        const garmentType = order.items && order.items[0] ? order.items[0].type : 'order';
        const garmentText = garmentType.charAt(0).toUpperCase() + garmentType.slice(1);
        
        const garmentIconsDetail = {
    jacket: `<svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="3">
            <path d="M6 10L18 4H30L42 10L40 35H34V44H24H14V35H8L6 10Z"/>
            <path d="M14 35L14 20"/>
            <path d="M34 35V20"/>
            <path d="M24 10C27.3137 10 30 7.31371 30 4H18C18 7.31371 20.6863 10 24 10Z"/>
        </g>
    </svg>`,
    pants: `<svg width="24" height="24" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="white" d="m223.88 214l-22-176A16 16 0 0 0 186 24H70a16 16 0 0 0-15.88 14l-22 176A16 16 0 0 0 48 232h40.69a16 16 0 0 0 15.51-12.06l23.8-92l23.79 91.94A16 16 0 0 0 167.31 232H208a16 16 0 0 0 15.88-18M192.9 95.2A32.13 32.13 0 0 1 169 72h21ZM186 40l2 16H68l2-16ZM66 72h21a32.13 32.13 0 0 1-23.9 23.2Zm22.69 144H48l13-104.27A48.08 48.08 0 0 0 103.32 72H120v23Zm78.6-.06L136 95V72h16.68A48.08 48.08 0 0 0 195 111.73L208 216Z"/>
    </svg>`,
    shirt: `<svg width="24" height="24" viewBox="0 0 2048 2048" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="white" d="m2048 384l-128 512h-256v1024H384V896H128L0 384l768-256q0 53 20 99t55 82t81 55t100 20q53 0 99-20t82-55t55-81t20-100zm-153 84l-524-175q-24 50-60 90t-82 69t-97 44t-108 16q-56 0-108-15t-97-44t-81-69t-61-91L153 468l75 300h284v1024h1024V768h284z"/>
    </svg>`
};
const garmentIcon = garmentIconsDetail[garmentType] || garmentIconsDetail.jacket;
        
        // Determine status badges
        let statusBadges = '';
        if (order.completed) {
            statusBadges = '<span class="order-status-badge status-ready">Ready</span>';
        } else {
            statusBadges = '<span class="order-status-badge status-in-progress">In Progress</span>';
            statusBadges += '<span class="order-status-badge status-pending">Pending</span>';
        }
        
        return `
            <div class="order-card" onclick="editOrder(${order.id})">
                <div class="order-card-header">
                    ${typeof garmentIcon === 'string' && garmentIcon.startsWith('<svg') ? garmentIcon : `<span style="font-size: 24px;">${garmentIcon}</span>`}
                    <span class="order-card-type">${garmentText}</span>
                </div>
                <div class="order-card-dates">
                    <div class="order-card-date">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z" fill="currentColor"/>
                        </svg>
                        ${formatDate(order.orderDate)}
                    </div>
                    ${order.deliveryDate ? `
                    <div class="order-card-date">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" fill="currentColor"/>
                        </svg>
                        ${formatDate(order.deliveryDate)}
                    </div>
                    ` : ''}
                </div>
                <div class="order-card-status">
                    ${statusBadges}
                </div>
            </div>
        `;
    }).join('');
}

// ==================== ORDER MANAGEMENT ====================

function createNewCustomer() {
    closePlusMenu();
    showScreen('screen-new-customer');
    document.getElementById('customer-form').reset();
}

function createOrderForCustomer() {
    createNewOrder();
    setTimeout(() => {
        const select = document.getElementById('customer-select');
        if (select && currentCustomerId) {
            select.value = currentCustomerId;
        }
    }, 100);
}

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    const orderDate = document.getElementById('order-date');
    if (orderDate) {
        orderDate.value = today;
    }
}

async function loadOrders() {
    const orders = await getAllOrders();
    displayOrders(orders);
}

function displayOrders(orders) {
    // This function can stay empty for now since we're using the new home screen
    // Keep it for compatibility with other screens
}

async function loadCustomersDropdown() {
    const customers = await getAllCustomers();
    const select = document.getElementById('customer-select');
    
    if (!select) return;
    
    select.innerHTML = '<option value="">Select customer...</option>';
    
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.name;
        select.appendChild(option);
    });
}

async function saveOrder() {
    const customerId = document.getElementById('customer-select').value;
    const garmentType = document.getElementById('garment-type').value;
    
    if (!customerId) {
        alert('⚠️ Please select a customer');
        return;
    }
    
    if (!garmentType) {
        alert('⚠️ Please select a garment type');
        return;
    }
    
    const measurements = {};
    const fields = getMeasurementFields(garmentType);
    
    fields.forEach(field => {
        const input = document.getElementById(`measure-${field.name}`);
        if (input && input.value) {
            measurements[field.name] = input.value;
        }
    });
    
    const order = {
        customerId: parseInt(customerId),
        orderDate: document.getElementById('order-date').value,
        deliveryDate: document.getElementById('delivery-date').value || null,
        items: [{
            type: garmentType,
            measurements: measurements
        }],
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    try {
        await addOrder(order);
        alert('✅ Order saved successfully!');
        showCustomerDetail(parseInt(customerId));
        updateStats();
        loadRecentCustomers();
    } catch (error) {
        alert('❌ Error saving order: ' + error);
    }
}

async function editOrder(orderId) {
    alert('📝 Order editing - Coming soon!');
}

async function deleteOrderConfirm(orderId) {
    if (confirm('⚠️ Are you sure you want to delete this order?')) {
        try {
            await deleteOrder(orderId);
            alert('✅ Order deleted successfully!');
            if (currentCustomerId) {
                showCustomerDetail(currentCustomerId);
            } else {
                loadOrders();
            }
            updateStats();
            loadRecentCustomers();
        } catch (error) {
            alert('❌ Error deleting order: ' + error);
        }
    }
}

function handleGarmentChange(e) {
    const garmentType = e.target.value;
    const container = document.getElementById('measurements-container');
    
    if (!garmentType) {
        container.innerHTML = '';
        return;
    }
    
    const fields = getMeasurementFields(garmentType);
    
    container.innerHTML = `
        <h3 style="margin: 24px 0 16px; font-size: 18px;">Measurements</h3>
        ${fields.map(field => `
            <div class="form-group">
                <label>${field.label}</label>
                <input type="${field.type}" id="measure-${field.name}" ${field.type === 'number' ? 'step="0.1"' : ''}>
            </div>
        `).join('')}
    `;
}

function getMeasurementFields(type) {
    const fields = {
        jacket: [
            { name: 'chest', label: 'Chest (cm)', type: 'number' },
            { name: 'waist', label: 'Waist (cm)', type: 'number' },
            { name: 'sleeve', label: 'Sleeve (cm)', type: 'number' },
            { name: 'length', label: 'Length (cm)', type: 'number' },
            { name: 'notes', label: 'Notes', type: 'text' }
        ],
        pants: [
            { name: 'waist', label: 'Waist (cm)', type: 'number' },
            { name: 'inseam', label: 'Inseam (cm)', type: 'number' },
            { name: 'outseam', label: 'Outseam (cm)', type: 'number' },
            { name: 'notes', label: 'Notes', type: 'text' }
        ],
        shirt: [
            { name: 'neck', label: 'Neck (cm)', type: 'number' },
            { name: 'chest', label: 'Chest (cm)', type: 'number' },
            { name: 'sleeve', label: 'Sleeve (cm)', type: 'number' },
            { name: 'notes', label: 'Notes', type: 'text' }
        ]
    };
    
    return fields[type] || [];
}

function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    const customerSearch = document.getElementById('customer-search');
    if (customerSearch) {
        customerSearch.addEventListener('input', handleSearch);
    }

    const garmentSelect = document.getElementById('garment-type');
    if (garmentSelect) {
        garmentSelect.addEventListener('change', handleGarmentChange);
    }
}

// ==================== HELPER FUNCTIONS ====================

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function getAllOrders() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['orders'], 'readonly');
        const store = transaction.objectStore('orders');
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
let selectedGarmentType = null;

// Garment measurement field definitions
const garmentMeasurements = {
    jacket: [
        { name: 'type', label: 'Type', type: 'text' },
        { name: 'design', label: 'Design', type: 'text' },
        { name: 'size', label: 'Size', type: 'text' },
        { name: 'chest', label: 'Chest', type: 'number', unit: 'cm' },
        { name: 'opening', label: 'Opening', type: 'number', unit: 'cm' },
        { name: 'waist', label: 'Waist', type: 'number', unit: 'cm' },
        { name: 'back', label: 'Back', type: 'number', unit: 'cm' },
        { name: 'circumference', label: 'Circumference', type: 'number', unit: 'cm' },
        { name: 'lapel', label: 'Lapel', type: 'number', unit: 'cm' },
        { name: 'length', label: 'Length', type: 'number', unit: 'cm' },
        { name: 'sleeve', label: 'Sleeve', type: 'number', unit: 'cm' },
        { name: 'notes', label: 'Notes', type: 'textarea' }
    ],
    pants: [
        { name: 'type', label: 'Type', type: 'text' },
        { name: 'design', label: 'Design', type: 'text' },
        { name: 'size', label: 'Size', type: 'text' },
        { name: 'waist', label: 'Waist', type: 'number', unit: 'cm' },
        { name: 'front_pockets', label: 'Front Pockets', type: 'text' },
        { name: 'circumference', label: 'Circumference', type: 'number', unit: 'cm' },
        { name: 'back_pockets', label: 'Back Pockets', type: 'text' },
        { name: 'inside_length', label: 'Inside Length', type: 'number', unit: 'cm' },
        { name: 'crotch', label: 'Crotch', type: 'number', unit: 'cm' },
        { name: 'cuff', label: 'Cuff', type: 'number', unit: 'cm' },
        { name: 'notes', label: 'Notes', type: 'textarea' }
    ],
    shirt: [
        { name: 'type', label: 'Type', type: 'text' },
        { name: 'design', label: 'Design', type: 'text' },
        { name: 'size', label: 'Size', type: 'text' },
        { name: 'collar', label: 'Collar', type: 'number', unit: 'cm' },
        { name: 'sleeve', label: 'Sleeve', type: 'number', unit: 'cm' },
        { name: 'chest', label: 'Chest', type: 'number', unit: 'cm' },
        { name: 'cuff', label: 'Cuff', type: 'number', unit: 'cm' },
        { name: 'waist', label: 'Waist', type: 'number', unit: 'cm' },
        { name: 'shoulder', label: 'Shoulder Blade', type: 'number', unit: 'cm' },
        { name: 'circumference', label: 'Circumference', type: 'number', unit: 'cm' },
        { name: 'collar_design', label: 'Collar Design', type: 'text' },
        { name: 'front_length', label: 'Front Length', type: 'number', unit: 'cm' },
        { name: 'buttons', label: 'Buttons', type: 'text' },
        { name: 'notes', label: 'Notes', type: 'textarea' }
    ]
};

function selectGarment(garmentType) {
    selectedGarmentType = garmentType;
    
    // Update button active states
    document.querySelectorAll('.garment-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-garment="${garmentType}"]`).classList.add('active');
    
    // Show measurements section
    document.getElementById('measurements-section').style.display = 'block';
    
    // Generate measurement fields
    const container = document.getElementById('measurements-fields-container');
    const fields = garmentMeasurements[garmentType];
    
    container.innerHTML = fields.map(field => `
        <div class="measurement-field">
            <label for="measure-${field.name}">${field.label}</label>
            ${field.type === 'textarea' 
                ? `<textarea id="measure-${field.name}" placeholder="[......]"></textarea>`
                : `<input type="${field.type}" id="measure-${field.name}" placeholder="[......]" ${field.type === 'number' ? 'step="0.1"' : ''}>`
            }
        </div>
    `).join('');
}

async function handleNewOrderSubmit(e) {
    e.preventDefault();
    
    const customerId = document.getElementById('order-customer-select').value;
    const orderDate = document.getElementById('order-date-input').value;
    const deliveryDate = document.getElementById('delivery-date-input').value;
    
    if (!customerId) {
        alert('⚠️ Please select a customer');
        return;
    }
    
    if (!selectedGarmentType) {
        alert('⚠️ Please select a garment type');
        return;
    }
    
    // Collect measurements
    const measurements = {};
    const fields = garmentMeasurements[selectedGarmentType];
    
    fields.forEach(field => {
        const input = document.getElementById(`measure-${field.name}`);
        if (input && input.value) {
            measurements[field.name] = input.value;
        }
    });
    
    const order = {
        customerId: parseInt(customerId),
        orderDate: orderDate,
        deliveryDate: deliveryDate || null,
        items: [{
            type: selectedGarmentType,
            measurements: measurements
        }],
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    try {
        await addOrder(order);
        alert('✅ Order saved successfully!');
        showCustomerDetail(parseInt(customerId));
        updateStats();
        loadRecentCustomers();
    } catch (error) {
        alert('❌ Error saving order: ' + error);
    }
    
    return false;
}

async function loadOrderCustomersDropdown() {
    const customers = await getAllCustomers();
    const select = document.getElementById('order-customer-select');
    
    if (!select) return;
    
    select.innerHTML = '<option value="">Select Costumer...</option>';
    
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.name;
        select.appendChild(option);
    });
}

function setOrderTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    const orderDateInput = document.getElementById('order-date-input');
    if (orderDateInput) {
        orderDateInput.value = today;
    }
}

// Update createNewOrder function
function createNewOrder() {
    closePlusMenu();
    selectedGarmentType = null;
    document.getElementById('measurements-section').style.display = 'none';
    document.getElementById('new-order-form').reset();
    document.querySelectorAll('.garment-button').forEach(btn => {
        btn.classList.remove('active');
    });
    showScreen('screen-new-order');
    setOrderTodayDate();
    loadOrderCustomersDropdown();
}
// ==================== ORDER DETAIL/EDIT SCREEN ====================

let currentEditOrderId = null;

// Garment icons mapping
const garmentIcons = {
    jacket: `<svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3">
            <path d="M6 10L18 4H30L42 10L40 35H34V44H24H14V35H8L6 10Z"/>
            <path d="M14 35L14 20"/>
            <path d="M34 35V20"/>
            <path d="M24 10C27.3137 10 30 7.31371 30 4H18C18 7.31371 20.6863 10 24 10Z"/>
        </g>
    </svg>`,
    pants: `<svg width="40" height="40" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="m223.88 214l-22-176A16 16 0 0 0 186 24H70a16 16 0 0 0-15.88 14l-22 176A16 16 0 0 0 48 232h40.69a16 16 0 0 0 15.51-12.06l23.8-92l23.79 91.94A16 16 0 0 0 167.31 232H208a16 16 0 0 0 15.88-18M192.9 95.2A32.13 32.13 0 0 1 169 72h21ZM186 40l2 16H68l2-16ZM66 72h21a32.13 32.13 0 0 1-23.9 23.2Zm22.69 144H48l13-104.27A48.08 48.08 0 0 0 103.32 72H120v23Zm78.6-.06L136 95V72h16.68A48.08 48.08 0 0 0 195 111.73L208 216Z"/>
    </svg>`,
    shirt: `<svg width="40" height="40" viewBox="0 0 2048 2048" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="m2048 384l-128 512h-256v1024H384V896H128L0 384l768-256q0 53 20 99t55 82t81 55t100 20q53 0 99-20t82-55t55-81t20-100zm-153 84l-524-175q-24 50-60 90t-82 69t-97 44t-108 16q-56 0-108-15t-97-44t-81-69t-61-91L153 468l75 300h284v1024h1024V768h284z"/>
    </svg>`
};

async function showOrderDetail(orderId) {
    currentEditOrderId = orderId;
    const order = await getOrder(orderId);
    const customer = await getCustomer(order.customerId);
    
    if (!order || !customer) {
        alert('Order not found!');
        return;
    }
    
    // Set customer name (READ-ONLY)
    document.getElementById('order-customer-name').textContent = customer.name;
    
    // Set order date (READ-ONLY)
    const orderDate = new Date(order.orderDate);
    document.getElementById('order-date-display').textContent = formatDate(order.orderDate);
    
    // Set delivery date (EDITABLE)
    const deliveryInput = document.getElementById('order-delivery-date-edit');
    if (order.deliveryDate) {
        deliveryInput.value = order.deliveryDate;
    }
    
    // Set garment type with icon (READ-ONLY)
    const garmentType = order.items[0].type;
    const garmentDisplay = document.getElementById('order-garment-display');
    const garmentText = garmentType.charAt(0).toUpperCase() + garmentType.slice(1);
    garmentDisplay.innerHTML = garmentIcons[garmentType] + `<span>${garmentText}</span>`;
    garmentDisplay.setAttribute('data-garment', garmentType);

garmentDisplay.setAttribute('data-garment', garmentType);
    
    // Set status checkbox
    document.getElementById('order-completed-checkbox').checked = order.completed || false;
    
    // Load measurements
    loadOrderMeasurements(garmentType, order.items[0].measurements || {});
    
    // Show screen
    showScreen('screen-order-detail');
}

function loadOrderMeasurements(garmentType, existingMeasurements) {
    const container = document.getElementById('order-measurements-container');
    const fields = garmentMeasurements[garmentType];
    
    if (!fields) return;
    
    container.innerHTML = fields.map(field => {
        const value = existingMeasurements[field.name] || '';
        return `
            <div class="order-measurement-field">
                <label for="edit-measure-${field.name}">${field.label}</label>
                ${field.type === 'textarea' 
                    ? `<textarea id="edit-measure-${field.name}" placeholder="[......]">${value}</textarea>`
                    : `<input type="${field.type}" id="edit-measure-${field.name}" value="${value}" placeholder="[......]" ${field.type === 'number' ? 'step="0.1"' : ''}>`
                }
            </div>
        `;
    }).join('');
}

async function handleOrderUpdate(e) {
    e.preventDefault();
    
    if (!currentEditOrderId) {
        alert('❌ No order selected');
        return;
    }
    
    const order = await getOrder(currentEditOrderId);
    if (!order) {
        alert('❌ Order not found');
        return;
    }
    
    // Update delivery date
    const deliveryDate = document.getElementById('order-delivery-date-edit').value;
    order.deliveryDate = deliveryDate || null;
    
    // Update completed status
    order.completed = document.getElementById('order-completed-checkbox').checked;
    
    // Update measurements
    const garmentType = order.items[0].type;
    const fields = garmentMeasurements[garmentType];
    const measurements = {};
    
    fields.forEach(field => {
        const input = document.getElementById(`edit-measure-${field.name}`);
        if (input && input.value) {
            measurements[field.name] = input.value;
        }
    });
    
    order.items[0].measurements = measurements;
    
    try {
        await updateOrder(currentEditOrderId, order);
        alert('✅ Order updated successfully!');
        showCustomerDetail(order.customerId);
        updateStats();
        loadRecentCustomers();
    } catch (error) {
        alert('❌ Error updating order: ' + error);
    }
    
    return false;
}

async function confirmDeleteOrder() {
    if (!currentEditOrderId) {
        alert('❌ No order selected');
        return;
    }
    
    if (confirm('⚠️ Are you sure you want to delete this order? This cannot be undone!')) {
        const order = await getOrder(currentEditOrderId);
        const customerId = order.customerId;
        
        try {
            await deleteOrder(currentEditOrderId);
            alert('✅ Order deleted successfully!');
            showCustomerDetail(customerId);
            updateStats();
            loadRecentCustomers();
        } catch (error) {
            alert('❌ Error deleting order: ' + error);
        }
    }
}

// Update the editOrder function that's called from Customer Detail screen
async function editOrder(orderId) {
    showOrderDetail(orderId);
}

// Update db.js to include updateOrder function
async function updateOrder(orderId, orderData) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['orders'], 'readwrite');
        const store = transaction.objectStore('orders');
        
        orderData.id = orderId;
        const request = store.put(orderData);
        
        request.onsuccess = () => resolve(orderId);
        request.onerror = () => reject(request.error);
    });
}

async function getOrder(orderId) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['orders'], 'readonly');
        const store = transaction.objectStore('orders');
        const request = store.get(orderId);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}
// Add this function to app.js
async function displayRecentCustomers() {
    const orders = await getAllOrders();
    const customers = await getAllCustomers();
    const container = document.getElementById('recent-customers-list');
    
    if (!container) return;
    
    // Get unique customers with orders
    const customerOrderMap = {};
    
    orders.forEach(order => {
        if (!customerOrderMap[order.customerId]) {
            customerOrderMap[order.customerId] = [];
        }
        customerOrderMap[order.customerId].push(order);
    });
    
    // Sort by most recent order
    const recentCustomers = Object.keys(customerOrderMap)
        .map(id => ({
            customer: customers.find(c => c.id === parseInt(id)),
            orders: customerOrderMap[id]
        }))
        .filter(item => item.customer)
        .sort((a, b) => {
            const lastA = new Date(a.orders[a.orders.length - 1].createdAt);
            const lastB = new Date(b.orders[b.orders.length - 1].createdAt);
            return lastB - lastA;
        })
        .slice(0, 5);
    
    // Garment icons
    const garmentIcons = {
        jacket: `<svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 5px;">
            <g stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="3">
                <path d="M6 10L18 4H30L42 10L40 35H34V44H24H14V35H8L6 10Z"/>
                <path d="M14 35L14 20"/>
                <path d="M34 35V20"/>
                <path d="M24 10C27.3137 10 30 7.31371 30 4H18C18 7.31371 20.6863 10 24 10Z"/>
            </g>
        </svg>`,
        pants: `<svg width="20" height="20" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 5px;">
            <path fill="white" d="m223.88 214l-22-176A16 16 0 0 0 186 24H70a16 16 0 0 0-15.88 14l-22 176A16 16 0 0 0 48 232h40.69a16 16 0 0 0 15.51-12.06l23.8-92l23.79 91.94A16 16 0 0 0 167.31 232H208a16 16 0 0 0 15.88-18M192.9 95.2A32.13 32.13 0 0 1 169 72h21ZM186 40l2 16H68l2-16ZM66 72h21a32.13 32.13 0 0 1-23.9 23.2Zm22.69 144H48l13-104.27A48.08 48.08 0 0 0 103.32 72H120v23Zm78.6-.06L136 95V72h16.68A48.08 48.08 0 0 0 195 111.73L208 216Z"/>
        </svg>`,
        shirt: `<svg width="20" height="20" viewBox="0 0 2048 2048" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle; margin-right: 5px;">
            <path fill="white" d="m2048 384l-128 512h-256v1024H384V896H128L0 384l768-256q0 53 20 99t55 82t81 55t100 20q53 0 99-20t82-55t55-81t20-100zm-153 84l-524-175q-24 50-60 90t-82 69t-97 44t-108 16q-56 0-108-15t-97-44t-81-69t-61-91L153 468l75 300h284v1024h1024V768h284z"/>
        </svg>`
    };
    
    container.innerHTML = recentCustomers.map(item => {
        const lastOrder = item.orders[item.orders.length - 1];
        const garmentType = lastOrder.items[0].type;
        const garmentText = garmentType.charAt(0).toUpperCase() + garmentType.slice(1);
        const icon = garmentIcons[garmentType] || garmentIcons.jacket;
        
        return `
            <div class="customer-card glass-card-customer" onclick="showCustomerDetail(${item.customer.id})">
                <div class="customer-info">
                    <div class="customer-name">${item.customer.name}</div>
                    <div class="customer-garment">${icon}${garmentText}</div>
                    <div class="customer-status">
                        <span class="status-badge ${lastOrder.completed ? 'status-completed' : 'status-progress'}">
                            ${lastOrder.completed ? 'Completed' : 'In Progress'}
                        </span>
                    </div>
                </div>
                <div class="customer-arrow">→</div>
            </div>
        `;
    }).join('');
}