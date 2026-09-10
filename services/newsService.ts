import { NewsData } from '@/types';

export const fetchNews = async (): Promise<NewsData[]> => {
  try {
    const response = await fetch('https://www.fotomac.com.tr/rss/fenerbahce.xml');
    const xmlText = await response.text();

    const items = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];

    const newsList: NewsData[] = items.map((item, index) => {
      const titleMatch = item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/);
      const fallbackTitle = item.match(/<title>([\s\S]*?)<\/title>/);
      const title = titleMatch ? titleMatch[1] : (fallbackTitle ? fallbackTitle[1] : 'Başlık bulunamadı');

      const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
      const link = linkMatch ? linkMatch[1] : '';

      const imageMatch = item.match(/url="([^"]+)"/);
      const image = imageMatch ? imageMatch[1] : 'https://media.fenerbahce.org/getmedia/5c3702c2-d352-45e3-b09e-7341857c50be/stad.jpg';

      const dateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      let date = '';
      if (dateMatch) {
        const d = new Date(dateMatch[1]);
        date = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      }

      const categoryMatch = item.match(/<category><!\[CDATA\[([\s\S]*?)\]\]><\/category>/);
      const fallbackCat = item.match(/<category>([\s\S]*?)<\/category>/);
      const category = categoryMatch ? categoryMatch[1].toUpperCase() : (fallbackCat ? fallbackCat[1].toUpperCase() : 'KULÜP');

      return {
        id: link || String(index),
        title,
        link,
        image,
        date,
        category
      };
    });

    return newsList;
  } catch (error) {
    console.error("Haberler çekilirken hata:", error);
    return [];
  }
};
