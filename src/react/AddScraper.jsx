import { Box, Card, CardBody } from '@chakra-ui/react';
import ModulePicker from './ModulePicker';
import AssignmentPicker from './AssignmentPicker';

function ExpandedComponent({ data }) {
    return <AssignmentPicker orgUnit={data.OrgUnit} />;
}

export default function AddScraper() {
    return (
        <Box>
            <Card width="50%">
                <CardBody>
                    <ModulePicker ExpandedComponent={ExpandedComponent} />
                </CardBody>
            </Card>
        </Box>
    );
}
