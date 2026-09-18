const modal =
    document.getElementById("stockModal");

const content =
    document.getElementById("stockContent");

function showStock(data){

    let total = 0;

    let html = `
        <div class="item-header">

            <h3>${data.itemCode}</h3>

            <div>${data.description}</div>

        </div>
    `;

    data.stocks.forEach(stock => {

        total += stock.qty;

        html += `
            <div class="stock-row">

                <span>${stock.size}</span>

                <span class="${
                    stock.qty <= 5
                    ? 'stock-low'
                    : 'stock-ok'
                }">

                    ${stock.qty}

                </span>

            </div>
        `;
    });

    html += `
        <div class="stock-row">

            <strong>Total</strong>

            <strong>${total}</strong>

        </div>
    `;

    content.innerHTML = html;

    modal.classList.add("show");
}

function showError(message){

    content.innerHTML = `
        <div class="error">

            ❌ ${message}

        </div>
    `;

    modal.classList.add("show");
}

function closeModal(){

    modal.classList.remove("show");
}