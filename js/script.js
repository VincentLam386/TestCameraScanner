const API_URL =
    "https://your-api-server/api/stocks";
const PRICE_API_URL =
    "https://your-api-server/api/prices"; 

const LOCATION =
    new URLSearchParams(window.location.search)
        .get("loc") || "";
if(!LOCATION){
    document.getElementById(
        "sizeContainer"
    ).innerHTML = `
        <div class="text-danger text-center">
            店舖代碼遺失<br/>
            Location parameter missing
        </div>
    `;

    document.getElementById("btnScan")
        .setAttribute("disabled","disabled");
}

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

    await Promise.all([
        loadStock(code),
        loadPrice(code)
    ]);

    processingScan = false;
}

async function loadPrice(itemCode){
    try{
        // const response =
        //     await fetch(
        //         `${PRICE_API_URL}/
        //         ?itemCode=${encodeURIComponent(itemCode)}
        //         &location=${encodeURIComponent(LOCATION)}`
        //     );
        // if(!response.ok)
        //     throw new Error();

        // const data = await response.json();
        
        var data;
        if(LOCATION === "S01"){
            if(itemCode === "p1"){
                data = {
                    "retailPrice": 900,
                    "currentPrice": null,
                    "promoLabelDesc": []
                };
            }
            if(itemCode === "p2"){
                data = {
                    "retailPrice": 900,
                    "currentPrice": 700,
                    "promoLabelDesc": []
                }
            }
            if(itemCode === "p3"){
                data = {
                    "retailPrice": 900,
                    "currentPrice": 800,
                    "promoLabelDesc": [
                        "30% off for 2",
                        "buy 1 get 1 free",
                        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                        "bbbbbbbbbbbbbbbbbbbbbbbbb<br/>bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
                    ]
                };
            }
            if(itemCode === "p4"){
                throw new Error("p4");
            }
        }
        else{
            if(itemCode === "p1"){
                data = {
                    "retailPrice": 900,
                    "currentPrice": null,
                    "promoLabelDesc": []
                };
            }
            if(itemCode === "p2"){
                data = {
                    "retailPrice": 900,
                    "currentPrice": 700,
                    "promoLabelDesc": []
                }
            }
            if(itemCode === "p3"){
                data = null;
            }
            if(itemCode === "p4"){
                throw new Error("p4");
            }
        }
        
        renderPrice(data);
    }
    catch{
        renderPrice(null);
    }
}

function renderPrice(data) {
    const priceElement = document.getElementById("itemPrice");
    const promoContainer = document.getElementById("promoContainer");

    promoContainer.innerHTML = "";
    if (!data) {
        priceElement.innerHTML = "-";
        return;
    }

    const retailPrice = data.retailPrice;
    const currentPrice = data.currentPrice;

    if (currentPrice != null) {
        priceElement.innerHTML = `
            <span class="original-price">
                HK\$${retailPrice}
            </span>
            <span class="sale-price">
                HK\$${currentPrice}
            </span>
        `;
    }
    else {
        priceElement.innerHTML =
            `HK\$${retailPrice}`;
    }

    data.promoLabelDesc.forEach(promo => {
        promoContainer.innerHTML += `
            <span class="badge bg-danger promo-badge">
                ${promo}
            </span>
        `;
    });
}


async function loadStock(itemCode) {
    try {

        // const response =
        //     await fetch(
        //         `${API_URL}/
        //             ?itemCode=${encodeURIComponent(itemCode)}
        //             &location=${encodeURIComponent(LOCATION)}`
        //     );

        // if (!response.ok)
        //     throw new Error();

        // const data = await response.json();
        if(itemCode === "^^8"){
            throw new Error("test");
        }
        var data;
        if(LOCATION === "S01"){
            data = {
                "itemCode": itemCode,
                "description":"Blue T-Shirt",
                "sizes":["S","M","L","10.5","ABC"]
            };
        }
        else{
            data = {
                "itemCode": itemCode,
                "description":"Blue T-Shirt",
                "sizes":[
                    "1","2","3","4","5",
                    "11","12","13","14","15",
                    "21","22","23","24","25",
                ]
            };
        }

        renderStock(data);
    }
    catch {
        renderError(itemCode);
    }
}

function renderStock(data) {
    document.getElementById("itemCode")
        .textContent = data.itemCode;

    const container =
        document.getElementById("sizeContainer");

    container.innerHTML = "";

    data.sizes.forEach(size => {
        container.innerHTML += `
            <div class="size-circle">
                ${size}
            </div>
        `;
    });
}

function renderError(itemCode) {
    document.getElementById("itemCode")
        .textContent = itemCode;
    document.getElementById("itemPrice")
        .textContent = "-";

    const container =
        document.getElementById("sizeContainer");

    container.innerHTML = `
        <div class="text-center text-danger py-4">
            貨品編號錯誤<br/>
            Invalid Item Code
        </div>
    `;
}