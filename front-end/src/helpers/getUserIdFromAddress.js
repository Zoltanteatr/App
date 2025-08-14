export const getUserIdFromAddress = () => {
  const hash = window.location.hash;
  if (!hash) return null;

  const params = new URLSearchParams(hash.substring(1));
  const tgWebAppData = params.get('tgWebAppData');
  if (!tgWebAppData) return null;

  try {
    const decodedData = decodeURIComponent(tgWebAppData);
    const userMatch = decodedData.match(/"id":(\d+)/);
    if (userMatch && userMatch[1]) {
      return userMatch[1];
    }
  } catch (error) {
    console.error('Ошибка при парсинге:', error);
  }

  return null;
};
