// 숫자 포맷(쉼표 추가) 함수
function formatNumber(input) {
    const value = input.value.replace(/,/g, ''); // 기존 쉼표 제거
    if (!isNaN(value) && value !== "") {
        input.value = parseInt(value, 10).toLocaleString(); // 쉼표 추가
    } else {
        input.value = ""; // 숫자가 아니면 빈칸 유지
    }
}

// 숫자에서 쉼표 제거 후 계산
function parseInput(value) {
    return parseInt(value.replace(/,/g, ''), 10) || 0; // 쉼표 제거 후 숫자로 변환
}

// 현금 금액 입력란에 쉼표 추가
const cashAmountInput = document.getElementById('cashAmount');
if (cashAmountInput) {
    cashAmountInput.addEventListener('input', function () {
        formatNumber(this);
    });
} else {
    console.error("cashAmount 입력란을 찾을 수 없습니다.");
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
        const timeDiff = Math.ceil((reportDate - giftDate) / (1000 * 60 * 60 * 24));
        if (timeDiff > 90 && timeDiff <= 180) {
            penaltyTax = giftTax * 0.1;
        } else if (timeDiff > 180) {
            penaltyTax = giftTax * 0.2;
        }
    }

    // 취득세 및 지방교육세 계산 (부동산만 해당)
    let acquisitionTax = 0, localEducationTax = 0;
    if (assetType === 'realEstate') {
        acquisitionTax = amount * 0.035; // 취득세율 3.5%
        localEducationTax = acquisitionTax * 0.1; // 지방교육세 10% of 취득세
    }

    // 최종 세액 계산
    const totalTax = giftTax + penaltyTax + acquisitionTax + localEducationTax;

    // 결과 표시
    document.getElementById('giftTax').textContent = giftTax.toLocaleString();
    document.getElementById('penaltyTax').textContent = penaltyTax.toLocaleString();
    document.getElementById('acquisitionTax').textContent = acquisitionTax.toLocaleString();
    document.getElementById('localEducationTax').textContent = localEducationTax.toLocaleString();
    document.getElementById('totalTax').textContent = totalTax.toLocaleString();
    document.getElementById('results').classList.remove('hidden');
});
