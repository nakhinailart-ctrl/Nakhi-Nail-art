// --- JAVASCRIPT UNTUK LOADING SCREEN ---
window.addEventListener('load', function() {
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 2500);
});


// --- DATA KATALOG (4 ITEM) ---
const catalogs = [
    { 
        id: 1, name: "Manicure", price: 25000, 
        img: "https://i.imgur.com/4Qv4oGG.png"
    },
    { 
        id: 2, name: "Basic Nail Art", price: 35000, 
        img: "https://i.imgur.com/tB20O8x.png"
    },
    { 
        id: 3, name: "Medium Nail Art", price: 50000, 
        img: "https://i.imgur.com/SwwMXYG.jpeg"
    },
    { 
        id: 4, name: "Custom Nail Art", price: 100000, 
        img: "https://i.imgur.com/3gm6WtX.png"
    }
];

// --- CONFIG NOMOR & DATA BOOKING ---
const adminPhone = "62895704064660"; 
const bankAccountNumber = "081649488013";

const bookedSlots = {
    '2023-12-25': ['10:00', '14:00'] 
};
const timeOptions = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'];

// STATE
let selectedCatalog = null;
let selectedDate = null;
let selectedTime = null;

// ELEMENT REFERENCES
const modal = document.getElementById('paymentModal');
const transferDoneBtn = document.getElementById('transferDoneBtn');
const actionButtonsDiv = document.getElementById('actionButtons');

// RENDER CATALOG (Sama seperti sebelumnya)
const catalogContainer = document.getElementById('catalogList');
catalogs.forEach(item => {
    const div = document.createElement('div');
    div.className = 'catalog-card';
    div.onclick = () => selectCatalog(item.id, div);
    div.innerHTML = `
        <img src="${item.img}" class="catalog-img" alt="${item.name}">
        <h3>${item.name}</h3>
        <p class="price">Rp ${item.price.toLocaleString('id-ID')}</p>
    `;
    catalogContainer.appendChild(div);
});

function selectCatalog(id, el) {
    document.querySelectorAll('.catalog-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    selectedCatalog = catalogs.find(c => c.id === id);
    updateSummary();
}

// LOGIC TANGGAL & JAM (Sama seperti sebelumnya)
const dateInput = document.getElementById('datePicker');
dateInput.min = new Date().toISOString().split("T")[0];
dateInput.addEventListener('change', (e) => {
    selectedDate = e.target.value;
    renderTimes(selectedDate);
    selectedTime = null;
    updateSummary();
});

function renderTimes(date) {
    // ... (Logika render jam sama)
    const container = document.getElementById('timeSlotsContainer');
    container.innerHTML = '';
    const unavailable = bookedSlots[date] || [];

    timeOptions.forEach(time => {
        const btn = document.createElement('div');
        btn.className = 'time-slot';
        btn.innerText = time;
        
        if(unavailable.includes(time)) {
            btn.classList.add('disabled');
        } else {
            btn.onclick = () => {
                document.querySelectorAll('.time-slot').forEach(t => t.classList.remove('selected'));
                btn.classList.add('selected');
                selectedTime = time;
                updateSummary();
            }
        }
        container.appendChild(btn);
    });
}
function updateSummary() {
    const sumDiv = document.getElementById('orderSummary');
    const modalTotal = document.getElementById('modalTotal');
    
    if (!selectedCatalog) {
        sumDiv.innerHTML = "Pilih design kuku dulu ya.";
        modalTotal.innerText = "Rp 0";
        return;
    }
    
    let txt = `<strong>Design:</strong> ${selectedCatalog.name}<br>
               <strong>Harga:</strong> Rp ${selectedCatalog.price.toLocaleString('id-ID')}<br>`;
    
    if (selectedDate && selectedTime) {
        txt += `<strong>Jadwal:</strong> ${selectedDate} | ${selectedTime}`;
    } else if (selectedDate) {
        txt += `<strong>Tanggal:</strong> ${selectedDate} (Pilih Jam)`;
    }

    sumDiv.innerHTML = txt;
    modalTotal.innerText = `Rp ${selectedCatalog.price.toLocaleString('id-ID')}`;
}

// --- PAYMENT MODAL FUNCTIONS ---

window.openPaymentModal = function() {
    const name = document.getElementById('customerName').value;
    if (!selectedCatalog || !selectedDate || !selectedTime || name.trim() === "") {
        alert("Harap lengkapi pesanan (Design, Tanggal, Jam, Nama)!");
        return;
    }
    
    // Reset state modal: Tampilkan tombol transfer, sembunyikan tombol konfirmasi
    transferDoneBtn.style.display = 'block'; 
    actionButtonsDiv.style.display = 'none'; 

    modal.style.display = 'flex';
}

window.closeModal = function() {
    modal.style.display = 'none';
}

window.copyNumber = function() {
    navigator.clipboard.writeText(bankAccountNumber);
    alert("Nomor Seabank berhasil disalin: " + bankAccountNumber);
}

// 1. Simulasikan Transfer Selesai
window.markTransferDone = function() {
    transferDoneBtn.style.display = 'none'; // Sembunyikan tombol transfer
    actionButtonsDiv.style.display = 'block'; // Tampilkan tombol WA dan GCal
    alert("Transfer berhasil dikonfirmasi secara lokal! Silakan lanjutkan ke konfirmasi WhatsApp dan tambahkan ke kalender Anda.");
}

// 2. Konfirmasi Pembayaran via WA (Hanya bisa diklik setelah transferDone)
window.confirmPayment = function() {
    const name = document.getElementById('customerName').value;
    
    if (actionButtonsDiv.style.display === 'none') {
         alert("Anda harus mengkonfirmasi transfer terlebih dahulu!");
         return;
    }
    
    const msg = `Halo Admin Glowy Nails! 💅%0A%0A` +
        `Saya sudah transfer sebesar *Rp ${selectedCatalog.price.toLocaleString('id-ID')}* via *SeaBank* ke rekening *${bankAccountNumber}*.%0A%0A` +
        `Detail Booking:%0A` +
        `--------------------------%0A` +
        `👤 Nama: *${name}*%0A` +
        `🎨 Design: *${selectedCatalog.name}*%0A` +
        `📅 Tanggal: *${selectedDate}*%0A` +
        `⏰ Jam: *${selectedTime}*%0A` +
        `--------------------------%0A` +
        `Mohon dicek ya kak pembayarannya. Terima kasih!`;

    window.open(`https://wa.me/${adminPhone}?text=${msg}`, '_blank');
    closeModal();
}

// 3. Tambahkan ke Google Calendar (Link untuk Customer)
window.addToGoogleCalendar = function() {
    // Asumsi durasi booking 2 jam (bisa diubah sesuai kebutuhan salon)
    const durationHours = 2;
    
    // Konversi Jam (HH:MM) ke HHMM
    const timeStart = selectedTime.replace(/:/g, ''); 
    const dateStart = selectedDate.replace(/-/g, '');
    
    const startDateTime = `${dateStart}T${timeStart}00`; // YYYYMMDDTHHMM00
    
    // Hitung waktu selesai
    const [h, m] = selectedTime.split(':').map(Number);
    const endTime = new Date(selectedDate);
    endTime.setHours(h + durationHours, m, 0, 0); 
    
    // Format waktu selesai ke YYYYMMDDTHHMMSS
    const endDateTime = endTime.toISOString().replace(/[-:.]/g, '').slice(0, 15);
    
    const title = `Booking Nail Art: ${selectedCatalog.name}`;
    const details = `Booking untuk ${selectedCatalog.name} dengan ${document.getElementById('customerName').value}. Harap hadir tepat waktu!`;
    const location = "Glowy Nails Salon, [Masukkan Alamat Lengkap Anda]"; // GANTI INI

    const gcalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&` +
        `text=${encodeURIComponent(title)}&` +
        `dates=${startDateTime}/${endDateTime}&` +
        `details=${encodeURIComponent(details)}&` +
        `location=${encodeURIComponent(location)}`;

    window.open(gcalUrl, '_blank');
}

// Klik luar modal untuk tutup
window.onclick = function(e) {
    if (e.target == modal) closeModal();
}
