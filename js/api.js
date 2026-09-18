const API_BASE =
    "https://your-api-server/api";

async function getStock(itemCode){
    return {
        "itemCode": itemCode,
        "description":"Blue T-Shirt",
        "stocks":[
            {
            "size":"S",
            "qty":10
            },
            {
            "size":"M",
            "qty":5
            },
            {
            "size":"L",
            "qty":0
            }
        ]
    };

    const response = await fetch(
        `${API_BASE}/stocks/${encodeURIComponent(itemCode)}`
    );

    if(!response.ok){
        throw new Error("API Error");
    }

    return await response.json();
}