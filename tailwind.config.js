module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: '#16181c', // White
        primary: '#26292f', //divler
        primaryBG: '#33363d', //arama kısmı alternatif div
        secondary: '#1bd96a', //yeşil
        secondaryHover: '#22ff84', //yeşil hover
        secondaryBG: '#23553e', //yeşil bg
        selectBox: '#1a9f52', //seçim kutusu


        textHeading: '#ecf9fb', //başlık
        textPrimary: '#b0bac5', //yazı
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },


    },
  },
  plugins: [],
}
