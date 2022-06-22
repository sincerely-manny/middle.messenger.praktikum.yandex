/* eslint-disable func-names */
/* eslint-disable global-require */
// велосипед для импорта шаблонов в тестах

import * as fs from 'fs';

export const importTemplatesFS: any = {
    tmpl: (templateName: string) => {
        const buffer = fs.readFileSync(`./src/templates/${templateName}.tbt`);
        const fileContent = buffer.toString();
        return fileContent;
    },
};

export default { importTemplatesFS };
