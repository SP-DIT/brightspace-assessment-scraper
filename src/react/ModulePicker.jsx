import { useContext, useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import ScraperContext from './ScraperContext';
import AssignmentPicker from './AssignmentPicker';

function ExpandedComponent({ data }) {
    return <AssignmentPicker id={data.OrgUnit.Id} />;
}

export default function ModulePicker() {
    const { brightspaceApi } = useContext(ScraperContext);
    const [enrollments, setEnrollments] = useState();

    useEffect(() => {
        let skip = false;
        brightspaceApi.getModuleEnrollmentList().then((enrollments) => {
            if (skip) return;
            setEnrollments(enrollments);
        });
        return () => {
            skip = true;
        };
    }, []);
    return (
        <div>
            <DataTable
                columns={[
                    {
                        name: 'Semester',
                        selector: ({ OrgUnit: { Code } }) => Code.split('-').slice(-1)[0],
                        sortable: true,
                    },
                    {
                        name: 'Name',
                        selector: ({ OrgUnit: { Name } }) => Name,
                        sortable: true,
                    },
                ]}
                data={enrollments}
                pagination
                expandableRows
                expandableRowsComponent={ExpandedComponent}
            />
        </div>
    );
}
