/* eslint-disable react/jsx-props-no-spreading */
import { HStack, IconButton, Input } from '@chakra-ui/react';
import { IoMdCloseCircle } from 'react-icons/io';
import { useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';

function FilterComponent({ onFilter, onClear, filterText }) {
    return (
        <HStack spacing={3}>
            <Input placeholder="Enter filter" onChange={onFilter} value={filterText} />
            <IconButton icon={<IoMdCloseCircle />} type="button" bgColor="salmon" color="white" onClick={onClear} />
        </HStack>
    );
}

export default function FilteredDataTable({ children, data = [], ...options }) {
    const [filterText, setFilterText] = useState('');
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
    const filteredItems = data.filter(
        ({ OrgUnit: { Name: name } }) => name && name.toLowerCase().includes(filterText.toLowerCase()),
    );

    const subHeaderComponentMemo = useMemo(() => {
        const handleClear = () => {
            if (filterText) {
                setResetPaginationToggle(!resetPaginationToggle);
                setFilterText('');
            }
        };

        return (
            <FilterComponent
                onFilter={(e) => setFilterText(e.target.value)}
                onClear={handleClear}
                filterText={filterText}
            />
        );
    }, [filterText, resetPaginationToggle]);

    return (
        <DataTable
            {...options}
            data={filteredItems}
            pagination
            paginationResetDefaultPage={resetPaginationToggle} // optionally, a hook to reset pagination to page 1
            subHeader
            subHeaderComponent={subHeaderComponentMemo}
            persistTableHead
        />
    );
}
