import { useCallback, useMemo, useState } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import RealBrightspaceApi from '../api';
import MockBrightspaceApi from '../__mocks__/api';
import Scraper from '../scrape';
import ScraperContext from './ScraperContext';
import ScraperContainer from './ScraperContainer';
import AddScraper from './AddScraper';

const BrightspaceApi = process.env.NODE_ENV === 'test' ? MockBrightspaceApi : RealBrightspaceApi;

export default function ScraperApp({ brightspaceBase, brightspaceApiBase }) {
    const [scrapers, setScrapers] = useState([]);
    const addScraper = useCallback((scraper) => setScrapers([...scrapers, scraper]), [scrapers]);
    const singletonInstance = useMemo(() => {
        const brightspaceApi = BrightspaceApi(brightspaceBase, brightspaceApiBase);
        const scraper = Scraper(brightspaceApi);
        return { brightspaceApi, scraper, addScraper };
    }, [addScraper]);

    return (
        <ChakraProvider>
            <ScraperContext.Provider value={singletonInstance}>
                <AddScraper />
                <ScraperContainer scrapers={scrapers} />
            </ScraperContext.Provider>
        </ChakraProvider>
    );
}
