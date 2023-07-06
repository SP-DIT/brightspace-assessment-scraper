import { Box, Card, CardBody, CardHeader, VStack, Heading } from '@chakra-ui/react';
import SingleScraper from './SingleScraper';

export default function ScraperContainer({ scrapers }) {
    return (
        <Box>
            <Card>
                <CardHeader>
                    <Heading>Scrapers</Heading>
                </CardHeader>
                <CardBody>
                    <VStack spacing={3} w="full">
                        {scrapers.map((scraper) => (
                            <SingleScraper scraper={scraper} />
                        ))}
                    </VStack>
                </CardBody>
            </Card>
        </Box>
    );
}
