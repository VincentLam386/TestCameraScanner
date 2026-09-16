const btn = document.getElementById("cameraBtn");
const reader = document.getElementById("reader");
const result = document.getElementById("result");

let scannerStarted = false;
let html5QrCode;

const controlsEl = document.getElementById('controls');
const sliderEl = document.getElementById('focus-slider');
const focusValueEl = document.getElementById('focus-value');

function setupFocusSlider(range) {
    focusRange = range;
    sliderEl.min = range.min;
    sliderEl.max = range.max;
    sliderEl.step = range.step || 0.1;

    // Start in the middle of the range
    const initial = (range.min + range.max) / 2;
    sliderEl.value = initial;
    focusValueEl.textContent = `${initial.toFixed(2)} m`;

    controlsEl.classList.remove('hidden');

    sliderEl.addEventListener('input', (e) => {
        const distance = parseFloat(e.target.value);
        focusValueEl.textContent = `${distance.toFixed(2)} m`;
        queueApply(distance);
    });

    // Apply the initial value immediately
    queueApply(initial);
}

let applyTimer = null;
function queueApply(distance) {
    if (applyTimer) clearTimeout(applyTimer);
    applyTimer = setTimeout(async () => {
        try {
            await html5QrCode.applyVideoConstraints({
                focusMode: 'manual',
                focusDistance: distance
            });
            focusValueEl.textContent = `${distance.toFixed(2)} m`;
        } catch (err) {
            console.error('Failed to apply focus distance:', err);
            focusValueEl.textContent = 'Focus change failed';
        }
    }, 80);
}

btn.addEventListener("click", async () => {
    if (scannerStarted) return;

    scannerStarted = true;

    reader.style.display = "block";
    btn.style.display = "none";

    const cameras = await Html5Qrcode.getCameras();
    console.log('camera found:', cameras);

    if (!cameras || cameras.length === 0) {
        result.textContent = 'No cameras found.';
        return;
    }

    //const rearPatterns = /back|rear|environment|后置|背面/i;
    const rearPatterns = /front/i;
    const rear = cameras.find(c => rearPatterns.test(c.label))
              || cameras[cameras.length - 1];

    const cameraId = rear.id;
    console.log('Using camera:', rear.label, cameraId);

    html5QrCode = new Html5Qrcode("reader");

    try {
        await html5QrCode.start(
            { deviceId: { exact: cameraId} }, // back camera on phones
            {
                fps: 10,
                qrbox: 250,
                videoConstraints: {
                    focusMode: "continuous"    // Attempt continuous auto-focus
                }
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
        ).then(() => {
            // 2. Wait a moment for the camera to fully initialize
            //    (some devices need this before constraints can be applied)
            setTimeout(() => {
                try {
                    // 3. Check what the running track supports
                    const capabilities = html5QrCode.getRunningTrackCapabilities();
                    console.log("Capabilities:");
                    console.log(capabilities);
                    
                    // 4. Apply continuous autofocus if supported
                    if (capabilities.focusMode 
                        && capabilities.focusMode.includes("continuous")) {
                        html5QrCode.applyVideoConstraints({
                            focusMode: "continuous"
                        });
                        console.log("Continuous autofocus applied.");
                        result.textContent = "Continuous autofocus applied.";
                    } else if (capabilities.focusMode 
                        && capabilities.focusMode.includes("manual")
                        && capabilities.focusDistance) {
                        const range = capabilities.focusDistance; // e.g., { min: 0, max: 5, step: 0.1 }
                        console.log("Manual focus applied.");
                        setupFocusSlider(capabilities.focusDistance);
                    } else {
                        console.warn("Autofocus is not supported on this device.");
                        result.textContent = "Autofocus is not supported on this device.";
                    }
                } catch (err) {
                    console.error("Could not apply focus constraints:", err);
                }
            }, 2000); // 2-second delay, as recommended in the library's issue threads

            




        });
    } catch (err) {
        result.textContent = "Unable to access camera.";
        console.error(err);
        alert(err);
    }
});