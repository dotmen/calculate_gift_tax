// 증여세 누진세 계산 로직
const taxBrackets = [
    { limit: 100000000, rate: 10, deduction: 0 },
    { limit: 500000000, rate: 20, deduction: 10000000 },
    { limit: 1000000000, rate: 30, deduction: 60000000 },
    { limit: 3000000000, rate: 40, deduction: 160000000 },
    { limit: Infinity, rate: 50, deduction: 460000000 }
];

// 취득세 및 지방세율
const acquisitionTaxRate = 3.5 / 100; // 취득세율
const educationTaxRate = 10 / 100; // 지방교육세율

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

// 가산세 계산 함수
function calculateLatePenalty(submissionDate, giftDate, giftTax) {
    const giftDateObj = new Date(giftDate);
    const submissionDateObj = new Date(submissionDate);

    const diffInTime = submissionDateObj - giftDateObj;
    const diffInDays = diffInTime / (1000 * 3600 * 24);

    if (diffInDays <= 0) return 0; // 신고 기한 초과 없음
    if (diffInDays <= 90) return giftTax * 0.1; // 3개월 초과
    return giftTax * 0.2; // 6개월 초과
}

// 취득세 및 지방세 계산 함수
function calculateLocalTaxes(realEstateValue) {
    const acquisitionTax = realEstateValue * acquisitionTaxRate;
    const educationTax = acquisitionTax * educationTaxRate;

    return {
        acquisitionTax: Math.round(acquisitionTax),
        educationTax: Math.round(educationTax)
    };
}

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

    // 재산 유형에 따른 금액 계산
    const selectedType = document.getElementById('assetType').value;
    let giftAmount = 0;

    if (selectedType === 'cash') {
        giftAmount = parseInt(document.getElementById('cashAmount')?.value || 0);
    } else if (selectedType === 'realEstate') {
        giftAmount = parseInt(document.getElementById('realEstateValue')?.value || 0);
    } else if (selectedType === 'stock') {
        const stockQuantity = parseInt(document.getElementById('stockQuantity')?.value || 0);
        const stockPrice = parseInt(document.getElementById('stockPrice')?.value || 0);
        giftAmount = stockQuantity * stockPrice;
    }

    // 과세 표준 계산
    const exemptionLimit = 50000000; // 기본 공제
    const taxableAmount = Math.max(giftAmount - exemptionLimit, 0);

    // 증여세 계산
    const giftTax = calculateGiftTax(taxableAmount);

    // 가산세 계산
    const giftDate = document.getElementById('giftDate')?.value;
    const submissionDate = document.getElementById('submissionDate')?.value;
    const latePenalty = calculateLatePenalty(submissionDate, giftDate, giftTax);

    // 취득세 및 지방세 계산 (부동산만 해당)
    let localTaxes = { acquisitionTax: 0, educationTax: 0 };
    if (selectedType === 'realEstate') {
        localTaxes = calculateLocalTaxes(giftAmount);
    }

    // 결과 표시
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <p><strong>증여세:</strong> ${giftTax.toLocaleString()}원</p>
        <p><strong>가산세:</strong> ${latePenalty.toLocaleString()}원</p>
        <p><strong>취득세:</strong> ${localTaxes.acquisitionTax.toLocaleString()}원</p>
        <p><strong>지방교육세:</strong> ${localTaxes.educationTax.toLocaleString()}원</p>
        <p><strong>최종 납부세액:</strong> ${(giftTax + latePenalty + localTaxes.acquisitionTax + localTaxes.educationTax).toLocaleString()}원</p>
    `;
};
