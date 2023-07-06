import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Heading,
    List,
    ListIcon,
    ListItem,
    Divider,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Stack,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { FaPersonDigging } from 'react-icons/fa6';
import { TbCircleDotted } from 'react-icons/tb';
import { MdCheckCircle } from 'react-icons/md';

function ScraperStepItem({ status, children }) {
    return (
        <ListItem>
            {status === -1 && <ListIcon as={TbCircleDotted} color="gray" />}
            {status === 0 && <ListIcon as={TbCircleDotted} color="300 yellow" />}
            {status === 1 && <ListIcon as={MdCheckCircle} color="300 green" />}
            {children}
        </ListItem>
    );
}

const steps = ['Obtaining Access Token', 'Obtaining Student List', 'Scraping grades'];

function ScaperSteps() {
    const [stepNumber, setStepNumber] = useState(-1);
    const [totalStudent, setTotalStudent] = useState();
    const [processedStudent, setProcessedStudent] = useState(0);
    const [error, setError] = useState();
    const startDate = useMemo(() => new Date(), []);

    const next = () => {
        setStepNumber(stepNumber + 1);
    };
    const onError = (error) => {
        setError(error.message);
    };
    const incrementProcessedStudent = () => {
        setProcessedStudent(processedStudent + 1);
    };

    useEffect

    return (
        <Stack spacing={5}>
            <List spacing={3}>
                {steps.map((step, index) => (
                    <ScraperStepItem key={step} status={stepNumber === index ? 0 : stepNumber < index ? -1 : 1}>
                        {step}
                    </ScraperStepItem>
                ))}
            </List>
            <Divider />
            <Stat>
                <StatLabel>Progress</StatLabel>
                <StatNumber>93/108 (85%)</StatNumber>
                <StatHelpText>Started at {startDate.toLocaleString()}</StatHelpText>
            </Stat>
        </Stack>
    );
}

export default function SingleScraper({ scraper: { orgUnit, assignment, rubric } }) {
    const [isStarted, setIsStarted] = useState(false);
    const onScrape = () => {
        setIsStarted(true);
    };
    return (
        <Card>
            <CardHeader>
                <Heading size="xs" textTransform="uppercase">
                    [{orgUnit.name}] {assignment.name} - {rubric.name}
                </Heading>
            </CardHeader>
            <CardBody>
                {!isStarted && (
                    <Button rightIcon={<FaPersonDigging />} onClick={onScrape}>
                        Scrape
                    </Button>
                )}
                {isStarted && <ScaperSteps />}
            </CardBody>
        </Card>
    );
}
