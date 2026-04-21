document.addEventListener('DOMContentLoaded', () => {
    // State management
    let state = {
        items: [],
        currentStatus: 'all',
        category: 'all',
        search: ''
    };
    let searchTimer;

    // DOM Elements
    const container = document.getElementById('grocery-container');
    const addBtn = document.getElementById('add-btn');
    const modal = document.getElementById('item-modal');
    const form = document.getElementById('item-form');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.cancel-modal');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const statusTabs = document.querySelectorAll('.tab');

    // API Helpers
    const getCookie = (name) => {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    };

    const apiFetch = async (url, options = {}) => {
        const csrfToken = getCookie('csrftoken');
        const headers = { 'Content-Type': 'application/json' };
        if (csrfToken && options.method && options.method !== 'GET') {
            headers['X-CSRFToken'] = csrfToken;
        }
        
        const response = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Something went wrong');
        }
        return response.json();
    };

    // Core Logic
    const loadItems = async () => {
        console.log("Loading items...");
        container.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';
        try {
            const params = new URLSearchParams({
                q: state.search,
                category: state.category,
                status: state.currentStatus
            });
            const data = await apiFetch(`/api/items/?${params.toString()}`);
            console.log("Items received:", data.items);
            state.items = data.items;
            renderItems();
        } catch (error) {
            console.error("Load error:", error);
            container.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    };

    const renderItems = () => {
        if (state.items.length === 0) {
            container.innerHTML = ''; // Blank state as requested
            return;
        }

        container.innerHTML = state.items.map(item => `
            <div class="item-card ${item.status ? 'purchased' : ''}" data-id="${item.id}">
                <div class="card-header">
                    <span class="category-tag">${item.category_display}</span>
                    <div class="item-actions">
                        <button class="action-btn toggle-status" title="${item.status ? 'Mark as Pending' : 'Mark as Purchased'}">
                            <i class="fas ${item.status ? 'fa-check-circle' : 'fa-circle'}"></i>
                        </button>
                        <button class="action-btn edit-item" title="Edit Item">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-item delete" title="Delete Item">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p class="notes">${item.notes || ''}</p>
                </div>
                <div class="item-meta">
                    <div class="qty-controls">
                        <button class="qty-btn qty-minus"><i class="fas fa-minus"></i></button>
                        <span class="qty-val">${item.quantity}</span>
                        <span class="unit-label">${item.unit_display}</span>
                        <button class="qty-btn qty-plus"><i class="fas fa-plus"></i></button>
                    </div>
                    <span class="date">${item.created_at}</span>
                </div>
            </div>
        `).join('');

        // Re-attach event listeners
        attachItemListeners();
    };

    const attachItemListeners = () => {
        document.querySelectorAll('.qty-plus').forEach(btn => {
            btn.onclick = async (e) => {
                const id = e.target.closest('.item-card').dataset.id;
                const item = state.items.find(i => i.id == id);
                await updateQuantity(id, parseFloat(item.quantity) + 1);
            };
        });

        document.querySelectorAll('.qty-minus').forEach(btn => {
            btn.onclick = async (e) => {
                const id = e.target.closest('.item-card').dataset.id;
                const item = state.items.find(i => i.id == id);
                if (parseFloat(item.quantity) > 1) {
                    await updateQuantity(id, parseFloat(item.quantity) - 1);
                }
            };
        });

        const updateQuantity = async (id, newQty) => {
            const item = state.items.find(i => i.id == id);
            const data = { ...item, quantity: newQty };
            try {
                await apiFetch(`/api/items/${id}/update/`, {
                    method: 'PUT',
                    body: JSON.stringify(data)
                });
                loadItems();
            } catch (error) { alert(error.message); }
        };

        document.querySelectorAll('.toggle-status').forEach(btn => {
            btn.onclick = async (e) => {
                const id = e.target.closest('.item-card').dataset.id;
                try {
                    await apiFetch(`/api/items/${id}/toggle/`, { method: 'PATCH' });
                    loadItems();
                } catch (error) { alert(error.message); }
            };
        });

        document.querySelectorAll('.delete-item').forEach(btn => {
            btn.onclick = async (e) => {
                if (!confirm('Are you sure you want to delete this item?')) return;
                const id = e.target.closest('.item-card').dataset.id;
                try {
                    await apiFetch(`/api/items/${id}/delete/`, { method: 'DELETE' });
                    loadItems();
                } catch (error) { alert(error.message); }
            };
        });

        document.querySelectorAll('.edit-item').forEach(btn => {
            btn.onclick = (e) => {
                const id = e.target.closest('.item-card').dataset.id;
                const item = state.items.find(i => i.id == id);
                openModal(item);
            };
        });
    };

    // Modal Logic
    const openModal = (item = null) => {
        const title = document.getElementById('modal-title');
        const idField = document.getElementById('item-id');
        const nameField = document.getElementById('item-name');
        const qtyField = document.getElementById('item-quantity');
        const unitField = document.getElementById('item-unit');
        const catField = document.getElementById('item-category');
        const notesField = document.getElementById('item-notes');

        if (item) {
            title.textContent = 'Edit Item';
            idField.value = item.id;
            nameField.value = item.name;
            qtyField.value = item.quantity;
            unitField.value = item.unit;
            catField.value = item.category;
            notesField.value = item.notes;
        } else {
            title.textContent = 'Add New Item';
            form.reset();
            idField.value = '';
        }
        modal.style.display = 'block';
    };

    const closeModal = () => {
        modal.style.display = 'none';
        form.reset();
    };

    // Event Listeners
    addBtn.onclick = () => openModal();
    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;
    window.onclick = (e) => { 
        if (e.target == modal) closeModal(); 
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('item-id').value;
        const formData = {
            name: document.getElementById('item-name').value,
            quantity: parseFloat(document.getElementById('item-quantity').value),
            unit: document.getElementById('item-unit').value,
            category: document.getElementById('item-category').value,
            notes: document.getElementById('item-notes').value
        };

        try {
            const url = id ? `/api/items/${id}/update/` : '/api/items/add/';
            const method = id ? 'PUT' : 'POST';
            await apiFetch(url, {
                method: method,
                body: JSON.stringify(formData)
            });
            closeModal();
            loadItems();
        } catch (error) {
            alert(error.message);
        }
    };

    // Filter Logic
    searchInput.oninput = (e) => {
        state.search = e.target.value;
        // Simple debounce
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => loadItems(), 300);
    };

    categoryFilter.onchange = (e) => {
        state.category = e.target.value;
        loadItems();
    };

    statusTabs.forEach(tab => {
        tab.onclick = () => {
            statusTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.currentStatus = tab.dataset.status;
            loadItems();
        };
    });

    // Initial load
    loadItems();
});
