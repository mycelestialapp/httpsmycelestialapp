import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/** 星座配对入口：重定向到关系页 */
const ZodiacPairingPage = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/relationships', { replace: true });
  }, [navigate]);
  return null;
};

export default ZodiacPairingPage;
