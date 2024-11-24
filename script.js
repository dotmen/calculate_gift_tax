document.getElementById('gift-tax-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const currentGift = parseFloat(document.getElementById('current-gift').value) || 0;
    const pastGift = parseFloat(document.getElementById('past-gift').value) || 0;
    const relationship = document.getElementById('relationship').value;
    const giftDate = document.getElementById('gift-date').value;
    const reportDate = document.getElementById('report-date').value;
    const includePenalty = document.getElementById('include-penalty').checked;

    // Validate inputs
    if (currentGift < 0 || pastGift < 0) {
        alert('금액은 0 이상이어야 합니다.');
        return;
    }

    const response = await fetch('/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_gift: currentGift, past_gift: pastGift, relationship, gift_date: giftDate, report_date: reportDate, include_penalty: includePenalty })
    });

    const result = await response.json();
    document.getElementById('result').innerHTML = `
        <h2>계산 결과</h2>
        <p>증여세: ${result.gift_tax.toLocaleString()}원</p>
        <p>가산세: ${result.penalty.toLocaleString()}원</p>
        <p>총 세금: ${result.total_tax.toLocaleString()}원</p>
    `;
});
