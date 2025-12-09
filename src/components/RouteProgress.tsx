import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  minimum: 0.1,
  easing: 'ease',
  speed: 400,
  trickleSpeed: 200,
});

const RouteProgress = () => {
  const location = useLocation();

  useEffect(() => {
    // Start progress on route change
    NProgress.start();
    
    // Complete progress after a short delay to simulate page load
    const timer = setTimeout(() => {
      NProgress.done();
    }, 300);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [location.pathname]);

  return null;
};

export default RouteProgress;
