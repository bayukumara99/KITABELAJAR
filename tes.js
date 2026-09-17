(() => {
    const quizQuestions = {
        utbk: [
            ['Manakah strategi paling tepat saat menemukan soal yang sulit?', ['Menghabiskan seluruh waktu pada soal tersebut', 'Menandai soal lalu melanjutkan ke soal berikutnya', 'Menebak semua jawaban sejak awal', 'Mengosongkan seluruh lembar jawaban'], 1],
            ['Jika semua A adalah B dan sebagian B adalah C, kesimpulan yang tepat adalah...', ['Semua A pasti C', 'Sebagian A pasti C', 'Belum tentu ada A yang C', 'Tidak ada A yang B'], 2],
            ['Antonim kata “ekspansif” adalah...', ['Meluaskan', 'Terbuka', 'Menyempit', 'Bertambah'], 2],
            ['Nilai 20% dari 250 adalah...', ['25', '40', '50', '75'], 2],
            ['Dalam membaca cepat, langkah pertama yang efektif adalah...', ['Membaca setiap kata dua kali', 'Melihat struktur dan gagasan utama', 'Menghafalkan seluruh paragraf', 'Melewati judul bacaan'], 1]
        ],
        casn: [
            ['Nilai dasar ASN yang menekankan tanggung jawab dan kejujuran adalah...', ['Akuntabel', 'Kompeten', 'Harmonis', 'Adaptif'], 0],
            ['Jika 5 pekerja menyelesaikan tugas dalam 12 hari, dengan kemampuan sama 10 pekerja menyelesaikannya dalam...', ['3 hari', '6 hari', '12 hari', '24 hari'], 1],
            ['Lawan kata “konkret” adalah...', ['Nyata', 'Jelas', 'Abstrak', 'Terukur'], 2],
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

    const quizState = { questions: [], current: 0, answers: [], seconds: 600, timer: null, product: null };
    const getTarget = product => {
        const text = `${product.title || ''} ${product.type || ''}`.toLowerCase();
        if (text.includes('utbk')) return 'utbk';
        if (text.includes('casn')) return 'casn';
        if (text.includes('bumn')) return 'bumn';
        return 'general';
    };
    const isTestProduct = product => /guide|e-book|pdf|workbook/i.test(`${product.type || ''} ${product.format || ''}`);
    const ensureModal = () => {
        if (document.querySelector('#quizModal')) return;
        document.body.insertAdjacentHTML('beforeend', `<div class="quiz-modal" id="quizModal" role="dialog" aria-modal="true" aria-labelledby="quizTitle"><div class="quiz-panel"><button class="quiz-close" id="quizClose" type="button" aria-label="Tutup tes">×</button><div class="quiz-top"><div><div class="eyebrow">Tes interaktif</div><h2 id="quizTitle"></h2></div><strong class="quiz-timer" id="quizTimer">10:00</strong></div><div class="quiz-progress"><span id="quizProgress"></span></div><form id="quizForm"><div id="quizQuestion"></div><div class="quiz-actions"><button class="quiz-secondary" id="quizPrevious" type="button">Sebelumnya</button><button class="quiz-primary" id="quizNext" type="submit">Berikutnya</button></div></form><div class="quiz-result" id="quizResult" hidden></div></div></div>`);
        document.querySelector('#quizClose').addEventListener('click', closeQuiz);
        document.querySelector('#quizModal').addEventListener('click', event => { if (event.target.id === 'quizModal') closeQuiz(); });
        document.querySelector('#quizPrevious').addEventListener('click', () => { saveAnswer(); if (quizState.current > 0) { quizState.current -= 1; renderQuestion(); } });
        document.querySelector('#quizForm').addEventListener('submit', event => { event.preventDefault(); saveAnswer(); if (quizState.current === quizState.questions.length - 1) finishQuiz(); else { quizState.current += 1; renderQuestion(); } });
    };
    const formatTime = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    const saveAnswer = () => { const selected = document.querySelector('input[name="quizAnswer"]:checked'); if (selected) quizState.answers[quizState.current] = Number(selected.value); };
    const renderQuestion = () => {
        const question = quizState.questions[quizState.current];
        document.querySelector('#quizProgress').textContent = `Soal ${quizState.current + 1} dari ${quizState.questions.length}`;
        document.querySelector('#quizQuestion').innerHTML = `<p class="quiz-question">${question[0]}</p><div class="quiz-options">${question[1].map((option, index) => `<label><input type="radio" name="quizAnswer" value="${index}" ${quizState.answers[quizState.current] === index ? 'checked' : ''}><span>${option}</span></label>`).join('')}</div>`;
        document.querySelector('#quizPrevious').disabled = quizState.current === 0;
        document.querySelector('#quizNext').textContent = quizState.current === quizState.questions.length - 1 ? 'Selesai' : 'Berikutnya';
    };
    const finishQuiz = () => {
        clearInterval(quizState.timer);
        saveAnswer();
        const score = quizState.questions.reduce((total, question, index) => total + (quizState.answers[index] === question[2] ? 1 : 0), 0);
        document.querySelector('#quizForm').hidden = true;
        document.querySelector('#quizProgress').textContent = 'Tes selesai';
        document.querySelector('#quizResult').hidden = false;
        document.querySelector('#quizResult').innerHTML = `<div class="quiz-score">${score}/${quizState.questions.length}</div><h3>${score >= 4 ? 'Kesiapanmu terlihat kuat.' : 'Masih ada ruang untuk berkembang.'}</h3><p>Tinjau kembali materi dan ulangi tes untuk melihat progresmu.</p><button class="quiz-primary" id="quizRestart" type="button">Ulangi tes</button>`;
        document.querySelector('#quizRestart').addEventListener('click', () => startQuiz(quizState.product));
    };
    const closeQuiz = () => { clearInterval(quizState.timer); document.querySelector('#quizModal')?.classList.remove('open'); document.body.classList.remove('modal-open'); window.dispatchEvent(new Event('kitaBelajarQuizClosed')); };
    const startQuiz = product => {
        ensureModal();
        quizState.product = product;
        quizState.questions = quizQuestions[getTarget(product)];
        quizState.current = 0;
        quizState.answers = [];
        quizState.seconds = 600;
        document.querySelector('#quizTitle').textContent = product.title;
        document.querySelector('#quizTimer').textContent = formatTime(quizState.seconds);
        document.querySelector('#quizForm').hidden = false;
        document.querySelector('#quizResult').hidden = true;
        document.querySelector('#quizModal').classList.add('open');
        document.body.classList.add('modal-open');
        renderQuestion();
        clearInterval(quizState.timer);
        quizState.timer = setInterval(() => { quizState.seconds -= 1; document.querySelector('#quizTimer').textContent = formatTime(quizState.seconds); if (quizState.seconds <= 0) finishQuiz(); }, 1000);
    };
    window.KitaBelajarQuiz = { isTestProduct, startQuiz };
    if (document.body.classList.contains('test-page')) {
        const params = new URLSearchParams(window.location.search);
        let pageProduct = null;
        try { pageProduct = JSON.parse(params.get('product') || 'null'); } catch (error) { pageProduct = null; }
        const account = (() => { try { return JSON.parse(localStorage.getItem('kitaBelajarAccount')); } catch (error) { return null; } })();
        const purchases = (() => { try { return JSON.parse(localStorage.getItem('kitaBelajarPurchased') || '[]'); } catch (error) { return []; } })();
        const hasAccess = account && pageProduct && purchases.some(item => item.email === account.email && item.title === pageProduct.title);
        const locked = document.querySelector('#testLocked');
        if (hasAccess) startQuiz(pageProduct);
        else locked.hidden = false;
    }
})();
