import BrightspaceRubricScraper from './react/index';

const targetPlatforms = {
    'splms.polite.edu.sg': 'PET',
    'lms.polite.edu.sg': 'CET',
};

const brightspaceApiBases = {
    PET: 'https://b988e89b-eb2c-401a-999a-94b943da0008.rubrics.api.brightspace.com',
    CET: 'https://4493420a-e37c-4d7e-bc33-55d49da1a74d.rubrics.api.brightspace.com',
};

const targetPlatform = targetPlatforms[window.location.host] || 'PET';
const brightspaceBase = window.location.origin;
const brightspaceApiBase = brightspaceApiBases[targetPlatform];

window.addEventListener('DOMContentLoaded', () => {
    BrightspaceRubricScraper(brightspaceBase, brightspaceApiBase);
});