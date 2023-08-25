/* eslint-disable jsx-a11y/label-has-associated-control */
import { useContext, useEffect, useState } from 'react';
import { Button, Select, Stack } from '@chakra-ui/react';
import { MdOutlineAddCircle } from 'react-icons/md';
import ScraperContext from './ScraperContext';

export default function AssignmentPicker({ orgUnit: { Id: orgUnitId, Name: moduleName, Code: orgUnitCode } }) {
    const { brightspaceApi, addScraper } = useContext(ScraperContext);
    const [assignmentList, setAssignmentList] = useState();
    const [selectedAssignment, setSelectedAssignment] = useState();
    const [selectedRubric, setSelectedRubric] = useState();

    useEffect(() => {
        let skip = false;
        brightspaceApi.getAssessmentList(orgUnitId).then((assignmentList) => {
            if (skip) return;
            setAssignmentList(assignmentList);
        });
        return () => {
            skip = true;
        };
    }, [orgUnitId]);

    const onAddAssignment = () => {
        const assignment = assignmentList[selectedAssignment];
        const rubric = assignment.Assessment.Rubrics[selectedRubric];
        addScraper({
            orgUnit: { id: orgUnitId, name: moduleName, code: orgUnitCode },
            assignment: {
                id: assignment.Id,
                name: assignment.Name,
            },
            rubric: {
                id: rubric.RubricId,
                name: rubric.Name,
            },
        });
    };

    return (
        <Stack spacing={3} padding={5}>
            {assignmentList ? (
                <>
                    <Select
                        variant="filled"
                        size="sm"
                        defaultValue={-1}
                        onChange={(e) => {
                            setSelectedAssignment(e.target.value);
                            setSelectedRubric(0);
                        }}
                    >
                        <option value={-1} disabled>
                            Assignment
                        </option>
                        {assignmentList.map(({ Id, Name }, index) => (
                            <option key={Id} value={index}>
                                {Name}
                            </option>
                        ))}
                    </Select>
                    <Select
                        variant="filled"
                        size="sm"
                        defaultValue={-1}
                        onChange={(e) => setSelectedRubric(e.target.value)}
                    >
                        <option value={-1} disabled>
                            Rubric
                        </option>
                        {assignmentList[selectedAssignment]?.Assessment.Rubrics.map(({ RubricId, Name }, index) => (
                            <option key={RubricId} value={index} selected={index === selectedRubric}>
                                {Name}
                            </option>
                        ))}
                    </Select>
                    <Button
                        colorScheme="teal"
                        leftIcon={<MdOutlineAddCircle />}
                        type="button"
                        isDisabled={Number.isNaN(+selectedAssignment) || Number.isNaN(+selectedRubric)}
                        onClick={onAddAssignment}
                    >
                        Add Scraper
                    </Button>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </Stack>
    );
}
