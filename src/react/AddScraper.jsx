import { Box, Card, CardBody, CardHeader, Heading } from '@chakra-ui/react';
import ModulePicker from './ModulePicker';
import AssignmentPicker from './AssignmentPicker';

function ExpandedComponent({ data }) {
    return <AssignmentPicker orgUnit={data.OrgUnit} />;
}

export default function AddScraper() {
    return (
        <Box>
            <Card>
                <CardHeader>
                    <Heading>Add Scraper</Heading>
                </CardHeader>
                <CardBody>
                    <ModulePicker ExpandedComponent={ExpandedComponent} />
                </CardBody>
            </Card>
        </Box>
    );
}
