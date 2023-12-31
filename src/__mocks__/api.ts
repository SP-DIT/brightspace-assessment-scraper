import { faker } from '@faker-js/faker';
import DEFAULTS from '../lib/defaults';

import {
    Assignment,
    Criteria,
    Section,
    Student,
    Module,
    StudentRubricScore,
} from '../lib/brightspace-assessment-scraper';

const fakeClassList: Student[] = Array(50)
    .fill(null)
    .map(() => ({
        Identifier: faker.string.numeric(6),
        RoleId: DEFAULTS.ROLES.STUDENT,
        OrgDefinedId: `SP_P${faker.string.numeric(7)}`,
        Username: faker.internet.email(),
        FirstName: faker.person.fullName(),
    }));

const fakeSections: Section[] = Array(5)
    .fill(null)
    .map((_, index) => ({
        SectionId: faker.string.numeric(6),
        Name: `DIT/FT/2B/0${index + 1}`,
        Enrollments: fakeClassList.slice(index * 10, index * 10 + 10).map(({ Identifier }) => Identifier),
    }));

const fakeCriteria: Criteria[] = Array(10)
    .fill(null)
    .map(() => ({
        name: faker.commerce.productName(),
        max: 10,
        criteriaId: faker.string.numeric({
            length: {
                min: 5,
                max: 6,
            },
        }),
    }));

const fakeAssessmentList: Assignment[] = Array(3)
    .fill(null)
    .map((_, index) => ({
        Id: +faker.string.numeric(6),
        Name: `CA${index + 1} - 30%`,
        Assessment: {
            Rubrics: [
                {
                    RubricId: +faker.string.numeric(5),
                    Name: faker.commerce.productName(),
                },
            ],
        },
    }));

const fakeSemesterList: string[] = Array(5)
    .fill(null)
    .map(() => faker.string.numeric(4));

const fakeModuleList: Module[] = Array(50)
    .fill(null)
    .map(() => {
        const moduleCode = faker.string.alphanumeric({ length: 6 });
        return {
            OrgUnit: {
                Id: +faker.string.numeric(6),
                Name: `${moduleCode} : ${faker.lorem.words(2)}`,
                Code: `${moduleCode}-${fakeSemesterList[faker.number.int(4)]}`,
            },
        };
    });

export default function BrightspaceApi(brightspaceBase, brightspaceApiBase) {
    async function getClassList(organizationId): Promise<Student[]> {
        return fakeClassList;
    }

    async function getSectionList(organizationId, jwt): Promise<Section[]> {
        return fakeSections;
    }

    async function getAccessToken(orgId): Promise<string> {
        return faker.string.alphanumeric(50);
    }

    async function getRubricCriteria(organizationId, rubricId, jwt): Promise<Criteria[]> {
        return fakeCriteria;
    }

    async function getStudentRubricScore(orgId, evalObjectId, rubricId, studentId, jwt): Promise<StudentRubricScore[]> {
        await new Promise((resolve) => setTimeout(resolve, faker.number.int({ min: 100, max: 100 })));
        return fakeCriteria.map(({ criteriaId }) => ({
            id: +criteriaId,
            score: faker.number.int(10),
        }));
    }

    async function getAssessmentList(organizationId): Promise<Assignment[]> {
        return fakeAssessmentList;
    }

    async function getModuleEnrollmentList(): Promise<Module[]> {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(fakeModuleList), 0);
        });
    }

    return {
        getAssessmentList,
        getClassList,
        getSectionList,
        getAccessToken,
        getRubricCriteria,
        getStudentRubricScore,
        getModuleEnrollmentList,
    };
}
