(() => {
    const readAccount = () => { try { return JSON.parse(localStorage.getItem('kitaBelajarAccount')); } catch (error) { return null; } };
    const productOverridesKey = 'kitaBelajarProductOverrides';
    const customProductsKey = 'kitaBelajarCustomProducts';
    const deletedProductsKey = 'kitaBelajarDeletedProducts';
    const questionOverridesKey = 'kitaBelajarQuestionOverrides';
    const read = key => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch (error) { return {}; } };
    const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
    const readProducts = () => { const overrides = read(productOverridesKey); const custom = read(customProductsKey); const deleted = read(deletedProductsKey); const base = productSeeds.map(([id, title, description, price]) => ({ id, title, description, price, target: id.includes('utbk') ? 'utbk' : id.includes('casn') ? 'casn' : id.includes('bumn') ? 'bumn' : 'general' })); return [...base, ...Object.values(custom)].filter(product => !deleted[product.id]).map(product => ({ ...product, ...(overrides[product.id] || {}) })); };
    const teacherNavLink = document.querySelector('.teacher-nav-link');
    if (document.body.classList.contains('teacher-page') && readAccount()?.role !== 'teacher') {
        if (teacherNavLink) teacherNavLink.hidden = true;
        document.querySelector('#teacherWorkspace').hidden = true;
        document.querySelector('#teacherAccessDenied').hidden = false;
        return;
    }
    if (teacherNavLink) teacherNavLink.hidden = false;
    const productCards = [...document.querySelectorAll('.product[data-product-id]')];
    const productSeeds = [
        ['utbk-tps', 'UTBK TPS Intensif', 'Latihan penalaran dan literasi untuk UTBK.', 59000],
        ['utbk-kuantitatif', 'UTBK Kuantitatif', 'Drill soal kuantitatif dengan pembahasan.', 65000],
        ['casn-skd', 'CASN SKD Lengkap', 'TWK, TIU, dan TKP dalam satu latihan.', 69000],
        ['casn-tiu', 'CASN TIU Mastery', 'Fokus numerik, verbal, dan figural.', 55000],
        ['bumn-tkd', 'BUMN TKD Practice', 'Latihan kemampuan dasar untuk seleksi BUMN.', 69000],
        ['bumn-akhlak', 'BUMN AKHLAK & Core Values', 'Persiapan nilai dan budaya kerja BUMN.', 49000],
        ['paket-utbk', 'Paket Lolos UTBK', 'Kumpulan latihan UTBK paling lengkap.', 109000],
        ['paket-casn', 'Paket Siap CASN', 'Bank soal SKD untuk latihan terarah.', 119000],
        ['paket-bumn', 'Paket Siap BUMN', 'TKD dan AKHLAK untuk persiapan menyeluruh.', 109000],
        ['paket-lengkap', 'Paket Lengkap 3 Target', 'UTBK, CASN, dan BUMN dalam satu paket.', 249000],
        ['tiny-habits', 'Tiny Habit Tracker', 'Konsisten lewat langkah kecil.', 35000],
        ['calm-morning', 'Calm Morning Kit', 'Mulai hari tanpa terburu-buru.', 39000],
        ['study-notes', 'Study Notes Pack', 'Catatan rapi untuk belajar aktif.', 45000],
        ['weekly-reset', 'Weekly Reset Planner', 'Ritual mingguan yang lebih tenang.', 49000],
        ['daily-journal', 'Daily Reflection Journal', 'Menutup hari dengan lebih sadar.', 55000],
        ['simple-money-map', 'Simple Money Map', 'Uangmu, lebih mudah dipahami.', 59000],
        ['content-sprint', 'Content Sprint Kit', 'Ide jadi karya dalam 7 hari.', 69000],
        ['focus-without-force', 'Focus Without Force', 'Memahami energi, bukan melawannya.', 79000],
        ['freelance-starter', 'Freelance Starter Kit', 'Kerja mandiri lebih terarah.', 89000],
        ['deep-work-system', 'Deep Work System', 'Fokus panjang tanpa drama.', 99000],
        ['mindful-money', 'Mindful Money Bundle', 'Keuangan dan kebiasaan dalam satu ruang.', 119000],
        ['gentle-bundle', 'The Gentle Bundle', 'Tiga tools untuk mulai lagi.', 129000],
        ['learn-better', 'Learn Better Bundle', 'Sistem belajar dari awal sampai review.', 139000],
        ['creator-launch', 'Creator Launch Bundle', 'Mulai proyek kreatifmu.', 149000],
        ['yearly-vault', 'Yearly Growth Vault', 'Ruang lengkap untuk satu tahun bertumbuh.', 179000]
    ];
    const applyProduct = (id, data) => {
        const card = document.querySelector(`.product[data-product-id="${id}"]`);
        if (!card) return;
        const title = card.querySelector('h2, h3');
        const description = card.querySelector('.product-info p');
        const price = card.querySelector('.price');
        if (title && data.title) title.textContent = data.title;
        if (description && data.description) description.textContent = data.description;
        if (price && data.price) price.textContent = `Rp${Number(data.price).toLocaleString('id-ID')}`;
    };
    const applyProductOverrides = () => Object.entries(read(productOverridesKey)).forEach(([id, data]) => applyProduct(id, data));
    applyProductOverrides();

    const modal = document.createElement('div');
    modal.className = 'teacher-editor-modal';
    modal.innerHTML = `<div class="teacher-editor-panel"><button class="teacher-editor-close" type="button" aria-label="Tutup editor">×</button><div class="eyebrow">Teacher workspace</div><h2 id="teacherEditorTitle">Edit produk</h2><div id="teacherEditorContent"></div></div>`;
    document.body.appendChild(modal);
    const content = modal.querySelector('#teacherEditorContent');
    const close = () => modal.classList.remove('open');
    modal.querySelector('.teacher-editor-close').addEventListener('click', close);
    modal.addEventListener('click', event => { if (event.target === modal) close(); });

    const renderProductEditor = () => {
        modal.querySelector('#teacherEditorTitle').textContent = 'Edit produk';
        const overrides = read(productOverridesKey);
        const productList = productCards.length ? productCards.map(card => {
            const id = card.dataset.productId;
            const saved = overrides[id] || {};
            const title = card.querySelector('h2, h3')?.textContent || '';
            const description = card.querySelector('.product-info p')?.textContent || '';
            const price = (card.querySelector('.price')?.textContent || '').replace(/[^0-9]/g, '');
            return { id, title, description, price, saved };
        }) : readProducts();
        content.innerHTML = `<form class="teacher-edit-form teacher-create-form" id="createProductForm"><h3>Produk baru</h3><label>Nama produk<input name="title" required></label><label>Deskripsi<input name="description" required></label><label>Harga<input name="price" type="number" min="0" required></label><label>Target<select name="target"><option value="general">Umum</option><option value="utbk">UTBK</option><option value="casn">CASN</option><option value="bumn">BUMN</option></select></label><button class="teacher-save" type="submit">Buat produk</button></form>${productList.map(({ id, title, description, price, saved }) => `<form class="teacher-edit-form" data-product-form="${id}"><h3>${title}</h3><label>Nama produk<input name="title" value="${saved?.title || title}" required></label><label>Deskripsi<input name="description" value="${saved?.description || description}" required></label><label>Harga<input name="price" type="number" min="0" value="${saved?.price || price}" required></label><button class="teacher-save" type="submit">Simpan perubahan</button><button class="teacher-delete" type="button" data-delete-product="${id}">Hapus produk</button></form>`).join('')}`;
        content.querySelector('#createProductForm').addEventListener('submit', event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); const id = `custom-${Date.now()}`; const custom = read(customProductsKey); custom[id] = { id, title: data.title, description: data.description, price: Number(data.price), target: data.target, type: `Guide / ${data.target.toUpperCase()}`, art: data.title, color: 'visual-green' }; write(customProductsKey, custom); renderProductEditor(); });
        content.querySelectorAll('[data-product-form]').forEach(form => form.addEventListener('submit', event => {
            event.preventDefault();
            const data = Object.fromEntries(new FormData(form));
            const overrides = read(productOverridesKey);
            overrides[form.dataset.productForm] = { title: data.title, description: data.description, price: Number(data.price) };
            write(productOverridesKey, overrides);
            applyProduct(form.dataset.productForm, overrides[form.dataset.productForm]);
            form.querySelector('.teacher-save').textContent = 'Tersimpan';
        }));
        content.querySelectorAll('[data-delete-product]').forEach(button => button.addEventListener('click', () => { const deleted = read(deletedProductsKey); deleted[button.dataset.deleteProduct] = true; write(deletedProductsKey, deleted); renderProductEditor(); }));
    };

    const questionSeeds = {
        utbk: [
            ['Manakah strategi paling tepat saat menemukan soal yang sulit?', ['Menghabiskan seluruh waktu pada soal tersebut', 'Menandai soal lalu melanjutkan ke soal berikutnya', 'Menebak semua jawaban sejak awal', 'Mengosongkan seluruh lembar jawaban'], 1],
            ['Jika semua A adalah B dan sebagian B adalah C, kesimpulan yang tepat adalah...', ['Semua A pasti C', 'Sebagian A pasti C', 'Belum tentu ada A yang C', 'Tidak ada A yang B'], 2],
            ['Antonim kata ekspansif adalah...', ['Meluaskan', 'Terbuka', 'Menyempit', 'Bertambah'], 2],
            ['Nilai 20% dari 250 adalah...', ['25', '40', '50', '75'], 2],
            ['Dalam membaca cepat, langkah pertama yang efektif adalah...', ['Membaca setiap kata dua kali', 'Melihat struktur dan gagasan utama', 'Menghafalkan seluruh paragraf', 'Melewati judul bacaan'], 1]
        ],
        casn: [
            ['Nilai dasar ASN yang menekankan tanggung jawab dan kejujuran adalah...', ['Akuntabel', 'Kompeten', 'Harmonis', 'Adaptif'], 0],
            ['Jika 5 pekerja menyelesaikan tugas dalam 12 hari, dengan kemampuan sama 10 pekerja menyelesaikannya dalam...', ['3 hari', '6 hari', '12 hari', '24 hari'], 1],
            ['Lawan kata konkret adalah...', ['Nyata', 'Jelas', 'Abstrak', 'Terukur'], 2],
            ['Sikap terbaik saat menerima kritik dalam pekerjaan adalah...', ['Menolak langsung', 'Mendengarkan dan mengevaluasi', 'Menyalahkan rekan', 'Mengabaikannya'], 1],
            ['Deret 3, 6, 12, 24, ... dilanjutkan dengan...', ['30', '36', '48', '60'], 2]
        ],
        bumn: [
            ['Dalam budaya kerja, integritas berarti...', ['Bekerja hanya saat diawasi', 'Konsisten antara perkataan dan tindakan', 'Mengutamakan hasil dengan cara apa pun', 'Menghindari tanggung jawab'], 1],
            ['Prioritas utama ketika menghadapi pelanggan yang kecewa adalah...', ['Membantah keluhan', 'Mendengarkan dan mencari solusi', 'Mengalihkan ke pelanggan lain', 'Menutup percakapan'], 1],
            ['Contoh perilaku kolaboratif adalah...', ['Menyimpan semua informasi', 'Membagikan informasi yang dibutuhkan tim', 'Mengambil kredit sendiri', 'Menghindari koordinasi'], 1],
            ['Jika target penjualan naik dari 80 menjadi 100, kenaikannya adalah...', ['20%', '25%', '40%', '80%'], 1],
            ['Keputusan profesional sebaiknya didasarkan pada...', ['Rumor', 'Data dan pertimbangan yang relevan', 'Tekanan sesaat', 'Preferensi pribadi saja'], 1]
        ],
        general: [
            ['Tujuan utama mengerjakan tes latihan adalah...', ['Mengukur dan memperbaiki kesiapan', 'Menghindari semua kesalahan', 'Menghafal posisi jawaban', 'Menyelesaikan tanpa membaca'], 0],
            ['Saat waktu terbatas, strategi yang baik adalah...', ['Mengatur prioritas soal', 'Berhenti di soal pertama', 'Tidak membaca pertanyaan', 'Menjawab secara acak'], 0],
            ['Pembahasan soal berguna untuk...', ['Mengetahui pola kesalahan', 'Menghapus nilai', 'Mengganti semua jawaban', 'Mengurangi waktu belajar'], 0],
            ['Kebiasaan belajar yang efektif adalah...', ['Belajar rutin dan meninjau hasil', 'Menunda sampai hari terakhir', 'Tidak mencatat kesalahan', 'Hanya membaca judul'], 0],
            ['Setelah tes selesai, langkah berikutnya adalah...', ['Mengevaluasi hasil dan menentukan fokus', 'Langsung mengulang tanpa evaluasi', 'Menghapus hasil', 'Berhenti berlatih'], 0]
        ]
    };
    const renderQuestionEditor = () => {
        modal.querySelector('#teacherEditorTitle').textContent = 'Edit soal per produk';
        const products = readProducts();
        const selectedProduct = content.querySelector('#questionProduct')?.value || products[0]?.id;
        const number = Number(content.querySelector('#questionNumber')?.value || 1);
        const product = products.find(item => item.id === selectedProduct) || products[0];
        if (!product) { content.innerHTML = '<p class="teacher-empty">Buat produk terlebih dahulu untuk menambahkan soal.</p>'; return; }
        const target = product.target || 'general';
        const overrides = read(questionOverridesKey);
        const productQuestions = Array.isArray(overrides[product.id]) ? overrides[product.id] : [];
        const question = productQuestions[number - 1] || questionSeeds[target][number - 1];
        content.innerHTML = `<div class="teacher-question-picker"><label>Produk<select id="questionProduct">${products.map(item => `<option value="${item.id}">${item.title}</option>`).join('')}</select></label><label>Nomor soal<input id="questionNumber" type="number" min="1" max="5" value="${number}"></label><button id="loadQuestion" class="teacher-tool-button" type="button">Muat soal</button></div><form id="questionForm" class="teacher-edit-form"><label>Pertanyaan<textarea name="prompt" required>${question[0]}</textarea></label>${question[1].map((option, index) => `<label>Pilihan ${index + 1}<input name="option${index}" value="${option}" required></label>`).join('')}<label>Jawaban benar<select name="correct">${question[1].map((_, index) => `<option value="${index}" ${question[2] === index ? 'selected' : ''}>Pilihan ${index + 1}</option>`).join('')}</select></label><button class="teacher-save" type="submit">Simpan perubahan</button></form>`;
        content.querySelector('#questionProduct').value = selectedProduct;
        content.querySelector('#loadQuestion').addEventListener('click', renderQuestionEditor);
        content.querySelector('#questionForm').addEventListener('submit', event => { event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget)); const updated = [data.prompt, [data.option0, data.option1, data.option2, data.option3], Number(data.correct)]; const saved = read(questionOverridesKey); const questions = Array.isArray(saved[product.id]) ? saved[product.id] : []; questions[number - 1] = updated; saved[product.id] = questions; write(questionOverridesKey, saved); event.currentTarget.querySelector('.teacher-save').textContent = 'Tersimpan'; });
    };

    const openEditor = type => { modal.classList.add('open'); type === 'question' ? renderQuestionEditor() : renderProductEditor(); };
    const tools = document.querySelector('#teacherTools') || document.querySelector('#teacherPageTools');
    const updateTeacherTools = () => { if (tools) tools.hidden = readAccount()?.role !== 'teacher'; };
    if (tools) {
        document.querySelector('#openProductEditor')?.addEventListener('click', () => openEditor('product'));
        document.querySelector('#openQuestionEditor')?.addEventListener('click', () => openEditor('question'));
        updateTeacherTools();
        window.addEventListener('kitaBelajarAuthChange', updateTeacherTools);
        window.addEventListener('storage', updateTeacherTools);
    }
})();
