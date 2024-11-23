// 증여세 누진세 계산 로직
const taxBrackets = [
    { limit: 100000000, rate: 10, deduction: 0 },
    { limit: 500000000, rate: 20, deduction: 10000000 },
    { limit: 1000000000, rate: 30, deduction: 60000000 },
    { limit: 3000000000, rate: 40, deduction: 160000000 },
    { limit: Infinity, rate: 50, deduction: 460000000 }
];

// 재산 유형에 따라 입력 필드 표시
document.getElementById('assetType').addEventListener('change', function () {
    const selectedType = this.value;
    const additionalFields = document.getElementById('additionalFields');
    additionalFields.innerHTML = ''; // 기존 필드 초기화

    if (selectedType === 'cash') {
        additionalFields.innerHTML = `
            <label for="cashAmount">현금 금액 (원):</label>
            <input type="text" id="cashAmount" placeholder="예: 10,000,000">
        `;
    } else if (selectedType === 'realEstate') {
        additionalFields.innerHTML = `
            <label for="realEstateValue">부동산 공시가격 (원):</label>
            <input type="text" id="realEstateValue" placeholder="예: 500,000,000">
        `;
    } else if (selectedType === 'stock') {
        additionalFields.innerHTML = `
            <label for="stockQuantity">주식 수량:</label>
            <input type="number" id="stockQuantity" placeholder="예: 100">
            <label for="stockPrice">증여일 기준 주가 (원):</label>
            <input type="text" id="stockPrice" placeholder="예: 50,000">
        `;
    }
});

// 과거 증여 금액 추가
document.getElementById('addGiftButton').addEventListener('click', function () {
    const previousGifts = document.getElementById('previousGifts');
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.placeholder = '예: 10,000,000';
    inputField.style.marginBottom = "10px";
    previousGifts.appendChild(inputField);
});

// 결과 출력
document.getElementById('taxForm').onsubmit = function (e) {
    e.preventDefault();

    const giftAmount = parseInt(document.getElementById('cashAmount')?.value || 0);
    const taxableAmount = Math.max(giftAmount - 50000000, 0);

    const giftTax = calculateGiftTax(taxableAmount);
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<p><strong>증여세:</strong> ${giftTax.toLocaleString()}원</p>`;
};

// 증여세 계산 함수
function calculateGiftTax(taxableAmount) {
    let tax = 0;
    for (let i = 0; i < taxBrackets.length; i++) {
        const bracket = taxBrackets[i];
        const prevLimit = taxBrackets[i - 1]?.limit || 0;

        if (taxableAmount > bracket.limit) {
            tax += (bracket.limit - prevLimit) * (bracket.rate / 100);
        } else {
            tax += (taxableAmount - prevLimit) * (bracket.rate / 100);
            tax -= bracket.deduction;
            break;
        }
    }
    return Math.max(tax, 0);
}
