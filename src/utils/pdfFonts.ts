import { Font } from '@react-pdf/renderer';

export const registerPdfFonts = () => {
  Font.register({
    family: 'NotoSansJP',
    fonts: [
      { src: '/fonts/NotoSansJP-Regular.otf', fontWeight: 'normal' },
      { src: '/fonts/NotoSansJP-Bold.otf', fontWeight: 'bold' },
    ],
  });

  // 日本語の自動折り返し制御（CJKハイフネーション）
  Font.registerHyphenationCallback((word) => {
    // 1文字単位で改行境界を返すことで、枠外へのはみ出しを防止
    return Array.from(word).flatMap((char) => [char, '']);
  });
};
