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
    additionalFields.innerHTML = ''; // 초기화

    if (selectedType === 'cash') {
        additionalFields.innerHTML = `
            <label for="cashAmount">현금 금액 (원):</label>
            <input type="text" id="cashAmount" placeholder="예: 10,000,000" class="comma-input">
        `;
    } else if (selectedType === 'realEstate') {
        additionalFields.innerHTML = `
            <label for="realEstateValue">부동산 공시가격 (원):</label>
            <input type="text" id="realEstateValue" placeholder="예: 500,000,000" class="comma-input">
        `;
    } else if (selectedType === 'stock') {
        additionalFields.innerHTML = `
            <label for="stockQuantity">주식 수량:</label>
            <input type="number" id="stockQuantity" placeholder="예: 100">
            <label for="stockPrice">증여일 기준 주가 (원):</label>
            <input type="text" id="stockPrice" placeholder="예: 50,000" class="comma-input">
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
    inputField.classList.add('comma-input'); // 콤마 포맷 대상
    previousGifts.appendChild(inputField);
});

// 숫자에 콤마 추가하는 함수
function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 콤마 제거 함수
function removeCommas(value) {
    return value.replace(/,/g, '');
}

// 이벤트 위임 방식으로 모든 금액 입력 필드에 콤마 추가
document.addEventListener('input', function (event) {
    if (event.target && event.target.classList.contains('comma-input')) {
        let rawValue = removeCommas(event.target.value); // 기존 콤마 제거
        if (!isNaN(rawValue) && rawValue !== '') {
            event.target.value = formatNumberWithCommas(rawValue);
        } else {
            event.target.value = ''; // 잘못된 입력은 초기화
        }
    }
});

// 과거 증여 금액 합산
function getTotalPreviousGifts() {
    const inputs = document.querySelectorAll('#previousGifts input');
    let total = 0;
    inputs.forEach(input => {
        total += parseInt(removeCommas(input.value)) || 0;
    });
    return total;
}

// 취득세와 지방교육세 계산
function calculateLocalTaxes(realEstateValue) {
    const acquisitionTaxRate = 3.5 / 100; // 취득세율
    const educationTaxRate = 10 / 100; // 지방교육세율

    const acquisitionTax = realEstateValue * acquisitionTaxRate;
    const educationTax = acquisitionTax * educationTaxRate;

    return {
        acquisitionTax: Math.round(acquisitionTax),
        educationTax: Math.round(educationTax)
    };
}

// 증여세 및 지방세 계산
document.getElementById('taxForm').onsubmit = function (e) {
    e.preventDefault();

    const assetType = document.getElementById('assetType').value;
    const relationship = document.getElementById('relationship').value;
    const exemption = parseInt(relationship) || 0;

    let giftAmount = 0;
    if (assetType === 'cash') {
        giftAmount = parseInt(removeCommas(document.getElementById('cashAmount').value)) || 0;
    } else if (assetType === 'realEstate') {
        giftAmount = parseInt(removeCommas(document.getElementById('realEstateValue').value)) || 0;
    }

    const previousGift = getTotalPreviousGifts();
    const totalTaxable = Math.max(giftAmount + previousGift - exemption, 0);

    let tax = 0;
    for (let i = 0; i < taxBrackets.length; i++) {
        const bracket = taxBrackets[i];
        const prevLimit = taxBrackets[i - 1]?.limit || 0;

        if (totalTaxable > bracket.limit) {
            tax += (bracket.limit - prevLimit) * (bracket.rate / 100);
        } else {
            tax += (totalTaxable - prevLimit) * (bracket.rate / 100);
            tax -= bracket.deduction;
            break;
        }
    }

    tax = Math.max(tax, 0);

    // 취득세 및 지방교육세 계산 (부동산만 해당)
    let localTaxes = { acquisitionTax: 0, educationTax: 0 };
    if (assetType === 'realEstate') {
        localTaxes = calculateLocalTaxes(giftAmount);
    }

    // 결과 출력
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <p><strong>증여세:</strong> ${tax.toLocaleString()}원</p>
        ${assetType === 'realEstate' ? `
            <p><strong>취득세:</strong> ${localTaxes.acquisitionTax.toLocaleString()}원</p>
            <p><strong>지방교육세:</strong> ${localTaxes.educationTax.toLocaleString()}원</p>
            <p><strong>총 지방세:</strong> ${(localTaxes.acquisitionTax + localTaxes.educationTax).toLocaleString()}원</p>
        ` : ''}
    `;
};

// 데이터 입력값 유효성 검사
function validateInputs() {
    const assetType = document.getElementById('assetType').value;
    let amountField;
    if (assetType === 'cash') {
        amountField = document.getElementById('cashAmount');
    } else if (assetType === 'realEstate') {
        amountField = document.getElementById('realEstateValue');
    }

    // 금액 필드가 비어 있거나 숫자가 아닌 경우 경고 메시지 표시
    if (amountField && (!amountField.value || isNaN(parseInt(removeCommas(amountField.value)))) ) {
        alert("올바른 금액을 입력해주세요.");
        return false;
    }

    return true;
}

// 폼 제출 시 데이터 유효성 검사 실행
document.getElementById('taxForm').addEventListener('submit', function (e) {
    if (!validateInputs()) {
        e.preventDefault();
    }
});
