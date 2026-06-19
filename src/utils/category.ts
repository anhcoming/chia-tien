/** Đoán biểu tượng theo nội dung khoản chi (chỉ để trang trí, không ảnh hưởng tính toán). */
const RULES: Array<[RegExp, string]> = [
  [/lẩu|ăn|cơm|phở|bún|mì|nướng|buffet|nhà hàng|quán|trưa|tối|sáng|food|pizza|gà/i, '🍜'],
  [/bia|rượu|nhậu|beer|cocktail|pub/i, '🍺'],
  [/cafe|cà phê|coffee|trà sữa|trà|tea|nước|sinh tố|juice/i, '☕'],
  [/taxi|grab|gojek|xe|xăng|gửi xe|đỗ xe|parking|máy bay|tàu/i, '🚕'],
  [/khách sạn|hotel|phòng|homestay|villa|resort|airbnb/i, '🏨'],
  [/phim|rạp|game|hát|karaoke|vé|concert|nhạc|chơi/i, '🎬'],
  [/chợ|siêu thị|mua|đồ|shopping|tạp hoá|quà/i, '🛒'],
];

export function guessExpenseIcon(desc: string): string {
  for (const [re, icon] of RULES) if (re.test(desc)) return icon;
  return '🧾';
}
