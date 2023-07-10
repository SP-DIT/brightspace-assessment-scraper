import { Box, Button, Container, Link, Stack, Text, useColorModeValue } from '@chakra-ui/react';
import { AiFillBug } from 'react-icons/ai';
import { FcFeedback } from 'react-icons/fc';

export default function Footer() {
    return (
        <Box bg={useColorModeValue('gray.50', 'gray.900')} color={useColorModeValue('gray.700', 'gray.200')}>
            <Container
                as={Stack}
                maxW="6xl"
                py={4}
                direction={{ base: 'column', md: 'row' }}
                spacing={4}
                justify={{ base: 'center', md: 'space-between' }}
                align={{ base: 'center', md: 'center' }}
            >
                <Text>BrightSpace Scraper</Text>
                <Stack direction="row" spacing={6}>
                    <Link href="https://github.com/SP-DIT/brightspace-assessment-scraper/issues/new?assignees=&labels=feedback&projects=&template=feedback.md&title=%5BFeedback%5D">
                        <Button leftIcon={<FcFeedback />}>Feedback</Button>
                    </Link>
                    <Link href="https://github.com/SP-DIT/brightspace-assessment-scraper/issues/new?assignees=&labels=bug&projects=&template=bug-report.md&title=%5BBug%5D">
                        <Button leftIcon={<AiFillBug />} colorScheme="pink">
                            Report Bug
                        </Button>
                    </Link>
                </Stack>
            </Container>
        </Box>
    );
}
