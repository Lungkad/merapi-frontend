import axios from 'axios';

const API_KEY = '222add77e587ee3bb529070ae11c0735'; // Gantilah dengan API Key dari GNews
const BASE_URL = 'https://gnews.io/api/v4/search';

const fetchNews = async () => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: 'merapi', // Kata kunci untuk mencari berita tentang gunung merapi
        token: API_KEY,      // API Key untuk otentikasi
        lang: 'id',          // Bahasa yang digunakan (id = Indonesia)
        max: 10,             // Jumlah berita yang akan ditampilkan
        sortBy: 'publishedAt' // Mengurutkan berdasarkan waktu terbit
      }
    });
    console.log(response.data);
    return response.data.articles;  // Mengembalikan artikel berita
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

export default {
  fetchNews,
};
