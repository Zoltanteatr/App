import { useState, useEffect } from 'react';
import { getUserIdFromAddress } from '../helpers/getUserIdFromAddress';

export const useUserId = () => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const initializeUserId = () => {
      const urlUserId = getUserIdFromAddress();
      if (urlUserId) {
        setUserId(urlUserId);
        sessionStorage.setItem('user_id', urlUserId);
        return;
      }

      const storedUserId = sessionStorage.getItem('user_id');
      if (storedUserId) {
        setUserId(storedUserId);
        return;
      }

      if (window.Telegram?.WebApp) {
        const initData = window.Telegram.WebApp.initData;
        if (initData) {
          try {
            const initDataObj = JSON.parse(initData);
            if (initDataObj.user?.id) {
              const telegramUserId = initDataObj.user.id.toString();
              setUserId(telegramUserId);
              sessionStorage.setItem('user_id', telegramUserId);
            }
          } catch (error) {
            console.error('Ошибка при парсинге initData:', error);
          }
        }
      }
    };

    initializeUserId();
  }, []);

  const updateUserId = (newUserId) => {
    setUserId(newUserId);
    sessionStorage.setItem('user_id', newUserId);
  };

  return { userId, updateUserId };
}; 