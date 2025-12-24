import { useLocation } from 'react-router-dom';

/**
 * Skip Links component for keyboard and screen reader accessibility.
 * Allows users to bypass navigation and jump directly to main content.
 */
export const SkipLinks = () => {
  const location = useLocation();

  const handleSkipToMain = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSkipToNav = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const nav = document.getElementById('main-navigation');
    if (nav) {
      const firstLink = nav.querySelector('a, button');
      if (firstLink instanceof HTMLElement) {
        firstLink.focus();
      }
    }
  };

  return (
    <div className="skip-links">
      <a
        href="#main-content"
        onClick={handleSkipToMain}
        className="skip-link"
      >
        Skip to main content
      </a>
      <a
        href="#main-navigation"
        onClick={handleSkipToNav}
        className="skip-link"
      >
        Skip to navigation
      </a>
    </div>
  );
};

export default SkipLinks;
