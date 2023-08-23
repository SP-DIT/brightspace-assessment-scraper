export interface Assignment {
    Id: number;
    Name: string;
    Assessment: Assessment;
}

export interface Assessment {
    Rubrics: Rubric[];
}

export interface Rubric {
    RubricId: number;
    Name: string;
}

export interface Module {
    OrgUnit: OrgUnit;
}

export interface OrgUnit {
    Id: number;
    Name: string;
    Code: string;
}

export interface Section {
    SectionId: string;
    Name: string;
    Enrollments: string[];
}

export interface Criteria {
    name: string;
    max: number;
    criteriaId: string;
}

export interface Criterias extends Array<Criteria> {}

export interface Student {
    Identifier: string;
    RoleId: number;
    OrgDefinedId: string;
    Username: string;
    FirstName: string;
    Section?: string;
}

export interface Scores {
    [key: string]: number;
    total: number;
}

export interface StudentScore {
    scores: Scores;
    student: Student;
}

export interface StudentRubricScore {
    id: number | string;
    score: number;
}

export interface BrightSpaceApi {
    getAssessmentList: (organizationId: any) => Promise<Assignment[]>;
    getClassList: (organizationId: any) => Promise<Student[]>;
    getSectionList: (organizationId: any, jwt: any) => Promise<Section[]>;
    getAccessToken: (orgId: any) => Promise<string>;
    getRubricCriteria: (organizationId: any, rubricId: any, jwt: any) => Promise<Criteria[]>;
    getStudentRubricScore: (
        orgId: any,
        evalObjectId: any,
        rubricId: any,
        studentId: any,
        jwt: any
    ) => Promise<StudentRubricScore[]>;
    getModuleEnrollmentList: () => Promise<Module[]>;
}
