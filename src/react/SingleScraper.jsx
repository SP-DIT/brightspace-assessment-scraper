import { Card, CardBody } from '@chakra-ui/react';

export default function SingleScraper({ scraper: { orgUnit, assignment, rubric } }) {
    return (
        <Card>
            <CardBody>
                <p>{orgUnit.id}</p>
                <p>{assignment.id}</p>
                <p>{rubric.id}</p>
            </CardBody>
        </Card>
    );
}
