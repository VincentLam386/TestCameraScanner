const API_URL =
    "https://your-api-server/api/stocks";

let scanner = null;

const modalElement =
    document.getElementById("scannerModal");

const modal =
    new bootstrap.Modal(modalElement);

document
    .getElementById("btnScan")
    .addEventListener(
        "click",
        openScanner
    );

modalElement.addEventListener(
    "hidden.bs.modal",
    stopScanner
);

async function openScanner() {
    document
        .getElementById("cameraError")
        .classList.add("d-none");

    document
        .getElementById("reader")
        .style.display = "block";

    modal.show();

    try {
        await verifyCamera();

        scanner = new Html5Qrcode("reader");
        await scanner.start(
            { facingMode: "environment",  }, 
            { 
                aspectRatio: 1.333,
                focusMode: "continuous", 
                fps: 20,  
                videoConstraints: 
                { 
                    facingMode: 'environment', 
                    width: 9999 
                }, 
                qrbox: 250,
            },
            onScanSuccess
        );
    }
    catch (ex) {
        console.error("Scanner start failed:",ex);
        
        let message =
            "Unable to access camera.";
        switch (ex.name) {
            case "NotFoundError":
                message =
                    "No camera device found.";
                break;
            case "NotAllowedError":
                message =
                    "Camera permission denied.";
                break;
            case "NotReadableError":
                message =
                    "Camera already in use.";
                break;
        }
        
        document
            .getElementById("reader")
            .style.display = "none";

        const errorDiv =
            document.getElementById(
                "cameraError"
            );
        errorDiv.innerHTML =
            `<i class="bi bi-exclamation-triangle-fill"></i>
            ${message}`;
        errorDiv.classList.remove(
            "d-none"
        );
    }
}

async function verifyCamera() {
    try {
        const stream =
            await navigator.mediaDevices
                .getUserMedia({
                    video: true
                });

        stream
            .getTracks()
            .forEach(t => t.stop());

        return true;
    }
    catch (ex) {
        throw ex;
    }
}

async function stopScanner() {
    if (!scanner)
        return;

    try {
        await scanner.stop();
    }
    catch {}

    try {
        await scanner.clear();
    }
    catch {}

    scanner = null;
}

let processingScan = false;

async function onScanSuccess(code) {
    if (processingScan)
        return;
    processingScan = true;

    await scanner.pause(true);

    navigator.vibrate?.(100);

    await new Promise(resolve =>
        setTimeout(resolve, 1000)
    );

    await stopScanner();

    modal.hide();

    await loadStock(code);

    processingScan = false;
}

async function loadStock(itemCode) {

    try {

        // const response =
        //     await fetch(
        //         `${API_URL}/${encodeURIComponent(itemCode)}`
        //     );

        // if (!response.ok)
        //     throw new Error();

        // const data = await response.json();
        if(itemCode === "^^8"){
            throw new Error("test");
        }
        const data = {
            "itemCode": itemCode,
            "description":"Blue T-Shirt",
            "stocks":[
                {
                "size":"S",
                "available":true
                },
                {
                "size":"M",
                "available":false
                },
                {
                "size":"L",
                "available":true
                }
            ]
        };

        renderStock(data);

    }
    catch {

        renderError(itemCode);
    }
}

function renderStock(data) {

    document.getElementById(
        "itemCode"
    ).textContent = data.itemCode;

    const body =
        document.getElementById(
            "stockBody"
        );

    body.innerHTML = "";

    data.stocks.forEach(stock => {
        const available = stock.available;

        body.innerHTML += `
            <tr>
                <td>${stock.size}</td>
                <td>
                    ${
                        available
                            ?
                            `<span class="available">
                                <i class="bi bi-check-circle-fill"></i>
                                尚有庫存 Available
                             </span>`
                            :
                            `<span class="unavailable">
                                <i class="bi bi-x-circle-fill"></i>
                                No Stock
                             </span>`
                    }
                </td>
            </tr>
        `;
    });
}

function renderError(itemCode) {

    document.getElementById(
        "itemCode"
    ).textContent =
        itemCode;

    document.getElementById(
        "stockBody"
    ).innerHTML =
    `
    <tr>
        <td colspan="2"
            class="text-center text-danger">
            <i class="bi bi-x-circle-fill"></i>
            貨品編號錯誤<br/>Wrong Item Code
        </td>
    </tr>
    `;
}