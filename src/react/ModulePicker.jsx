import { useContext, useEffect, useState } from 'react';
import ScraperContext from './ScraperContext';
import FilteredDataTable from './FilteredDataTable';

export default function ModulePicker({ ExpandedComponent }) {
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
            <FilteredDataTable
                columns={[
                    {
                        name: 'Semester',
                        selector: ({ OrgUnit: { Code } }) => Code.split('-').slice(-1)[0],
                        sortable: true,
                        width: '100px',
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
