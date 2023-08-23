import { useState } from 'react';
import { Box, Card, CardBody, CardHeader, Collapse, Heading } from '@chakra-ui/react';
import ModulePicker from './ModulePicker';
import AssignmentPicker from './AssignmentPicker';

function ExpandedComponent({ data }) {
    return <AssignmentPicker orgUnit={data.OrgUnit} />;
}

export default function AddScraper() {
    const [show, setShow] = useState(true);
    return (
        <Box>
            <Card>
                <CardHeader>
                    <Heading onClick={() => setShow(!show)}>Add Scraper</Heading>
                </CardHeader>
                <Collapse in={show}>
                    <CardBody>
                        <ModulePicker ExpandedComponent={ExpandedComponent} />
                    </CardBody>
                </Collapse>
            </Card>
        </Box>
    );
}
