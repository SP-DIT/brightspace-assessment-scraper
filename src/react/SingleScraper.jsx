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
import { useMemo, useState, useContext } from 'react';
import { FaPersonDigging } from 'react-icons/fa6';
import { TbCircleDotted } from 'react-icons/tb';
import { MdCheckCircle } from 'react-icons/md';
import ScraperContext from './ScraperContext';
import GradesDistribution from './ScraperGraphs/GradesDistribution';

function ScraperChart({ data: { studentResult } }) {
    return <GradesDistribution data={studentResult} />;
}

function ScraperStepItem({ status, children }) {
    return (
        <ListItem>
            {status === -1 && <ListIcon as={TbCircleDotted} color="gray" />}
            {status === 0 && <ListIcon as={TbCircleDotted} color="salmon" />}
            {status === 1 && <ListIcon as={MdCheckCircle} color="green" />}
            {children}
        </ListItem>
    );
}

const steps = ['Obtaining Access Token', 'Obtaining Student List', 'Scraping grades'];

function ScraperStepsList({ stepNumber, error }) {
    return (
        <List spacing={3}>
            {steps.map((step, index) => (
                <ScraperStepItem
                    key={step}
                    // eslint-disable-next-line no-nested-ternary
                    status={stepNumber === index ? 0 : stepNumber < index ? -1 : 1}
                    error={stepNumber === index && error}
                >
                    {step}
                </ScraperStepItem>
            ))}
        </List>
    );
}

function ScraperProgress({ processedStudent, totalStudent, startDate }) {
    return (
        <Stat>
            <StatLabel>Progress</StatLabel>
            <StatNumber>
                {processedStudent || '--'}/{totalStudent || '--'} (
                {totalStudent && Math.ceil((processedStudent / totalStudent) * 100)}%)
            </StatNumber>
            <StatHelpText>Started at {startDate.toLocaleString()}</StatHelpText>
        </Stat>
    );
}

function ScraperSteps({ orgId, assignmentId, rubricId }) {
    const { scraper } = useContext(ScraperContext);

    const [isStarted, setIsStarted] = useState(false);
    const [stepNumber, setStepNumber] = useState(-1);
    const [totalStudent, setTotalStudent] = useState();
    const [processedStudent, setProcessedStudent] = useState(0);
    const [error, setError] = useState();
    const [data, setData] = useState();
    const startDate = useMemo(() => new Date(), []);

    const next = () => {
        setStepNumber((stepNumber) => stepNumber + 1);
    };
    const onError = (error) => {
        setError(error.message);
    };
    const incrementProcessedStudent = () => {
        setProcessedStudent((processedStudent) => processedStudent + 1);
    };

    const onScrape = () => {
        setIsStarted(true);
        scraper
            .scrape({
                orgId,
                evalObjectId: assignmentId,
                rubricId,
                container: { next, setTotalStudent, onError, incrementProcessedStudent },
            })
            .then((data) => {
                setData(data);
            });
    };

    if (!isStarted)
        return (
            <Button rightIcon={<FaPersonDigging />} onClick={onScrape}>
                Scrape
            </Button>
        );

    return (
        <Stack spacing={5}>
            <ScraperStepsList stepNumber={stepNumber} error={error} />
            <Divider />
            <ScraperProgress processedStudent={processedStudent} totalStudent={totalStudent} startDate={startDate} />
            <Divider />
            {data && <ScraperChart data={data} />}
        </Stack>
    );
}

export default function SingleScraper({ scraper: { orgUnit, assignment, rubric } }) {
    return (
        <Card width="100%">
            <CardHeader>
                <Heading size="xs" textTransform="uppercase">
                    [{orgUnit.name}] {assignment.name} - {rubric.name}
                </Heading>
            </CardHeader>
            <CardBody>
                <ScraperSteps orgId={orgUnit.id} assignmentId={assignment.id} rubricId={rubric.id} />
            </CardBody>
        </Card>
    );
}
