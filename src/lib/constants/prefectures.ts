export const PREFECTURE_ORDER = [
    "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県", // Hokkaido & Tohoku
    "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県", // Kanto
    "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県", // Chubu
    "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県", // Kansai
    "鳥取県", "島根県", "岡山県", "広島県", "山口県", // Chugoku
    "徳島県", "香川県", "愛媛県", "高知県", // Shikoku
    "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県" // Kyushu & Okinawa
];

// Helper to get sort index. Returns a high number if not found to put it at the end.
export const getPrefectureSortIndex = (name: string): number => {
    const index = PREFECTURE_ORDER.indexOf(name);
    return index === -1 ? 999 : index;
};
