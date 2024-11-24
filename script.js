document.addEventListener('DOMContentLoaded', function () {
    const taxBrackets = [
        { limit: 100000000, rate: 10, deduction: 0 },
        { limit: 500000000, rate: 20, deduction: 10000000 },
        { limit: 1000000000, rate: 30, deduction: 60000000 },
        { limit: 3000000000, rate: 40, deduction: 160000000 },
        { limit: Infinity, rate: 50, deduction: 460000000 }
    ];

    // 숫자에 콤마 추가하는 함수
    function formatNumberWithCommas(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // 콤마 제거 함수
    function removeCommas(value) {
        return value.replace(/,/g, '');
    }

    // 입력 필드에 실시간 콤마 추가 이벤트 연결
    function attachCommaEvent(input) {
        input.addEventListener('input', function () {
            const rawValue = removeCommas(this.value);
            if (!isNaN(rawValue) && rawValue !== '') {
                this.value = formatNumberWithCommas(rawValue);
            } else {
                this.value = ''; // 잘못된 값 초기화
            }
        });
    }

    // 재산 유형에 따라 입력 필드 표시
    document.getElementById('assetType').addEventListener('change', function () {
        const selectedType = this.value;
        const additionalFields = document.getElementById('additionalFields');
        additionalFields.innerHTML = ''; // 초기화

        if (selectedType === 'cash') {
            additionalFields.innerHTML = `
                <label for="cashAmount">현금 금액 (원):</label>
                <input type="text" id="cashAmount" placeholder="예: 10,000,000">
            `;
            attachCommaEvent(document.getElementById('cashAmount'));
        } else if (selectedType === 'realEstate') {
            additionalFields.innerHTML = `
                <label for="realEstateValue">부동산 공시가격 (원):</label>
                <input type="text" id="realEstateValue" placeholder="예: 500,000,000">
            `;
            attachCommaEvent(document.getElementById('realEstateValue'));
        } else if (selectedType === 'stock') {
            additionalFields.innerHTML = `
                <label for="stockQuantity">주식 수량:</label>
                <input type="number" id="stockQuantity" placeholder="예: 100">
                <label for="stockPrice">증여일 기준 주가 (원):</label>
                <input type="text" id="stockPrice" placeholder="예: 50,000">
            `;
            attachCommaEvent(document.getElementById('stockPrice'));
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
        attachCommaEvent(inputField);
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
        for (let i =
