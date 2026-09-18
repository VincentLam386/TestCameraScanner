let scannerLocked = false;

document
.getElementById("closeModalBtn")
.addEventListener(
    "click",
    () => {
        closeModal();

        setTimeout(() => {
            scannerLocked = false;
        }, 1000);
    }
);

function onScanSuccess(decodedText){
    if(scannerLocked)
        return;

    scannerLocked = true;

    loadStock(decodedText);
}

async function loadStock(itemCode){
    try{
        const data =
            await getStock(itemCode);

        if(!data.stocks ||
           data.stocks.length === 0){
            showError(
                "Wrong Item Code"
            );
            return;
        }

        showStock(data);

        navigator.vibrate?.(100);
    }
    catch{
        showError(
            "Wrong Item Code"
        );
    }
}


try {
    html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
        { facingMode: "environment",  }, 
        { 
            aspectRatio: 1.333,
            focusMode: "continuous", 
            fps: 15,  
            videoConstraints: 
            { 
                facingMode: 'environment', 
                width: 9999 
            }, 
            qrbox: 250,  
        },
        onScanSuccess,
        (errorMessage) => {
            // Ignore scan errors
        }
    )
} catch (err) {
    result.textContent = "Unable to access camera.";
    console.error(err);
    alert(err);
}