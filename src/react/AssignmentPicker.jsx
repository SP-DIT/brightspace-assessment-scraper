/* eslint-disable jsx-a11y/label-has-associated-control */
import { useContext, useEffect, useState } from 'react';
import ScraperContext from './ScraperContext';

export default function AssignmentPicker({ id: orgUnitId }) {
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

    return (
        <div>
            {assignmentList ? (
                <>
                    <p>
                        <label>
                            Assignment
                            <select
                                defaultValue={-1}
                                onChange={(e) => {
                                    setSelectedAssignment(e.target.value);
                                    setSelectedRubric(0);
                                }}
                            >
                                <option value={-1} disabled>
                                    Select Assignment
                                </option>
                                {assignmentList.map(({ Id, Name }, index) => (
                                    <option key={Id} value={index}>
                                        {Name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </p>
                    <p>
                        <label>
                            Rubric
                            <select onChange={(e) => setSelectedRubric(e.target.value)}>
                                <option disabled>Select Rubrics</option>
                                {assignmentList[selectedAssignment]?.Assessment.Rubrics.map(
                                    ({ RubricId, Name }, index) => (
                                        <option key={RubricId} value={index} selected={index === selectedRubric}>
                                            {Name}
                                        </option>
                                    ),
                                )}
                            </select>
                        </label>
                    </p>
                    <p>
                        <button
                            type="button"
                            disabled={Number.isNaN(+selectedAssignment) || Number.isNaN(+selectedRubric)}
                            onClick={() =>
                                addScraper(
                                    orgUnitId,
                                    assignmentList[selectedAssignment].Id,
                                    assignmentList[selectedAssignment].Assessment.Rubrics[selectedRubric].RubricId,
                                )
                            }
                        >
                            Add Scraper
                        </button>
                    </p>
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}
