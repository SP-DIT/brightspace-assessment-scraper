import { Box, Card, CardBody, CardHeader, Heading } from '@chakra-ui/react';
import SingleScraper from './SingleScraper';

export default function ScraperContainer({ scrapers }) {
    return (
        <Box>
            <Card>
                <CardHeader>
                    <Heading>Scrapers</Heading>
                </CardHeader>
                <CardBody>
                    {scrapers.map((scraper) => (
                        <SingleScraper scraper={scraper} />
                    ))}
                </CardBody>
            </Card>
        </Box>
    );
}
