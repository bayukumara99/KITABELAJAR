(() => {
    const accountKey = 'kitaBelajarAccount';
    const purchaseKey = 'kitaBelajarPurchased';
    const readAccount = () => {
        try { return JSON.parse(localStorage.getItem(accountKey)); } catch (error) { return null; }
    };
    const readPurchases = () => {
        try { return JSON.parse(localStorage.getItem(purchaseKey) || '[]'); } catch (error) { return []; }
    };
    const currentAccount = readAccount();
    const refreshLibraryLinks = () => {
        const account = readAccount();
        document.querySelectorAll('.nav-links').forEach(nav => {
            let link = nav.querySelector('.library-link');
            if (!link) {
                link = document.createElement('a');
                link.className = 'library-link';
                link.href = 'library.html';
                link.textContent = 'Library';
                nav.appendChild(link);
            }
            link.hidden = !account;
        });
    };
    refreshLibraryLinks();
    window.addEventListener('kitaBelajarAuthChange', refreshLibraryLinks);
    window.addEventListener('storage', refreshLibraryLinks);
    if (!document.body.classList.contains('library-page')) return;
    if (!currentAccount) {
        document.querySelector('#libraryLocked').hidden = false;
        document.querySelector('#libraryContent').hidden = true;
        return;
    }
    const accountName = currentAccount.name || currentAccount.email;
    document.querySelector('#libraryAccountName').textContent = accountName.split(' ')[0];
    document.querySelector('#libraryAccountAvatar').textContent = accountName.trim().charAt(0).toUpperCase();
    const purchases = readPurchases().filter(item => item.email === currentAccount.email && /guide|e-book|pdf|workbook/i.test(`${item.type || ''} ${item.format || ''}`));
    const list = document.querySelector('#libraryProducts');
    if (!purchases.length) {
        list.innerHTML = '<p class="library-empty">Belum ada paket soal yang dibeli. Pilih produk untuk mulai membangun library-mu.</p>';
        return;
    }
    list.innerHTML = purchases.map(product => `<article class="library-card"><div><span class="library-type">${product.type}</span><h2>${product.title}</h2><p>${product.description}</p></div><a class="library-start" href="tes.html?product=${encodeURIComponent(JSON.stringify(product))}">Mulai tes</a></article>`).join('');
})();
