import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * 当通过 state.openBirthModal 跳转到本页时自动打开填写弹窗，并清除 state，避免重复打开。
 * 命盤页、占卜页共用。
 */
export function useOpenBirthModalWhenRequested(setModalOpen: (open: boolean) => void): void {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.openBirthModal) {
      setModalOpen(true);
      const state = location.state as Record<string, unknown>;
      const hasForArchive = state?.forArchiveId != null;
      // 若是「補充出生資料」流程，不 replace state，避免 forArchiveId 丟失導致無法寫回該檔案
      if (!hasForArchive) {
        const { openBirthModal: _, ...rest } = state || {};
        navigate(location.pathname, { replace: true, state: rest });
      }
    }
  }, [location.pathname, location.state, navigate, setModalOpen]);
}
