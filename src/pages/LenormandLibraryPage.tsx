import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/** 雷诺曼牌库/图书馆入口：重定向到解读页的雷诺曼工具 */
const LenormandLibraryPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/oracle/reading?tool=lenormand', { replace: true });
  }, [navigate]);
  return null;
};

export default LenormandLibraryPage;
