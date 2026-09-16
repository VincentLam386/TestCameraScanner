function onScanSuccess(decodedText, decodedResult) {
    // Stop scanning immediately to avoid multiple triggers
    html5QrcodeScanner.clear();

    // Handle the redirect based on the decoded value
    if (decodedText.startsWith('http')) {
        window.location.href = decodedText; // Redirect to the URL
    } else {
        // Example: Redirect to a specific page with the value as a parameter
        // window.location.href = `/details?code=${encodeURIComponent(decodedText)}`;
        alert(`Scanned value: ${decodedText}`);
    }
}

function onScanError(errorMessage) {
    // This callback is optional; it fires frequently when no code is in view.
    // You can safely ignore it or log it for debugging.
}

const html5QrCode = new Html5Qrcode("reader");

// 3. Start scanning with autofocus constraint
html5QrCode.start(
    { facingMode: "environment" },
    { 
        fps: 10, 
        qrbox: 250,
        // Request continuous autofocus
        videoConstraints: {
            focusMode: { ideal: "continuous" }
        }
    },
    onScanSuccess,
    onScanError
).then(() => {
    // 4. After starting, check if the constraint was applied
    const track = html5QrCode.getRunningTrack();
    if (track) {
        const capabilities = track.getCapabilities();
        if (capabilities.focusMode && capabilities.focusMode.includes("continuous")) {
            console.log("Continuous autofocus is supported and active.");
        } else {
            console.warn("Continuous autofocus is not supported on this device.");
        }
    }
});