const btn = document.getElementById("cameraBtn");
const reader = document.getElementById("reader");
const result = document.getElementById("result");

let scannerStarted = false;
let html5QrCode;

btn.addEventListener("click", async () => {
    if (scannerStarted) return;

    scannerStarted = true;

    reader.style.display = "block";
    btn.style.display = "none";

    html5QrCode = new Html5Qrcode("reader");

    try {
        await html5QrCode.start(
            { facingMode: "environment" }, // back camera on phones
            {
                fps: 10,
                qrbox: 250
            },
            (decodedText) => {
                result.innerHTML = `
                    QR Code Found:<br>
                    ${decodedText}
                        ${decodedText}
                    </a>
                `;

                html5QrCode.stop();
            },
            (errorMessage) => {
                // Ignore scan errors
            }
        );
    } catch (err) {
        result.textContent = "Unable to access camera.";
        console.error(err);
    }
});