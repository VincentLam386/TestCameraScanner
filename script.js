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
            { facingMode: "environment",  }, 
            { 
                aspectRatio: 1.777778,
                focusMode: "continuous", 
                fps: 15,  
                videoConstraints: 
                { 
                    facingMode: 'environment', 
                    width: 9999 
                }, 
                qrbox: { width: 280, height: 280, },  
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
        )
    } catch (err) {
        result.textContent = "Unable to access camera.";
        console.error(err);
        alert(err);
    }
});