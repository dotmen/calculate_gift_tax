document.addEventListener('DOMContentLoaded', () => {
    const assetType = document.getElementById('assetType');
    const cashInput = document.getElementById('cashInput');
    const realEstateInput = document.getElementById('realEstateInput');
    const stockInput = document.getElementById('stockInput');
    const calculateButton = document.getElementById('calculate');
    const results = document.getElementById('results');

    const giftTaxElement = document.getElementById('giftTax');
    const penaltyTaxElement = document.getElementById('penaltyTax');
    const acquisitionTaxElement = document.getElementById('acquisitionTax');
    const localEducationTaxElement = document.getElementById('localEducationTax');
    const totalTaxElement = document.getElementById('totalTax');

    // 콤마 추가 함수
    function formatNumberWithCommas(value) {
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // 숫자 입력 시 콤마 적용
    function addCommaInputListener(inputId) {
        const input = document.getElementById(inputId);
        input.addEventListener('input', () => {
            const cursorPosition = input.selectionStart;
            const unformattedValue = input.value.replace(/,/g, '');
            const formattedValue = formatNumberWithCommas(unformattedValue);
            input.value = formattedValue;

            // 커서 위치를 유지
            input.selectionStart = input.selectionEnd = cursorPosition + (formattedValue.length - unformattedValue.length);
        });
    }

    // 자산 유형 변경 시 입력 필드 표시
    assetType.addEventListener('change', () => {
        cashInput.classList.add('hidden');
        realEstateInput.classList.add('hidden');
        stockInput.classList.add('hidden');

        if (assetType.value === 'cash') {
            cashInput.classList.remove('hidden');
        } else if (assetType.value === 'realEstate') {
            realEstateInput.classList.remove('hidden');
        } else if (assetType.value === 'stocks') {
            stockInput.classList.remove('hidden');
        }
    });

    // 증여세 계산
    calculateButton.addEventListener('click', () => {
        // 입력값 가져오기
        const assetValue = parseFloat(
            (assetType.value === 'cash'
                ? document.getElementById('cashAmount').value
                : assetType.value === 'realEstate'
                ? document.getElementById('realEstatePrice').value
                : document.getElementById('stockPrice').value
            ).replace(/,/g, '')
        );

        const relationship = document.getElementById('relationship').value;
        const giftDate = new Date(document.getElementById('giftDate').value);
        const reportDate = new Date(document.getElementById('reportDate').value);
        const reportDeadline = document.getElementById('reportDeadline').value;

        // 공제 한도 계산
        let exemptionLimit = 0;
        if (relationship === '1') exemptionLimit = 50000000; // 성년 자녀
        else if (relationship === '2') exemptionLimit = 20000000; // 미성년 자녀
        else if (relationship === '3') exemptionLimit = 50000000; // 사위/며느리
        else if (relationship === '4') exemptionLimit = 10000000; // 기타

        const taxableAmount = Math.max(assetValue - exemptionLimit, 0);

        // 증여세율 계산 (누진세율)
        let giftTax = 0;
        if (taxableAmount <= 100000000) giftTax = taxableAmount * 0.1;
        else if (taxableAmount <= 500000000) giftTax = 10000000 + (taxableAmount - 100000000) * 0.2;
        else if (taxableAmount <= 1000000000) giftTax = 90000000 + (taxableAmount - 500000000) * 0.3;
        else giftTax = 240000000 + (taxableAmount - 1000000000) * 0.5;

        // 가산세 계산
        let penaltyTax = 0;
        const differenceInTime = reportDate - giftDate;
        const differenceInDays = Math.ceil(differenceInTime / (1000 * 60 * 60 * 24));
        if (differenceInDays > reportDeadline * 30) {
            penaltyTax = giftTax * (differenceInDays <= 180 ? 0.1 : 0.2); // 3개월: 10%, 6개월 이상: 20%
        }

        // 취득세 및 지방교육세 계산 (부동산인 경우만)
        let acquisitionTax = 0;
        let localEducationTax = 0;
        if (assetType.value === 'realEstate') {
            acquisitionTax = assetValue * 0.03; // 취득세 3%
            localEducationTax = acquisitionTax * 0.1; // 지방교육세 10%
        }

        // 총 세액 계산
        const totalTax = giftTax + penaltyTax + acquisitionTax + localEducationTax;

        // 결과 표시
        giftTaxElement.textContent = formatNumberWithCommas(giftTax.toFixed(0));
        penaltyTaxElement.textContent = formatNumberWithCommas(penaltyTax.toFixed(0));
        acquisitionTaxElement.textContent = formatNumberWithCommas(acquisitionTax.toFixed(0));
        localEducationTaxElement.textContent = formatNumberWithCommas(localEducationTax.toFixed(0));
        totalTaxElement.textContent = formatNumberWithCommas(totalTax.toFixed(0));

        results.classList.remove('hidden');
    });

    // 콤마 적용 대상 필드
    addCommaInputListener('cashAmount');
    addCommaInputListener('realEstatePrice');
    addCommaInputListener('stockPrice');
});
