import { Card, CardBody } from '@chakra-ui/react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useMemo } from 'react';
import DEFAULTS from '../../defaults';
import { calculateGrade } from '../../data-formatter';

const processData = (data) => {
    const count = {};
    const sections = new Set();
    data.forEach(({ student: { Section: section }, total }) => {
        const grades = calculateGrade(total || 0);
        if (!count[grades]) count[grades] = {};
        count[grades][section] = (count[grades][section] || 0) + 1;
        sections.add(section);
    });
    const output = DEFAULTS.GRADES.map((grade) => {
        const data = { grade };
        sections.forEach((section) => {
            data[section] = count?.[grade]?.[section] || 0;
        });
        return data;
    });
    return { sections: [...sections], output };
};

export default function GradesDistribution({ data }) {
    const { sections: stacks, output: chartData } = useMemo(() => processData(data), [data]);
    
    return (
        <Card>
            <CardBody>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grade" />
                    <YAxis />
                    {stacks.sort().map((stack) => (
                        <Bar key={stack} dataKey={stack} stackId="a" />
                    ))}
                </BarChart>
            </CardBody>
        </Card>
    );
}
