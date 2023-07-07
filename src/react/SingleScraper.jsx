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
    IconButton,
    Flex,
    VStack,
    Collapse,
    HStack,
} from '@chakra-ui/react';
import { useMemo, useState, useContext } from 'react';
import { FaPersonDigging } from 'react-icons/fa6';
import { TbCircleDotted } from 'react-icons/tb';
import { MdCheckCircle } from 'react-icons/md';
import { BiShowAlt, BiHide } from 'react-icons/bi';
import { BsTrash } from 'react-icons/bs';
import ScraperContext from './ScraperContext';
import GradesDistribution from './ScraperGraphs/GradesDistribution';
import { generateCheckingVerifyingCsv, generateSasCsv } from '../lib/data-formatter';

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

function ScraperDownload({ data, titleSuffix, startDate }) {
    const generateDate = startDate.toLocaleString().replace(', ', 'T');
    return (
        <VStack width={300}>
            <Button
                width="100%"
                isDisabled={!data}
                onClick={() => generateSasCsv(data.criteria, data.studentResult, titleSuffix, generateDate)}
            >
                Download SAS Upload
            </Button>
            <Button
                width="100%"
                isDisabled={!data}
                onClick={() =>
                    generateCheckingVerifyingCsv(data.criteria, data.studentResult, titleSuffix, generateDate)
                }
            >
                Download Checker/Verifier
            </Button>
        </VStack>
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

function ScraperSteps({ orgUnit, assignment, rubric }) {
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
                orgId: orgUnit.id,
                evalObjectId: assignment.id,
                rubricId: rubric.id,
                container: { next, setTotalStudent, onError, incrementProcessedStudent },
            })
            .then((data) => {
                setData(data);
            });
    };

    if (!isStarted)
        return (
            <Button rightIcon={<FaPersonDigging />} onClick={onScrape} colorScheme="teal">
                Scrape
            </Button>
        );

    return (
        <Stack spacing={5}>
            <ScraperStepsList stepNumber={stepNumber} error={error} />
            <Divider />
            <Flex>
                <ScraperProgress
                    processedStudent={processedStudent}
                    totalStudent={totalStudent}
                    startDate={startDate}
                />
                <ScraperDownload
                    data={data}
                    titleSuffix={`${orgUnit.name}-${assignment.name}-${rubric.name}`}
                    startDate={startDate}
                />
            </Flex>
            <Divider />
            {data && <ScraperChart data={data} />}
        </Stack>
    );
}

export default function SingleScraper({ scraper: { orgUnit, assignment, rubric }, index }) {
    const { removeScraper } = useContext(ScraperContext);
    const [show, setShow] = useState(true);

    const handleToggle = () => setShow(!show);

    return (
        <Card width="100%">
            <CardHeader>
                <HStack spacing={2}>
                    <Heading size="xs" textTransform="uppercase" onClick={handleToggle}>
                        [{orgUnit.name}] {assignment.name} - {rubric.name}
                    </Heading>
                    <IconButton icon={show ? <BiHide /> : <BiShowAlt />} onClick={handleToggle} />
                    <IconButton
                        icon={<BsTrash />}
                        onClick={() => removeScraper(index)}
                        bgColor="salmon"
                        color="white"
                    />
                </HStack>
            </CardHeader>
            <Collapse in={show}>
                <CardBody>
                    <ScraperSteps orgUnit={orgUnit} assignment={assignment} rubric={rubric} />
                </CardBody>
            </Collapse>
        </Card>
    );
}