import { useCallback, useMemo, useState } from 'react';
import { Box, ChakraProvider, SimpleGrid } from '@chakra-ui/react';
import RealBrightspaceApi from '../lib/api';
import MockBrightspaceApi from '../__mocks__/api';
import Scraper from '../lib/scrape';
import ScraperContext from './ScraperContext';
import ScraperContainer from './ScraperContainer';
import AddScraper from './AddScraper';
import useScraper from './useScraper';
import Footer from './Footer';

const BrightspaceApi = process.env.NODE_ENV === 'test' ? MockBrightspaceApi : RealBrightspaceApi;

export default function ScraperApp({ brightspaceBase, brightspaceApiBase }) {
    const [scrapers, { addScraper, removeScraper }] = useScraper('scraper-brightspace');
    const singletonInstance = useMemo(() => {
        const brightspaceApi = BrightspaceApi(brightspaceBase, brightspaceApiBase);
        const scraper = Scraper(brightspaceApi);
        return { brightspaceApi, scraper, addScraper, removeScraper };
    }, [addScraper]);

    return (
        <ChakraProvider>
            <ScraperContext.Provider value={singletonInstance}>
                <SimpleGrid rows={2} padding={5} spacing={5}>
                    <AddScraper />
                    <ScraperContainer scrapers={scrapers} />
                </SimpleGrid>
                <Footer />
            </ScraperContext.Provider>
        </ChakraProvider>
    );
}
