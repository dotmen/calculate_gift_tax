document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('amount');
    const calculateButton = document.getElementById('calculate');
    const resultDisplay = document.getElementById('result');

    // 콤마 적용 함수
    function formatNumberWithCommas(value) {
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // 콤마 적용
    amountInput.addEventListener('input', () => {
        const unformattedValue = amountInput.value.replace(/,/g, '');
        const formattedValue = formatNumberWithCommas(unformattedValue);
        amountInput.value = formattedValue;
    });

    // 계산하기 버튼
    calculateButton.addEventListener('click', () => {
        const rawValue = amountInput.value.replace(/,/g, '');
        const calculatedValue = parseInt(rawValue) * 2; // 간단히 2배로 계산
        resultDisplay.textContent = `계산 결과: ${formatNumberWithCommas(calculatedValue.toString())}원`;
    });
});
