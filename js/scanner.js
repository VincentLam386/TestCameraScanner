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

    modal.show();

    scanner =
        new Html5Qrcode("reader");

    try {

        await scanner.start(
            {
                facingMode: "environment"
            },
            {
                fps: 10,
                qrbox: 250
            },
            onScanSuccess
        );

    }
    catch (ex) {

        console.error(ex);
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

async function onScanSuccess(code) {

    await stopScanner();

    modal.hide();

    loadStock(code);
}

async function loadStock(itemCode) {

    try {

        const response =
            await fetch(
                `${API_URL}/${encodeURIComponent(itemCode)}`
            );

        if (!response.ok)
            throw new Error();

        const data =
            await response.json();

        renderStock(data);

    }
    catch {

        renderError(itemCode);
    }
}

function renderStock(data) {

    document.getElementById(
        "itemCode"
    ).textContent =
        data.itemCode;

    const body =
        document.getElementById(
            "stockBody"
        );

    body.innerHTML = "";

    data.sizes.forEach(size => {

        const available =
            size.available;

        body.innerHTML += `
            <tr>

                <td>${size.size}</td>

                <td>

                    ${
                        available
                            ?
                            `<span class="available">
                                <i class="bi bi-check-circle-fill"></i>
                                Available
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
            Wrong Item Code

        </td>
    </tr>
    `;
}