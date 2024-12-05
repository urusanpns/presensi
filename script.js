// Koordinat lokasi yang diinginkan untuk validasi (radius 500 meter)
const targetLocation = { lat: -6.229503, lng: 106.815692 }; // Koordinat dari https://maps.app.goo.gl/d4M1kJc3iQQ7T4Ke7

// Fungsi untuk mendapatkan lokasi perangkat menggunakan Geolocation API
function getDeviceLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => resolve(position.coords),
                error => reject(error)
            );
        } else {
            reject("Geolocation tidak tersedia.");
        }
    });
}

// Fungsi untuk menghitung jarak antara dua titik (dalam meter)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // radius bumi dalam meter
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // dalam meter
}

// Fungsi untuk memverifikasi apakah lokasi valid dalam radius 500 meter
async function isLocationValid() {
    try {
        const deviceLocation = await getDeviceLocation();
        const distance = calculateDistance(deviceLocation.latitude, deviceLocation.longitude, targetLocation.lat, targetLocation.lng);
        return distance <= 500;
    } catch (error) {
        alert("Gagal mendapatkan lokasi perangkat.");
        return false;
    }
}

// Cek apakah absen sudah dilakukan oleh perangkat ini
let hasSubmitted = false;
let attendanceData = [];

function submitAbsence() {
    if (hasSubmitted) {
        alert("Anda sudah melakukan absensi.");
        return;
    }

    const name = document.getElementById("name").value;
    if (!name) {
        alert("Silakan pilih nama.");
        return;
    }

    isLocationValid().then(valid => {
        if (valid) {
            const date = new Date();
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
            const formattedTime = `${date.getHours()}:${date.getMinutes()}`;

            attendanceData.push({ name, date: formattedDate, time: formattedTime, location: `${targetLocation.lat}, ${targetLocation.lng}` });

            // Update tabel
            updateAttendanceTable();

            // Tandai absen telah dilakukan
            hasSubmitted = true;
            alert("Absensi berhasil.");
        } else {
            alert("Lokasi Anda tidak valid, harus dalam radius 500 meter.");
        }
    });
}

// Update tabel absensi
function updateAttendanceTable() {
    const tbody = document.querySelector("#attendanceTable tbody");
    tbody.innerHTML = '';
    attendanceData.forEach(data => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${data.name}</td><td>${data.date}</td><td>${data.time}</td><td>${data.location}</td>`;
        tbody.appendChild(row);
    });
}

// Ekspor data absensi ke Excel
function exportToExcel() {
    const ws = XLSX.utils.json_to_sheet(attendanceData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Absensi");
    XLSX.writeFile(wb, "data_absensi.xlsx");
}
