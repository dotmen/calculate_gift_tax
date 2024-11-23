// 숫자 포맷(쉼표 추가) 함수
function formatNumber(input) {
    const value = input.value.replace(/,/g, '');
    if (!isNaN(value)) {
        input.value = parseInt(value, 10).toLocaleString();
    }
}

// 숫자에서 쉼표 제거 후 계산
function parseInput(value) {
    return parseInt(value.replace(/,/g, ''), 10) || 0;
}

// 재산 유형 선택 시 입력란 표시
document.getElementById('assetType').addEventListener('change', function () {
    document.querySelectorAll('.conditional-input').forEach(input => input.classList.add('hidden'));
    const selectedInput = this.value === 'cash' ? 'cashInput' :
                          this.value === 'realEstate' ? 'realEstateInput' : 'stockInput';
    document.getElementById(selectedInput).classList.remove('hidden');
});

// 과거 증여 금액 추가
document.getElementById('addPastGift').addEventListener('click', function () {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '예: 10,000,000';
    input.className = 'past-gift-input';
    input.addEventListener('input', function () {
        formatNumber(this);
    });
    document.getElementById('pastGifts').appendChild(input);
});

// 계산 버튼 클릭 이벤트
document.getElementById('calculate').addEventListener('click', function () {
    const assetType = document.getElementById('assetType').value;
    const amount = parseInput(assetType === 'cash'
        ? document.getElementById('cashAmount').value
        : assetType === 'realEstate'
        ? document.getElementById('realEstatePrice').value
        : document.getElementById('stockPrice').value);

    const relationship = document.getElementById('relationship').value;
    const giftDate = new Date(document.getElementById('giftDate').value);
    const reportDate = new Date(document.getElementById('reportDate').value);
    const reportDeadline = parseInt(document.getElementById('reportDeadline').value, 10); // 3 or 6 months
    const pastGifts = Array.from(document.querySelectorAll('.past-gift-input'))
        .map(input => parseInput(input.value))
        .reduce((sum, val) => sum + val, 0);

    // 공제 한도 설정
    let exemptionLimit = 0;
    if (relationship === '1') exemptionLimit = 50000000; // 성년 자녀
    else if (relationship === '2') exemptionLimit = 20000000; // 미성년 자녀
    else if (relationship === '3') exemptionLimit = 50000000; // 사위/며느리
    else exemptionLimit = 10000000; // 기타

    // 과세 표준 및 증여세 계산
    const taxableAmount = Math.max(amount + pastGifts - exemptionLimit, 0);
    let giftTax = 0;
    if (taxableAmount <= 100000000) {
        giftTax = taxableAmount * 0.1;
    } else if (taxableAmount <= 500000000) {
        giftTax = 10000000 + (taxableAmount - 100000000) * 0.2;
    } else {
        giftTax = 90000000 + (taxableAmount - 500000000) * 0.3;
    }

    // 가산세 계산
    let penaltyTax = 0;
    if (reportDate > giftDate) {
        const timeDiff = Math.ceil((reportDate - giftDate) / (1000 * 60 * 60 * 24)); // Days difference
        if (timeDiff > reportDeadline * 30 && timeDiff <= (reportDeadline + 3) * 30) {
            penaltyTax = giftTax * 0.1;
        } else if (timeDiff > (reportDeadline + 3) * 30) {
            penaltyTax = giftTax * 0.2;
        }
    }

    // 최종 세액 계산
    const totalTax = giftTax + penaltyTax;

    // 결과 표시
    document.getElementById('giftTax').textContent = giftTax.toLocaleString();
    document.getElementById('penaltyTax').textContent = penaltyTax.toLocaleString();
    document.getElementById('totalTax').textContent = totalTax.toLocale
