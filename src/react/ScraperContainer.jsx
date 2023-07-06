import { Box } from '@chakra-ui/react';
import SingleScraper from './SingleScraper';

export default function ScraperContainer({ scrapers }) {
    return (
        <Box>
            {scrapers.map((scraper) => (
                <SingleScraper scraper={scraper} />
            ))}
        </Box>
    );
}
