import { useCallback, useMemo, useState } from 'react';
import RealBrightspaceApi from '../api';
import MockBrightspaceApi from '../__mocks__/api';
import Scraper from '../scrape';
import ModulePicker from './ModulePicker';
import ScraperContext from './ScraperContext';
import ScraperContainer from './ScraperContainer';

const BrightspaceApi = process.env.NODE_ENV === 'test' ? MockBrightspaceApi : RealBrightspaceApi;

export default function ScraperApp({ brightspaceBase, brightspaceApiBase }) {
    const [scrapers, setScrapers] = useState([]);
    const addScraper = useCallback(
        (orgUnitId, assignmentId, rubricId) => setScrapers([...scrapers, { orgUnitId, assignmentId, rubricId }]),
        [scrapers],
    );
    const singletonInstance = useMemo(() => {
        const brightspaceApi = BrightspaceApi(brightspaceBase, brightspaceApiBase);
        const scraper = Scraper(brightspaceApi);
        return { brightspaceApi, scraper, addScraper };
    }, [addScraper]);

    return (
        <ScraperContext.Provider value={singletonInstance}>
            <ModulePicker />
            {scrapers.map((scraper) => (
                <ScraperContainer scraper={scraper} />
            ))}
        </ScraperContext.Provider>
    );
}
