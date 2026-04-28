/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 보내주신 색 조합표 등록
        smokyBlack: "#11120D",
        oliveDrab: "#565449",
        bone: "#D8CFBC",
        floralWhite: "#FFFBF4",
        // 참고 이미지의 보라색 포인트
        accentPurple: "#7A82D1" 
      },
      fontFamily: {
        // 세련된 폰트 설정 (아래에서 구글폰트 연결 필요)
        sans: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}