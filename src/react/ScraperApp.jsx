import { useCallback, useMemo, useState } from 'react';
import { Box, ChakraProvider, SimpleGrid } from '@chakra-ui/react';
import RealBrightspaceApi from '../lib/api';
import MockBrightspaceApi from '../__mocks__/api';
import Scraper from '../lib/scrape';
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
                <SimpleGrid columns={2} padding={5} spacing={5}>
                    <AddScraper />
                    <ScraperContainer scrapers={scrapers} />
                </SimpleGrid>
            </ScraperContext.Provider>
        </ChakraProvider>
    );
}
