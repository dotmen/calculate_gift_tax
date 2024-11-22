def calculate_gift_tax(gift_amount, exemption_limit, tax_rate):
    """
    증여세 계산 함수 (2024년 기준)
    """
    taxable_amount = max(gift_amount - exemption_limit, 0)
    gift_tax = taxable_amount * (tax_rate / 100)
    return round(gift_tax)

def get_exemption_limit(relationship):
    """
    관계에 따라 공제 한도를 반환 (2024년 기준)
    """
    if relationship == "1":
        return 50000000  # 직계비속
    elif relationship == "2":
        return 600000000  # 배우자
    elif relationship == "3":
        return 10000000  # 기타
    else:
        print("잘못된 선택입니다. 기본값 0원이 적용됩니다.")
        return 0

def main():
    print("증여세 계산기 (2024년 기준)")
    print("아래에서 증여받는 사람과의 관계를 선택하세요:")
    print("1. 직계비속(자녀)\n2. 배우자\n3. 기타(친구 등)")
    relationship = input("선택 번호를 입력하세요 (1, 2, 3): ")
    exemption_limit = get_exemption_limit(relationship)

    try:
        gift_amount = int(input("\n증여 금액을 입력하세요 (예: 100000000): "))
        tax_rate = 10  # 기본 세율
        gift_tax = calculate_gift_tax(gift_amount, exemption_limit, tax_rate)
        print("\n=== 계산 결과 ===")
        print(f"증여 금액: {gift_amount:,} 원")
        print(f"공제 한도: {exemption_limit:,} 원")
        print(f"공제 후 과세 표준: {max(gift_amount - exemption_limit, 0):,} 원")
        print(f"최종 증여세액: {gift_tax:,} 원")
    except ValueError:
        print("잘못된 입력입니다. 숫자만 입력하세요.")

if __name__ == "__main__":
    main()
