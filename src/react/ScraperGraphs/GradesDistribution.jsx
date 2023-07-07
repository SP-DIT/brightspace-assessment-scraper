import { Card, CardBody, theme } from '@chakra-ui/react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useMemo } from 'react';
import DEFAULTS from '../../lib/defaults';
import { calculateGrade } from '../../lib/data-formatter';

const colors = ['red', 'orange', 'green', 'teal', 'blue', 'cyan', 'purple', 'pink'].map(
    (color) => theme.colors[color][200]
);

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
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="grade" />
                        <YAxis />
                        <Legend
                            wrapperStyle={{ fontSize: '10px', textAlign: 'center' }}
                            verticalAlign="bottom"
                            height={50}
                        />
                        <Tooltip />

                        {stacks.sort().map((stack, index) => (
                            <Bar key={stack} dataKey={stack} stackId="a" fill={colors[index]} />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </CardBody>
        </Card>
    );
}
