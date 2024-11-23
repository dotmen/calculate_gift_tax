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

// 과거 증여 합산 기준 (관계별)
const relationshipPeriods = {
    child: 10, // 직계비속: 10년
    spouse: 10, // 배우자: 10년
    inLaw: 5, // 사위/며느리: 5년
    other: 0 // 타인: 합산 없음
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

// 가산세 계산 함수
function calculateLatePenalty(submissionDate, giftDate, giftTax, extendedPeriod) {
    const giftDateObj = new Date(giftDate);
    const submissionDateObj = new Date(submissionDate);

    const diffInTime = submissionDateObj - giftDateObj;
    const diffInDays = diffInTime / (1000 * 3600 * 24);

    // 신고기한 설정 (기본 3개월 또는 연장 6개월)
    const gracePeriodDays = extendedPeriod ? 180 : 90;

    if (diffInDays <= gracePeriodDays) return 0; // 신고 기한 내
    if (diffInDays <= gracePeriodDays + 90) return giftTax * 0.1; // 신고기한 초과 3개월 이내
    return giftTax * 0.2; // 신고기한 초과 6개월 이상
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

// 과거 증여 금액 합산 함수
function calculatePastGifts(pastGiftInputs, relationship, currentDate) {
    const periodLimit = relationshipPeriods[relationship] || 0; // 관계에 따른 합산 기간(년)
    const limitDate = new Date(currentDate);
    limitDate.setFullYear(limitDate.getFullYear() - periodLimit);

    let totalPastGifts = 0;

    pastGiftInputs.forEach(input => {
        const giftDate = new Date(input.date);
        if (giftDate >= limitDate) {
            totalPastGifts += parseInt(input.amount || 0);
        }
    });

    return totalPastGifts;
}

// 재산 유형 변경 시 신고 기한 기본값 설정
document.getElementById('assetType').addEventListener('change', function () {
    const selectedType = this.value;
    const extendedPeriodField = document.getElementById('extendedPeriod');

    if (selectedType === 'realEstate' || selectedType === 'stock') {
        extendedPeriodField.value = "true"; // 연장 가능
    } else {
        extendedPeriodField.value = "false"; // 기본 3개월
    }
});

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
    const inputWrapper = document.createElement('div');
    inputWrapper.innerHTML = `
        <input type="date" placeholder="증여일 (연도-월-일)">
        <input type="text" placeholder="금액 (원)">
    `;
    previousGifts.appendChild(inputWrapper);
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

    // 관계에 따른 과거 증여 합산
    const currentDate = new Date();
    const relationship = document.getElementById('relationship').value;
    const pastGiftInputs = Array.from(document.getElementById('previousGifts').children).map(inputWrapper => ({
        date: inputWrapper.querySelector('input[type="date"]')?.value,
        amount: inputWrapper.querySelector('input[type="text"]')?.value
    }));

    const pastGifts = calculatePastGifts(pastGiftInputs, relationship, currentDate);
    const taxableAmount = Math.max(giftAmount + pastGifts - (relationshipPeriods[relationship] || 0), 0);

    // 결과 표시
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <p><strong>증여세:</strong> ${calculateGiftTax(taxableAmount).toLocaleString()}원</p>
    `;
};
