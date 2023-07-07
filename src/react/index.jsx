import ReactDOM from 'react-dom/client';
import ScraperApp from './ScraperApp';

const localStorageKey = `brightspace-rubrics-scraper`;

export default function BrightspaceRubricScraper(brightspaceBase, brightspaceApiBase) {
    ReactDOM.createRoot(document.getElementById('root')).render(
        <ScraperApp brightspaceBase={brightspaceBase} brightspaceApiBase={brightspaceApiBase} />
    );
}
